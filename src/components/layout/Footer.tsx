'use client';

import Link from 'next/link';
import { Flame, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-deep-black border-t border-gold-premium/15 text-gray-400 font-inter">
      {/* Upper Footer section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Flame className="w-8 h-8 text-gold-premium" />
              <span className="font-bebas text-2xl tracking-wider text-white">
                THE BEAST HUNTER
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              India's premier athletic event and challenge hosting platform. We construct high-octane experiences, marathons, and obstacles that push your mind and body to their absolute limits.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-dark-gray text-gold-premium hover:text-white hover:bg-gold-premium rounded transition-all duration-300">
                <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-dark-gray text-gold-premium hover:text-white hover:bg-gold-premium rounded transition-all duration-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-dark-gray text-gold-premium hover:text-white hover:bg-gold-premium rounded transition-all duration-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-2 border-gold-premium pl-3">
              Explore
            </h4>
            <ul className="space-y-3 font-barlow text-base uppercase tracking-wide">
              <li>
                <Link href="/" className="hover:text-gold-premium transition-colors duration-300">Home</Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-gold-premium transition-colors duration-300">Races & Events</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-premium transition-colors duration-300">About the Beast</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-premium transition-colors duration-300">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-2 border-gold-premium pl-3">
              Contact
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gold-premium shrink-0" />
                <span>Hunter HQ, 3rd Floor, Golden Heights, Sector 62, Noida, UP, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gold-premium shrink-0" />
                <a href="mailto:info@thebeasthunter.in" className="hover:text-gold-premium transition-colors">info@thebeasthunter.in</a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gold-premium shrink-0" />
                <a href="tel:+919876543210" className="hover:text-gold-premium transition-colors">+91 98765 43210</a>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="space-y-4">
            <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider mb-6 border-l-2 border-gold-premium pl-3">
              Newsletter
            </h4>
            <p className="text-sm">Subscribe to receive priority event notices, early-bird codes, and workout tips.</p>
            <form className="flex space-x-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter email"
                className="bg-dark-gray border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-premium/55 w-full"
              />
              <button
                type="submit"
                className="gold-gradient-bg text-black font-barlow font-bold uppercase text-xs tracking-wider px-4 py-2 rounded hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lower Footer section */}
      <div className="border-t border-gold-premium/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-center md:text-left">
            &copy; {currentYear} The Beast Hunter. All Rights Reserved. Made for extreme athletes. Made with <Link href="https://naushadwork.netlify.app" className="hover:text-gold-premium transition-colors">Shaikh Naushad</Link>
          </p>
          <div className="flex space-x-6 text-xs mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-gold-premium transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold-premium transition-colors">Terms of Service</Link>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1 text-gold-premium hover:text-gold-glow transition-colors font-bold uppercase tracking-wider"
            >
              <span>Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
