import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { sendGymOutreachEmail, getGymOutreachEmailHtml } from '@/lib/mail';

export async function POST(req: Request) {
  const auth = await getAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, gymName, subject, customNote, isPreviewOnly } = body;

    if (isPreviewOnly) {
      const html = getGymOutreachEmailHtml(gymName || 'Sample Fitness Club', customNote);
      return NextResponse.json({ success: true, html });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ message: 'Valid email address is required' }, { status: 400 });
    }

    const name = gymName?.trim() || 'Gym / Fitness Club';
    const finalSubject = subject?.replace(/{Gym_name}/gi, name) || `Official Invitation: Will ${name} compete at The Beast Hunter 2026? 🏆`;

    const result = await sendGymOutreachEmail(email.trim(), name, finalSubject, customNote);

    // Try logging into Supabase email_logs if available
    try {
      const db = auth.supabase;
      await db.from('email_logs').insert({
        recipient_email: email.trim(),
        email_type: 'gym_outreach',
        status: result.success ? 'sent' : 'failed',
        resend_message_id: result.messageId || null,
        error_message: result.error || null,
        sent_at: new Date().toISOString(),
      });
    } catch (logErr) {
      console.warn('Could not log outreach email to email_logs table:', logErr);
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to dispatch email via SMTP server',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: `Email successfully delivered to ${email}`,
    });
  } catch (err: any) {
    console.error('Outreach send API error:', err);
    return NextResponse.json({ message: err.message || 'Internal server error' }, { status: 500 });
  }
}
