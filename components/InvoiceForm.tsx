'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import InvoicePreview from './InvoicePreview';
import { exportInvoicePDF } from '../lib/pdf';

export default function InvoiceForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [companyName, setCompanyName] = useState('My Store');
  const [customerName, setCustomerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!mounted) return;
      setCategories(cats || []);
      setProducts(prods || []);
    }
    load();
    return () => { mounted = false };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  function addRow() {
    setRows(prev => [
      ...prev,
      { itemNo: prev.length + 1, category_id: '', productId: '', name: '', qty: 1, price: 0, gst_percent: 0, offer_percent: 0, finalPrice: 0, specs: {} }
    ]);
  }

  function setRow(idx: number, data: any) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...data } : r));
  }

  function onCategoryChange(idx: number, category_id: string) {
    setRow(idx, { category_id, productId: '', name: '', price: 0, gst_percent: 0, offer_percent: 0, specs: {} });
  }

  function onProductSelect(idx: number, productId: string) {
    const p = products.find(x => x.id === productId);
    if (!p) return;
    const finalPrice = Number(p.price) * (1 - Number(p.offer_percent) / 100) + (Number(p.price) * (1 - Number(p.offer_percent) / 100) * Number(p.gst_percent) / 100);
    setRow(idx, { productId, name: p.name, price: Number(p.price), gst_percent: Number(p.gst_percent), offer_percent: Number(p.offer_percent), specs: p.specs, finalPrice });
  }

  function incQty(idx: number, delta: number) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, qty: Math.max(0, (r.qty || 0) + delta) } : r));
  }

  function computeTotals() {
    const items = rows.filter(r => r.productId).map(r => {
      const price = Number(r.price);
      const offer = Number(r.offer_percent || 0);
      const gst = Number(r.gst_percent || 0);
      const discounted = price * (1 - offer / 100);
      const gstVal = discounted * gst / 100;
      const finalPrice = discounted + gstVal;
      return { ...r, price, offer_percent: offer, gst_percent: gst, finalPrice };
    });

    const subtotal = items.reduce((s: any, it: any) => s + it.price * (it.qty || 1), 0);
    const gst_total = items.reduce((s: any, it: any) => s + ((it.finalPrice - it.price) * (it.qty || 1)), 0);
    const totalBeforeCoupon = items.reduce((s: any, it: any) => s + it.finalPrice * (it.qty || 1), 0);
    const total = Math.max(0, totalBeforeCoupon - appliedDiscount);

    return { items, subtotal, gst_total, total };
  }

  async function applyCoupon() {
    if (!couponCode) return alert('Enter coupon');
    const { data } = await supabase.from('coupons').select('*').eq('code', couponCode).single();
    if (!data) return alert('Invalid coupon');
    const totals = computeTotals();
    let discount = 0;
    if (data.discount_amount && Number(data.discount_amount) > 0) discount = Number(data.discount_amount);
    else if (data.discount_percent && Number(data.discount_percent) > 0) discount = (totals.total * Number(data.discount_percent) / 100);
    setAppliedDiscount(discount);
    alert('Coupon applied');
  }

  async function generateBillAndSave() {
    const { items, subtotal, gst_total, total } = computeTotals();
    if (items.length === 0) return alert('Add items');
    const invoice_no = `INV-${Date.now()}`;

    const payload = { invoice_no, company_name: companyName, customer_name: customerName, mobile, items, subtotal, gst_total, discount: appliedDiscount, total, payment_mode: paymentMode };

    const { error } = await supabase.from('invoices').insert([payload]);
    if (error) return alert(error.message);

    for (const it of items) {
      const prod = products.find((p: any) => p.id === it.productId);
      if (!prod) continue;
      const newQty = (Number(prod.qty_available) || 0) - (it.qty || 1);
      await supabase.from('products').update({ qty_available: newQty }).eq('id', prod.id);
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.id = 'invoice-temp';
    container.innerHTML = generateInvoiceHtml(payload, invoice_no);
    document.body.appendChild(container);

    await exportInvoicePDF('invoice-temp', `${invoice_no}.pdf`);
    document.body.removeChild(container);

    alert('Invoice saved and downloaded');
    setRows([]);
    setAppliedDiscount(0);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-xl">

      <div className="bg-white/70 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-white/40">

        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-3xl text-gray-900 tracking-wide">✨ Invoice Generator</h3>
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition-all">Logout</button>
        </div>

        <div className="space-y-4">

          {/* Company + Customer */}
<div className="flex gap-3">
  <input
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    className="px-3 py-2 rounded-xl border bg-white shadow-inner focus:ring-2 focus:ring-blue-400 w-40"
    placeholder="Company / Store"
  />

  <input
    value={customerName}
    onChange={(e) => setCustomerName(e.target.value)}
    className="px-3 py-2 rounded-xl border bg-white shadow-inner focus:ring-2 focus:ring-blue-400 w-36"
    placeholder="Customer"
  />

  <input
    value={mobile}
    onChange={(e) => setMobile(e.target.value)}
    className="px-3 py-2 rounded-xl border bg-white shadow-inner focus:ring-2 focus:ring-blue-400 w-28"
    placeholder="Mobile"
  />
</div>

          <div className="bg-white/60 p-3 rounded-lg shadow-md border border-gray-300">
  <div className="flex justify-between items-center mb-2">
    <span className="font-semibold text-sm">Items</span>
    <button
      onClick={addRow}
      className="px-2 py-0.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow text-xs"
    >
      + Add
    </button>
  </div>

  <div className="space-y-1.5">
    {rows.map((r, idx) => (
      <div
        key={idx}
        className="grid grid-cols-10 gap-1 items-center bg-white p-1.5 rounded-md shadow"
      >

        <div className="text-[10px]">{r.itemNo}</div>

        <div className="col-span-2">
          <select
            value={r.category_id}
            onChange={e => onCategoryChange(idx, e.target.value)}
            className="border px-1 py-0.5 rounded w-full bg-white text-[10px] h-6"
          >
            <option value="">Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="col-span-3">
          <select
            value={r.productId}
            onChange={e => onProductSelect(idx, e.target.value)}
            className="border px-1 py-0.5 rounded w-full bg-white text-[10px] h-6"
          >
            <option value="">Select Product</option>
            {products
              .filter(p => !r.category_id || p.category_id === r.category_id)
              .map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="px-1 bg-gray-200 rounded text-[10px] h-5 flex items-center justify-center"
            onClick={() => incQty(idx, -1)}
          >
            -
          </button>

          <div className="px-1 text-[10px]">{r.qty}</div>

          <button
            className="px-1 bg-gray-200 rounded text-[10px] h-5 flex items-center justify-center"
            onClick={() => incQty(idx, 1)}
          >
            +
          </button>
        </div>

        {/* FIXED: Available count moved right + aligned */}
<div
  className="text-[10px] col-span-1"
  style={{ textAlign: "center", marginLeft: "6px" }}
>
          {(() => {
            const p = products.find(p => p.id === r.productId);
            return p ? p.qty_available : '-';
          })()}
        </div>

        <div className="text-[10px] font-semibold">
          ₹{Number(r.price || 0).toFixed(2)}
        </div>

        <div className="text-[10px] font-semibold text-green-700">
          ₹{Number(r.finalPrice || 0).toFixed(2)}
        </div>

      </div>
    ))}
  </div>
</div>


          <div className="flex gap-3">
            <input value={couponCode} onChange={e => setCouponCode(e.target.value)}
              placeholder="Apply coupon"
              className="flex-1 border p-3 rounded-xl bg-white shadow-inner focus:ring-2 focus:ring-blue-400" />
            <button onClick={applyCoupon} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow">Apply</button>
          </div>

          <div>
            <label className="block mb-1 font-medium">Payment Mode</label>
            <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}
              className="border p-3 rounded-xl bg-white shadow-inner">
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </div>

          <button onClick={generateBillAndSave}
            className="w-full mt-4 py-3 text-lg font-semibold bg-green-700 text-white rounded-xl shadow hover:bg-green-800 transition-all">
            Generate Bill & Download
          </button>

        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-2xl">
        <h3 className="font-bold text-2xl mb-3">Preview</h3>
        <InvoicePreview companyName={companyName} customerName={customerName} mobile={mobile} items={computeTotals().items} />
      </div>
    </div>
  );
}

