import { motion } from 'motion/react';
import { ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCard({ product }: { product: Product; key?: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const price = Number(product.price) || 0;
  const rawImageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop';
  const imageUrl = rawImageUrl.startsWith('/src/assets') 
    ? rawImageUrl.replace('/src/assets', '/assets') 
    : rawImageUrl;

  const handleBuyNow = () => {
    addItem({ id: product.id, name: product.name, price: price, image: imageUrl });
    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-black/5 hover:border-orange-500/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
    >
      <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-[#F8F9FA] relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {product.isHot && (
             <span className="bg-red-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-red-500/20 animate-pulse">Hot</span>
           )}
           {product.isTopSale && (
             <span className="bg-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase shadow-lg shadow-orange-500/20">Top Sale</span>
           )}
        </div>
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <span className="bg-white text-black p-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform shadow-xl">
             <ArrowRight className="w-5 h-5" />
           </span>
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-black font-black text-lg leading-tight group-hover:text-orange-500 transition-colors uppercase italic truncate mr-2">
            {product.name}
          </h3>
          <span className="text-orange-500 font-black text-xl italic">৳{price.toLocaleString()}</span>
        </div>
        <p className="text-black/40 text-[10px] uppercase font-black tracking-widest mb-6 px-1">
          {product.category}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => addItem({ id: product.id, name: product.name, price: price, image: imageUrl })}
            className="py-4 bg-[#F8F9FA] border border-black/5 text-black text-[10px] font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all active:scale-95 uppercase tracking-tighter"
          >
            <ShoppingBag className="w-3 h-3" />
            + Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="py-4 bg-black text-white text-[10px] font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-500 transition-all active:scale-95 uppercase shadow-xl shadow-black/10 tracking-tighter"
          >
            <Zap className="w-3 h-3 fill-current" />
            Direct Order
          </button>
        </div>
      </div>
    </motion.div>
  );
}
