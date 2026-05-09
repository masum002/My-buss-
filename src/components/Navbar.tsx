import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, MoreHorizontal, Package, LayoutDashboard, X, ArrowRight, Zap } from 'lucide-react';
import { useCartStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { getCollection } from '../lib/firestore';
import { Product } from '../types';

export default function Navbar() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const fetchAll = async () => {
        const data = await getCollection<Product>('products');
        setAllProducts(data || []);
      };
      fetchAll();
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
    } else {
      const results = allProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(results.slice(0, 5));
    }
  }, [searchQuery, allProducts]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-3xl border-b border-white/5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-black italic tracking-tighter text-white group">
              FrenZ<span className="text-orange-500 group-hover:text-white transition-colors">way</span>
            </Link>

            {/* Desktop Quick Links */}
            <div className="hidden lg:flex items-center gap-8">
              <Link to="/track" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-orange-500 transition-colors">Logistics</Link>
              <button onClick={() => setIsSearchOpen(true)} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-orange-500 transition-colors">Search Hub</button>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/60 hover:text-orange-500 transition-all border border-white/5"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white/60 hover:text-orange-500 transition-all border border-white/5 group">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-lg shadow-xl shadow-orange-500/20"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Smart 3-dot Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-3 rounded-2xl transition-all border ${isMenuOpen ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'}`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl p-4 border border-black/5 z-20 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <Link 
                          to="/track" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl hover:bg-black hover:text-white transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Track Order</span>
                          </div>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                        <Link 
                          to="/FrenZway" 
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl hover:bg-black hover:text-white transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <LayoutDashboard className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Operations</span>
                          </div>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                      </div>
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <p className="text-center text-[8px] font-black uppercase tracking-[0.3em] text-black/20">FrenZway Protocol v1.4</p>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-start justify-center pt-24 px-4"
          >
            <div className="w-full max-w-3xl">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                  <Search className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Discovery <span className="text-orange-500">Node</span></h2>
                </div>
                <button 
                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                  className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="relative group">
                <input 
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What tech are you hunting?..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-10 py-8 text-2xl font-black italic text-white placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 transition-all"
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="p-2 text-white/20 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">ENTER</div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                {filteredProducts.length > 0 ? (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-6">Available Matching Assets ({filteredProducts.length})</p>
                    <div className="grid grid-cols-1 gap-4">
                      {filteredProducts.map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            navigate(`/product/${product.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-6 p-6 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/10 hover:border-orange-500/30 transition-all group text-left"
                        >
                          <div className="w-20 h-20 bg-white rounded-2xl p-3 flex items-center justify-center overflow-hidden flex-shrink-0">
                            <img src={product.images?.[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{product.category}</span>
                            </div>
                            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter truncate">{product.name}</h3>
                            <div className="flex items-center gap-4 mt-2">
                               <p className="text-2xl font-black text-white/40 italic">৳{product.price.toLocaleString()}</p>
                               {product.isHot && <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase"><Zap className="w-3 h-3 fill-current" /> Trending</span>}
                            </div>
                          </div>
                          <ArrowRight className="w-6 h-6 text-white/10 group-hover:text-orange-500 group-hover:translate-x-2 transition-all mr-4" />
                        </button>
                      ))}
                    </div>
                  </>
                ) : searchQuery ? (
                  <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5 italic">
                    <p className="text-white/20 text-lg font-bold">No tech matching "{searchQuery}" in our core.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
                     {['Audio', 'Gaming', 'Watches', 'Phones'].map(tag => (
                       <button 
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase text-white/30 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all tracking-[0.2em]"
                       >
                         {tag} Profile
                       </button>
                     ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
