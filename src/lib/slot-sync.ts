import { SupabaseClient } from '@supabase/supabase-js';

export const AUDITION_DISCIPLINES = [
  'Running',
  'Cycling',
  'Weight Holding',
  'Dumbbell Holding',
  'Plank',
] as const;

export interface AuditionSlotData {
  capacity: number;
  filled: number;
}

export type AuditionSlotsMap = Record<string, AuditionSlotData>;

/**
 * Recalculates exact confirmed registration counts per audition discipline
 * and updates events.audition_slots in Supabase DB.
 */
export async function syncEventAuditionSlots(
  db: SupabaseClient,
  eventId: string
): Promise<AuditionSlotsMap> {
  try {
    // 1. Fetch confirmed registrations for this event
    const { data: confirmedRegs, error: regErr } = await db
      .from('registrations')
      .select('audition_option')
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (regErr) {
      console.error('Error fetching confirmed registrations for slot sync:', regErr);
    }

    // 2. Fetch current event audition_slots (to preserve capacity overrides)
    const { data: eventData } = await db
      .from('events')
      .select('audition_slots')
      .eq('id', eventId)
      .maybeSingle();

    const existingSlots: AuditionSlotsMap = eventData?.audition_slots || {};

    // 3. Count confirmed registrations per discipline
    const counts: Record<string, number> = {};
    (confirmedRegs || []).forEach((r) => {
      const opt = r.audition_option || 'Running';
      counts[opt] = (counts[opt] || 0) + 1;
    });

    // 4. Construct updated audition_slots JSON
    const updatedSlots: AuditionSlotsMap = {};

    AUDITION_DISCIPLINES.forEach((disc) => {
      const existingCap = existingSlots[disc]?.capacity;
      const capacity = typeof existingCap === 'number' ? existingCap : 100;
      updatedSlots[disc] = {
        capacity,
        filled: counts[disc] || 0,
      };
    });

    // Preserve any custom options configured previously
    Object.keys(existingSlots).forEach((key) => {
      if (!updatedSlots[key]) {
        updatedSlots[key] = {
          capacity: existingSlots[key].capacity || 100,
          filled: counts[key] || 0,
        };
      }
    });

    const totalFilled = Object.values(updatedSlots).reduce(
      (sum, item) => sum + (item.filled || 0),
      0
    );

    // 5. Update events table
    await db
      .from('events')
      .update({
        audition_slots: updatedSlots,
        actual_registered_count: totalFilled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    return updatedSlots;
  } catch (err) {
    console.error('syncEventAuditionSlots error:', err);
    return {};
  }
}
