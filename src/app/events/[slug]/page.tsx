import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RealtimeSpots from "@/components/events/RealtimeSpots";
import { createClient } from "@/lib/supabase/server";
import {
  Calendar,
  MapPin,
  Route,
  Trophy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Award,
  Flame,
  Dumbbell,
  Bike,
  Timer,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DBEvent } from "@/components/sections/UpcomingRaces";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 5; // Low revalidate for detail spots updates

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
            src={event.banner_url || '/images/events/audition_options.jpg'}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-black via-transparent to-transparent" />

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
            
            {/* Left Column: Detailed Event Infographics & Description */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Event Description */}
              <div className="space-y-4">
                <h3 className="font-bebas text-3xl text-white tracking-wide uppercase border-b border-gold-premium/20 pb-2 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-gold-premium" /> Challenge Overview
                </h3>
                <p className="font-inter text-gray-300 text-base sm:text-lg leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* SECTION 1: AUDITION ACTIVITIES INFOGRAPHIC & TABLE */}
              <div className="space-y-6 bg-gradient-to-br from-dark-gray/60 via-black to-dark-gray/40 border border-gold-premium/30 rounded-2xl p-6 sm:p-8">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-gold-premium font-barlow text-xs font-bold uppercase tracking-widest block mb-1">
                    Phase 1 Breakdown
                  </span>
                  <h3 className="font-bebas text-3xl text-white tracking-wide uppercase flex items-center gap-2">
                    <Award className="w-7 h-7 text-gold-premium" /> Audition Activities & Rules
                  </h3>
                  <p className="text-xs font-barlow text-gray-400 uppercase tracking-wider mt-1">
                    You can choose ANY ONE option for the audition as per your strength (500 Total Contestants → 100 Final Contestants)
                  </p>
                </div>

                {/* Audition Activity Table */}
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-left font-barlow text-sm">
                    <thead className="bg-black/60 text-gold-premium font-bebas text-lg tracking-wider border-b border-white/10">
                      <tr>
                        <th className="px-5 py-3">Audition Option</th>
                        <th className="px-5 py-3 text-center">Contestants</th>
                        <th className="px-5 py-3 text-center">Final Contestants</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {[
                        { option: 'Running', count: 100, final: 20 },
                        { option: 'Cycling', count: 100, final: 20 },
                        { option: 'Weight Lifting', count: 100, final: 20 },
                        { option: 'Dumbbell Holding', count: 100, final: 20 },
                        { option: 'Plank', count: 100, final: 20 },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white uppercase">{row.option}</td>
                          <td className="px-5 py-3.5 text-center font-mono">{row.count}</td>
                          <td className="px-5 py-3.5 text-center font-mono font-bold text-gold-premium">{row.final}</td>
                        </tr>
                      ))}
                      <tr className="bg-gold-premium/10 font-bold text-white font-bebas text-lg tracking-wider border-t-2 border-gold-premium/40">
                        <td className="px-5 py-4 uppercase">Total</td>
                        <td className="px-5 py-4 text-center font-mono">500</td>
                        <td className="px-5 py-4 text-center font-mono text-gold-premium text-xl">100</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Reference Infographic Image Display 1 */}
                <div className="relative w-full h-[220px] sm:h-[350px] rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/images/events/audition_activities.jpg"
                    alt="Audition Activities Chart"
                    fill
                    className="object-contain bg-black"
                  />
                </div>
              </div>

              {/* SECTION 2: AUDITION STRENGTH OPTIONS GRAPHICS */}
              <div className="space-y-6 bg-gradient-to-br from-dark-gray/60 via-black to-dark-gray/40 border border-gold-premium/30 rounded-2xl p-6 sm:p-8">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-gold-premium font-barlow text-xs font-bold uppercase tracking-widest block mb-1">
                    Disciplines
                  </span>
                  <h3 className="font-bebas text-3xl text-white tracking-wide uppercase flex items-center gap-2">
                    <Layers className="w-7 h-7 text-gold-premium" /> Choose Any 1 Audition Option
                  </h3>
                </div>

                {/* 5 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Running', icon: Flame, badge: 'Cardio & Speed' },
                    { title: 'Cycling', icon: Bike, badge: 'Leg Endurance' },
                    { title: 'Weight Lifting', icon: Dumbbell, badge: 'Explosive Power' },
                    { title: 'Dumbbell Holding', icon: Zap, badge: 'Grip Strength' },
                    { title: 'Plank', icon: Timer, badge: 'Core Stability' },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-black/40 border border-white/10 rounded-xl hover:border-gold-premium/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-lg bg-gold-premium/10 border border-gold-premium/20 text-gold-premium">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-barlow uppercase font-bold text-gray-400 bg-white/5 px-2 py-0.5 rounded">
                            {item.badge}
                          </span>
                        </div>
                        <h4 className="font-bebas text-xl text-white uppercase group-hover:text-gold-premium transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs font-barlow text-gray-400 uppercase mt-1">100 Candidates → 20 Qualify</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reference Infographic Image Display 2 */}
                <div className="relative w-full h-[220px] sm:h-[350px] rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/images/events/audition_options.jpg"
                    alt="Audition Options Showcase"
                    fill
                    className="object-contain bg-black"
                  />
                </div>
              </div>

              {/* SECTION 3: TOP 100 KNOCKOUT STAGE CHALLENGES */}
              <div className="space-y-6 bg-gradient-to-br from-dark-gray/60 via-black to-dark-gray/40 border border-gold-premium/30 rounded-2xl p-6 sm:p-8">
                <div className="border-b border-white/10 pb-4">
                  <span className="text-gold-premium font-barlow text-xs font-bold uppercase tracking-widest block mb-1">
                    Phase 2 Final Elimination
                  </span>
                  <h3 className="font-bebas text-3xl text-white tracking-wide uppercase flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-gold-premium" /> Challenges For Top 100
                  </h3>
                  <p className="text-xs font-barlow text-gray-400 uppercase tracking-wider mt-1">
                    The top 100 qualified contestants compete in 5 brutal elimination stages down to 3 final champions!
                  </p>
                </div>

                {/* Top 100 Challenges Table & Cards */}
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-left font-barlow text-sm">
                    <thead className="bg-black/60 text-gold-premium font-bebas text-lg tracking-wider border-b border-white/10">
                      <tr>
                        <th className="px-5 py-3">Stage & Challenge Name</th>
                        <th className="px-5 py-3 text-center">Contestants</th>
                        <th className="px-5 py-3 text-center">Final Qualifiers</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {[
                        { name: 'Beast Grip (Hanging Challenge)', count: 100, final: 50 },
                        { name: 'The Beast Burden (Sack Holding)', count: 50, final: 25 },
                        { name: 'Beast Rope (Rope Hanging)', count: 25, final: 10 },
                        { name: 'Pass & Pass (Running Challenge)', count: 10, final: 5 },
                        { name: 'Beast Arena (Ultimate Showdown)', count: 5, final: 3 },
                      ].map((stg, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-white uppercase">{stg.name}</td>
                          <td className="px-5 py-3.5 text-center font-mono">{stg.count}</td>
                          <td className="px-5 py-3.5 text-center font-mono font-bold text-gold-premium">{stg.final}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reference Infographic Image Display 3 */}
                <div className="relative w-full h-[220px] sm:h-[350px] rounded-xl overflow-hidden border border-white/10">
                  <Image
                    src="/images/events/top_100_challenges.jpg"
                    alt="Top 100 Knockout Challenges"
                    fill
                    className="object-contain bg-black"
                  />
                </div>
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
                      <span className="font-barlow text-xs font-bold uppercase text-gold-premium tracking-widest block mb-1">1st Place Champion</span>
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
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold block mb-1">Audition Pass Price</span>
                  <div className="flex items-baseline space-x-1 text-white">
                    <span className="font-bebas text-5xl tracking-wide">₹{event.ticket_price}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gold-premium" />
                    <span>Includes Choice of 1 Audition Discipline</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gold-premium" />
                    <span>Includes Official Beast Hunter Bib & Finisher Tee</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-gold-premium" />
                    <span>Top 20 from each category advance to Top 100 Knockout</span>
                  </div>
                </div>

                <Link
                  href={`/events/${event.slug}/register`}
                  className="block text-center gold-gradient-bg text-black font-barlow text-lg font-black uppercase tracking-wider py-4 rounded border border-transparent hover:scale-[1.02] active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,208,96,0.5)]"
                >
                  Register For Audition
                </Link>

                <p className="text-[10px] text-center text-gray-500 uppercase tracking-wider leading-relaxed">
                  Secured Razorpay Payment. Instant confirmation & official bib generated.
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