function generateInvoiceHtml(payload: any, invoice_no: string) {
  const itemsHtml = (payload.items || []).map((it: any) => `
    <tr style="border-bottom:1px solid #ddd;">
      <td style="padding:8px;">${it.name}</td>
      <td style="padding:8px; text-align:center;">${it.qty}</td>
      <td style="padding:8px;">₹${Number(it.price).toFixed(2)}</td>
      <td style="padding:8px;">₹${Number(it.finalPrice * (it.qty || 1)).toFixed(2)}</td>
    </tr>`
  ).join('');

  return `
  <div style="font-family:Arial; padding:30px; width:800px; background:#fafafa; border-radius:20px;">
    <h1 style="font-size:28px; margin-bottom:5px;">${payload.company_name}</h1>
    <div style="font-size:14px;">Invoice: <b>${invoice_no}</b></div>
    <div style="font-size:14px;">Customer: ${payload.customer_name}</div>
    <br>

    <table width="100%" style="border-collapse:collapse; background:white; border-radius:12px; overflow:hidden;">
      <thead style="background:#f0f0f0;">
        <tr>
          <th style="padding:10px; text-align:left;">Product</th>
          <th style="padding:10px;">Qty</th>
          <th style="padding:10px;">Price</th>
          <th style="padding:10px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="text-align:right; margin-top:20px; font-size:18px;">
      <b>Total: ₹${Number(payload.total).toFixed(2)}</b>
    </div>
  </div>`;
}
