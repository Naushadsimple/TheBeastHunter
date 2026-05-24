import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-16 bg-deep-black">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="font-barlow text-sm text-gold-premium uppercase tracking-wider hover:text-gold-glow mb-6 inline-block"
          >
            ← Back to home
          </Link>
          <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide uppercase mb-2">
            {title}
          </h1>
          <p className="font-barlow text-xs text-gray-500 uppercase tracking-widest mb-10">
            Last updated: {lastUpdated}
          </p>
          <div className="prose-legal space-y-6 font-inter text-gray-300 text-sm sm:text-base leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
