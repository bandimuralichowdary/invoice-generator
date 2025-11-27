// app/api/verify-otp/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(req: Request) {
  const { email, code, purpose } = await req.json();
  if (!email || !code || !purpose) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const { data } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', code)
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return NextResponse.json({ ok: false, error: 'Invalid OTP' }, { status: 400 });

  const otp = data[0];
  if (new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: 'Expired OTP' }, { status: 400 });
  }

  // delete used otp
  await supabase.from('otp_codes').delete().eq('id', otp.id);

  return NextResponse.json({ ok: true });
}
