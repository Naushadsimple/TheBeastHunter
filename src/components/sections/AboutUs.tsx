'use client';

import { motion } from 'framer-motion';
import { Zap, Trophy, MapPin, Heart } from 'lucide-react';

export default function AboutUs() {
  const stats = [
    { value: '100+', label: 'Athletes Registered', icon: Zap },
    { value: '15+', label: 'Challenges Hosted', icon: Trophy },
    { value: 'No. 1', label: "Mumbai's Challenge Events", icon: MapPin },
    { value: '98%', label: 'Completion Rate', icon: Heart },
  ];

  const cards = [
    {
      title: 'Built for Mumbai',
      description:
        'From coastal trails to urban obstacle courses — we design challenges that reflect the energy, grit, and spirit of Mumbai athletes.',
    },
    {
      title: 'Safety on Course',
      description:
        'Medical teams, hydration stations, and trained volunteers on every route. We push limits — never at the cost of basic safety standards.',
    },
    {
      title: 'The Hunter Pack',
      description:
        'Join a community of runners and obstacle racers who show up, suffer together, and celebrate every finish line like a victory.',
    },
  ];

  return (
    <section className="relative py-24 bg-deep-black overflow-hidden border-t border-white/5">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-3">
              Who We Are
            </span>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase mb-6 leading-tight">
              MUMBAI&apos;S HOME FOR
              <br />
              <span className="gold-gradient-text">EXTREME CHALLENGES</span>
            </h2>
            <p className="font-inter text-gray-300 text-lg leading-relaxed mb-6">
              The Beast Hunter creates premium obstacle runs, night marathons, and endurance
              events across Mumbai. We are not a casual fun run — we build courses that test
              courage, stamina, and mental toughness.
            </p>
            <p className="font-inter text-gray-400 text-base leading-relaxed">
              Whether it is your first 5K challenge or your tenth beast mode event, every race is
              designed to feel cinematic, competitive, and unforgettable.
            </p>
          </div>

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
                  <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide leading-none">
                    {stat.value}
                  </h3>
                  <p className="font-barlow text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400 mt-2">
                    {stat.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

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
              <p className="font-inter text-gray-400 text-sm leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
