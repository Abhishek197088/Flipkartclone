'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '../store/useStore';
import CategoryBar from '../components/CategoryBar';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const sectionTitles: Record<string, string> = {
  'mobiles': 'Best Deals on Mobiles',
  'electronics': 'Best of Electronics',
  'fashion': 'Festive Must-haves & Fashion',
  'home': 'Make Your Home Stylish & Furniture',
  'appliances': 'Appliance for Cool Summer & Trimmers',
  'flights': 'Flight Bookings Specials',
  'beauty-toys': 'Beauty, Food, Toys & more',
  'two-wheelers': 'Join The Two Wheelers Craze!'
};

const sectionSubtitles: Record<string, string> = {
  'mobiles': 'Top Selling Smart Phones',
  'electronics': 'Headphones, Smart Watches & Cameras',
  'fashion': 'T-shirts, Sneakers, Sarees & Sunglasses',
  'home': 'Mosquito Nets, Clocks, Bedsheets & Shoe Racks',
  'appliances': 'Air Coolers, Trimmers & Vacuums',
  'flights': 'Indigo & Akasa Domestic Flight Vouchers',
  'beauty-toys': 'Dry Fruits, Dumbbells & Gym Gear',
  'two-wheelers': 'Ola S1 Pro & Electric Scooters'
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const [sort, setSort] = useState('newest');
  
  // Sidebar states
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(200000);

  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts({
      category,
      search,
      sort
    });
  }, [category, search, sort]);

  // Extract unique brands for filtering from search results
  const availableBrands = Array.from(
    new Set(products.map((p: any) => p.brand).filter(Boolean))
  );

  // Filter products locally by sidebar options (Brand, Price Range)
  const filteredProducts = products.filter((p: any) => {
    const brandMatch = selectedBrand ? p.brand === selectedBrand : true;
    const priceMatch = p.price <= maxPrice;
    return brandMatch && priceMatch;
  });

  const isBrowsingCatalog = !!(category || search);

  return (
    <div className="pb-12 bg-[#f1f3f6]">
      {/* 1. Category Bar */}
      <CategoryBar activeSlug={category} />

      {/* 2. Banner Slider (Only show on default home view) */}
      {!isBrowsingCatalog && <BannerSlider />}

      {/* Sale Promotion Banner */}
      {!isBrowsingCatalog && (
        <div className="max-w-[1248px] mx-auto px-4 mb-4">
          <Link href="/sale" className="block w-full overflow-hidden rounded shadow-fk hover:shadow-lg transition-shadow bg-gradient-to-r from-red-600 to-amber-500 py-3.5 px-6 md:px-12 text-white relative group cursor-pointer">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/30">
                  Limited Time Mega Sale
                </span>
                <h3 className="text-xl md:text-2xl font-black italic tracking-wide mt-1.5 leading-none">
                  SUPER SAVER SALE IS LIVE!
                </h3>
                <p className="text-xs text-amber-100 font-semibold mt-1">
                  Enjoy up to <span className="font-extrabold text-white text-sm">60% OFF</span> on Mobiles, Laptops & Home Appliances
                </p>
              </div>
              <div className="flex items-center gap-2 bg-white text-red-600 font-extrabold text-xs px-6 py-2.5 rounded shadow-sm group-hover:scale-105 active:scale-95 transition-all uppercase tracking-wider shrink-0">
                Shop Deals Now!
              </div>
            </div>
            <div className="absolute top-0 right-1/4 bottom-0 w-32 bg-white/5 skew-x-12 pointer-events-none" />
            <div className="absolute top-0 right-1/3 bottom-0 w-12 bg-white/5 skew-x-12 pointer-events-none" />
          </Link>
        </div>
      )}

      <div className="max-w-[1248px] mx-auto px-4">
        {isBrowsingCatalog ? (
          /* SEARCH RESULTS / CATALOG BROWSING LAYOUT */
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Sidebar Filters */}
            <div className="w-full md:w-64 bg-white p-4 rounded shadow-fk shrink-0 h-fit self-start">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-4">
                <SlidersHorizontal className="h-4.5 w-4.5 text-gray-700" />
                <h3 className="font-bold text-sm text-gray-800">Filters</h3>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Price Range</h4>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="2000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-fk-blue"
                />
                <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
                  <span>₹0</span>
                  <span>Max: ₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Brand</h4>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="brandFilter"
                        checked={selectedBrand === ''}
                        onChange={() => setSelectedBrand('')}
                        className="h-3.5 w-3.5 text-fk-blue"
                      />
                      <span>All Brands</span>
                    </label>
                    {availableBrands.map((brand: any) => (
                      <label key={brand} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="brandFilter"
                          checked={selectedBrand === brand}
                          onChange={() => setSelectedBrand(brand)}
                          className="h-3.5 w-3.5 text-fk-blue"
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Products catalog list panel */}
            <div className="flex-1">
              
              {/* Top bar with sorting options */}
              <div className="bg-white p-3 rounded shadow-fk mb-4 flex items-center justify-between gap-4 flex-wrap border-b border-gray-100">
                <span className="text-xs font-bold text-gray-600">
                  Showing {filteredProducts.length} products {search && `for "${search}"`}
                </span>
                
                {/* Sorting Tab options */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-500 font-semibold flex items-center gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" /> Sort By:
                  </span>
                  {[
                    { label: 'Newest', val: 'newest' },
                    { label: 'Price: Low to High', val: 'price_asc' },
                    { label: 'Price: High to Low', val: 'price_desc' },
                    { label: 'Rating', val: 'rating' }
                  ].map((tab) => (
                    <button
                      key={tab.val}
                      onClick={() => setSort(tab.val)}
                      className={`font-bold transition-colors cursor-pointer ${
                        sort === tab.val
                          ? 'text-fk-blue border-b-2 border-fk-blue pb-0.5'
                          : 'text-gray-500 hover:text-fk-blue'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid listings */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white p-4 h-72 rounded shadow-fk animate-pulse border border-gray-100 flex flex-col justify-between">
                      <div className="w-full h-36 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mt-3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1" />
                      <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map((prod: any) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded shadow-fk border border-gray-100 flex flex-col items-center justify-center">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">No matching products found</h3>
                  <p className="text-gray-500 text-sm">Try widening your filters or search terms.</p>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* DEFAULT FLIPKART HOME SECTIONS */
          <div className="space-y-6">
            {categories.map((cat: any) => {
              const catProducts = products.filter((p: any) => p.categoryId === cat.id).slice(0, 4);
              if (catProducts.length === 0) return null;
              
              const title = sectionTitles[cat.slug] || `${cat.name} Deals`;
              const subtitle = sectionSubtitles[cat.slug] || `Top Selling ${cat.name} Products`;

              return (
                <div key={cat.id} className="bg-white rounded shadow-fk border border-gray-100 overflow-hidden">
                  
                  {/* Section Title */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <div>
                      <h2 className="text-base font-bold text-gray-800 tracking-wide uppercase">
                        {title}
                      </h2>
                      <span className="text-[11px] font-semibold text-gray-400">
                        {subtitle}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/?category=${cat.slug}`)}
                      className="bg-fk-blue hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-sm shadow-sm hover:shadow cursor-pointer transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  {/* Horizontal Scroll Grid of Products */}
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {catProducts.map((p: any) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-semibold">Loading Page Content...</div>}>
      <HomeContent />
    </Suspense>
  );
}
