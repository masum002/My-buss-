import { motion } from 'motion/react';
import { ShoppingBag, Zap, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCard({ product }: { product: Product; key?: any }) {
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  const price = typeof product.price === 'number' 
    ? product.price 
    : Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  const rawImageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop';
  const imageUrl = rawImageUrl.startsWith('/src/assets') 
    ? rawImageUrl.replace('/src/assets', '/assets') 
    : rawImageUrl;

  const handleBuyNow = () => {
    const item = { id: product.id, name: product.name, price: price, image: imageUrl };
    addItem(item);
    navigate('/checkout', { state: { directBuy: item } });
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
      
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <p className="text-black/30 text-[8px] md:text-[10px] uppercase font-black tracking-widest mb-1">
            {product.category}
          </p>
          <h3 className="text-black font-black text-sm md:text-xl leading-tight group-hover:text-orange-500 transition-colors uppercase italic line-clamp-2 min-h-[2.5rem] md:min-h-0">
            {product.name}
          </h3>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
             <span className="text-orange-500 font-black text-xl md:text-2xl italic tracking-tighter">৳{price.toLocaleString()}</span>
             {product.stock <= 5 && product.stock > 0 && (
               <span className="text-[8px] font-black uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Low Stock</span>
             )}
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addItem({ id: product.id, name: product.name, price: price, image: imageUrl })}
              className="py-3 bg-[#F8F9FA] border border-black/5 text-black text-[9px] font-black rounded-xl flex items-center justify-center gap-1.5 hover:bg-black hover:text-white transition-all active:scale-95 uppercase"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="py-3 bg-black text-white text-[9px] font-black rounded-xl flex items-center justify-center gap-1.5 hover:bg-orange-500 transition-all active:scale-95 uppercase shadow-xl shadow-black/10"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
