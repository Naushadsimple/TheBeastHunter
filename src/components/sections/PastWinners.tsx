'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Sparkles, X, Maximize2 } from 'lucide-react';

const WINNER_GALLERY = [
  {
    id: 'beach-male',
    title: 'Beach Event — Male Champions',
    location: 'Shirgaon Beach',
    image: '/images/winners/beach_event_male_winners.jpg',
    category: 'Obstacle Beach Run',
    description: 'Gold, Silver, & Bronze medalists from the brutal Shirgaon Beach sand sprint & obstacle trial.',
  },
  {
    id: 'beach-female',
    title: 'Beach Event — Female Champions',
    location: 'Shirgaon Beach',
    image: '/images/winners/beach_event_female_winners.jpg',
    category: 'Obstacle Beach Run',
    description: 'Top female athletes holding their hard-earned podium medals at the Shirgaon Beach event.',
  },
  {
    id: 'fitness-plg',
    title: 'Ultimate Fitness Event — Palghar',
    location: 'Palghar Arena',
    image: '/images/winners/ultimate_fitness_plg_winners.jpg',
    category: 'Endurance & Power Challenge',
    description: 'Grand prize presentation and trophy ceremony for the champions of Palghar Ultimate Fitness Challenge.',
  },
];

export default function PastWinners() {
  const [selectedWinner, setSelectedWinner] = useState<(typeof WINNER_GALLERY)[0] | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-deep-black via-black to-deep-black border-t border-white/5 relative overflow-hidden">
      {/* Background Gold Ambient Glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gold-premium/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold-premium/10 border border-gold-premium/30 text-gold-premium text-xs font-barlow font-bold uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4" />
            <span>Hall of Champions</span>
          </div>

          <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase">
            OUR PAST EVENT <span className="gold-gradient-text">WINNERS</span>
          </h2>
          <p className="font-barlow text-gray-400 text-base sm:text-lg mt-3 uppercase tracking-wider">
            Honoring the true Beasts who pushed past their limits and claimed victory at our previous challenges
          </p>
        </div>

        {/* Winners Gallery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {WINNER_GALLERY.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="group bg-dark-gray border border-white/10 rounded-2xl overflow-hidden hover:border-gold-premium/50 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col justify-between"
            >
              {/* Image Container with Hover Effects */}
              <div
                onClick={() => setSelectedWinner(item)}
                className="relative h-64 sm:h-72 w-full overflow-hidden cursor-pointer"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

                {/* Location Badge */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-gold-premium/30 px-3 py-1 rounded text-gold-premium font-barlow text-xs font-bold uppercase tracking-wider">
                  {item.location}
                </div>

                {/* Zoom Icon Button */}
                <button
                  type="button"
                  className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/70 border border-white/20 text-white group-hover:text-gold-premium group-hover:border-gold-premium transition-all duration-300"
                  aria-label="Enlarge winner photo"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Card Details */}
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-barlow font-bold uppercase tracking-widest text-gold-premium block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-bebas text-2xl text-white uppercase tracking-wide group-hover:text-gold-premium transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-inter text-gray-400 text-xs mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-barlow text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-premium" /> Beast Hunter Podium
                  </span>
                  <button
                    onClick={() => setSelectedWinner(item)}
                    className="text-xs font-barlow font-bold text-gold-premium hover:text-gold-glow uppercase tracking-wider flex items-center space-x-1"
                  >
                    <span>View Image</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* High-Res Lightbox Modal */}
      <AnimatePresence>
        {selectedWinner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedWinner(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full bg-dark-gray border border-gold-premium/40 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.2)]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedWinner(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/80 text-white hover:text-gold-premium border border-white/20 transition-all active:scale-95"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative w-full h-[50vh] sm:h-[70vh]">
                <Image
                  src={selectedWinner.image}
                  alt={selectedWinner.title}
                  fill
                  className="object-contain bg-black"
                  priority
                />
              </div>

              <div className="p-6 bg-black border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gold-premium font-bold block">
                    {selectedWinner.location} • {selectedWinner.category}
                  </span>
                  <h4 className="font-bebas text-2xl text-white uppercase tracking-wide mt-0.5">
                    {selectedWinner.title}
                  </h4>
                </div>
                <p className="text-xs font-barlow text-gray-400 uppercase tracking-wider max-w-md">
                  {selectedWinner.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
