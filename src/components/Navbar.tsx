import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, MoreHorizontal, Package, X, ArrowRight, Zap, ListFilter, MessageSquareWarning, Phone, ChevronLeft, LayoutGrid, MapPin, Mail as MailIcon } from 'lucide-react';
import { useCartStore } from '../lib/store';
import { motion, AnimatePresence } from 'motion/react';
import { getCollection, getDocument } from '../lib/firestore';
import { Product, Category } from '../types';

export default function Navbar() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [menuView, setMenuView] = useState<'main' | 'categories'>('main');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCollection<Category>('categories');
      if (data) setCategories(data);
    };
    const fetchSettings = async () => {
      const data = await getDocument<any>('settings', 'global');
      if (data) setSettings(data);
    };
    fetchCategories();
    fetchSettings();
  }, []);

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
            <Link to="/" className="flex items-center gap-3 text-2xl font-black italic tracking-tighter text-white group">
              <img 
                src="https://res.cloudinary.com/dwfnjvw6v/image/upload/v1778484022/m6gqpwltctdfks5mrdit.png" 
                alt="FrenZway Logo" 
                className="h-10 w-auto object-contain"
              />
              <span>FrenZ<span className="text-orange-500 group-hover:text-white transition-colors">way</span></span>
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

              <AnimatePresence mode="wait">
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => { setIsMenuOpen(false); setMenuView('main'); }} />
                    <motion.div
                      key={menuView}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl p-4 border border-black/5 z-20 overflow-hidden"
                    >
                      {menuView === 'main' ? (
                        <div className="space-y-1">
                          <button 
                            onClick={() => setMenuView('categories')}
                            className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] rounded-2xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <LayoutGrid className="w-5 h-5 text-indigo-600" />
                              <span className="text-[11px] font-black uppercase tracking-widest italic">Categories</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-black/10 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </button>

                          <Link 
                            to="/track" 
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center justify-between p-4 hover:bg-[#F8F9FA] rounded-2xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-indigo-600" />
                              <span className="text-[11px] font-black uppercase tracking-widest italic">Track Product</span>
                            </div>
                          </Link>

                          <button 
                            onClick={() => { setIsMenuOpen(false); navigate('/support', { state: { type: 'report' } }); }}
                            className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] rounded-2xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <MessageSquareWarning className="w-5 h-5 text-indigo-600" />
                              <span className="text-[11px] font-black uppercase tracking-widest italic">Sent a Report</span>
                            </div>
                          </button>

                          <button 
                            onClick={() => { setIsMenuOpen(false); setIsContactModalOpen(true); }}
                            className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] rounded-2xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-indigo-600" />
                              <span className="text-[11px] font-black uppercase tracking-widest italic">Contact Us</span>
                            </div>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <button 
                            onClick={() => setMenuView('main')}
                            className="flex items-center gap-2 p-2 hover:text-indigo-600 transition-colors mb-2"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Back</span>
                          </button>
                          
                          <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {categories.length > 0 ? (
                              categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setMenuView('main');
                                    navigate(`/?category=${cat.name}`);
                                  }}
                                  className="w-full flex items-center justify-between p-4 hover:bg-[#F8F9FA] rounded-[1.5rem] transition-all group text-left"
                                >
                                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                                  <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                    <ArrowRight className="w-3 h-3 text-indigo-600" />
                                  </div>
                                </button>
                              ))
                            ) : (
                              <p className="text-[10px] text-center py-4 font-bold opacity-30">No categories found</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <p className="text-center text-[7px] font-black uppercase tracking-[0.4em] text-black/20">FrenZway Portal v3.0</p>
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

      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white border border-black/5 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                    Contact Us
                  </h2>
                  <button 
                    onClick={() => setIsContactModalOpen(false)}
                    className="p-3 bg-black text-white rounded-full hover:bg-orange-500 transition-all active:scale-90 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                  <p className="text-black font-semibold text-base leading-relaxed">আমাদের সাথে যোগাযোগ করার জন্য নিচের তথ্যগুলো ব্যবহার করুন। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।</p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-black/5 shadow-sm">
                      <Phone className="w-6 h-6 text-orange-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Hotline</p>
                        <p className="font-black text-lg text-black">{settings?.hotline || '+880 1700-000000'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-black/5 shadow-sm">
                      <MailIcon className="w-6 h-6 text-orange-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Email Support</p>
                        <p className="font-black text-lg text-black">{settings?.emailSupport || 'support@frenzway.com'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-black/5 shadow-sm">
                      <MapPin className="w-6 h-6 text-orange-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Registered Office</p>
                        <p className="font-black text-base text-black leading-relaxed">{settings?.registeredOffice || 'Dhanmondi, Dhaka, Bangladesh'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
