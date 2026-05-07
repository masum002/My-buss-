import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Phone, MapPin, Shield, HelpCircle, Info, Facebook, Instagram, Twitter } from 'lucide-react';

type ModalType = 'contact' | 'about' | 'help' | 'privacy' | null;

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
          <p className="text-black/60">আমাদের সাথে যোগাযোগ করার জন্য নিচের তথ্যগুলো ব্যবহার করুন। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-black/5">
              <Phone className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-black/30">Hotline</p>
                <p className="font-black">+880 1700-000000</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-black/5">
              <Mail className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-black/30">Email Support</p>
                <p className="font-black">support@frenzway.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[#F8F9FA] rounded-2xl border border-black/5">
              <MapPin className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] font-black uppercase text-black/30">Registered Office</p>
                <p className="font-black">Dhanmondi, Dhaka, Bangladesh</p>
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
            <details className="group bg-[#F8F9FA] rounded-2xl border border-black/5 p-4 cursor-pointer">
              <summary className="font-black text-sm list-none flex justify-between items-center">
                কিভাবে অর্ডার করব?
                <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-xs text-black/60 mt-3">সহজেই শপ সেকশন থেকে আপনার পছন্দের পণ্যটি কার্টে যোগ করুন এবং চেকআউট পেজে গিয়ে আপনার নাম, ফোন নম্বর এবং ঠিকানা দিয়ে কনফার্ম করুন। কোনো অ্যাকাউন্ট খোলার প্রয়োজন নেই।</p>
            </details>
            <details className="group bg-[#F8F9FA] rounded-2xl border border-black/5 p-4 cursor-pointer">
              <summary className="font-black text-sm list-none flex justify-between items-center">
                ডেলিভারি চার্জ কত?
                <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-xs text-black/60 mt-3">ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। অর্ডার করার ২-৫ দিনের মধ্যে ডেলিভারি সম্পন্ন করা হয়।</p>
            </details>
            <details className="group bg-[#F8F9FA] rounded-2xl border border-black/5 p-4 cursor-pointer">
              <summary className="font-black text-sm list-none flex justify-between items-center">
                পেমেন্ট কিভাবে করব?
                <span className="text-orange-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-xs text-black/60 mt-3">আমরা ক্যাশ অন ডেলিভারি (COD) এবং বিকাশ/নগদ পেমেন্ট গ্রহণ করি।</p>
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
    <footer className="relative bg-white border-t border-black/5 pt-12 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand Info */}
          <div className="lg:col-span-1">
            <h3 className="text-3xl font-black italic tracking-tighter mb-6">
              FrenZ<span className="text-orange-500 text-stroke-black">way</span>
            </h3>
            <p className="text-black/40 text-sm font-medium leading-relaxed mb-8">বাংলাদেশের সেরা গেজেট ও লাইফস্টাইল শপ। আমরা আপনার জীবনকে সহজ ও টেক-স্মার্ট করতে কাজ করি।</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center text-black/30 hover:bg-black hover:text-white transition-all shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center text-black/30 hover:bg-black hover:text-white transition-all shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#F8F9FA] rounded-xl flex items-center justify-center text-black/30 hover:bg-black hover:text-white transition-all shadow-sm">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-black/20 tracking-[0.3em]">Quick Navigation</p>
              <ul className="space-y-3">
                {footerLinks.map(link => (
                  <li key={link.label}>
                    <button 
                      onClick={() => setActiveModal(link.type)}
                      className="text-sm font-bold text-black/40 hover:text-black transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-black/5 rounded-full group-hover:bg-orange-500 transition-colors" />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase text-black/20 tracking-[0.3em]">Shop Segments</p>
              <ul className="space-y-3">
                {['Audio Gear', 'Timepieces', 'Mechanical Keys', 'Ecosystem'].map(item => (
                  <li key={item} className="text-sm font-bold text-black/40 hover:text-black transition-colors flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-black/5 rounded-full" />
                     {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="lg:col-span-1 bg-[#F8F9FA] p-8 rounded-[2.5rem] border border-black/5 shadow-inner flex flex-col justify-center items-center text-center">
             <Shield className="w-10 h-10 text-orange-500 mb-4 opacity-20" />
             <p className="text-[10px] font-black uppercase text-black/20 tracking-widest mb-1">Authentic Seal</p>
             <p className="text-lg font-black italic uppercase tracking-tighter">100% Genuine</p>
             <p className="text-[10px] text-black/40 mt-2">Certified Product Sourcing</p>
          </div>
        </div>

        <div className="pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-black/20 uppercase tracking-widest italic">
            © 2024 FrenZway Global. Crafting experiences in BD.
          </p>
          <div className="flex gap-8">
            <span className="text-[9px] font-black text-black/10 uppercase tracking-[0.4em]">Designed for Excellence</span>
            <span className="text-[9px] font-black text-black/10 uppercase tracking-[0.4em]">Powered by Integrity</span>
          </div>
        </div>
      </div>

      {/* Info Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/60 backdrop-blur-xl">
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
