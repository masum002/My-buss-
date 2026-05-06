import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { createDocument, getDocument } from '../lib/firestore';
import { auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { CheckCircle2, ChevronRight, Upload, Smartphone, CreditCard, Banknote, Image as ImageIcon, Loader2, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

type Step = 'info' | 'payment' | 'success';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>('info');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

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
  }, []);

  const deliveryCharge = formData.region === 'Inside Dhaka' ? settings.deliveryInsideDhaka : settings.deliveryOutsideDhaka;
  const grandTotal = total + deliveryCharge;

  if (items.length === 0 && step !== 'success') {
    navigate('/');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    return 'ZEN-' + Math.random().toString(36).substring(2, 9).toUpperCase();
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
      items: items,
      total: grandTotal,
      subtotal: total,
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
      await createDocument('orders', newOrderID, orderData);
      setOrderId(newOrderID);
      setStep('success');
      clearCart();
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
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#050505] text-white">
      <div className="max-w-2xl mx-auto">
        
        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-12">
          {['info', 'payment', 'success'].map((s, idx) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-1 flex-1 rounded-full ${
                step === s || (step === 'payment' && s === 'info') || step === 'success' 
                ? 'bg-orange-500' : 'bg-white/10'
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
              <h1 className="text-3xl font-black uppercase">Delivery <span className="text-orange-500">Details</span></h1>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-colors"
                    placeholder="+880 1XXX XXXXXX"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block tracking-widest">Shipping Region</label>
                  <div className="grid grid-cols-2 gap-4">
                    {['Inside Dhaka', 'Outside Dhaka'].map(r => (
                      <button 
                        key={r}
                        onClick={() => setFormData({...formData, region: r as any})}
                        className={`p-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                          formData.region === r ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-white/10 bg-white/5 text-white/40'
                        }`}
                      >
                         <MapPin className="w-4 h-4" />
                         {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-2 block tracking-widest">Shipping Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none transition-colors min-h-[120px]"
                    placeholder="Full Area, Road, House details"
                  />
                </div>
              </div>
              <button
                disabled={!formData.name || !formData.phone || !formData.address}
                onClick={handleNext}
                className="w-full py-4 bg-orange-500 text-white font-black rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continue to Payment
                <ChevronRight className="w-5 h-5" />
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
              <h1 className="text-3xl font-black uppercase">Secure <span className="text-orange-500">Checkout</span></h1>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.paymentMethod === 'COD' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Banknote className="w-8 h-8" />
                  <span className="font-bold">Cash On Delivery</span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, paymentMethod: 'Manual' })}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    formData.paymentMethod === 'Manual' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <Smartphone className="w-8 h-8" />
                  <span className="font-bold">Manual Payment</span>
                </button>
              </div>

              {formData.paymentMethod === 'Manual' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                  <div className="flex gap-4">
                    {['bKash', 'Nagad', 'Rocket'].map((gateway) => (
                      <button
                        key={gateway}
                        onClick={() => setFormData({ ...formData, paymentGateway: gateway as any })}
                        className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                          formData.paymentGateway === gateway ? 'border-orange-500 bg-orange-500/10' : 'border-white/10'
                        }`}
                      >
                        {gateway}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-center">
                    <p className="text-sm text-orange-500 font-bold mb-1 underline">
                      Send Money to: {formData.paymentGateway === 'bKash' ? settings.bkashNumber : settings.nagadNumber}
                    </p>
                    <p className="text-[10px] text-orange-500 opacity-70 uppercase tracking-widest font-black">Official Merchant/Personal</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Transaction ID</label>
                    <input
                      type="text"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-orange-500"
                      placeholder="e.g. 5K9L8P4M"
                    />
                  </div>

                  <div>
                     <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Screenshot (Optional)</label>
                     <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-all overflow-hidden"
                     >
                        {screenshotPreview ? (
                          <img src={screenshotPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <ImageIcon className="w-8 h-8 text-white/20 mb-2" />
                            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Tap to Upload Receipt</span>
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

              <div className="bg-white p-6 rounded-2xl text-black">
                <div className="space-y-2 mb-4 border-b pb-4">
                   <div className="flex justify-between text-xs font-bold text-black/40">
                      <span>Subtotal</span>
                      <span>৳{total.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-xs font-bold text-black/40">
                      <span>Delivery Charge ({formData.region})</span>
                      <span>৳{deliveryCharge}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                   <span className="font-bold text-black/40 uppercase text-[10px]">Grand Total</span>
                   <span className="text-2xl font-black text-orange-500">৳{grandTotal.toFixed(2)}</span>
                </div>
                <button
                  disabled={loading || (formData.paymentMethod === 'Manual' && !formData.transactionId)}
                  onClick={handleSubmit}
                  className="w-full py-4 bg-black text-white font-bold rounded-xl mt-4 disabled:opacity-50 active:scale-95 transition-transform"
                >
                  {loading ? 'Processing...' : 'Complete Purchase'}
                </button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white/5 border border-white/10 rounded-[3rem]"
            >
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-black uppercase mb-4">অর্ডার <span className="text-green-500">সম্পন্ন!</span></h1>
              <p className="text-white/60 mb-8 max-w-sm mx-auto">আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অর্ডার আইডিটি সংরক্ষণ করুন।</p>
              
              <div className="inline-block p-6 bg-white/10 rounded-2xl border-2 border-dashed border-orange-500 mb-8">
                 <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Your Order ID</p>
                 <p className="text-2xl font-black text-orange-500">{orderId}</p>
              </div>

              <div className="bg-orange-500/5 p-4 rounded-xl border border-orange-500/10 mb-12 max-w-xs mx-auto">
                 <p className="text-[10px] text-orange-500 font-bold uppercase leading-relaxed">
                   বিশেষ দ্রষ্টব্য: আপনার মোবাইল নম্বর ও প্রোডাক্টের আইডি দিয়ে পরবর্তীতে প্রোডাক্টটি ট্র্যাকিং করতে পারবেন।
                 </p>
              </div>

              <div className="flex flex-col gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => navigate('/track')}
                  className="w-full py-4 bg-white text-black font-bold rounded-2xl"
                >
                  Track Live Status
                </button>
                <button
                   onClick={() => navigate('/')}
                   className="text-white/40 hover:text-white text-sm font-bold uppercase"
                >
                   Return to Gallery
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
