'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

const VIDEOS = [
  {
    id: 'mrxcKhKqoL8',
    title: 'Beast Hunter Challenge Energy',
    subtitle: 'High-octane moments from the race field',
  },
  {
    id: 'n5rNcLFo9zo',
    title: 'Training & Prep',
    subtitle: 'How challengers push past their limits',
  },
  {
    id: 'Wy0jVpXL1Sc',
    title: 'Finishing Line Victory',
    subtitle: 'Shattering boundaries and celebrating success',
  },
];

export default function YoutubeVideosSection() {
  return (
    <section className="py-24 bg-dark-gray/20 relative overflow-hidden border-t border-white/5">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-premium/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-3">
            Watch &amp; Feel The Energy
          </span>
          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase">
            THE BEAST ON <span className="gold-gradient-text">YOUTUBE</span>
          </h2>
          <p className="font-barlow text-lg text-gray-400 mt-4 max-w-2xl mx-auto uppercase tracking-wide">
            Real race footage — replace links with your channel videos anytime
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VIDEOS.map((video, idx) => (
            <motion.div
              key={`${video.id}-${idx}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black shadow-[0_0_40px_rgba(212,175,55,0.08)] group-hover:border-gold-premium/40 transition-all duration-300">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 group-hover:ring-gold-premium/20 transition-all" />
              </div>
              <div className="mt-4 flex items-start gap-3">
                <div className="p-2 rounded bg-gold-premium/10 border border-gold-premium/25 shrink-0">
                  <Play className="w-4 h-4 text-gold-premium" />
                </div>
                <div>
                  <h3 className="font-barlow text-lg font-bold text-white uppercase tracking-wider">
                    {video.title}
                  </h3>
                  <p className="font-inter text-sm text-gray-500 mt-1">{video.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
