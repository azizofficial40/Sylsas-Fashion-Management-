
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ShoppingCart, Plus, Minus, X, ArrowRight, ArrowLeft, CheckCircle2, Search, Filter, ShoppingBag, CreditCard, Banknote, Copy, MessageCircle, Tag, MapPin, User, Star, Image as ImageIcon, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Product, StockVariant, Order } from '../types';

import Toast from './Toast.tsx';
import Footer from './Footer.tsx';
import Navbar from './Navbar.tsx';

const Shop: React.FC = () => {
  const { products = [], cart = [], addToCart, removeFromCart, placeOrder, admin, applyCoupon, user, addReview, notification, setNotification } = useStore();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', address: '' });
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('COD');
  const [transactionId, setTransactionId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [deliveryLocation, setDeliveryLocation] = useState<'Sylhet' | 'Outside'>('Sylhet');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (user) {
      setCustomerDetails({
        name: user.name,
        phone: user.phone,
        address: '' // User address might need to be added to UserProfile type if we want to save it
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImage(selectedProduct.image);
    }
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (selectedProduct) {
      const updated = products.find(p => p.id === selectedProduct.id);
      if (updated) setSelectedProduct(updated);
    }
  }, [products]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.salePrice * item.quantity), 0);
  const deliveryCharge = deliveryLocation === 'Sylhet' ? 60 : 120;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = cartTotal + deliveryCharge - discountAmount;
  
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => 
    p.isVisible !== false &&
    p.status !== 'Draft' &&
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    ((p.title || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApplyCoupon = () => {
    const coupon = applyCoupon(couponCode, cartTotal);
    if (coupon) {
      const discount = coupon.type === 'percentage' 
        ? (cartTotal * coupon.value) / 100 
        : coupon.value;
      setAppliedCoupon({ code: coupon.code, discount });
      setNotification({ message: `Coupon "${coupon.code}" applied successfully!`, type: 'success' });
    } else {
      setNotification({ message: 'Invalid Coupon or Minimum Order not met', type: 'error' });
      setAppliedCoupon(null);
    }
  };

  const handleAddReview = async () => {
    if (!user || !selectedProduct) return;
    await addReview(selectedProduct.id, {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString()
    });
    setNewReview({ rating: 5, comment: '' });
  };

  const handlePlaceOrder = async () => {
    if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) return;
    if (paymentMethod !== 'COD' && !transactionId) return;
    
    await placeOrder({
      id: Date.now().toString(),
      userId: user?.id || null,
      customerName: customerDetails.name,
      phone: customerDetails.phone,
      address: customerDetails.address,
      deliveryLocation,
      items: cart,
      totalAmount: finalTotal,
      deliveryCharge,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      status: 'Pending',
      date: new Date().toISOString(),
      paymentMethod,
      transactionId: paymentMethod !== 'COD' ? transactionId : null,
      timeline: [{ status: 'Pending', date: new Date().toISOString(), note: 'Order placed successfully' }]
    });
    setCheckoutStep('success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-white pb-20 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      {/* Navbar */}
      <Navbar 
        onCartClick={() => setIsCartOpen(true)}
        showSearch={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero */}
      <div className="relative bg-slate-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/80 to-slate-900"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-4 py-1.5 bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md rounded-full text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            New Collection 2026
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
            Redefine Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-gradient-x">Style Statement</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
            Discover premium fashion that speaks your language. Sustainable materials, modern cuts, and timeless designs curated just for you.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-slate-900 rounded-full font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
              Shop Now
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="sticky top-20 z-30 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 py-4 mb-10 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div id="products" className="max-w-7xl mx-auto px-4 pb-20">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-[3/4] overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  {product.image ? (
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <ShoppingBag size={32} className="text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">
                      {product.category}
                    </div>
                    {product.isNewArrival && (
                      <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                        New Arrival
                      </div>
                    )}
                    {product.isTrending && (
                      <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        Trending
                      </div>
                    )}
                    {product.isBestSeller && (
                      <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                        Best Seller
                      </div>
                    )}
                  </div>
                  {product.variants.reduce((a,b) => a+b.quantity, 0) === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-black uppercase tracking-widest border-2 border-white px-4 py-2">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-lg leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{product.title || product.name}</h3>
                    <span className="text-xl font-black text-slate-900 dark:text-white">৳{product.salePrice}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>{product.variants.length} Variants</span>
                    <span>•</span>
                    <span>{product.variants.reduce((a,b) => a+b.quantity, 0)} In Stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 space-y-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <ShoppingBag size={48} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No Products Found</h3>
              <p className="text-slate-500 font-medium mt-2">We couldn't find any products matching your selection.</p>
            </div>
            <button 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 z-10 p-2 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full hover:bg-white dark:hover:bg-black transition-colors">
              <X size={24} />
            </button>
            
            <div className="w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 h-96 md:h-auto flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                {activeImage ? (
                  <img src={activeImage} className="w-full h-full object-cover" alt={selectedProduct.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                    <ShoppingBag size={48} className="text-slate-300" />
                  </div>
                )}
              </div>
              {selectedProduct.gallery && selectedProduct.gallery.length > 0 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  <button 
                    onClick={() => setActiveImage(selectedProduct.image)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === selectedProduct.image ? 'border-indigo-600' : 'border-transparent'}`}
                  >
                    {selectedProduct.image ? <img src={selectedProduct.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                  </button>
                  {selectedProduct.gallery.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-indigo-600' : 'border-transparent'}`}
                    >
                      {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-black uppercase tracking-widest text-indigo-600">{selectedProduct.category}</div>
                      {selectedProduct.brandName && <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand: {selectedProduct.brandName}</div>}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {selectedProduct.rating && (
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg text-amber-500 font-black text-xs">
                          <Star size={12} fill="currentColor" />
                          {selectedProduct.rating}
                        </div>
                      )}
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">SKU: {selectedProduct.sku}</div>
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-none mb-4 mt-2">{selectedProduct.title || selectedProduct.name}</h2>
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-black text-slate-900 dark:text-white">৳{selectedProduct.salePrice}</p>
                    {selectedProduct.regularPrice > selectedProduct.salePrice && (
                      <>
                        <p className="text-lg text-slate-300 line-through font-bold">৳{selectedProduct.regularPrice}</p>
                        <p className="text-sm text-rose-500 font-black">-{selectedProduct.discountPercentage}% OFF</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Select Variant</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.variants.map((v, idx) => (
                      <button 
                        key={idx}
                        disabled={v.quantity === 0}
                        onClick={() => {
                          addToCart({ product: selectedProduct, variant: v, quantity: 1 });
                          setSelectedProduct(null);
                          setIsCartOpen(true);
                        }}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-start gap-1 ${
                          v.quantity === 0 
                            ? 'border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-600 hover:text-indigo-600 active:scale-95'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{v.size}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>{v.color}</span>
                        </div>
                        {v.material && <span className="text-[10px] opacity-60 font-medium">{v.material}</span>}
                        {v.quantity === 1 && <span className="text-[10px] text-rose-500 font-black">Low Stock</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Product Description</h3>
                  <p className="text-slate-500 leading-relaxed text-sm whitespace-pre-wrap">
                    {selectedProduct.description || selectedProduct.shortDescription || `Premium quality ${selectedProduct.category.toLowerCase()} designed for comfort and style.`}
                  </p>
                  
                  {(selectedProduct.weight || selectedProduct.brandName) && (
                    <div className="mt-6 grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                      {selectedProduct.brandName && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</p>
                          <p className="text-xs font-bold">{selectedProduct.brandName}</p>
                        </div>
                      )}
                      {selectedProduct.weight && (
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</p>
                          <p className="text-xs font-bold">{selectedProduct.weight} kg</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedProduct.videoUrl && (
                    <div className="mt-4">
                      <a 
                        href={selectedProduct.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                      >
                        <CreditCard size={14} />
                        Watch Product Video
                      </a>
                    </div>
                  )}
                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {selectedProduct.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Delivery Charge</h4>
                    <p className="text-xs font-bold">৳{selectedProduct.deliveryCharge}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Delivery</h4>
                    <p className="text-xs font-bold">{selectedProduct.estimatedDelivery}</p>
                  </div>
                </div>

                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Section */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Reviews ({selectedProduct.reviews?.length || 0})</h3>
                  
                  <div className="space-y-4 mb-6 max-h-40 overflow-y-auto">
                    {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                      selectedProduct.reviews.map(review => (
                        <div key={review.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{review.userName}</span>
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star size={12} fill="currentColor" />
                              <span className="text-xs font-black">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">No reviews yet. Be the first to review!</p>
                    )}
                  </div>

                  {user ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={`transition-colors ${star <= newReview.rating ? 'text-amber-500' : 'text-slate-300'}`}
                          >
                            <Star size={20} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Write a review..." 
                          className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={newReview.comment}
                          onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                        />
                        <button 
                          onClick={handleAddReview}
                          disabled={!newReview.comment}
                          className="px-4 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Login to Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag size={20} />
                Your Cart ({cart.length})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutStep === 'success' ? (
                <div className="text-center py-20 animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-100 dark:shadow-emerald-900/20">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Order Placed!</h3>
                  <p className="text-slate-500 mb-8 max-w-xs mx-auto">We have received your order. You will receive a confirmation call shortly.</p>
                  <button onClick={() => { setCheckoutStep('cart'); setIsCartOpen(false); }} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                    Continue Shopping
                  </button>
                </div>
              ) : checkoutStep === 'details' ? (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-lg flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
                        Delivery Details
                      </h3>
                      <button onClick={() => setCheckoutStep('cart')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                        <ArrowLeft size={12} /> Back to Cart
                      </button>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={customerDetails.name}
                      onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={customerDetails.phone}
                      onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    />
                    <textarea 
                      placeholder="Full Address" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold h-32 resize-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      value={customerDetails.address}
                      onChange={e => setCustomerDetails({...customerDetails, address: e.target.value})}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest ml-4 text-slate-400">Delivery Location</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => setDeliveryLocation('Sylhet')}
                          className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${deliveryLocation === 'Sylhet' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                        >
                          <MapPin size={20} />
                          Sylhet City (৳60)
                        </button>
                        <button 
                          onClick={() => setDeliveryLocation('Outside')}
                          className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${deliveryLocation === 'Outside' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                        >
                          <MapPin size={20} />
                          Outside Sylhet (৳120)
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setCheckoutStep('payment')} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 transition-colors">
                    Next: Payment
                  </button>
                  <button onClick={() => setCheckoutStep('cart')} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    Back to Cart
                  </button>
                </div>
              ) : checkoutStep === 'payment' ? (
                <div className="space-y-6 animate-in slide-in-from-right">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-lg flex items-center gap-2">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
                        Payment Method
                      </h3>
                      <button onClick={() => setCheckoutStep('details')} className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                        <ArrowLeft size={12} /> Back to Details
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <Banknote size={24} />
                        Cash on Delivery
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Bkash')}
                        className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${paymentMethod === 'Bkash' ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-600' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <div className="w-6 h-6 bg-pink-500 rounded text-white flex items-center justify-center text-[10px]">Bk</div>
                        Bkash
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Nagad')}
                        className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${paymentMethod === 'Nagad' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <div className="w-6 h-6 bg-orange-500 rounded text-white flex items-center justify-center text-[10px]">Ng</div>
                        Nagad
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('Rocket')}
                        className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center gap-2 transition-all ${paymentMethod === 'Rocket' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <div className="w-6 h-6 bg-purple-500 rounded text-white flex items-center justify-center text-[10px]">Rk</div>
                        Rocket
                      </button>
                    </div>

                    {paymentMethod !== 'COD' && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="text-center space-y-2">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Send Money to this Number</p>
                          <div className="flex items-center justify-center gap-3">
                            <span className="text-2xl font-black tracking-widest">
                              {paymentMethod === 'Bkash' ? admin.bkash || 'N/A' : 
                               paymentMethod === 'Nagad' ? admin.nagad || 'N/A' : 
                               admin.rocket || 'N/A'}
                            </span>
                            <button onClick={() => copyToClipboard(
                              paymentMethod === 'Bkash' ? admin.bkash || '' : 
                              paymentMethod === 'Nagad' ? admin.nagad || '' : 
                              admin.rocket || ''
                            )} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                              <Copy size={16} />
                            </button>
                          </div>
                          <p className="text-xs font-bold text-slate-500">Personal Number • Send Money</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest ml-4 text-slate-400">Transaction ID</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 8JHS72..." 
                            className="w-full p-4 bg-white dark:bg-slate-900 rounded-2xl outline-none font-bold border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                            value={transactionId}
                            onChange={e => setTransactionId(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Coupon Section */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest ml-4 text-slate-400">Promo Code</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter Code" 
                          className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          disabled={!!appliedCoupon}
                        />
                        {appliedCoupon ? (
                          <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="px-6 bg-rose-100 text-rose-600 rounded-2xl font-black text-sm hover:bg-rose-200 transition-colors">
                            Remove
                          </button>
                        ) : (
                          <button onClick={handleApplyCoupon} className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
                            Apply
                          </button>
                        )}
                      </div>
                      {appliedCoupon && (
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                          <Tag size={14} />
                          Coupon Applied: {appliedCoupon.code} (-৳{appliedCoupon.discount})
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl space-y-3">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Subtotal</span>
                        <span>৳{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>Delivery ({deliveryLocation})</span>
                        <span>৳{deliveryCharge}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-sm font-bold text-emerald-500">
                          <span>Discount</span>
                          <span>-৳{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-black pt-4 border-t border-slate-200 dark:border-slate-700">
                        <span>Total</span>
                        <span>৳{finalTotal}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={paymentMethod !== 'COD' && !transactionId}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Confirm Order <CheckCircle2 size={20} />
                  </button>
                  <button onClick={() => setCheckoutStep('details')} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">
                    Back to Details
                  </button>
                </div>
              ) : (
                <>
                  {cart.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                          {item.product.image ? (
                            <img src={item.product.image} className="w-20 h-20 rounded-xl object-cover" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <ShoppingBag size={20} className="text-slate-300" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-sm line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-slate-500 font-bold mt-1">{item.variant.size} • {item.variant.color}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-black text-indigo-600">৳{item.product.salePrice * item.quantity}</span>
                              <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 shadow-sm">
                                <button onClick={() => removeFromCart(item.product.id, item.variant)} className="p-1 hover:text-rose-500"><Minus size={14} /></button>
                                <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart({...item, quantity: 1})} className="p-1 hover:text-emerald-500"><Plus size={14} /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {checkoutStep === 'cart' && cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-slate-500 font-bold">Total</span>
                  <span className="text-2xl font-black">৳{cartTotal}</span>
                </div>
                <button onClick={() => setCheckoutStep('details')} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
