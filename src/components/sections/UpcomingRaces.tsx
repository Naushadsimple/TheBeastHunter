'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  Bike,
  Timer,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface DBEvent {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  banner_url: string;
  event_date: string;
  distance_km: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  ticket_price: number;
  max_participants: number;
  registration_count?: number;
  displayed_slot_count?: number;
  venue?: string;
  location_badge?: string;
}

interface UpcomingRacesProps {
  events: DBEvent[];
}

const AUDITION_SLIDES = [
  {
    id: 'running',
    title: 'Running Audition',
    tagline: '100 Contestants → Top 20 Finalists',
    description: 'Test your raw speed and aerobic endurance on the track. Only 20 top runners qualify for the Top 100 Knockout Arena.',
    icon: Flame,
    color: 'from-amber-500 to-red-600',
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'cycling',
    title: 'Cycling Audition',
    tagline: '100 Contestants → Top 20 Finalists',
    description: 'High-intensity resistance cycling trials. Power through leg burnout to claim 1 of 20 finalist spots.',
    icon: Bike,
    color: 'from-blue-500 to-cyan-600',
    image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'lifting',
    title: 'Weight Holding Audition',
    tagline: '100 Contestants → Top 20 Finalists',
    description: 'Explosive barbell lifts and max rep trials. Demonstrate maximum muscular strength under heavy load.',
    icon: Dumbbell,
    color: 'from-purple-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'dumbbell',
    title: 'Dumbbell Holding Audition',
    tagline: '100 Contestants → Top 20 Finalists',
    description: 'Isometric shoulder & arm hold challenge. Static grip endurance test to outlast rival contestants.',
    icon: Zap,
    color: 'from-yellow-400 to-orange-500',
    image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=1000',
  },
  {
    id: 'plank',
    title: 'Plank Challenge Audition',
    tagline: '100 Contestants → Top 20 Finalists',
    description: 'Uncompromising core stability & mental fortitude. Hold strict form longer than 100 competitors.',
    icon: Timer,
    color: 'from-emerald-400 to-teal-600',
    image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&q=80&w=1000',
  },
];

export default function UpcomingRaces({ events }: UpcomingRacesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play timer for carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % AUDITION_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeEvent = events && events.length > 0 ? events[0] : null;

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % AUDITION_SLIDES.length);
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + AUDITION_SLIDES.length) % AUDITION_SLIDES.length);
  };

  return (
    <section id="events-section" className="py-24 bg-deep-black border-t border-white/5 relative overflow-hidden">
      {/* Dynamic Gold Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gold-premium/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Official 2026 Challenge Event
            </span>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase">
              THE BEAST HUNTER <span className="gold-gradient-text">AUDITION 2026</span>
            </h2>
          </div>
          {activeEvent && (
            <Link
              href={`/events/${activeEvent.slug}`}
              className="font-barlow text-lg font-bold uppercase tracking-wider text-gold-premium hover:text-gold-glow mt-4 md:mt-0 inline-flex items-center space-x-2 transition-colors duration-300"
            >
              <span>View Full Event Details</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* 3D Animated Carousel Showcase with Distinct Discipline Images */}
        <div className="mb-16">
          <div className="relative bg-gradient-to-br from-dark-gray via-black to-dark-gray border border-white/10 rounded-2xl overflow-hidden p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Info Column */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gold-premium/10 border border-gold-premium/30 text-gold-premium text-xs font-barlow font-bold uppercase tracking-wider">
                  <Trophy className="w-4 h-4" />
                  <span>Choose Your Audition Strength</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bebas text-3xl sm:text-5xl text-white uppercase tracking-wide">
                      {AUDITION_SLIDES[activeIndex].title}
                    </h3>
                    <p className="font-barlow text-gold-glow text-lg uppercase font-bold tracking-wider">
                      {AUDITION_SLIDES[activeIndex].tagline}
                    </p>
                    <p className="font-inter text-gray-400 text-sm leading-relaxed max-w-lg">
                      {AUDITION_SLIDES[activeIndex].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Audition Navigation Pills */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {AUDITION_SLIDES.map((slide, idx) => {
                    const IconComp = slide.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={slide.id}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setActiveIndex(idx);
                        }}
                        className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg border font-barlow text-xs font-bold uppercase transition-all duration-300 ${
                          isActive
                            ? 'gold-gradient-bg text-black border-gold-premium shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                            : 'bg-black/50 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span>{slide.title.replace(' Audition', '')}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View Details Link */}
                <div className="pt-4 flex items-center space-x-4">
                  {activeEvent && (
                    <Link
                      href={`/events/${activeEvent.slug}`}
                      className="gold-gradient-bg text-black font-barlow font-black text-sm uppercase tracking-widest px-8 py-4 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.4)] inline-flex items-center space-x-2"
                    >
                      <span>View Event Details & Rules</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Image Showcase with Distinct Discipline Photos & 3D Hover Effect */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                <div className="relative w-full h-[320px] sm:h-[400px] rounded-xl overflow-hidden border border-gold-premium/30 shadow-[0_0_40px_rgba(0,0,0,0.9)] group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, scale: 0.95, rotateY: 8 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 1.05, rotateY: -8 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={AUDITION_SLIDES[activeIndex].image}
                        alt={AUDITION_SLIDES[activeIndex].title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Carousel Controls Overlay */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-20">
                    <button
                      onClick={handlePrev}
                      className="p-3 rounded-full bg-black/70 border border-white/20 text-white hover:text-gold-premium hover:border-gold-premium transition-all active:scale-90"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-3 rounded-full bg-black/70 border border-white/20 text-white hover:text-gold-premium hover:border-gold-premium transition-all active:scale-90"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Homepage Event Cards List */}
        {activeEvent && (
          <div className="max-w-4xl mx-auto">
            <h3 className="font-bebas text-2xl text-white uppercase tracking-wider mb-6 text-center">
              Our Active Events
            </h3>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group bg-gradient-to-b from-dark-gray to-black border border-gold-premium/30 rounded-2xl overflow-hidden hover:border-gold-premium transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-5 relative h-64 md:h-full min-h-[260px] overflow-hidden">
                  <Image
                    src={activeEvent.banner_url || '/images/events/audition_options.jpg'}
                    alt={activeEvent.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm border border-gold-premium/40 px-3 py-1 rounded text-gold-premium font-bebas text-lg">
                    Mumbai
                  </div>
                </div>

                <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div>
                    <span className="text-xs uppercase font-barlow font-bold tracking-widest text-gold-premium block mb-2">
                      Audition & Knockout Challenge
                    </span>
                    <h4 className="font-bebas text-3xl text-white uppercase tracking-wide group-hover:text-gold-premium transition-colors">
                      {activeEvent.title}
                    </h4>
                    <p className="font-inter text-gray-400 text-sm mt-3 leading-relaxed">
                      {activeEvent.short_description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-4 font-barlow text-xs uppercase tracking-wider text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gold-premium" />
                      <span>15 Nov 2026</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gold-premium" />
                      <span>{activeEvent.venue || 'Mumbai Sports Complex'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gold-premium" />
                      <span>500 Max Participants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-gold-premium" />
                      <span>₹500,000 Prize Pool</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Audition Fee</span>
                      <span className="font-bebas text-3xl text-gold-premium">₹1500</span>
                    </div>
                    <Link
                      href={`/events/${activeEvent.slug}`}
                      className="gold-gradient-bg text-black font-barlow font-black text-sm uppercase tracking-widest px-6 py-3 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                    >
                      View Event Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
