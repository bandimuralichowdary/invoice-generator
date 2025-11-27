'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { exportInvoicePDF } from '../lib/pdf';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (mounted) setInvoices(data || []);
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function deleteInvoice(id:string) {
    if (!confirm('Delete invoice?')) return;
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) return alert(error.message);
    setInvoices(prev => prev.filter(i=>i.id !== id));
  }

  async function exportInvoice(inv:any) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.id = 'admin-invoice-export';
    container.innerHTML = generateInvoiceHtml(inv);
    document.body.appendChild(container);
    await exportInvoicePDF('admin-invoice-export', `${inv.invoice_no}.pdf`);
    document.body.removeChild(container);
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">Generated Bills</h3>
      <div className="space-y-2">
        {invoices.map(inv => (
          <div key={inv.id} className="p-3 border rounded flex justify-between">
            <div>
              <div className="font-semibold">{inv.invoice_no} — {inv.company_name}</div>
              <div className="text-sm">Customer: {inv.customer_name} • {new Date(inv.date).toLocaleString()}</div>
              <div className="text-sm">Total: ₹{Number(inv.total).toFixed(2)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>exportInvoice(inv)} className="px-2 py-1 bg-blue-600 text-white rounded">Download</button>
              <button onClick={()=>deleteInvoice(inv.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
        {invoices.length === 0 && <div className="text-sm text-gray-500">No bills generated yet.</div>}
      </div>
    </div>
  );
}

function generateInvoiceHtml(inv: any) {
  const itemsHtml = (inv.items || []).map((it:any) => `<tr><td>${it.name}</td><td>${it.qty}</td><td>₹${Number(it.price).toFixed(2)}</td><td>₹${Number(it.finalPrice).toFixed(2)}</td></tr>`).join('');
  return `<div style="font-family:Arial; padding:20px; width:800px;">
    <h1>${inv.company_name}</h1>
    <div>Invoice: ${inv.invoice_no}</div>
    <div>Customer: ${inv.customer_name} • ${inv.mobile || ''}</div>
    <table width="100%" style="border-collapse:collapse; margin-top:12px;">
      <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div style="text-align:right; margin-top:12px;">Total: ₹${Number(inv.total).toFixed(2)}</div>
  </div>`;
}
