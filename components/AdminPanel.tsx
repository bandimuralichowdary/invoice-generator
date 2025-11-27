'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Prod = any;

export default function AdminPanel() {
  const [products, setProducts] = useState<Prod[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [editing, setEditing] = useState<Prod | null>(null);
  const [newProd, setNewProd] = useState({
    name: '', category_id: '', price: 0, gst_percent: 0, offer_percent: 0, qty_available: 0, specs: '{}'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    const { data: prods } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setCategories(cats || []);
    setProducts(prods || []);
    setLoading(false);
  }

  // CATEGORY HANDLERS
  async function addCategory() {
    if (!newCat) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', name: newCat })
    });
    const result = await res.json();
    if (result.error) return alert(result.error);
    setNewCat('');
    loadData();
  }

  async function editCategory(id: string, name: string) {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'edit', id, name })
    });
    const result = await res.json();
    if (result.error) return alert(result.error);
    setEditingCat(null);
    loadData();
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category?')) return;
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id })
    });
    const result = await res.json();
    if (result.error) return alert(result.error);
    loadData();
  }

  // PRODUCT HANDLERS
  async function addProduct() {
    try {
      const payload = { ...newProd, specs: JSON.parse(newProd.specs || '{}') };
      const { error } = await supabase.from('products').insert([payload]);
      if (error) return alert(error.message);
      setNewProd({ name:'', category_id:'', price:0, gst_percent:0, offer_percent:0, qty_available:0, specs: '{}' });
      loadData();
    } catch (e:any) { alert('Invalid specs JSON'); }
  }

  async function updateProduct() {
    if (!editing) return;
    const { error } = await supabase.from('products').update(editing).eq('id', editing.id);
    if (error) return alert(error.message);
    setEditing(null);
    loadData();
  }

  async function deleteProduct(id:string) {
    if (!confirm('Delete product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return alert(error.message);
    setProducts(p => p.filter(x=>x.id!==id));
  }

  return (
    <div className="p-4 bg-white rounded shadow space-y-6">

      <h3 className="text-lg font-semibold">Admin — Categories</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="New category" className="border p-2 rounded"/>
        <button onClick={addCategory} className="px-3 py-2 bg-green-600 text-white rounded">Add Category</button>
      </div>

      <div>
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-sm mb-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id} className="border-t">
                  <td>
                    {editingCat?.id === c.id ? (
                      <input
                        value={editingCat.name}
                        onChange={e => setEditingCat({...editingCat, name: e.target.value})}
                        className="border p-1 rounded w-full"
                      />
                    ) : c.name}
                  </td>
                  <td className="space-x-2">
                    {editingCat?.id === c.id ? (
                      <>
                        <button onClick={()=>editCategory(c.id, editingCat.name)} className="text-green-600">Save</button>
                        <button onClick={()=>setEditingCat(null)} className="text-gray-600">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={()=>setEditingCat(c)} className="text-blue-600">Edit</button>
                        <button onClick={()=>deleteCategory(c.id)} className="text-red-600">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-3 border rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">Add Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input value={newProd.name} onChange={e=>setNewProd({...newProd,name:e.target.value})} placeholder="Name" className="border p-2 rounded"/>
          <select value={newProd.category_id} onChange={e=>setNewProd({...newProd,category_id:e.target.value})} className="border p-2 rounded">
            <option value="">Select Category</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="number" value={newProd.price} onChange={e=>setNewProd({...newProd,price:Number(e.target.value)})} placeholder="Price" className="border p-2 rounded"/>
          <input type="number" value={newProd.gst_percent} onChange={e=>setNewProd({...newProd,gst_percent:Number(e.target.value)})} placeholder="GST %" className="border p-2 rounded"/>
          <input type="number" value={newProd.offer_percent} onChange={e=>setNewProd({...newProd,offer_percent:Number(e.target.value)})} placeholder="Offer %" className="border p-2 rounded"/>
          <input type="number" value={newProd.qty_available} onChange={e=>setNewProd({...newProd,qty_available:Number(e.target.value)})} placeholder="Qty" className="border p-2 rounded"/>
          <input value={newProd.specs} onChange={e=>setNewProd({...newProd,specs:e.target.value})} placeholder="specs JSON" className="col-span-full border p-2 rounded"/>
          <button onClick={addProduct} className="col-span-full px-3 py-2 bg-blue-600 text-white rounded">Add Product</button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Existing Products</h3>
        {loading ? <div>Loading...</div> : (
          <table className="w-full text-sm">
            <thead><tr><th>Name</th><th>Cat</th><th>Price</th><th>Qty</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p:any)=>(
                <tr key={p.id} className="border-t">
                  <td>{p.name}</td>
                  <td>{categories.find(c=>c.id===p.category_id)?.name || '-'}</td>
                  <td>₹{Number(p.price).toFixed(2)}</td>
                  <td>{p.qty_available}</td>
                  <td className="space-x-2">
                    <button onClick={()=>setEditing(p)} className="text-blue-600">Edit</button>
                    <button onClick={()=>deleteProduct(p.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="p-3 border rounded bg-white">
          <h4 className="font-semibold">Edit Product</h4>
          <input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="border p-2 rounded w-full"/>
          <div className="flex gap-2 mt-2">
            <input type="number" value={editing.price} onChange={e=>setEditing({...editing,price:Number(e.target.value)})} className="border p-2 rounded"/>
            <input type="number" value={editing.gst_percent} onChange={e=>setEditing({...editing,gst_percent:Number(e.target.value)})} className="border p-2 rounded"/>
            <input type="number" value={editing.offer_percent} onChange={e=>setEditing({...editing,offer_percent:Number(e.target.value)})} className="border p-2 rounded"/>
            <input type="number" value={editing.qty_available} onChange={e=>setEditing({...editing,qty_available:Number(e.target.value)})} className="border p-2 rounded"/>
          </div>
          <textarea value={JSON.stringify(editing.specs||{})} onChange={e=>{ try{setEditing({...editing,specs:JSON.parse(e.target.value)})}catch{} }} className="w-full h-24 mt-2 border p-2 rounded"/>
          <div className="flex gap-2 mt-2">
            <button onClick={updateProduct} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
            <button onClick={()=>setEditing(null)} className="px-3 py-1 border rounded">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
