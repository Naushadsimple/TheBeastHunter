import nodemailer from 'nodemailer';

// Create a single reusable transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtpout.secureserver.net';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('Nodemailer SMTP_USER or SMTP_PASS environment variables are missing. Please set SMTP_USER and SMTP_PASS in .env.local.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465 || process.env.SMTP_SECURE === 'true',
    auth: {
      user: user || '',
      pass: pass || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'info@thebeasthunterchallenge.com';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'The Beast Hunter';

// Premium Dark Theme Email Shell Wrapper
function getEmailTemplate(title: string, contentHtml: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            background-color: #000000;
            color: #ffffff;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .email-wrapper {
            background-color: #000000;
            padding: 40px 20px;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #0b0b0b;
            border: 1px solid #1f1f1f;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .email-header {
            background-color: #000000;
            padding: 30px;
            text-align: center;
            border-bottom: 2px solid #D4AF37;
          }
          .email-header h1 {
            color: #D4AF37;
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            text-transform: uppercase;
          }
          .email-body {
            padding: 40px 30px;
            font-size: 16px;
            line-height: 1.6;
            color: #e0e0e0;
          }
          .email-footer {
            background-color: #000000;
            padding: 25px 30px;
            text-align: center;
            font-size: 12px;
            color: #666666;
            border-top: 1px solid #1f1f1f;
          }
          .email-footer a {
            color: #D4AF37;
            text-decoration: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #D4AF37 0%, #F5D060 100%);
            color: #000000 !important;
            text-decoration: none !important;
            font-weight: 800;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 14px 30px;
            border-radius: 6px;
            margin-top: 25px;
            margin-bottom: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
          }
          .highlight-box {
            background-color: #161616;
            border-left: 3px solid #D4AF37;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 25px 0;
          }
          .info-grid {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .info-grid td {
            padding: 10px 0;
            border-bottom: 1px solid #1f1f1f;
            vertical-align: top;
          }
          .info-grid td.label {
            font-size: 12px;
            color: #888888;
            text-transform: uppercase;
            letter-spacing: 1px;
            width: 35%;
            font-weight: bold;
          }
          .info-grid td.value {
            font-size: 15px;
            color: #ffffff;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <div class="email-header">
              <h1>The Beast Hunter</h1>
            </div>
            <div class="email-body">
              ${contentHtml}
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} The Beast Hunter Challenge. All Rights Reserved.</p>
              <p>For support, email us at <a href="mailto:info@thebeasthunterchallenge.com">info@thebeasthunterchallenge.com</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendMailResult> {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Nodemailer sendEmail error:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

// 1. Pending Verification Email
export async function sendPendingEmail(
  to: string,
  registration: any,
  event: any
): Promise<SendMailResult> {
  const subject = `[PENDING VERIFICATION] ${event.title} Registration`;
  const content = `
    <h2 style="color: #ffffff; margin-top: 0;">Registration Received!</h2>
    <p>Hey <strong>${registration.full_name}</strong>,</p>
    <p>Thank you for submitting your entry for the <strong>${event.title}</strong> challenge. We have received your registration details along with the manual payment UTR / Transaction ID.</p>
    
    <div class="highlight-box">
      <p style="margin: 0; font-weight: bold; color: #F5D060;">Status: Awaiting Payment Verification</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #aaaaaa;">Our team is verifying your payment screenshot. You will receive another email with your activated Virtual Pass once approved.</p>
    </div>

    <h3 style="color: #D4AF37; border-bottom: 1px solid #1f1f1f; padding-bottom: 8px;">Registration Details</h3>
    <table class="info-grid">
      <tr>
        <td class="label">Challenger</td>
        <td class="value">${registration.full_name}</td>
      </tr>
      <tr>
        <td class="label">Event Name</td>
        <td class="value">${event.title}</td>
      </tr>
      <tr>
        <td class="label">Audition Activity</td>
        <td class="value" style="color: #D4AF37; font-weight: bold;">${registration.audition_option || 'Running Audition'}</td>
      </tr>
      <tr>
        <td class="label">Ticket Code</td>
        <td class="value">${registration.registration_code}</td>
      </tr>
      <tr>
        <td class="label">Transaction ID</td>
        <td class="value" style="font-family: monospace;">${registration.transaction_id}</td>
      </tr>
    </table>

    <p style="margin-top: 30px;">If you have any questions or need to correct any details, please contact our support team at <a href="mailto:info@thebeasthunterchallenge.com" style="color: #D4AF37;">info@thebeasthunterchallenge.com</a>.</p>
  `;

  return sendEmail(to, subject, getEmailTemplate(subject, content));
}

// 2. Approved / Confirmation Ticket Email
export async function sendApprovalEmail(
  to: string,
  registration: any,
  event: any,
  passUrl: string
): Promise<SendMailResult> {
  const subject = `[CONFIRMED] Welcome to the Arena - ${event.title}!`;
  const dateStr = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'TBA';

  const content = `
    <h2 style="color: #ffffff; margin-top: 0; text-transform: uppercase; letter-spacing: 1px;">Welcome to the Arena!</h2>
    <p>Congratulations <strong>${registration.full_name}</strong>,</p>
    <p>Your payment verification is complete! Your spot is officially locked in for <strong>${event.title}</strong>.</p>
    
    <div class="highlight-box" style="border-left-color: #22c55e;">
      <p style="margin: 0; font-weight: bold; color: #22c55e;">Status: Confirmed & Active</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #aaaaaa;">Your virtual entry pass is now active. Please click the button below to view and download your boarding pass.</p>
    </div>

    <h3 style="color: #D4AF37; border-bottom: 1px solid #1f1f1f; padding-bottom: 8px;">Your Event Pass</h3>
    <table class="info-grid">
      <tr>
        <td class="label">Pass Code</td>
        <td class="value" style="color: #D4AF37; font-weight: 800;">${registration.registration_code}</td>
      </tr>
      <tr>
        <td class="label">Audition Activity</td>
        <td class="value" style="color: #F5D060; font-weight: 800;">${registration.audition_option || 'Running Audition'} (100 Slots)</td>
      </tr>
      <tr>
        <td class="label">Event Date</td>
        <td class="value">${dateStr}</td>
      </tr>
      <tr>
        <td class="label">Venue</td>
        <td class="value">${event.venue || 'Venue TBA'}</td>
      </tr>
      <tr>
        <td class="label">T-Shirt Size</td>
        <td class="value">${registration.tshirt_size}</td>
      </tr>
    </table>

    <div style="text-align: center; margin-top: 30px;">
      <a href="${passUrl}" class="button">Access Virtual Boarding Pass</a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #888888;">Note: Please bring a printed copy or show the digital QR code on your boarding pass at the registration desk on the event day.</p>
  `;

  return sendEmail(to, subject, getEmailTemplate(subject, content));
}

// 3. Rejected Email
export async function sendRejectionEmail(
  to: string,
  registration: any,
  event: any
): Promise<SendMailResult> {
  const subject = `[REGISTRATION FAILED] Update regarding ${event.title}`;
  const content = `
    <h2 style="color: #ef4444; margin-top: 0;">Registration Verification Failed</h2>
    <p>Dear <strong>${registration.full_name}</strong>,</p>
    <p>We are writing to inform you that our verification team was unable to confirm your manual UPI payment proof for the <strong>${event.title}</strong> challenge.</p>
    
    <div class="highlight-box" style="border-left-color: #ef4444;">
      <p style="margin: 0; font-weight: bold; color: #ef4444;">Status: Rejected / Cancelled</p>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #aaaaaa;">The transaction ID or screenshot provided did not match our bank statements. As a result, your slot has been released.</p>
    </div>

    <p>If this was an error or you wish to provide a corrected transaction proof, please contact us immediately by replying to this email at <a href="mailto:info@thebeasthunterchallenge.com" style="color: #D4AF37;">info@thebeasthunterchallenge.com</a>.</p>
    
    <p>If a debit occurred from your account, any verified payments will be refunded back to the originating account within 5-7 business days.</p>
  `;

  return sendEmail(to, subject, getEmailTemplate(subject, content));
}

// 4. Custom Broadcast / Alert Email
export async function sendCustomEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<SendMailResult> {
  // Convert basic newlines into <p> tags or <br> to ensure HTML rendering looks decent if raw text was sent
  const formattedBody = htmlBody.replace(/\n/g, '<br />');
  
  const content = `
    <div style="color: #ffffff; font-size: 16px; line-height: 1.6;">
      ${formattedBody}
    </div>
  `;

  return sendEmail(to, subject, getEmailTemplate(subject, content));
}

// 5. Gym Outreach Campaign Email (with Brand Logo & Gold Theme)
export function getGymOutreachEmailHtml(gymName: string, customNote?: string): string {
  const brandLogoUrl = 'https://thebeasthunterchallenge.com/logo.png';
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Beast Hunter 2026 Invitation</title>
        <style>
          body {
            background-color: #000000;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
          }
          .wrapper {
            background-color: #050505;
            padding: 30px 15px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #0d0d0d;
            border: 1px solid #222222;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
          }
          .header {
            background: linear-gradient(180deg, #161616 0%, #0d0d0d 100%);
            padding: 32px 20px 24px;
            text-align: center;
            border-bottom: 2px solid #D4AF37;
          }
          .logo {
            max-width: 140px;
            height: auto;
            display: block;
            margin: 0 auto 12px auto;
          }
          .tagline {
            color: #D4AF37;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0;
          }
          .body {
            padding: 32px 28px;
            color: #e5e5e5;
            font-size: 15px;
            line-height: 1.65;
          }
          .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 16px;
          }
          .event-card {
            background-color: #141414;
            border: 1px solid #D4AF37;
            border-radius: 10px;
            padding: 20px;
            margin: 24px 0;
          }
          .event-title {
            color: #D4AF37;
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1.5px;
            margin: 0 0 14px 0;
            text-transform: uppercase;
            text-align: center;
          }
          .disciplines-list {
            text-align: left;
            background-color: #0a0a0a;
            border-radius: 8px;
            padding: 14px 16px;
            margin: 14px 0;
            border: 1px solid #1f1f1f;
          }
          .discipline-item {
            padding: 8px 0;
            border-bottom: 1px solid #1a1a1a;
            font-size: 14px;
          }
          .discipline-item:last-child {
            border-bottom: none;
          }
          .stats-table {
            width: 100%;
            margin: 18px 0 6px;
            border-collapse: collapse;
          }
          .stat-col {
            width: 50%;
            padding: 14px 10px;
            background-color: #121212;
            border: 1px solid #222;
            text-align: center;
          }
          .stat-label {
            font-size: 11px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: bold;
          }
          .stat-value {
            font-size: 18px;
            color: #D4AF37;
            font-weight: 800;
            margin-top: 4px;
          }
          .cta-btn {
            display: block;
            width: fit-content;
            margin: 28px auto 10px;
            background: linear-gradient(135deg, #D4AF37 0%, #F5D060 100%);
            color: #000000 !important;
            text-decoration: none !important;
            font-weight: 900;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            padding: 16px 32px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(212, 175, 55, 0.35);
          }
          .footer {
            background-color: #070707;
            padding: 24px 28px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #1a1a1a;
          }
          .footer a {
            color: #D4AF37;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <img src="${brandLogoUrl}" alt="The Beast Hunter Challenge" class="logo" />
              <p class="tagline">India's Ultimate Physical Arena</p>
            </div>
            <div class="body">
              <div class="greeting">Dear ${gymName},</div>
              <p style="margin-top: 0;">Greetings from <strong>The Beast Hunter Challenge</strong>!</p>
              <p>We are officially inviting <strong>${gymName}</strong> to field your top trainers and athletes at India's premier functional endurance arena:</p>
              
              <div class="event-card">
                <div class="event-title">🏆 THE BEAST HUNTER 2026</div>
                <div class="disciplines-list">
                  <div class="discipline-item">🏃 <strong>Running Endurance</strong> <span style="color: #888;">(Stamina &amp; Speed)</span></div>
                  <div class="discipline-item">🚴 <strong>Cycling Sprint</strong> <span style="color: #888;">(Quad &amp; Cardiovascular Power)</span></div>
                  <div class="discipline-item">🏋️ <strong>Static Weight Holding</strong> <span style="color: #888;">(Raw Isometric Strength)</span></div>
                  <div class="discipline-item">💪 <strong>Dumbbell Endurance</strong> <span style="color: #888;">(Grip &amp; Shoulder Stability)</span></div>
                  <div class="discipline-item">🧘 <strong>Max-Time Core Plank</strong> <span style="color: #888;">(Unbreakable Willpower)</span></div>
                </div>
                
                <table class="stats-table" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="stat-col" style="border-radius: 6px 0 0 6px; border-right: 2px solid #000;">
                      <div class="stat-label">💰 Grand Prize Pool</div>
                      <div class="stat-value">₹1,00,000 Cash</div>
                    </td>
                    <td class="stat-col" style="border-radius: 0 6px 6px 0;">
                      <div class="stat-label">🎟️ Entry Fee</div>
                      <div class="stat-value" style="color: #ffffff;">₹1,500</div>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #121212; border-left: 3px solid #D4AF37; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 24px 0;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #D4AF37; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Why Field Athletes from ${gymName}?</p>
                <ul style="margin: 0; padding-left: 18px; color: #cccccc; font-size: 14px; line-height: 1.6;">
                  <li style="margin-bottom: 6px;"><strong>Brand Recognition:</strong> Showcase your gym's elite training standard on official media boards and live streams.</li>
                  <li><strong>Podium Glory:</strong> Put <strong>${gymName}</strong> at the top of the city's fitness leaderboard.</li>
                </ul>
              </div>

              ${customNote ? `<div style="background-color: #171717; padding: 14px 18px; border-radius: 6px; font-size: 13px; color: #e0e0e0; border: 1px dashed #D4AF37; margin: 20px 0;">${customNote}</div>` : ''}

              <div style="text-align: center; margin: 30px 0 10px;">
                <a href="https://thebeasthunterchallenge.com" target="_blank" class="cta-btn">Explore Details &amp; Register Slots &rarr;</a>
              </div>

              <p style="font-size: 13px; color: #888; text-align: center; margin-top: 15px;">
                <em>(For gym bulk delegations or group discount codes, reply to this email or WhatsApp us).</em>
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #222; font-size: 14px; color: #aaa; line-height: 1.6;">
                Best regards,<br/>
                <strong style="color: #fff;">The Beast Hunter Team</strong><br/>
                📞 Phone / WhatsApp: <a href="tel:+918421787508" style="color: #D4AF37; text-decoration: none;">+91 84217 87508</a><br/>
                🌐 Website: <a href="https://thebeasthunterchallenge.com" style="color: #D4AF37; text-decoration: none;">thebeasthunterchallenge.com</a>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0 0 6px 0;">&copy; ${new Date().getFullYear()} The Beast Hunter Challenge. All Rights Reserved.</p>
              <p style="margin: 0;">Mira Road 401107 | <a href="mailto:info@thebeasthunterchallenge.com">info@thebeasthunterchallenge.com</a></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendGymOutreachEmail(
  to: string,
  gymName: string,
  subject?: string,
  customNote?: string
): Promise<SendMailResult> {
  const finalSubject = subject || `Official Invitation: Will ${gymName} compete at The Beast Hunter 2026? 🏆`;
  const htmlContent = getGymOutreachEmailHtml(gymName, customNote);
  return sendEmail(to, finalSubject, htmlContent);
}

