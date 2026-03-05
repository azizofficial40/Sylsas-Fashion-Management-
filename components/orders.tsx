
import React, { useState } from 'react';
import { useStore } from '../store';
import { Order } from '../types';
import { Package, Phone, MapPin, Clock, CheckCircle, XCircle, Truck, ShoppingBag, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';

const ORDERS_T = {
  en: {
    title: 'Online Orders',
    sub: 'Manage customer orders',
    status: {
      Pending: 'Pending',
      Confirmed: 'Confirmed',
      Shipped: 'Shipped',
      Delivered: 'Delivered',
      Cancelled: 'Cancelled'
    },
    empty: 'No orders found',
    items: 'Items',
    total: 'Total',
    customer: 'Customer Details',
    actions: 'Update Status'
  },
  bn: {
    title: 'অনলাইন অর্ডার',
    sub: 'কাস্টমার অর্ডার ম্যানেজমেন্ট',
    status: {
      Pending: 'পেন্ডিং',
      Confirmed: 'কনফার্মড',
      Shipped: 'শিপড',
      Delivered: 'ডেলিভারড',
      Cancelled: 'বাতিল'
    },
    empty: 'কোনো অর্ডার পাওয়া যায়নি',
    items: 'আইটেম',
    total: 'মোট',
    customer: 'কাস্টমার তথ্য',
    actions: 'স্ট্যাটাস পরিবর্তন'
  }
};

const Orders: React.FC = () => {
  const { orders, updateOrderStatus, language } = useStore();
  const t = ORDERS_T[language];
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'All'>('All');

  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Confirmed': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Shipped': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Delivered': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Cancelled': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Confirmed': return <CheckCircle size={16} />;
      case 'Shipped': return <Truck size={16} />;
      case 'Delivered': return <Package size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t.title}</h2>
          <p className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">{t.sub}</p>
        </div>
        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-50 dark:border-slate-800">
          <ShoppingBag size={24} />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              filterStatus === status 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' 
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {status === 'All' ? (language === 'bn' ? 'সব' : 'All') : t.status[status as Order['status']]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{t.empty}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div 
                className="p-6 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">#{order.id.slice(-6)}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-lg">৳{order.totalAmount}</span>
                  {expandedOrder === order.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="px-6 pb-6 pt-0 space-y-6 animate-in slide-in-from-top-2">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{t.customer}</h4>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                        <ShoppingBag size={14} />
                      </div>
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                        <Phone size={14} />
                      </div>
                      <span>{order.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                        <MapPin size={14} />
                      </div>
                      <span className="leading-tight">{order.address}</span>
                    </div>
                    
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Payment Info</h4>
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <div className="w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                          <CreditCard size={14} />
                        </div>
                        <span className="flex items-center gap-2">
                          {order.paymentMethod}
                          {order.transactionId && (
                            <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] font-mono text-slate-600 dark:text-slate-300">
                              TRX: {order.transactionId}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t.items}</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <img src={item.product.image} className="w-12 h-12 rounded-xl object-cover" alt={item.product.name} />
                          <div className="flex-1">
                            <p className="font-bold text-sm">{item.product.name}</p>
                            <p className="text-xs text-slate-500 font-bold">{item.variant.size} • {item.variant.color} • x{item.quantity}</p>
                          </div>
                          <span className="font-black text-sm">৳{item.product.salePrice * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t.actions}</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status as Order['status'])}
                          disabled={order.status === status}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            order.status === status
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500'
                          }`}
                        >
                          {t.status[status as Order['status']]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
