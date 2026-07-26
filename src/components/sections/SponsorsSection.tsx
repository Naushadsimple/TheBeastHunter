'use client';

import Image from 'next/image';

export interface SponsorItem {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
}

interface SponsorsSectionProps {
  sponsors?: SponsorItem[];
}

export default function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  const list = sponsors && sponsors.length > 0 ? sponsors.filter((s) => s.logo_url) : [];

  if (list.length === 0) {
    return (
      <section className="relative bg-gradient-to-b from-black via-deep-black to-deep-black py-16 border-y border-gold-premium/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.04),transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <span className="font-barlow text-xs font-bold uppercase tracking-[0.3em] text-gold-premium">
            Sponsorship Open
          </span>
          <h2 className="font-bebas text-3xl sm:text-5xl text-white tracking-wider uppercase mt-2">
            Partner With <span className="gold-gradient-text">The Beast Hunter Challenge</span>
          </h2>
          <p className="font-barlow text-base sm:text-lg text-gray-400 mt-4 max-w-2xl mx-auto tracking-wide leading-relaxed">
            Showcase your brand to thousands of fitness enthusiasts and elite athletes. Join us as an official partner for Season 2026.
          </p>
          <div className="mt-8">
            <a
              href="mailto:info@thebeasthunterchallenge.com"
              className="inline-flex items-center justify-center font-barlow text-sm font-black uppercase tracking-wider text-black gold-gradient-bg px-8 py-3.5 rounded hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              Become an Official Sponsor
            </a>
          </div>
        </div>
      </section>
    );
  }

  const marqueeItems = [...list, ...list];

  return (
    <section className="relative bg-gradient-to-b from-black via-deep-black to-deep-black py-16 sm:py-20 border-y border-gold-premium/10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 text-center relative z-10">
        <span className="font-barlow text-xs font-bold uppercase tracking-[0.3em] text-gold-premium">
          Powered By Champions
        </span>
        <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wider uppercase mt-2">
          Our Partners &amp; Sponsors
        </h2>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-deep-black to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-deep-black to-transparent z-10 pointer-events-none" />

        <div className="flex gap-6 sm:gap-8 animate-marquee py-4 w-max">
          {marqueeItems.map((sponsor, idx) => (
            <a
              key={`${sponsor.id}-${idx}`}
              href={sponsor.website_url || '#'}
              target={sponsor.website_url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex-shrink-0 w-40 sm:w-52 h-28 sm:h-32 relative rounded-xl overflow-hidden border border-white/10 bg-dark-gray/80 group hover:border-gold-premium/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-500"
            >
              <Image
                src={sponsor.logo_url}
                alt={sponsor.name}
                fill
                sizes="(max-width: 640px) 160px, 208px"
                className="object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 grayscale group-hover:grayscale-0"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-0 right-0 text-center font-barlow text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gold-glow px-2">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
