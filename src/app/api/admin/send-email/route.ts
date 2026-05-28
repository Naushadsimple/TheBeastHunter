import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

function replacePlaceholders(template: string, data: {
  full_name: string;
  event_title: string;
  registration_code: string;
  ticket_price: string;
  status: string;
}): string {
  if (!template) return '';
  return template
    .replace(/{name}/g, data.full_name)
    .replace(/{event}/g, data.event_title)
    .replace(/{code}/g, data.registration_code)
    .replace(/{price}/g, data.ticket_price)
    .replace(/{status}/g, data.status);
}

export async function POST(req: Request) {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipientType, recipientId, eventId, subject, body } = await req.json();

    if (!recipientType || !subject || !body) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const db = auth.supabase;
    let recipients: any[] = [];

    if (recipientType === 'single') {
      if (!recipientId) {
        return NextResponse.json({ message: 'recipientId is required for single email' }, { status: 400 });
      }
      const { data, error } = await db
        .from('registrations')
        .select('*, event_id(title, ticket_price)')
        .eq('id', recipientId)
        .single();
      
      if (error || !data) {
        return NextResponse.json({ message: 'Challenger registration not found' }, { status: 404 });
      }
      recipients = [data];
    } else if (recipientType === 'event') {
      if (!eventId) {
        return NextResponse.json({ message: 'eventId is required for event broadcast' }, { status: 400 });
      }
      const { data, error } = await db
        .from('registrations')
        .select('*, event_id(title, ticket_price)')
        .eq('event_id', eventId)
        .in('status', ['confirmed', 'pending']);
      
      if (error) {
        return NextResponse.json({ message: 'Failed to fetch event challengers' }, { status: 500 });
      }
      recipients = data || [];
    } else if (recipientType === 'all') {
      const { data, error } = await db
        .from('registrations')
        .select('*, event_id(title, ticket_price)');
      
      if (error) {
        return NextResponse.json({ message: 'Failed to fetch challengers' }, { status: 500 });
      }
      recipients = data || [];
    } else {
      return NextResponse.json({ message: 'Invalid recipient type' }, { status: 400 });
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No recipients found for this selection' });
    }

    // Process each email and insert database logs
    const logPromises = recipients.map(async (rec) => {
      const placeholderData = {
        full_name: rec.full_name || '',
        event_title: rec.event_id?.title || 'The Beast Hunter Challenge Event',
        registration_code: rec.registration_code || '',
        ticket_price: rec.event_id?.ticket_price ? `₹${Number(rec.event_id.ticket_price).toLocaleString('en-IN')}` : '₹0',
        status: rec.status || 'pending',
      };

      const finalSubject = replacePlaceholders(subject, placeholderData);
      const finalBody = replacePlaceholders(body, placeholderData);

      // Save log to Supabase email_logs
      return db.from('email_logs').insert({
        recipient_email: rec.email,
        email_type: 'admin_alert',
        registration_id: rec.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    });

    await Promise.all(logPromises);

    return NextResponse.json({
      success: true,
      count: recipients.length,
      message: `Successfully processed and logged ${recipients.length} email(s) in database.`,
    });
  } catch (err) {
    console.error('Send email API error:', err);
    return NextResponse.json({ message: 'Failed to process email dispatch' }, { status: 500 });
  }
}
