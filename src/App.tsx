import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ShoppingCart, Package, LayoutDashboard, Search } from 'lucide-react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <Router>
      <div className="bg-[#050505] min-h-screen">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track" element={<OrderTracking />} />
              <Route path="/zen-admin" element={<AdminDashboard />} />
            </Routes>
          </AnimatePresence>
        </main>
        
        <footer className="py-12 px-4 border-t border-white/10 text-center text-white/30 text-xs">
          <div className="max-w-7xl mx-auto">
            <p className="mb-4">© 2026 ZENSTORE ECOGLIDE. ALL RIGHTS RESERVED.</p>
            <div className="flex justify-center gap-6 mb-8 uppercase tracking-widest font-black">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Shipping</span>
            </div>
            {/* Removed sticky buy now as requested */}
          </div>
        </footer>
      </div>
    </Router>
  );
}
