
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Tag, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';
import { Collection } from '../types';
import { db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Collections: React.FC = () => {
  const { collections = [], products = [], language } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newCollection, setNewCollection] = useState<Partial<Collection>>({
    name: '',
    description: '',
    image: '',
    productIds: [],
    isActive: true
  });

  const handleAdd = async () => {
    if (!newCollection.name || !newCollection.image) return;
    try {
      await addDoc(collection(db, 'collections'), {
        ...newCollection,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewCollection({ name: '', description: '', image: '', productIds: [], isActive: true });
    } catch (error) {
      console.error("Error adding collection:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'collections', id));
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight">{language === 'bn' ? 'কালেকশন ম্যানেজমেন্ট' : 'Collection Management'}</h2>
          <p className="text-slate-500 font-medium">{language === 'bn' ? 'আপনার শপের প্রোডাক্ট কালেকশনগুলো এখান থেকে ম্যানেজ করুন।' : 'Manage your shop product collections from here.'}</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
        >
          <Plus size={18} /> {language === 'bn' ? 'নতুন কালেকশন' : 'Add Collection'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-indigo-100 dark:border-indigo-900/30 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collection Name</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newCollection.name}
                onChange={e => setNewCollection({...newCollection, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image URL</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newCollection.image}
                onChange={e => setNewCollection({...newCollection, image: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold"
                value={newCollection.description}
                onChange={e => setNewCollection({...newCollection, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button onClick={() => setIsAdding(false)} className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
            <button onClick={handleAdd} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100">Save Collection</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-2xl transition-all">
            <div className="aspect-video relative overflow-hidden bg-slate-100">
              <img src={collection.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={collection.name} />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleDelete(collection.id)}
                  className="p-2 bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-xl backdrop-blur-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <h3 className="text-xl font-black tracking-tight">{collection.name}</h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-2">{collection.description}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                <ShoppingBag size={14} /> {collection.productIds.length} Products
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collections;
