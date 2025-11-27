'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HomeClient from '../components/HomeClient';
import { supabase } from '../lib/supabaseClient';

export default function HomeClientWrapper() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const adminEnv = process.env.NEXT_PUBLIC_ADMIN_PASS;
      const pass = params.get('adminPass');

      // Case 1 → admin login through URL
      if (pass && adminEnv && pass === adminEnv) {
        localStorage.setItem('isAdmin', '1');
        setIsAdmin(true);
        router.replace('/'); // cleanup URL
        setLoading(false);
        return;
      }

      // Case 2 → already admin
      const ls = localStorage.getItem('isAdmin');
      if (ls === '1') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Case 3 → normal user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      setLoading(false);
    }

    checkAuth();
  }, [params, router]);

  if (loading) return <div>Loading...</div>;

  return <HomeClient />;
}
