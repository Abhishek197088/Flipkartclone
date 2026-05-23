'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../store/useStore';
import API from '../../services/api';
import { Package, ShieldCheck, Truck, ChevronRight } from 'lucide-react';

export default function OrdersPage() {
  const token = useStore((state) => state.token);
  const showToast = useStore((state) => state.showToast);
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrdersList = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading orders history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrdersList();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="bg-[#f1f3f6] min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded shadow-fk border border-gray-100 max-w-sm w-full text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Please login to view orders</h3>
          <p className="text-xs text-gray-400 font-semibold mb-6">Access your order history, returns, and tracking.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fk-blue" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-[#f1f3f6] min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded shadow-fk border border-gray-100 max-w-md w-full text-center flex flex-col items-center">
          <Package className="h-16 w-16 text-gray-300 mb-4 stroke-1 fill-gray-50 animate-bounce" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">No orders found!</h3>
          <p className="text-xs text-gray-400 font-semibold mb-6">Looks like you haven't placed any orders yet.</p>
          <Link
            href="/"
            className="bg-fk-blue hover:bg-blue-600 text-white font-bold text-sm px-10 py-2.5 rounded shadow-sm hover:shadow cursor-pointer transition-colors"
          >
            Go Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f6] pb-12 pt-4 min-h-[80vh]">
      <div className="max-w-[1248px] mx-auto px-4 space-y-4">
        
        <h2 className="text-base font-bold text-gray-800 px-1">
          My Orders ({orders.length})
        </h2>

        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            const statusColors: any = {
              Placed: 'bg-blue-50 text-blue-700 border-blue-200',
              Processing: 'bg-amber-50 text-amber-700 border-amber-200',
              Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200'
            };

            const statusColor = statusColors[order.orderStatus] || 'bg-gray-50 text-gray-700 border-gray-200';

            return (
              <div key={order.id} className="bg-white rounded shadow-fk border border-gray-100 overflow-hidden">
                
                {/* Order Meta Header */}
                <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100 flex justify-between items-center flex-wrap gap-3 text-xs font-bold text-gray-600">
                  <div className="flex gap-4 flex-wrap">
                    <span>Order ID: <span className="text-gray-900 select-all font-mono">{order.id}</span></span>
                    <span>Placed: <span className="text-gray-900">{dateStr}</span></span>
                  </div>
                  <div className="flex gap-3 items-center flex-wrap">
                    <span className="font-semibold">Total Paid: <span className="text-gray-900 font-extrabold">₹{order.finalAmount.toLocaleString('en-IN')}</span></span>
                    <span className={`border px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${statusColor}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Main panel: Split Items / Shipping */}
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100 p-6 gap-6">
                  
                  {/* Left: Items list */}
                  <div className="flex-1 space-y-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 rounded p-0.5">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="flex-1 text-xs">
                          {item.productId ? (
                            <Link href={`/product/${item.productId}`} className="font-bold text-gray-800 hover:text-fk-blue line-clamp-1">
                              {item.title}
                            </Link>
                          ) : (
                            <span className="font-bold text-gray-500 line-clamp-1">{item.title}</span>
                          )}
                          <div className="flex items-center gap-4 text-gray-500 font-semibold mt-1">
                            <span>Quantity: {item.quantity}</span>
                            <span>Price: ₹{item.price.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Shipping Address details */}
                  {order.shippingAddress && (
                    <div className="w-full md:w-80 md:pl-6 shrink-0 text-xs">
                      <h4 className="font-bold text-gray-400 uppercase tracking-wide mb-2.5">Shipping Details</h4>
                      <div className="bg-gray-50 border border-gray-200 rounded p-3 text-gray-700 font-semibold">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{order.shippingAddress.name}</span>
                          <span className="bg-gray-200/60 px-2 py-0.5 rounded text-[9px] font-bold text-gray-500 uppercase">{order.shippingAddress.addressType}</span>
                        </div>
                        <span className="block font-bold text-gray-800 mb-1">Phone: {order.shippingAddress.phone}</span>
                        <p className="leading-relaxed text-gray-600">
                          {order.shippingAddress.addressLine}, {order.shippingAddress.locality ? `${order.shippingAddress.locality}, ` : ''}{order.shippingAddress.city}, {order.shippingAddress.state} - <span className="font-bold text-gray-900">{order.shippingAddress.pincode}</span>
                        </p>
                        <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-500 text-[10px]">
                          <span>Method: <span className="text-gray-700 font-extrabold">{order.paymentMethod}</span></span>
                          <span>Payment: <span className="text-gray-700 font-extrabold">{order.paymentStatus || 'Pending'}</span></span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
