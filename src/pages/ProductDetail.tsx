import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getDocument, getCollection } from '../lib/firestore';
import { Product } from '../types';
import { useCartStore } from '../lib/store';
import { ShoppingBag, Zap, ArrowLeft, ShieldCheck, Truck, Clock, Star, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { where, limit } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getDocument<Product>('products', id);
        if (data) {
          setProduct(data);
          // Fetch related products
          const related = await getCollection<Product>('products', [
            where('category', '==', data.category),
            limit(5)
          ]);
          if (related) {
            setRelatedProducts(related.filter(p => p.id !== data.id));
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Failed to fetch tech asset:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRelated();
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
        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Discovery Error</h2>
        <p className="text-black/40 mb-8 font-medium">The requested tech asset could not be located in our inventory.</p>
        <button onClick={() => navigate('/')} className="px-10 py-4 bg-black text-white font-black uppercase rounded-xl">Return to Hub</button>
      </div>
    );
  }

  const price = typeof product.price === 'number' ? product.price : Number(String(product.price).replace(/[^0-9.]/g, '')) || 0;
  const productImages = (product.images && product.images.length > 0) 
    ? product.images 
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'];

  const handleBuyNow = () => {
    const item = { id: product.id, name: product.name, price: price, image: productImages[0], quantity: 1 };
    addItem(item);
    navigate('/checkout', { state: { directBuy: item } });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Product link copied to clipboard!');
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
            <div className="relative group">
              <motion.div 
                key={activeImage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="aspect-square bg-white rounded-[3rem] p-8 border border-black/5 flex items-center justify-center overflow-hidden shadow-sm group relative"
              >
                <img 
                  src={productImages[activeImage]} 
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {product.isHot && (
                  <div className="absolute top-8 left-8 bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl animate-pulse">Trending Now</div>
                )}
              </motion.div>

              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === 0 ? productImages.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-black/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500 hover:text-white"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImage(prev => (prev === productImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-black/5 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-500 hover:text-white"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            {productImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl bg-white border-2 transition-all p-2 flex items-center justify-center overflow-hidden ${
                      activeImage === idx ? 'border-orange-500 shadow-md' : 'border-black/5 opacity-60 hover:opacity-100'
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
            
            {/* Actions */}
            <div className="space-y-4 mb-12">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => addItem({ id: product.id, name: product.name, price: price, image: productImages[0], quantity: 1 })}
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
                    Buy Now
                  </button>
               </div>
               <button 
                 onClick={handleCopyLink}
                 className="w-full py-4 bg-white border border-black/5 text-black/40 text-[10px] font-black rounded-xl uppercase tracking-widest hover:text-black transition-colors flex items-center justify-center gap-2"
               >
                 <Share2 className="w-3 h-3" />
                 Copy Link
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/60 italic mb-2 block">Curation Hub</span>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">Similar <span className="text-orange-500">Assets</span></h2>
              </div>
              <p className="text-black/40 text-xs font-bold uppercase tracking-widest max-w-sm">Explore more cutting-edge selections from the same category ecosystem.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
