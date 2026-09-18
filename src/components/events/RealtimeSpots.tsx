'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Flame } from 'lucide-react';

interface RealtimeSpotsProps {
  eventId: string;
  maxParticipants: number;
  initialDisplayed: number;
  initialActualRegistered: number;
}

export default function RealtimeSpots({ eventId, maxParticipants, initialDisplayed, initialActualRegistered }: RealtimeSpotsProps) {
  const [displayed, setDisplayed] = useState(initialDisplayed);
  const [actualRegistered, setActualRegistered] = useState(initialActualRegistered);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFresh() {
      const { data, error } = await supabase
        .from('events')
        .select('displayed_slot_count, actual_registered_count')
        .eq('id', eventId)
        .single();
      if (!error && data) {
        setDisplayed(data.displayed_slot_count || 0);
        setActualRegistered(data.actual_registered_count || 0);
      }
    }
    fetchFresh();

    const channel = supabase
      .channel(`spots-sync-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `id=eq.${eventId}` }, (payload) => {
        const u = payload.new as any;
        if (u) {
          if (u.displayed_slot_count !== undefined) setDisplayed(u.displayed_slot_count || 0);
          if (u.actual_registered_count !== undefined) setActualRegistered(u.actual_registered_count || 0);
        } else { fetchFresh(); }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, supabase]);

  // Available = total capacity minus admin-set displayed (filled) count
  const available = Math.max(0, maxParticipants - displayed);
  // Progress bar driven by admin-set displayed_slot_count
  const filledPercent = Math.min(100, Math.round((displayed / maxParticipants) * 100));

  return (
    <div className="bg-dark-gray border border-white/5 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider">Audition Slots</h4>
        {available <= 100 && available > 0 && (
          <span className="flex items-center space-x-1 text-red-500 font-barlow text-xs font-bold uppercase tracking-wider animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-red-500" /><span>Selling Fast!</span>
          </span>
        )}
      </div>
      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Available Slots</span>
          <div className="flex items-center space-x-2 text-white">
            <Users className="w-5 h-5 text-gold-premium" />
            <span className="font-bebas text-3xl tracking-wide">
              {available} <span className="text-gray-400 text-lg">/ {maxParticipants}</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Slots Filled</span>
          <span className="font-bebas text-2xl text-gold-premium tracking-wide">{filledPercent}%</span>
        </div>
      </div>
      <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
        <div className="h-full gold-gradient-bg transition-all duration-500" style={{ width: `${filledPercent}%` }} />
      </div>
    </div>
  );
}
