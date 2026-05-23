'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, User as UserIcon, Heart, ClipboardList, LogOut, ShieldAlert, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Zustand Store variables
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const cart = useStore((state) => state.cart);
  const login = useStore((state) => state.login);
  const register = useStore((state) => state.register);
  const logout = useStore((state) => state.logout);
  const fetchMe = useStore((state) => state.fetchMe);
  const fetchCart = useStore((state) => state.fetchCart);
  const fetchWishlist = useStore((state) => state.fetchWishlist);
  const showToast = useStore((state) => state.showToast);

  // Cart animation trigger
  const [cartBounced, setCartBounced] = useState(false);
  const cartQuantitySum = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (token) {
      fetchMe();
      fetchCart();
      fetchWishlist();
    }
  }, [token]);

  useEffect(() => {
    if (cartQuantitySum > 0) {
      setCartBounced(true);
      const timer = setTimeout(() => setCartBounced(false), 450);
      return () => clearTimeout(timer);
    }
  }, [cartQuantitySum]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${searchQuery}`);
    } else {
      router.push('/');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginView) {
      const success = await login({ email, password });
      if (success) {
        setShowAuthModal(false);
        resetAuthForm();
      }
    } else {
      if (password !== confirmPassword) {
        showToast("Passwords don't match!", "error");
        return;
      }
      const success = await register({ email, password, name, phone });
      if (success) {
        setShowAuthModal(false);
        resetAuthForm();
      }
    }
  };

  const resetAuthForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setConfirmPassword('');
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    router.push('/');
  };

  return (
    <>
      <header className="bg-fk-blue text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-[1248px] mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex flex-col select-none cursor-pointer group">
            <span className="text-xl font-bold italic tracking-wide leading-5 font-sans group-hover:scale-[1.02] transition-transform">
              Flipkart
            </span>
            <div className="flex items-center gap-0.5 text-[11px] italic font-semibold text-gray-100">
              <span>Explore</span>
              <span className="text-fk-yellow font-bold">Plus</span>
              <span className="text-fk-yellow text-[13px] font-black leading-3 ml-0.5 group-hover:rotate-12 transition-transform">★</span>
            </div>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-[600px] relative">
            <input
              type="text"
              placeholder="Search for products, brands and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-800 placeholder-gray-400 pl-4 pr-11 py-2 rounded-sm shadow-sm focus:outline-none text-sm font-medium transition-all duration-300 focus:shadow-[0_0_12px_rgba(255,255,255,0.4)] focus:ring-1 focus:ring-white/40"
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-3.5 text-fk-blue hover:scale-110 active:scale-95 transition-transform">
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Nav Items */}
          <div className="flex items-center gap-6 md:gap-8">
            
            {/* User Login/Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="bg-white text-fk-blue font-semibold px-4 py-1 rounded-sm text-sm hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-all shadow-sm active:scale-95"
                  >
                    <span>{user.name.split(' ')[0]}</span>
                    <span className={`text-[10px] transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showUserDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2.5 w-52 bg-white rounded shadow-lg border border-gray-100 text-gray-800 z-50 py-1"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          <UserIcon className="h-4 w-4 text-fk-blue" />
                          <span>My Profile</span>
                        </Link>
                        
                        <Link
                          href="/wishlist"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          <Heart className="h-4 w-4 text-rose-500" />
                          <span>Wishlist</span>
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 border-b border-gray-100 transition-colors"
                        >
                          <ClipboardList className="h-4 w-4 text-fk-orange" />
                          <span>My Orders</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserDropdown(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-amber-50 border-b border-gray-100 text-amber-700 transition-colors"
                          >
                            <ShieldAlert className="h-4 w-4 text-amber-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-rose-50 text-rose-600 text-left transition-colors"
                        >
                          <LogOut className="h-4 w-4 text-rose-500" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginView(true);
                    setShowAuthModal(true);
                  }}
                  className="bg-white text-fk-blue font-bold px-7 py-1 rounded-sm text-sm hover:bg-gray-50 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  Login
                </button>
              )}
            </div>

            {/* Super Sale Link */}
            <Link
              href="/sale"
              className="flex items-center gap-1.5 font-bold text-sm cursor-pointer text-fk-yellow hover:text-white transition-colors animate-pulse bg-red-600/20 px-2.5 py-1 rounded border border-red-500/40 hover:scale-105 active:scale-95"
            >
              <span>🔥 Super Sale</span>
            </Link>

            {/* Wishlist Link (for guests too) */}
            <Link href="/wishlist" className="flex items-center gap-1.5 font-bold text-sm cursor-pointer hover:text-gray-100 hover:scale-105 active:scale-95 transition-all">
              <Heart className="h-4.5 w-4.5 hover:text-rose-500 transition-colors" />
              <span className="hidden md:inline">Wishlist</span>
            </Link>

            {/* Orders Link (for guests too) */}
            <Link href="/orders" className="flex items-center gap-1.5 font-bold text-sm cursor-pointer hover:text-gray-100 hover:scale-105 active:scale-95 transition-all">
              <ClipboardList className="h-4.5 w-4.5 hover:text-fk-yellow transition-colors" />
              <span className="hidden md:inline">Orders</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-1.5 font-bold text-sm cursor-pointer hover:text-gray-100 hover:scale-105 active:scale-95 transition-all">
              <div className="relative">
                <ShoppingCart className={`h-5 w-5 ${cartBounced ? 'animate-cart-bounce' : ''}`} />
                {cartQuantitySum > 0 && (
                  <span className="absolute -top-2.5 -right-2 bg-fk-orange text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-fk-blue animate-pulse">
                    {cartQuantitySum}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Cart</span>
            </Link>

          </div>
        </div>
      </header>

      {/* Login / Register Modal Popup */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAuthModal(false);
                resetAuthForm();
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="bg-white w-full max-w-[650px] h-[450px] rounded shadow-2xl overflow-hidden flex relative z-10"
            >
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  resetAuthForm();
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 hover:scale-110 transition-all z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Left Side Banner (Flipkart Blue Style) */}
              <div className="hidden md:flex w-2/5 bg-fk-blue p-8 flex-col justify-between text-white select-none">
                <div>
                  <h2 className="text-xl font-bold mb-3">
                    {isLoginView ? 'Login' : 'Looks like you\'re new here!'}
                  </h2>
                  <p className="text-xs text-gray-200 leading-relaxed font-semibold">
                    {isLoginView
                      ? 'Get access to your Orders, Wishlist and Recommendations'
                      : 'Sign up with your email to get started'}
                  </p>
                </div>
                <div className="text-[10px] text-blue-200 font-bold italic">
                  Flipkart Clone
                </div>
              </div>

              {/* Right Side Form Panel */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <form onSubmit={handleAuthSubmit} className="flex-col flex gap-4 mt-4">
                  
                  {!isLoginView && (
                    <>
                      <input
                        type="text"
                        placeholder="Enter Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full border-b border-gray-300 py-1.5 focus:border-fk-blue text-sm focus:outline-none font-semibold text-gray-800 placeholder-gray-400 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Enter Mobile Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border-b border-gray-300 py-1.5 focus:border-fk-blue text-sm focus:outline-none font-semibold text-gray-800 placeholder-gray-400 transition-colors"
                      />
                    </>
                  )}

                  <input
                    type="email"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border-b border-gray-300 py-1.5 focus:border-fk-blue text-sm focus:outline-none font-semibold text-gray-800 placeholder-gray-400 transition-colors"
                  />

                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border-b border-gray-300 py-1.5 focus:border-fk-blue text-sm focus:outline-none font-semibold text-gray-800 placeholder-gray-400 transition-colors"
                  />

                  {!isLoginView && (
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full border-b border-gray-300 py-1.5 focus:border-fk-blue text-sm focus:outline-none font-semibold text-gray-800 placeholder-gray-400 transition-colors"
                    />
                  )}

                  <button
                    type="submit"
                    className="w-full bg-fk-orange hover:bg-amber-600 text-white font-bold py-2.5 rounded shadow-sm text-sm hover:scale-[1.01] active:scale-95 transition-all mt-4 cursor-pointer"
                  >
                    {isLoginView ? 'Login' : 'Signup'}
                  </button>
                </form>

                {/* View Switch Link */}
                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setIsLoginView(!isLoginView);
                      resetAuthForm();
                    }}
                    className="text-xs text-fk-blue font-bold hover:underline"
                  >
                    {isLoginView
                      ? 'New to Flipkart? Create an account'
                      : 'Existing User? Log in to your account'}
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
