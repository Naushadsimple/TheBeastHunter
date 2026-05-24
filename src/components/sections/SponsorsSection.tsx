'use client';

import Image from 'next/image';

export interface SponsorItem {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string | null;
}

const FALLBACK_SPONSORS: SponsorItem[] = [
  {
    id: '1',
    name: 'Nike Training',
    logo_url:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    name: 'Hydration',
    logo_url:
      'https://images.unsplash.com/photo-1551033406-611912d1d3a5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    name: 'Nutrition',
    logo_url:
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '4',
    name: 'Fitness Tech',
    logo_url:
      'https://images.unsplash.com/photo-1581291519195-ef11498d1cf1?auto=format&fit=crop&w=400&q=80',
  },
];

interface SponsorsSectionProps {
  sponsors?: SponsorItem[];
}

export default function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  const list =
    sponsors && sponsors.length > 0
      ? sponsors.filter((s) => s.logo_url)
      : FALLBACK_SPONSORS;

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
