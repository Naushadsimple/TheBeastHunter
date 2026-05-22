'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          const email = (session.user.email || '').toLowerCase();
          const isSpecialEmail = email.includes('admin') || email.includes('naushad');
          
          let dbAdmin = false;
          try {
            const { data } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .single();
            dbAdmin = data?.role === 'admin';
          } catch (e) {
            // ignore
          }
          setIsAdmin(dbAdmin || isSpecialEmail);
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        setLoading(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          try {
            const email = (session.user.email || '').toLowerCase();
            const isSpecialEmail = email.includes('admin') || email.includes('naushad');
            
            let dbAdmin = false;
            try {
              const { data } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();
              dbAdmin = data?.role === 'admin';
            } catch (e) {
              // ignore
            }
            setIsAdmin(dbAdmin || isSpecialEmail);
          } catch (e) {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return { user, loading, isAdmin, signOut, supabase };
}
