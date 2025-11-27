// app/forgot/reset/ForgotResetForm.tsx
'use client';
import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ForgotResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') || '';
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');

  async function reset() {
    if (!pw || pw !== pw2) return alert('Passwords must match');
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword: pw }),
    });
    const json = await res.json();
    if (json.error) return alert(json.error);
    alert('Password updated. Please login.');
    router.push('/login');
  }

  return (
    <div className="auth-container">
      <h3>Reset Password</h3>
      <div className="mb-2 text-sm">Email: <b>{email}</b></div>
      <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="New Password" />
      <input value={pw2} onChange={e => setPw2(e.target.value)} type="password" placeholder="Confirm Password" />
      <button onClick={reset} className="bg-accent">Reset Password</button>
    </div>
  );
}
