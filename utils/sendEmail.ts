import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  message?: string;
  html?: string;
}

export async function sendEmail({ to, subject, message, html }: SendEmailOptions) {
  try {
    const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;

    if (!user || !pass) {
      console.log(`[sendEmail Mock] TO: ${to} | SUBJECT: ${subject} | MESSAGE: ${message || html}`);
      return { success: true, mocked: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to,
      subject,
      text: message,
      html: html || message,
    });

    return { success: true };
  } catch (error: any) {
    console.error('sendEmail Error:', error?.message || error);
    // Return gracefully so registration/flow doesn't completely crash if SMTP credentials are temporarily invalid
    return { success: false, error: error?.message };
  }
}

export default sendEmail;
