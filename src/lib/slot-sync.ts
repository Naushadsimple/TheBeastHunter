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
 * INCREMENT SLOTS ON REGISTRATION:
 * When an athlete registers & books an audition slot:
 * 1. Fetches current events table row.
 * 2. Increments ONLY that specific audition discipline filled count (+1).
 * 3. Increments displayed_slot_count (+1).
 * 4. Increments actual_registered_count (+1).
 * 5. Saves directly to events table in Supabase!
 */
export async function bookAuditionSlot(
  db: SupabaseClient,
  eventId: string,
  auditionOption?: string
): Promise<{ success: boolean; updatedSlots?: AuditionSlotsMap; displayedCount?: number }> {
  try {
    // 1. Fetch current event slots data from events table
    const { data: eventData, error: fetchErr } = await db
      .from('events')
      .select('displayed_slot_count, actual_registered_count, audition_slots, max_participants')
      .eq('id', eventId)
      .single();

    if (fetchErr || !eventData) {
      console.error('[slot-sync] Failed to fetch event for slot booking:', fetchErr);
      return { success: false };
    }

    const currentSlots: AuditionSlotsMap = eventData.audition_slots || {};
    const updatedSlots: AuditionSlotsMap = { ...currentSlots };

    // Standardize selected audition option name
    const selectedDiscipline = auditionOption?.trim() || 'Running';

    // Ensure all 5 disciplines exist
    AUDITION_DISCIPLINES.forEach((disc) => {
      if (!updatedSlots[disc]) {
        updatedSlots[disc] = { capacity: 100, filled: 0 };
      }
    });

    // Increment ONLY the booked audition slot discipline
    const discData = updatedSlots[selectedDiscipline] || { capacity: 100, filled: 0 };
    const newFilled = (discData.filled || 0) + 1;
    const capacity = discData.capacity || 100;
    updatedSlots[selectedDiscipline] = {
      capacity,
      filled: newFilled,
    };

    // Increment displayed_slot_count +1 and actual_registered_count +1
    const newDisplayedCount = (eventData.displayed_slot_count || 0) + 1;
    const newActualCount = (eventData.actual_registered_count || 0) + 1;

    // Save directly to Supabase events table
    const { error: updateErr } = await db
      .from('events')
      .update({
        audition_slots: updatedSlots,
        displayed_slot_count: newDisplayedCount,
        actual_registered_count: newActualCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (updateErr) {
      console.error('[slot-sync] Error updating booked slots in events table:', updateErr);
      return { success: false };
    }

    console.log(`[slot-sync] Booked slot for ${selectedDiscipline}: +1. Displayed: ${newDisplayedCount}, Actual: ${newActualCount}`);
    return {
      success: true,
      updatedSlots,
      displayedCount: newDisplayedCount,
    };
  } catch (err) {
    console.error('[slot-sync] Unexpected error booking slot:', err);
    return { success: false };
  }
}

/**
 * DECREMENT SLOTS ON REJECTION / CANCELLATION:
 * If an admin rejects a registration or a payment is cancelled:
 * - Decrement that specific audition slot by -1
 * - Decrement displayed_slot_count by -1
 * - Decrement actual_registered_count by -1
 */
export async function releaseAuditionSlot(
  db: SupabaseClient,
  eventId: string,
  auditionOption?: string
): Promise<{ success: boolean }> {
  try {
    const { data: eventData, error: fetchErr } = await db
      .from('events')
      .select('displayed_slot_count, actual_registered_count, audition_slots')
      .eq('id', eventId)
      .single();

    if (fetchErr || !eventData) {
      return { success: false };
    }

    const currentSlots: AuditionSlotsMap = eventData.audition_slots || {};
    const updatedSlots: AuditionSlotsMap = { ...currentSlots };
    const selectedDiscipline = auditionOption?.trim() || 'Running';

    if (updatedSlots[selectedDiscipline]) {
      const currentFilled = updatedSlots[selectedDiscipline].filled || 0;
      updatedSlots[selectedDiscipline] = {
        capacity: updatedSlots[selectedDiscipline].capacity || 100,
        filled: Math.max(0, currentFilled - 1),
      };
    }

    const newDisplayedCount = Math.max(0, (eventData.displayed_slot_count || 0) - 1);
    const newActualCount = Math.max(0, (eventData.actual_registered_count || 0) - 1);

    await db
      .from('events')
      .update({
        audition_slots: updatedSlots,
        displayed_slot_count: newDisplayedCount,
        actual_registered_count: newActualCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    return { success: true };
  } catch (err) {
    console.error('[slot-sync] Unexpected error releasing slot:', err);
    return { success: false };
  }
}

/**
 * Backward compatibility function for existing route imports.
 * Calls bookAuditionSlot if an auditionOption is passed.
 */
export async function syncEventAuditionSlots(
  db: SupabaseClient,
  eventId: string,
  auditionOption?: string
): Promise<{ actualCount: number }> {
  if (auditionOption) {
    await bookAuditionSlot(db, eventId, auditionOption);
  }
  return { actualCount: 0 };
}
