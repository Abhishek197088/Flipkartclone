'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '../../store/useStore';
import { Heart, Star, Trash2, ShoppingCart } from 'lucide-react';

export default function WishlistPage() {
  const token = useStore((state) => state.token);
  const wishlist = useStore((state) => state.wishlist);
  const fetchWishlist = useStore((state) => state.fetchWishlist);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    if (token) {
      fetchWishlist();
    }
  }, [token]);

  if (!token) {
    return (
      <div className="bg-[#f1f3f6] min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded shadow-fk border border-gray-100 max-w-sm w-full text-center">
          <h3 className="text-lg font-bold text-gray-800 mb-2">Please login to view wishlist</h3>
          <p className="text-xs text-gray-400 font-semibold mb-6">Login to sync your saved items across devices.</p>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="bg-[#f1f3f6] min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded shadow-fk border border-gray-100 max-w-md w-full text-center flex flex-col items-center">
          <Heart className="h-16 w-16 text-gray-300 mb-4 stroke-1 fill-gray-50 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">Your wishlist is empty!</h3>
          <p className="text-xs text-gray-400 font-semibold mb-6">Save products you like to purchase them later.</p>
          <Link
            href="/"
            className="bg-fk-blue hover:bg-blue-600 text-white font-bold text-sm px-10 py-2.5 rounded shadow-sm hover:shadow cursor-pointer transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f6] pb-12 pt-4 min-h-[80vh]">
      <div className="max-w-[1248px] mx-auto px-4">
        
        <div className="bg-white rounded shadow-fk border border-gray-100 overflow-hidden">
          
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" /> My Wishlist ({wishlist.length} Items)
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {wishlist.map((item) => {
              const prod = item.product;
              if (!prod) return null;
              const img = prod.images && prod.images[0] ? prod.images[0].imageUrl : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';

              return (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-gray-50/50 transition-colors">
                  
                  {/* Image */}
                  <Link href={`/product/${prod.id}`} className="w-20 h-20 shrink-0 flex items-center justify-center bg-white border border-gray-100 rounded p-1">
                    <img
                      src={img}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  {/* details */}
                  <div className="flex-1">
                    <Link href={`/product/${prod.id}`} className="text-sm font-semibold text-gray-800 hover:text-fk-blue line-clamp-2">
                      {prod.title}
                    </Link>

                    {/* Ratings */}
                    <div className="flex items-center gap-2 mt-1.5 mb-2">
                      {prod.rating > 0 && (
                        <span className="bg-fk-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                          {prod.rating} <Star className="h-2.5 w-2.5 fill-white" />
                        </span>
                      )}
                      {prod.ratingCount > 0 && (
                        <span className="text-[10px] font-semibold text-gray-400">
                          ({prod.ratingCount})
                        </span>
                      )}
                    </div>

                    {/* Prices */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-bold text-gray-900">
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

                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-3.5 w-full sm:w-auto mt-4 sm:mt-0 items-center justify-between sm:justify-center">
                    
                    {/* Add to Cart */}
                    <button
                      onClick={() => addToCart(prod.id, 1)}
                      className="bg-fk-orange hover:bg-amber-600 text-white font-bold text-xs py-2 px-6 rounded shadow-sm hover:shadow cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors border border-rose-200 rounded px-3 py-1.5 hover:bg-rose-50 bg-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
