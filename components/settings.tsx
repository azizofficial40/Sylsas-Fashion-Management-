
import React, { useState } from 'react';
import { useStore } from '../store';
import { Save, User, Phone, Image as ImageIcon, Briefcase, CheckCircle, Lock } from 'lucide-react';

const SETTINGS_T = {
  en: {
    title: 'Shop Settings',
    sub: 'Manage your business identity',
    shopName: 'Shop Name',
    phone: 'Phone Number',
    role: 'Designation',
    logoUrl: 'Logo URL',
    pin: 'Login PIN (4 digits)',
    save: 'Save Settings',
    success: 'Settings updated successfully!'
  },
  bn: {
    title: 'শপ সেটিংস',
    sub: 'আপনার ব্যবসার তথ্য পরিবর্তন করুন',
    shopName: 'দোকানের নাম',
    phone: 'ফোন নম্বর',
    role: 'পদবী',
    logoUrl: 'লোগো লিঙ্ক',
    pin: 'লগইন পিন (৪ ডিজিট)',
    save: 'সেভ করুন',
    success: 'তথ্য সফলভাবে আপডেট হয়েছে!'
  }
};

const Settings: React.FC = () => {
  const { admin, updateAdmin, language } = useStore();
  const t = SETTINGS_T[language];
  const [formData, setFormData] = useState(admin);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAdmin(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t.title}</h2>
        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-50 dark:border-slate-800">
          <Briefcase size={24} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-white dark:border-slate-800 shadow-[0_20px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-950/30 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden mb-4 group relative"
            >
              <img src={formData.image} className="w-full h-full object-cover" alt="Shop Logo" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon size={24} className="text-white" />
              </div>
            </button>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {language === 'en' ? 'Click to upload from gallery' : 'গ্যালারি থেকে আপলোড করতে ক্লিক করুন'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">{t.shopName}</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">{t.phone}</label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">{t.role}</label>
              <div className="relative">
                <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">{t.logoUrl}</label>
              <div className="relative">
                <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                <input 
                  type="text" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">{t.pin}</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={18} />
                <input 
                  type="password" 
                  maxLength={4}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all tracking-[0.5em]"
                  value={formData.pin}
                  onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  required
                />
              </div>
            </div>
          </div>

          {showSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-center justify-center gap-2 animate-in zoom-in-95">
              <CheckCircle size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{t.success}</span>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 dark:shadow-indigo-950/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Save size={24} />
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
