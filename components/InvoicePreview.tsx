'use client';
import React from 'react';

export default function InvoicePreview({ companyName='My Store', customerName='', mobile='', items=[] as any[], date = new Date() }) {
  const subtotal = items.reduce((s,a)=> s + (a.price * (a.qty||1)), 0);
  const gst_total = items.reduce((s,a)=> s + (((a.price * (1 - (a.offer_percent||0)/100))*(a.gst_percent||0)/100) * (a.qty||1)), 0);
  const total = items.reduce((s,a)=> s + (((a.price * (1 - (a.offer_percent||0)/100)) + ((a.price * (1 - (a.offer_percent||0)/100))*(a.gst_percent||0)/100)) * (a.qty||1)), 0);

  return (
    <div id="invoice-preview" className="p-5 bg-white shadow-xl rounded-2xl border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
          <div className="text-sm text-gray-600">Customer: {customerName}</div>
          <div className="text-sm text-gray-600">Mobile: {mobile}</div>
          <div className="text-sm text-gray-600">Date: {new Date(date).toLocaleString()}</div>
        </div>
      </div>

      <table className="w-full mt-4 text-sm border-collapse">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-2 text-left">Product</th>
            <th className="p-2">Qty</th>
            <th className="p-2">Price</th>
            <th className="p-2">Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((it:any)=>(
            <tr key={it.id || it.productId || Math.random()} className="border-b">
              <td className="p-2">
                <div className="font-medium text-gray-900">{it.name}</div>
                <div className="text-xs text-gray-500">{JSON.stringify(it.specs || {})}</div>
              </td>
              <td className="text-center p-2">{it.qty}</td>
              <td className="p-2">₹{Number(it.price).toFixed(2)}</td>
              <td className="p-2 font-semibold">₹{Number(it.finalPrice * (it.qty||1)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right mt-3">
        <div className="text-gray-700">Subtotal: ₹{subtotal.toFixed(2)}</div>
        <div className="text-gray-700">GST: ₹{gst_total.toFixed(2)}</div>
        <div className="font-bold text-xl text-gray-900">Total: ₹{total.toFixed(2)}</div>
      </div>
    </div>
  );
}
