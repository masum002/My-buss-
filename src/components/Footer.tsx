import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MapPin, Shield, HelpCircle, Info, Facebook, Instagram, Twitter } from 'lucide-react';
import { getDocument } from '../lib/firestore';

type ModalType = 'contact' | 'about' | 'help' | 'privacy' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getDocument<any>('settings', 'global');
      if (data) setSettings(data);
    };
    fetchSettings();
  }, []);

  const footerLinks = [
    { label: 'Contact Us', type: 'contact' as ModalType, icon: Mail },
    { label: 'About Us', type: 'about' as ModalType, icon: Info },
    { label: 'Help Center', type: 'help' as ModalType, icon: HelpCircle },
    { label: 'Privacy Policy', type: 'privacy' as ModalType, icon: Shield },
  ];

  const modalContent = {
    contact: {
      title: 'Contact Us',
      content: (
        <div className="space-y-6">
          <p className="text-black font-medium">আমাদের সাথে যোগাযোগ করার জন্য নিচের তথ্যগুলো ব্যবহার করুন। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-black/10">
              <Phone className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-black/50">Hotline</p>
                <p className="font-black text-black">{settings?.hotline || '+880 1700-000000'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-black/10">
              <Mail className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-black/50">Email Support</p>
                <p className="font-black text-black">{settings?.emailSupport || 'support@frenzway.com'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-black/10">
              <MapPin className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-black/50">Registered Office</p>
                <p className="font-black text-black">{settings?.registeredOffice || 'Dhanmondi, Dhaka, Bangladesh'}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    about: {
      title: 'About FrenZway',
      content: (
        <div className="space-y-6">
          <p className="text-black/60 leading-relaxed">
            <span className="font-black text-black">FrenZway</span> বাংলাদেশের একটি প্রিমিয়াম টেক এবং লাইফস্টাইল গেজেট শপ। আমরা বিশ্বাস করি গুণমানের সাথে কোনো আপোষ চলবে না। 
          </p>
          <p className="text-black/60 leading-relaxed">
            আমাদের লক্ষ্য হলো সারা বিশ্বের সেরা এবং ট্রেন্ডি পণ্যগুলো খুব সহজে এবং সাশ্রয়ী মূল্যে বাংলাদেশের প্রযুক্তিপ্রেমীদের হাতে পৌঁছে দেওয়া। আমাদের প্রতিটি পণ্য শতভাগ অরিজিনাল এবং গুণগত মান যাচাইকৃত।
          </p>
          <div className="pt-4 border-t border-black/5">
            <p className="text-xs font-bold italic text-orange-500">"Redefining your tech experience, one gadget at a time."</p>
          </div>
        </div>
      )
    },
    help: {
      title: 'Help Center',
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <details className="group bg-[#F8F9FA] rounded-2xl border border-black/10 p-5 cursor-pointer">
              <summary className="font-black text-sm list-none flex justify-between items-center text-black">
                কিভাবে অর্ডার করব?
                <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-[13px] text-black font-medium mt-3 leading-relaxed">সহজেই শপ সেকশন থেকে আপনার পছন্দের পণ্যটি কার্টে যোগ করুন এবং চেকআউট পেজে গিয়ে আপনার নাম, ফোন নম্বর এবং ঠিকানা দিয়ে কনফার্ম করুন। কোনো অ্যাকাউন্ট খোলার প্রয়োজন নেই।</p>
            </details>
            <details className="group bg-[#F8F9FA] rounded-2xl border border-black/10 p-5 cursor-pointer">
              <summary className="font-black text-sm list-none flex justify-between items-center text-black">
                ডেলিভারি চার্জ কত?
                <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-[13px] text-black font-medium mt-3 leading-relaxed">ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। অর্ডার করার ২-৫ দিনের মধ্যে ডেলিভারি সম্পন্ন করা হয়।</p>
            </details>
            <details className="group bg-[#F8F9FA] rounded-2xl border border-black/10 p-5 cursor-pointer">
              <summary className="font-black text-sm list-none flex justify-between items-center text-black">
                পেমেন্ট কিভাবে করব?
                <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-[13px] text-black font-medium mt-3 leading-relaxed">আমরা ক্যাশ অন ডেলিভারি (COD) এবং বিকাশ/নগদ পেমেন্ট গ্রহণ করি।</p>
            </details>
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <div className="space-y-6 text-sm text-black/60 leading-relaxed overflow-y-auto max-h-[400px] pr-4">
          <p>FrenZway এ আপনার প্রাইভেসী আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ।</p>
          <h4 className="font-black text-black uppercase text-xs">১. তথ্য সংগ্রহ</h4>
          <p>অর্ডার প্রসেস করার জন্য আমরা শুধুমাত্র আপনার নাম, ফোন নম্বর এবং ডেলিভারি অ্যাড্রেস সংগ্রহ করি।</p>
          <h4 className="font-black text-black uppercase text-xs">২. তথ্যের ব্যবহার</h4>
          <p>আপনার তথ্য শুধুমাত্র পণ্য ডেলিভারি এবং কাস্টমার সাপোর্টের জন্য ব্যবহার করা হয়। আমরা আপনার তথ্য কারো কাছে বিক্রি বা শেয়ার করি না।</p>
          <h4 className="font-black text-black uppercase text-xs">৩. সিকিউরিটি</h4>
          <p>আমরা আপনার তথ্যের গোপনীয়তা রক্ষায় সর্বোচ্চ চেষ্টা করি এবং সুরক্ষিত সার্ভার ব্যবহার করি।</p>
          <p className="pt-4 text-[10px] italic">সর্বশেষ আপডেট: মে ২০২৪</p>
        </div>
      )
    }
  };

  return (
    <footer className="relative bg-black/95 backdrop-blur-3xl border-t border-white/5 pt-12 pb-10 px-6 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Main Trust & Brand Centerpiece */}
        <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center gap-8 mb-12 w-full max-w-4xl group hover:border-orange-500/30 transition-all duration-500">
           <div className="flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
              <div className="flex items-center gap-3 mb-4 group-hover:scale-105 transition-transform">
                <img 
                  src="https://res.cloudinary.com/dwfnjvw6v/image/upload/v1778484022/m6gqpwltctdfks5mrdit.png" 
                  alt="FrenZway Logo" 
                  className="h-10 w-auto object-contain"
                />
                <span className="text-2xl font-black italic tracking-tighter text-white">FrenZ<span className="text-orange-500">way</span></span>
              </div>
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white/90">100% Genuine Authority</h3>
           </div>
           
           <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-3">Professional Sourcing</p>
              <p className="text-sm font-medium text-white/50 italic leading-tight">Certified Integrity In Every Electronic Gadget. We provide the best gadgets in BD.</p>
           </div>

           <div className="flex gap-3">
              <a href="https://www.facebook.com/profile.php?id=61589507970060" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 hover:bg-orange-500 hover:text-white transition-all shadow-lg border border-white/10">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/30 hover:bg-orange-500 hover:text-white transition-all shadow-lg border border-white/10">
                <Instagram className="w-6 h-6" />
              </a>
           </div>
        </div>

        {/* Streamlined Multi-link Row */}
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4 mb-10 w-full border-b border-white/5 pb-10">
          {footerLinks.map(link => (
            <button 
              key={link.label}
              onClick={() => setActiveModal(link.type)}
              className="text-[11px] font-black uppercase tracking-[0.25em] text-white/40 hover:text-orange-500 transition-all active:scale-95"
            >
              {link.label}
            </button>
          ))}
          <a 
            href="/track" 
            className="text-[11px] font-black uppercase tracking-[0.25em] text-orange-500 hover:text-white transition-all active:scale-95 px-4 py-2 bg-orange-500/5 rounded-full border border-orange-500/20"
          >
            Track Logistics
          </a>
        </div>

        {/* Small Legal Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic text-center md:text-left">
            © 2026 FrenZway Global Command. Engineering Excellence across Bangladesh.
          </p>
          <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 transition-all">
             <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] border border-white/20 px-3 py-1 rounded-sm">Powered by FrenZway</span>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {activeModal && (
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
                    {modalContent[activeModal].title}
                  </h2>
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="p-3 bg-black text-white rounded-full hover:bg-orange-500 transition-all active:scale-90 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {modalContent[activeModal].content}
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-[0.03]">
                 <Shield className="w-48 h-48 rotate-12" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
}
