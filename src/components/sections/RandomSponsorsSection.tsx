'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Placeholder sponsor image URLs (public domain or unsplash)
const sponsorImages = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80', // sports shoe
  'https://images.unsplash.com/photo-1551033406-611912d1d3a5?auto=format&fit=crop&w=300&q=80', // water bottle
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=300&q=80', // headphones
  'https://images.unsplash.com/photo-1581291519195-ef11498d1cf1?auto=format&fit=crop&w=300&q=80', // smartwatch
  'https://images.unsplash.com/photo-1598970434795-0c54fe7c0649?auto=format&fit=crop&w=300&q=80', // energy drink
];

export default function RandomSponsorsSection() {
  const [shuffled, setShuffled] = useState<string[]>([]);

  useEffect(() => {
    // Shuffle images on mount for randomness
    const shuffledImages = [...sponsorImages]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4); // show 4 random images
    setShuffled(shuffledImages);
  }, []);

  return (
    <section className="my-12">
      <h3 className="font-bebas text-3xl text-center text-gold-premium tracking-widest mb-6">
        Our Proud Sponsors
      </h3>
      <div className="flex flex-wrap justify-center gap-8">
        {shuffled.map((src, idx) => (
          <div
            key={idx}
            className="bg-deep-black/60 backdrop-blur-sm border border-gold-premium/30 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.1)]"
          >
            <Image
              src={src}
              alt={`Sponsor ${idx + 1}`}
              width={200}
              height={120}
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
