import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

function replacePlaceholders(template: string, data: {
  full_name: string;
  event_title: string;
  registration_code: string;
  ticket_price: string;
  status: string;
  audition_option?: string;
  ticket_url?: string;
}): string {
  if (!template) return '';
  const ticketBtn = data.ticket_url
    ? `<div style="margin: 20px 0;"><a href="${data.ticket_url}" target="_blank" style="background: linear-gradient(135deg, #D4AF37 0%, #F5D060 100%); color: #000000 !important; text-decoration: none !important; font-weight: 800; font-size: 14px; text-transform: uppercase; padding: 14px 28px; border-radius: 6px; display: inline-block;">Access Digital Entry Pass &rarr;</a><br/><span style="font-size: 11px; color: #888888; margin-top: 6px; display: block;">Pass Link: ${data.ticket_url}</span></div>`
    : '';

  return template
    .replace(/{name}/g, data.full_name)
    .replace(/{event}/g, data.event_title)
    .replace(/{code}/g, data.registration_code)
    .replace(/{price}/g, data.ticket_price)
    .replace(/{status}/g, data.status)
    .replace(/{audition}/g, data.audition_option || 'Running Audition')
    .replace(/{ticket_url}/g, ticketBtn)
    .replace(/{pass_url}/g, ticketBtn);
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

    const { sendCustomEmail } = await import('@/lib/mail');

    // Process each email and insert database logs
    const logPromises = recipients.map(async (rec) => {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thebeasthunterchallenge.com';
      const ticketUrl = `${siteUrl}/payment/success?registration_id=${rec.id}`;

      const placeholderData = {
        full_name: rec.full_name || '',
        event_title: rec.event_id?.title || 'The Beast Hunter Challenge Event',
        registration_code: rec.registration_code || '',
        ticket_price: rec.event_id?.ticket_price ? `₹${Number(rec.event_id.ticket_price).toLocaleString('en-IN')}` : '₹0',
        status: rec.status || 'pending',
        audition_option: rec.audition_option || 'Running Audition',
        ticket_url: ticketUrl,
      };

      const finalSubject = replacePlaceholders(subject, placeholderData);
      const finalBody = replacePlaceholders(body, placeholderData);

      const mailResult = await sendCustomEmail(rec.email, finalSubject, finalBody);

      // Save log to Supabase email_logs
      return db.from('email_logs').insert({
        recipient_email: rec.email,
        email_type: 'admin_alert',
        registration_id: rec.id,
        status: mailResult.success ? 'sent' : 'failed',
        resend_message_id: mailResult.messageId || null,
        error_message: mailResult.error || null,
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
