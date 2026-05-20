import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import UpcomingRaces, { DBEvent } from "@/components/sections/UpcomingRaces";
import AboutUs from "@/components/sections/AboutUs";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SponsorsSection from "@/components/sections/SponsorsSection";
import { createClient } from '@/lib/supabase/server';
import PopupSponsor from '@/components/common/PopupSponsor';
import RandomSponsorsSection from '@/components/sections/RandomSponsorsSection';

export const revalidate = 60; // Revalidate page every 60 seconds
export const dynamic = "force-dynamic"; // Force dynamic rendering to allow cookies

export default async function Home() {
  let events: DBEvent[] = [];

  try {
    const supabase = await createClient();

    // Fetch published events
    const { data: dbEvents, error } = await supabase
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
        status
      `)
      .eq('status', 'published')
      .order('event_date', { ascending: true })
      .limit(3);

    if (!error && dbEvents) {
      // Query registration counts for each event
      const eventsWithCounts = await Promise.all(
        dbEvents.map(async (event) => {
          const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .in('status', ['confirmed', 'pending']); // Count active/pending registrations

          return {
            ...event,
            registration_count: count || 0,
          };
        })
      );
      events = eventsWithCounts;
    }
  } catch (err) {
    console.error('Error loading events for homepage:', err);
  }

  return (
    <>
        <PopupSponsor />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <SponsorsSection />
        <UpcomingRaces events={events} />
        <AboutUs />
        <TestimonialsSection />
        <RandomSponsorsSection />
      </main>
      <Footer />
    </>
  );
}
