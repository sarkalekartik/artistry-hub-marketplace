import { Link } from 'react-router-dom';
import { ShoppingCart, Store, User, Search, Menu } from 'lucide-react';
import { useStore } from '../store';
import { useState } from 'react';

export default function Navbar() {
  const { cart, userRole, setAuth } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Store className="h-6 w-6 text-emerald-600" />
              <span className="font-sans font-bold text-xl tracking-tight text-zinc-900">Artistry Hub</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="w-full max-w-lg relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                placeholder="Search handcrafted products, artisans, categories..."
                className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-full text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-zinc-50"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {(!userRole || userRole === 'customer') ? (
              <div className="flex items-center gap-6">
                {!userRole ? (
                  <Link to="/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    Login / Register
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link to="/orders" className="text-sm font-medium text-zinc-600 hover:text-emerald-600">
                      My Orders
                    </Link>
                    <button onClick={() => setAuth(null, null, null)} className="text-sm font-medium text-red-600 hover:text-red-700">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-600">
                  {userRole === 'admin' ? 'Admin Mode' : 'Seller Mode'}
                </span>
                <button onClick={() => setAuth(null, null, null)} className="text-sm font-medium text-red-600 hover:text-red-700">
                  Logout
                </button>
              </div>
            )}

            {(!userRole || userRole === 'customer') && (
              <Link to="/cart" className="relative p-2 text-zinc-600 hover:text-emerald-600 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-zinc-600">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-lg text-sm bg-zinc-50 focus:outline-none"
            />
          </div>
          <Link to="/cart" className="flex items-center gap-2 text-zinc-600 font-medium p-2" onClick={() => setIsMenuOpen(false)}>
            <ShoppingCart className="h-5 w-5" />
            Cart ({totalItems})
          </Link>
          <div className="flex items-center gap-2 p-2 text-zinc-600 font-medium">
             <User className="h-5 w-5" />
             Account Options
          </div>
        </div>
      )}
    </nav>
  );
}
