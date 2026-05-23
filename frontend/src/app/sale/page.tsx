'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import ProductCard from '../../components/ProductCard';
import { Flame, Clock, Award, Star } from 'lucide-react';
import Link from 'next/link';

export default function SalePage() {
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const loading = useStore((state) => state.loading);

  const [activeCategory, setActiveCategory] = useState<string>('');

  // Countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 45, seconds: 59 });

  useEffect(() => {
    fetchProducts();
    
    // Ticking countdown clock logic
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset timer to keep demo ticking
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter products by active category slug and only show products with discount >= 20%
  const saleProducts = products.filter((p: any) => {
    const isHighDiscount = p.discountPercent >= 20;
    const isCategoryMatch = activeCategory ? p.category?.slug === activeCategory : true;
    return isHighDiscount && isCategoryMatch;
  });

  const padZero = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-[#f1f3f6] pb-12">
      
      {/* 1. Header Hero Sale Banner */}
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-amber-500 text-white py-12 relative overflow-hidden select-none border-b-4 border-fk-yellow shadow-md">
        <div className="max-w-[1248px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          
          <div className="flex flex-col text-center md:text-left">
            <span className="bg-fk-yellow text-red-700 font-extrabold uppercase text-xs tracking-wider px-3.5 py-1 rounded-full shadow-sm w-fit mx-auto md:mx-0 animate-bounce">
              ⚡ Limited Time Blockbuster Deals
            </span>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-wide mt-3 mb-2 leading-none drop-shadow">
              SUPER SAVER SALE
            </h1>
            <p className="text-sm md:text-base font-semibold text-amber-100 drop-shadow-sm">
              Grab Mega Discounts on Mobiles, Fashion & Best Selling Electronics!
            </p>
          </div>

          {/* Countdown Clock Widget */}
          <div className="bg-black/45 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-2xl text-center shrink-0 min-w-[280px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 flex items-center justify-center gap-1.5 mb-2.5">
              <Clock className="h-3.5 w-3.5 text-fk-yellow animate-spin" /> Sale Ends In
            </span>
            <div className="flex justify-center items-center gap-3">
              <div>
                <span className="text-2xl md:text-3xl font-black font-mono bg-white text-red-600 px-3 py-1 rounded shadow">
                  {padZero(timeLeft.hours)}
                </span>
                <span className="block text-[9px] uppercase font-bold text-gray-300 mt-1">Hours</span>
              </div>
              <span className="text-xl font-bold leading-none -mt-4">:</span>
              <div>
                <span className="text-2xl md:text-3xl font-black font-mono bg-white text-red-600 px-3 py-1 rounded shadow">
                  {padZero(timeLeft.minutes)}
                </span>
                <span className="block text-[9px] uppercase font-bold text-gray-300 mt-1">Mins</span>
              </div>
              <span className="text-xl font-bold leading-none -mt-4">:</span>
              <div>
                <span className="text-2xl md:text-3xl font-black font-mono bg-white text-red-600 px-3 py-1 rounded shadow">
                  {padZero(timeLeft.seconds)}
                </span>
                <span className="block text-[9px] uppercase font-bold text-gray-300 mt-1">Secs</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Background visual graphics */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Bank Offers Bar Ticker */}
      <div className="bg-fk-dark text-white py-2.5 text-center font-bold text-xs select-none">
        <div className="max-w-[1248px] mx-auto px-4 flex justify-center items-center gap-2 flex-wrap text-amber-200">
          <Award className="h-4.5 w-4.5 text-fk-yellow" />
          <span>BANK OFFER: 10% Instant Discount on SBI Card & HDFC Credit Cards. Min Trx: ₹5,000 *T&C Apply</span>
        </div>
      </div>

      {/* 3. Sale Categories Filter */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm mb-6 sticky top-[53px] z-30">
        <div className="max-w-[1248px] mx-auto px-4 flex justify-center gap-3 md:gap-6 flex-wrap">
          {[
            { label: '🔥 All Sale Deals', slug: '' },
            { label: '📱 Mobiles', slug: 'mobiles' },
            { label: '💻 Electronics', slug: 'electronics' },
            { label: '👟 Fashion', slug: 'fashion' },
            { label: '🏠 Home Essentials', slug: 'home' },
            { label: '🔌 Appliances', slug: 'appliances' }
          ].map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveCategory(tab.slug)}
              className={`px-5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                activeCategory === tab.slug
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Products Grid */}
      <div className="max-w-[1248px] mx-auto px-4">
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-4 h-72 rounded shadow-fk animate-pulse border border-gray-100 flex flex-col justify-between">
                <div className="w-full h-36 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mt-1" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
              </div>
            ))}
          </div>
        ) : saleProducts.length > 0 ? (
          <div className="space-y-6 animate-fade-in">
            
            {/* Grid Header label */}
            <div className="flex justify-between items-center px-1">
              <h2 className="text-base font-extrabold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <Flame className="h-5 w-5 text-red-600 fill-red-600 animate-pulse" /> Blockbuster Discounts (Min 20% Off)
              </h2>
              <span className="text-xs font-bold text-gray-500">
                Found {saleProducts.length} Epic Offers
              </span>
            </div>

            {/* Sale Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {saleProducts.map((prod) => (
                <div key={prod.id} className="relative">
                  {/* Glowing Deal Badge Label overlay */}
                  <div className="absolute top-2 left-2 z-10 bg-red-600 text-white font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border border-red-500">
                    {prod.discountPercent}% OFF DEAL
                  </div>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded shadow-fk border border-gray-100 flex flex-col items-center justify-center">
            <h3 className="font-bold text-gray-800 text-lg mb-2">No Sale Deals Found</h3>
            <p className="text-gray-500 text-sm mb-4">Try choosing another category for blockbuster offers.</p>
            <button
              onClick={() => setActiveCategory('')}
              className="bg-fk-blue text-white text-xs font-bold px-6 py-2.5 rounded shadow-sm hover:shadow cursor-pointer transition-colors"
            >
              Show All Categories
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
