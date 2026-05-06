import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCollection } from '../lib/firestore';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Star, Zap, ShieldCheck, Flame, TrendingUp, Grid } from 'lucide-react';
import { seedDatabase } from '../lib/seed';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await seedDatabase();
      const data = await getCollection<Product>('products');
      setProducts(data || []);
      setLoading(false);
    };
    init();
  }, []);

  const hotDeals = products.filter(p => p.isHot);
  const topSales = products.filter(p => p.isTopSale);
  const regularProducts = products.filter(p => !p.isHot && !p.isTopSale);

  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="pt-16 min-h-screen bg-[#050505] text-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
        <img
          src="/assets/images/hero_banner_ecommerce_1778051431765.png"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
          alt="Hero"
          referrerPolicy="no-referrer"
        />
        
        <div className="relative z-20 text-center px-4 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6 font-black text-[10px] uppercase tracking-widest text-orange-500"
          >
            New Collection Live
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-black tracking-tighter mb-8 uppercase leading-[0.85] italic"
          >
            Pure <span className="text-orange-500">Tech</span> <br/>
            <span className="text-stroke-white text-transparent">Culture</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light"
          >
            প্রিমিয়াম গ্যাজেট কালেকশন এখন বাংলাদেশে। কোনো অ্যাকাউন্ট ছাড়াই সহজে অর্ডার করুন।
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <a 
              href="/track"
              className="px-12 py-5 bg-white/5 border border-white/10 text-white text-xs font-black rounded-2xl backdrop-blur-xl hover:bg-white/10 transition-all active:scale-95 uppercase"
            >
              Track Order
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-24 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { val: "24/7", label: "Support" },
             { val: "100%", label: "Authentic" },
             { val: "৳60", label: "Delivery" },
             { val: "Cash", label: "On Delivery" }
           ].map((s, i) => (
             <div key={i} className="text-center group">
                <p className="text-4xl md:text-5xl font-black text-white/10 group-hover:text-orange-500/20 transition-colors uppercase italic">{s.val}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{s.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Hot Deals Area */}
      {hotDeals.length > 0 && (
        <section className="py-32 px-4 max-w-7xl mx-auto bg-gradient-to-b from-red-500/5 to-transparent rounded-[4rem] mb-20 border border-red-500/10">
          <div className="flex items-center gap-4 mb-16 px-8">
             <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(239,68,68,0.4)]">
                <Flame className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Hot <span className="text-red-500">Deals</span></h2>
                <p className="text-white/40 text-sm font-light">সীমিত সময়ের সেরা অফারগুলো এখানে।</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
             {hotDeals.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Main Shopping Hub */}
      <section id="shop" className="py-32 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Grid className="w-4 h-4 text-orange-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Marketplace Discovery</span>
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Zen <span className="text-orange-500">Inventory</span></h2>
            <p className="text-white/40 text-sm mt-4 max-w-md">এক্সক্লুসিভ কালেকশন থেকে আপনার পছন্দের পণ্যটি বেছে নিন।</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
             <button className="px-6 py-3 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-xl">All Items</button>
             {categories.slice(0, 3).map(c => (
               <button key={c} className="px-6 py-3 text-white/40 hover:text-white rounded-xl text-[10px] font-black uppercase transition-colors">{c}</button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-[3rem]" />)}
          </div>
        ) : (
          <div className="space-y-32">
             {/* General Listing */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
               {regularProducts.map(p => <ProductCard key={p.id} product={p} />)}
             </div>

             {/* Top Sales Highlight */}
             {topSales.length > 0 && (
               <div className="bg-orange-500/5 rounded-[4rem] p-12 border border-orange-500/10 shadow-[inset_0_0_100px_rgba(249,115,22,0.03)]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-orange-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/40 rotate-3">
                           <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Top <br/><span className="text-orange-500">Performers</span></h2>
                           <p className="text-orange-500/60 text-xs font-black uppercase tracking-widest mt-2">Verified Best Sellers</p>
                        </div>
                     </div>
                     <div className="bg-black/20 backdrop-blur px-8 py-4 rounded-3xl border border-white/5">
                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Stock Status</p>
                        <p className="text-xl font-black text-white uppercase italic">Critical Inventory</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                     {topSales.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
               </div>
             )}
          </div>
        )}
      </section>

      {/* CTA Section removed as requested */}
    </div>
  );
}
