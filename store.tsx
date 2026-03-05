
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Sale, Expense, BusinessState, Language, Theme, Order, CartItem, StockVariant, Coupon, UserProfile, Review } from './types';
import { db } from './services/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  query,
  orderBy,
  where,
  getDocs
} from 'firebase/firestore';

interface StoreContextType extends BusinessState {
  orders: Order[];
  cart: CartItem[];
  coupons: Coupon[];
  user: UserProfile | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variant: StockVariant) => void;
  clearCart: () => void;
  placeOrder: (order: Order) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addSale: (sale: Sale) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  receivePayment: (customerId: string, amount: number) => Promise<void>;
  updateAdmin: (adminData: BusinessState['admin']) => Promise<void>;
  setLanguage: (lang: Language) => void;
  setApiKey: (key: string) => void;
  toggleTheme: () => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  // User Account Methods
  loginUser: (email: string, phone: string) => Promise<void>;
  logoutUser: () => void;
  toggleWishlist: (productId: string) => Promise<void>;
  applyCoupon: (code: string, orderTotal: number) => Coupon | null;
  addReview: (productId: string, review: Review) => Promise<void>;
  error: { message: string; code?: string } | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const loadSettings = <T,>(key: string, defaultValue: T): T => {
  const saved = localStorage.getItem(`sylsas_settings_${key}`);
  return saved ? JSON.parse(saved) : defaultValue;
};

