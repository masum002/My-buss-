import React, { useState, useEffect, useRef, FormEvent } from 'react';
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
  Smartphone, MapPin, Banknote, Image as ImageIcon, Ticket, ShieldCheck, UserPlus, Users
} from 'lucide-react';

import { Coupon, Admin } from '../types';

type Tab = 'orders' | 'products' | 'coupons' | 'admins' | 'settings';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [adminsList, setAdminsList] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Product Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'Electronics',
    description: '',
    stock: '',
    imageUrl: '',
    isHot: false,
    isTopSale: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercentage: '',
    productId: 'ALL',
    isActive: true
  });

  // Admin Management State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminForm, setAdminForm] = useState({
    email: '',
    role: 'admin' as 'admin' | 'super'
  });

  // Settings State
  const [settings, setSettings] = useState({
    deliveryInsideDhaka: 60,
    deliveryOutsideDhaka: 120,
    bkashNumber: '01700-000000',
    nagadNumber: '01800-000000'
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch role
        const adminDoc = await getDocument<Admin>('admins', u.email || '');
        if (adminDoc) {
          setUserRole(adminDoc.role);
        } else if (u.email === 'mahfujar003@gmail.com') {
          setUserRole('super');
        } else {
          setUserRole(null);
        }
        fetchData();
      } else {
        setLoading(false);
        setUserRole(null);
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
      } else if (tab === 'coupons') {
        const data = await getCollection<Coupon>('coupons', [orderBy('createdAt', 'desc')]);
        setCoupons(data || []);
      } else if (tab === 'admins') {
        const data = await getCollection<Admin>('admins', [orderBy('addedAt', 'desc')]);
        setAdminsList(data || []);
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
      await signInWithPopup(auth, provider);
    } catch (err) {
      alert("Authentication failed.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setOrders([]);
    setProducts([]);
    setCoupons([]);
    setAdminsList([]);
  };

  const isSuperAdmin = user?.email === 'mahfujar003@gmail.com' || userRole === 'super';

  // Admin Management Actions
  const handleAddAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const email = adminForm.email.toLowerCase().trim();
      await createDocument('admins', email, {
        email,
        role: adminForm.role,
        addedBy: user.email,
        addedAt: Timestamp.now()
      });
      setShowAdminModal(false);
      setAdminForm({ email: '', role: 'admin' });
      fetchData();
      alert("Admin access granted.");
    } catch (err) {
      alert("Failed to grant access.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!isSuperAdmin) return;
    if (email === 'mahfujar003@gmail.com') {
      alert("Primary Super Admin cannot be removed.");
      return;
    }
    if (confirm(`Revoke access for ${email}?`)) {
      await deleteDocument('admins', email);
      fetchData();
    }
  };

  // Coupon Management
  const handleCouponSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalCData = {
        code: couponForm.code.toUpperCase(),
        discountPercentage: Number(couponForm.discountPercentage),
        productId: couponForm.productId === 'ALL' ? null : couponForm.productId,
        isActive: Boolean(couponForm.isActive),
        updatedAt: Timestamp.now()
      };

      if (!editingCoupon) {
        (finalCData as any).createdAt = Timestamp.now();
        await addDocument('coupons', finalCData);
      } else {
        await updateDocument('coupons', editingCoupon.id, finalCData);
      }

      setShowCouponModal(false);
      setEditingCoupon(null);
      resetCouponForm();
      fetchData();
      alert("Coupon synchronized.");
    } catch (err) {
      alert("Failed to save coupon.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponForm({
      code: c.code,
      discountPercentage: String(c.discountPercentage),
      productId: c.productId || 'ALL',
      isActive: c.isActive
    });
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm("Delete this coupon protocol?")) {
      await deleteDocument('coupons', id);
      fetchData();
    }
  };

  const resetCouponForm = () => {
    setCouponForm({
      code: '',
      discountPercentage: '',
      productId: 'ALL',
      isActive: true
    });
  };

  // Product Management
  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImages: string[] = [];
      
      // Prioritize URL if provided, otherwise check upload
      if (productForm.imageUrl) {
        finalImages = [productForm.imageUrl];
      } else if (imageFile) {
        try {
          const storageRef = ref(storage, `products/${Date.now()}-${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          const url = await getDownloadURL(storageRef);
          finalImages = [url];
        } catch (storageErr) {
          console.error("Storage upload failed", storageErr);
          throw new Error(JSON.stringify({ error: "Storage upload failed. Please try Image URL instead." }));
        }
      } else if (editingProduct && editingProduct.images) {
        finalImages = editingProduct.images;
      }

      if (finalImages.length === 0) {
        throw new Error(JSON.stringify({ error: "Please provide an image URL or upload an image." }));
      }

      const pData = { 
        name: productForm.name,
        price: Number(String(productForm.price).replace(/[^0-9.]/g, '')) || 0,
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
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Failed to save product.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) {
          errorMsg = parsed.error;
        }
      } catch (e) {}
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      price: String(p.price) as any,
      category: p.category,
      description: p.description,
      stock: String(p.stock) as any,
      imageUrl: p.images[0] || '',
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
      price: '' as any, 
      category: 'Electronics', 
      description: '', 
      stock: '' as any, 
      imageUrl: '',
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
      <div className="pt-32 min-h-screen bg-[#F4F5F7] text-[#1A1A1A] flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 border border-black/5 mx-auto shadow-xl">
            <Lock className="w-10 h-10 text-black" />
          </div>
          <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter italic">Authorized <span className="text-orange-500">Access</span></h2>
          <p className="text-black/40 mb-10 max-w-xs mx-auto text-sm font-medium">Welcome back, Owner. Authenticate to manage your tech empire.</p>
          <button 
            onClick={handleLogin}
            className="flex items-center gap-3 px-12 py-5 bg-black text-white font-black rounded-2xl hover:bg-orange-500 transition-all active:scale-95 group shadow-xl"
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
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#F4F5F7] text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <h1 className="text-4xl font-black uppercase tracking-tighter italic">FrenZway <span className="text-orange-500 text-stroke-black">Control</span></h1>
               <span className="px-3 py-1 bg-white text-black text-[10px] font-black rounded-full border border-black/5 shadow-sm">MASTER ACCESS</span>
            </div>
            <p className="text-black/40 text-sm font-medium italic">Global logistics and inventory controller.</p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-black/5 shadow-sm">
            {[
              { id: 'orders', label: 'Orders', icon: ListOrdered },
              { id: 'products', label: 'Inventory', icon: Box },
              { id: 'coupons', label: 'Coupons', icon: Ticket },
              ...(isSuperAdmin ? [{ id: 'admins', label: 'Admins', icon: ShieldCheck }] : []),
              { id: 'settings', label: 'Config', icon: Settings }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as Tab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${
                  tab === t.id ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
            <div className="w-px h-6 bg-black/5 mx-2" />
            <button onClick={handleLogout} className="p-4 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
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
               <div className="bg-white border border-black/5 rounded-[2rem] overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-[#F8F9FA] border-b border-black/5">
                          <tr>
                             <th className="p-6 text-[10px] uppercase font-black text-black/30 tracking-widest">Order Details</th>
                             <th className="p-6 text-[10px] uppercase font-black text-black/30 tracking-widest">Customer</th>
                             <th className="p-6 text-[10px] uppercase font-black text-black/30 tracking-widest">Delivery Address</th>
                             <th className="p-6 text-[10px] uppercase font-black text-black/30 tracking-widest">Amount</th>
                             <th className="p-6 text-[10px] uppercase font-black text-black/30 tracking-widest">Payment Meta</th>
                             <th className="p-6 text-[10px] uppercase font-black text-black/30 tracking-widest">Fulfillment</th>
                             <th className="p-6 text-right"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-black/5">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-[#F8F9FA] group transition-colors">
                               <td className="p-6">
                                 <span className="text-orange-500 font-mono font-bold tracking-tight">{order.orderID}</span>
                                 <div className="mt-2 space-y-1">
                                   {order.items.map((item, idx) => (
                                     <p key={idx} className="text-[10px] font-bold text-black/60 uppercase italic">
                                       {item.name} <span className="text-orange-500">x{item.quantity}</span>
                                     </p>
                                   ))}
                                 </div>
                                 <p className="text-[9px] text-black/30 mt-2 uppercase font-black">{order.createdAt?.toDate?.()?.toLocaleString()}</p>
                               </td>
                               <td className="p-6">
                                 <p className="font-bold uppercase text-sm tracking-tight">{order.customerName}</p>
                                 <p className="text-xs text-black/40 font-medium">{order.phoneNumber}</p>
                               </td>
                               <td className="p-6">
                                 <p className="text-xs font-semibold text-black/60 max-w-[250px] leading-relaxed">{order.address}</p>
                               </td>
                               <td className="p-6">
                                 <div className="flex flex-col">
                                   <p className="font-black italic text-lg tracking-tighter">৳{order.total.toLocaleString()}</p>
                                   {order.discountAmount && order.discountAmount > 0 && (
                                     <p className="text-[9px] font-black text-green-600 uppercase">Discount: ৳{order.discountAmount}</p>
                                   )}
                                   {order.couponCode && (
                                     <p className="text-[8px] font-bold text-orange-500 uppercase">Code: {order.couponCode}</p>
                                   )}
                                 </div>
                               </td>
                               <td className="p-6">
                                 <div className="flex flex-col gap-1">
                                   <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                                     order.paymentMethod === 'Manual' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-green-50 text-green-600 border border-green-100'
                                   }`}>
                                     {order.paymentMethod}
                                   </span>
                                   {order.paymentMethod === 'Manual' && (
                                     <p className="text-[10px] text-black/40 font-mono">TX: {order.transactionID}</p>
                                   )}
                                 </div>
                               </td>
                               <td className="p-6">
                                 <div className="flex flex-col gap-2">
                                   <div className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase text-center w-fit border ${
                                     order.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                                     order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                     order.status === 'Shipped' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                     order.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                                   }`}>
                                     CURRENT: {order.status}
                                   </div>
                                   <div className="relative flex items-center">
                                     <div className={`absolute left-3 w-1.5 h-1.5 rounded-full ${
                                       order.status === 'Delivered' ? 'bg-green-500' :
                                       order.status === 'Cancelled' ? 'bg-red-500' :
                                       order.status === 'Shipped' ? 'bg-orange-500' :
                                       order.status === 'Processing' ? 'bg-blue-500' : 'bg-gray-400'
                                     }`} />
                                     <select 
                                       value={order.status}
                                       onChange={(e) => updateDocument('orders', order.id, { status: e.target.value })}
                                       className="pl-7 pr-4 py-2 bg-[#F8F9FA] border border-black/5 text-[10px] uppercase font-black rounded-lg outline-none cursor-pointer hover:border-orange-500 transition-all"
                                     >
                                       {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                         <option key={s} value={s} className="bg-white text-black">{s}</option>
                                       ))}
                                     </select>
                                   </div>
                                 </div>
                               </td>
                               <td className="p-6 text-right">
                                 <button 
                                   onClick={() => setSelectedOrder(order)}
                                   className="p-3 bg-white border border-black/5 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                                 >
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
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-black/5 gap-6 shadow-sm">
                   <div className="flex-1 w-full relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                      <input 
                        type="text" 
                        placeholder="Search by Product Name, Category or Item Code (ID)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F8F9FA] border border-black/5 pl-12 pr-4 py-4 rounded-2xl focus:border-orange-500 outline-none text-sm transition-all font-medium"
                      />
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                         <h2 className="text-xl font-black uppercase tracking-tighter italic">Inventory Matrix</h2>
                         <p className="text-xs text-black/40 font-medium">Synced {filteredProducts.length} Items</p>
                      </div>
                      <button 
                       onClick={() => { resetProductForm(); setShowProductModal(true); }}
                       className="flex items-center gap-3 px-8 py-4 bg-black text-white font-black rounded-xl hover:bg-orange-500 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest"
                      >
                        <Plus className="w-4 h-4" />
                        ADD PRODUCT
                      </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500">
                       <div className="aspect-square bg-[#F8F9FA] relative overflow-hidden flex items-center justify-center p-6">
                          <img 
                            src={p.images[0]} 
                            alt={p.name} 
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEditProduct(p)} className="p-4 bg-white text-black rounded-2xl shadow-2xl hover:bg-orange-500 hover:text-white transition-all active:scale-90 border border-black/5"><Settings className="w-4 h-4" /></button>
                             <button onClick={() => handleDeleteProduct(p.id)} className="p-4 bg-red-50 text-red-500 rounded-2xl shadow-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="absolute bottom-4 left-4">
                             <span className="bg-white px-3 py-1.5 rounded-full text-[10px] font-black text-orange-500 border border-black/5 shadow-sm">
                                CODE: {p.id.slice(-8).toUpperCase()}
                             </span>
                          </div>
                       </div>
                       <div className="p-8">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="font-black uppercase tracking-tighter truncate mr-2 italic">{p.name}</h3>
                             <p className="text-orange-500 font-black italic tracking-tighter">৳{Number(p.price).toLocaleString()}</p>
                          </div>
                          <p className="text-[10px] text-black/40 uppercase font-black mb-4 tracking-widest">{p.category}</p>
                          <div className="flex gap-2 mb-6">
                             {p.isHot && <span className="px-3 py-1 bg-red-50 text-red-500 text-[8px] font-black rounded-full uppercase">HOT</span>}
                             {p.isTopSale && <span className="px-3 py-1 bg-orange-50 text-orange-500 text-[8px] font-black rounded-full uppercase">TOP SALE</span>}
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-black/5 gap-2">
                             <button 
                               onClick={() => {
                                 const newStock = p.stock > 0 ? 0 : 100;
                                 updateDocument('products', p.id, { stock: newStock }).then(fetchData);
                               }}
                               className={`text-[9px] font-black px-4 py-2 rounded-full transition-all uppercase tracking-widest shadow-sm ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                             >
                                {p.stock > 0 ? 'INSTOCK' : 'OUT STOCK'}
                             </button>
                             <span className="text-[10px] font-black text-black/40 uppercase italic">
                                {p.stock} Units
                             </span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'coupons' && (
               <div className="space-y-8">
                 <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-black/5 gap-6 shadow-sm">
                    <div className="flex-1">
                       <h2 className="text-xl font-black uppercase tracking-tighter italic">Discount Protocol</h2>
                       <p className="text-xs text-black/40 font-medium">Manage global and product-specific incentives.</p>
                    </div>
                    <button 
                      onClick={() => { resetCouponForm(); setShowCouponModal(true); }}
                      className="flex items-center gap-3 px-8 py-4 bg-black text-white font-black rounded-xl hover:bg-orange-500 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" />
                      CREATE COUPON
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(c => (
                      <div key={c.id} className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                               <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl border border-orange-100">
                                  <Ticket className="w-6 h-6" />
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => handleEditCoupon(c)} className="p-3 bg-white text-black border border-black/5 rounded-xl hover:bg-black hover:text-white transition-all"><Settings className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteCoupon(c.id)} className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>
                            <h3 className="text-2xl font-black italic tracking-tighter mb-1 uppercase">{c.code}</h3>
                            <p className="text-orange-500 font-black text-lg mb-4">{c.discountPercentage}% OFF</p>
                            
                            <div className="flex items-center gap-2 mb-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                 c.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                               }`}>
                                 {c.isActive ? 'Active' : 'Disabled'}
                               </span>
                               <span className="px-3 py-1 bg-black/5 text-black/40 rounded-full text-[9px] font-black uppercase tracking-widest">
                                 {c.productId && c.productId !== 'ALL' ? 'Product Specific' : 'Global Access'}
                               </span>
                            </div>

                            {c.productId && c.productId !== 'ALL' && (
                              <p className="text-[10px] font-medium text-black/40 italic">
                                Target ID: {c.productId.slice(-12)}
                              </p>
                            )}
                         </div>
                         <div className="absolute -bottom-6 -right-6 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700">
                            <Ticket className="w-32 h-32" />
                         </div>
                      </div>
                    ))}
                    {coupons.length === 0 && (
                      <div className="col-span-full py-20 text-center bg-white border border-dashed border-black/10 rounded-[3rem]">
                         <Ticket className="w-12 h-12 text-black/5 mx-auto mb-4" />
                         <p className="text-black/40 font-medium italic">No active discount protocols initialized.</p>
                      </div>
                    )}
                 </div>
               </div>
             )}

             {tab === 'admins' && isSuperAdmin && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-black/5 gap-6 shadow-sm">
                    <div className="flex-1">
                       <h2 className="text-xl font-black uppercase tracking-tighter italic">Administrative Council</h2>
                       <p className="text-xs text-black/40 font-medium">Grant or revoke strategic operational access.</p>
                    </div>
                    <button 
                      onClick={() => setShowAdminModal(true)}
                      className="flex items-center gap-3 px-8 py-4 bg-black text-white font-black rounded-xl hover:bg-orange-500 transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest"
                    >
                      <UserPlus className="w-4 h-4" />
                      AUTHORIZE ADMIN
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Primary Super Admin Card */}
                    <div className="bg-white border-2 border-orange-500/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                             <div className="p-3 bg-orange-500 text-white rounded-2xl shadow-lg">
                                <ShieldCheck className="w-6 h-6" />
                             </div>
                             <span className="px-3 py-1 bg-orange-500 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-full">Primary Super</span>
                          </div>
                          <h3 className="text-lg font-black italic tracking-tighter mb-1 truncate">mahfujar003@gmail.com</h3>
                          <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">Root Authority</p>
                       </div>
                       <div className="absolute -bottom-6 -right-6 opacity-[0.05]">
                          <ShieldCheck className="w-32 h-32" />
                       </div>
                    </div>

                    {adminsList.filter(a => a.email !== 'mahfujar003@gmail.com').map(admin => (
                      <div key={admin.id} className="bg-white border border-black/5 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                               <div className="p-3 bg-[#F8F9FA] text-black/20 rounded-2xl border border-black/5">
                                  <Users className="w-6 h-6" />
                               </div>
                               <button 
                                 onClick={() => handleRemoveAdmin(admin.email)} 
                                 className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                            <h3 className="text-lg font-black italic tracking-tighter mb-1 truncate">{admin.email}</h3>
                            <div className="flex items-center gap-2">
                               <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                 admin.role === 'super' ? 'bg-orange-50 text-orange-500' : 'bg-black text-white'
                               }`}>
                                 {admin.role}
                               </span>
                               <span className="text-[9px] text-black/20 font-medium italic">Added {admin.addedAt?.toDate?.()?.toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="absolute -bottom-8 -right-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-500">
                            <Users className="w-40 h-40" />
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
             )}

             {tab === 'settings' && (
              <div className="max-w-3xl mx-auto space-y-8">
                 <div className="bg-white p-12 rounded-[3.5rem] border border-black/5 space-y-12 shadow-sm">
                    <div className="space-y-8">
                       <div className="flex items-center gap-4 text-orange-500">
                          <Truck className="w-8 h-8" />
                          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Logistics Protocol</h2>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block mb-2 px-1">Inside Dhaka (৳)</label>
                             <div className="relative">
                               <input 
                                type="number" 
                                value={settings.deliveryInsideDhaka}
                                onChange={e => setSettings({...settings, deliveryInsideDhaka: Number(e.target.value)})}
                                className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-[2rem] focus:border-orange-500 outline-none font-black text-lg shadow-inner" 
                               />
                               <Banknote className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/10" />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block mb-2 px-1">Outside Dhaka (৳)</label>
                             <div className="relative">
                               <input 
                                type="number" 
                                value={settings.deliveryOutsideDhaka}
                                onChange={e => setSettings({...settings, deliveryOutsideDhaka: Number(e.target.value)})}
                                className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-[2rem] focus:border-orange-500 outline-none font-black text-lg shadow-inner" 
                               />
                               <Banknote className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-black/10" />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8 border-t border-black/5 pt-12">
                       <div className="flex items-center gap-4 text-orange-500">
                          <Smartphone className="w-8 h-8" />
                          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Finance Routing</h2>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block mb-2 px-1">bKash Terminal</label>
                             <input 
                                type="text" 
                                value={settings.bkashNumber}
                                onChange={e => setSettings({...settings, bkashNumber: e.target.value})}
                                className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-[2rem] focus:border-orange-500 outline-none font-black text-sm uppercase shadow-inner" 
                             />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block mb-2 px-1">Nagad System</label>
                             <input 
                                type="text" 
                                value={settings.nagadNumber}
                                onChange={e => setSettings({...settings, nagadNumber: e.target.value})}
                                className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-[2rem] focus:border-orange-500 outline-none font-black text-sm uppercase shadow-inner" 
                             />
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleSaveSettings}
                      disabled={loading}
                      className="w-full py-8 bg-black text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2.5rem] flex items-center justify-center gap-3 hover:bg-orange-500 transition-all shadow-2xl active:scale-95"
                    >
                      <Save className="w-6 h-6" />
                      SYNCHRONIZE GLOBAL CONFIG
                    </button>
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Admin Modal */}
        <AnimatePresence>
          {showAdminModal && isSuperAdmin && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl">
               <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="w-full max-w-lg bg-white border border-black/5 rounded-[3.5rem] overflow-hidden shadow-2xl"
               >
                  <div className="flex justify-between items-center p-8 border-b border-black/5 bg-[#F8F9FA]/50">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Authorize <span className="text-orange-500 text-stroke-black">Operator</span></h2>
                    <button onClick={() => setShowAdminModal(false)} className="p-3 bg-black text-white rounded-full hover:bg-orange-500 transition-all shadow-lg active:scale-95">
                       <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleAddAdmin} className="p-10 space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Email Identifier</label>
                        <input 
                          type="email" 
                          required
                          value={adminForm.email}
                          onChange={e => setAdminForm({...adminForm, email: e.target.value})}
                          className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl font-bold text-sm shadow-inner focus:border-orange-500 outline-none" 
                          placeholder="admin@frenzway.com"
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Access Role</label>
                        <select 
                          value={adminForm.role}
                          onChange={e => setAdminForm({...adminForm, role: e.target.value as any})}
                          className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-sm shadow-inner focus:border-orange-500 outline-none cursor-pointer uppercase"
                        >
                          <option value="admin">Standard Operator</option>
                          <option value="super">Super Admin (Can manage others)</option>
                        </select>
                     </div>

                     <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                        <p className="text-[10px] text-orange-600 font-bold leading-relaxed uppercase italic">Warning: Granting access allows the user to modify product listings, view customer data, and update platform settings.</p>
                     </div>

                     <button 
                       disabled={loading}
                       className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2.5rem] hover:bg-orange-500 transition-all active:scale-95 shadow-2xl"
                     >
                       {loading ? 'AUTHORIZING...' : 'INITIALIZE ACCESS'}
                     </button>
                  </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-black/5"
              >
                <div className="p-8 border-b border-black/5 flex justify-between items-center bg-[#F8F9FA]">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Order <span className="text-orange-500">{selectedOrder.orderID}</span></h2>
                    <p className="text-[10px] font-black text-black/30 uppercase tracking-widest mt-1">Full Transaction Metadata</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-4 bg-white rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm group"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto">
                  {/* Products */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Box className="w-4 h-4 text-orange-500" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 px-1">Order Payload</h3>
                    </div>
                    <div className="bg-[#F8F9FA] rounded-3xl border border-black/5 divide-y divide-black/[0.03]">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-6 flex justify-between items-center">
                          <div className="flex gap-4 items-center">
                             <div className="w-12 h-12 bg-white rounded-xl border border-black/5 flex items-center justify-center text-xs font-black italic shadow-inner">
                                {idx + 1}
                             </div>
                             <div>
                                <p className="font-bold uppercase tracking-tight italic">{item.name}</p>
                                <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">Qty: {item.quantity}</p>
                             </div>
                          </div>
                          <p className="font-black italic text-lg tracking-tighter">৳{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Customer */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Users className="w-4 h-4 text-orange-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 px-1">Identity</h3>
                      </div>
                      <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm space-y-2">
                        <p className="text-xl font-black uppercase italic tracking-tighter">{selectedOrder.customerName}</p>
                        <p className="text-sm font-bold text-orange-500">{selectedOrder.phoneNumber}</p>
                        <div className="pt-4 mt-4 border-t border-black/5">
                           <div className="flex items-center gap-2 text-black/40 mb-2">
                             <MapPin className="w-3 h-3" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Destination</span>
                           </div>
                           <p className="text-sm font-medium leading-relaxed italic">{selectedOrder.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Banknote className="w-4 h-4 text-orange-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-black/40 px-1">Financial Analysis</h3>
                      </div>
                      <div className="bg-black text-white p-8 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
                        <div className="relative z-10 space-y-3">
                          <div className="flex justify-between items-center text-white/40">
                             <span className="text-[10px] font-black uppercase">Subtotal</span>
                             <span className="text-sm font-bold">৳{selectedOrder.total.toLocaleString()}</span>
                          </div>
                          {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-green-400">
                               <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                 <Ticket className="w-3 h-3" />
                                 {selectedOrder.couponCode}
                               </span>
                               <span className="text-sm font-bold">-৳{selectedOrder.discountAmount}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                             <span className="text-[10px] font-black uppercase tracking-widest">Gross Total</span>
                             <span className="text-3xl font-black italic tracking-tighter">৳{(selectedOrder.total - (selectedOrder.discountAmount || 0)).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                           <Banknote className="w-20 h-20 rotate-12" />
                        </div>
                      </div>

                      <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-black/5">
                        <p className="text-[8px] font-black text-black/30 uppercase tracking-[0.2em] mb-1">Payment Method</p>
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-black uppercase italic">{selectedOrder.paymentMethod}</span>
                           {selectedOrder.transactionID && (
                             <span className="text-[10px] font-mono text-orange-500 font-bold">{selectedOrder.transactionID}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-[#F8F9FA] border-t border-black/5 flex justify-end px-12">
                   <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-10 py-4 bg-black text-white text-xs font-black rounded-xl hover:bg-orange-500 transition-all uppercase tracking-widest shadow-lg"
                   >
                     Acknowledge
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Coupon Modal */}
        <AnimatePresence>
           {showCouponModal && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   className="w-full max-w-lg bg-white border border-black/5 rounded-[3.5rem] overflow-hidden shadow-2xl"
                >
                   <div className="flex justify-between items-center p-8 border-b border-black/5 bg-[#F8F9FA]/50">
                      <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                         {editingCoupon ? 'Update' : 'Generate'} <span className="text-orange-500 text-stroke-black">Incentive</span>
                      </h2>
                      <button onClick={() => setShowCouponModal(false)} className="p-3 bg-black text-white rounded-full hover:bg-orange-500 transition-all shadow-lg active:scale-95">
                         <X className="w-6 h-6" />
                      </button>
                   </div>

                   <form onSubmit={handleCouponSubmit} className="p-10 space-y-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Coupon Code</label>
                         <input 
                           type="text" 
                           required
                           value={couponForm.code}
                           onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                           className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl font-black text-2xl tracking-[0.2em] shadow-inner focus:border-orange-500 outline-none uppercase" 
                           placeholder="PROMO20"
                         />
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Discount Magnitude (%)</label>
                         <input 
                           type="number" 
                           required
                           min="1"
                           max="100"
                           value={couponForm.discountPercentage}
                           onChange={e => setCouponForm({...couponForm, discountPercentage: e.target.value})}
                           className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl font-black text-xl shadow-inner focus:border-orange-500 outline-none" 
                           placeholder="20"
                         />
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Product Lock (ID or 'ALL')</label>
                         <select 
                           value={couponForm.productId}
                           onChange={e => setCouponForm({...couponForm, productId: e.target.value})}
                           className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-sm shadow-inner focus:border-orange-500 outline-none cursor-pointer"
                         >
                           <option value="ALL">Apply to All Products</option>
                           {products.map(p => (
                             <option key={p.id} value={p.id}>{p.name} ({p.id.slice(-6).toUpperCase()})</option>
                           ))}
                         </select>
                      </div>

                      <label className="flex items-center gap-4 p-6 bg-[#F8F9FA] rounded-[2rem] border border-black/5 shadow-inner cursor-pointer group">
                        <input 
                          type="checkbox"
                          checked={couponForm.isActive}
                          onChange={e => setCouponForm({...couponForm, isActive: e.target.checked})}
                          className="w-6 h-6 rounded-lg bg-white border-black/10 text-orange-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Protocol Enabled</span>
                      </label>

                      <button 
                        disabled={loading}
                        className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2.5rem] hover:bg-orange-500 transition-all active:scale-95 shadow-2xl"
                      >
                        {loading ? 'SYNCHRONIZING...' : editingCoupon ? 'COMMIT UPDATE' : 'INITIALIZE COUPON'}
                      </button>
                   </form>
                </motion.div>
             </div>
           )}
        </AnimatePresence>

        {/* Product Modal */}
        <AnimatePresence>
           {showProductModal && (
             <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl">
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: 20 }}
                   className="w-full max-w-4xl bg-white border border-black/5 rounded-[3.5rem] overflow-hidden shadow-2xl"
                >
                   <div className="flex justify-between items-center p-8 border-b border-black/5 bg-[#F8F9FA]/50">
                      <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                         {editingProduct ? 'Update' : 'Index'} <span className="text-orange-500 text-stroke-black">Selection</span>
                      </h2>
                      <button onClick={() => setShowProductModal(false)} className="p-3 bg-black text-white rounded-full hover:bg-orange-500 transition-all shadow-lg active:scale-95">
                         <X className="w-6 h-6" />
                      </button>
                   </div>

                   <form onSubmit={handleProductSubmit} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto max-h-[70vh]">
                      <div className="space-y-8">
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square bg-[#F8F9FA] border-2 border-dashed border-black/10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-all group overflow-hidden relative shadow-inner"
                          >
                             {imagePreview ? (
                                 <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                             ) : (
                                 <>
                                    <ImageIcon className="w-12 h-12 text-black/10 mb-4 group-hover:text-orange-500 transition-colors" />
                                    <span className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em]">Upload Aesthetic Asset</span>
                                 </>
                             )}
                             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                    setImageFile(file);
                                    const r = new FileReader();
                                    r.onload = () => {
                                      setImagePreview(r.result as string);
                                      setProductForm(prev => ({ ...prev, imageUrl: '' })); // Clear URL if file selected
                                    };
                                    r.readAsDataURL(file);
                                 }
                             }} />
                          </div>

                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Or Direct Asset URL</label>
                             <input 
                               type="url" 
                               value={productForm.imageUrl}
                               onChange={e => {
                                 setProductForm({...productForm, imageUrl: e.target.value});
                                 setImagePreview(e.target.value);
                                 setImageFile(null); // Clear file if URL entered
                               }}
                               className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-xs shadow-inner focus:border-orange-500 outline-none" 
                               placeholder="https://assets.unsplash.com/..."
                             />
                          </div>

                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Category Segment</label>
                            <select 
                               value={productForm.category}
                               onChange={e => setProductForm({...productForm, category: e.target.value})}
                               className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-sm shadow-inner focus:border-orange-500 outline-none cursor-pointer"
                            >
                               {['Watches', 'Audio', 'Keyboards', 'Luxury', 'Ecosystem'].map(c => (
                                 <option key={c} value={c}>{c}</option>
                               ))}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Item Designation</label>
                            <input 
                              type="text" 
                              required
                              value={productForm.name}
                              onChange={e => setProductForm({...productForm, name: e.target.value})}
                              className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl font-black text-lg shadow-inner focus:border-orange-500 outline-none" 
                              placeholder="DESIGNATION"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Market Price (৳)</label>
                               <input 
                                 type="number" 
                                 required
                                 value={productForm.price}
                                 onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                                 className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl font-black text-lg shadow-inner focus:border-orange-500 outline-none" 
                               />
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Initial Stock</label>
                               <input 
                                 type="number" 
                                 required
                                 value={productForm.stock}
                                 onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})}
                                 className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl font-black text-lg shadow-inner focus:border-orange-500 outline-none" 
                               />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-6 bg-[#F8F9FA] p-6 rounded-[2rem] border border-black/5 shadow-inner">
                            <label className="flex items-center gap-4 cursor-pointer group">
                               <div className="relative">
                                  <input 
                                    type="checkbox"
                                    checked={productForm.isHot}
                                    onChange={e => setProductForm({...productForm, isHot: e.target.checked})}
                                    className="w-6 h-6 rounded-lg bg-white border-black/10 text-orange-500 focus:ring-0 cursor-pointer"
                                  />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Hot Deal</span>
                            </label>
                            <label className="flex items-center gap-4 cursor-pointer group">
                               <div className="relative">
                                  <input 
                                    type="checkbox"
                                    checked={productForm.isTopSale}
                                    onChange={e => setProductForm({...productForm, isTopSale: e.target.checked})}
                                    className="w-6 h-6 rounded-lg bg-white border-black/10 text-orange-500 focus:ring-0 cursor-pointer"
                                  />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-orange-500 transition-colors">Top Sale</span>
                            </label>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] block px-1">Narrative Projection</label>
                            <textarea 
                               value={productForm.description}
                               onChange={e => setProductForm({...productForm, description: e.target.value})}
                               className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-2xl focus:border-orange-500 outline-none min-h-[150px] text-sm font-medium text-black/70 shadow-inner"
                               placeholder="Articulate the value projection..."
                            />
                         </div>
                         <button 
                           disabled={loading}
                           className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2.5rem] hover:bg-orange-500 transition-all active:scale-95 shadow-2xl"
                         >
                           {loading ? 'SYNCHRONIZING...' : editingProduct ? 'COMMIT UPDATE' : 'INITIALIZE ASSET'}
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
