import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RegistrationForm from '@/components/events/RegistrationForm';
import { createClient } from '@/lib/supabase/server';
import { DBEvent } from '@/components/sections/UpcomingRaces';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 0;

export default async function RegisterPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbEvent, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !dbEvent) {
    notFound();
  }

  const { data: slotSetting } = await supabase
    .from('site_settings')
    .select('show_numbers, value')
    .eq('key', 'slot_display')
    .maybeSingle();

  const showNumbers =
    typeof slotSetting?.show_numbers === 'boolean'
      ? slotSetting.show_numbers
      : slotSetting?.value?.show_numbers !== undefined
      ? Boolean(slotSetting.value.show_numbers)
      : true;

  const event: DBEvent = {
    ...dbEvent,
    distance_km: Number(dbEvent.distance_km),
  };

  const spotsLeft =
    dbEvent.max_participants != null
      ? Math.max(0, dbEvent.max_participants - (dbEvent.displayed_slot_count || 0))
      : null;

  const registrationClosed =
    dbEvent.registration_deadline &&
    new Date(dbEvent.registration_deadline) < new Date();

  const soldOut = spotsLeft !== null && spotsLeft <= 0;

  const formattedDate = new Date(dbEvent.event_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const optionalUser = user
    ? {
        id: user.id,
        email: user.email!,
        name:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          '',
      }
    : null;

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28 pb-16 bg-deep-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="font-barlow text-sm font-bold uppercase tracking-widest text-gold-premium block mb-2">
              Secure Registration
            </span>
            <h1 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide uppercase">
              REGISTER FOR <span className="gold-gradient-text">{event.title}</span>
            </h1>
            <p className="font-barlow text-sm text-gray-400 uppercase tracking-widest mt-2">
              Fill the form → confirm your slot → Scan and Pay via UPI
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm font-inter text-gray-300">
            <div className="flex flex-wrap items-center gap-2 bg-dark-gray/40 border border-amber-500/30 px-3.5 py-1.5 rounded text-xs font-barlow">
              <Calendar className="w-4 h-4 text-gold-premium shrink-0" />
              {dbEvent.postponed_from ? (
                <>
                  <span className="line-through text-gray-500 opacity-70">
                    {dbEvent.postponed_from}
                  </span>
                  <span className="text-gold-premium font-bold">
                    {formattedDate}
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase border border-amber-500/30">
                    {dbEvent.postponement_reason || 'Postponed due to weather conditions'}
                  </span>
                </>
              ) : (
                <span>{formattedDate}</span>
              )}
            </div>
            {dbEvent.city && (
              <span className="flex items-center gap-2 bg-dark-gray/40 border border-white/5 px-3 py-1.5 rounded">
                <MapPin className="w-4 h-4 text-gold-premium" />
                {dbEvent.city}
              </span>
            )}
            {showNumbers && spotsLeft !== null && (
              <span className="flex items-center gap-2 bg-dark-gray/40 border border-white/5 px-3 py-1.5 rounded">
                <span className="text-gold-premium font-bold">{spotsLeft}</span> slots left
              </span>
            )}
          </div>

          {registrationClosed ? (
            <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h2 className="font-bebas text-2xl text-white uppercase">Registration Closed</h2>
              <p className="text-gray-400 text-sm">The deadline for this event has passed.</p>
              <Link
                href={`/events/${slug}`}
                className="inline-block font-barlow text-sm font-bold uppercase text-gold-premium hover:text-gold-glow"
              >
                ← Back to event
              </Link>
            </div>
          ) : soldOut ? (
            <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-8 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h2 className="font-bebas text-2xl text-white uppercase">Sold Out</h2>
              <p className="text-gray-400 text-sm">All slots for this event have been reserved.</p>
              <Link
                href={`/events/${slug}`}
                className="inline-block font-barlow text-sm font-bold uppercase text-gold-premium hover:text-gold-glow"
              >
                ← Back to event
              </Link>
            </div>
          ) : (
            <RegistrationForm event={event} user={optionalUser} showNumbers={showNumbers} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
