// app/forgot/verify/page.tsx
'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';

export default function ForgotVerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');

  async function submit() {
    const res = await fetch('/api/verify-otp', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, code: otp, purpose: 'reset' })});
    const json = await res.json();
    if (!json.ok) return alert(json.error || 'Invalid OTP');
    router.push(`/forgot/reset?email=${encodeURIComponent(email)}`);
  }

  return (
    <div className="auth-container">
      <h3>Enter OTP</h3>
      <div className="mb-2 text-sm">OTP sent to: <b>{email}</b></div>
      <input value={otp} onChange={e=>setOtp(e.target.value)} placeholder="OTP" />
      <button onClick={submit} className="bg-green-600">Submit OTP</button>
    </div>
  );
}
