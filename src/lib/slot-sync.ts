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
 * Updates event audition slots when a registration occurs or when synced.
 * PRESERVES manual slot boosts (e.g. 50 filled per discipline) and INCREMENTS
 * filled slot count by +1 when a new confirmed registration is recorded.
 */
export async function syncEventAuditionSlots(
  db: SupabaseClient,
  eventId: string,
  incrementOption?: string
): Promise<AuditionSlotsMap> {
  try {
    // 1. Fetch confirmed registrations count for actual_registered_count audit
    const { data: confirmedRegs } = await db
      .from('registrations')
      .select('audition_option')
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    const actualCount = (confirmedRegs || []).length;

    // 2. Fetch current event audition_slots (to preserve capacity & manual filled counts)
    const { data: eventData } = await db
      .from('events')
      .select('audition_slots')
      .eq('id', eventId)
      .maybeSingle();

    const existingSlots: AuditionSlotsMap = eventData?.audition_slots || {};
    const updatedSlots: AuditionSlotsMap = {};

    // 3. Populate slots for all 5 disciplines while preserving boosted filled values
    AUDITION_DISCIPLINES.forEach((disc) => {
      const existingCap = existingSlots[disc]?.capacity;
      const existingFilled = existingSlots[disc]?.filled;

      const capacity = typeof existingCap === 'number' ? existingCap : 100;
      // Default to existing filled value, or 50 if empty
      const filled = typeof existingFilled === 'number' ? existingFilled : 50;

      updatedSlots[disc] = {
        capacity,
        filled,
      };
    });

    // 4. If a specific audition discipline was confirmed, INCREMENT its filled count by +1
    if (incrementOption && updatedSlots[incrementOption]) {
      const currentFilled = updatedSlots[incrementOption].filled || 0;
      const currentCap = updatedSlots[incrementOption].capacity || 100;

      updatedSlots[incrementOption] = {
        capacity: currentCap,
        filled: Math.min(currentCap, currentFilled + 1),
      };
    }

    // Preserve any extra custom options
    Object.keys(existingSlots).forEach((key) => {
      if (!updatedSlots[key]) {
        updatedSlots[key] = {
          capacity: existingSlots[key].capacity || 100,
          filled: existingSlots[key].filled || 50,
        };
      }
    });

    // 5. Update events table without resetting manual filled slot counts
    await db
      .from('events')
      .update({
        audition_slots: updatedSlots,
        actual_registered_count: actualCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    return updatedSlots;
  } catch (err) {
    console.error('syncEventAuditionSlots error:', err);
    return {};
  }
}
