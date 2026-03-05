
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Customer, Sale, Expense, BusinessState, Language, Theme } from './types';
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
  orderBy
} from 'firebase/firestore';

interface StoreContextType extends BusinessState {
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
  toggleTheme: () => void;
  login: (pass: string) => boolean;
  logout: () => void;
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  // Fix: Renamed setter to setLanguageState to avoid name collision with the setLanguage function
  const [language, setLanguageState] = useState<Language>(() => loadSettings('language', 'en'));
  const [theme, setThemeState] = useState<Theme>(() => loadSettings('theme', 'light'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => loadSettings('isLoggedIn', false));
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  
  const [admin, setAdmin] = useState<BusinessState['admin']>({
    name: 'Sylsas Admin',
    phone: '01712345678',
    role: 'Owner',
    image: 'https://picsum.photos/seed/admin/100/100',
    pin: '1234'
  });

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

    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), 
      (snapshot) => {
        setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
        setError(prev => prev?.code === 'permission-denied' ? null : prev);
      },
      handleFirebaseError
    );

    const unsubAdmin = onSnapshot(doc(db, 'settings', 'shop'), 
      (snapshot) => {
        if (snapshot.exists()) {
          setAdmin(snapshot.data() as BusinessState['admin']);
        }
      },
      handleFirebaseError
    );

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSales();
      unsubExpenses();
      unsubAdmin();
    };
  }, [language]);

  useEffect(() => { saveSettings('language', language); }, [language]);
  useEffect(() => { saveSettings('theme', theme); }, [theme]);
  useEffect(() => { saveSettings('isLoggedIn', isLoggedIn); }, [isLoggedIn]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const login = (pass: string) => {
    if (pass === admin.pin) {
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsLoggedIn(false);

  // Firestore Operations wrapper
  const wrapOp = async (op: () => Promise<any>) => {
    try {
      await op();
      setError(null);
    } catch (err: any) {
      handleFirebaseError(err);
      throw err;
    }
  };

  const addProduct = (product: Product) => wrapOp(async () => {
    const { id, ...data } = product;
    await setDoc(doc(db, 'products', id), data);
  });
  
  const updateProduct = (product: Product) => wrapOp(async () => {
    const { id, ...data } = product;
    await updateDoc(doc(db, 'products', id), data as any);
  });
  
  const deleteProduct = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'products', id));
  });

  const addCustomer = (customer: Customer) => wrapOp(async () => {
    const { id, ...data } = customer;
    await setDoc(doc(db, 'customers', id), data);
  });
  
  const updateCustomer = (customer: Customer) => wrapOp(async () => {
    const { id, ...data } = customer;
    await updateDoc(doc(db, 'customers', id), data as any);
  });
  
  const deleteCustomer = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'customers', id));
  });

  const addExpense = (expense: Expense) => wrapOp(async () => {
    const { id, ...data } = expense;
    await setDoc(doc(db, 'expenses', id), data);
  });
  
  const updateExpense = (expense: Expense) => wrapOp(async () => {
    const { id, ...data } = expense;
    await updateDoc(doc(db, 'expenses', id), data as any);
  });
  
  const deleteExpense = (id: string) => wrapOp(async () => {
    await deleteDoc(doc(db, 'expenses', id));
  });

  const addSale = (sale: Sale) => wrapOp(async () => {
    const { id, ...saleData } = sale;
    await setDoc(doc(db, 'sales', id), saleData);

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
  });
  
  const updateAdmin = (adminData: BusinessState['admin']) => wrapOp(async () => {
    await setDoc(doc(db, 'settings', 'shop'), adminData);
  });

  // Fix: Corrected function to call setLanguageState and resolved redeclaration by renaming useState setter
  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleTheme = () => setThemeState(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <StoreContext.Provider value={{
      products, customers, sales, expenses, admin, language, theme, isLoggedIn,
      addProduct, updateProduct, deleteProduct, addSale, deleteSale, 
      addExpense, updateExpense, deleteExpense, 
      addCustomer, updateCustomer, deleteCustomer, receivePayment,
      updateAdmin, setLanguage, toggleTheme, login, logout, error
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
