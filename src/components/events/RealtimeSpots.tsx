'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Flame } from 'lucide-react';

interface RealtimeSpotsProps {
  eventId: string;
  maxParticipants: number;
  initialCount: number;
}

export default function RealtimeSpots({ eventId, maxParticipants, initialCount }: RealtimeSpotsProps) {
  const [count, setCount] = useState(initialCount);
  const supabase = createClient();

  useEffect(() => {
    async function fetchFreshCount() {
      try {
        const { data: freshEvent, error } = await supabase
          .from('events')
          .select('displayed_slot_count')
          .eq('id', eventId)
          .single();
        
        if (!error && freshEvent) {
          setCount(freshEvent.displayed_slot_count || 0);
        }
      } catch (err) {
        console.error('Error fetching fresh count:', err);
      }
    }

    fetchFreshCount();

    // Subscribe to events modifications for this specific event
    const channel = supabase
      .channel(`spots-sync-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.new && (payload.new as any).displayed_slot_count !== undefined) {
            setCount((payload.new as any).displayed_slot_count || 0);
          } else {
            fetchFreshCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  const remaining = Math.max(0, maxParticipants - count);
  const filledPercent = Math.min(100, Math.round((count / maxParticipants) * 100));

  return (
    <div className="bg-dark-gray border border-white/5 p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-barlow text-lg font-bold text-white uppercase tracking-wider">
          Race Registration spots
        </h4>
        {remaining <= 100 && remaining > 0 && (
          <span className="flex items-center space-x-1 text-red-500 font-barlow text-xs font-bold uppercase tracking-wider animate-pulse">
            <Flame className="w-3.5 h-3.5 fill-red-500" />
            <span>Selling Fast!</span>
          </span>
        )}
      </div>

      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Available slots</span>
          <div className="flex items-center space-x-2 text-white">
            <Users className="w-5 h-5 text-gold-premium" />
            <span className="font-bebas text-3xl tracking-wide">
              {remaining} <span className="text-gray-400 text-lg">/ {maxParticipants}</span>
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-widest text-gray-500 block mb-1">Capacity filled</span>
          <span className="font-bebas text-2xl text-gold-premium tracking-wide">
            {filledPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full gold-gradient-bg transition-all duration-500"
          style={{ width: `${filledPercent}%` }}
        />
      </div>
    </div>
  );
}
