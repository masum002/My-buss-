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
    <div className="pt-24 pb-20 px-4 min-h-screen bg-[#050505] text-white">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">Live <span className="text-orange-500 text-stroke-white">Tracking</span></h1>
        <p className="text-white/40 mb-12 text-sm">Monitor your zen selection from fulfillment to your doorstep.</p>

        <form onSubmit={handleTrack} className="space-y-4 mb-12 p-8 bg-white/5 border border-white/10 rounded-3xl">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Order ID</label>
            <input
              type="text"
              required
              value={orderID}
              onChange={(e) => setOrderID(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none uppercase font-mono"
              placeholder="ZEN-XXXXXXX"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2 block">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-orange-500 outline-none"
              placeholder="+880 1XXX XXXXXX"
            />
          </div>
          <button
            disabled={loading}
            className="w-full py-4 bg-orange-500 text-white font-black rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? 'Searching Satellites...' : 'Track Order'}
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
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-lg">
                  <div className="bg-orange-500/10 p-6 border-b border-orange-500/20 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-black text-orange-500">Current Status</p>
                      <h2 className="text-2xl font-black text-white">{order.status}</h2>
                    </div>
                    <div className="p-4 bg-black/50 rounded-2xl border border-white/10">
                      {getStatusIcon(order.status)}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center flex-shrink-0">
                         <MapPin className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-white/40 font-bold mb-1">Destination</p>
                        <p className="text-sm">{order.address}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/10">
                       <p className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Order Summary</p>
                       {order.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-white/70">{item.name} x {item.quantity}</span>
                            <span className="font-bold">৳{item.price * item.quantity}</span>
                         </div>
                       ))}
                       <div className="pt-4 flex justify-between items-center text-lg font-black border-t border-white/5">
                          <span className="uppercase tracking-tighter">Total</span>
                          <span className="text-orange-500">৳{order.total}</span>
                       </div>
                    </div>
                    
                    <div className="py-4 px-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                        <span className="text-xs uppercase text-white/40 font-bold">Payment Method</span>
                        <span className="text-xs font-black px-3 py-1 bg-white/10 rounded-full">{order.paymentMethod}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2 uppercase">Selection Not Found</h3>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">Double-check your credentials or ensure the order was placed successfully.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
