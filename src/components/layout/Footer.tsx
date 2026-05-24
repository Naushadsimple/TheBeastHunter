'use client';

import Link from 'next/link';
import { Flame, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-black border-t border-gold-premium/15 text-gray-400 font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Flame className="w-8 h-8 text-gold-premium" />
              <span className="font-bebas text-2xl tracking-wider text-white">
                THE BEAST HUNTER
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Mumbai&apos;s home for extreme obstacle runs, night marathons, and endurance
              challenges that push you beyond your limits.
            </p>
          </div>

          <div>
            <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-2 border-gold-premium pl-3">
              Explore
            </h4>
            <ul className="space-y-3 font-barlow text-base uppercase tracking-wide">
              <li><Link href="/" className="hover:text-gold-premium transition-colors">Home</Link></li>
              <li><Link href="/events#events-section" className="hover:text-gold-premium transition-colors">Races & Events</Link></li>
              <li><Link href="/about" className="hover:text-gold-premium transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-gold-premium transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-2 border-gold-premium pl-3">
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-premium shrink-0 mt-0.5" />
                <span>Palghar, Maharashtra 401404</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-premium shrink-0" />
                <a href="mailto:support@thebeasthunterchallenge.com" className="hover:text-gold-premium transition-colors break-all">
                  support@thebeasthunterchallenge.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-premium shrink-0" />
                <a href="tel:+918421787508" className="hover:text-gold-premium transition-colors">
                  84217 87508
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-2 border-gold-premium pl-3">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy-policy" className="hover:text-gold-premium">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-gold-premium">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gold-premium/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-center md:text-left">
            &copy; {currentYear} The Beast Hunter. All Rights Reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1 text-gold-premium hover:text-gold-glow font-barlow font-bold uppercase tracking-wider text-xs"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
