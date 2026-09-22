import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const auth = await getAdminSession();
    if (!auth.ok) {
      return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, audition_slots, displayed_slot_count, max_participants } = body;

    if (!eventId) {
      return NextResponse.json({ message: 'Missing eventId' }, { status: 400 });
    }

    const db = createAdminClient();

    // Fetch existing event to get slug and current data
    const { data: currentEvent, error: fetchErr } = await db
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (fetchErr || !currentEvent) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    let computedTotalFilled = currentEvent.displayed_slot_count;
    let computedTotalCapacity = currentEvent.max_participants;

    if (audition_slots && typeof audition_slots === 'object') {
      const sanitizedSlots: Record<string, { capacity: number; filled: number }> = {};
      const disciplines = [
        'Running',
        'Cycling',
        'Weight Holding',
        'Dumbbell Holding',
        'Plank',
      ];

      let sumFilled = 0;
      let sumCapacity = 0;

      for (const disc of disciplines) {
        const item = audition_slots[disc] || {};
        const cap = Math.max(1, Number(item.capacity) || 100);
        const fill = Math.max(0, Math.min(cap, Number(item.filled) || 0));
        sanitizedSlots[disc] = {
          capacity: cap,
          filled: fill,
        };
        sumFilled += fill;
        sumCapacity += cap;
      }

      computedTotalFilled = sumFilled;
      computedTotalCapacity = sumCapacity;

      updatePayload.audition_slots = sanitizedSlots;
      updatePayload.displayed_slot_count = sumFilled;
      if (max_participants !== undefined) {
        updatePayload.max_participants = Number(max_participants) || sumCapacity;
      } else {
        updatePayload.max_participants = sumCapacity;
      }
    } else if (displayed_slot_count !== undefined) {
      const numSlots = Math.max(0, Number(displayed_slot_count) || 0);
      updatePayload.displayed_slot_count = numSlots;
      computedTotalFilled = numSlots;
      if (max_participants !== undefined) {
        updatePayload.max_participants = Math.max(1, Number(max_participants) || currentEvent.max_participants);
        computedTotalCapacity = updatePayload.max_participants;
      }
    }

    const { data: updatedEvent, error: updateErr } = await db
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
      .select('*')
      .single();

    if (updateErr) {
      console.error('Error updating event slots:', updateErr);
      return NextResponse.json({ message: updateErr.message || 'Failed to update slots' }, { status: 500 });
    }

    // Revalidate affected pages to instantly reflect changes
    try {
      revalidatePath('/');
      revalidatePath('/events');
      if (currentEvent.slug) {
        revalidatePath(`/events/${currentEvent.slug}`);
        revalidatePath(`/events/${currentEvent.slug}/register`);
      }
      revalidatePath('/thebeasthunteradmin');
    } catch (revalErr) {
      console.warn('Revalidation warning:', revalErr);
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      totalFilled: computedTotalFilled,
      totalCapacity: computedTotalCapacity,
      message: 'Slots updated and synchronized successfully!',
    });
  } catch (err: any) {
    console.error('Update slots API error:', err);
    return NextResponse.json(
      { message: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
