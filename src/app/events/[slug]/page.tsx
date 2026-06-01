import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RealtimeSpots from "@/components/events/RealtimeSpots";
import { createClient } from "@/lib/supabase/server";
import { Calendar, MapPin, Route, Trophy, Clock, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { DBEvent } from "@/components/sections/UpcomingRaces";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 5; // Low revalidate for detail spots updates

// Interface extending DBEvent to hold detailed fields
interface DetailedEvent extends DBEvent {
  description: string;
  venue: string;
  google_maps_url: string;
  rules: string;
  eligibility: string;
  schedule: Array<{ time: string; activity: string }>;
  faq: Array<{ question: string; answer: string }>;
  prize_pool: { first?: number; second?: number; third?: number; total?: string };
}

export default async function EventDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  let event: DetailedEvent | null = null;
  let registrationCount = 0;

  try {
    const supabase = await createClient();

    // Fetch event from database
    const { data: dbEvent, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && dbEvent) {
      registrationCount = dbEvent.displayed_slot_count || 0;
      
      // Parse JSON fields safely
      const parsedSchedule = typeof dbEvent.schedule === 'string' ? JSON.parse(dbEvent.schedule) : dbEvent.schedule;
      const parsedFaq = typeof dbEvent.faq === 'string' ? JSON.parse(dbEvent.faq) : dbEvent.faq;
      const parsedPrizePool = typeof dbEvent.prize_pool === 'string' ? JSON.parse(dbEvent.prize_pool) : dbEvent.prize_pool;

      event = {
        ...dbEvent,
        distance_km: Number(dbEvent.distance_km),
        registration_count: registrationCount,
        schedule: parsedSchedule || [],
        faq: parsedFaq || [],
        prize_pool: parsedPrizePool || {},
      } as DetailedEvent;
    }
  } catch (err) {
    console.error('Error fetching event details:', err);
  }

  // Beautiful fallback mock events if not found in database (enabling fully working demo)
  // No mock fallback — all events are served from the database

  // If still not found, return 404
  if (!event) {
    notFound();
  }

  const difficultyColors = {
    beginner: 'border-green-500/30 text-green-400 bg-green-500/5',
    intermediate: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    advanced: 'border-gold-premium/30 text-gold-glow bg-gold-premium/5',
    elite: 'border-red-500/30 text-red-400 bg-red-500/5',
  };

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(event.event_date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <>
      <Navbar />
      <main className="flex-grow bg-deep-black pb-24">
        {/* Parallax Hero Banner */}
        <div className="relative h-[45vh] sm:h-[60vh] w-full overflow-hidden flex items-end">
          <Image
            src={event.banner_url}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-50"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-transparent to-transparent" />

          {/* Heading Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8 z-10">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1 rounded font-bebas text-lg tracking-wide text-white flex items-center space-x-1">
                <Route className="w-4 h-4 text-gold-premium" />
                <span>{event.distance_km} KM</span>
              </span>
              <span className={`border px-3 py-1 rounded font-barlow text-xs font-bold uppercase tracking-wider ${difficultyColors[event.difficulty]}`}>
                {event.difficulty}
              </span>
            </div>
            <h1 className="font-bebas text-4xl sm:text-6xl md:text-7xl text-white tracking-wide uppercase leading-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Event Description */}
              <div className="space-y-4">
                <h3 className="font-bebas text-3xl text-white tracking-wide uppercase border-b border-gold-premium/20 pb-2">
                  Challenge Overview
                </h3>
                <p className="font-inter text-gray-300 text-base sm:text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Event Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-dark-gray/30 border border-white/5 p-6 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gold-premium/10 border border-gold-premium/25 rounded">
                    <Calendar className="w-6 h-6 text-gold-premium" />
                  </div>
                  <div>
                    <h5 className="font-barlow text-sm font-bold uppercase text-gray-400 tracking-wider">Date & Time</h5>
                    <p className="font-inter text-white text-base mt-1 font-semibold">{formattedDate}</p>
                    <p className="font-inter text-gray-400 text-sm mt-0.5">Flag-off at {formattedTime}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gold-premium/10 border border-gold-premium/25 rounded">
                    <MapPin className="w-6 h-6 text-gold-premium" />
                  </div>
                  <div>
                    <h5 className="font-barlow text-sm font-bold uppercase text-gray-400 tracking-wider">Venue Location</h5>
                    <p className="font-inter text-white text-base mt-1 font-semibold">{event.venue}</p>
                    <a
                      href={event.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-barlow text-sm font-semibold text-gold-premium hover:text-gold-glow uppercase tracking-wider mt-1.5 inline-block"
                    >
                      View on Google Maps &rarr;
                    </a>
                  </div>
                </div>
              </div>

              {/* Prize Pool */}
              {event.prize_pool && (event.prize_pool.total || event.prize_pool.first) && (
                <div className="space-y-4">
                  <h3 className="font-bebas text-3xl text-white tracking-wide uppercase border-b border-gold-premium/20 pb-2">
                    Prize Pool
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-dark-gray border border-gold-premium/25 p-6 rounded-lg text-center relative overflow-hidden">
                      <Trophy className="w-12 h-12 text-gold-premium mx-auto mb-2 opacity-20 absolute -right-2 -bottom-2" />
                      <span className="font-barlow text-xs font-bold uppercase text-gold-premium tracking-widest block mb-1">1st Place</span>
                      <span className="font-bebas text-3xl text-white tracking-wide">₹{event.prize_pool.first?.toLocaleString('en-IN')}</span>
                    </div>
                    {event.prize_pool.second && (
                      <div className="bg-dark-gray/60 border border-white/5 p-6 rounded-lg text-center">
                        <span className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest block mb-1">2nd Place</span>
                        <span className="font-bebas text-2xl text-white tracking-wide">₹{event.prize_pool.second?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {event.prize_pool.third && (
                      <div className="bg-dark-gray/60 border border-white/5 p-6 rounded-lg text-center">
                        <span className="font-barlow text-xs font-bold uppercase text-gray-400 tracking-widest block mb-1">3rd Place</span>
                        <span className="font-bebas text-2xl text-white tracking-wide">₹{event.prize_pool.third?.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Schedule */}
              {event.schedule && event.schedule.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bebas text-3xl text-white tracking-wide uppercase border-b border-gold-premium/20 pb-2">
                    Event Schedule
                  </h3>
                  <div className="border border-white/5 rounded-lg overflow-hidden bg-dark-gray/20">
                    {event.schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-6 px-6 py-4 ${
                          idx % 2 === 0 ? 'bg-dark-gray/30' : 'bg-transparent'
                        } border-b border-white/5 last:border-b-0`}
                      >
                        <div className="flex items-center space-x-2 w-32 shrink-0">
                          <Clock className="w-4 h-4 text-gold-premium" />
                          <span className="font-barlow text-sm font-bold uppercase tracking-wider text-white">
                            {item.time}
                          </span>
                        </div>
                        <span className="font-inter text-gray-300 text-sm">
                          {item.activity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules & Eligibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {event.rules && (
                  <div className="space-y-4">
                    <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-gold-premium" />
                      <span>Event Rules</span>
                    </h4>
                    <div className="font-inter text-gray-400 text-sm leading-relaxed whitespace-pre-line space-y-2 pl-7">
                      {event.rules}
                    </div>
                  </div>
                )}

                {event.eligibility && (
                  <div className="space-y-4">
                    <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-gold-premium" />
                      <span>Eligibility Criteria</span>
                    </h4>
                    <div className="font-inter text-gray-400 text-sm leading-relaxed whitespace-pre-line space-y-2 pl-7">
                      {event.eligibility}
                    </div>
                  </div>
                )}
              </div>

              {/* FAQs Accordion */}
              {event.faq && event.faq.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bebas text-3xl text-white tracking-wide uppercase border-b border-gold-premium/20 pb-2">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {event.faq.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-dark-gray/30 border border-white/5 p-6 rounded-lg space-y-2"
                      >
                        <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider flex items-start space-x-2">
                          <HelpCircle className="w-5 h-5 text-gold-premium shrink-0 mt-0.5" />
                          <span>{item.question}</span>
                        </h4>
                        <p className="font-inter text-gray-400 text-sm leading-relaxed pl-7">
                          {item.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Checkout Card */}
            <div className="space-y-6 lg:sticky lg:top-24 h-fit">
              {/* Realtime Spots Component */}
              <RealtimeSpots
                eventId={event.id}
                maxParticipants={event.max_participants}
                initialCount={registrationCount}
              />

              {/* Booking Card */}
              <div className="bg-dark-gray border border-gold-premium/20 p-6 rounded-lg space-y-6 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                <div>
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Pass Price</span>
                  <div className="flex items-baseline space-x-1 text-white">
                    <span className="font-bebas text-5xl tracking-wide">₹{event.ticket_price}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gold-premium" />
                    <span>Includes Finisher Medal & Certificate</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gold-premium" />
                    <span>Includes Premium dri-fit Finisher Tee</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gold-premium" />
                    <span>Includes Food & Beverage Coupons</span>
                  </div>
                </div>

                <Link
                  href={`/events/${event.slug}/register`}
                  className="block text-center gold-gradient-bg text-black font-barlow text-lg font-black uppercase tracking-wider py-4 rounded border border-transparent hover:scale-[1.02] active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,208,96,0.5)]"
                >
                  Register Now
                </Link>

                <p className="text-[10px] text-center text-gray-500 uppercase tracking-wider leading-relaxed">
                  Secured transaction. Cancellations and refunds are subject to our terms of service.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
