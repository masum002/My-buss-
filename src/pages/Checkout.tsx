import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../lib/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { createDocument, getDocument, getCollection, updateDocument } from '../lib/firestore';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CheckCircle2, ChevronRight, Upload, Smartphone, CreditCard, Banknote, Image as ImageIcon, Loader2, MapPin, Ticket, Tag, X, Box } from 'lucide-react';
import confetti from 'canvas-confetti';
import { where, increment } from 'firebase/firestore';
import { Coupon, Product } from '../types';

type Step = 'info' | 'payment' | 'success';

export default function Checkout() {
  const { items, getTotal, clearCart, removeItem } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const directBuyItem = location.state?.directBuy;
  
  // If directBuy, only show that item
  const checkoutItems = directBuyItem 
    ? [{ ...directBuyItem, quantity: directBuyItem.quantity || 1 }] 
    : items;

  const cleanPrice = (val: any) => {
    if (typeof val === 'number') return val;
    const cleaned = parseFloat(String(val).replace(/[^0-9.]/g, ''));
    return isNaN(cleaned) ? 0 : cleaned;
  };

  const calculateSubtotal = () => {
    return checkoutItems.reduce((acc, item) => {
      const price = cleanPrice(item.price);
      const qty = parseInt(String(item.quantity)) || 1;
      return acc + (price * qty);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [settings, setSettings] = useState({
    deliveryInsideDhaka: 60,
    deliveryOutsideDhaka: 120,
    bkashNumber: '01700-000000',
    nagadNumber: '01800-000000'
  });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    region: 'Inside Dhaka' as 'Inside Dhaka' | 'Outside Dhaka',
    paymentMethod: 'COD' as 'COD' | 'Manual',
    paymentGateway: 'bKash' as 'bKash' | 'Nagad' | 'Rocket',
    transactionId: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getDocument<any>('settings', 'global');
      if (data) setSettings(data);
    };
    
    fetchSettings();
  }, [checkoutItems.length]);

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const coupons = await getCollection<Coupon>('coupons', [where('code', '==', couponInput.toUpperCase())]);
      if (coupons && coupons.length > 0) {
        const coupon = coupons[0];
        if (!coupon.isActive) {
          setCouponError('This coupon is currently inactive.');
          return;
        }

        // Check if it's product specific
        if (coupon.productId && coupon.productId !== 'ALL') {
          const hasProduct = checkoutItems.some(item => item.id === coupon.productId);
          if (!hasProduct) {
            setCouponError('This coupon is not valid for the items in your order.');
            return;
          }
        }

        setAppliedCoupon(coupon);
        setCouponInput('');
        alert(`Success! ${coupon.discountPercentage}% discount applied.`);
      } else {
        setCouponError('Invalid coupon code.');
      }
    } catch (err) {
      setCouponError('Error validating coupon. Try again.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    let discountableAmount = 0;
    if (appliedCoupon.productId && appliedCoupon.productId !== 'ALL') {
      // Only apply discount to the specific product
      const targetItem = checkoutItems.find(item => item.id === appliedCoupon.productId);
      if (targetItem) {
        discountableAmount = cleanPrice(targetItem.price);
      }
    } else {
      // Global discount
      discountableAmount = subtotal;
    }

    return (discountableAmount * appliedCoupon.discountPercentage) / 100;
  };

  const discountAmount = calculateDiscount();
  const deliveryCharge = cleanPrice(formData.region === 'Inside Dhaka' ? settings.deliveryInsideDhaka : settings.deliveryOutsideDhaka);
  const grandTotal = (subtotal || 0) - (discountAmount || 0) + (deliveryCharge || 0);

  if (checkoutItems.length === 0 && step !== 'success') {
    navigate('/');
    return null;
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateOrderID = () => {
    return 'FW-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  };

  const handleNext = () => setStep('payment');

  const handleSubmit = async () => {
    setLoading(true);
    const newOrderID = generateOrderID();
    
    let screenshotURL = '';
    if (screenshot && formData.paymentMethod === 'Manual') {
      setUploading(true);
      try {
        const storageRef = ref(storage, `screenshots/${newOrderID}-${screenshot.name}`);
        await uploadBytes(storageRef, screenshot);
        screenshotURL = await getDownloadURL(storageRef);
      } catch (err) {
        console.error("Screenshot upload failed", err);
      } finally {
        setUploading(false);
      }
    }

    const orderData = {
      orderID: newOrderID,
      customerName: formData.name,
      phoneNumber: formData.phone,
      address: formData.address,
      items: checkoutItems.map(item => ({
        ...item,
        price: cleanPrice(item.price),
        quantity: parseInt(String(item.quantity)) || 1
      })),
      total: grandTotal || 0,
      subtotal: subtotal || 0,
      discountAmount: discountAmount || 0,
      couponCode: appliedCoupon?.code || null,
      deliveryCharge: deliveryCharge,
      region: formData.region,
      paymentMethod: formData.paymentMethod,
      paymentGateway: formData.paymentMethod === 'Manual' ? formData.paymentGateway : 'None',
      transactionID: formData.transactionId || '',
      screenshotURL: screenshotURL,
      status: 'Pending',
      createdAt: new Date(),
    };

    try {
      // 1. Create the order
      await createDocument('orders', newOrderID, orderData);
      
      // 2. Decrease Stock for each item
      for (const item of checkoutItems) {
        const qty = parseInt(String(item.quantity)) || 1;
        await updateDocument('products', item.id, {
          stock: increment(-qty)
        });
      }

      setOrderId(newOrderID);
      setStep('success');
      
      // If direct buy, only remove that item from cart. If cart checkout, clear all.
      if (directBuyItem) {
        removeItem(directBuyItem.id);
      } else {
        clearCart();
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F97316', '#FFFFFF', '#000000']
      });
    } catch (error) {
      console.error(error);
      alert('Checkout failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-4 px-4 bg-[#F4F5F7] text-[#1A1A1A]">
      <div className="max-w-2xl mx-auto min-h-[20vh]">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-12">
          {['info', 'payment', 'success'].map((s, idx) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
                step === s || (step === 'payment' && s === 'info') || step === 'success' 
                ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-black/5'
              }`} />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic leading-none">
                Delivery <span className="text-orange-500">Information</span>
              </h1>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-black/30 mb-2 block tracking-widest px-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-black/5 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all shadow-sm font-black text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black/30 mb-2 block tracking-widest px-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white border border-black/5 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all shadow-sm font-black text-sm"
                    placeholder="01XXX XXXXXX"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black/30 mb-2 block tracking-widest px-1">Region</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Inside Dhaka', 'Outside Dhaka'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setFormData({...formData, region: r as any})}
                        className={`p-4 rounded-xl border font-black transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest ${
                          formData.region === r ? 'border-orange-500 bg-orange-500/5 text-orange-600 shadow-sm' : 'border-black/5 bg-white text-black/40'
                        }`}
                      >
                         <MapPin className="w-3 h-3" />
                         {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-black/30 mb-2 block tracking-widest px-1">Full Address</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-black/5 p-4 rounded-2xl focus:border-orange-500 outline-none transition-all shadow-sm font-black text-sm min-h-[100px] resize-none"
                    placeholder="Area, Road, House details..."
                  />
                </div>
              </div>
              <button
                disabled={!formData.name || !formData.phone || !formData.address}
                onClick={handleNext}
                className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl hover:bg-orange-500 transition-all font-sans"
              >
                Payment Options
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Secure Gateway Section */}
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">Secure <span className="text-orange-500">Gateway</span></h1>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.paymentMethod === 'COD' ? 'border-orange-500 bg-orange-500/5 shadow-lg' : 'border-black/5 bg-white grayscale opacity-60'
                  }`}
                >
                  <Banknote className="w-8 h-8 text-orange-500" />
                  <span className="font-black uppercase text-[9px] tracking-widest">Cash On Delivery</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Manual' })}
                  className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.paymentMethod === 'Manual' ? 'border-orange-500 bg-orange-500/5 shadow-lg' : 'border-black/5 bg-white grayscale opacity-60'
                  }`}
                >
                  <Smartphone className="w-8 h-8 text-orange-500" />
                  <span className="font-black uppercase text-[9px] tracking-widest">Direct Transfer</span>
                </button>
              </div>

              {formData.paymentMethod === 'Manual' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-8 bg-white p-8 rounded-[3rem] border border-black/5 shadow-xl">
                  <div className="flex gap-4">
                    {['bKash', 'Nagad', 'Rocket'].map((gateway) => (
                      <button
                        key={gateway}
                        onClick={() => setFormData({ ...formData, paymentGateway: gateway as any })}
                        className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                          formData.paymentGateway === gateway ? 'border-orange-500 bg-orange-500/5 text-orange-500' : 'border-black/5 text-black/20'
                        }`}
                      >
                        {gateway}
                      </button>
                    ))}
                  </div>
                  <div className="p-6 bg-[#F8F9FA] rounded-[2rem] text-center border-2 border-dashed border-black/5">
                    <p className="text-[10px] text-black/30 font-black uppercase tracking-widest mb-2">Protocol: Send Money To</p>
                    <p className="text-xl font-black text-black italic">
                      {formData.paymentGateway === 'bKash' ? settings.bkashNumber : settings.nagadNumber}
                    </p>
                    <p className="text-[8px] text-orange-500 opacity-70 uppercase tracking-widest font-black mt-3">
                      Verified {formData.paymentGateway === 'bKash' ? settings.bkashType : settings.nagadType} Terminal
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-black/30 block mb-3 px-1 tracking-widest">Authorization Hash (Transaction ID)</label>
                    <input
                      type="text"
                      required={formData.paymentMethod === 'Manual'}
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      className="w-full bg-[#F8F9FA] border border-black/5 p-6 rounded-[2rem] outline-none focus:border-orange-500 font-black text-sm"
                      placeholder="e.g. 5K9L8P4M"
                    />
                  </div>

                  <div>
                     <label className="text-[10px] font-black uppercase text-black/30 block mb-3 px-1 tracking-widest">Visual Confirmation (Screenshot)</label>
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video bg-[#F8F9FA] border-2 border-dashed border-black/10 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 shadow-inner group overflow-hidden"
                     >
                        {screenshotPreview ? (
                          <img src={screenshotPreview} alt="Preview" className="w-full h-full object-contain p-4" />
                        ) : (
                          <>
                            <ImageIcon className="w-10 h-10 text-black/10 mb-4 group-hover:text-orange-500 transition-colors" />
                            <span className="text-[10px] text-black/20 uppercase font-black tracking-widest group-hover:text-orange-500 transition-colors">Attach Receipt Visual</span>
                          </>
                        )}
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                     />
                  </div>
                </motion.div>
              )}

                <div className="bg-white p-10 rounded-[3rem] border border-black/5 shadow-2xl">
                {/* Coupon Section */}
                <div className="mb-8 p-6 bg-[#F8F9FA] rounded-[2rem] border border-black/5">
                   <p className="text-[10px] font-black uppercase text-black/30 tracking-widest mb-4 px-1">Discount Protocol</p>
                   {!appliedCoupon ? (
                     <div className="flex gap-2">
                       <div className="flex-1 relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                          <input 
                            type="text" 
                            className="w-full bg-white border border-black/5 pl-12 pr-4 py-3 rounded-xl focus:border-orange-500 outline-none text-xs font-black uppercase tracking-widest"
                            placeholder="COUPON CODE"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          />
                       </div>
                       <button 
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput}
                        className="px-6 py-3 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:bg-orange-500 transition-all disabled:opacity-50"
                      >
                         {validatingCoupon ? '...' : 'APPLY'}
                       </button>
                    </div>
                   ) : (
                     <div className="flex items-center justify-between bg-orange-500 text-white p-4 rounded-xl shadow-lg">
                        <div className="flex items-center gap-3">
                           <Ticket className="w-5 h-5" />
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-tighter">{appliedCoupon.code}</p>
                              <p className="text-[9px] opacity-80 font-bold uppercase tracking-widest">{appliedCoupon.discountPercentage}% Discount Active</p>
                           </div>
                        </div>
                        <button onClick={() => setAppliedCoupon(null)} className="p-2 hover:bg-white/20 rounded-full transition-all">
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                   {couponError && <p className="text-[9px] text-red-500 font-bold mt-2 px-1 uppercase tracking-widest">{couponError}</p>}
                </div>

                <div className="space-y-4 mb-8 border-b border-black/5 pb-8">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/30">
                      <span>{directBuyItem ? 'Direct Order Total' : `Cart Subtotal (${checkoutItems.reduce((acc, item) => acc + (item.quantity || 0), 0)} Items)`}</span>
                      <span className="text-black">৳{(subtotal || 0).toLocaleString()}</span>
                   </div>
                   {discountAmount > 0 && (
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-600">
                        <span>Incentive Discount</span>
                        <span>-৳{(discountAmount || 0).toLocaleString()}</span>
                     </div>
                   )}
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-black/30">
                      <span>Shiftment Protocol ({formData.region})</span>
                      <span className="text-black">৳{cleanPrice(deliveryCharge)}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center mb-8">
                   <span className="font-black uppercase text-[10px] tracking-widest text-black/30 italic">Total Valuation</span>
                   <span className="text-3xl font-black text-orange-500 italic">৳{(grandTotal || 0).toLocaleString()}</span>
                </div>
                <button
                  disabled={loading || (formData.paymentMethod === 'Manual' && !formData.transactionId)}
                  onClick={handleSubmit}
                  className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl disabled:opacity-50 hover:bg-orange-500 transition-all shadow-xl"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" /> : 'Confirm Order'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white border border-black/5 rounded-[4rem] shadow-2xl px-12"
            >
              <div className="flex justify-center mb-12">
                <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 animate-bounce">
                  <CheckCircle2 className="w-16 h-16" />
                </div>
              </div>
              <h1 className="text-5xl font-black uppercase mb-6 tracking-tighter leading-none italic">Order <span className="text-green-500">Commited</span></h1>
              <p className="text-black/40 mb-12 max-w-sm mx-auto font-medium">Your request has been successfully processed through our intelligence systems.</p>
              
              <div className="inline-block p-10 bg-[#F8F9FA] rounded-[2.5rem] border-2 border-dashed border-orange-500/30 mb-12 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rotate-45 translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />
                 <p className="text-[10px] text-black/30 uppercase tracking-[0.4em] font-black mb-3">Asset Tracking Code</p>
                 <p className="text-4xl font-black text-orange-500 tracking-tighter italic">{orderId}</p>
              </div>

              <div className="bg-orange-500/5 p-6 rounded-2xl border border-orange-500/10 mb-12 max-w-md mx-auto">
                 <p className="text-[10px] text-orange-600 font-black uppercase leading-relaxed tracking-wider">
                   Critical note: Use this tracking code at our central terminal to monitor real-time logistics progress.
                 </p>
              </div>

              <div className="flex flex-col gap-6 max-w-xs mx-auto">
                <button
                  onClick={() => navigate('/track')}
                  className="w-full py-6 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-orange-500 transition-all hover:-translate-y-1"
                >
                  Enter Tracking Terminal
                </button>
                <button
                   onClick={() => navigate('/')}
                   className="text-black/20 hover:text-black text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
                >
                   Return to Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
