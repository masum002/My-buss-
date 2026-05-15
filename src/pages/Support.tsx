import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { MessageSquareWarning, Phone, Mail, MapPin, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { addDocument } from '../lib/firestore';

export default function Support() {
  const location = useLocation();
  const [formType, setFormType] = useState<'report' | 'contact'>('report');
  
  useEffect(() => {
    if (location.state?.type) {
      setFormType(location.state.type);
    }
  }, [location.state]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDocument('reports', {
        ...formData,
        type: formType,
        createdAt: new Date(),
        status: 'pending'
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="pt-32 pb-20 px-4 min-h-screen bg-[#F4F5F7]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto bg-white rounded-[3rem] p-12 text-center border border-black/5 shadow-xl"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Submission Received</h2>
          <p className="text-black/40 font-medium leading-relaxed">Thank you for reaching out. Our protocol officers will analyze your transmission and respond if necessary.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-10 w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl"
          >
            Return to Base
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen bg-[#F4F5F7]">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                  <h1 className="text-3xl font-black uppercase italic tracking-tighter">Support <span className="text-indigo-600">Hub</span></h1>
                  <p className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em]">Transmission Protocol Active</p>
               </div>
            </div>

            <button 
              onClick={() => setFormType('report')}
              className={`w-full p-6 rounded-[2rem] border transition-all text-left group ${formType === 'report' ? 'bg-black border-black shadow-2xl' : 'bg-white border-black/5 hover:border-black'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${formType === 'report' ? 'bg-orange-500' : 'bg-[#F8F9FA] text-black/20 group-hover:text-black'}`}>
                  <MessageSquareWarning className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${formType === 'report' ? 'text-white/40' : 'text-black/20'}`}>Protocol: 01</p>
                  <p className={`font-black uppercase italic tracking-tighter ${formType === 'report' ? 'text-white' : 'text-black'}`}>Sent a Report</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => setFormType('contact')}
              className={`w-full p-6 rounded-[2rem] border transition-all text-left group ${formType === 'contact' ? 'bg-black border-black shadow-2xl' : 'bg-white border-black/5 hover:border-black'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${formType === 'contact' ? 'bg-orange-500' : 'bg-[#F8F9FA] text-black/20 group-hover:text-black'}`}>
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${formType === 'contact' ? 'text-white/40' : 'text-black/20'}`}>Protocol: 02</p>
                  <p className={`font-black uppercase italic tracking-tighter ${formType === 'contact' ? 'text-white' : 'text-black'}`}>Contact Us</p>
                </div>
              </div>
            </button>

            <div className="p-8 bg-white rounded-[2.5rem] border border-black/5 space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[8px] font-black uppercase text-black/20 tracking-widest">Email</p>
                  <p className="text-xs font-black">support@frenzway.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[8px] font-black uppercase text-black/20 tracking-widest">Office</p>
                  <p className="text-xs font-black">Dhaka, Bangladesh</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <motion.div 
              key={formType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[3rem] p-10 md:p-12 border border-black/5 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                {formType === 'report' ? <MessageSquareWarning className="w-32 h-32" /> : <Phone className="w-32 h-32" />}
              </div>

              <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-10">
                {formType === 'report' ? (
                  <>Report a <span className="text-orange-500">Conflict</span></>
                ) : (
                  <>Reach our <span className="text-orange-500">Comm-Link</span></>
                )}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] px-2">User Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter Name"
                      className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-xs shadow-inner focus:border-orange-500 outline-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] px-2">Contact Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="Email Address"
                      className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-xs shadow-inner focus:border-orange-500 outline-none" 
                    />
                  </div>
                </div>

                {formType === 'report' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] px-2">Asset ID (Order # - Optional)</label>
                    <input 
                      type="text" 
                      value={formData.orderId}
                      onChange={e => setFormData({...formData, orderId: e.target.value})}
                      placeholder="FW-XXXXXX"
                      className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-xs shadow-inner focus:border-orange-500 outline-none" 
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] px-2">Subject</label>
                  <input 
                    required
                    type="text" 
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder="Transmissions Topic"
                    className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-xs shadow-inner focus:border-orange-500 outline-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-black/30 tracking-[0.2em] px-2">Transmissions Content</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    placeholder="Provide details..."
                    className="w-full bg-[#F8F9FA] border border-black/5 p-5 rounded-2xl font-black text-xs shadow-inner focus:border-orange-500 outline-none min-h-[150px]" 
                  />
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-6 bg-black text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-orange-500 transition-all shadow-xl disabled:opacity-50"
                >
                  {loading ? 'Transmitting...' : (
                    <>
                      Execute Transmission <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
