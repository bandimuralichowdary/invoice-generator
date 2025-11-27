"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import InvoiceForm from '../../components/InvoiceForm';


export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/login');
      }
    }
    checkAuth();
  }, []);
return (
  <div className="p-4">
    <InvoiceForm />
  </div>
);
}