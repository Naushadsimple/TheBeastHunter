'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Copy, Check, Sparkles, Tag, ArrowRight, ShieldCheck } from 'lucide-react';

interface PopupConfig {
  is_enabled: boolean;
  title: string;
  subtitle: string;
  coupon_code: string;
  discount_text: string;
  image_url: string;
}

export default function IndependencePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<PopupConfig>({
    is_enabled: true,
    title: 'HAPPY INDEPENDENCE DAY! 🇮🇳',
    subtitle: 'Celebrate Freedom & Unleash Your Inner Beast',
    coupon_code: 'INDIA15',
    discount_text: 'Get 15% INSTANT DISCOUNT on all Audition Registrations!',
    image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=800&auto=format&fit=crop',
  });
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // 1. Fetch promo popup settings from API
    async function fetchConfig() {
      try {
        const res = await fetch('/api/settings/promo-popup');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
          return data;
        }
      } catch (err) {
        console.error('Failed to fetch promo popup config:', err);
      }
      return null;
    }

    fetchConfig().then((apiConfig) => {
      const activeConfig = apiConfig || config;
      if (!activeConfig.is_enabled) return;

      // Check if user already dismissed popup in this session
      const dismissed = sessionStorage.getItem('tbh_independence_popup_dismissed');
      if (dismissed) return;

      // Show popup exactly after 3 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
        setLoaded(true);
      }, 3000);

      return () => clearTimeout(timer);
    });
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('tbh_independence_popup_dismissed', 'true');
  };

  const handleCopyCode = () => {
    const code = config.coupon_code || 'INDIA15';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen || !config.is_enabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Main Popup Modal Card */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-dark-gray to-black border-2 border-gold-premium/40 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.25)] overflow-hidden z-10 animate-in zoom-in-95 duration-300">
        {/* Tricolor Accent Top Bar */}
        <div className="h-2 w-full flex">
          <div className="h-full w-1/3 bg-[#FF9933]" />
          <div className="h-full w-1/3 bg-white" />
          <div className="h-full w-1/3 bg-[#138808]" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-gray-300 hover:text-white hover:bg-black/90 hover:border-gold-premium flex items-center justify-center transition-all duration-200"
          title="Close Popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content Container */}
        <div className="p-6 sm:p-8 space-y-6 text-center">
          {/* Header Tricolor Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF9933]/20 via-white/10 to-[#138808]/20 border border-white/20 text-xs font-barlow font-bold uppercase tracking-widest text-gold-premium">
            <span className="text-base">🇮🇳</span>
            <span>79th Independence Day Special</span>
            <Sparkles className="w-3.5 h-3.5 text-gold-premium animate-pulse" />
          </div>

          {/* Banner Graphic / Image */}
          {config.image_url && (
            <div className="relative h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-white/10 group">
              <img
                src={config.image_url}
                alt="Independence Day Offer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                <span className="text-[10px] font-barlow font-bold uppercase text-[#FF9933] tracking-widest">
                  Limited Time Offer
                </span>
                <h3 className="font-bebas text-2xl sm:text-3xl text-white tracking-wide drop-shadow-md">
                  {config.title}
                </h3>
              </div>
            </div>
          )}

          {/* Title & Subtitle */}
          {!config.image_url && (
            <div className="space-y-2">
              <h3 className="font-bebas text-3xl sm:text-4xl text-white uppercase tracking-wide">
                {config.title}
              </h3>
              <p className="text-xs sm:text-sm font-barlow text-gray-300 uppercase tracking-wider">
                {config.subtitle}
              </p>
            </div>
          )}

          {/* Discount Highlight */}
          <div className="bg-gradient-to-r from-gold-premium/10 via-black to-gold-premium/10 border border-gold-premium/30 p-4 rounded-xl space-y-1">
            <p className="text-xs font-barlow text-gray-300 uppercase tracking-wider">
              {config.subtitle}
            </p>
            <p className="font-bebas text-xl sm:text-2xl text-gold-premium tracking-wide">
              {config.discount_text}
            </p>
          </div>

          {/* Copyable Coupon Code Button */}
          <div className="space-y-2">
            <span className="text-[11px] font-barlow uppercase text-gray-400 font-bold tracking-widest block">
              Click below to copy promo code
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between group relative overflow-hidden ${
                copied
                  ? 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-black/80 border-gold-premium/60 hover:border-gold-premium text-white hover:bg-gold-premium/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-premium/20 text-gold-premium border border-gold-premium/30">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-barlow text-gray-400 uppercase tracking-widest block">
                    Promo Code
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-black text-gold-premium tracking-widest">
                    {config.coupon_code || 'INDIA15'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {copied ? (
                  <span className="text-xs font-barlow font-bold text-green-400 uppercase tracking-wider flex items-center gap-1 bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30">
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </span>
                ) : (
                  <span className="text-xs font-barlow font-bold text-gold-premium uppercase tracking-wider flex items-center gap-1 group-hover:scale-105 transition-transform bg-gold-premium/10 px-3 py-1.5 rounded-lg border border-gold-premium/30">
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </span>
                )}
              </div>
            </button>
            {copied && (
              <p className="text-xs text-green-400 font-barlow font-bold uppercase tracking-wider animate-in fade-in">
                🎉 Coupon code copied to clipboard! Apply at checkout for 15% discount.
              </p>
            )}
          </div>

          {/* CTA Action Button */}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/events/beast-hunter-audition-2026"
              onClick={handleClose}
              className="w-full py-4 gold-gradient-bg text-black font-barlow text-sm font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center justify-center space-x-2"
            >
              <span>Claim Offer & Register Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-barlow text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors py-1"
            >
              No thanks, continue to website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
