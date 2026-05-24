'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

interface AdminSignInProps {
  onSuccess: () => void | Promise<void>;
  accessDeniedMessage?: string;
  serverError?: string | null;
}

export default function AdminSignIn({
  onSuccess,
  accessDeniedMessage,
  serverError,
}: AdminSignInProps) {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    serverError ?? accessDeniedMessage ?? null
  );

  useEffect(() => {
    if (serverError) setError(serverError);
    else if (accessDeniedMessage) setError(accessDeniedMessage);
  }, [serverError, accessDeniedMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Wrong email or password. Check Supabase Auth user exists with Email provider enabled.'
          : signInError.message);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setError('Sign-in failed. Please try again.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, email')
        .eq('id', userId)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setError(
          'Access denied. This account is not an admin. Ask the site owner to set role = admin in Supabase for your email.'
        );
        return;
      }

      await onSuccess();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-gray/40 border border-white/10 rounded-lg p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] gold-gradient-bg" />

        <div className="text-center mb-8">
          <ShieldCheck className="w-12 h-12 text-gold-premium mx-auto mb-4" />
          <h2 className="font-bebas text-3xl text-white uppercase tracking-wide">Admin login</h2>
          <p className="text-gray-400 text-sm mt-2">
            Email and password only — for whitelisted admin accounts
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded border border-red-500/30 bg-red-500/5 flex gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
              Admin email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thebeasthunter.in"
                disabled={loading}
                className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-gold-premium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-black/50 border border-white/10 text-white pl-10 pr-4 py-3 rounded text-sm focus:outline-none focus:border-gold-premium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient-bg text-black font-barlow font-black uppercase tracking-wider py-3.5 rounded hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in to dashboard'
            )}
          </button>
        </form>

        <Link
          href="/"
          className="block text-center text-sm text-gold-premium hover:underline font-barlow uppercase tracking-wider mt-6"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
