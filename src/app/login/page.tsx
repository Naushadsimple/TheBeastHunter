'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Flame, Mail, ArrowRight, ArrowLeft, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Login successful! Redirecting...',
        });
        // Get return_to from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('return_to');
        if (returnTo) {
          window.location.href = returnTo;
        } else {
          window.location.href = '/';
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({
          type: 'success',
          text: 'Registration successful! You can now log in.',
        });
        setIsLogin(true);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
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
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* Toggle between Login and Register */}
          <div className="flex bg-black/50 rounded p-1">
            <button
              onClick={() => { setIsLogin(true); setMessage(null); setEmail(''); setPassword(''); setName(''); }}
              className={`flex-1 py-2 text-xs font-barlow font-bold uppercase tracking-wider rounded transition-all duration-300 ${
                isLogin ? 'gold-gradient-bg text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(null); setEmail(''); setPassword(''); setName(''); }}
              className={`flex-1 py-2 text-xs font-barlow font-bold uppercase tracking-wider rounded transition-all duration-300 ${
                !isLogin ? 'gold-gradient-bg text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              Register
            </button>
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

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
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

              <div className="space-y-1.5">
                <label htmlFor="password" className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter transition-colors duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider py-3.5 rounded hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    disabled={loading}
                    className="bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="reg-email"
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

              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id="reg-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full text-sm font-inter transition-colors duration-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gold-gradient-bg text-black font-barlow text-base font-black uppercase tracking-wider py-3.5 rounded hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
