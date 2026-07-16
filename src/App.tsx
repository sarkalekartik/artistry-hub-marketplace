import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import CustomerOrders from './pages/CustomerOrders';
import AIAssistant from './components/AIAssistant';
import { useStore } from './store';

export default function App() {
  const { userRole } = useStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
        <Navbar />
        <main className="flex-1 flex flex-col relative">
          {userRole === 'seller' ? (
            <Routes>
              <Route path="/" element={<SellerDashboard />} />
            </Routes>
          ) : userRole === 'admin' ? (
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
            </Routes>
          ) : (
            <>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<CustomerOrders />} />
                <Route path="/login" element={<Login />} />
              </Routes>
              <AIAssistant />
            </>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}
