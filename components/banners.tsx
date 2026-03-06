
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Image as ImageIcon, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Banner } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Banners: React.FC = () => {
  const { banners = [], language } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    image: '',
    link: '',
    isActive: true,
    type: 'hero'
  });

  const handleAdd = async () => {
    if (!newBanner.title || !newBanner.image) return;
    try {
      await addDoc(collection(db, 'banners'), {
        ...newBanner,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewBanner({ title: '', image: '', link: '', isActive: true, type: 'hero' });
    } catch (error) {
      console.error("Error adding banner:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  const toggleStatus = async (banner: Banner) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), {
        isActive: !banner.isActive
      });
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{language === 'bn' ? 'ব্যানার ম্যানেজমেন্ট' : 'Banner Management'}</h2>
          <p className="text-slate-500 font-medium">{language === 'bn' ? 'আপনার শপের প্রোমোশনাল ব্যানারগুলো এখান থেকে ম্যানেজ করুন।' : 'Manage your shop promotional banners from here.'}</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus size={18} /> {language === 'bn' ? 'নতুন ব্যানার' : 'Add Banner'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Banner Title</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newBanner.title}
                onChange={e => setNewBanner({...newBanner, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image URL</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newBanner.image}
                onChange={e => setNewBanner({...newBanner, image: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link URL (Optional)</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newBanner.link}
                onChange={e => setNewBanner({...newBanner, link: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
              <select 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newBanner.type}
                onChange={e => setNewBanner({...newBanner, type: e.target.value as any})}
              >
                <option value="hero">Hero Section</option>
                <option value="promo">Promotional</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={() => setIsAdding(false)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={handleAdd} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Save Banner</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-2xl transition-all">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img src={banner.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={banner.title} />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => toggleStatus(banner)}
                  className={`p-2 rounded-xl backdrop-blur-md border ${banner.isActive ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' : 'bg-rose-500/20 border-rose-500/30 text-rose-500'}`}
                >
                  {banner.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </button>
                <button 
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-xl backdrop-blur-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{banner.type}</p>
                  <h3 className="text-xl font-black tracking-tight">{banner.title}</h3>
                </div>
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600">
                    <ExternalLink size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Banners;
