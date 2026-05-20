'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate server action submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
    }, 1200);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-24 font-inter relative overflow-hidden flex flex-col justify-between">
        
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 py-16 relative z-10 max-w-5xl space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-wider uppercase leading-none">
              Reach the <span className="text-gold-premium">Command Center</span>
            </h1>
            <p className="text-gray-400 font-inter text-sm sm:text-base leading-relaxed">
              Have questions about registration details, safety protocols, obstacle guidelines, or corporate sponsor packages? Submit your dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sidebar Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {[
                { title: 'Support Hotlines', val: '+91 98765 43210', icon: Phone, label: '9:00 AM - 6:00 PM IST' },
                { title: 'Electronic Mail', val: 'support@thebeasthunter.com', icon: Mail, label: 'Average response: 2 hours' },
                { title: 'Command Headquarters', val: 'Elite Performance Arena, Indiranagar, Bengaluru, KA - 560038', icon: MapPin, label: 'By Appointment Only' }
              ].map((item, idx) => (
                <div key={idx} className="bg-dark-gray/30 border border-white/5 rounded-lg p-6 space-y-3 hover:border-gold-premium/20 transition-all duration-300">
                  <div className="w-10 h-10 rounded bg-gold-premium/10 flex items-center justify-center text-gold-premium">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-barlow text-[10px] font-bold text-gray-500 uppercase tracking-widest block">{item.title}</span>
                    <span className="font-bebas text-xl text-white tracking-wide block uppercase mt-1 leading-snug">{item.val}</span>
                    <span className="text-[10px] text-gray-400 font-inter mt-1 block">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Interactive Form Card */}
            <div className="lg:col-span-2 bg-dark-gray/30 border border-white/5 rounded-lg p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg" />

              {submitted ? (
                <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gold-premium/10 border border-gold-premium/30 flex items-center justify-center text-gold-premium animate-pulse">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-bebas text-4xl text-white uppercase tracking-wider">Signal Transmitted</h2>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed font-inter">
                      Your query has been logged securely inside our command registry. A support lead will review your message shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-barlow text-xs font-black uppercase tracking-wider text-black bg-gold-premium px-6 py-2.5 rounded transition-all hover:scale-102 cursor-pointer"
                  >
                    Send Another Dispatch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="font-bebas text-2xl text-white tracking-wide uppercase border-b border-white/10 pb-2 flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-gold-premium" />
                    <span>Transmit Support Request</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                        className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@domain.com"
                        className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Query Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-barlow uppercase tracking-wider"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Event Registration Problems">Event Registration Problems</option>
                      <option value="Sponsorship Proposals">Sponsorship Proposals</option>
                      <option value="Medical Volunteering">Medical Volunteering / Marshalling</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">Message dispatch</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Type details of your request here..."
                      rows={5}
                      className="bg-black/40 border border-white/10 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider px-8 py-3.5 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.4)] disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-black" />
                      <span>{submitting ? 'Transmitting...' : 'Transmit Message'}</span>
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>

        </div>
        <Footer />
      </div>
    </>
  );
}
