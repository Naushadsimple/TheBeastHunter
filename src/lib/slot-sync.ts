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
 * SLOTS ARE MANAGED EXCLUSIVELY BY THE ADMIN PANEL.
 * To prevent any unexpected resets or count jumping during registrations,
 * the events table displayed_slot_count and audition_slots are NEVER modified
 * automatically by checkout, webhooks, or emails.
 *
 * This function only updates actual_registered_count for internal audit tracking.
 */
export async function syncEventAuditionSlots(
  db: SupabaseClient,
  eventId: string,
  _auditionOption?: string
): Promise<{ actualCount: number }> {
  try {
    const { count, error: countErr } = await db
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'confirmed');

    if (!countErr && count !== null) {
      // ONLY update actual_registered_count.
      // NEVER touch displayed_slot_count or audition_slots!
      await db
        .from('events')
        .update({
          actual_registered_count: count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', eventId);
    }

    return { actualCount: count ?? 0 };
  } catch (err) {
    console.error('[slot-sync] Error syncing actual registration count:', err);
    return { actualCount: 0 };
  }
}

/**
 * Safe no-op functions to preserve backward compatibility across route imports.
 * Slots are edited exclusively from Admin Panel -> Manage Slots.
 */
export async function bookAuditionSlot(
  _db: SupabaseClient,
  _eventId: string,
  _auditionOption?: string
): Promise<{ success: boolean }> {
  return { success: true };
}

export async function releaseAuditionSlot(
  _db: SupabaseClient,
  _eventId: string,
  _auditionOption?: string
): Promise<{ success: boolean }> {
  return { success: true };
}
