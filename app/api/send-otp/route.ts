// app/api/send-otp/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
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

export async function POST(req: Request) {
  const { email, purpose } = await req.json();
  if (!email || !purpose) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

  const { error } = await supabase.from('otp_codes').insert([{ email, code, purpose, expires_at }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Your OTP for ${purpose}`,
    html: `<p>Your OTP is <b>${code}</b>. Expires in 10 minutes.</p>`
  });

  return NextResponse.json({ ok: true });
}
