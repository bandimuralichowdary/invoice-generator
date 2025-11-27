// lib/serverMail.ts
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendOtpEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({ from: process.env.SMTP_USER, to, subject, html });
}
