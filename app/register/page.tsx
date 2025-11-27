// app/register/page.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

type Form = { name: string; email: string; password: string };
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const { register, handleSubmit } = useForm<Form>();
  const router = useRouter();

  async function onSubmit(values: Form) {
    localStorage.setItem('pending_register', JSON.stringify(values));
    await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: values.email, purpose: 'register' })
    });
    alert('OTP sent to email');
    router.push(`/register/verify?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('name')} placeholder="Full name" />
        <input {...register('email')} placeholder="Email" />
        <input {...register('password')} type="password" placeholder="Password" />
        <button className="bg-accent">Register Now</button>
      </form>
    </div>
  );
}
