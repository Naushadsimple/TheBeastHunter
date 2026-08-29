import { SupabaseClient } from '@supabase/supabase-js';

export const AUDITION_DISCIPLINES = [
  'Running',
  'Cycling',
  'Weight Holding',
  'Dumbbell Holding',
  'Plank',
] as const;

/**
 * SLOT SYNC LOGIC (Correct):
 *
 * - `displayed_slot_count` = Admin manually sets this base number (e.g. 250).
 *   This represents the "pre-filled" or "boost" count shown to users.
 *   THIS FUNCTION NEVER MODIFIES displayed_slot_count.
 *
 * - `actual_registered_count` = Auto-counted from confirmed registrations in DB.
 *   This is updated every time a registration is confirmed/approved.
 *
 * - User sees on frontend: displayed_slot_count + actual_registered_count = total filled slots
 * - Available slots = max_participants - (displayed_slot_count + actual_registered_count)
 *
 * This function ONLY updates actual_registered_count. displayed_slot_count is admin-only.
 */
export async function syncEventAuditionSlots(
  db: SupabaseClient,
  eventId: string,
  _unused?: string
): Promise<{ actualCount: number }> {
  try {
    // Count ACTUAL confirmed registrations from DB
    const { count, error: countErr } = await db
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (countErr) {
      console.error('[slot-sync] Error counting confirmed registrations:', countErr);
      return { actualCount: 0 };
    }

    const confirmedCount = count ?? 0;

    // ONLY update actual_registered_count. NEVER touch displayed_slot_count.
    const { error: updateErr } = await db
      .from('events')
      .update({
        actual_registered_count: confirmedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', eventId);

    if (updateErr) {
      console.error('[slot-sync] Error updating actual_registered_count:', updateErr);
    } else {
      console.log(`[slot-sync] Event ${eventId}: actual_registered_count = ${confirmedCount}`);
    }

    return { actualCount: confirmedCount };
  } catch (err) {
    console.error('[slot-sync] Unexpected error:', err);
    return { actualCount: 0 };
  }
}
