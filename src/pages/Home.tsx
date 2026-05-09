import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getCollection } from '../lib/firestore';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Star, Zap, ShieldCheck, Flame, TrendingUp, Grid, Tag } from 'lucide-react';
import { seedDatabase } from '../lib/seed';
import { Category } from '../types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await seedDatabase();
      } catch (e) {
        console.warn("Database seeding deferred:", e);
      }
      
      try {
        const [prodData, catData] = await Promise.all([
          getCollection<Product>('products'),
          getCollection<Category>('categories')
        ]);
        setProducts(prodData || []);
        setCategories(catData || []);
      } catch (e) {
        console.error("Failed to load data:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const hotDeals = filteredProducts.filter(p => p.isHot);
  const topSales = filteredProducts.filter(p => p.isTopSale);
  const regularProducts = filteredProducts.filter(p => !p.isHot && !p.isTopSale);

  return (
    <div className="pt-24 min-h-screen bg-[#F4F5F7] text-[#1A1A1A]">
      {/* Main Shopping Hub */}
      <section id="shop" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <Grid className="w-4 h-4 text-orange-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Marketplace Discovery</span>
            </div>
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Fren<span className="text-orange-500">Zway</span></h2>
            <p className="text-black/40 text-sm mt-4 max-w-md font-medium">এক্সক্লুসিভ কালেকশন থেকে আপনার পছন্দের পণ্যটি বেছে নিন।</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-black/5 shadow-sm overflow-x-auto no-scrollbar max-w-full">
             <button 
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedCategory === 'all' ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:text-black'}`}
             >
               All Items
             </button>
             {categories.map(c => (
               <button 
                  key={c.id} 
                  onClick={() => setSelectedCategory(c.name)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${selectedCategory === c.name ? 'bg-black text-white shadow-xl' : 'text-black/40 hover:text-black'}`}
               >
                 {c.name}
               </button>
             ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[4/5] bg-white animate-pulse rounded-[3rem] border border-black/5" />)}
          </div>
        ) : (
          <div className="space-y-32">
             {/* General Listing */}
             {regularProducts.length > 0 ? (
               <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                 {regularProducts.map(p => <ProductCard key={p.id} product={p as Product} />)}
               </div>
             ) : selectedCategory !== 'all' && (
               <div className="text-center py-20 bg-white border border-dashed border-black/10 rounded-[3rem]">
                  <ShoppingBag className="w-12 h-12 text-black/5 mx-auto mb-4" />
                  <p className="text-black/40 font-medium italic">No products found in this category segment.</p>
               </div>
             )}

             {/* Offer Section */}
             {hotDeals.length > 0 && (
                <div className="bg-white rounded-[4rem] p-12 border border-black/5 shadow-lg overflow-hidden relative">
                   <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 px-4 relative z-10">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-orange-500 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 rotate-3">
                            <Tag className="w-8 h-8" />
                         </div>
                         <div>
                            <h2 className="text-5xl font-black uppercase tracking-tighter leading-none italic">Special <br/><span className="text-orange-500">Offers</span></h2>
                            <p className="text-black/40 text-xs font-black uppercase tracking-widest mt-2 px-1">Exclusive Value Projections</p>
                         </div>
                      </div>
                      <div className="bg-[#F8F9FA] px-10 py-6 rounded-[2.5rem] border border-black/5 shadow-sm">
                         <p className="text-[10px] text-black/20 uppercase font-black tracking-[0.3em] mb-2">Offer Protocol Active</p>
                         <p className="text-2xl font-black text-black uppercase italic tracking-tighter">Limited Quantities</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 relative z-10">
                      {hotDeals.map(p => <ProductCard key={p.id} product={p as Product} />)}
                   </div>
                </div>
             )}

           {/* Top Sales Highlight */}
             {topSales.length > 0 && (
               <div className="bg-black text-white rounded-[4rem] p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-orange-500/10 pointer-events-none" />
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
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
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
