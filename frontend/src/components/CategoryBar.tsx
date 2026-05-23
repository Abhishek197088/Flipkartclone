'use client';

import React from 'react';
import Link from 'next/link';

const categoriesList = [
  { name: 'All Products', slug: '', imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=128&q=80' },
  { name: 'Mobiles', slug: 'mobiles', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=128&q=80' },
  { name: 'Electronics', slug: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=128&q=80' },
  { name: 'Fashion', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=128&q=80' },
  { name: 'Home & Furniture', slug: 'home', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=128&q=80' },
  { name: 'Appliances', slug: 'appliances', imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=128&q=80' },
  { name: 'Flight Bookings', slug: 'flights', imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&q=80' },
  { name: 'Beauty, Toys & More', slug: 'beauty-toys', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=128&q=80' },
  { name: 'Two Wheelers', slug: 'two-wheelers', imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=128&q=80' }
];

export default function CategoryBar({ activeSlug }: { activeSlug?: string }) {
  return (
    <div className="bg-white shadow-fk border-b border-gray-200 py-3 mb-4 overflow-x-auto">
      <div className="max-w-[1248px] mx-auto px-4 flex justify-between md:justify-center gap-6 md:gap-12 min-w-max">
        {categoriesList.map((cat) => {
          const isActive = activeSlug === cat.slug;
          return (
            <Link
              key={cat.name}
              href={cat.slug ? `/?category=${cat.slug}` : '/'}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div
                className={`w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-50 transition-transform group-hover:scale-105 ${
                  isActive ? 'border-fk-blue shadow-sm' : 'border-transparent'
                }`}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span
                className={`text-xs font-semibold select-none group-hover:text-fk-blue transition-colors ${
                  isActive ? 'text-fk-blue' : 'text-gray-700'
                }`}
              >
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
