'use client';

import { motion } from 'framer-motion';
import { Award, Zap, Trophy, Heart } from 'lucide-react';

export default function AboutUs() {
  const stats = [
    { value: '50K+', label: 'Athletes Registered', icon: Zap },
    { value: '25+', label: 'Extreme Races Hosted', icon: Trophy },
    { value: '₹10M+', label: 'Prize Money Pool', icon: Award },
    { value: '98%', label: 'Completion Rate', icon: Heart },
  ];

  const cards = [
    {
      title: 'Ultimate Endurance',
      description: 'Our tracks are custom-designed by military obstacle coaches to challenge your physical endurance, cardiovascular limits, and raw strength.',
    },
    {
      title: 'Safety First Elite',
      description: 'With real-time medical support stations, GPS tracking chips, and certified trainers, we guarantee premium international standard safety protocols.',
    },
    {
      title: 'Hunter Community',
      description: 'Finish together. Join thousands of dedicated fitness enthusiasts. Support fellow racers and share the victory across our social networks.',
    },
  ];

  return (
    <section className="relative py-24 bg-deep-black overflow-hidden border-t border-white/5">
      {/* Decorative radial gradients for luxury feel */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Text block */}
          <div>
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-3">
              Who We Are
            </span>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase mb-6 leading-tight">
              BEYOND RUNNING.<br />
              THIS IS <span className="gold-gradient-text">PURE GRIT</span>.
            </h2>
            <p className="font-inter text-gray-300 text-lg leading-relaxed mb-6">
              The Beast Hunter is India's leading endurance event organization. We believe that comfort is the enemy of progress. Our mission is to take you out of your comfort zone and throw you into intense, soul-searching challenges that transform you.
            </p>
            <p className="font-inter text-gray-400 text-base leading-relaxed">
              Whether you are an elite athlete aiming for the podium or a beginner ready to run your first 5K obstacle challenge, our events are designed to be inclusive yet uncompromisingly challenging.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-dark-gray border border-white/5 p-6 rounded-lg text-center gold-border-glow"
                >
                  <div className="w-12 h-12 rounded bg-gold-premium/10 flex items-center justify-center mx-auto mb-4 border border-gold-premium/20">
                    <Icon className="w-6 h-6 text-gold-premium" />
                  </div>
                  <h3 className="font-bebas text-3xl sm:text-5xl text-white tracking-wide">
                    {stat.value}
                  </h3>
                  <p className="font-barlow text-sm font-semibold uppercase tracking-wider text-gray-400 mt-1">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Pillars Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="bg-dark-gray/60 border border-white/5 hover:border-gold-premium/30 p-8 rounded-lg transition-all duration-300"
            >
              <div className="font-bebas text-5xl text-gold-premium/10 mb-4 font-bold select-none">
                0{idx + 1}
              </div>
              <h4 className="font-barlow text-xl font-bold uppercase text-white tracking-wider mb-4">
                {card.title}
              </h4>
              <p className="font-inter text-gray-400 text-sm leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
