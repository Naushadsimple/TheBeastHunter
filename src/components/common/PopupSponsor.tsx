'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Award, ExternalLink } from 'lucide-react';

export default function PopupSponsor() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Auto-open after a short delay (1.5 seconds) if not already seen this session
    const timer = setTimeout(() => {
      const hasSeen = sessionStorage.getItem('hasSeenSponsorPopup');
      if (!hasSeen) {
        setOpen(true);
        sessionStorage.setItem('hasSeenSponsorPopup', 'true');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Premium Floating Partner Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-45 flex items-center space-x-2 bg-black/80 hover:bg-black backdrop-blur-md text-white font-barlow font-bold uppercase text-xs py-2.5 px-4 rounded-full border border-gold-premium/30 hover:border-gold-premium shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-premium opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-premium"></span>
        </span>
        <Award className="w-3.5 h-3.5 text-gold-premium" />
        <span>Official Partner</span>
      </button>

      {/* Premium Animated Modal */}
      {open && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-[999] p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div 
            className="relative bg-deep-black border border-gold-premium/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] max-w-lg w-full max-h-[90vh] flex flex-col transform transition-all duration-500 scale-95 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/75 hover:bg-black text-gray-400 hover:text-white rounded-full border border-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner Image Container */}
            <div className="relative aspect-[16/10] w-full bg-dark-gray overflow-hidden">
              <Image 
                src="/puma_sponsor.png" 
                alt="Puma Sponsor" 
                fill
                priority
                className="object-cover hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/20 to-transparent" />
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 space-y-4 text-center">
              <span className="font-barlow text-xs font-black uppercase tracking-widest text-gold-premium">
                Featured Partner
              </span>
              <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide uppercase leading-none">
                PUMA x BEAST HUNTER
              </h3>
              <p className="font-inter text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                Unleash your inner beast with the ultimate performance gear. Gear up for the challenge at the Palghar arena with special athlete discounts!
              </p>
              
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://in.puma.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-white text-black hover:bg-gold-premium hover:text-black font-barlow text-sm font-black uppercase tracking-wider py-3.5 px-6 rounded transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Explore Puma Gear</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center bg-transparent text-white border border-white/15 hover:border-white/40 hover:bg-white/5 font-barlow text-sm font-semibold uppercase tracking-wider py-3.5 px-6 rounded transition-all duration-300"
                >
                  Close & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
