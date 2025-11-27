'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function RegisterVerifyForm() {
  const params = useSearchParams();
  const router = useRouter();

  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  const pending =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('pending_register') || 'null')
      : null;

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  async function verify() {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code: otp, purpose: 'register' })
    });

    const json = await res.json();
    if (!json.ok) return alert(json.error || 'Invalid OTP');

    if (!pending) return alert('Missing registration data');

    const { name, email: em, password } = pending;

    const { data, error } = await supabase.auth.signUp({
      email: em,
      password
    });

    if (error) return alert(error.message);

    await supabase.from('profiles').insert([
      { id: data.user?.id, full_name: name }
    ]);

    localStorage.removeItem('pending_register');

    alert('Registration successful');
    router.push('/login');
  }

  async function resend() {
    if (timeLeft > 0) return;

    await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'register' })
    });

    setTimeLeft(60);
    alert('OTP resent');
  }

  return (
    <div className="auth-container">
      <h3>Verify OTP</h3>

      <div className="mb-2 text-sm">
        OTP sent to: <b>{email}</b>
      </div>

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />

      <div className="flex gap-2">
        <button onClick={verify} className="bg-green-600">
          Submit OTP
        </button>

        <button
          onClick={resend}
          className="border"
          disabled={timeLeft > 0}
        >
          {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
        </button>
      </div>
    </div>
  );
}
