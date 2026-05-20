'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  User,
  Phone,
  Calendar,
  ShieldAlert,
  FileText,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle
} from 'lucide-react';
import { DBEvent } from '@/components/sections/UpcomingRaces';

interface RegistrationFormProps {
  event: DBEvent;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export default function RegistrationForm({ event, user }: RegistrationFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user.name || '',
    phone: '',
    dob: '',
    gender: 'male',
    emergencyContactName: '',
    emergencyContactPhone: '',
    tshirtSize: 'M',
    bloodGroup: 'O+',
    idProofType: 'Aadhaar',
    idProofUrl: '',
    waiverAccepted: false,
    signature: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Upload ID Proof to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('id-proofs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('id-proofs')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, idProofUrl: publicUrl }));
    } catch (err: any) {
      setError(err.message || 'File upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  // Step Navigations with Validation
  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.fullName.trim()) return 'Full Name is required';
      if (!formData.phone.trim() || formData.phone.length < 10) return 'Valid Phone number is required';
      if (!formData.dob) return 'Date of Birth is required';
      if (!formData.emergencyContactName.trim()) return 'Emergency contact name is required';
      if (!formData.emergencyContactPhone.trim() || formData.emergencyContactPhone.length < 10) {
        return 'Valid Emergency contact phone is required';
      }
    } else if (step === 2) {
      if (!formData.idProofUrl) return 'Please upload a copy of your ID Proof';
    } else if (step === 3) {
      if (!formData.waiverAccepted) return 'You must accept the safety waiver';
      if (!formData.signature.trim()) return 'Signature is required to verify the waiver';
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => prev - 1);
  };

  // Form Submission
  const handleSubmit = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setSubmitLoading(true);
    setError(null);

