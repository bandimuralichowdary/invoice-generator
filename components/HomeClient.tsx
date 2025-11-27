'use client';

import React, { useEffect, useState } from 'react';
import useAdmin from './useAdmin';
import AdminPanel from './AdminPanel';
import AdminCoupons from './AdminCoupons';
import AdminInvoices from './AdminInvoices';
import InvoiceFormWrapper from './InvoiceFormWrapper';

export default function HomeClient() {
  const { isAdmin, logout } = useAdmin();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoice Generator</h1>

        {isAdmin && (
          <button
            onClick={logout}
            className="px-3 py-1 border rounded"
          >
            Logout Admin
          </button>
        )}
      </header>

      {isAdmin ? (
        <div className="space-y-4">
          <AdminPanel />
          <AdminCoupons />
          <AdminInvoices />
        </div>
      ) : (
        <InvoiceFormWrapper />
      )}
    </div>
  );
}
