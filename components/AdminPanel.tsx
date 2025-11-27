'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Prod = any;

export default function AdminPanel() {
  const [products, setProducts] = useState<Prod[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newCat, setNewCat] = useState('');
  const [editing, setEditing] = useState<Prod | null>(null);

  const [newProd, setNewProd] = useState({
    name: '',
    category_id: '',
    price: 0,
    gst_percent: 0,
    offer_percent: 0,
    qty_available: 0,
    specs: '{}'
  });

  // ---------------------------------
  // Load categories + products
  // ---------------------------------
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (mounted) {
        setCategories(cats || []);
        setProducts(prods || []);
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------------
  // Add Category
  // ---------------------------------
  async function addCategory() {
    if (!newCat) return;

    const { error } = await supabase
      .from('categories')
      .insert([{ name: newCat }]);

    if (error) return alert(error.message);

    setNewCat('');

    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });

    setCategories(data || []);
  }

  // ---------------------------------
  // Add Product
  // ---------------------------------
  async function addProduct() {
    try {
      const payload = {
        ...newProd,
        specs: JSON.parse(newProd.specs || '{}')
      };

      const { error } = await supabase
        .from('products')
        .insert([payload]);

      if (error) return alert(error.message);

      setNewProd({
        name: '',
        category_id: '',
        price: 0,
        gst_percent: 0,
        offer_percent: 0,
        qty_available: 0,
        specs: '{}'
      });

      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch {
      alert('Invalid specs JSON');
    }
  }

  // ---------------------------------
  // Update Product
  // ---------------------------------
  async function updateProduct() {
    if (!editing) return;

    const { error } = await supabase
      .from('products')
      .update(editing)
      .eq('id', editing.id);

    if (error) return alert(error.message);

    setEditing(null);

    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    setProducts(data || []);
  }

  // ---------------------------------
  // Delete Product
  // ---------------------------------
  async function deleteProduct(id: string) {
    if (!confirm('Delete product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return alert(error.message);

    setProducts(prev => prev.filter(x => x.id !== id));
  }

  // ---------------------------------
  // Render
  // ---------------------------------
  return (
    <div className="p-4 bg-white rounded shadow space-y-4">
      <h3 className="text-lg font-semibold">Admin — Products & Categories</h3>

      {/* Add Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          placeholder="New category"
          className="border p-2 rounded"
        />
        <button
          onClick={addCategory}
          className="px-3 py-2 bg-green-600 text-white rounded"
        >
          Add Category
        </button>
      </div>

      {/* Add Product */}
      <div className="p-3 border rounded bg-gray-50">
        <h4 className="font-semibold">Add Product</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            value={newProd.name}
            onChange={e => setNewProd({ ...newProd, name: e.target.value })}
            placeholder="Name"
            className="border p-2 rounded"
          />

          <select
            value={newProd.category_id}
            onChange={e =>
              setNewProd({ ...newProd, category_id: e.target.value })
            }
            className="border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={newProd.price}
            onChange={e =>
              setNewProd({ ...newProd, price: Number(e.target.value) })
            }
            placeholder="Price"
            className="border p-2 rounded"
          />

          <input
            type="number"
            value={newProd.gst_percent}
            onChange={e =>
              setNewProd({ ...newProd, gst_percent: Number(e.target.value) })
            }
            placeholder="GST %"
            className="border p-2 rounded"
          />

          <input
            type="number"
            value={newProd.offer_percent}
            onChange={e =>
              setNewProd({ ...newProd, offer_percent: Number(e.target.value) })
            }
            placeholder="Offer %"
            className="border p-2 rounded"
          />

          <input
            type="number"
            value={newProd.qty_available}
            onChange={e =>
              setNewProd({
                ...newProd,
                qty_available: Number(e.target.value)
              })
            }
            placeholder="Qty"
            className="border p-2 rounded"
          />

          <input
            value={newProd.specs}
            onChange={e =>
              setNewProd({ ...newProd, specs: e.target.value })
            }
            placeholder="specs JSON"
            className="col-span-full border p-2 rounded"
          />

          <button
            onClick={addProduct}
            className="col-span-full px-3 py-2 bg-blue-600 text-white rounded"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Product List */}
      <div>
        <h4 className="font-semibold">Existing Products</h4>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cat</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td>{p.name}</td>

                  <td>
                    {categories.find(c => c.id === p.category_id)?.name || '-'}
                  </td>

                  <td>₹{Number(p.price).toFixed(2)}</td>

                  <td>{p.qty_available}</td>

                  <td className="space-x-2">
                    <button
                      onClick={() => setEditing(p)}
                      className="text-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="p-3 border rounded bg-white">
          <h4 className="font-semibold">Edit Product</h4>

          <input
            value={editing.name}
            onChange={e =>
              setEditing({ ...editing, name: e.target.value })
            }
            className="border p-2 rounded w-full"
          />

          <div className="flex gap-2 mt-2">
            <input
              type="number"
              value={editing.price}
              onChange={e =>
                setEditing({ ...editing, price: Number(e.target.value) })
              }
              className="border p-2 rounded"
            />

            <input
              type="number"
              value={editing.gst_percent}
              onChange={e =>
                setEditing({
                  ...editing,
                  gst_percent: Number(e.target.value)
                })
              }
              className="border p-2 rounded"
            />

            <input
              type="number"
              value={editing.offer_percent}
              onChange={e =>
                setEditing({
                  ...editing,
                  offer_percent: Number(e.target.value)
                })
              }
              className="border p-2 rounded"
            />

            <input
              type="number"
              value={editing.qty_available}
              onChange={e =>
                setEditing({
                  ...editing,
                  qty_available: Number(e.target.value)
                })
              }
              className="border p-2 rounded"
            />
          </div>

          <textarea
            value={JSON.stringify(editing.specs || {})}
            onChange={e => {
              try {
                setEditing({
                  ...editing,
                  specs: JSON.parse(e.target.value)
                });
              } catch {
                // silently ignore invalid JSON
              }
            }}
            className="w-full h-24 mt-2 border p-2 rounded"
          />

          <div className="flex gap-2 mt-2">
            <button
              onClick={updateProduct}
              className="px-3 py-1 bg-green-600 text-white rounded"
            >
              Save
            </button>

            <button
              onClick={() => setEditing(null)}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
