import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { useState, useEffect } from 'react';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, user } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (useStore.getState().socket) {
      const socket = useStore.getState().socket!;
      socket.on('product_updated', (updatedProduct: any) => {
        const itemInCart = cart.find(i => i.id === updatedProduct.id);
        if (itemInCart) {
           useStore.setState(state => ({
             cart: state.cart.map(item => item.id === updatedProduct.id ? { ...item, stock: updatedProduct.stock } : item)
           }));
        }
      });
      return () => {
        socket.off('product_updated');
      };
    }
  }, [cart]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const gst = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + gst + shipping;

  const hasInvalidItems = cart.some(item => item.stock <= 0 || item.quantity > item.stock);

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          total,
          customerId: user.id
        })
      });
      const data = await res.json();
      
      if (data.success) {
        clearCart();
        alert('Order placed successfully! The artisan has been notified.');
        navigate('/'); // Could navigate to an orders page later
      }
    } catch (err) {
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-400">
          <ShoppingBagIcon className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">Your cart is empty</h2>
        <p className="text-zinc-500 mb-8 max-w-sm">Looks like you haven't added any handcrafted items to your cart yet.</p>
        <Link to="/" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <h1 className="text-3xl font-bold text-zinc-900 mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-6 bg-white p-4 sm:p-6 rounded-2xl border border-zinc-200 shadow-sm">
              <img src={item.image} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl bg-zinc-100" />
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-zinc-500 mb-1">By {item.seller}</p>
                    {item.stock <= 0 && <span className="text-xs font-bold text-red-500">OUT OF STOCK</span>}
                    {item.stock > 0 && item.quantity > item.stock && <span className="text-xs font-bold text-amber-500">Only {item.stock} available</span>}
                  </div>
                  <span className="font-bold text-lg text-zinc-900">₹{item.price}</span>
                </div>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-zinc-300 rounded-lg bg-white">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-zinc-50 rounded-l-lg transition-colors text-zinc-600"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center font-medium text-sm text-zinc-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-zinc-50 rounded-r-lg transition-colors text-zinc-600"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 pb-6 border-b border-zinc-100 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Estimated Shipping</span>
                <span className="font-medium text-zinc-900">₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Estimated GST (18%)</span>
                <span className="font-medium text-zinc-900">₹{gst.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-lg text-zinc-900">Total</span>
              <span className="font-bold text-2xl text-emerald-600">₹{total.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading || hasInvalidItems}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:bg-zinc-400"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Proceed to Checkout'}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingBagIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
