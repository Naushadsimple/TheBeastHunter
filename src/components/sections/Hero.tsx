'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax scroll effect using GSAP
    if (containerRef.current && imageRef.current) {
      gsap.to(imageRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, []);

  const scrollToEvents = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('events-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black py-20"
    >
      {/* Background Image Container with Parallax */}
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%] z-0"
      >
        <Image
          src="/hero-bg.png"
          alt="Athlete sprinting"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45 brightness-75 scale-105"
        />
        {/* Dark radial glow overlay for depth */}
        <div className="absolute inset-0 bg-radial-gradient bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-deep-black/60 to-deep-black z-10" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-deep-black to-transparent z-10" />
      </div>

      {/* Floating Sparkles / Particles for brand wow-factor */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-gold-premium rounded-full blur-[2px] animate-pulse" />
        <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-gold-glow rounded-full blur-[3px] animate-pulse duration-1000" />
        <div className="absolute top-3/4 left-1/3 w-1.5 h-1.5 bg-gold-premium rounded-full blur-[1px] animate-pulse duration-700" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-gold-premium/10 border border-gold-premium/30 px-4 py-2 rounded-full mb-8"
        >
          <Flame className="w-4 h-4 text-gold-premium animate-pulse" />
          <span className="font-barlow text-xs sm:text-sm font-bold uppercase tracking-widest text-gold-glow">
            Season 2026 Registration Open
          </span>
        </motion.div>

        {/* Big Athletic Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-bebas text-5xl sm:text-7xl md:text-9xl leading-none tracking-wider text-white mb-6 uppercase"
        >
          UNLEASH THE <span className="gold-gradient-text">BEAST</span>
          <br />
          WITHIN YOU
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-barlow text-lg sm:text-2xl text-gray-300 max-w-3xl mb-12 tracking-wide font-light leading-relaxed"
        >
          Push past comfort. Shatter your limits. Join India's elite racing platform hosting high-octane obstacle runs, half-marathons, and endurance challenges.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md sm:max-w-none"
        >
          <a
            href="#events-section"
            onClick={scrollToEvents}
            className="gold-gradient-bg text-black font-barlow text-lg font-black uppercase tracking-wider px-8 py-4 rounded border border-transparent hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,208,96,0.6)] flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <span>Explore Races</span>
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            href="/about"
            className="bg-transparent border border-white/20 hover:border-gold-premium text-white font-barlow text-lg font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-white/5 active:scale-95 transition-all duration-300 w-full sm:w-auto flex items-center justify-center"
          >
            Our Philosophy
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
