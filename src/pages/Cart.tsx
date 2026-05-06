import { motion } from 'motion/react';
import { useCartStore } from '../lib/store';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="pt-32 min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-white/20" />
        </div>
        <h2 className="text-2xl font-black uppercase mb-2">Cart is Empty</h2>
        <p className="text-white/40 mb-8 max-w-xs text-center">Your zen journey starts with a single high-tech addition.</p>
        <Link to="/" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all">
          Explore Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#050505] text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-12 tracking-tighter">Your <span className="text-orange-500 text-stroke-white">Selection</span></h1>
        
        <div className="space-y-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl group"
            >
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg truncate">{item.name}</h3>
                <p className="text-orange-500 font-bold">৳{item.price}</p>
              </div>

              <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:text-orange-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-4 text-center font-bold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:text-orange-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-2 text-white/20 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-8 bg-white text-black rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <span className="font-bold text-black/50">Subtotal</span>
            <span className="text-3xl font-black">৳{total.toFixed(2)}</span>
          </div>
          <p className="text-sm text-black/40 mb-8 italic italic">Shipping and taxes calculated at next step. Frictionless tracking included.</p>
          
          <Link
            to="/checkout"
            className="w-full py-4 bg-black text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-95"
          >
            Checkout Securely
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
