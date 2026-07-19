import Link from 'next/link';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UpcomingRaces, { DBEvent } from "@/components/sections/UpcomingRaces";
import { createClient } from "@/lib/supabase/server";
import { Search } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    difficulty?: string;
    distance?: string;
  }>;
}

export const revalidate = 10; // Frequent revalidation for events list

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const searchQuery = params.search || '';
  const difficultyQuery = params.difficulty || '';
  const distanceQuery = params.distance || '';

  let events: DBEvent[] = [];
  let isFiltered = !!(searchQuery || difficultyQuery || distanceQuery);

  try {
    const supabase = await createClient();

    // Query events with basic selection
    let query = supabase
      .from('events')
      .select(`
        id,
        title,
        slug,
        short_description,
        banner_url,
        event_date,
        distance_km,
        difficulty,
        ticket_price,
        max_participants,
        status,
        displayed_slot_count
      `)
      .order('event_date', { ascending: true });

    // Apply difficulty filter
    if (difficultyQuery && difficultyQuery !== 'all') {
      query = query.eq('difficulty', difficultyQuery);
    }

    // Apply text search
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data: dbEvents, error } = await query;

    if (!error && dbEvents) {
      events = dbEvents.map((event) => ({
        ...event,
        registration_count: event.displayed_slot_count || 0,
        distance_km: Number(event.distance_km),
      })) as DBEvent[];

      if (distanceQuery && distanceQuery !== 'all') {
        if (distanceQuery === 'short') {
          events = events.filter(e => e.distance_km <= 5);
        } else if (distanceQuery === 'medium') {
          events = events.filter(e => e.distance_km > 5 && e.distance_km <= 15);
        } else if (distanceQuery === 'long') {
          events = events.filter(e => e.distance_km > 15);
        }
      }
    }
  } catch (err) {
    console.error('Error fetching events list:', err);
  }

  const defaultAuditionEvent: DBEvent = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'The Beast Hunter Audition & Ultimate Challenge 2026',
    slug: 'beast-hunter-audition-2026',
    short_description: 'Choose your audition strength: Running, Cycling, Weight Lifting, Dumbbell Holding, or Plank. Top 100 move to the brutal Final Obstacle Knockout!',
    banner_url: '/images/events/audition_options.jpg',
    event_date: '2026-11-15T06:00:00Z',
    distance_km: 10,
    difficulty: 'intermediate',
    ticket_price: 999,
    max_participants: 500,
    registration_count: 0,
  };

  const displayEvents = events.length > 0 ? events : [defaultAuditionEvent];

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-16 bg-deep-black">
        {/* Banner Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="border border-gold-premium/15 bg-dark-gray/30 p-8 sm:p-12 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold-premium/5 rounded-full blur-[100px] pointer-events-none" />
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-2">
              Official Hunter Auditions
            </span>
            <h1 className="font-bebas text-4xl sm:text-6xl text-white tracking-wide uppercase">
              RACES & <span className="gold-gradient-text">AUDITION CHALLENGES</span>
            </h1>
            <p className="font-barlow text-base sm:text-lg text-gray-400 mt-2 max-w-xl uppercase tracking-wider">
              Select your audition discipline. Register, train, and dominate the arena.
            </p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <form method="GET" className="bg-dark-gray/40 border border-white/5 p-4 rounded-lg flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search events by title..."
                className="bg-black/40 border border-white/10 text-sm text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full font-barlow uppercase tracking-wider"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-48">
                <select
                  name="difficulty"
                  defaultValue={difficultyQuery}
                  className="bg-black/40 border border-white/10 text-sm text-gray-300 px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full font-barlow uppercase tracking-wider appearance-none cursor-pointer"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="elite">Elite</option>
                </select>
              </div>

              <div className="relative flex-1 sm:w-48">
                <select
                  name="distance"
                  defaultValue={distanceQuery}
                  className="bg-black/40 border border-white/10 text-sm text-gray-300 px-4 py-3 rounded focus:outline-none focus:border-gold-premium w-full font-barlow uppercase tracking-wider appearance-none cursor-pointer"
                >
                  <option value="all">All Distances</option>
                  <option value="short">Short (&le; 5 KM)</option>
                  <option value="medium">Medium (6 - 15 KM)</option>
                  <option value="long">Long (&gt; 15 KM)</option>
                </select>
              </div>

              <button
                type="submit"
                className="gold-gradient-bg text-black font-barlow font-bold uppercase text-sm tracking-wider px-6 py-3 rounded hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
              >
                Apply
              </button>
              
              {isFiltered && (
                <Link
                  href="/events"
                  className="bg-transparent border border-white/10 hover:border-red-400 text-red-400 font-barlow text-sm uppercase tracking-wider px-6 py-3 rounded hover:bg-white/5 transition-all duration-300 text-center flex items-center justify-center"
                >
                  Clear
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Display Races */}
        <UpcomingRaces events={displayEvents} />
      </main>
      <Footer />
    </>
  );
}
