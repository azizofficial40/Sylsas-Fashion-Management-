
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Product, Size, StockVariant } from '../types';
import { Plus, Search, AlertCircle, Edit3, Trash2, X, Boxes, Tag, LayoutGrid, List, ChevronDown, Camera, Image as ImageIcon, Upload } from 'lucide-react';

const STOCK_T = {
  en: {
    title: 'Inventory',
    sub: 'Total Lines',
    new: 'Add Product',
    edit: 'Refine Item',
    save: 'Confirm Stock',
    update: 'Update Registry',
    search: 'Lookup product...',
    low: 'Critically Low',
    cost: 'Cost Price',
    imgLabel: 'Product Visual'
  },
  bn: {
    title: 'স্টক তালিকা',
    sub: 'মোট আইটেম',
    new: 'পণ্য যোগ করুন',
    edit: 'এডিট করুন',
    save: 'স্টকে জমা দিন',
    update: 'আপডেট করুন',
    search: 'পণ্য খুঁজুন...',
    low: 'স্টক কম আছে',
    cost: 'ক্রয় মূল্য',
    imgLabel: 'পণ্যের ছবি'
  }
};

const AVAILABLE_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COMMON_COLORS = ['Black', 'White', 'Navy', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Maroon'];

const Stock: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, language } = useStore();
  const t = STOCK_T[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const initialProductState: Partial<Product> = {
    name: '', category: 'Premium', purchasePrice: 0, salePrice: 0,
    image: '',
    variants: [{ size: 'M', color: 'Black', quantity: 0 }]
  };

  const [newProduct, setNewProduct] = useState<Partial<Product>>(initialProductState);

  const resetForm = () => {
    setNewProduct(initialProductState);
    setEditingId(null);
  };

  const handleSave = () => {
    if (newProduct.name) {
      if (editingId) {
        updateProduct({ id: editingId, ...newProduct } as Product);
      } else {
        addProduct({ id: Date.now().toString(), ...newProduct } as Product);
      }
      setIsAdding(false);
      resetForm();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (p: Product) => {
    setNewProduct(p);
    setEditingId(p.id);
    setIsAdding(true);
  };

  const addVariantField = () => setNewProduct({ ...newProduct, variants: [...(newProduct.variants || []), { size: 'M', color: 'Black', quantity: 0 }] });

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t.title}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{products.length} {t.sub}</p>
        </div>
        <button onClick={() => { resetForm(); setIsAdding(true); }} className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 dark:shadow-indigo-950/30 active:scale-90 transition-all">
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      <div className="relative group mx-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={t.search} 
          className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-900 border border-white dark:border-slate-800 rounded-[2rem] outline-none shadow-[0_10px_30px_rgba(0,0,0,0.02)] focus:shadow-md transition-all text-sm font-bold placeholder:text-slate-200 dark:placeholder:text-slate-800 dark:text-white" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filtered.map(product => {
          const totalQty = product.variants.reduce((acc, v) => acc + v.quantity, 0);
          const isLowStock = product.variants.some(v => v.quantity < 5);
          return (
            <div key={product.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-slate-100 dark:border-slate-700">
                    {product.image ? (
                        <img src={product.image} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700">
                            <ImageIcon size={32} />
                        </div>
                    )}
                </div>
                {isLowStock && (
                  <div className="absolute -top-2 -right-2 bg-rose-500 text-white px-2 py-1 rounded-xl shadow-lg flex items-center gap-1">
                    <AlertCircle size={10} strokeWidth={3} />
                    <span className="text-[7px] font-black uppercase">{t.low}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white truncate tracking-tight">{product.name}</h4>
                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1 inline-block">{product.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Boxes size={12} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">Stock: {totalQty}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Tag size={12} className="text-slate-400 dark:text-slate-500" />
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">CP: ৳{product.purchasePrice}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(product)} className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"><Edit3 size={18}/></button>
                <button onClick={() => { if(confirm('Permanently remove this item?')) deleteProduct(product.id); }} className="w-10 h-10 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-[3rem] sm:rounded-[3rem] p-10 max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl animate-in slide-in-from-bottom-20">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{editingId ? t.edit : t.new}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Management</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center active:scale-90 transition-all"><X size={24} className="text-slate-400 dark:text-slate-500" /></button>
            </div>
            
            <div className="space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.imgLabel}</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full aspect-[16/10] bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-200 transition-colors overflow-hidden group"
                >
                  {newProduct.image ? (
                    <>
                        <img src={newProduct.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white shadow-xl">
                                <Camera size={24} />
                            </div>
                        </div>
                    </>
                  ) : (
                    <>
                        <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <Camera size={32} />
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-black text-slate-900 dark:text-white">Take Photo or Upload</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tap to open camera</p>
                        </div>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Product Name</label>
                <input type="text" placeholder="e.g. Premium Silk Polo" className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-bold text-lg focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 dark:text-white" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.cost}</label>
                <input type="number" placeholder="0.00" className="w-full p-6 bg-slate-50 dark:bg-slate-800 border-0 rounded-[2rem] outline-none font-black text-xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 dark:text-white" value={newProduct.purchasePrice || ''} onChange={e => setNewProduct({...newProduct, purchasePrice: Number(e.target.value)})} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Variants</label>
                  <button onClick={addVariantField} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100 dark:shadow-indigo-950/30">+ ADD SIZE/COLOR</button>
                </div>
                <div className="space-y-3">
                  {newProduct.variants?.map((v, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl space-y-3 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-left-4" style={{animationDelay: `${idx * 50}ms`}}>
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Size</span>
                           <div className="relative">
                            <select className="w-full p-3 bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase outline-none appearance-none dark:text-white" value={v.size} onChange={e => { const u = [...(newProduct.variants || [])]; u[idx].size = e.target.value as Size; setNewProduct({...newProduct, variants: u}); }}>
                              {AVAILABLE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={12} />
                           </div>
                        </div>
                        <div className="flex-1 space-y-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Color</span>
                           <div className="relative">
                            <select className="w-full p-3 bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black uppercase outline-none appearance-none dark:text-white" value={v.color} onChange={e => { const u = [...(newProduct.variants || [])]; u[idx].color = e.target.value; setNewProduct({...newProduct, variants: u}); }}>
                              {COMMON_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                              {!COMMON_COLORS.includes(v.color) && <option value={v.color}>{v.color}</option>}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700" size={12} />
                           </div>
                        </div>
                        <div className="w-24 space-y-1">
                           <span className="text-[8px] font-black text-slate-400 uppercase ml-2">Qty</span>
                           <input type="number" placeholder="Qty" className="w-full p-3 bg-white dark:bg-slate-900 rounded-2xl text-[10px] font-black text-center outline-none dark:text-white" value={v.quantity} onChange={e => { const u = [...(newProduct.variants || [])]; u[idx].quantity = Number(e.target.value); setNewProduct({...newProduct, variants: u}); }} />
                        </div>
                        <button onClick={() => { const u = [...(newProduct.variants || [])]; u.splice(idx, 1); setNewProduct({...newProduct, variants: u}); }} className="mt-5 p-3 text-rose-400 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button onClick={handleSave} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 dark:shadow-indigo-950/30 mt-12 active:scale-95 transition-all">
              {editingId ? t.update : t.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stock;
