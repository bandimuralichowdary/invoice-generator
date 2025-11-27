'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Coupon = {
  id?: string;
  code: string;
  min_amount: number;
  discount_percent: number;
  discount_amount: number;
  expiry: string | null;
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    min_amount: 0,
    discount_percent: 0,
    discount_amount: 0,
    expiry: null,
  });
  const [editing, setEditing] = useState<Coupon | null>(null);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    setCoupons(data || []);
    setLoading(false);
  }

  async function saveCoupon() {
    const payload = { ...newCoupon };
    if (!editing) delete payload.id;

    if (editing) {
      const { error } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', editing.id);
      if (error) return alert(error.message);
      setEditing(null);
    } else {
      const { error } = await supabase.from('coupons').insert([payload]);
      if (error) return alert(error.message);
    }

    setNewCoupon({
      code: '',
      min_amount: 0,
      discount_percent: 0,
      discount_amount: 0,
      expiry: null,
    });

    loadCoupons();
  }

  async function deleteCoupon(id: string) {
    if (!confirm('Delete coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return alert(error.message);
    setCoupons(c => c.filter(x => x.id !== id));
  }

  return (
    <div className="p-6 bg-gray-50 rounded shadow-md max-w-6xl mx-auto mt-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">Coupons Management</h3>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4 items-end">
        <input
          value={newCoupon.code}
          onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })}
          placeholder="Code"
          className="border border-gray-300 p-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newCoupon.min_amount}
          onChange={e => setNewCoupon({ ...newCoupon, min_amount: Number(e.target.value) })}
          placeholder="Min Amount"
          className="border border-gray-300 p-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newCoupon.discount_percent}
          onChange={e => setNewCoupon({ ...newCoupon, discount_percent: Number(e.target.value) })}
          placeholder="Discount %"
          className="border border-gray-300 p-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={newCoupon.discount_amount}
          onChange={e => setNewCoupon({ ...newCoupon, discount_amount: Number(e.target.value) })}
          placeholder="Discount ₹"
          className="border border-gray-300 p-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          value={newCoupon.expiry ? newCoupon.expiry.slice(0, 10) : ''}
          onChange={e => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
          className="border border-gray-300 p-2 rounded shadow-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={saveCoupon}
          className={`px-4 py-2 rounded text-white font-semibold ${
            editing ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {editing ? 'Save' : 'Add'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded shadow-md bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Code</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Min Amount</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">% Off</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">₹ Off</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Expiry</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-gray-800">{c.code}</td>
                  <td className="px-4 py-2 text-gray-800">₹{c.min_amount}</td>
                  <td className="px-4 py-2 text-gray-800">{c.discount_percent}</td>
                  <td className="px-4 py-2 text-gray-800">₹{c.discount_amount}</td>
                  <td className="px-4 py-2 text-gray-800">
                    {c.expiry ? new Date(c.expiry).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => setEditing(c)} className="text-blue-600 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCoupon(c.id!)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
