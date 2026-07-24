'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Flame,
  Dumbbell,
  Bike,
  Timer,
  Zap,
  Award,
  Loader2,
} from 'lucide-react';
import { DBEvent } from '@/components/sections/UpcomingRaces';

interface RegistrationFormProps {
  event: DBEvent;
  user?: {
    id: string;
    email: string;
    name?: string;
  } | null;
}

const TOTAL_STEPS = 4;

const AUDITION_OPTIONS = [
  {
    id: 'Running',
    name: 'Running Audition',
    description: '100 Slots • Top 20 Move to Final',
    icon: Flame,
    bg: 'from-orange-500/20 to-red-500/10',
    border: 'border-orange-500/40',
    badge: 'Endurance',
  },
  {
    id: 'Cycling',
    name: 'Cycling Audition',
    description: '100 Slots • Top 20 Move to Final',
    icon: Bike,
    bg: 'from-blue-500/20 to-cyan-500/10',
    border: 'border-blue-500/40',
    badge: 'Stamina',
  },
  {
    id: 'Weight Holding',
    name: 'Weight Holding Audition',
    description: '100 Slots • Top 20 Move to Final',
    icon: Dumbbell,
    bg: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/40',
    badge: 'Raw Power & Hold',
  },
  {
    id: 'Dumbbell Holding',
    name: 'Dumbbell Holding Audition',
    description: '100 Slots • Top 20 Move to Final',
    icon: Zap,
    bg: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/40',
    badge: 'Grip Strength',
  },
  {
    id: 'Plank',
    name: 'Plank Challenge Audition',
    description: '100 Slots • Top 20 Move to Final',
    icon: Timer,
    bg: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/40',
    badge: 'Core Strength',
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RegistrationForm({ event, user }: RegistrationFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    dob: '',
    gender: 'male',
    instaId: '',
    city: 'Mumbai',
    emergencyContactName: '',
    emergencyContactPhone: '',
    tshirtSize: 'M',
    bloodGroup: 'O+',
    auditionOption: 'Running',
    waiverAccepted: false,
    signature: '',
    tosAccepted: false,
  });

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!formData.fullName.trim()) return 'Full name is required';
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        return 'Valid email address is required';
      }
      if (formData.phone.replace(/\D/g, '').length < 10) {
        return 'Valid 10-digit phone number is required';
      }
      if (!formData.dob) return 'Date of birth is required';
      if (!formData.emergencyContactName.trim()) return 'Emergency contact name is required';
      if (formData.emergencyContactPhone.replace(/\D/g, '').length < 10) {
        return 'Valid emergency contact phone is required';
      }
    } else if (step === 2) {
      if (!formData.auditionOption) return 'Please select your audition activity';
      if (!formData.waiverAccepted) return 'You must accept the safety waiver';
      if (!formData.signature.trim()) return 'Type your full name to sign the waiver';
    } else if (step === 3) {
      if (!formData.tosAccepted) {
        return 'You must accept the Terms of Service and Privacy Policy';
      }
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleRazorpayPayment = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const functionsUrl =
        process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ||
        (supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : '');

      if (!functionsUrl) {
        throw new Error('Supabase Edge Functions URL is not configured. Please set NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL in your environment variables.');
      }

      // 1. Create Razorpay order via Supabase Edge Function
      const createRes = await fetch(`${functionsUrl}/razorpay-create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          auditionOption: formData.auditionOption,
          registrationData: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.replace(/\D/g, '').slice(-10),
            dob: formData.dob,
            age: 20,
            gender: formData.gender,
            instaId: formData.instaId.trim(),
            city: formData.city,
            emergencyContactName: formData.emergencyContactName.trim(),
            emergencyContactPhone: formData.emergencyContactPhone.replace(/\D/g, '').slice(-10),
            tshirtSize: formData.tshirtSize,
            bloodGroup: formData.bloodGroup,
            waiverAccepted: formData.waiverAccepted,
            tosAccepted: formData.tosAccepted,
          },
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok || !orderData.razorpayOrderId) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      // Check if Razorpay script is available
      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }

      const razorpayKey = orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Razorpay Key ID is missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in your environment variables.');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'The Beast Hunter Challenge',
        description: `${event.title} - ${formData.auditionOption} Audition`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#d4af37',
        },
        handler: async function (response: any) {
          try {
            setSubmitLoading(true);
            // 2. Verify Payment Signature via Supabase Edge Function
            const verifyRes = await fetch(`${functionsUrl}/razorpay-verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                registration_id: orderData.registrationId,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            // 3. Dispatch pass confirmation email via Nodemailer API
            try {
              await fetch('/api/send-pass-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationId: orderData.registrationId }),
              });
            } catch (mailErr) {
              console.error('Failed to trigger pass email delivery:', mailErr);
            }

            // Success redirect
            router.push(`/payment/success?registration_id=${orderData.registrationId}`);
          } catch (err: any) {
            console.error('Razorpay verification error:', err);
            setError(`Payment Failed: ${err.message || 'Verification could not be completed.'}. Please contact support if money was debited.`);
            setSubmitLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setSubmitLoading(false);
            setError('Payment Cancelled: You closed the payment window before completing the transaction. Please click "Pay via Razorpay" to retry.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        console.error('Razorpay SDK payment.failed:', resp);
        const reason = resp.error?.description || resp.error?.reason || 'Transaction failed or was declined by bank.';
        setError(`Payment Failed: ${reason}. Your account was not charged. Please try again or use another payment method.`);
        setSubmitLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      console.error('Razorpay checkout error:', err);
      setError(err.message || 'Something went wrong during checkout');
      setSubmitLoading(false);
    }
  };

  return (
    <div className="bg-dark-gray border border-white/10 rounded-lg p-6 sm:p-10 shadow-2xl relative overflow-hidden">
      {/* Background Gold Blur */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-gold-premium/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Progress Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative z-10 max-w-xl mx-auto">
          {[
            { num: 1, label: 'Runner Details' },
            { num: 2, label: 'Audition & Waiver' },
            { num: 3, label: 'Confirm Slot' },
            { num: 4, label: 'Razorpay Payment' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bebas text-lg tracking-wider border-2 transition-all duration-300 ${
                  step > s.num
                    ? 'bg-gold-premium text-black border-gold-premium'
                    : step === s.num
                    ? 'bg-black text-gold-premium border-gold-premium shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-black/60 text-gray-500 border-white/10'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : s.num}
              </div>
              <span
                className={`text-[10px] sm:text-xs uppercase font-barlow font-bold tracking-widest mt-2 hidden sm:block ${
                  step >= s.num ? 'text-gold-premium' : 'text-gray-500'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {/* Progress Bar Line */}
        <div className="w-full bg-black/60 h-1 mt-6 rounded-full overflow-hidden max-w-xl mx-auto">
          <div
            className="gold-gradient-bg h-full transition-all duration-500"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* STRICT RULE NOTICE: ONE PERSON, ONE AUDITION */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/15 via-gold-premium/10 to-amber-500/15 border border-gold-premium/40 rounded-xl flex items-start space-x-3 text-gold-glow text-xs font-barlow leading-relaxed shadow-[0_0_15px_rgba(212,175,55,0.15)]">
        <ShieldAlert className="w-5 h-5 text-gold-premium shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-gold-premium block mb-0.5">
            Strict Rule: One Person, One Audition Policy
          </span>
          <span>
            Each contestant is strictly allowed to register and participate in only <strong>1 Audition Discipline</strong>. Registering for multiple audition options is strictly prohibited. If a participant enters multiple auditions, only their first verified entry will be valid, and all other entries will be disqualified without refund.
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3 text-red-400 text-sm font-barlow">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: RUNNER DETAILS */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-6 h-6 text-gold-premium" />
              Step 1: Personal Details & Emergency Contact
            </h3>
            <p className="text-gray-400 text-xs font-barlow uppercase tracking-widest mt-1">
              Provide accurate information for official bib generation and emergency safety
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Full Name <span className="text-gold-premium">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Email Address <span className="text-gold-premium">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Phone Number (WhatsApp) <span className="text-gold-premium">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Date of Birth <span className="text-gold-premium">*</span>
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Gender <span className="text-gold-premium">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                City / Location
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Emergency Contact Person <span className="text-gold-premium">*</span>
              </label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Relative / Guardian Name"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Emergency Contact Phone <span className="text-gold-premium">*</span>
              </label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="Emergency Phone Number"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                T-Shirt Size
              </label>
              <select
                name="tshirtSize"
                value={formData.tshirtSize}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
              >
                <option value="XS">XS (Extra Small)</option>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
                <option value="XL">XL (Extra Large)</option>
                <option value="XXL">XXL (Double XL)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-2">
                Instagram Handle (Optional)
              </label>
              <input
                type="text"
                name="instaId"
                value={formData.instaId}
                onChange={handleChange}
                placeholder="@username"
                className="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white font-barlow focus:outline-none focus:border-gold-premium transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: AUDITION OPTION SELECTION & SAFETY WAIVER */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-6 h-6 text-gold-premium" />
              Step 2: Choose Your Audition Option & Safety Waiver
            </h3>
            <p className="text-gray-400 text-xs font-barlow uppercase tracking-widest mt-1">
              Select 1 audition strength activity. 100 contestants per activity → Top 20 advance to Top 100 Final Knockout!
            </p>
          </div>

          {/* Audition Activity Cards Grid */}
          <div className="space-y-3">
            <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gold-premium">
              Select Your Audition Activity <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AUDITION_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = formData.auditionOption === opt.id;
                const evSlots = (event as any)?.audition_slots || {};
                const filled = evSlots[opt.id]?.filled ?? 0;
                const capacity = 100;
                const remaining = Math.max(0, capacity - filled);
                const isSoldOut = remaining <= 0;

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!isSoldOut) {
                        setFormData((p) => ({ ...p, auditionOption: opt.id }));
                      }
                    }}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 bg-gradient-to-br ${
                      isSoldOut
                        ? 'opacity-50 border-red-500/30 bg-red-500/5 cursor-not-allowed'
                        : isSelected
                        ? 'border-gold-premium bg-gold-premium/10 shadow-[0_0_20px_rgba(212,175,55,0.3)] scale-[1.02]'
                        : 'border-white/10 bg-black/40 hover:border-gold-premium/40 hover:scale-[1.01]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10">
                        <IconComp className={`w-6 h-6 ${isSelected ? 'text-gold-premium' : 'text-gray-300'}`} />
                      </div>
                      <span className={`text-[10px] font-barlow font-bold uppercase px-2 py-0.5 rounded border ${
                        isSoldOut
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-gold-premium/10 text-gold-premium border-gold-premium/30'
                      }`}>
                        {isSoldOut ? 'SOLD OUT' : `${remaining} Spots Left`}
                      </span>
                    </div>

                    <h4 className="font-bebas text-lg text-white uppercase tracking-wide">{opt.name}</h4>
                    <p className="text-xs text-gray-400 font-barlow mt-1 uppercase tracking-wider">{opt.description}</p>
                    
                    {/* Filled vs Remaining slot progress bar */}
                    <div className="mt-3 pt-2 border-t border-white/5 space-y-1.5 font-barlow">
                      <div className="flex justify-between items-center text-[11px] uppercase font-bold">
                        <span className="text-gray-400">Filled: <span className="text-white">{filled} / {capacity}</span></span>
                        <span className="text-gold-premium">{remaining} Remaining</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-gold-premium to-amber-400 h-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (filled / capacity) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 flex items-center text-xs font-barlow font-bold text-gold-premium uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Selected Activity
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Waiver Box */}
          <div className="bg-black/60 border border-white/10 rounded-lg p-5 space-y-4">
            <h4 className="font-bebas text-lg text-gold-premium uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Safety Waiver & Liability Release
            </h4>
            <div className="max-h-36 overflow-y-auto text-xs text-gray-400 space-y-2 pr-2 font-barlow leading-relaxed border border-white/5 p-3 rounded">
              <p>
                By registering for <strong>{event.title}</strong>, I hereby declare that I am physically fit and sufficiently trained to participate in obstacle and athletic activities.
              </p>
              <p>
                I acknowledge that high-intensity obstacle courses, weight lifting, and physical challenges carry inherent risks. I assume all risks connected with my participation.
              </p>
              <p>
                I release the event organizers, sponsors, and venue hosts from any claims or liabilities arising out of injury or illness during the event.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="waiverAccepted"
                  checked={formData.waiverAccepted}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 accent-gold-premium rounded"
                />
                <span className="text-xs text-gray-300 font-barlow uppercase tracking-wider">
                  I have read, understood, and accept the Safety Waiver & Liability Release <span className="text-gold-premium">*</span>
                </span>
              </label>

              <div>
                <label className="block text-xs uppercase font-barlow font-bold tracking-widest text-gray-300 mb-1">
                  Digital Signature (Type Full Legal Name) <span className="text-gold-premium">*</span>
                </label>
                <input
                  type="text"
                  name="signature"
                  value={formData.signature}
                  onChange={handleChange}
                  placeholder="Full Legal Name as Signature"
                  className="w-full bg-black/80 border border-white/10 rounded px-4 py-2.5 text-white font-barlow text-sm focus:outline-none focus:border-gold-premium"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIRM SLOT & TERMS */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-6 h-6 text-gold-premium" />
              Step 3: Confirm Registration & Audition Details
            </h3>
            <p className="text-gray-400 text-xs font-barlow uppercase tracking-widest mt-1">
              Review your details before proceeding to instant Razorpay payment checkout
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-lg p-5 space-y-4 font-barlow text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-500 block">Event</span>
                <span className="text-white font-bold uppercase">{event.title}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-500 block">Selected Audition</span>
                <span className="text-gold-premium font-bold uppercase">{formData.auditionOption}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-500 block">Participant</span>
                <span className="text-white font-bold">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-gray-500 block">Email & Phone</span>
                <span className="text-white">{formData.email} | +91 {formData.phone}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bebas tracking-wider border-b border-white/10 pb-4">
              <span className="text-gray-300 uppercase">Registration Ticket Price</span>
              <span className="text-gold-premium text-2xl">₹{event.ticket_price}</span>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                name="tosAccepted"
                checked={formData.tosAccepted}
                onChange={handleChange}
                className="mt-1 w-4 h-4 accent-gold-premium rounded"
              />
              <span className="text-xs text-gray-300 font-barlow uppercase tracking-wider leading-relaxed">
                I agree to the <Link href="/terms" target="_blank" className="text-gold-premium underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="text-gold-premium underline">Privacy Policy</Link> of The Beast Hunter Challenge. <span className="text-gold-premium">*</span>
              </span>
            </label>
          </div>
        </div>
      )}

      {/* STEP 4: RAZORPAY PAYMENT */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-gold-premium" />
              Step 4: Instant Payment via Razorpay
            </h3>
            <p className="text-gray-400 text-xs font-barlow uppercase tracking-widest mt-1">
              Pay securely using UPI, Credit/Debit Card, Net Banking, or Wallets
            </p>
          </div>

          <div className="bg-gradient-to-br from-black/60 to-dark-gray border border-gold-premium/30 rounded-xl p-6 text-center space-y-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <div className="inline-flex p-3 rounded-full bg-gold-premium/10 border border-gold-premium/30 text-gold-premium">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-barlow uppercase tracking-widest text-gray-400 block">Total Amount to Pay</span>
              <div className="font-bebas text-5xl text-gold-premium tracking-wide mt-1">
                ₹{event.ticket_price}
              </div>
              <p className="text-xs font-barlow text-gray-400 uppercase tracking-wider mt-2">
                Event: <span className="text-white font-bold">{event.title}</span> ({formData.auditionOption})
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 p-4 rounded-lg text-left text-xs font-barlow text-gray-300 space-y-2">
              <div className="flex justify-between">
                <span>Participant:</span>
                <span className="text-white font-bold">{formData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-white font-bold">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Audition Option:</span>
                <span className="text-gold-premium font-bold">{formData.auditionOption}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={submitLoading}
              className="w-full py-4 gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-widest rounded-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  <span>Pay ₹{event.ticket_price} via Razorpay</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t border-white/10 mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={submitLoading}
            className="flex items-center space-x-2 text-gray-400 hover:text-white font-barlow font-bold uppercase text-xs tracking-wider transition-colors px-4 py-2 rounded bg-black/40 border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center space-x-2 gold-gradient-bg text-black font-barlow font-black uppercase text-xs tracking-widest px-6 py-3 rounded hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <span>{step === 3 ? 'Proceed to Payment' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
