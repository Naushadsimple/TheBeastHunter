'use client';

import { Flame, Shield, Award, Activity, Heart } from 'lucide-react';

export default function SponsorsSection() {
  // SVG Vector logos representing athletic/lifestyle brands
  const sponsors = [
    {
      name: 'Titan Gear',
      icon: Shield,
      tagline: 'TITAN GEAR',
    },
    {
      name: 'Volt Energy',
      icon: Flame,
      tagline: 'VOLT ENERGY',
    },
    {
      name: 'Apex Nutrition',
      icon: Award,
      tagline: 'APEX NUTRITION',
    },
    {
      name: 'Hydra Water',
      icon: Activity,
      tagline: 'HYDRA HYDRATION',
    },
    {
      name: 'Cronos Wear',
      icon: Heart,
      tagline: 'CRONOS APPAREL',
    },
  ];

  // Duplicate list to achieve continuous seamless loop in marquee
  const doubleSponsors = [...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="bg-black py-16 border-t border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <span className="font-barlow text-xs font-bold uppercase tracking-widest text-gold-premium">
          Trusted By Industry Leaders
        </span>
      </div>

      {/* Infinite Scroll Marquee Container */}
      <div className="relative w-full overflow-hidden flex items-center justify-start">
        {/* Left gradient mask */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        
        {/* Right gradient mask */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

        {/* Scrolling Inner Container */}
        <div className="flex space-x-16 whitespace-nowrap animate-marquee py-4">
          {doubleSponsors.map((sponsor, idx) => {
            const Icon = sponsor.icon;
            return (
              <div
                key={`${sponsor.name}-${idx}`}
                className="flex items-center space-x-3 text-gray-500 hover:text-gold-premium transition-colors duration-300 select-none cursor-pointer"
              >
                <Icon className="w-8 h-8 opacity-45 hover:opacity-100 transition-opacity" />
                <span className="font-bebas text-2xl tracking-widest uppercase">
                  {sponsor.tagline}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
