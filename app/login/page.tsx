// app/login/page.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabaseClient';

type Form = { email: string; password: string };

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const { register, handleSubmit } = useForm<Form>();
  const router = useRouter();

  async function onSubmit(data: Form) {
    const { email, password } = data;
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.replace('/dashboard');
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('email')} placeholder="Email" />
        <input {...register('password')} type="password" placeholder="Password" />
        <div className="flex">
          <a href="/register">Register</a>
          <a href="/forgot">Forgot Password</a>
        </div>
        <button className="bg-accent">Login</button>
      </form>
    </div>
  );
}
