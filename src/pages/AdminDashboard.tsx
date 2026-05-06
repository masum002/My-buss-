import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCollection, updateDocument, addDocument, deleteDocument, getDocument, createDocument } from '../lib/firestore';
import { Product, Order, OrderStatus } from '../types';
import { auth, storage } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { orderBy, Timestamp } from 'firebase/firestore';
import { 
  Search, ChevronDown, Package, Clock, Filter, Eye, Lock, LogOut, 
  Plus, Settings, ListOrdered, Box, Trash2, Upload, Save, X, Truck, 
  Smartphone, MapPin, Banknote, Image as ImageIcon
} from 'lucide-react';

type Tab = 'orders' | 'products' | 'settings';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    category: 'Electronics',
    description: '',
    stock: 0,
    images: [] as string[],
    isHot: false,
    isTopSale: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings State
  const [settings, setSettings] = useState({
    deliveryInsideDhaka: 60,
    deliveryOutsideDhaka: 120,
    bkashNumber: '01700-000000',
    nagadNumber: '01800-000000'
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'orders') {
        const data = await getCollection<Order>('orders', [orderBy('createdAt', 'desc')]);
        setOrders(data || []);
      } else if (tab === 'products') {
        const data = await getCollection<Product>('products', [orderBy('createdAt', 'desc')]);
        setProducts(data || []);
      } else if (tab === 'settings') {
        const data = await getDocument<any>('settings', 'global');
        if (data) setSettings(data);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== 'mahfujar003@gmail.com') {
        await signOut(auth);
        alert("Only authorized emails can access this panel.");
      }
    } catch (err) {
      alert("Authentication failed.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setOrders([]);
    setProducts([]);
  };

  // Product Management
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImages = productForm.images;
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        const url = await getDownloadURL(storageRef);
        finalImages = [url];
      }

      const pData = { 
        name: productForm.name,
        price: Number(productForm.price) || 0,
        category: productForm.category,
        description: productForm.description,
        stock: Number(productForm.stock) || 0,
        images: finalImages,
        isHot: Boolean(productForm.isHot),
        isTopSale: Boolean(productForm.isTopSale),
        updatedAt: Timestamp.now()
      };

      if (!editingProduct) {
        (pData as any).createdAt = Timestamp.now();
        await addDocument('products', pData);
      } else {
        await updateDocument('products', editingProduct.id, pData);
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      fetchData();
      alert("Product indexed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to save product. Check permissions or image size.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description,
      stock: p.stock,
      images: p.images,
      isHot: p.isHot || false,
      isTopSale: p.isTopSale || false
    });
    setImagePreview(p.images[0]);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product?")) {
      await deleteDocument('products', id);
      fetchData();
    }
  };

  const resetProductForm = () => {
    setProductForm({ 
      name: '', 
      price: 0, 
      category: 'Electronics', 
      description: '', 
      stock: 0, 
      images: [],
      isHot: false,
      isTopSale: false 
    });
    setImageFile(null);
    setImagePreview(null);
  };

  // Settings Management
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await createDocument('settings', 'global', settings);
      alert("Settings updated globally!");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="pt-32 min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 mx-auto shadow-[0_20px_50px_rgba(249,115,22,0.1)]">
            <Lock className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Authorized <span className="text-orange-500">Access</span></h2>
          <p className="text-white/40 mb-10 max-w-xs mx-auto text-sm">Welcome back, Owner. Authenticate to manage your tech empire.</p>
          <button 
            onClick={handleLogin}
            className="flex items-center gap-3 px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-95 group"
          >
            <Smartphone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            ENTER COMMAND CENTER
          </button>
        </motion.div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <h1 className="text-4xl font-black uppercase tracking-tighter">Zen <span className="text-orange-500">Core</span></h1>
               <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-black rounded-full border border-orange-500/20">LIVE V1.4</span>
            </div>
            <p className="text-white/40 text-sm font-light">Global logistics and inventory controller.</p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            {[
              { id: 'orders', label: 'Orders', icon: ListOrdered },
              { id: 'products', label: 'Products', icon: Box },
              { id: 'settings', label: 'Config', icon: Settings }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
                  tab === t.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button onClick={handleLogout} className="p-3 text-white/20 hover:text-red-500 transition-colors">
               <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === 'orders' && (
               <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                 {/* ... previous table code with added status logic ... */}
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-white/[0.02] border-b border-white/5">
                          <tr>
                             <th className="p-6 text-[10px] uppercase font-black text-white/30 tracking-widest">Order Details</th>
                             <th className="p-6 text-[10px] uppercase font-black text-white/30 tracking-widest">Customer</th>
                             <th className="p-6 text-[10px] uppercase font-black text-white/30 tracking-widest">Payment Meta</th>
                             <th className="p-6 text-[10px] uppercase font-black text-white/30 tracking-widest">Fulfillment</th>
                             <th className="p-6 text-right"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-white/[0.02] group transition-colors">
                              <td className="p-6">
                                <span className="text-orange-500 font-mono font-bold">{order.orderID}</span>
                                <p className="text-[10px] text-white/30 mt-1 uppercase font-black">{order.createdAt?.toDate?.()?.toLocaleString()}</p>
                              </td>
                              <td className="p-6">
                                <p className="font-bold">{order.customerName}</p>
                                <p className="text-xs text-white/40">{order.phoneNumber}</p>
                              </td>
                              <td className="p-6">
                                <div className="flex flex-col gap-1">
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                                    order.paymentMethod === 'Manual' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  }`}>
                                    {order.paymentMethod}
                                  </span>
                                  {order.paymentMethod === 'Manual' && (
                                    <p className="text-[10px] text-white/40 font-mono">TX: {order.transactionID}</p>
                                  )}
                                </div>
                              </td>
                              <td className="p-6">
                                <select 
                                  value={order.status}
                                  onChange={(e) => updateDocument('orders', order.id, { status: e.target.value })}
                                  className="bg-black/40 border border-white/10 text-[10px] uppercase font-black px-4 py-2 rounded-lg focus:border-orange-500 outline-none"
                                >
                                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                    <option key={s} value={s} className="bg-black">{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-6 text-right">
                                <button className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
               </div>
            )}

            {tab === 'products' && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/10 gap-6">
                   <div className="flex-1 w-full relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input 
                        type="text" 
                        placeholder="Search by Product Name, Category or Item Code (ID)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 pl-12 pr-4 py-3 rounded-xl focus:border-orange-500 outline-none text-sm transition-all"
                      />
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                         <h2 className="text-xl font-black uppercase">Inventory Matrix</h2>
                         <p className="text-xs text-white/40">{filteredProducts.length} Items Filtered</p>
                      </div>
                      <button 
                       onClick={() => { resetProductForm(); setShowProductModal(true); }}
                       className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 text-xs"
                      >
                        <Plus className="w-4 h-4" />
                        ADD PRODUCT
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group">
                       <div className="aspect-square bg-black relative overflow-hidden">
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEditProduct(p)} className="p-3 bg-white text-black rounded-xl shadow-2xl hover:bg-orange-500 hover:text-white transition-colors"><Settings className="w-4 h-4" /></button>
                             <button onClick={() => handleDeleteProduct(p.id)} className="p-3 bg-red-500 text-white rounded-xl shadow-2xl hover:bg-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="absolute bottom-4 left-4">
                             <span className="bg-black/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black text-orange-500 border border-white/10">
                                CODE: {p.id.slice(-8).toUpperCase()}
                             </span>
                          </div>
                       </div>
                       <div className="p-6">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold uppercase tracking-tight truncate mr-2">{p.name}</h3>
                             <p className="text-orange-500 font-black">৳{p.price}</p>
                          </div>
                          <p className="text-[10px] text-white/40 uppercase font-black mb-2">{p.category}</p>
                          <div className="flex gap-2 mb-4">
                             {p.isHot && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black rounded border border-red-500/20">HOT</span>}
                             {p.isTopSale && <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black rounded border border-orange-500/20">TOP SALE</span>}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-2">
                             <button 
                               onClick={() => {
                                 const newStock = p.stock > 0 ? 0 : 100;
                                 updateDocument('products', p.id, { stock: newStock }).then(fetchData);
                               }}
                               className={`text-[9px] font-black px-3 py-1 rounded-lg transition-colors ${p.stock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                             >
                                {p.stock > 0 ? 'INSTOCK' : 'OUT OF STOCK'}
                             </button>
                             <span className="text-[10px] font-black text-white/40">
                                {p.stock} QTY
                             </span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="max-w-3xl mx-auto space-y-8">
                 <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-12">
                    <div className="space-y-6">
                       <div className="flex items-center gap-4 text-orange-500">
                          <Truck className="w-6 h-6" />
                          <h2 className="text-2xl font-black uppercase tracking-tighter">Logistics Fees</h2>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                             <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-3">Inside Dhaka (৳)</label>
                             <div className="relative">
                               <input 
                                type="number" 
                                value={settings.deliveryInsideDhaka}
                                onChange={e => setSettings({...settings, deliveryInsideDhaka: Number(e.target.value)})}
                                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-orange-500 outline-none font-bold" 
                               />
                               <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                             </div>
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-3">Outside Dhaka (৳)</label>
                             <div className="relative">
                               <input 
                                type="number" 
                                value={settings.deliveryOutsideDhaka}
                                onChange={e => setSettings({...settings, deliveryOutsideDhaka: Number(e.target.value)})}
                                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-orange-500 outline-none font-bold" 
                               />
                               <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 border-t border-white/5 pt-12">
                       <div className="flex items-center gap-4 text-orange-500">
                          <Smartphone className="w-6 h-6" />
                          <h2 className="text-2xl font-black uppercase tracking-tighter">Finance Routing</h2>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                             <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-3">bKash Merchant/Personal</label>
                             <input 
                                type="text" 
                                value={settings.bkashNumber}
                                onChange={e => setSettings({...settings, bkashNumber: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-orange-500 outline-none font-mono" 
                             />
                          </div>
                          <div>
                             <label className="text-[10px] font-black uppercase text-white/40 tracking-widest block mb-3">Nagad Core Number</label>
                             <input 
                                type="text" 
                                value={settings.nagadNumber}
                                onChange={e => setSettings({...settings, nagadNumber: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:border-orange-500 outline-none font-mono" 
                             />
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(255,255,255,0.05)] active:scale-95"
                    >
                      <Save className="w-6 h-6" />
                      SYNCHRONIZE SETTINGS
                    </button>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Product Modal */}
        <AnimatePresence>
           {showProductModal && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
                >
                   <div className="flex justify-between items-center p-8 border-b border-white/5 bg-white/[0.02]">
                      <h2 className="text-2xl font-black uppercase tracking-tighter">
                         {editingProduct ? 'Update' : 'Index'} <span className="text-orange-500">Selection</span>
                      </h2>
                      <button onClick={() => setShowProductModal(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                         <X className="w-6 h-6" />
                      </button>
                   </div>

                   <form onSubmit={handleProductSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[70vh]">
                      <div className="space-y-6">
                         <div 
                           onClick={() => fileInputRef.current?.click()}
                           className="aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-all group overflow-hidden relative"
                         >
                            {imagePreview ? (
                               <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                               <>
                                  <ImageIcon className="w-10 h-10 text-white/10 mb-4 group-hover:text-orange-500 transition-colors" />
                                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Upload Aesthetic Asset</span>
                               </>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) {
                                  setImageFile(file);
                                  const r = new FileReader();
                                  r.onload = () => setImagePreview(r.result as string);
                                  r.readAsDataURL(file);
                               }
                            }} />
                         </div>

                         <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Category Segment</label>
                            <select 
                               value={productForm.category}
                               onChange={e => setProductForm({...productForm, category: e.target.value})}
                               className="w-full bg-black border border-white/10 p-4 rounded-xl font-bold focus:border-orange-500 outline-none"
                            >
                               {['Watches', 'Audio', 'Keyboards', 'Luxury', 'Ecosystem'].map(c => (
                                 <option key={c} value={c}>{c}</option>
                               ))}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Item Designation</label>
                            <input 
                              type="text" 
                              required
                              value={productForm.name}
                              onChange={e => setProductForm({...productForm, name: e.target.value})}
                              className="w-full bg-black border border-white/10 p-4 rounded-xl font-bold focus:border-orange-500 outline-none" 
                              placeholder="e.g. SONIC WAVE X"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Valve Price (৳)</label>
                               <input 
                                 type="number" 
                                 required
                                 value={productForm.price}
                                 onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                                 className="w-full bg-black border border-white/10 p-4 rounded-xl font-bold focus:border-orange-500 outline-none" 
                               />
                            </div>
                            <div>
                               <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Stock Pool</label>
                               <input 
                                 type="number" 
                                 required
                                 value={productForm.stock}
                                 onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})}
                                 className="w-full bg-black border border-white/10 p-4 rounded-xl font-bold focus:border-orange-500 outline-none" 
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <label className="flex items-center gap-3 cursor-pointer">
                               <input 
                                 type="checkbox"
                                 checked={productForm.isHot}
                                 onChange={e => setProductForm({...productForm, isHot: e.target.checked})}
                                 className="w-5 h-5 rounded bg-black border-white/10 text-orange-500 focus:ring-0"
                               />
                               <span className="text-[10px] font-black uppercase">Hot Deal</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                               <input 
                                 type="checkbox"
                                 checked={productForm.isTopSale}
                                 onChange={e => setProductForm({...productForm, isTopSale: e.target.checked})}
                                 className="w-5 h-5 rounded bg-black border-white/10 text-orange-500 focus:ring-0"
                               />
                               <span className="text-[10px] font-black uppercase">Top Sale</span>
                            </label>
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase text-white/40 block mb-2">Narrative / Description</label>
                            <textarea 
                               value={productForm.description}
                               onChange={e => setProductForm({...productForm, description: e.target.value})}
                               className="w-full bg-black border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none min-h-[150px] text-sm font-light text-white/70"
                               placeholder="Articulate the value projection..."
                            />
                         </div>
                         <button 
                           disabled={loading}
                           className="w-full py-5 bg-orange-500 text-white font-black rounded-2xl hover:shadow-[0_20px_50px_rgba(249,115,22,0.3)] transition-all active:scale-95"
                         >
                           {loading ? 'SYNCHRONIZING...' : editingProduct ? 'UPDATE CORE' : 'INITIALIZE ITEM'}
                         </button>
                      </div>
                   </form>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}
