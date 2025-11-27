'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HomeClient from '../components/HomeClient';
import { supabase } from '../lib/supabaseClient';
export const dynamic = 'force-dynamic';

export default function Home() {
  const params = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const adminEnv = process.env.NEXT_PUBLIC_ADMIN_PASS;
      const pass = params.get('adminPass');

      // Case 1 → adminPass in URL
      if (pass && adminEnv && pass === adminEnv) {
        localStorage.setItem('isAdmin', '1');
        setIsAdmin(true);
        router.replace('/'); // remove adminPass from URL
        setLoading(false);
        return;
      }

      // Case 2 → Already admin from before
      const ls = localStorage.getItem('isAdmin');
      if (ls === '1') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Case 3 → Check Supabase session for normal user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login'); // redirect if not logged in
        return;
      }

      setLoading(false); // logged-in user
    }

    checkAuth();
  }, [params, router]);

  if (loading) return <div>Loading...</div>;

  return <HomeClient />;
}
