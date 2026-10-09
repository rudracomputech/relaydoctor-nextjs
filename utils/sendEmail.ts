import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  message?: string;
  html?: string;
}

export async function sendEmail({ to, subject, message, html }: SendEmailOptions) {
  try {
    // ── 1. Resend API (Preferred for Vercel) ──────────────────────────
    const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND_KEY;
    if (resendApiKey) {
      const from =
        process.env.RESEND_FROM ||
        process.env.EMAIL_FROM ||
        'RelayDoctor <onboarding@resend.dev>';

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          text: message,
          html: html || (message ? `<p>${message.replace(/\n/g, '<br/>')}</p>` : ''),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('[Resend Error]', response.status, data);
        return { success: false, error: data?.message || JSON.stringify(data) };
      }

      console.log(`[Resend Success] Sent to ${to}:`, data.id);
      return { success: true, id: data.id };
    }

    // ── 2. Nodemailer SMTP Fallback ────────────────────────────────────
    const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!user || !pass) {
      console.log(
        `[sendEmail Mock] Neither RESEND_API_KEY nor SMTP configured. TO: ${to} | SUBJECT: ${subject} | MESSAGE: ${message || html}`
      );
      return { success: true, mocked: true };
    }

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const isGmail = host.includes('gmail');

    const transporter = nodemailer.createTransport(
      isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
          }
        : {
            host,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user, pass },
          }
    );

    const info = await transporter.sendMail({
      from: `"RelayDoctor" <${user}>`,
      to,
      subject,
      text: message,
      html: html || message,
    });

    console.log(`[sendEmail SMTP Success] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('sendEmail Error:', error?.message || error);
    return { success: false, error: error?.message };
  }
}

export default sendEmail;
