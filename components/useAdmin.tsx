'use client';
import { useEffect, useState } from 'react';

export default function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    try {
      const params = new URLSearchParams(window.location.search);
      const pass = params.get('adminPass');
      const expected = process.env.NEXT_PUBLIC_ADMIN_PASS ?? '';

      if (pass && pass === expected) {
        localStorage.setItem('isAdmin', '1');
        if (mounted) setIsAdmin(true);
        params.delete('adminPass');
        const queryString = params.toString() ? '?' + params.toString() : '';
        history.replaceState({}, '', `${location.pathname}${queryString}${location.hash || ''}`);
      } else {
        if (mounted) setIsAdmin(localStorage.getItem('isAdmin') === '1');
      }
    } catch (e) { console.error('useAdmin error:', e); }
    return () => { mounted = false; };
  }, []);

  const logout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
  };

  return { isAdmin, logout };
}
