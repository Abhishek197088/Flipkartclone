'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { User, Mail, Phone, Calendar, ShieldCheck, MapPin, Trash2, Plus } from 'lucide-react';
import API from '../../services/api';

export default function ProfilePage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  const fetchMe = useStore((state) => state.fetchMe);
  const saveAddress = useStore((state) => state.saveAddress);
  const showToast = useStore((state) => state.showToast);

  // Address creation form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [locality, setLocality] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [isDefault, setIsDefault] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchMe();
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fk-blue" />
      </div>
    );
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !pincode || !addressLine || !city || !state) {
      showToast('Please fill all required address fields', 'error');
      return;
    }

    const payload = {
      name,
      phone,
      pincode,
      locality,
      addressLine,
      city,
      state,
      addressType,
      isDefault
    };

    const success = await saveAddress(payload);
    if (success) {
      setShowAddressForm(false);
      resetAddressForm();
      fetchMe();
    }
  };

  const resetAddressForm = () => {
    setName('');
    setPhone('');
    setPincode('');
    setLocality('');
    setAddressLine('');
    setCity('');
    setState('');
    setAddressType('Home');
  };

  return (
    <div className="bg-[#f1f3f6] pb-12 pt-4 min-h-[80vh]">
      <div className="max-w-[1248px] mx-auto px-4 flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Profile Information Card */}
        <div className="w-full md:w-80 bg-white rounded shadow-fk border border-gray-100 p-6 self-start">
          <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100 mb-6">
            <div className="w-20 h-20 bg-fk-blue rounded-full text-white flex items-center justify-center text-2xl font-bold mb-4 shadow">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5 justify-center">
              {user.name} 
              {user.role === 'admin' && (
                <span className="bg-amber-100 border border-amber-200 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide">
                  Admin
                </span>
              )}
            </h3>
            <span className="text-xs text-gray-400 font-semibold">{user.email}</span>
          </div>

          <div className="space-y-4 text-xs font-semibold text-gray-600">
            <div className="flex items-center gap-3">
              <Mail className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Email Address</span>
                <span className="text-gray-800 select-all">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Mobile Number</span>
                <span className="text-gray-800 select-all">{user.phone || 'Not Added'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4.5 w-4.5 text-gray-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Member Since</span>
                <span className="text-gray-800">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Manage Addresses Panel */}
        <div className="flex-1 bg-white rounded shadow-fk border border-gray-100 p-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-6">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-fk-blue" /> Manage Addresses ({user.addresses?.length || 0})
            </h2>
            
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="bg-fk-blue hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded shadow-sm hover:shadow cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Address
              </button>
            )}
          </div>

          {/* New address inline form */}
          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="bg-gray-50 p-5 border border-gray-200 rounded mb-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Add New Address</h4>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                />
                <input
                  type="text"
                  placeholder="10-Digit Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                />
                <input
                  type="text"
                  placeholder="Locality (Optional)"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                />
                <input
                  type="text"
                  placeholder="Address Line (Street/Area/Building)"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue sm:col-span-2"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
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
                      name="profileAddrType"
                      checked={addressType === type}
                      onChange={() => setAddressType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
                
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer select-none ml-auto">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-fk-blue border-gray-300"
                  />
                  <span>Make Default Address</span>
                </label>
              </div>

              <button
                type="submit"
                className="bg-fk-blue hover:bg-blue-600 text-white font-bold text-xs px-6 py-2 rounded shadow-sm hover:shadow cursor-pointer transition-colors mt-2"
              >
                Save New Address
              </button>
            </form>
          )}

          {/* List address records */}
          {user.addresses && user.addresses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {user.addresses.map((addr: any) => (
                <div key={addr.id} className="border border-gray-200 rounded p-4 text-xs font-semibold text-gray-700 relative">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{addr.name}</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500 uppercase">{addr.addressType}</span>
                    {addr.isDefault && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="block font-bold text-gray-800 mb-1">Phone: {addr.phone}</span>
                  <p className="leading-relaxed text-gray-600">
                    {addr.addressLine}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - <span className="font-bold text-gray-900">{addr.pincode}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 font-semibold border border-dashed border-gray-200 rounded">
              No saved addresses found. Add one to speed up checkout.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
