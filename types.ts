
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
export type Language = 'en' | 'bn';
export type Theme = 'light' | 'dark';

export interface StockVariant {
  size: Size;
  color: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  purchasePrice: number;
  salePrice: number;
  variants: StockVariant[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalSpent: number;
  totalDue: number;
}

export type PaymentStatus = 'Full Paid' | 'Partial Paid' | 'Due';

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  size: Size;
  color: string;
  quantity: number;
  salePrice: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  profit: number;
  date: string;
  paymentStatus: PaymentStatus;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string;
}

export type TabType = 'dashboard' | 'sales' | 'stock' | 'expense' | 'customers' | 'report' | 'ai' | 'settings';

export interface BusinessState {
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  language: Language;
  theme: Theme;
  isLoggedIn: boolean;
  admin: {
    name: string;
    phone: string;
    role: string;
    image: string;
    pin: string;
  };
}