    try {
      // 1. Send request to create checkout order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          registrationData: {
            fullName: formData.fullName,
            phone: formData.phone,
            dob: formData.dob,
            gender: formData.gender,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            tshirtSize: formData.tshirtSize,
            bloodGroup: formData.bloodGroup,
            idProofType: formData.idProofType,
            idProofUrl: formData.idProofUrl,
            signature: formData.signature,
          }
        })
      });

      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.message || 'Checkout failed');
      }

      // Redirect user to Cashfree payment page
      if (resData.paymentSessionId) {
        // Redirection to local cashfree checkout
        router.push(`/checkout?session_id=${resData.paymentSessionId}&order_id=${resData.orderId}`);
      } else {
        throw new Error('Payment session ID not found');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Try again.');
      setSubmitLoading(false);
    }
  };

  const basePrice = event.ticket_price;
  const gstAmount = Math.round(basePrice * 0.18);
  const totalAmount = basePrice + gstAmount;

  return (
    <div className="bg-dark-gray/30 border border-white/5 rounded-lg p-6 sm:p-10 relative overflow-hidden">
      {/* Light border glow */}
      <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg" />

      {/* Steps Progress Indicator */}
      <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bebas text-lg border transition-all duration-300 ${
                step >= s
                  ? 'gold-gradient-bg text-black border-gold-premium font-bold'
                  : 'bg-black/40 text-gray-500 border-white/10'
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div
                className={`h-0.5 flex-grow mx-2 transition-all duration-500 ${
                  step > s ? 'gold-gradient-bg' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/30 p-4 rounded mb-6 flex items-center space-x-2 text-red-400 font-semibold text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Content Steps */}
      <div className="min-h-[300px]">
        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <h3 className="font-bebas text-2xl text-white tracking-wide uppercase border-b border-white/10 pb-2 flex items-center space-x-2">
              <User className="w-5 h-5 text-gold-premium" />
              <span>Step 1: Runner Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-barlow text-sm font-bold">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={10}
                    className="bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter appearance-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-barlow uppercase tracking-wider"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Guardian / Friend Name"
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Emergency Contact Phone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-barlow text-sm font-bold">+91</span>
                  <input
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    maxLength={10}
                    className="bg-black/40 border border-white/10 text-white pl-12 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Event Details & Uploads */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <h3 className="font-bebas text-2xl text-white tracking-wide uppercase border-b border-white/10 pb-2 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-gold-premium" />
              <span>Step 2: Kit Customization & ID Proof</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">T-Shirt Size</label>
                <select
                  name="tshirtSize"
                  value={formData.tshirtSize}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-barlow uppercase tracking-wider"
                >
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra Large)</option>
                  <option value="XXL">XXL (Double Extra Large)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-barlow uppercase tracking-wider"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">ID Document Type</label>
                <select
                  name="idProofType"
                  value={formData.idProofType}
                  onChange={handleChange}
                  className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-barlow uppercase tracking-wider"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              {/* ID Proof File Upload */}
              <div className="space-y-1.5">
                <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Upload ID Copy (Max 5MB)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    id="id-file"
                    className="hidden"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="id-file"
                    className={`flex items-center justify-center space-x-2 border border-dashed rounded px-4 py-3 text-sm cursor-pointer transition-all duration-300 ${
                      formData.idProofUrl
                        ? 'border-green-500/35 bg-green-500/5 text-green-400'
                        : 'border-white/20 bg-black/40 text-gray-300 hover:border-gold-premium'
                    }`}
                  >
                    <Upload className="w-4 h-4 text-gold-premium" />
                    <span>
                      {uploading
                        ? 'Uploading file...'
                        : formData.idProofUrl
                        ? 'ID uploaded successfully!'
                        : 'Choose Image / PDF'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Safety Waiver */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <h3 className="font-bebas text-2xl text-white tracking-wide uppercase border-b border-white/10 pb-2 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gold-premium" />
              <span>Step 3: Safety Waiver & Liability Agreement</span>
            </h3>

            {/* Waiver box */}
            <div className="bg-black/50 border border-white/10 rounded-lg p-5 text-xs sm:text-sm text-gray-300 h-48 overflow-y-scroll leading-relaxed space-y-4 font-inter">
              <p>
                <strong>THE BEAST HUNTER LIABILITY WAIVER AND RELEASE FORM</strong>
              </p>
              <p>
                I, the undersigned, hereby declare that I wish to participate in {event.title} organized by The Beast Hunter team. I understand that the course is designed to challenge my physical and mental endurance, containing extreme obstacle mud pits, vertical walls, heavy item lifting, and outdoor trail runs.
              </p>
              <p>
                1. <strong>Physical Capability:</strong> I certify that I am physically fit, have trained sufficiently for this challenge, and have not been advised otherwise by a medical practitioner.
              </p>
              <p>
                2. <strong>Assumption of Risk:</strong> I assume full responsibility for all risks involved in my participation, including but not limited to physical injuries, cuts, sprains, muscle pulls, dehydration, and exhaustion.
              </p>
              <p>
                3. <strong>Indemnification:</strong> I hereby release, acquit, and forever discharge The Beast Hunter, its directors, employees, volunteers, sponsors, and medical personnel from any and all liability, claims, or demands arising out of my participation in this event.
              </p>
              <p>
                By signing below, I certify that I have read and agree to all clauses outlined in this waiver.
              </p>
            </div>

            {/* Accept Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="waiverAccepted"
                name="waiverAccepted"
                checked={formData.waiverAccepted}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-gold-premium focus:ring-gold-premium"
              />
              <label htmlFor="waiverAccepted" className="font-barlow text-sm text-gray-300 uppercase tracking-wide cursor-pointer font-semibold select-none">
                I agree to the terms, conditions, and liability waiver outlined above.
              </label>
            </div>

            {/* Digital Signature */}
            <div className="space-y-1.5 max-w-sm">
              <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Digital Signature (Type Full Name)</label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                placeholder="Type your name to sign"
                className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter italic"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Summary & Pricing */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <h3 className="font-bebas text-2xl text-white tracking-wide uppercase border-b border-white/10 pb-2 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gold-premium" />
              <span>Step 4: Registration Summary</span>
            </h3>

            {/* Data Grid Summary */}
            <div className="bg-black/30 border border-white/10 rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-inter text-gray-300">
              <div>
                <span className="text-gray-500 font-barlow text-xs uppercase tracking-wider block">Runner Name</span>
                <span className="font-semibold text-white">{formData.fullName}</span>
              </div>
              <div>
                <span className="text-gray-500 font-barlow text-xs uppercase tracking-wider block">Phone Number</span>
                <span className="font-semibold text-white">+91 {formData.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 font-barlow text-xs uppercase tracking-wider block">Emergency Contact</span>
                <span className="font-semibold text-white">{formData.emergencyContactName} ({formData.emergencyContactPhone})</span>
              </div>
              <div>
                <span className="text-gray-500 font-barlow text-xs uppercase tracking-wider block">T-Shirt Size & Blood</span>
                <span className="font-semibold text-white">Size: {formData.tshirtSize} | Blood Group: {formData.bloodGroup}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="border border-gold-premium/20 bg-gold-premium/5 rounded-lg p-5 space-y-3">
              <h4 className="font-barlow text-base font-bold uppercase text-white tracking-wider flex items-center space-x-2">
                <CreditCard className="w-4.5 h-4.5 text-gold-premium" />
                <span>Price breakdown</span>
              </h4>
              <div className="flex justify-between text-sm font-inter text-gray-300">
                <span>Pass entry fee ({event.title})</span>
                <span>₹{basePrice}</span>
              </div>
              <div className="flex justify-between text-sm font-inter text-gray-300">
                <span>Integrated GST (18%)</span>
                <span>₹{gstAmount}</span>
              </div>
              <div className="h-[1px] bg-gold-premium/20 my-2" />
              <div className="flex justify-between font-bebas text-2xl text-white tracking-wide">
                <span>Total Amount Due</span>
                <span className="text-gold-premium">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button Controls */}
      <div className="flex items-center justify-between mt-12 pt-6 border-t border-white/5">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center space-x-1.5 font-barlow text-base font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300 px-4 py-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-6 py-2.5 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.4)] flex items-center space-x-1.5"
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-8 py-3 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,208,96,0.5)] flex items-center space-x-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{submitLoading ? 'Initiating Payment...' : 'Proceed to Payment'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
