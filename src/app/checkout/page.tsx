'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { ShieldCheck, Flame, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    if (!sessionId || !orderId) {
      setError('Invalid checkout session parameters.');
      setLoading(false);
      return;
    }

    if (sessionId.startsWith('mock_session_')) {
      setIsMock(true);
      setLoading(false);
    }
  }, [sessionId, orderId]);

  const handleSdkLoad = () => {
    setSdkLoaded(true);
    if (!isMock && sessionId) {
      triggerCashfreeCheckout();
    }
  };

  const triggerCashfreeCheckout = () => {
    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.Cashfree) {
        // @ts-ignore
        const cashfree = window.Cashfree({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
        });

        cashfree.checkout({
          paymentSessionId: sessionId,
          redirectTarget: '_self',
        });
      } else {
        setError('Cashfree SDK failed to initialize.');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Cashfree SDK error:', err);
      setError(err.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  // Simulate mock payment callback
  const handleSimulatePayment = async (status: 'SUCCESS' | 'FAILED') => {
    setLoading(true);
    try {
      if (status === 'SUCCESS') {
        // Trigger simulated success webhook call (or direct redirect in mock setup)
        // Since we are mocking, we can call our local webhook or API to confirm
        const response = await fetch('/api/webhook/cashfree', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              order: {
                order_id: orderId,
                order_amount: 1000, // Dummy
              },
              payment: {
                payment_status: 'SUCCESS',
                cf_payment_id: `MOCK_PAY_${Date.now()}`,
              },
            },
            type: 'PAYMENT_SUCCESS_WEBHOOK',
          }),
        });

        if (response.ok) {
          router.push(`/payment/success?order_id=${orderId}&status=success`);
        } else {
          const text = await response.text();
          console.error('Mock webhook failed:', text);
          // Standard redirect as fallback
          router.push(`/payment/success?order_id=${orderId}&status=success`);
        }
      } else {
        router.push(`/payment/success?order_id=${orderId}&status=failed`);
      }
    } catch (err) {
      console.error(err);
      // Fallback redirect
      router.push(`/payment/success?order_id=${orderId}&status=success`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between pt-24 font-inter relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Load SDK */}
      {!isMock && (
        <Script
          src="https://sdk.cashfree.com/js/v3/cashfree.js"
          onLoad={handleSdkLoad}
          onError={() => {
            setError('Failed to load payment gateway script.');
            setLoading(false);
          }}
        />
      )}

      <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center relative z-10">
        <div className="max-w-md w-full bg-dark-gray/30 border border-white/5 backdrop-blur-md rounded-lg p-8 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Top gold bar */}
          <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg animate-pulse" />

          {loading && !error && (
            <div className="text-center py-12 space-y-6 flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
              <div className="space-y-2">
                <h2 className="font-bebas text-3xl tracking-wider text-white uppercase">Securing Connection</h2>
                <p className="text-gray-400 font-barlow text-sm uppercase tracking-widest">
                  Redirecting to payment gateway...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 space-y-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-bebas text-3xl tracking-wider text-white uppercase">Checkout Error</h2>
                <p className="text-red-400 text-sm font-semibold">{error}</p>
              </div>
              <button
                onClick={() => router.back()}
                className="w-full font-barlow font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white py-3 rounded transition-all duration-300"
              >
                Go Back
              </button>
            </div>
          )}

          {!loading && !error && isMock && (
            <div className="space-y-8 py-4">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-gold-premium/10 border border-gold-premium/30 flex items-center justify-center text-gold-premium">
                  <Flame className="w-8 h-8 animate-pulse" />
                </div>
                <h2 className="font-bebas text-4xl tracking-wider text-white uppercase">Sandbox Payment Gateway</h2>
                <p className="text-gray-400 text-xs font-barlow uppercase tracking-widest">
                  Cashfree keys not configured — Simulating checkout
                </p>
              </div>

              {/* Order Info */}
              <div className="bg-black/40 border border-white/5 rounded p-4 space-y-2 text-sm font-inter">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID:</span>
                  <span className="font-semibold text-white">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Environment:</span>
                  <span className="font-semibold text-yellow-500">Local Sandbox</span>
                </div>
              </div>

              {/* Simulated Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSimulatePayment('SUCCESS')}
                  className="w-full gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider py-3.5 rounded hover:scale-102 active:scale-98 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,208,96,0.4)] flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5 text-black" />
                  <span>Simulate Payment Success</span>
                </button>

                <button
                  onClick={() => handleSimulatePayment('FAILED')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-barlow text-base font-black uppercase tracking-wider py-3.5 rounded transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Simulate Payment Failure</span>
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
      <Suspense fallback={
        <div className="min-h-screen bg-black text-white flex flex-col justify-between pt-24 font-inter">
          <div className="container mx-auto px-4 py-16 flex-grow flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
          </div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}
