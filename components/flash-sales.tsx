
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { FlashSale } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const FlashSales: React.FC = () => {
  const { flashSales = [], language } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newFlashSale, setNewFlashSale] = useState<Partial<FlashSale>>({
    title: '',
    discountPercentage: 0,
    startTime: '',
    endTime: '',
    isActive: true,
    productIds: []
  });

  const handleAdd = async () => {
    if (!newFlashSale.title || !newFlashSale.discountPercentage) return;
    try {
      await addDoc(collection(db, 'flashSales'), {
        ...newFlashSale,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewFlashSale({ title: '', discountPercentage: 0, startTime: '', endTime: '', isActive: true, productIds: [] });
    } catch (error) {
      console.error("Error adding flash sale:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'flashSales', id));
    } catch (error) {
      console.error("Error deleting flash sale:", error);
    }
  };

  const toggleStatus = async (fs: FlashSale) => {
    try {
      await updateDoc(doc(db, 'flashSales', fs.id), {
        isActive: !fs.isActive
      });
    } catch (error) {
      console.error("Error updating flash sale:", error);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{language === 'bn' ? 'ফ্ল্যাশ সেল ম্যানেজমেন্ট' : 'Flash Sale Management'}</h2>
          <p className="text-slate-500 font-medium">{language === 'bn' ? 'আপনার শপের ফ্ল্যাশ সেল অফারগুলো এখান থেকে ম্যানেজ করুন।' : 'Manage your shop flash sale offers from here.'}</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus size={18} /> {language === 'bn' ? 'নতুন ফ্ল্যাশ সেল' : 'Add Flash Sale'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Flash Sale Title</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newFlashSale.title}
                onChange={e => setNewFlashSale({...newFlashSale, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount Percentage (%)</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newFlashSale.discountPercentage}
                onChange={e => setNewFlashSale({...newFlashSale, discountPercentage: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Time</label>
              <input 
                type="datetime-local" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newFlashSale.startTime}
                onChange={e => setNewFlashSale({...newFlashSale, startTime: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Time</label>
              <input 
                type="datetime-local" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newFlashSale.endTime}
                onChange={e => setNewFlashSale({...newFlashSale, endTime: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={() => setIsAdding(false)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={handleAdd} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Save Flash Sale</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {flashSales.map(fs => (
          <div key={fs.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 space-y-6 group hover:shadow-2xl transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Zap size={24} fill="currentColor" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleStatus(fs)}
                  className={`p-2 rounded-xl border ${fs.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                >
                  {fs.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                </button>
                <button 
                  onClick={() => handleDelete(fs.id)}
                  className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-2xl font-black tracking-tight">{fs.title}</h3>
              <div className="flex items-center gap-2 text-rose-500 font-black text-sm">
                <Zap size={16} fill="currentColor" /> {fs.discountPercentage}% OFF
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 relative z-10">
              <div className="flex items-center gap-3 text-slate-400">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Starts: {new Date(fs.startTime).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Clock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Ends: {new Date(fs.endTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashSales;
