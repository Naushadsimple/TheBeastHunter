'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Mail,
  Upload,
  QrCode,
  Copy,
  Check,
  FileImage,
  Info,
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
    instaId: '',
    city: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    tshirtSize: 'M',
    bloodGroup: 'O+',
    waiverAccepted: false,
    signature: '',
    tosAccepted: false,
  });

  // Step 4 payment states
  const [transactionId, setTransactionId] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('gasuvarna-4@oksbi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot must be 5MB or smaller');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, or WebP images are allowed');
        return;
      }
      setError(null);
      setPaymentProofFile(file);
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
      if (!formData.waiverAccepted) return 'You must accept the safety waiver';
      if (!formData.signature.trim()) return 'Type your full name to sign the waiver';
    } else if (step === 3) {
      if (!formData.tosAccepted) {
        return 'You must accept the Terms of Service and Privacy Policy';
      }
    } else if (step === 4) {
      if (!transactionId.trim()) {
        return 'Transaction ID / UTR Number is required';
      }
      if (!paymentProofFile) {
        return 'Payment proof screenshot is required';
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

  const handleSubmitRegistration = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      // 1. Upload the payment proof screenshot first
      const uploadFormData = new FormData();
      uploadFormData.append('file', paymentProofFile!);
      uploadFormData.append('email', formData.email.trim().toLowerCase());

      const uploadResponse = await fetch('/api/upload/id-proof', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Failed to upload payment proof screenshot');
      }

      const paymentProofUrl = uploadData.path;

      // 2. Submit checkout and registration details
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          transactionId: transactionId.trim(),
          paymentProofUrl: paymentProofUrl,
          registrationData: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.replace(/\D/g, '').slice(-10),
            dob: formData.dob,
            gender: 'male',
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

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Could not process your registration');
      }

      // Redirect to the success screen with orderId
      router.push(`/payment/success?order_id=${resData.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      setSubmitLoading(false);
    }
  };

  const totalAmount = event.ticket_price;
  const upiLink = `upi://pay?pa=ravitiwari8421787508@okhdfcbank&pn=The%20Beast%20Hunter%20Challenge&am=${totalAmount}&cu=INR`;
  const qrCodeImageUrl = '/payment-qr1.png';

  return (
    <div className="bg-dark-gray/30 border border-white/5 rounded-lg p-6 sm:p-10 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg" />

      {/* Progress Steps Header */}
      <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bebas text-lg border transition-all ${
                step >= s
                  ? 'gold-gradient-bg text-black border-gold-premium font-bold'
                  : 'bg-black/40 text-gray-500 border-white/10'
              }`}
            >
              {s}
            </div>
            {s < TOTAL_STEPS && (
              <div
                className={`h-0.5 flex-grow mx-2 ${step > s ? 'gold-gradient-bg' : 'bg-white/10'}`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/30 p-4 rounded mb-6 flex items-center gap-2 text-red-400 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="min-h-[280px]">
        {/* Step 1: Runner Details */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-bebas text-2xl text-white uppercase border-b border-white/10 pb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-gold-premium" />
              Step 1: Runner details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Full name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={!!user?.email}
                    className="bg-black/40 border border-white/10 text-white pl-10 pr-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium disabled:opacity-70"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Mobile *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className="bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Date of birth *
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Instagram ID
                </label>
                <input
                  type="text"
                  name="instaId"
                  value={formData.instaId}
                  onChange={handleChange}
                  placeholder="@yourusername"
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  T-shirt size
                </label>
                <select
                  name="tshirtSize"
                  value={formData.tshirtSize}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                >
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Blood group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Emergency contact *
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Emergency phone *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    maxLength={10}
                    className="bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Waiver details */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-bebas text-2xl text-white uppercase border-b border-white/10 pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gold-premium" />
              Step 2: Safety waiver
            </h3>
            <div className="bg-black/50 border border-white/10 rounded-lg p-5 text-sm text-gray-300 h-44 overflow-y-auto leading-relaxed">
              <p className="font-semibold text-white mb-2">LIABILITY WAIVER</p>
              <p>
                I understand that {event.title} involves physical exertion and risk of injury. I
                confirm I am medically fit to participate. I accept full responsibility for my
                health and safety during this challenge.
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="waiverAccepted"
                checked={formData.waiverAccepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded text-gold-premium animate-pulse"
              />
              <span className="text-sm text-gray-300">I accept the event waiver and rules</span>
            </label>
            <div className="space-y-1.5 max-w-sm">
              <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                Digital signature (full name) *
              </label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm italic focus:outline-none focus:border-gold-premium"
              />
            </div>
          </div>
        )}

        {/* Step 3: Review Slot */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-bebas text-2xl text-white uppercase border-b border-white/10 pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gold-premium" />
              Step 3: Confirm slot
            </h3>
            <div className="bg-black/30 border border-white/10 rounded-lg p-5 grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 text-xs uppercase block">Runner</span>
                <span className="text-white font-semibold">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs uppercase block">Email</span>
                <span className="text-white font-semibold">{formData.email}</span>
              </div>
            </div>
            <div className="border border-gold-premium/20 bg-gold-premium/5 rounded-lg p-5">
              <div className="flex justify-between font-bebas text-2xl text-gold-premium">
                <span>Entry fee (all inclusive)</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-white/10 bg-black/30">
              <input
                type="checkbox"
                name="tosAccepted"
                checked={formData.tosAccepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded text-gold-premium shrink-0"
              />
              <span className="text-sm text-gray-300 leading-relaxed">
                I have read and agree to the{' '}
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  className="text-gold-premium font-semibold hover:underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  className="text-gold-premium font-semibold hover:underline"
                >
                  Privacy Policy
                </Link>
                . I understand that any health issue or injury during the challenge is my sole
                responsibility, as stated in the Terms.
              </span>
            </label>
          </div>
        )}

        {/* Step 4: QR Code & Payment proof submit */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bebas text-2xl text-white uppercase border-b border-white/10 pb-2 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-gold-premium" />
              Step 4: Scan and Pay (UPI)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: UPI QR Code display */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-white/10">
                <div className="bg-white p-3 rounded-lg shadow-lg relative">
                  {qrCodeImageUrl ? (
                    <a
                      href={upiLink}
                      className="block relative z-10 group cursor-pointer"
                      title="Click to pay directly via UPI app"
                    >
                      <img
                        src={qrCodeImageUrl}
                        alt="UPI QR Code"
                        className="w-48 h-48 sm:w-56 sm:h-56 transition-transform group-hover:scale-[1.03] duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                        <span className="bg-black/80 text-white text-[10px] uppercase font-bold px-2 py-1 rounded border border-white/20">
                          Pay Directly
                        </span>
                      </div>
                    </a>
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-gray-200">
                      <QrCode className="w-12 h-12 text-black animate-pulse" />
                    </div>
                  )}
                </div>
                <p className="font-barlow text-[10px] text-gray-500 uppercase tracking-widest mt-3 text-center">
                  Scan using GPay, PhonePe, Paytm or BHIM
                </p>
              </div>

              {/* Right Column: Payment instructions and input */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-gold-premium/5 border border-gold-premium/20 rounded-lg p-4 flex gap-3 text-sm text-gold-premium">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Instructions:</p>
                    <p className="text-gray-300">
                      1. Scan the QR code with your UPI app or transfer to the UPI ID below.
                    </p>
                    <p className="text-gray-300">
                      2. Transfer exact amount: <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>.
                    </p>
                    <p className="text-gray-300">
                      3. Copy & paste the **Transaction ID / UTR** from your transaction details.
                    </p>
                    <p className="text-gray-300">
                      4. Upload a clear **screenshot** of the payment confirmation screen.
                    </p>
                  </div>
                </div>

                {/* UPI details */}
                <div className="bg-black/30 border border-white/10 rounded-lg p-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-semibold">
                      UPI ID / VPA
                    </span>
                    <span className="text-white font-mono font-bold">ravitiwari8421787508@okhdfcbank</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded transition-all text-xs font-bold font-barlow"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gold-premium" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Amount details */}
                <div className="bg-black/30 border border-white/10 rounded-lg p-3 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-500 text-[10px] uppercase block tracking-wider font-semibold">
                      Amount to Pay
                    </span>
                    <span className="text-2xl font-bebas text-gold-premium font-bold">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Form controls for Step 4 */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                      Transaction ID / UTR Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 123456789012"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded w-full text-sm focus:outline-none focus:border-gold-premium font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest block">
                      Payment Screenshot Proof *
                    </label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-gold-premium/50 bg-black/40 rounded-xl p-4 cursor-pointer hover:bg-black/50 transition-all text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {paymentProofFile ? (
                        <div className="flex items-center gap-2.5 text-sm text-green-400 font-semibold py-2">
                          <FileImage className="w-6 h-6 text-green-400 shrink-0 animate-bounce" />
                          <div className="text-left">
                            <p className="text-white truncate max-w-[200px] text-xs font-mono">
                              {paymentProofFile.name}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 py-3 flex flex-col items-center justify-center">
                          <Upload className="w-8 h-8 text-gold-premium" />
                          <p className="text-xs text-gray-300 font-bold uppercase tracking-wider">
                            Choose Image file
                          </p>
                          <p className="text-[10px] text-gray-500">
                            JPEG, PNG or WebP up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 font-barlow font-bold uppercase text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={handleNext}
            className="gold-gradient-bg text-black font-barlow font-black uppercase px-6 py-2.5 rounded flex items-center gap-1 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.3)]"
          >
            {step === 3 ? 'Continue to Payment' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitRegistration}
            disabled={submitLoading}
            className="gold-gradient-bg text-black font-barlow font-black uppercase px-8 py-3 rounded flex items-center gap-1.5 disabled:opacity-50 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.4)] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {submitLoading ? 'Submitting Registration...' : 'Submit Registration'}
          </button>
        )}
      </div>
    </div>
  );
}
