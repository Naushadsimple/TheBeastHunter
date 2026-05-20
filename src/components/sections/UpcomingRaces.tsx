'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Route, Trophy, Users } from 'lucide-react';

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
  registration_count?: number; // Added from registration counts join
}

interface UpcomingRacesProps {
  events: DBEvent[];
}

export default function UpcomingRaces({ events }: UpcomingRacesProps) {
  // Beautiful fallback mock events in case database is empty
  const mockEvents: DBEvent[] = [
    {
      id: 'd1111111-1111-4111-a111-111111111111',
      title: 'Beast Mud Run 2026',
      slug: 'beast-mud-run-2026',
      short_description: 'India\'s largest obstacle mud run with 25+ military-grade obstacles, fire jumps, and giant slides.',
      banner_url: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=800',
      event_date: '2026-10-15T06:00:00Z',
      distance_km: 10,
      difficulty: 'intermediate',
      ticket_price: 1999,
      max_participants: 2500,
      registration_count: 1840,
    },
    {
      id: 'd2222222-2222-4222-a222-222222222222',
      title: 'Night Beast Half Marathon',
      slug: 'night-beast-half-marathon',
      short_description: 'An electric neon night half marathon through the heart of Delhi. Fully lit course with live music stations.',
      banner_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
      event_date: '2026-11-20T18:00:00Z',
      distance_km: 21,
      difficulty: 'advanced',
      ticket_price: 2499,
      max_participants: 1500,
      registration_count: 920,
    },
    {
      id: 'd3333333-3333-4333-a333-333333333333',
      title: 'The Elite Alpha Challenge',
      slug: 'elite-alpha-challenge',
      short_description: 'A brutal 15KM endurance trial on mountain trails. Strictly for advanced endurance athletes.',
      banner_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=800',
      event_date: '2026-12-05T05:30:00Z',
      distance_km: 15,
      difficulty: 'elite',
      ticket_price: 3499,
      max_participants: 500,
      registration_count: 480,
    },
  ];

  const activeEvents = events && events.length > 0 ? events : mockEvents;

  const difficultyColors = {
    beginner: 'border-green-500/30 text-green-400 bg-green-500/5',
    intermediate: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    advanced: 'border-gold-premium/30 text-gold-glow bg-gold-premium/5',
    elite: 'border-red-500/30 text-red-400 bg-red-500/5',
  };

  return (
    <section id="events-section" className="py-24 bg-deep-black border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-3">
              Upcoming Challenges
            </span>
            <h2 className="font-bebas text-4xl sm:text-6xl text-white tracking-wider uppercase">
              CHOOSE YOUR <span className="gold-gradient-text">BATTLE</span>
            </h2>
          </div>
          <Link
            href="/events"
            className="font-barlow text-lg font-bold uppercase tracking-wider text-gold-premium hover:text-gold-glow mt-4 md:mt-0 inline-flex items-center space-x-1 transition-colors duration-300"
          >
            <span>View All Challenges</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Races Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeEvents.map((race, idx) => {
            const dateObj = new Date(race.event_date);
            const formattedDate = dateObj.toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const slotsCount = race.registration_count || 0;
            const remainingSlots = Math.max(0, race.max_participants - slotsCount);
            const filledPercent = Math.min(100, Math.round((slotsCount / race.max_participants) * 100));

            return (
              <motion.div
                key={race.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group bg-dark-gray border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between hover:border-gold-premium/20 transition-all duration-300"
              >
                {/* Banner wrapper */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={race.banner_url}
                    alt={race.title}
                    fill
                    sizes="(max-w-768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Distance badge */}
                  <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-sm border border-white/10 px-3 py-1 rounded flex items-center space-x-1">
                    <Route className="w-4 h-4 text-gold-premium" />
                    <span className="font-bebas text-lg text-white tracking-wide">
                      {race.distance_km} KM
                    </span>
                  </div>

                  {/* Difficulty Badge */}
                  <div className={`absolute top-4 right-4 border px-3 py-1 rounded uppercase font-barlow text-xs font-bold tracking-wider ${difficultyColors[race.difficulty]}`}>
                    {race.difficulty}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-barlow text-2xl font-extrabold uppercase text-white tracking-wide group-hover:text-gold-premium transition-colors duration-300 mb-3">
                      {race.title}
                    </h3>
                    <p className="font-inter text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                      {race.short_description}
                    </p>

                    {/* Stats Icons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-gold-premium" />
                        <span className="font-barlow text-sm uppercase tracking-wide">{formattedDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-gold-premium" />
                        <span className="font-barlow text-sm uppercase tracking-wide truncate">India</span>
                      </div>
                    </div>
                  </div>

                  {/* Slots Tracker */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-gold-premium" />
                        <span>{remainingSlots} Slots Left</span>
                      </span>
                      <span>{filledPercent}% Filled</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full gold-gradient-bg transition-all duration-500"
                        style={{ width: `${filledPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Pricing and Link */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block">Entry Fee</span>
                      <span className="font-bebas text-2xl text-white tracking-wide">
                        ₹{race.ticket_price}
                      </span>
                    </div>
                    <Link
                      href={`/events/${race.slug}`}
                      className="gold-gradient-bg text-black font-barlow font-black text-sm uppercase tracking-wider px-5 py-2.5 rounded hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_12px_rgba(245,208,96,0.4)]"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
