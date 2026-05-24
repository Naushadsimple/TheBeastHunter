'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminPanel from '@/components/admin/AdminPanel';

function AdminPageContent() {
  const searchParams = useSearchParams();
  const accessDenied = searchParams.get('error') === 'not-admin';
  return <AdminPanel accessDenied={accessDenied} />;
}

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black text-white pt-20 sm:pt-24 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <Suspense
            fallback={
              <div className="flex justify-center py-24">
                <Loader2 className="w-12 h-12 text-gold-premium animate-spin" />
              </div>
            }
          >
            <AdminPageContent />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
}
