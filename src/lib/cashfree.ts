import { getSiteUrl } from '@/lib/site-url';

export type CashfreeMode = 'sandbox' | 'production';

export interface CashfreeConfig {
  appId: string;
  secretKey: string;
  apiVersion: string;
  baseUrl: string;
  mode: CashfreeMode;
  isConfigured: boolean;
}

export interface CreateCashfreeOrderInput {
  orderId: string;
  orderAmount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
  orderNote?: string;
}

export interface CreateCashfreeOrderResult {
  paymentSessionId: string;
  cfOrderId?: string;
}

function isPlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return value.startsWith('placeholder_') || value.includes('your_');
}

export function getCashfreeConfig(): CashfreeConfig {
  const appId = process.env.CASHFREE_APP_ID || '';
  const secretKey = process.env.CASHFREE_SECRET_KEY || '';
  const envRaw = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  const isProduction = envRaw === 'production' || envRaw === 'prod';

  return {
    appId,
    secretKey,
    apiVersion: '2023-08-01',
    baseUrl: isProduction ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg',
    mode: isProduction ? 'production' : 'sandbox',
    isConfigured: !isPlaceholder(appId) && !isPlaceholder(secretKey),
  };
}

export function getCashfreePublicMode(): CashfreeMode {
  const publicEnv = (process.env.NEXT_PUBLIC_CASHFREE_ENV || process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
  return publicEnv === 'production' || publicEnv === 'prod' ? 'production' : 'sandbox';
}

/** Create a Cashfree PG order — server-side only (Cashfree docs requirement). */
export async function createCashfreeOrder(
  input: CreateCashfreeOrderInput,
  request?: Request
): Promise<CreateCashfreeOrderResult> {
  const config = getCashfreeConfig();

  if (!config.isConfigured) {
    throw new Error('Cashfree is not configured. Add CASHFREE_APP_ID and CASHFREE_SECRET_KEY.');
  }

  const siteUrl = getSiteUrl(request);
  const phone = input.customerPhone.replace(/\D/g, '').slice(-10);
  if (phone.length < 10) {
    throw new Error('A valid 10-digit Indian mobile number is required.');
  }

  const payload = {
    order_id: input.orderId,
    order_amount: Number(input.orderAmount.toFixed(2)),
    order_currency: 'INR',
    customer_details: {
      customer_id: input.customerId.slice(0, 50),
      customer_email: input.customerEmail,
      customer_phone: phone,
      customer_name: input.customerName,
    },
    order_meta: {
      return_url:
        input.returnUrl ||
        `${siteUrl}/payment/success?order_id={order_id}`,
      notify_url: input.notifyUrl || `${siteUrl}/api/webhook/cashfree`,
    },
    order_note: input.orderNote || 'Event registration',
  };

  const response = await fetch(`${config.baseUrl}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
      'x-api-version': config.apiVersion,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error?.message ||
      (typeof data === 'string' ? data : 'Cashfree order creation failed');
    console.error('Cashfree create order error:', data);
    throw new Error(message);
  }

  if (!data.payment_session_id) {
    console.error('Cashfree response missing payment_session_id:', data);
    throw new Error('Payment session was not created. Please try again.');
  }

  return {
    paymentSessionId: data.payment_session_id,
    cfOrderId: data.cf_order_id,
  };
}
