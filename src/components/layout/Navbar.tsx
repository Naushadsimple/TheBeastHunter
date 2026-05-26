'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Shield, Flame } from 'lucide-react';

const REGISTER_HREF = '/events#events-section';

export default function Navbar() {
  const { isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events#events-section' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) return pathname === path.split('#')[0];
    return pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-deep-black/90 backdrop-blur-md border-b border-gold-premium/20 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="The Beast Hunter Challenge Logo"
                fill
                sizes="40px"
                className="object-contain group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />
            </div>
            <span className="font-bebas text-2xl tracking-wider text-white group-hover:text-gold-premium transition-colors duration-300">
              THE BEAST HUNTER CHALLENGE
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-barlow text-lg font-medium tracking-wide uppercase transition-colors duration-300 hover:text-gold-glow ${
                  isActive(link.href) ? 'text-gold-premium border-b border-gold-premium' : 'text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAdmin && (
              <Link
                href="/thebeasthunteradmin"
                className="flex items-center space-x-1 font-barlow text-sm font-semibold uppercase tracking-wider text-gold-premium border border-gold-premium/30 px-3 py-1.5 rounded bg-gold-premium/5 hover:bg-gold-premium/15 transition-all duration-300"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
            <Link
              href={REGISTER_HREF}
              className="gold-gradient-bg text-black font-barlow text-base font-bold uppercase tracking-wider px-6 py-2 rounded border border-transparent hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.5)]"
            >
              Register
            </Link>
          </div>

          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-deep-black border-b border-gold-premium/20 animate-in fade-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 font-barlow text-lg uppercase tracking-wide rounded ${
                  isActive(link.href)
                    ? 'text-gold-premium bg-gold-premium/5 font-semibold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 px-3 space-y-2 border-t border-gray-800">
              {isAdmin && (
                <Link
                  href="/thebeasthunteradmin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 py-3 font-barlow text-lg uppercase text-gold-premium"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href={REGISTER_HREF}
                onClick={() => setIsOpen(false)}
                className="block text-center gold-gradient-bg text-black font-barlow font-bold uppercase py-3 rounded"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
