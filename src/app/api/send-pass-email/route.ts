import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendApprovalEmail } from '@/lib/mail';
import { getSiteUrl } from '@/lib/site-url';

export async function POST(request: NextRequest) {
  try {
    const { registrationId } = await request.json();

    if (!registrationId) {
      return NextResponse.json({ message: 'Missing registrationId' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch registration details with event
    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*, event_id(*)')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      return NextResponse.json({ message: 'Registration not found' }, { status: 404 });
    }

    const baseUrl = getSiteUrl(request);
    const passUrl = `${baseUrl}/payment/success?registration_id=${registrationId}`;

    // Send pass approval email via Nodemailer
    const mailResult = await sendApprovalEmail(
      registration.email,
      registration,
      registration.event_id || { title: 'The Beast Hunter Audition 2026', venue: 'Palghar Sports Complex' },
      passUrl
    );

    // Log in email_logs table
    await supabase.from('email_logs').insert({
      recipient_email: registration.email,
      email_type: 'registration_confirmed',
      registration_id: registrationId,
      status: mailResult.success ? 'sent' : 'failed',
      error_message: mailResult.error || null,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      mailResult,
    });
  } catch (err: any) {
    console.error('send-pass-email API error:', err);
    return NextResponse.json(
      { message: err.message || 'Failed to send pass email' },
      { status: 500 }
    );
  }
}
