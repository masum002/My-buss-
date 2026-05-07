import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getCollection } from '../lib/firestore';
import { Order } from '../types';
import { where } from 'firebase/firestore';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone } from 'lucide-react';

export default function OrderTracking() {
  const [orderID, setOrderID] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const results = await getCollection<Order>('orders', [
        where('orderID', '==', orderID),
        where('phoneNumber', '==', phone)
      ]);
      setOrder(results?.[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'Shipped': return <Truck className="w-5 h-5 text-orange-500" />;
      case 'Delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#F4F5F7] text-[#1A1A1A]">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter italic">Live <span className="text-orange-500 text-stroke-black">Tracking</span></h1>
        <p className="text-black/40 mb-12 text-sm font-medium italic">Monitor your FrenZway selection from fulfillment to your doorstep.</p>

        <form onSubmit={handleTrack} className="space-y-4 mb-12 p-8 bg-white border border-black/5 rounded-[2.5rem] shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1 px-1">Order ID</label>
            <input
              type="text"
              required
              value={orderID}
              onChange={(e) => setOrderID(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-black/5 p-4 rounded-xl focus:border-orange-500 outline-none uppercase font-mono shadow-inner"
              placeholder="FW-XXXXXXX"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1 px-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#F8F9FA] border border-black/5 p-4 rounded-xl focus:border-orange-500 outline-none shadow-inner"
              placeholder="+880 1XXX XXXXXX"
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-5 bg-black text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-500 transition-all active:scale-95 shadow-xl uppercase tracking-widest text-xs"
          >
            {loading ? 'Searching Satellites...' : 'Track Package'}
            <Search className="w-4 h-4" />
          </button>
        </form>

        <AnimatePresence>
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {order ? (
                <div className="bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-xl">
                  <div className="bg-orange-50 p-6 border-b border-orange-500/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black text-orange-500 tracking-widest">Protocol Status</p>
                      <h2 className="text-3xl font-black text-black italic tracking-tighter uppercase">{order.status}</h2>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-black/5 shadow-sm">
                      {getStatusIcon(order.status)}
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-[#F8F9FA] rounded-2xl flex items-center justify-center flex-shrink-0 border border-black/5">
                         <MapPin className="w-5 h-5 text-black/20" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-black/30 font-black tracking-widest mb-1">Destination</p>
                        <p className="text-sm font-bold text-black/70 leading-relaxed">{order.address}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-black/5">
                       <p className="text-[10px] uppercase text-black/20 font-black tracking-[0.3em]">Payload Summary</p>
                       {order.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-black/60 font-medium">{item.name} x {item.quantity}</span>
                            <span className="font-black italic">৳{(item.price * item.quantity).toLocaleString()}</span>
                         </div>
                       ))}
                       <div className="space-y-2 pt-4 border-t border-black/5 opacity-60">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                             <span>Delivery</span>
                             <span>৳{(order.deliveryCharge || 0).toLocaleString()}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-green-600">
                               <span>Discount</span>
                               <span>-৳{order.discountAmount.toLocaleString()}</span>
                            </div>
                          )}
                       </div>
                       <div className="pt-6 flex justify-between items-center text-xl font-black border-t border-black/5 italic tracking-tighter">
                          <span className="uppercase">Total Value</span>
                          <span className="text-orange-500">৳{order.total.toLocaleString()}</span>
                       </div>
                    </div>
                    
                    <div className="py-5 px-6 bg-[#F8F9FA] rounded-2xl border border-black/5 flex items-center justify-between">
                        <span className="text-[10px] uppercase text-black/20 font-black tracking-widest">Settlement</span>
                        <span className="text-[10px] font-black px-4 py-1.5 bg-white border border-black/5 rounded-full shadow-sm uppercase italic">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-dashed border-black/10 rounded-[3rem] shadow-inner">
                  <Package className="w-16 h-16 text-black/5 mx-auto mb-6" />
                  <h3 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">Selection Not Found</h3>
                  <p className="text-black/40 text-sm max-w-xs mx-auto font-medium">Double-check your credentials or ensure the order was synchronized correctly.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
