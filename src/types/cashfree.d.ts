interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | 'popup';
}

interface CashfreeInstance {
  checkout(options: CashfreeCheckoutOptions): void;
}

interface CashfreeConstructor {
  (options: { mode: 'sandbox' | 'production' }): CashfreeInstance;
}

interface Window {
  Cashfree?: CashfreeConstructor;
}
