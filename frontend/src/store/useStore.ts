import { create } from 'zustand';
import API from '../services/api';

interface State {
  user: any | null;
  token: string | null;
  cart: any[];
  wishlist: any[];
  categories: any[];
  products: any[];
  stats: any | null;
  adminOrders: any[];
  adminUsers: any[];
  loading: boolean;
  toast: { message: string; type: 'success' | 'error' | '' } | null;

  // Actions
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: () => void;
  fetchMe: () => Promise<void>;
  login: (credentials: any) => Promise<boolean>;
  register: (userDetails: any) => Promise<boolean>;
  logout: () => void;
  saveAddress: (address: any) => Promise<boolean>;
  
  // Products/Categories
  fetchCategories: () => Promise<void>;
  fetchProducts: (params?: { category?: string; search?: string; sort?: string }) => Promise<void>;
  
  // Cart
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartQty: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
  
  // Wishlist
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  
  // Admin
  adminFetchStats: () => Promise<void>;
  adminFetchOrders: () => Promise<void>;
  adminFetchUsers: () => Promise<void>;
  adminUpdateOrderStatus: (orderId: string, payload: any) => Promise<void>;
  adminCreateProduct: (productPayload: any) => Promise<boolean>;
  adminUpdateProduct: (productId: string, productPayload: any) => Promise<boolean>;
  adminDeleteProduct: (productId: string) => Promise<boolean>;
}

export const useStore = create<State>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('fk_token') : null,
  cart: [],
  wishlist: [],
  categories: [],
  products: [],
  stats: null,
  adminOrders: [],
  adminUsers: [],
  loading: false,
  toast: null,

  showToast: (message, type) => {
    set({ toast: { message, type } });
    setTimeout(() => {
      get().hideToast();
    }, 3000);
  },

  hideToast: () => set({ toast: null }),

  fetchMe: async () => {
    try {
      set({ loading: true });
      const res = await API.get('/auth/me');
      set({ user: res.data });
    } catch (err) {
      console.error('Fetch me failed', err);
    } finally {
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    try {
      set({ loading: true });
      const res = await API.post('/auth/login', credentials);
      const { token, user } = res.data;
      localStorage.setItem('fk_token', token);
      set({ token, user });
      get().showToast('Logged in successfully!', 'success');
      // Fetch cart and wishlist right after logging in
      get().fetchCart();
      get().fetchWishlist();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      get().showToast(msg, 'error');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  register: async (userDetails) => {
    try {
      set({ loading: true });
      const res = await API.post('/auth/register', userDetails);
      const { token, user } = res.data;
      localStorage.setItem('fk_token', token);
      set({ token, user });
      get().showToast('Registered successfully!', 'success');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      get().showToast(msg, 'error');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('fk_token');
    set({ user: null, token: null, cart: [], wishlist: [], adminOrders: [], adminUsers: [], stats: null });
    get().showToast('Logged out successfully', 'success');
  },

  saveAddress: async (address) => {
    try {
      const res = await API.post('/auth/address', address);
      if (res.status === 201) {
        get().showToast('Address saved successfully!', 'success');
        get().fetchMe(); // Refresh profile/addresses
        return true;
      }
      return false;
    } catch (err: any) {
      get().showToast(err.response?.data?.message || 'Error saving address', 'error');
      return false;
    }
  },

  fetchCategories: async () => {
    try {
      const res = await API.get('/products/categories');
      set({ categories: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchProducts: async (params) => {
    try {
      set({ loading: true });
      const res = await API.get('/products', { params });
      set({ products: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },

  fetchCart: async () => {
    try {
      const res = await API.get('/cart');
      set({ cart: res.data });
    } catch (err) {
      console.error('Fetch cart failed', err);
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      await API.post('/cart', { productId, quantity });
      get().showToast('Added to Cart!', 'success');
      get().fetchCart();
    } catch (err: any) {
      get().showToast('Error adding to cart', 'error');
    }
  },

  updateCartQty: async (cartItemId, quantity) => {
    try {
      await API.put(`/cart/${cartItemId}`, { quantity });
      get().fetchCart();
    } catch (err) {
      console.error(err);
    }
  },

  removeFromCart: async (cartItemId) => {
    try {
      await API.delete(`/cart/${cartItemId}`);
      get().showToast('Removed from Cart', 'success');
      get().fetchCart();
    } catch (err) {
      console.error(err);
    }
  },

  clearCart: () => {
    set({ cart: [] });
  },

  fetchWishlist: async () => {
    try {
      const res = await API.get('/wishlist');
      set({ wishlist: res.data });
    } catch (err) {
      console.error('Fetch wishlist failed', err);
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const wishlist = get().wishlist;
      const existing = wishlist.find((item: any) => item.productId === productId);
      if (existing) {
        await API.delete(`/wishlist/${existing.id}`);
        get().showToast('Removed from Wishlist', 'success');
      } else {
        await API.post('/wishlist', { productId });
        get().showToast('Added to Wishlist!', 'success');
      }
      get().fetchWishlist();
    } catch (err) {
      get().showToast('Error toggling wishlist', 'error');
    }
  },

  // Admin Dashboard Actions
  adminFetchStats: async () => {
    try {
      const res = await API.get('/orders/admin/dashboard');
      set({ stats: res.data });
    } catch (err) {
      console.error('Fetch admin stats failed', err);
    }
  },

  adminFetchOrders: async () => {
    try {
      const res = await API.get('/orders/admin/all');
      set({ adminOrders: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  adminFetchUsers: async () => {
    try {
      const res = await API.get('/auth/admin/users');
      set({ adminUsers: res.data });
    } catch (err) {
      console.error(err);
    }
  },

  adminUpdateOrderStatus: async (orderId, payload) => {
    try {
      await API.put(`/orders/admin/status/${orderId}`, payload);
      get().showToast('Order status updated!', 'success');
      get().adminFetchOrders();
      get().adminFetchStats();
    } catch (err) {
      get().showToast('Error updating status', 'error');
    }
  },

  adminCreateProduct: async (productPayload) => {
    try {
      await API.post('/products', productPayload);
      get().showToast('Product added successfully!', 'success');
      get().fetchProducts();
      return true;
    } catch (err) {
      get().showToast('Error adding product', 'error');
      return false;
    }
  },

  adminUpdateProduct: async (productId, productPayload) => {
    try {
      await API.put(`/products/${productId}`, productPayload);
      get().showToast('Product updated successfully!', 'success');
      get().fetchProducts();
      return true;
    } catch (err) {
      get().showToast('Error updating product', 'error');
      return false;
    }
  },

  adminDeleteProduct: async (productId) => {
    try {
      await API.delete(`/products/${productId}`);
      get().showToast('Product deleted', 'success');
      get().fetchProducts();
      return true;
    } catch (err) {
      get().showToast('Error deleting product', 'error');
      return false;
    }
  }
}));
