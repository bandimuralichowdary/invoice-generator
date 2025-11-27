'use client';

import { useEffect, useState } from 'react';

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Run only in browser (prevents SSR crashes on Vercel)
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const pass = params.get('adminPass');
      const expected = process.env.NEXT_PUBLIC_ADMIN_PASS ?? '';

      if (pass && pass === expected) {
        localStorage.setItem('isAdmin', '1');
        if (mounted) setIsAdmin(true);

        // Remove adminPass from URL safely
        params.delete('adminPass');
        const qs = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, '', `${window.location.pathname}${qs}${window.location.hash || ''}`);
      } else {
        if (mounted) setIsAdmin(localStorage.getItem('isAdmin') === '1');
      }
    } catch (e) {
      console.error('useAdmin error:', e);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const logout = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  };

  return { isAdmin, logout };
}
