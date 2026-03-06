
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShoppingBag, ArrowRight, Star, CheckCircle2, Mail, Zap, TrendingUp, Sparkles, ShoppingCart, Eye, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar.tsx';
import Footer from './Footer.tsx';
import { Product } from '../types';

const Home: React.FC = () => {
  const { products = [], banners = [], collections = [], flashSales = [], addToCart, handleWhatsAppOrder, language } = useStore();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const featuredProducts = products.filter(p => p.isFeatured && p.isVisible && p.status === 'Published').slice(0, 8);
  const newArrivals = products.filter(p => p.isNewArrival && p.isVisible && p.status === 'Published').slice(0, 8);
  const trendingProducts = products.filter(p => p.isTrending && p.isVisible && p.status === 'Published').slice(0, 8);
  
  const activeHeroBanners = banners.filter(b => b.isActive && b.type === 'hero');
  const activeFlashSale = flashSales.find(fs => fs.isActive);

  // Mock reviews if none exist
  const reviews = [
    { name: 'Ariful Islam', rating: 5, comment: 'Excellent quality and fast delivery. Highly recommended!', role: 'Verified Buyer' },
    { name: 'Sumaiya Akter', rating: 5, comment: 'The fabric is amazing. Fits perfectly. Will buy again.', role: 'Verified Buyer' },
    { name: 'Rahat Ahmed', rating: 4, comment: 'Good service. The color was slightly different but still looks great.', role: 'Verified Buyer' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      <Navbar onCartClick={() => navigate('/shop')} />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        {activeHeroBanners.length > 0 ? (
          <div className="absolute inset-0">
            <img src={activeHeroBanners[0].image} className="w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent"></div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-600/20 border border-indigo-600/30 backdrop-blur-md rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} /> New Season Arrival
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85]">
              Elevate Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Daily Style</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-lg">
              Experience the perfect blend of comfort and luxury. Our new collection is designed for those who don't compromise on style.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => navigate('/shop')} className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10">
                Explore Shop
              </button>
              <button onClick={() => navigate('/about')} className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      {activeFlashSale && (
        <div className="bg-rose-600 text-white py-4 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                <Zap size={20} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tighter text-lg">{activeFlashSale.title}</h4>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Ending Soon • Up to {activeFlashSale.discountPercentage}% OFF</p>
              </div>
            </div>
            <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-white text-rose-600 rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
              Grab Now
            </button>
          </div>
          <div className="absolute top-0 right-0 bottom-0 w-1/2 bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-1/2"></div>
        </div>
      )}

      {/* Category Showcase */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">Collections</p>
            <h2 className="text-4xl font-black tracking-tight">Shop by Category</h2>
          </div>
          <button onClick={() => navigate('/shop')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {collections.length > 0 ? collections.map((col) => (
            <div 
              key={col.id} 
              className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer"
              onClick={() => navigate(`/shop?collection=${col.id}`)}
            >
              <img src={col.image || `https://picsum.photos/seed/${col.name}/600/800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={col.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <div className="absolute bottom-8 left-8">
                <h3 className="text-2xl font-black text-white tracking-tight">{col.name}</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">{col.productIds.length} Products</p>
              </div>
            </div>
          )) : (
            ['Men', 'Women', 'Kids', 'Accessories'].map((cat, i) => (
              <div 
                key={cat} 
                className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer"
                onClick={() => navigate(`/shop?category=${cat}`)}
              >
                <img src={`https://picsum.photos/seed/${cat}/600/800`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={cat} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-2xl font-black text-white tracking-tight">{cat}</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Explore Collection</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Star size={12} fill="currentColor" /> Handpicked for you
            </div>
            <h2 className="text-5xl font-black tracking-tighter">Featured Products</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <p className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">Fresh Drops</p>
            <h2 className="text-4xl font-black tracking-tight">New Arrivals</h2>
          </div>
          <button onClick={() => navigate('/shop')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 group">
            See More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">Testimonials</p>
            <h2 className="text-5xl font-black tracking-tighter">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] space-y-6 hover:bg-white/10 transition-all group">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg font-medium leading-relaxed text-slate-300 italic">"{review.comment}"</p>
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black tracking-tight">{review.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 max-w-5xl mx-auto px-4">
        <div className="bg-indigo-600 rounded-[4rem] p-12 md:p-20 text-center text-white space-y-8 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
          <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail size={32} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Join the Sylsas Club</h2>
            <p className="text-indigo-100 text-lg font-medium max-w-xl mx-auto">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-6">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-8 py-5 bg-white/10 border border-white/20 rounded-2xl outline-none font-bold placeholder:text-white/50 focus:bg-white/20 transition-all"
              />
              <button className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform active:scale-95">
                Subscribe
              </button>
            </div>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest pt-4">No spam, only pure fashion. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const { handleWhatsAppOrder } = useStore();
  return (
    <div 
      className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer"
      onClick={() => navigate(`/shop?product=${product.id}`)}
    >
      <div className="aspect-[3/4] overflow-hidden relative bg-slate-100 dark:bg-slate-800">
        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {product.isNewArrival && (
            <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
              New
            </div>
          )}
          {product.isTrending && (
            <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
              Hot
            </div>
          )}
        </div>
        <div className="absolute inset-x-4 bottom-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/shop?product=${product.id}`);
            }}
            className="flex-1 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <Eye size={14} /> Quick View
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const firstVariant = product.variants.find(v => v.quantity > 0) || product.variants[0];
              handleWhatsAppOrder([{ product, variant: firstVariant, quantity: 1 }]);
            }}
            className="w-12 py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-xl flex items-center justify-center hover:bg-emerald-600 transition-colors"
            title="Order via WhatsApp"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
      <div className="p-8 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{product.category}</p>
          <h3 className="font-black text-xl leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors">{product.title || product.name}</h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">৳{product.salePrice}</span>
            {product.regularPrice > product.salePrice && (
              <span className="text-sm text-slate-300 line-through font-bold">৳{product.regularPrice}</span>
            )}
          </div>
          <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ShoppingCart size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
