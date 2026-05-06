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
    <div className="pt-16 min-h-screen bg-[#F4F5F7] text-[#1A1A1A]">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#F4F5F7] via-[#F4F5F7]/40 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-20 scale-105"
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
            <span className="text-stroke-black text-transparent">Culture</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-black/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium"
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
              className="px-12 py-5 bg-black text-white text-xs font-black rounded-2xl shadow-xl hover:bg-orange-500 transition-all active:scale-95 uppercase"
            >
              Track Order
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-24 px-4 bg-white border-y border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
           {[
             { val: "24/7", label: "Support" },
             { val: "100%", label: "Authentic" },
             { val: "৳60", label: "Delivery" },
             { val: "Cash", label: "On Delivery" }
           ].map((s, i) => (
             <div key={i} className="text-center group">
                <p className="text-4xl md:text-5xl font-black text-black/5 group-hover:text-orange-500/20 transition-colors uppercase italic">{s.val}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-1">{s.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* Hot Deals Area */}
      {hotDeals.length > 0 && (
        <section className="py-32 px-4 max-w-7xl mx-auto bg-white rounded-[4rem] mb-20 border border-black/5 shadow-sm">
          <div className="flex items-center gap-4 mb-16 px-8">
             <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6" />
             </div>
             <div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Hot <span className="text-orange-500">Deals</span></h2>
                <p className="text-black/40 text-sm">সীমিত সময়ের সেরা অফারগুলো এখানে।</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
             {hotDeals.map(p => <ProductCard key={p.id} product={p as Product} />)}
          </div>
        </section>
      )}

      {/* Main Shopping Hub */}
      <section id="shop" className="py-32 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Grid className="w-4 h-4 text-orange-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Marketplace Discovery</span>
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Fren<span className="text-orange-500">Zway</span></h2>
            <p className="text-black/40 text-sm mt-4 max-w-md font-medium">এক্সক্লুসিভ কালেকশন থেকে আপনার পছন্দের পণ্যটি বেছে নিন।</p>
          </div>
          <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm">
             <button className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase shadow-xl">All Items</button>
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
               {regularProducts.map(p => <ProductCard key={p.id} product={p as Product} />)}
             </div>

           {/* Top Sales Highlight */}
             {topSales.length > 0 && (
               <div className="bg-white rounded-[4rem] p-12 border border-black/5 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 px-4">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3">
                           <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                           <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Best <br/><span className="text-orange-500">Sellers</span></h2>
                           <p className="text-black/40 text-xs font-black uppercase tracking-widest mt-2 px-1">Trend Analysis: High Performance</p>
                        </div>
                     </div>
                     <div className="bg-[#F8F9FA] px-10 py-6 rounded-[2.5rem] border border-black/5 shadow-sm">
                        <p className="text-[10px] text-black/20 uppercase font-black tracking-[0.3em] mb-2">Inventory Intelligence</p>
                        <p className="text-2xl font-black text-black uppercase italic tracking-tighter">Stock Synchronized</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                     {topSales.map(p => <ProductCard key={p.id} product={p as Product} />)}
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
