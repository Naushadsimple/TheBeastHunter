'use client';

import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { ShieldCheck, Flame, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
function getCheckoutMode(): 'sandbox' | 'production' {
  const env = (process.env.NEXT_PUBLIC_CASHFREE_ENV || 'sandbox').toLowerCase();
  return env === 'production' || env === 'prod' ? 'production' : 'sandbox';
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const isMockParam = searchParams.get('mock') === '1';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const checkoutStarted = useRef(false);

  const isMockSession =
    isMockParam || (sessionId?.startsWith('mock_session_') ?? false);

  const openCashfreeCheckout = useCallback(() => {
    if (!sessionId || checkoutStarted.current) return;
    checkoutStarted.current = true;

    if (!window.Cashfree) {
      setError('Cashfree checkout could not load. Refresh and try again.');
      setLoading(false);
      return;
    }

    try {
      const cashfree = window.Cashfree({
        mode: getCheckoutMode(),
      });

      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: '_self',
      });
    } catch (err) {
      console.error('Cashfree checkout error:', err);
      checkoutStarted.current = false;
      setError(err instanceof Error ? err.message : 'Could not open payment page');
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !orderId) {
      setError('Invalid payment session. Please register again.');
      setLoading(false);
      return;
    }

    if (isMockSession) {
      setIsMock(true);
      setLoading(false);
      return;
    }

    setIsMock(false);
  }, [sessionId, orderId, isMockSession]);

  const handleMockPayment = async (status: 'SUCCESS' | 'FAILED') => {
    if (!orderId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dev/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Mock payment failed');
      }

      router.push(
        `/payment/success?order_id=${encodeURIComponent(orderId)}&status=${
          status === 'SUCCESS' ? 'success' : 'failed'
        }`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment simulation failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-24 font-inter relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />

      {!isMock && sessionId && (
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          strategy="afterInteractive"
          onLoad={() => {
            setLoading(true);
            openCashfreeCheckout();
          }}
          onError={() => {
            setError('Failed to load Cashfree payment SDK.');
            setLoading(false);
          }}
        />
      )}

      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center relative z-10">
        <div className="max-w-md w-full bg-dark-gray/30 border border-white/5 backdrop-blur-md rounded-lg p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg animate-pulse" />

          {loading && !error && !isMock && (
            <div className="text-center py-12 space-y-6 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
              <div className="space-y-2">
                <h2 className="font-bebas text-3xl tracking-wider text-white uppercase">
                  Opening Cashfree
                </h2>
                <p className="text-gray-400 font-barlow text-sm uppercase tracking-widest">
                  Secure payment — UPI, cards, net banking
                </p>
                {orderId && (
                  <p className="text-xs text-gray-500 font-mono pt-2">{orderId}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  checkoutStarted.current = false;
                  openCashfreeCheckout();
                }}
                className="text-gold-premium text-xs font-barlow uppercase tracking-wider hover:underline"
              >
                Payment page didn&apos;t open? Tap here
              </button>
            </div>
          )}

          {error && (
            <div className="text-center py-8 space-y-6 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-red-400" />
              <h2 className="font-bebas text-3xl text-white uppercase">Payment error</h2>
              <p className="text-red-400 text-sm">{error}</p>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full font-barlow font-bold uppercase bg-white/10 hover:bg-white/20 py-3 rounded"
              >
                Go back
              </button>
            </div>
          )}

          {isMock && !error && (
            <div className="space-y-8 py-4">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-gold-premium/10 border border-gold-premium/30 flex items-center justify-center text-gold-premium">
                  <Flame className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="font-bebas text-3xl text-white uppercase">Sandbox checkout</h2>
                <p className="text-gray-400 text-xs font-barlow uppercase tracking-widest">
                  Add real Cashfree test keys in .env.local for live hosted checkout
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order</span>
                  <span className="font-mono text-white text-xs">{orderId}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleMockPayment('SUCCESS')}
                  disabled={loading}
                  className="w-full gold-gradient-bg text-black font-barlow font-black uppercase py-3.5 rounded flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Simulate successful payment
                </button>
                <button
                  type="button"
                  onClick={() => handleMockPayment('FAILED')}
                  disabled={loading}
                  className="w-full bg-red-600/80 hover:bg-red-600 text-white font-barlow font-black uppercase py-3.5 rounded disabled:opacity-50"
                >
                  Simulate failed payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center pt-24">
            <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}
