'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import API from '../../services/api';
import { MapPin, Plus, CheckCircle2, Shield, Circle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const cart = useStore((state) => state.cart);
  const fetchMe = useStore((state) => state.fetchMe);
  const clearCart = useStore((state) => state.clearCart);
  const saveAddress = useStore((state) => state.saveAddress);
  const showToast = useStore((state) => state.showToast);

  // Checkout states
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('COD');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Add address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrLocality, setAddrLocality] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrType, setAddrType] = useState('Home');
  const [addrDefault, setAddrDefault] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchMe();
  }, [token]);

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((a: any) => a.isDefault);
      setSelectedAddressId(def ? def.id : user.addresses[0].id);
    }
  }, [user]);

  // Order Placement
  const handleConfirmOrder = async () => {
    if (!selectedAddressId) {
      showToast('Please select a shipping address', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await API.post('/orders', {
        addressId: selectedAddressId,
        paymentMethod
      });
      if (res.status === 201) {
        setOrderSuccess(true);
        // Show success screen for 2.4s, then redirect
        setTimeout(() => {
          clearCart();
          router.push('/orders');
        }, 2400);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error placing order', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Address Submit handler
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrPincode || !addrLine || !addrCity || !addrState) {
      showToast('Please fill all required address fields', 'error');
      return;
    }

    const payload = {
      name: addrName,
      phone: addrPhone,
      pincode: addrPincode,
      locality: addrLocality,
      addressLine: addrLine,
      city: addrCity,
      state: addrState,
      addressType: addrType,
      isDefault: addrDefault
    };

    const success = await saveAddress(payload);
    if (success) {
      setShowAddressForm(false);
      resetAddressForm();
      fetchMe();
    }
  };

  const resetAddressForm = () => {
    setAddrName('');
    setAddrPhone('');
    setAddrPincode('');
    setAddrLocality('');
    setAddrLine('');
    setAddrCity('');
    setAddrState('');
    setAddrType('Home');
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f1f3f6] flex flex-col items-center justify-center p-4 select-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 12 }}
          className="bg-white p-10 rounded shadow-2xl text-center flex flex-col items-center max-w-sm w-full border border-gray-100"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-20 h-20 bg-fk-green/10 text-fk-green rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
          
          <motion.h3
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg font-bold text-gray-800 mb-2"
          >
            Order Placed Successfully!
          </motion.h3>
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-gray-400 font-semibold mb-4"
          >
            Thank you for shopping with us.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-fk-blue font-bold animate-pulse"
          >
            Redirecting to My Orders page...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-12 text-center bg-white rounded shadow-fk mt-6 border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-2">No items in checkout.</h3>
        <button
          onClick={() => router.push('/')}
          className="text-xs font-bold text-fk-blue hover:underline"
        >
          Go back to Home
        </button>
      </div>
    );
  }

  // Computations
  let totalMrp = 0;
  let totalActual = 0;
  cart.forEach((item) => {
    const qty = item.quantity;
    totalMrp += (item.product?.mrp || 0) * qty;
    totalActual += (item.product?.price || 0) * qty;
  });
  const discount = totalMrp - totalActual;
  const deliveryCharges = totalActual > 500 ? 0 : 40;
  const finalBillAmount = totalActual + deliveryCharges;

  return (
    <div className="bg-[#f1f3f6] pb-12 pt-4 min-h-[80vh]">
      <div className="max-w-[1248px] mx-auto px-4 flex flex-col lg:flex-row gap-4">
        
        {/* Left Side: Steps (Address Selection -> Payment) */}
        <div className="flex-1 space-y-4">
          
          {/* Step 1: Shipping Address */}
          <div className="bg-white rounded shadow-fk border border-gray-100 p-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
              <span className="bg-fk-blue text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">1</span>
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">Delivery Address</h2>
            </div>

            {/* List existing user addresses */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3 mb-6">
                {user.addresses.map((addr: any) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`border rounded p-4 flex items-start gap-3 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-fk-blue bg-blue-50/20'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="h-4 w-4 mt-0.5 text-fk-blue cursor-pointer"
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-gray-800 text-sm">{addr.name}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase">{addr.addressType}</span>
                        <span className="font-bold text-gray-700">{addr.phone}</span>
                      </div>
                      <p className="text-gray-600 font-semibold leading-relaxed">
                        {addr.addressLine}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-semibold mb-6">No saved addresses found. Please add one below.</p>
            )}

            {/* Add Address Collapsible */}
            <div className="overflow-hidden">
              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-fk-blue hover:text-blue-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer bg-blue-50 border border-dashed border-blue-300 rounded px-4 py-2 hover:scale-[1.01] transition-transform"
                >
                  <Plus className="h-4 w-4" /> Add A New Shipping Address
                </button>
              ) : (
                <AnimatePresence>
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleAddressSubmit}
                    className="bg-gray-50 p-6 rounded border border-gray-200 space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">New Shipping Address</h4>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 font-bold hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Recipient's Name"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                      />
                      <input
                        type="text"
                        placeholder="Recipient's 10-Digit Mobile"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                      />
                      <input
                        type="text"
                        placeholder="Locality (Optional)"
                        value={addrLocality}
                        onChange={(e) => setAddrLocality(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                      />
                      <input
                        type="text"
                        placeholder="Address Line (Street/House/Area)"
                        value={addrLine}
                        onChange={(e) => setAddrLine(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue md:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                      />
                    </div>

                    <div className="flex gap-4 items-center mt-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-600">Address Type:</span>
                      {['Home', 'Work'].map((type) => (
                        <label key={type} className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                          <input
                            type="radio"
                            name="addrType"
                            checked={addrType === type}
                            onChange={() => setAddrType(type)}
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                      
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer select-none ml-auto">
                        <input
                          type="checkbox"
                          checked={addrDefault}
                          onChange={(e) => setAddrDefault(e.target.checked)}
                          className="rounded text-fk-blue border-gray-300"
                        />
                        <span>Make Default Address</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="bg-fk-blue hover:bg-blue-600 text-white font-bold text-xs px-6 py-2 rounded shadow-sm hover:shadow cursor-pointer transition-colors mt-2"
                    >
                      Save Address & Deliver Here
                    </button>
                  </motion.form>
                </AnimatePresence>
              )}
            </div>

          </div>

          {/* Step 2: Payment Options */}
          <div className="bg-white rounded shadow-fk border border-gray-100 p-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-4">
              <span className="bg-fk-blue text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">2</span>
              <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">Payment Options</h2>
            </div>

            <div className="space-y-3">
              {[
                { id: 'COD', title: 'Cash on Delivery (COD)' },
                { id: 'UPI', title: 'UPI Instant Transfer (Simulated)' },
                { id: 'CARD', title: 'Credit / Debit Card (Simulated)' }
              ].map((pm) => (
                <div
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`border rounded p-4 flex items-center gap-3 cursor-pointer transition-all ${
                    paymentMethod === pm.id
                      ? 'border-fk-blue bg-blue-50/20'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === pm.id}
                    onChange={() => setPaymentMethod(pm.id)}
                    className="h-4 w-4 text-fk-blue cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-700">{pm.title}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              className="w-full mt-6 bg-[#fb641b] hover:bg-orange-600 text-white font-bold py-3.5 rounded shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm cursor-pointer transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <>
                  <span>CONFIRM & PLACE ORDER</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>

          </div>

        </div>

        {/* Right Side: Price Details Panel */}
        <div className="w-full lg:w-96 space-y-4">
          
          <div className="bg-white rounded shadow-fk border border-gray-100 p-6 flex flex-col">
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100 mb-4">
              Price Summary
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
              <span>Total Payable</span>
              <span>₹{finalBillAmount.toLocaleString('en-IN')}</span>
            </div>

            {discount > 0 && (
              <span className="text-xs font-bold text-fk-green">
                Saving ₹{discount.toLocaleString('en-IN')} on this order
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded p-4 shadow-sm">
            <Shield className="h-8 w-8 text-gray-400 shrink-0" />
            <span>Safe and Secure Payments. Authentic items, direct from brand hubs.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
