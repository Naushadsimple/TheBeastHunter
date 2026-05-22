'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Shield, User as UserIcon, LogOut, Flame } from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll effect to add background color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

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
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Flame className="w-8 h-8 text-gold-premium group-hover:scale-110 transition-transform duration-300" />
            <span className="font-bebas text-2xl tracking-wider text-white group-hover:text-gold-premium transition-colors duration-300">
              THE BEAST HUNTER
            </span>
          </Link>

          {/* Desktop Nav Links */}
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

          {/* Action Buttons */}
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

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className={`flex items-center space-x-1.5 font-barlow text-base font-semibold uppercase tracking-wider px-4 py-2 rounded transition-all duration-300 ${
                    isActive('/profile')
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-gold-premium" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 font-barlow text-base font-semibold uppercase tracking-wider text-red-400 hover:text-red-500 px-3 py-2 rounded transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="gold-gradient-bg text-black font-barlow text-base font-bold uppercase tracking-wider px-6 py-2 rounded border border-transparent hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(245,208,96,0.5)]"
              >
                Login / Register
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white p-2 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
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

            <div className="pt-4 pb-2 border-t border-gray-800 px-3 space-y-2">
              {isAdmin && (
                <Link
                  href="/thebeasthunteradmin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 py-3 font-barlow text-lg uppercase tracking-wide text-gold-premium"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              )}

              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 py-3 font-barlow text-lg uppercase tracking-wide text-gray-300 hover:text-white"
                  >
                    <UserIcon className="w-5 h-5 text-gold-premium" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      signOut();
                    }}
                    className="flex items-center space-x-2 w-full text-left py-3 font-barlow text-lg uppercase tracking-wide text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-center gold-gradient-bg text-black font-barlow text-base font-bold uppercase tracking-wider py-3 rounded"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
