import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Store, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        setAuth(data.role, data.user, 'dummy-jwt-token');
        navigate('/');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-zinc-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-zinc-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Sign in to your account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-zinc-300 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <a href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">Forgot password?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-zinc-300 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
          
          <div className="mt-4 text-center text-zinc-500 text-sm space-y-1">
            <p>Admin: <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">hackerin30@gmail.com</span> / <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">hackerin3011</span></p>
            <p>Seller: <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">seller@artistryhub.com</span> / <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">seller123</span></p>
            <p>Customer: <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">customer@example.com</span> / <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">password</span></p>
          </div>
        </form>
      </div>
    </div>
  );
}
