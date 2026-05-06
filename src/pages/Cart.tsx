import { motion } from 'motion/react';
import { useCartStore } from '../lib/store';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, updateQuantity, removeItem, getTotal } = useCartStore();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="pt-32 min-h-screen bg-[#F4F5F7] text-[#1A1A1A] flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-white border border-black/5 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-black/10" />
        </div>
        <h2 className="text-2xl font-black uppercase mb-2 tracking-tighter italic">Cart is Empty</h2>
        <p className="text-black/40 mb-8 max-w-xs text-center font-medium">Your tech journey starts with a single high-tech addition.</p>
        <Link to="/" className="px-12 py-4 bg-black text-white font-black uppercase text-xs rounded-xl shadow-xl hover:bg-orange-500 transition-all">
          Explore Drops
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#F4F5F7] text-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-12 tracking-tighter italic">Your <span className="text-orange-500 text-stroke-black">Selection</span></h1>
        
        <div className="space-y-6">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-4 bg-white border border-black/5 p-6 rounded-[2rem] group shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <div className="w-24 h-24 bg-[#F8F9FA] rounded-2xl overflow-hidden p-2 flex items-center justify-center">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-1 min-w-0 px-2">
                <h3 className="font-black text-lg truncate uppercase italic tracking-tighter">{item.name}</h3>
                <p className="text-orange-500 font-black italic">৳{Number(item.price).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-3 bg-[#F8F9FA] rounded-xl p-2 border border-black/5">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 hover:text-orange-500 transition-colors text-black/40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 hover:text-orange-500 transition-colors text-black/40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 p-12 bg-white border border-black/5 rounded-[3rem] shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <span className="text-[10px] font-black uppercase text-black/40 tracking-widest">Order Subtotal</span>
            <span className="text-4xl font-black italic">৳{total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-black/40 mb-12 font-medium italic">Shipping and taxes calculated at next step. Frictionless tracking included.</p>
          
          <Link
            to="/checkout"
            className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:bg-orange-500 hover:-translate-y-1 transition-all active:translate-y-0"
          >
            Checkout Securely
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
