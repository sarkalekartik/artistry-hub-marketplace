import { Loader2, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Order } from '../types';
import { Link } from 'react-router-dom';

export default function CustomerOrders() {
  const { user, socket } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch(`/api/orders?role=customer&userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('order_status_update', (order: Order) => {
        if (order.customerId === user?.id) {
          setOrders(prev => prev.map(o => o.id === order.id ? order : o));
        }
      });
      return () => {
        socket.off('order_status_update');
      };
    }
  }, [socket, user]);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Please login to view orders</h2>
        <Link to="/login" className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8 flex items-center gap-3">
        <Package className="w-8 h-8 text-emerald-600" />
        My Orders
      </h1>
      
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-zinc-200">
            <p className="text-zinc-500 mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="text-emerald-600 font-medium hover:underline">Continue Shopping</Link>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <div className="flex flex-wrap justify-between items-start mb-4 pb-4 border-b border-zinc-100 gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Order ID</p>
                  <p className="font-bold text-zinc-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Date</p>
                  <p className="font-medium text-zinc-900">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Total</p>
                  <p className="font-bold text-zinc-900">₹{order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block
                    ${order.status === 'Pending' ? 'bg-zinc-100 text-zinc-800' : 
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-100" />
                    <div>
                      <p className="font-bold text-zinc-900">{item.name}</p>
                      <p className="text-sm text-zinc-500">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
