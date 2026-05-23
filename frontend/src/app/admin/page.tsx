'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import {
  LayoutDashboard,
  PackagePlus,
  ShoppingBag,
  Users,
  TrendingUp,
  Boxes,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  X
} from 'lucide-react';
import API from '../../services/api';

export default function AdminPage() {
  const router = useRouter();
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);
  
  // Zustand Admin actions
  const stats = useStore((state) => state.stats);
  const adminOrders = useStore((state) => state.adminOrders);
  const adminUsers = useStore((state) => state.adminUsers);
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);

  const adminFetchStats = useStore((state) => state.adminFetchStats);
  const adminFetchOrders = useStore((state) => state.adminFetchOrders);
  const adminFetchUsers = useStore((state) => state.adminFetchUsers);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const fetchCategories = useStore((state) => state.fetchCategories);
  const adminUpdateOrderStatus = useStore((state) => state.adminUpdateOrderStatus);
  const adminCreateProduct = useStore((state) => state.adminCreateProduct);
  const adminUpdateProduct = useStore((state) => state.adminUpdateProduct);
  const adminDeleteProduct = useStore((state) => state.adminDeleteProduct);
  const showToast = useStore((state) => state.showToast);

  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'users'>('stats');

  // Modal management
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [specifications, setSpecifications] = useState<string>('{}');

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      if (user.role !== 'admin') {
        router.push('/');
        showToast('Access denied. Admin permissions required.', 'error');
        return;
      }
      // Fetch all required data
      adminFetchStats();
      adminFetchOrders();
      adminFetchUsers();
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-[1248px] mx-auto px-4 py-12 text-center text-gray-500 font-bold">
        Verifying administrator credentials...
      </div>
    );
  }

  // Open modal for new product
  const handleOpenAddModal = () => {
    setEditingProductId(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setMrp('');
    setBrand('');
    setStock('');
    setCategoryId(categories[0]?.id || '');
    setImgUrl('');
    setSpecifications('{}');
    setShowProductModal(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (prod: any) => {
    setEditingProductId(prod.id);
    setTitle(prod.title);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setMrp(prod.mrp.toString());
    setBrand(prod.brand);
    setStock(prod.stock.toString());
    setCategoryId(prod.categoryId);
    setImgUrl(prod.images && prod.images[0] ? prod.images[0].imageUrl : '');
    setSpecifications(JSON.stringify(prod.specifications || {}));
    setShowProductModal(true);
  };

  // Submit Product Create/Edit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !categoryId) {
      showToast('Title, price, and category are required', 'error');
      return;
    }

    let specsObj = {};
    try {
      specsObj = JSON.parse(specifications);
    } catch (err) {
      showToast('Specifications must be valid JSON object format (e.g. {"Key": "Value"})', 'error');
      return;
    }

    const payload = {
      title,
      description,
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price),
      brand: brand || 'Generic',
      stock: Number(stock || 0),
      categoryId,
      specifications: specsObj,
      images: imgUrl ? [imgUrl] : []
    };

    let success = false;
    if (editingProductId) {
      success = await adminUpdateProduct(editingProductId, payload);
    } else {
      success = await adminCreateProduct(payload);
    }

    if (success) {
      setShowProductModal(false);
      adminFetchStats(); // Refresh dashboard product counters
    }
  };

  const handleProductDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const success = await adminDeleteProduct(id);
      if (success) {
        adminFetchStats();
      }
    }
  };

  const handleOrderStatusUpdate = (orderId: string, status: string) => {
    adminUpdateOrderStatus(orderId, { orderStatus: status });
  };

  const handlePaymentStatusUpdate = (orderId: string, status: string) => {
    adminUpdateOrderStatus(orderId, { paymentStatus: status });
  };

  return (
    <div className="bg-[#f1f3f6] min-h-[85vh] py-6">
      <div className="max-w-[1248px] mx-auto px-4 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 bg-white rounded shadow-fk border border-gray-100 p-4 self-start space-y-1.5">
          <div className="px-4 py-2 border-b border-gray-100 mb-3">
            <h3 className="font-extrabold text-[11px] text-gray-400 uppercase tracking-widest">Admin Control</h3>
          </div>
          
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-blue-50 text-fk-blue'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" /> Dashboard Stats
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-blue-50 text-fk-blue'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Boxes className="h-4.5 w-4.5" /> Manage Products
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-blue-50 text-fk-blue'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="h-4.5 w-4.5" /> Manage Orders
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-50 text-fk-blue'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="h-4.5 w-4.5" /> Manage Users
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 bg-white rounded shadow-fk border border-gray-100 p-6 min-h-[500px]">
          
          {/* TAB 1: DASHBOARD STATS */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-8 animate-fade-in">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2.5">Dashboard Overview</h2>
              
              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 text-gray-700 font-bold shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-fk-blue">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Revenue</span>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900">₹{stats.stats?.totalSales.toLocaleString('en-IN')}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-1">Total Sales Amount</span>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-5 text-gray-700 font-bold shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-fk-green">
                    <ShoppingBag className="h-6 w-6" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Orders</span>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900">{stats.stats?.totalOrders}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-1">Transactions Placed</span>
                </div>

                <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-5 text-gray-700 font-bold shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-fk-orange">
                    <Boxes className="h-6 w-6" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Catalog</span>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900">{stats.stats?.totalProducts}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-1">Active Products</span>
                </div>

                <div className="bg-violet-50/50 border border-violet-100 rounded-lg p-5 text-gray-700 font-bold shadow-sm">
                  <div className="flex items-center justify-between mb-3 text-violet-600">
                    <Users className="h-6 w-6" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Customers</span>
                  </div>
                  <span className="text-xl font-extrabold text-gray-900">{stats.stats?.totalUsers}</span>
                  <span className="block text-[10px] text-gray-400 font-semibold mt-1">Registered Accounts</span>
                </div>
              </div>

              {/* Group Category chart simulation */}
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Product Volume by Category</h3>
                <div className="border border-gray-200 rounded divide-y divide-gray-200">
                  {stats.categories?.map((cat: any) => (
                    <div key={cat.id} className="p-3.5 flex justify-between items-center text-xs font-semibold text-gray-700 bg-gray-50/30">
                      <span>{cat.name}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-800">{cat.productCount} Products</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-800">Manage Catalog Products ({products.length})</h2>
                <button
                  onClick={handleOpenAddModal}
                  className="bg-fk-green hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </div>

              {/* Table List of Products */}
              <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                      <th className="p-3">Product Details</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Price (MRP)</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {products.map((prod) => {
                      const img = prod.images && prod.images[0] ? prod.images[0].imageUrl : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100';
                      return (
                        <tr key={prod.id} className="hover:bg-gray-50/50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={img} alt="" className="h-10 w-10 object-contain shrink-0 border border-gray-100 rounded bg-white p-0.5" />
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 line-clamp-1">{prod.title}</span>
                              <span className="text-[10px] text-gray-400">Category: {prod.category?.name}</span>
                            </div>
                          </td>
                          <td className="p-3 uppercase text-[10px] font-bold text-gray-500">{prod.brand}</td>
                          <td className="p-3">
                            <div>₹{prod.price.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-gray-400 line-through">₹{prod.mrp.toLocaleString('en-IN')}</div>
                          </td>
                          <td className="p-3">
                            <span className={prod.stock === 0 ? 'text-rose-600 font-bold' : 'text-gray-800'}>
                              {prod.stock} Items
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(prod)}
                                className="w-8 h-8 rounded bg-blue-50 text-fk-blue flex items-center justify-center hover:bg-blue-100 cursor-pointer transition-colors border border-blue-100"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleProductDelete(prod.id)}
                                className="w-8 h-8 rounded bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 cursor-pointer transition-colors border border-rose-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">Manage Customer Orders ({adminOrders.length})</h2>
              
              <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Delivery Status</th>
                      <th className="p-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {adminOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono font-bold select-all text-gray-800">{order.id}</td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800">{order.user?.name}</span>
                            <span className="text-[10px] text-gray-400">{order.user?.email}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-gray-800">₹{order.finalAmount.toLocaleString('en-IN')}</td>
                        
                        {/* Delivery Status Selector */}
                        <td className="p-3">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                            className="border border-gray-300 rounded px-2.5 py-1 focus:outline-none focus:border-fk-blue bg-white font-bold text-gray-800 text-[11px] cursor-pointer"
                          >
                            <option value="Placed">Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>

                        {/* Payment Status Selector */}
                        <td className="p-3">
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                            className="border border-gray-300 rounded px-2.5 py-1 focus:outline-none focus:border-fk-blue bg-white font-bold text-gray-800 text-[11px] cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">Registered Customers ({adminUsers.length})</h2>

              <div className="overflow-x-auto border border-gray-200 rounded shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200">
                      <th className="p-3">User Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Mobile Contact</th>
                      <th className="p-3">Date Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                    {adminUsers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-800">{cust.name}</td>
                        <td className="p-3 select-all text-gray-600">{cust.email}</td>
                        <td className="p-3 text-gray-600">{cust.phone || 'Not Added'}</td>
                        <td className="p-3 text-gray-400">
                          {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Product Add/Edit Modal Popup */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-[650px] max-h-[90vh] rounded shadow-2xl overflow-y-auto p-6 relative animate-scale-up">
            
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide border-b border-gray-100 pb-3 mb-4">
              {editingProductId ? 'Edit Catalog Product' : 'Add New Catalog Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Title</label>
                  <input
                    type="text"
                    placeholder="Enter product title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Brand</label>
                  <input
                    type="text"
                    placeholder="Enter Brand Name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter actual selling price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter Max Retail Price"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Stock Count</label>
                  <input
                    type="number"
                    placeholder="Enter inventory stock"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:border-fk-blue cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Product Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Enter product description summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Technical Specifications (JSON format)</label>
                <textarea
                  rows={3}
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 font-mono text-xs font-semibold text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-fk-blue w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-fk-orange hover:bg-amber-600 text-white font-bold py-2.5 rounded shadow text-xs transition-all mt-4 cursor-pointer"
              >
                {editingProductId ? 'Update Product' : 'Create Product'}
              </button>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
