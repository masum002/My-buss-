import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getDocument } from '../lib/firestore';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { ShoppingBag, Zap, ArrowLeft, ShieldCheck, Truck, Clock, Star, Share2, Plus, Minus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const data = await getDocument<Product>('products', id);
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen bg-[#F4F5F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 min-h-screen bg-[#F4F5F7] text-center px-4">
        <h2 className="text-3xl font-black uppercase italic italic tracking-tighter mb-4">Discovery Error</h2>
        <p className="text-black/40 mb-8 font-medium">The requested tech asset could not be located in our inventory.</p>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-black text-white font-black uppercase rounded-xl">Return to Hub</button>
      </div>
    );
  }

  const price = typeof product.price === 'number' ? product.price : Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  const productImages = product.images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'];
  const [quantity, setQuantity] = useState(1);

  const handleBuyNow = () => {
    const item = { id: product.id, name: product.name, price: price, image: productImages[0], quantity };
    addItem(item);
    navigate('/checkout', { state: { directBuy: item } });
  };

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#F4F5F7] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-orange-500 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square bg-white rounded-[3rem] p-8 border border-black/5 flex items-center justify-center overflow-hidden shadow-sm group relative"
            >
              <img 
                src={productImages[activeImage]} 
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {product.isHot && (
                <div className="absolute top-8 left-8 bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl animate-pulse">Trending Now</div>
              )}
            </motion.div>
            
            {productImages.length > 1 && (
              <div className="flex gap-4">
                {productImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-24 h-24 rounded-2xl bg-white border-2 transition-all p-2 flex items-center justify-center overflow-hidden ${
                      activeImage === idx ? 'border-orange-500 shadow-lg' : 'border-black/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-8">
               <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 bg-white border border-black/5 rounded-full text-[10px] font-black uppercase tracking-widest text-black/40 italic">
                   {product.category}
                 </span>
                 <div className="flex text-orange-500">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                 </div>
               </div>
               <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] italic mb-6">
                 {product.name}
               </h1>
               <div className="flex items-baseline gap-4 mb-8">
                 <span className="text-5xl font-black text-orange-500 italic tracking-tighter">৳{price.toLocaleString()}</span>
                 {product.stock > 0 ? (
                   <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/10">In Stock: {product.stock} Units</span>
                 ) : (
                   <span className="text-[10px] font-black uppercase text-red-500 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10">Out of Stock</span>
                 )}
               </div>
               
               <div className="p-8 bg-white rounded-[2.5rem] border border-black/5 shadow-sm mb-12">
                  <p className="text-black/60 leading-relaxed font-medium italic whitespace-pre-wrap">
                    {product.description || 'No description available for this cutting-edge selection.'}
                  </p>
               </div>
            </div>
            
            {/* Quantity Selector */}
            <div className="mb-8 p-1">
               <p className="text-[10px] font-black uppercase text-black/30 tracking-widest px-1 mb-3">Units Requested</p>
               <div className="flex items-center gap-6 bg-white border border-black/5 p-4 rounded-3xl w-fit shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all text-black/40 border border-black/5 active:scale-90"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-black text-2xl italic tracking-tighter">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-orange-500 hover:text-white transition-all text-black/40 border border-black/5 active:scale-90"
                  >
                     <Plus className="w-5 h-5" />
                  </button>
               </div>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-12">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => addItem({ id: product.id, name: product.name, price: price, image: productImages[0], quantity })}
                    disabled={product.stock <= 0}
                    className="w-full py-6 bg-[#F8F9FA] border border-black/5 text-black text-sm font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all active:scale-95 uppercase tracking-widest disabled:opacity-50"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Archive to Cart
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="w-full py-6 bg-black text-white text-sm font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-500 transition-all active:scale-95 uppercase tracking-widest shadow-2xl shadow-black/20 disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5 fill-current" />
                    Direct Protocol (Buy Now)
                  </button>
               </div>
               <button className="w-full py-4 bg-white border border-black/5 text-black/40 text-[10px] font-black rounded-xl uppercase tracking-widest hover:text-black transition-colors flex items-center justify-center gap-2">
                 <Share2 className="w-3 h-3" />
                 Distribute Link
               </button>
            </div>

            {/* Features/Trust Bits */}
            <div className="grid grid-cols-3 gap-4 pt-12 border-t border-black/5">
                <div className="text-center group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border border-black/5 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                      <Truck className="w-5 h-5" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Express Delivery</p>
                </div>
                <div className="text-center group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border border-black/5 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                      <ShieldCheck className="w-5 h-5" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Auth Protected</p>
                </div>
                <div className="text-center group">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 border border-black/5 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                      <Clock className="w-5 h-5" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-black/30">Live Support</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
