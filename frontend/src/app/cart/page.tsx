'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const router = useRouter();
  const cart = useStore((state) => state.cart);
  const token = useStore((state) => state.token);
  const fetchCart = useStore((state) => state.fetchCart);
  const updateCartQty = useStore((state) => state.updateCartQty);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const showToast = useStore((state) => state.showToast);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token]);

  // Calculations
  let totalMrp = 0;
  let totalActual = 0;
  
  cart.forEach((item) => {
    const qty = item.quantity;
    const mrp = item.product?.mrp || 0;
    const price = item.product?.price || 0;

    totalMrp += mrp * qty;
    totalActual += price * qty;
  });

  const discount = totalMrp - totalActual;
  const deliveryCharges = totalActual > 500 || totalActual === 0 ? 0 : 40;
  const finalBillAmount = totalActual + deliveryCharges;

  const handleQtyChange = (item: any, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    updateCartQty(item.id, newQty);
  };

  const handlePlaceOrder = () => {
    if (!token) {
      showToast('Please login to place your order', 'error');
      return;
    }
    router.push('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#f1f3f6] min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded shadow-fk border border-gray-100 max-w-md w-full text-center flex flex-col items-center">
          <img
            src="https://img1a.flixcart.com/www/linchpin/fk-cp-zion/img/empty-cart_ee614e.png"
            alt="Empty Cart"
            className="w-48 object-contain mb-6 animate-bounce"
          />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Your cart is empty!</h3>
          <p className="text-xs text-gray-400 font-semibold mb-6">Add items to it now to shop.</p>
          <Link
            href="/"
            className="bg-fk-blue hover:bg-blue-600 text-white font-bold text-sm px-10 py-2.5 rounded shadow-sm hover:shadow cursor-pointer transition-all active:scale-95"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f6] pb-12 pt-4 min-h-[80vh]">
      <div className="max-w-[1248px] mx-auto px-4 flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Cart Items List */}
        <div className="flex-1 bg-white rounded shadow-fk border border-gray-100 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">
                Flipkart Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)} Items)
              </h2>
            </div>

            <div className="divide-y divide-gray-100 overflow-hidden">
              <AnimatePresence initial={false}>
                {cart.map((item) => {
                  const prod = item.product;
                  if (!prod) return null;
                  const img = prod.images && prod.images[0] ? prod.images[0].imageUrl : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -60, height: 0, padding: 0 }}
                      transition={{ duration: 0.25 }}
                      className="p-6 flex flex-col sm:flex-row gap-5 overflow-hidden"
                    >
                      
                      {/* Item Image */}
                      <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-gray-50 border border-gray-100 rounded p-1">
                        <img
                          src={img}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Item details */}
                      <div className="flex-1 flex flex-col">
                        <Link href={`/product/${prod.id}`} className="text-sm font-semibold text-gray-800 hover:text-fk-blue line-clamp-2">
                          {prod.title}
                        </Link>
                        
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                          Brand: {prod.brand}
                        </span>

                        {/* Prices */}
                        <div className="flex items-baseline gap-2 mt-3">
                          <span className="text-base font-bold text-gray-900">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                          {prod.mrp > prod.price && (
                            <>
                              <span className="text-xs text-gray-400 line-through">
                                ₹{prod.mrp.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs font-bold text-fk-green">
                                {prod.discountPercent}% off
                              </span>
                            </>
                          )}
                        </div>

                        {/* Controls Row */}
                        <div className="flex items-center gap-6 mt-4 flex-wrap">
                          {/* Quantity Increment/Decrement */}
                          <div className="flex items-center border border-gray-300 rounded overflow-hidden h-7 bg-white">
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleQtyChange(item, -1)}
                              disabled={item.quantity <= 1}
                              className="px-2 hover:bg-gray-100 text-gray-600 disabled:opacity-30 cursor-pointer h-full flex items-center justify-center"
                            >
                              <Minus className="h-3 w-3" />
                            </motion.button>
                            
                            {/* Quantity digit counter */}
                            <span className="px-4 text-xs font-bold text-gray-800 border-x border-gray-200 flex items-center justify-center h-full min-w-8">
                              {item.quantity}
                            </span>
                            
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={() => handleQtyChange(item, 1)}
                              className="px-2 hover:bg-gray-100 text-gray-600 cursor-pointer h-full flex items-center justify-center"
                            >
                              <Plus className="h-3 w-3" />
                            </motion.button>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>

                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Place Order Panel Bottom */}
          <div className="border-t border-gray-100 p-4 flex justify-end bg-gray-50/70">
            <button
              onClick={handlePlaceOrder}
              className="bg-[#fb641b] hover:bg-orange-600 text-white font-bold text-sm py-3 px-10 rounded shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
            >
              PLACE ORDER <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

        {/* Right Side: Price Details Receipt */}
        <div className="w-full lg:w-96 space-y-4">
          <div className="bg-white rounded shadow-fk border border-gray-100 p-6 flex flex-col">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100 mb-4">
              Price Details
            </h3>

            <div className="space-y-4 text-sm font-semibold border-b border-gray-100 pb-4 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Price ({cart.reduce((sum, item) => sum + item.quantity, 0)} Items)</span>
                <span>₹{totalMrp.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-fk-green">
                <span>Discount</span>
                <span>- ₹{discount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Charges</span>
                <span>
                  {deliveryCharges === 0 ? (
                    <span className="text-fk-green uppercase font-bold">Free</span>
                  ) : (
                    `₹${deliveryCharges}`
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-base font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4">
              <span>Total Amount</span>
              <span>₹{finalBillAmount.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <span className="text-xs font-bold text-fk-green">
                You will save ₹{discount.toLocaleString('en-IN')} on this order
              </span>
            )}
          </div>

          {/* Secure transaction notice */}
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded p-4 shadow-sm">
            <ShieldCheck className="h-9 w-9 text-gray-400 shrink-0" />
            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
