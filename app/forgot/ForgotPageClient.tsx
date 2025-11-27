"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function ForgotPageClient() {
  const { register, handleSubmit } = useForm<{ email: string }>();
  const router = useRouter();

  async function onSubmit(v: { email: string }) {
    await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: v.email, purpose: "reset" }),
    });

    alert("OTP sent");
    router.push(`/forgot/verify?email=${encodeURIComponent(v.email)}`);
  }

  return (
    <div className="auth-container">
      <h3 className="font-semibold mb-3">Forgot Password</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input
          {...register("email")}
          placeholder="Email"
          className="w-full border p-2 rounded"
        />

        <button className="w-full bg-accent text-white p-2 rounded">
          Send OTP
        </button>
      </form>
    </div>
  );
}