const saveSettings = <T,>(key: string, data: T) => {
  localStorage.setItem(`sylsas_settings_${key}`, JSON.stringify(data));
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [user, setUser] = useState<UserProfile | null>(() => loadSettings('user', null));
  
  // Fix: Renamed setter to setLanguageState to avoid name collision with the setLanguage function
  const [language, setLanguageState] = useState<Language>(() => loadSettings('language', 'en'));
  const [theme, setThemeState] = useState<Theme>(() => loadSettings('theme', 'light'));
  const [apiKey, setApiKey] = useState<string>(() => loadSettings('apiKey', process.env.API_KEY || ''));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => loadSettings('isLoggedIn', false));
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const [admin, setAdmin] = useState<BusinessState['admin']>({
    name: 'Sylsas Admin',
    phone: '01712345678',
    role: 'Owner',
    image: 'https://picsum.photos/seed/admin/100/100',
    email: 'sylsasfashion@gmail.com',
    password: 'sylsas#2025',
    whatsapp: '01618539338'
  });

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const previousOrdersRef = React.useRef<Map<string, string>>(new Map());
    const isFirstLoadRef = React.useRef(true);

    const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setNotification({ message, type });
      // Auto hide is handled by Toast component, but we can also clear it here if needed
    };

    const handleFirebaseError = (err: any) => {
      console.error("Firebase Error:", err);
      if (err.code === 'permission-denied') {
        setError({ 
          message: language === 'bn' 
            ? "ফায়ারবেস পারমিশন এরর! দয়া করে ফায়ারবেস কনসোলে গিয়ে Rules আপডেট করুন।" 
            : "Firestore Permission Denied! Please update Security Rules in Firebase Console.",
          code: err.code 
        });
      } else {
        setError({ message: err.message || "Unknown error occurred", code: err.code });
      }
      showNotification(err.message || "An error occurred", 'error');
    };

    // Real-time Firebase listeners
    useEffect(() => {
      if (!db) return;
  
      const unsubProducts = onSnapshot(collection(db, 'products'), 
        (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
          setError(prev => prev?.code === 'permission-denied' ? null : prev);
        }, 
        handleFirebaseError
      );
  
      const unsubCustomers = onSnapshot(collection(db, 'customers'), 
        (snapshot) => {
          setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
          setError(prev => prev?.code === 'permission-denied' ? null : prev);
        },
        handleFirebaseError
      );
  
      const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('date', 'desc')), 
        (snapshot) => {
          setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
          setError(prev => prev?.code === 'permission-denied' ? null : prev);
        },
        handleFirebaseError
      );
  
      const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('date', 'desc')), 
        (snapshot) => {
          const newOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
          setOrders(newOrders);
          
          if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
            const newMap = new Map();
            newOrders.forEach(o => newMap.set(o.id, o.status));
            previousOrdersRef.current = newMap;
            return;
          }

          // Check for new orders
          if (newOrders.length > previousOrdersRef.current.size) {
            const newOrder = newOrders.find(o => !previousOrdersRef.current.has(o.id));
            if (newOrder && newOrder.status === 'Pending') {
               // Play sound for Admin
               if (isLoggedIn) {
                 try {
                   const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                   audio.play().catch(e => console.log('Audio play failed', e));
                 } catch (e) {}
                 
                 showNotification(
                   language === 'bn' 
                     ? `নতুন অর্ডার এসেছে! #${newOrder.id.slice(-6)}` 
                     : `New Order Received! #${newOrder.id.slice(-6)}`, 
                   'success'
                 );
               }
            }
          }

          // Check for status changes
          newOrders.forEach(order => {
            const prevStatus = previousOrdersRef.current.get(order.id);
            if (prevStatus && prevStatus !== order.status) {
              // Notify Customer if it's their order
              if (user && user.id === order.userId) {
                 showNotification(
                   language === 'bn' 
                     ? `আপনার অর্ডার #${order.id.slice(-6)} এখন ${order.status}` 
                     : `Your Order #${order.id.slice(-6)} is now ${order.status}`,
                   'info'
                 );
              }
              
              // Notify Admin of cancellations
              if (isLoggedIn && order.status === 'Cancelled' && prevStatus !== 'Cancelled') {
                 showNotification(`Order #${order.id.slice(-6)} Cancelled`, 'error');
              }
            }
          });

          // Update ref
          const newMap = new Map();
          newOrders.forEach(o => newMap.set(o.id, o.status));
          previousOrdersRef.current = newMap;
        },
        handleFirebaseError
      );

    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), 
      (snapshot) => {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
        setError(prev => prev?.code === 'permission-denied' ? null : prev);
      },
      handleFirebaseError
    );

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), 
      (snapshot) => {
        setCoupons(snapshot.docs.map(doc => ({ ...doc.data() } as Coupon)));
      },
      handleFirebaseError
    );

    const unsubAdmin = onSnapshot(doc(db, 'settings', 'shop'), 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as BusinessState['admin'];
          setAdmin(prev => ({
            ...prev,
            ...data,
            // Ensure email and password always have a fallback if missing in DB
            email: data.email || 'sylsasfashion@gmail.com',
            password: data.password || 'sylsas#2025'
          }));
        }
      },
      handleFirebaseError
    );

    // User Profile Listener (if logged in)
    let unsubUser = () => {};
    if (user?.id) {
      unsubUser = onSnapshot(doc(db, 'users', user.id), 
        (snapshot) => {
          if (snapshot.exists()) {
            setUser({ id: snapshot.id, ...snapshot.data() } as UserProfile);
          }
        }
      );
    }

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSales();
      unsubOrders();
      unsubExpenses();
      unsubCoupons();
      unsubAdmin();
      unsubUser();
    };
  }, [language, user?.id]);

  useEffect(() => { saveSettings('language', language); }, [language]);
  useEffect(() => { saveSettings('theme', theme); }, [theme]);
  useEffect(() => { saveSettings('apiKey', apiKey); }, [apiKey]);
  useEffect(() => { saveSettings('isLoggedIn', isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { saveSettings('cart', cart); }, [cart]);
  useEffect(() => { saveSettings('user', user); }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const login = (email: string, pass: string) => {
    if (email === admin.email && pass === admin.password) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);

  // User Auth Methods
  const loginUser = async (email: string, phone: string) => {
    // Simple simulation for now, ideally use Firebase Auth
    // Check if user exists in 'users' collection by email
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data() as UserProfile;
      setUser({ ...userData, id: querySnapshot.docs[0].id });
    } else {
      // Create new user
      const newUser: UserProfile = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        phone,
        wishlist: [],
        orders: [],
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', newUser.id), newUser);
      setUser(newUser);
    }
  };

  const logoutUser = () => setUser(null);

  const toggleWishlist = async (productId: string) => {
    if (!user) return;
    const isInWishlist = user.wishlist.includes(productId);
    const newWishlist = isInWishlist 
      ? user.wishlist.filter(id => id !== productId)
      : [...user.wishlist, productId];
    
    await updateDoc(doc(db, 'users', user.id), { wishlist: newWishlist });
    setUser({ ...user, wishlist: newWishlist });
  };

  const applyCoupon = (code: string, orderTotal: number): Coupon | null => {
    const coupon = coupons.find(c => c.code === code && c.isActive);
    if (!coupon) return null;
    if (orderTotal < coupon.minOrder) return null;
    return coupon;
  };

  // Firestore Operations wrapper
  const sanitize = (data: any) => {
    return JSON.parse(JSON.stringify(data, (_, v) => v === undefined ? null : v));
  };

  const wrapOp = async (op: () => Promise<any>) => {
    try {
      await op();
      setError(null);
    } catch (err: any) {
      handleFirebaseError(err);
      throw err;
    }
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === item.product.id && i.variant.size === item.variant.size && i.variant.color === item.variant.color);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (productId: string, variant: StockVariant) => {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.variant.size === variant.size && i.variant.color === variant.color)));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (order: Order) => wrapOp(async () => {
    await setDoc(doc(db, 'orders', order.id), sanitize(order));

    if (user && user.id) {
      await updateDoc(doc(db, 'users', user.id), {
        orders: [...(user.orders || []), order.id]
      });
    }
    clearCart();
  });

  const deleteOrder = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'orders', id));
    showNotification(language === 'bn' ? 'অর্ডারটি ডিলেট করা হয়েছে' : 'Order deleted successfully', 'info');
  });

  const updateOrderStatus = (id: string, status: Order['status']) => wrapOp(async () => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      // Restore stock ONLY if it was previously delivered (because we now deduct on delivery)
      if (order.status === 'Delivered') {
        for (const item of order.items) {
          const product = products.find(p => p.id === item.product.id);
          if (product) {
            const updatedVariants = product.variants.map(v => 
              (v.size === item.variant.size && v.color === item.variant.color) 
                ? { ...v, quantity: v.quantity + item.quantity } 
                : v
            );
            await updateDoc(doc(db, 'products', item.product.id), { variants: updatedVariants });
          }
        }
      }
    }

    if (status === 'Delivered' && order.status !== 'Delivered') {
      // 1. Deduct Stock (as requested: "delivered deyar por auto stock minas hoi")
      for (const item of order.items) {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          const updatedVariants = product.variants.map(v => 
            (v.size === item.variant.size && v.color === item.variant.color) 
              ? { ...v, quantity: Math.max(0, v.quantity - item.quantity) } 
              : v
          );
          await updateDoc(doc(db, 'products', item.product.id), { variants: updatedVariants });
        }
      }

      // 2. Find/Create Customer
      let customerId = order.userId;
      let customer = customers.find(c => c.phone === order.phone);
      
      if (!customer) {
        // Create new customer
        const newCustomer: Customer = {
          id: Date.now().toString(),
          name: order.customerName,
          phone: order.phone,
          address: order.address,
          totalSpent: 0,
          totalDue: 0
        };
        await setDoc(doc(db, 'customers', newCustomer.id), newCustomer);
        customerId = newCustomer.id;
        customer = newCustomer;
      } else {
        customerId = customer.id;
      }

      // 2. Create Sales
      const orderTotalDiscount = order.discount || 0;
      const orderSubtotal = order.items.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);

      for (const item of order.items) {
        const itemTotal = item.product.salePrice * item.quantity;
        const itemShare = orderSubtotal > 0 ? itemTotal / orderSubtotal : 0;
        const itemDiscount = orderTotalDiscount * itemShare;
        const finalAmount = itemTotal - itemDiscount;
        
        const profit = finalAmount - (item.product.purchasePrice * item.quantity);

        const sale: Sale = {
          id: `sale_${order.id}_${item.product.id}_${Date.now()}`,
          customerId: customerId!,
          customerName: order.customerName,
          productId: item.product.id,
          productName: item.product.name,
          size: item.variant.size,
          color: item.variant.color,
          quantity: item.quantity,
          salePrice: item.product.salePrice,
          totalAmount: finalAmount,
          paidAmount: finalAmount,
          dueAmount: 0,
          profit: profit,
          date: new Date().toISOString(),
          paymentStatus: 'Full Paid'
        };
        
        await setDoc(doc(db, 'sales', sale.id), sanitize(sale));
      }
      
      // 3. Update Customer Stats
      if (customer) {
        await updateDoc(doc(db, 'customers', customerId!), sanitize({
          totalSpent: (customer.totalSpent || 0) + order.totalAmount
        }));
      }
    }

    await updateDoc(doc(db, 'orders', id), sanitize({ 
      status,
      timeline: [...(order.timeline || []), { status, date: new Date().toISOString(), note: `Order ${status}` }]
    }));
    
    showNotification(
      language === 'bn' ? 'অর্ডার স্ট্যাটাস আপডেট হয়েছে' : 'Order status updated',
      'success'
    );
  });

  const addProduct = (product: Product) => wrapOp(async () => {
    const { id, ...data } = product;
    await setDoc(doc(db, 'products', id), sanitize(data));
    showNotification(language === 'bn' ? 'প্রোডাক্ট যুক্ত হয়েছে' : 'Product added successfully', 'success');
  });
  
  const updateProduct = (product: Product) => wrapOp(async () => {
    const { id, ...data } = product;
    await updateDoc(doc(db, 'products', id), sanitize(data));
    showNotification(language === 'bn' ? 'প্রোডাক্ট আপডেট হয়েছে' : 'Product updated successfully', 'success');
  });
  
  const deleteProduct = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'products', id));
    showNotification(language === 'bn' ? 'প্রোডাক্ট ডিলিট হয়েছে' : 'Product deleted successfully', 'success');
  });

  const addCustomer = (customer: Customer) => wrapOp(async () => {
    const { id, ...data } = customer;
    await setDoc(doc(db, 'customers', id), sanitize(data));
    showNotification(language === 'bn' ? 'কাস্টমার যুক্ত হয়েছে' : 'Customer added successfully', 'success');
  });
  
  const updateCustomer = (customer: Customer) => wrapOp(async () => {
    const { id, ...data } = customer;
    await updateDoc(doc(db, 'customers', id), sanitize(data));
    showNotification(language === 'bn' ? 'কাস্টমার আপডেট হয়েছে' : 'Customer updated successfully', 'success');
  });
  
  const deleteCustomer = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'customers', id));
    showNotification(language === 'bn' ? 'কাস্টমার ডিলিট হয়েছে' : 'Customer deleted successfully', 'success');
  });

  const addExpense = (expense: Expense) => wrapOp(async () => {
    const { id, ...data } = expense;
    await setDoc(doc(db, 'expenses', id), sanitize(data));
    showNotification(language === 'bn' ? 'খরচ যুক্ত হয়েছে' : 'Expense added successfully', 'success');
  });
  
  const updateExpense = (expense: Expense) => wrapOp(async () => {
    const { id, ...data } = expense;
    await updateDoc(doc(db, 'expenses', id), sanitize(data));
    showNotification(language === 'bn' ? 'খরচ আপডেট হয়েছে' : 'Expense updated successfully', 'success');
  });
  
  const deleteExpense = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'expenses', id));
    showNotification(language === 'bn' ? 'খরচ ডিলিট হয়েছে' : 'Expense deleted successfully', 'success');
  });

  const addSale = (sale: Sale) => wrapOp(async () => {
    const { id, ...saleData } = sale;
    await setDoc(doc(db, 'sales', id), sanitize(saleData));

    // Stock update logic
    const product = products.find(p => p.id === sale.productId);
    if (product) {
      const updatedVariants = product.variants.map(v => 
        (v.size === sale.size && v.color === sale.color) 
          ? { ...v, quantity: Math.max(0, v.quantity - sale.quantity) } 
          : v
      );
      await updateDoc(doc(db, 'products', sale.productId), { variants: updatedVariants });
    }

    // Customer balance update
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      await updateDoc(doc(db, 'customers', sale.customerId), {
        totalSpent: (customer.totalSpent || 0) + sale.totalAmount,
        totalDue: (customer.totalDue || 0) + sale.dueAmount
      });
    }
    showNotification(language === 'bn' ? 'বিক্রয় সম্পন্ন হয়েছে' : 'Sale added successfully', 'success');
  });

  const receivePayment = (customerId: string, amount: number) => wrapOp(async () => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    await updateDoc(doc(db, 'customers', customerId), {
      totalDue: Math.max(0, (customer.totalDue || 0) - amount)
    });

    let remaining = amount;
    const customerSales = sales.filter(s => s.customerId === customerId && s.dueAmount > 0)
                               .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const s of customerSales) {
      if (remaining <= 0) break;
      const payToThis = Math.min(s.dueAmount, remaining);
      remaining -= payToThis;
      const newDue = s.dueAmount - payToThis;
      
      await updateDoc(doc(db, 'sales', s.id), {
        dueAmount: newDue,
        paidAmount: (s.paidAmount || 0) + payToThis,
        paymentStatus: newDue === 0 ? 'Full Paid' : 'Partial Paid'
      });
    }
    showNotification(language === 'bn' ? 'পেমেন্ট গ্রহণ করা হয়েছে' : 'Payment received successfully', 'success');
  });

  const deleteSale = (id: string) => wrapOp(async () => {
    const sale = sales.find(s => s.id === id);
    if (!sale) return;

    // Restore stock
    const product = products.find(p => p.id === sale.productId);
    if (product) {
      const updatedVariants = product.variants.map(v => 
        (v.size === sale.size && v.color === sale.color) 
          ? { ...v, quantity: v.quantity + sale.quantity } 
          : v
      );
      await updateDoc(doc(db, 'products', sale.productId), { variants: updatedVariants });
    }

    // Restore customer balances
    const customer = customers.find(c => c.id === sale.customerId);
    if (customer) {
      await updateDoc(doc(db, 'customers', sale.customerId), {
        totalSpent: Math.max(0, (customer.totalSpent || 0) - sale.totalAmount),
        totalDue: Math.max(0, (customer.totalDue || 0) - sale.dueAmount)
      });
    }

    await deleteDoc(doc(db, 'sales', id));
    showNotification(language === 'bn' ? 'বিক্রয় ডিলিট হয়েছে' : 'Sale deleted successfully', 'success');
  });
  
  const addReview = (productId: string, review: Review) => wrapOp(async () => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newReviews = [...(product.reviews || []), review];
    const totalRating = newReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = Number((totalRating / newReviews.length).toFixed(1));

    await updateDoc(doc(db, 'products', productId), {
      reviews: newReviews,
      rating: avgRating
    });
    showNotification(language === 'bn' ? 'রিভিউ যোগ করা হয়েছে' : 'Review added successfully', 'success');
  });

  const updateAdmin = (adminData: BusinessState['admin']) => wrapOp(async () => {
    await setDoc(doc(db, 'settings', 'shop'), sanitize(adminData));
    showNotification(language === 'bn' ? 'সেটিংস আপডেট হয়েছে' : 'Settings updated successfully', 'success');
  });

  // Fix: Corrected function to call setLanguageState and resolved redeclaration by renaming useState setter
  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <StoreContext.Provider value={{
      products, customers, sales, expenses, admin, language, theme, isLoggedIn, apiKey,
      orders, cart, coupons, user, addToCart, removeFromCart, clearCart, placeOrder, deleteOrder, updateOrderStatus,
      addProduct, updateProduct, deleteProduct, addSale, deleteSale, 
      addExpense, updateExpense, deleteExpense, 
      addCustomer, updateCustomer, deleteCustomer, receivePayment,
      updateAdmin, setLanguage, setApiKey, toggleTheme, login, logout, 
      loginUser, logoutUser, toggleWishlist, applyCoupon, addReview, error,
      notification, setNotification
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
