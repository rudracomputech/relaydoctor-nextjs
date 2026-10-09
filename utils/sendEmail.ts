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

    console.log(`[sendEmail Success] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('sendEmail Error:', error?.message || error);
    return { success: false, error: error?.message };
  }
}

export default sendEmail;
