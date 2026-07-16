import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import { useStore } from '../store';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (useStore.getState().socket) {
      const socket = useStore.getState().socket!;
      socket.on('product_updated', (updatedProduct: Product) => {
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      });
      socket.on('product_added', (newProduct: Product) => {
        setProducts(prev => [...prev, newProduct]);
      });
      return () => {
        socket.off('product_updated');
        socket.off('product_added');
      };
    }
  }, []);

  const categories = ["Wooden Craft", "Clay Art", "Bamboo Products", "Paintings", "Home Decor"];

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=2000" 
            alt="Artisans at work" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          >
            Empowering Rural Artisans.<br className="hidden sm:block" /> Bringing Heritage to Your Home.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl text-lg sm:text-xl text-zinc-300 mb-10"
          >
            Discover authentic handcrafted masterpieces directly from the skilled hands of India's finest rural artisans.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Shop the Collection
          </motion.button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Explore Categories
          </h2>
          <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar">
            {categories.map((cat, i) => (
              <button 
                key={i} 
                className="whitespace-nowrap px-6 py-3 rounded-full border border-zinc-200 bg-white hover:border-emerald-500 hover:text-emerald-700 font-medium transition-colors shadow-sm"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
            Trending Masterpieces
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(n => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-zinc-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={product.id} 
                >
                  <Link to={`/product/${product.id}`} className="group block bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:shadow-xl hover:border-emerald-100 transition-all">
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="text-xs font-semibold text-emerald-600 mb-2 tracking-wider uppercase flex justify-between">
                        <span>{product.category}</span>
                        {product.stock <= 0 && <span className="text-red-500 font-bold">OUT OF STOCK</span>}
                        {product.stock > 0 && product.stock <= 5 && <span className="text-amber-500">Only {product.stock} left</span>}
                      </div>
                      <h3 className="font-bold text-lg text-zinc-900 mb-1 truncate">{product.name}</h3>
                      <p className="text-sm text-zinc-500 mb-3 truncate">By {product.seller}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xl text-zinc-900">₹{product.price}</span>
                        <div className="flex items-center text-amber-500 text-sm font-medium">
                          <Star className="h-4 w-4 fill-current mr-1" />
                          {product.rating}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
