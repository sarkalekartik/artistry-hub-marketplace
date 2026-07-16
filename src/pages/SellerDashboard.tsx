import { BarChart, IndianRupee, Package, ShoppingCart, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Order } from '../types';

export default function SellerDashboard() {
  const { user, socket } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', stock: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch(`/api/orders?role=seller&sellerId=${user.name}`).then(res => res.json()),
        fetch(`/api/products`).then(res => res.json())
      ]).then(([ordersData, productsData]) => {
        setOrders(ordersData);
        setProducts(productsData.filter((p: any) => p.sellerId === user.id));
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_order', (order: Order) => {
        if (order.sellerId === user?.name) {
          setOrders(prev => [order, ...prev]);
        }
      });
      socket.on('order_status_update', (order: Order) => {
        if (order.sellerId === user?.name) {
          setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        }
      });
      socket.on('product_added', (product: any) => {
        if (product.sellerId === user?.id) {
          setProducts(prev => [...prev, product]);
        }
      });
      return () => {
        socket.off('new_order');
        socket.off('order_status_update');
        socket.off('product_added');
      };
    }
  }, [socket, user]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Rejected').length;
  const totalRevenue = orders.filter(o => o.status !== 'Rejected' && o.status !== 'Pending').reduce((acc, o) => acc + o.total, 0);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsAdding(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          seller: user.name,
          sellerId: user.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAddProduct(false);
        setNewProduct({ name: '', category: '', price: '', stock: '' });
        alert('Product added successfully!');
      }
    } catch (error) {
      alert('Failed to add product');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Artisan Dashboard</h1>
          <p className="text-zinc-500">Welcome back, {user?.name}.</p>
        </div>
        <button 
          onClick={() => setShowAddProduct(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add New Product
        </button>
      </div>

      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-zinc-900">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
                <input 
                  type="text" 
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                <select 
                  required
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="Wooden Craft">Wooden Craft</option>
                  <option value="Clay Art">Clay Art</option>
                  <option value="Bamboo Products">Bamboo Products</option>
                  <option value="Paintings">Paintings</option>
                  <option value="Home Decor">Home Decor</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Stock</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 text-zinc-600 font-medium hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isAdding}
                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-zinc-400 flex items-center gap-2"
                >
                  {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isAdding ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={<IndianRupee className="w-6 h-6 text-emerald-600" />} />
        <StatCard title="Active Orders" value={activeOrders.toString()} icon={<ShoppingCart className="w-6 h-6 text-blue-600" />} />
        <StatCard title="Products" value={products.length.toString()} icon={<Package className="w-6 h-6 text-amber-600" />} />
        <StatCard title="Total Views" value="1,204" icon={<BarChart className="w-6 h-6 text-purple-600" />} trend="+5.2%" />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No orders yet.
                  </td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{order.id}</td>
                  <td className="px-6 py-4">
                    {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium 
                      ${order.status === 'Pending' ? 'bg-zinc-100 text-zinc-800' : 
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">₹{order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {order.status === 'Pending' && (
                      <>
                        <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="text-emerald-600 font-medium hover:underline">Accept</button>
                        <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="text-red-600 font-medium hover:underline">Reject</button>
                      </>
                    )}
                    {order.status === 'Accepted' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Processing')} className="text-blue-600 font-medium hover:underline">Process</button>
                    )}
                    {order.status === 'Processing' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="text-amber-600 font-medium hover:underline">Ship</button>
                    )}
                    {order.status === 'Shipped' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="text-emerald-600 font-medium hover:underline">Deliver</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
        {trend && (
          <p className="text-emerald-600 text-xs font-medium mt-2 flex items-center">
            {trend} from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-zinc-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}
