'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { 
  CheckCircle2, 
  XCircle, 
  Ticket, 
  Printer, 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck,
  ChevronRight,
  Flame,
  Loader2,
  Clock,
  ShieldAlert
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const registrationIdParam = searchParams.get('registration_id');

  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState<'confirmed' | 'pending' | 'rejected'>('pending');
  const [registration, setRegistration] = useState<any>(null);
  const [eventData, setEventData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!orderId && !registrationIdParam) {
      setError('Missing registration or order identifier.');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        let finalReg: any = null;

        // 1. If registration_id is provided directly in URL, fetch it
        if (registrationIdParam) {
          const { data: reg, error: regError } = await supabase
            .from('registrations')
            .select('*, event_id(*)')
            .eq('id', registrationIdParam)
            .maybeSingle();
          if (reg) finalReg = reg;
        }

        // 2. Fallback to orderId query
        if (!finalReg && orderId) {
          // Fetch payment record first
          const { data: payment } = await supabase
            .from('payments')
            .select('*')
            .eq('cashfree_order_id', orderId)
            .maybeSingle();

          if (payment) {
            const { data: correlatedReg } = await supabase
              .from('registrations')
              .select('*, event_id(*)')
              .eq('id', payment.registration_id)
              .maybeSingle();
            if (correlatedReg) finalReg = correlatedReg;
          }

          // Direct registration correlation fallback
          if (!finalReg) {
            const { data: regByCode } = await supabase
              .from('registrations')
              .select('*, event_id(*)')
              .eq('registration_code', orderId.replace('TBH-', 'REG-'))
              .maybeSingle();
            if (regByCode) finalReg = regByCode;
          }
        }

        if (!finalReg) {
          setError('Unable to retrieve registration records. Please check your Dashboard.');
          setLoading(false);
          return;
        }

        setRegistration(finalReg);
        setEventData(finalReg.event_id);

        // Set status
        if (finalReg.status === 'confirmed' || finalReg.payment_status === 'paid') {
          setRegStatus('confirmed');
          // Fire Confetti!
          triggerConfetti();

          // Generate QR Code
          const qrData = JSON.stringify({
            code: finalReg.registration_code,
            name: finalReg.full_name,
            event: finalReg.event_id.title,
            status: 'CONFIRMED'
          });
          const qrUrl = await QRCode.toDataURL(qrData, {
            margin: 1,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
          setQrCodeUrl(qrUrl);
        } else if (finalReg.status === 'rejected' || finalReg.status === 'cancelled') {
          setRegStatus('rejected');
        } else {
          setRegStatus('pending');
        }
      } catch (err: any) {
        console.error('Error fetching success details:', err);
        setError('An unexpected error occurred while fetching details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, registrationIdParam]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D4AF37', '#F5D060', '#FFFFFF', '#111111']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D4AF37', '#F5D060', '#FFFFFF', '#111111']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
        <h2 className="font-bebas text-2xl tracking-widest text-white uppercase animate-pulse">Loading Pass Details</h2>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-[70vh] max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
          <XCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bebas text-4xl text-white tracking-wider uppercase">Verification Failed</h2>
          <p className="text-gray-400 text-sm font-semibold">{error || 'Something went wrong.'}</p>
        </div>
        <div className="w-full pt-4">
          <Link
            href="/events"
            className="block w-full gold-gradient-bg text-black font-barlow font-black uppercase tracking-wider py-3 rounded text-center"
          >
            Browse Other Events
          </Link>
        </div>
      </div>
    );
  }

  if (regStatus === 'rejected') {
    return (
      <div className="min-h-[70vh] max-w-md mx-auto px-4 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
          <XCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="font-bebas text-4xl text-white tracking-wider uppercase">Registration Rejected</h2>
          <p className="text-gray-400 text-sm font-inter leading-relaxed">
            Your registration proof for <strong>{eventData?.title}</strong> was rejected. Aapna refund kuch hi samay me aapko bhej diya jaega.
          </p>
        </div>
        <div className="w-full pt-4 space-y-3">
          <Link
            href={`/events/${eventData?.slug}`}
            className="block w-full gold-gradient-bg text-black font-barlow font-black uppercase tracking-wider py-3.5 rounded text-center"
          >
            Try Registering Again
          </Link>
          <Link
            href="/events"
            className="block w-full bg-white/5 hover:bg-white/10 text-white font-barlow font-bold uppercase tracking-wider py-3 rounded text-center transition-colors duration-300"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      {/* Dynamic Print Stylesheet to hide background and print only the ticket pass */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            border: 2px solid black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Success Badge Banner */}
      <div className="text-center space-y-4 no-print">
        {regStatus === 'confirmed' ? (
          <>
            <div className="inline-flex w-16 h-16 rounded-full bg-gold-premium/10 border border-gold-premium/30 items-center justify-center text-gold-premium mb-2 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-wider uppercase">
              Welcome to the Arena
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm font-barlow uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
              Your payment was verified successfully. You have locked in your spot for {eventData?.title}. Your virtual pass is ready below.
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/30 items-center justify-center text-gold-premium mb-2 animate-pulse">
              <Clock className="w-9 h-9" />
            </div>
            <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-wider uppercase">
              Verification in Progress
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm font-barlow uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
              Your registration proof was successfully submitted! Our team is currently verifying your payment. Once approved, your Virtual Pass will be activated, and a confirmation email will be sent.
            </p>
          </>
        )}
      </div>

      {/* VIRTUAL BOARDING PASS TICKET */}
      <div 
        id="printable-ticket" 
        className={`bg-[#0B0B0B] border rounded-xl overflow-hidden relative shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col md:flex-row transition-all duration-300 ${
          regStatus === 'confirmed' 
            ? 'border-gold-premium/30 hover:border-gold-premium/60' 
            : 'border-yellow-500/20 hover:border-yellow-500/40'
        }`}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

        {/* Left Side: Event & Runner Information */}
        <div className="flex-grow p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-dashed border-white/10 relative">
          
          {/* Top Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bebas text-xs uppercase tracking-widest text-gold-premium font-bold flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5 fill-gold-premium animate-pulse" />
                <span>The Beast Hunter Challenge Arena</span>
              </span>
              <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase leading-none">
                {eventData?.title}
              </h2>
            </div>
            <div className="bg-gold-premium/10 border border-gold-premium/30 px-3 py-1 rounded">
              <span className="font-bebas text-sm text-gold-premium font-black tracking-widest uppercase">
                {eventData?.difficulty}
              </span>
            </div>
          </div>

          {/* Spacer */}
          <div className="h-8 md:h-12" />

          {/* Primary Details Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Runner Name</span>
              <span className="font-barlow text-sm font-black uppercase text-white tracking-wide flex items-center space-x-1.5 mt-0.5">
                <User className="w-3.5 h-3.5 text-gold-premium" />
                <span>{registration?.full_name}</span>
              </span>
            </div>
            
            <div>
              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Event Date</span>
              <span className="font-barlow text-sm font-black uppercase text-white tracking-wide flex items-center space-x-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-gold-premium" />
                <span>{eventData?.event_date ? new Date(eventData.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</span>
              </span>
            </div>

            <div>
              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Venue Location</span>
              <span className="font-barlow text-sm font-black uppercase text-white tracking-wide flex items-center space-x-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gold-premium" />
                <span>{eventData?.venue || 'Venue TBA'}</span>
              </span>
            </div>

            <div>
              <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Bib & T-Shirt</span>
              <span className="font-barlow text-sm font-black uppercase text-white tracking-wide mt-0.5 block">
                Size: {registration?.tshirt_size} | {registration?.medical_conditions?.split(':')[1]?.trim() || 'O+'}
              </span>
            </div>
          </div>

          {/* Ticket Footer details */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-barlow uppercase tracking-widest">
            <span>Pass Code: {registration?.registration_code}</span>
            {regStatus === 'confirmed' ? (
              <span className="text-green-500 flex items-center space-x-1 font-bold">
                <ShieldCheck className="w-3 h-3 fill-green-500/20" />
                <span>Verified Paid Entry</span>
              </span>
            ) : (
              <span className="text-yellow-500 flex items-center space-x-1 font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin text-yellow-500 shrink-0" />
                <span>Awaiting Verification</span>
              </span>
            )}
          </div>

          {/* Left/Right circle tickets cutouts on divider (only visible on large screens) */}
          <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-black border border-white/10 -translate-y-1/2 hidden md:block" />
        </div>

        {/* Right Side: QR Code Section */}
        <div className="md:w-64 bg-dark-gray/30 p-8 flex flex-col items-center justify-center space-y-4 relative">
          {regStatus === 'confirmed' ? (
            <>
              <div className="bg-white p-3 rounded-lg shadow-lg relative">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="Registration QR Code" 
                    className="w-36 h-36 relative z-10"
                  />
                ) : (
                  <div className="w-36 h-36 flex items-center justify-center text-black">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-center space-y-1">
                <span className="font-bebas text-xl text-white tracking-widest block uppercase">Scannable Pass</span>
                <span className="font-barlow text-[10px] font-bold text-gray-500 tracking-wider block uppercase">Present at Venue Entry</span>
              </div>
            </>
          ) : (
            <>
              <div className="w-36 h-36 flex flex-col items-center justify-center border border-yellow-500/20 bg-yellow-500/5 rounded-lg text-yellow-500 p-4">
                <ShieldAlert className="w-10 h-10 mb-2 animate-bounce" />
                <span className="font-bebas text-[11px] uppercase tracking-widest text-center leading-tight">
                  Awaiting Verification
                </span>
              </div>
              <div className="text-center space-y-1">
                <span className="font-bebas text-xl text-white tracking-widest block uppercase">Locked Pass</span>
                <span className="font-barlow text-[9px] font-bold text-gray-500 tracking-wider block uppercase">Activates on approval</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Button Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 no-print">
        {regStatus === 'confirmed' && (
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-8 py-3.5 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,208,96,0.4)] flex items-center justify-center space-x-2"
          >
            <Printer className="w-4.5 h-4.5" />
            <span>Print / Save Pass</span>
          </button>
        )}

        <Link
          href="/profile"
          className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-barlow text-base font-bold uppercase tracking-wider px-8 py-3.5 rounded text-center transition-all duration-300 flex items-center justify-center space-x-1.5"
        >
          <span>View My Dashboard</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-24 font-inter relative overflow-hidden flex flex-col justify-between">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex-grow flex items-center">
          <Suspense fallback={
            <div className="container mx-auto px-4 py-16 flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
            </div>
          }>
            <SuccessContent />
          </Suspense>
        </div>
        <Footer />
      </div>
    </>
  );
}
