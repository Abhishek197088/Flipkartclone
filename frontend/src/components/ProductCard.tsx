'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const token = useStore((state) => state.token);
  const showToast = useStore((state) => state.showToast);

  const imageUrl = product.images && product.images[0] ? product.images[0].imageUrl : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
  const isWishlisted = wishlist.some((item) => item.productId === product.id);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      showToast('Please login to wishlist items', 'error');
      return;
    }
    toggleWishlist(product.id);
  };

  return (
    <div className="bg-white rounded border border-gray-100 flex flex-col p-3 relative group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
      
      {/* Wishlist Button with Motion Pop */}
      <motion.button
        whileTap={{ scale: 0.7 }}
        whileHover={{ scale: 1.15 }}
        onClick={handleWishlistClick}
        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100 cursor-pointer transition-all"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-400'
          }`}
        />
      </motion.button>

      {/* Link to details */}
      <Link href={`/product/${product.id}`} className="flex flex-col flex-grow cursor-pointer">
        {/* Product Image with Zoom */}
        <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden rounded-sm bg-gray-50 relative">
          <img
            src={imageUrl}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="h-full object-contain max-w-full transition-transform duration-500 group-hover:scale-108"
          />
        </div>

        {/* Brand */}
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
          {product.brand}
        </span>

        {/* Title */}
        <h3 className="text-xs text-gray-800 font-medium line-clamp-2 mt-1 mb-1.5 leading-4 group-hover:text-fk-blue transition-colors">
          {product.title}
        </h3>

        {/* Rating and Flipkart Assured */}
        <div className="flex items-center gap-2 mb-2">
          {product.rating > 0 && (
            <span className="bg-fk-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
              {product.rating} <Star className="h-2.5 w-2.5 fill-white" />
            </span>
          )}
          {product.ratingCount > 0 && (
            <span className="text-[10px] font-semibold text-gray-500">
              ({product.ratingCount.toLocaleString()})
            </span>
          )}
          {product.isAssured && (
            <div className="flex items-center h-4 assured-shine">
              <span className="text-[10px] font-extrabold text-blue-700 italic">f</span>
              <span className="text-[9px] font-extrabold text-fk-orange italic mr-0.5">Assured</span>
            </div>
          )}
        </div>

        {/* Price & Offer Section */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.mrp > product.price && (
            <>
              <span className="text-[11px] text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-semibold text-fk-green">
                {product.discountPercent}% off
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Direct Add to Cart Button (Fades and Slides Up on Hover) */}
      <button
        onClick={handleCartClick}
        className="w-full mt-3 py-1.5 text-xs font-semibold text-white bg-fk-orange hover:bg-amber-600 rounded shadow-sm hover:shadow transition-all border border-transparent flex items-center justify-center gap-1 cursor-pointer transform translate-y-1 md:translate-y-2 opacity-100 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300 active:scale-95"
      >
        Add to Cart
      </button>
    </div>
  );
}
