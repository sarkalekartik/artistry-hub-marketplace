import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useStore();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        navigate('/');
      });
  }, [id, navigate]);

  useEffect(() => {
    if (useStore.getState().socket) {
      const socket = useStore.getState().socket!;
      socket.on('product_updated', (updatedProduct: Product) => {
        if (updatedProduct.id === id) {
          setProduct(updatedProduct);
        }
      });
      return () => {
        socket.off('product_updated');
      };
    }
  }, [id]);

  if (loading || !product) {
    return <div className="p-12 text-center text-zinc-500">Loading product...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-100 flex flex-col md:flex-row gap-12">
        <div className="md:w-1/2 rounded-2xl overflow-hidden bg-zinc-100">
          <img src={product.image} alt={product.name} className="w-full h-auto object-cover aspect-square" />
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <div className="text-sm font-bold tracking-wider text-emerald-600 uppercase mb-3">
            {product.category}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-100">
            <div className="flex items-center text-amber-500 font-medium">
              <Star className="h-5 w-5 fill-current mr-1" />
              {product.rating} <span className="text-zinc-400 ml-2 font-normal">(124 reviews)</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
            <div className="text-sm text-zinc-600 font-medium">Artisan: <span className="text-zinc-900">{product.seller}</span></div>
          </div>

          <div className="text-4xl font-bold text-zinc-900 mb-6">
            ₹{product.price}
          </div>

          <p className="text-zinc-600 leading-relaxed mb-8">
            {product.description || "Authentic handcrafted masterpiece made with locally sourced materials. Each piece is unique and supports rural livelihoods, preserving traditional techniques passed down through generations."}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Authenticity Guaranteed
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
              <Truck className="h-5 w-5 text-emerald-500" />
              Pan-India Delivery
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="px-6 py-4 rounded-xl border border-zinc-300 hover:border-zinc-400 text-zinc-700 font-bold flex items-center justify-center gap-2 transition-colors bg-white">
              <MessageCircle className="h-5 w-5" />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
