import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ShoppingCart, Package, LayoutDashboard, Search } from 'lucide-react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetail from './pages/ProductDetail';
import Support from './pages/Support';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const location = useLocation();

  return (
    <div className="bg-[#F4F5F7] min-h-screen">
      <Navbar />
      <main>
        <AnimatePresence mode="popLayout">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/track" element={<OrderTracking />} />
            <Route path="/support" element={<Support />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/FrenZway" element={<AdminDashboard />} />
          </Routes>
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
