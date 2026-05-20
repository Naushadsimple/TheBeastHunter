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
      // Fetch registrations count
      const { count } = await supabase
        .from('registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', dbEvent.id)
        .in('status', ['confirmed', 'pending']);

      registrationCount = count || 0;
      
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
  if (!event) {
    const mockEvents: Record<string, DetailedEvent> = {
      'beast-mud-run-2026': {
        id: 'mock-1',
        title: 'Beast Mud Run 2026',
        slug: 'beast-mud-run-2026',
        short_description: 'India\'s largest obstacle mud run with 25+ military-grade obstacles, fire jumps, and giant slides.',
        description: 'Prepare to face the ultimate test of camaraderie and endurance. The Beast Mud Run is not a walk in the park—it is a 10-kilometer battleground featuring 25+ military-inspired obstacles. You will climb 12-foot wooden walls, crawl through cargo nets submerged in mud, wade through ice baths, and leap over burning logs to reach the finish line. Run as an individual or register as a clan to tackle the obstacles together. Every finisher receives a premium medal, dri-fit finisher tee, and access to the post-run festival featuring hot food, chilled drinks, and live DJs.',
        banner_url: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=1200',
        event_date: '2026-10-15T06:00:00Z',
        distance_km: 10,
        difficulty: 'intermediate',
        ticket_price: 1999,
        max_participants: 2500,
        registration_count: 1840,
        venue: 'Dirt Arena, Sector 150, Noida Express Highway',
        google_maps_url: 'https://maps.google.com',
        rules: '1. All participants must wear their assigned RFID timing chip at all times.\n2. Help other runners—camaraderie is a core value of the Beast Hunter.\n3. Obey event marshals and medical personnel at all times.\n4. Skipping an obstacle results in a 2-minute penalty on timing.',
        eligibility: 'Open to all individuals aged 16 years and above. Participants under 18 must present a signed parent/guardian waiver at the bib collection counter.',
        schedule: [
          { time: '05:30 AM', activity: 'Gates Open & Bib Collection' },
          { time: '06:30 AM', activity: 'Warm-up with Elite Trainers' },
          { time: '07:00 AM', activity: 'Elite Wave Flag-off' },
          { time: '07:30 AM', activity: 'Open Wave 1 Flag-off' },
          { time: '11:00 AM', activity: 'Awards Ceremony & After-Party' }
        ],
        faq: [
          { question: 'What should I wear for the mud run?', answer: 'We recommend wearing light, moisture-wicking athletic clothing. Avoid loose cotton garments as they soak water and get extremely heavy. Tight-fitting trail shoes or trainers with good grip are highly recommended.' },
          { question: 'Is there a bag drop counter?', answer: 'Yes! A secure, manned baggage counter is available inside the race village. We recommend avoiding bringing expensive items.' },
          { question: 'Will I get pictures of my run?', answer: 'Yes! Our professional photographers are stationed across the mud zone and obstacles. High-resolution photos synced with your bib number will be sent to your registered email post-run.' }
        ],
        prize_pool: { total: '₹2,00,000', first: 100000, second: 60000, third: 40000 }
      },
      'night-beast-half-marathon': {
        id: 'mock-2',
        title: 'Night Beast Half Marathon',
        slug: 'night-beast-half-marathon',
        short_description: 'An electric neon night half marathon through the heart of Delhi. Fully lit course with live music stations.',
        description: 'Witness the capital city come alive after dark. The Night Beast Half Marathon is India\'s premier night road race. The 21.1 KM course is completely lit with dynamic LED towers, neon lasers, and interactive glow zones. Live bands, percussionists, and DJs line every kilometer of the track to keep your adrenaline pumping. Participants are equipped with LED headbands, glowing neon paint, and premium high-visibility reflective jerseys. Finish the race and celebrate at the midnight concert featuring top electronic artists.',
        banner_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200',
        event_date: '2026-11-20T18:00:00Z',
        distance_km: 21,
        difficulty: 'advanced',
        ticket_price: 2499,
        max_participants: 1500,
        registration_count: 920,
        venue: 'Jawaharlal Nehru Stadium, Gate No. 2, New Delhi',
        google_maps_url: 'https://maps.google.com',
        rules: '1. Front headlamps or LED armbands must be worn for visibility.\n2. Timing mats must be crossed at all split check-points.\n3. Littering on the road is strictly prohibited; use bin zones at water stations.\n4. Earphones are permitted but volume must allow hearing race announcements.',
        eligibility: 'Aged 18 years and above. Must have completed at least one 10K run in the last 12 months (self-declared during registration).',
        schedule: [
          { time: '05:00 PM', activity: 'Neon Body Painting & DJ Warm-up' },
          { time: '06:00 PM', activity: 'Pre-race briefing' },
          { time: '06:30 PM', activity: 'Flag-off (21.1K Wave)' },
          { time: '07:00 PM', activity: 'Flag-off (10K Wave)' },
          { time: '10:00 PM', activity: 'Midnight After-Party & Concert' }
        ],
        faq: [
          { question: 'Are there energy gels on the course?', answer: 'Yes! Energy gel and hydration stations (offering water and electrolyte drinks) are set up every 2.5 kilometers along the route.' },
          { question: 'Is the course flat or hilly?', answer: 'The course is a flat, fast loop around the tree-lined avenues of Lutyens\' Delhi, designed to help you hit your Personal Best (PB).' },
          { question: 'Can my family watch the race?', answer: 'Absolutely! The JLN Stadium race village is a family-friendly zone with food stalls, spectator seating, and giant screens showing live race updates.' }
        ],
        prize_pool: { total: '₹3,50,000', first: 175000, second: 100000, third: 75000 }
      },
      'elite-alpha-challenge': {
        id: 'mock-3',
        title: 'The Elite Alpha Challenge',
        slug: 'elite-alpha-challenge',
        short_description: 'A brutal 15KM endurance trial on mountain trails. Strictly for advanced endurance athletes.',
        description: 'Welcome to the most punishing trail run in Northern India. The Elite Alpha Challenge is a 15 KM trail race containing over 1,200 meters of vertical elevation gain. You will navigate loose rocks, steep ridges, and dense forest pathways in the Aravali hills. This event has a strict cut-off time of 3 hours. Only the strongest survive. Do you have what it takes to be crowned the Alpha?',
        banner_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=1200',
        event_date: '2026-12-05T05:30:00Z',
        distance_km: 15,
        difficulty: 'elite',
        ticket_price: 3499,
        max_participants: 500,
        registration_count: 480,
        venue: 'Aravali Hills Trail Village, Sohna, Haryana',
        google_maps_url: 'https://maps.google.com',
        rules: '1. Self-sufficient trail gear is recommended (hydration pack min 1L).\n2. Follow the marked orange flags; going off-trail results in disqualification.\n3. Cut-off time at 7.5KM checkpoint is 90 minutes.\n4. Runners must assist any athlete in medical distress and notify the nearest marshal.',
        eligibility: 'Aged 18 years and above. Proof of marathon completion or prior trail race finishes must be uploaded.',
        schedule: [
          { time: '04:30 AM', activity: 'Mandatory Gear Check' },
          { time: '05:15 AM', activity: 'Pre-race Line Up' },
          { time: '05:30 AM', activity: 'Race Start (Gun Shot)' },
          { time: '08:30 AM', activity: 'Cut-off Time / Race Close' },
          { time: '09:00 AM', activity: 'Victory Ceremony & Breakfast' }
        ],
        faq: [
          { question: 'What is mandatory gear?', answer: 'A hydration pack containing at least 1 Liter of water, a whistles for emergency, and a fully-charged mobile phone with the emergency race number saved.' },
          { question: 'How is the trail marked?', answer: 'The trail is clearly marked with reflective neon orange flags every 50 meters and direction arrows at crucial junctions.' },
          { question: 'What happens if I cannot finish?', answer: 'Sweeper vehicles and medical ATVs are stationed at intermediate checkpoints to transport retired runners back to the race village safely.' }
        ],
        prize_pool: { total: '₹5,00,000', first: 250000, second: 150000, third: 100000 }
      }
    };

    event = mockEvents[slug] || null;
    if (event) {
      registrationCount = event.registration_count || 0;
    }
  }

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
                    <span className="text-xs uppercase tracking-widest text-gray-400 font-bold ml-2">+ 18% GST</span>
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
