'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Flame, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Magic login link sent! Check your inbox to complete sign in.',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setMessage({ type: 'error', text: error.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Google authentication failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex flex-col md:flex-row relative">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-30 flex items-center space-x-1.5 font-barlow text-sm font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* Left side: Motivational Art panel */}
      <div className="hidden md:flex md:w-1/2 bg-dark-gray relative items-end p-16 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/60 to-transparent" />
        
        {/* Brand/Heading on Image */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-2 text-gold-premium">
            <Flame className="w-8 h-8 animate-pulse" />
            <span className="font-bebas text-2xl tracking-wider text-white">THE BEAST HUNTER</span>
          </div>
          <h2 className="font-bebas text-6xl text-white tracking-wide uppercase leading-none">
            NO EXCUSES.<br />
            JUST <span className="gold-gradient-text">RESULTS</span>.
          </h2>
          <p className="font-barlow text-lg text-gray-300 uppercase tracking-widest max-w-md">
            Your limits are only as real as you allow them to be. Log in to claim your challenges.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md space-y-8 bg-dark-gray/30 border border-white/5 p-8 rounded-lg relative overflow-hidden">
          {/* Subtle gold light glow */}
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-gold-premium/5 rounded-full blur-2xl" />

          {/* Heading */}
          <div className="text-center">
            <h1 className="font-bebas text-4xl text-white tracking-wide uppercase">
              ATHLETE <span className="gold-gradient-text">PORTAL</span>
            </h1>
            <p className="font-barlow text-sm text-gray-400 uppercase tracking-wider mt-2">
              Sign in or create your account instantly
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div
              className={`p-4 rounded text-sm font-semibold border ${
                message.type === 'success'
                  ? 'bg-green-500/5 border-green-500/30 text-green-400'
                  : 'bg-red-500/5 border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* OTP Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={loading}
                  className="bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter transition-colors duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider py-3.5 rounded hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending Magic Link...' : 'Send Magic Link'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest text-gray-500">
              <span className="bg-deep-black px-3 font-bold">Or continue with</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-black/60 hover:bg-white/5 border border-white/10 text-white font-barlow text-sm font-bold uppercase tracking-wider py-3.5 rounded transition-all duration-300 flex items-center justify-center space-x-2 hover:border-gold-premium/45 active:scale-95"
          >
            {/* Google Logo Icon SVG */}
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
