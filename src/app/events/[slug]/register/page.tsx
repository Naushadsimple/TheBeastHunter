import { redirect, notFound } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RegistrationForm from "@/components/events/RegistrationForm";
import { createClient } from "@/lib/supabase/server";
import { DBEvent } from "@/components/sections/UpcomingRaces";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 0; // Dynamic check, do not cache

export default async function RegisterPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect if not logged in
  if (!user) {
    redirect(`/login?next=/events/${slug}/register`);
  }

  let event: DBEvent | null = null;

  try {
    // 2. Fetch event from database
    const { data: dbEvent, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && dbEvent) {
      event = {
        ...dbEvent,
        distance_km: Number(dbEvent.distance_km),
      } as DBEvent;
    }
  } catch (err) {
    console.error('Error fetching event for registration:', err);
  }

  // 3. Fallback mock events for fully functional demo
  if (!event) {
    const mockEvents: Record<string, DBEvent> = {
      'beast-mud-run-2026': {
        id: 'mock-1',
        title: 'Beast Mud Run 2026',
        slug: 'beast-mud-run-2026',
        short_description: 'India\'s largest obstacle mud run with 25+ military-grade obstacles, fire jumps, and giant slides.',
        banner_url: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=800',
        event_date: '2026-10-15T06:00:00Z',
        distance_km: 10,
        difficulty: 'intermediate',
        ticket_price: 1999,
        max_participants: 2500,
      },
      'night-beast-half-marathon': {
        id: 'mock-2',
        title: 'Night Beast Half Marathon',
        slug: 'night-beast-half-marathon',
        short_description: 'An electric neon night half marathon through the heart of Delhi. Fully lit course with live music stations.',
        banner_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=800',
        event_date: '2026-11-20T18:00:00Z',
        distance_km: 21,
        difficulty: 'advanced',
        ticket_price: 2499,
        max_participants: 1500,
      },
      'elite-alpha-challenge': {
        id: 'mock-3',
        title: 'The Elite Alpha Challenge',
        slug: 'elite-alpha-challenge',
        short_description: 'A brutal 15KM endurance trial on mountain trails. Strictly for advanced endurance athletes.',
        banner_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=800',
        event_date: '2026-12-05T05:30:00Z',
        distance_km: 15,
        difficulty: 'elite',
        ticket_price: 3499,
        max_participants: 500,
      }
    };

    event = mockEvents[slug] || null;
  }

  if (!event) {
    notFound();
  }

  // Format user prop to match RegistrationForm expected type
  const formUser = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.fullName || user.user_metadata?.name || '',
  };

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-16 bg-deep-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-2">
              Registration Portal
            </span>
            <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide uppercase">
              REGISTER FOR <span className="gold-gradient-text">{event.title}</span>
            </h1>
            <p className="font-barlow text-sm text-gray-400 uppercase tracking-widest mt-2">
              Step-by-step checkout secure entry pass
            </p>
          </div>

          <RegistrationForm event={event} user={formUser} />
        </div>
      </main>
      <Footer />
    </>
  );
}
