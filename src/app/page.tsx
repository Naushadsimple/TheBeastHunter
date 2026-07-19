import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import UpcomingRaces, { DBEvent } from "@/components/sections/UpcomingRaces";
import AboutUs from "@/components/sections/AboutUs";
import PastWinners from "@/components/sections/PastWinners";
import YoutubeVideosSection from "@/components/sections/YoutubeVideosSection";
import SponsorsSection from "@/components/sections/SponsorsSection";
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60; // Revalidate page every 60 seconds
export const dynamic = "force-dynamic"; // Force dynamic rendering to allow cookies

export default async function Home() {
  let events: DBEvent[] = [];
  let sponsors: { id: string; name: string; logo_url: string; website_url?: string | null }[] = [];

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
        status,
        displayed_slot_count
      `)
      .eq('status', 'published')
      .order('event_date', { ascending: true })
      .limit(3);

    if (!error && dbEvents) {
      events = dbEvents.map((event) => ({
        ...event,
        registration_count: event.displayed_slot_count || 0,
      }));
    }

    const { data: sponsorRows } = await supabase
      .from('sponsors')
      .select('id, name, logo_url, website_url')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    sponsors = sponsorRows || [];
  } catch (err) {
    console.error('Error loading events for homepage:', err);
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <SponsorsSection sponsors={sponsors} />
        <UpcomingRaces events={events} />
        <PastWinners />
        <AboutUs />
        <YoutubeVideosSection />
      </main>
      <Footer />
    </>
  );
}
