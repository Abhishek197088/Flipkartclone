'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import API from '../../../services/api';
import { Star, ShoppingCart, Zap, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Accordion toggle states
  const [showSpecs, setShowSpecs] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  const addToCart = useStore((state) => state.addToCart);
  const toggleWishlist = useStore((state) => state.toggleWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const token = useStore((state) => state.token);
  const showToast = useStore((state) => state.showToast);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${productId}`);
      setProduct(res.data);
      if (res.data.images && res.data.images.length > 0) {
        setActiveImage(res.data.images[0].imageUrl);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading product details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-24 flex flex-col justify-center items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-fk-blue" />
        <span className="text-xs font-bold text-gray-500 tracking-wide animate-pulse">Loading Product Catalog Details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-12 text-center">
        <h3 className="font-bold text-lg text-gray-800">Product not found.</h3>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.productId === product.id);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const handleBuyNow = () => {
    addToCart(product.id, 1);
    router.push('/cart');
  };

  const handleWishlistToggle = () => {
    if (!token) {
      showToast('Please login to wishlist products', 'error');
      return;
    }
    toggleWishlist(product.id);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showToast('Please login to post reviews', 'error');
      return;
    }
    if (!reviewComment.trim()) {
      showToast('Review comment cannot be empty', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      await API.post('/reviews', {
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment
      });
      showToast('Review posted successfully!', 'success');
      setReviewComment('');
      setReviewRating(5);
      fetchProductDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error posting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-[#f1f3f6] pb-12 pt-4">
      <div className="max-w-[1248px] mx-auto px-4 bg-white rounded shadow-fk p-6 flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Images & Action Buttons */}
        <div className="w-full md:w-[40%] flex flex-col items-center">
          
          {/* Main Display Image (With Fade Switch Transition) */}
          <div className="w-full h-80 md:h-[400px] border border-gray-100 rounded-md p-4 flex items-center justify-center bg-white relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={activeImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain"
              />
            </AnimatePresence>

            {/* Wishlist Heart Badge Overlay */}
            <motion.button
              whileTap={{ scale: 0.7 }}
              whileHover={{ scale: 1.1 }}
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 cursor-pointer"
            >
              <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} />
            </motion.button>
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto w-full py-1">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`w-14 h-14 border rounded p-1 bg-white hover:border-fk-blue transition-colors overflow-hidden shrink-0 cursor-pointer ${
                    activeImage === img.imageUrl ? 'border-fk-blue shadow-sm' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt="Product thumbnail"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* ADD TO CART & BUY NOW Buttons */}
          <div className="flex gap-3 w-full mt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#ff9f00] hover:bg-amber-600 text-white font-bold py-3.5 rounded shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer transition-all active:scale-95"
            >
              <ShoppingCart className="h-4.5 w-4.5" /> ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 bg-[#fb641b] hover:bg-orange-600 text-white font-bold py-3.5 rounded shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm cursor-pointer transition-all active:scale-95 animate-pulse-button"
            >
              <Zap className="h-4.5 w-4.5 fill-white" /> BUY NOW
            </button>
          </div>

        </div>

        {/* Right Side: Product Details & Specifications */}
        <div className="flex-1 flex flex-col">
          
          {/* Breadcrumb / Brand */}
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {product.brand}
          </span>

          {/* Title */}
          <h1 className="text-lg md:text-xl font-medium text-gray-800 mt-1 leading-6">
            {product.title}
          </h1>

          {/* Ratings Summary & Flipkart Assured */}
          <div className="flex items-center gap-2.5 mt-2 mb-4 flex-wrap">
            {product.rating > 0 && (
              <span className="bg-fk-green text-white text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                {product.rating} <Star className="h-2.5 w-2.5 fill-white" />
              </span>
            )}
            {product.ratingCount > 0 && (
              <span className="text-xs text-gray-500 font-semibold">
                {product.ratingCount.toLocaleString()} Ratings & Reviews
              </span>
            )}
            {product.isAssured && (
              <div className="flex items-center h-4 assured-shine">
                <span className="text-[11px] font-extrabold text-blue-700 italic">f</span>
                <span className="text-[10px] font-extrabold text-fk-orange italic mr-0.5">Assured</span>
              </div>
            )}
          </div>

          {/* Price details */}
          <div className="flex items-baseline gap-3 mb-6 bg-emerald-50/50 p-3 rounded border border-emerald-100/50 w-fit">
            <span className="text-2xl font-bold text-gray-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-bold text-fk-green">
                  {product.discountPercent}% off
                </span>
              </>
            )}
          </div>

          {/* Accordion: Product Description */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="w-full flex justify-between items-center text-sm font-bold text-gray-800 pb-2 cursor-pointer focus:outline-none"
            >
              <span>Product Description</span>
              <span className="text-xs text-fk-blue font-bold">{showDescription ? 'Hide' : 'Show'}</span>
            </button>
            
            <AnimatePresence initial={false}>
              {showDescription && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold mt-2">
                    {product.description || 'No description available.'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Accordion: Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mb-8 border-b border-gray-100 pb-4">
              <button
                onClick={() => setShowSpecs(!showSpecs)}
                className="w-full flex justify-between items-center text-sm font-bold text-gray-800 pb-2 cursor-pointer focus:outline-none"
              >
                <span>Specifications</span>
                <span className="text-xs text-fk-blue font-bold">{showSpecs ? 'Hide' : 'Show'}</span>
              </button>

              <AnimatePresence initial={false}>
                {showSpecs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, val]: any, idx) => (
                            <tr
                              key={key}
                              className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                            >
                              <td className="w-1/3 px-4 py-3 font-semibold text-gray-500 border-r border-gray-200">
                                {key}
                              </td>
                              <td className="px-4 py-3 font-bold text-gray-800">
                                {val}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">
              Customer Reviews ({product.reviews?.length || 0})
            </h3>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4 mb-6">
                {product.reviews.map((rev: any) => (
                  <div key={rev.id} className="border-b border-gray-100 pb-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-fk-green text-white text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        {rev.rating} <Star className="h-2 w-2 fill-white" />
                      </span>
                      <span className="text-[11px] font-bold text-gray-700">
                        {rev.user?.name || 'Anonymous User'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 font-semibold">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-semibold mb-6">No reviews yet for this product. Be the first to review!</p>
            )}

            {/* Submit a Review Form */}
            {token ? (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-4 rounded border border-gray-200">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Write a Product Review</h4>
                
                {/* Rating Input */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-gray-600">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-4.5 w-4.5 ${
                            star <= reviewRating
                              ? 'text-fk-orange fill-fk-orange'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Input */}
                <div className="flex flex-col gap-1.5">
                  <textarea
                    rows={3}
                    placeholder="Enter review comments..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded p-2 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-fk-blue bg-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-fit self-end bg-fk-blue hover:bg-blue-600 text-white font-bold text-xs px-5 py-2 rounded shadow-sm hover:shadow cursor-pointer transition-all disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 p-4 rounded text-center border border-gray-100">
                <span className="text-xs text-gray-500 font-semibold">Please log in to add reviews.</span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
