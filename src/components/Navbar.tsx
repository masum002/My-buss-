import { Link } from 'react-router-dom';
import { ShoppingCart, Package, LayoutDashboard, Search } from 'lucide-react';
import { useCartStore } from '../lib/store';
import { motion } from 'motion/react';

export default function Navbar() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-white">
          FrenZ<span className="text-orange-500 text-stroke-white">way</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/track" className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-2 transition-colors">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">ট্র্যাকিং</span>
          </Link>
          
          <Link to="/cart" className="relative group">
            <ShoppingCart className="w-6 h-6 text-white group-hover:text-orange-500 transition-colors" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
              >
                {itemCount}
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
