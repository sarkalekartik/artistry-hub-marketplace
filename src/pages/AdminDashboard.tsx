import { Users, Store, ShieldCheck, Activity, Package, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Order } from '../types';

export default function AdminDashboard() {
  const { user, socket } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState({ active: 0, total: 0 });

  useEffect(() => {
    if (user) {
      // Fetch all orders and products for admin
      Promise.all([
        fetch(`/api/orders?role=admin`).then(res => res.json()),
        fetch(`/api/products`).then(res => res.json())
      ]).then(([ordersData, productsData]) => {
        setOrders(ordersData);
        setProducts(productsData);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('new_order', (order: Order) => {
        setOrders(prev => [order, ...prev]);
      });
      socket.on('order_status_update', (order: Order) => {
        setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      });
      socket.on('visitor_update', (data: { active: number, total: number }) => {
        setVisitors(data);
      });
      socket.on('product_added', (product: any) => {
        setProducts(prev => [...prev, product]);
      });
      return () => {
        socket.off('new_order');
        socket.off('order_status_update');
        socket.off('visitor_update');
        socket.off('product_added');
      };
    }
  }, [socket]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Platform Admin</h1>
        <p className="text-zinc-500">System overview and management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Visitors Online" value={visitors.total.toString()} icon={<Users className="w-6 h-6 text-blue-600" />} />
        <StatCard title="Active Logged-in Users" value={visitors.active.toString()} icon={<Activity className="w-6 h-6 text-emerald-600" />} />
        <StatCard title="Total Products" value={products.length.toString()} icon={<Store className="w-6 h-6 text-amber-600" />} />
        <StatCard title="Total Orders" value={orders.length.toString()} icon={<Package className="w-6 h-6 text-purple-600" />} />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">System Wide Recent Orders</h2>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-zinc-50 text-zinc-500 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Seller</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No orders placed yet across the platform.
                  </td>
                </tr>
              ) : orders.map((order, i) => (
                <tr key={order.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900">{order.id}</td>
                  <td className="px-6 py-4">{order.customerId}</td>
                  <td className="px-6 py-4">{order.sellerId}</td>
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
                  <td className="px-6 py-4 text-right font-medium text-zinc-900">₹{order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Pending Artisan Verifications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Applicant Name</th>
                <th className="px-6 py-4 font-medium">Region</th>
                <th className="px-6 py-4 font-medium">Craft Type</th>
                <th className="px-6 py-4 font-medium">Date Applied</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {[
                { name: "Suresh Potters", region: "Rajasthan", craft: "Clay Art", date: "Today" },
                { name: "WeaveMaster", region: "Assam", craft: "Bamboo", date: "Yesterday" },
                { name: "Tribal Threads", region: "Gujarat", craft: "Embroidery", date: "Oct 12" },
              ].map((artisan, i) => (
                <tr key={i} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 font-medium text-zinc-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-zinc-600">
                      {artisan.name.charAt(0)}
                    </div>
                    {artisan.name}
                  </td>
                  <td className="px-6 py-4">{artisan.region}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                      {artisan.craft}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{artisan.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-emerald-600 font-medium hover:underline mr-4">Approve</button>
                    <button className="text-red-600 font-medium hover:underline">Reject</button>
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

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
      </div>
      <div className="p-3 bg-zinc-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}
