const prisma = require('../config/prisma');

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId, paymentMethod = 'COD' } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // 1. Fetch user's cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: {
              take: 1
            }
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cannot place order. Cart is empty.' });
    }

    // 2. Fetch shipping address
    let address = null;
    if (addressId) {
      address = await prisma.address.findFirst({
        where: { id: addressId, userId }
      });
    } else {
      // Fallback to default
      address = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      });
      if (!address) {
        address = await prisma.address.findFirst({
          where: { userId }
        });
      }
    }

    if (!address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Format shipping address snapshot
    const shippingAddressSnapshot = JSON.stringify({
      name: address.name,
      phone: address.phone,
      addressLine: address.addressLine,
      locality: address.locality,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType
    });

    // 3. Compute totals
    let totalPrice = 0.00;
    let finalAmount = 0.00;

    for (const item of cartItems) {
      const qty = item.quantity;
      const mrp = item.product.mrp;
      const price = item.product.price;

      totalPrice += mrp * qty;
      finalAmount += price * qty;
    }

    const discount = totalPrice - finalAmount;
    const deliveryCharges = finalAmount > 500 ? 0.00 : 40.00;
    const finalBillAmount = finalAmount + deliveryCharges;

    // Generate Flipkart-style order ID
    const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000);
    const orderId = `OD${Date.now().toString().slice(-4)}${randomDigits}`;

    // 4. Create Order and items inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          userId,
          totalPrice,
          discount,
          deliveryCharges,
          finalAmount: finalBillAmount,
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
          orderStatus: 'Placed',
          shippingAddress: shippingAddressSnapshot
        }
      });

      // Create items and decrement stocks
      for (const item of cartItems) {
        const imageUrl = item.product.images && item.product.images[0] ? item.product.images[0].imageUrl : '';
        
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            title: item.product.title,
            imageUrl
          }
        });

        // Decrement stock
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: newStock }
        });
      }

      // Clear Cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return newOrder;
    });

    const placedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true }
    });

    // Format shipping address parsed object
    try {
      placedOrder.shippingAddress = JSON.parse(placedOrder.shippingAddress);
    } catch (e) {
      // Ignore
    }

    return res.status(201).json(placedOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Server error placing order' });
  }
};

// Fetch order history for user
exports.getOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map(order => {
      let shippingAddress = {};
      try {
        shippingAddress = JSON.parse(order.shippingAddress);
      } catch (e) {
        // Keep string
      }
      return {
        ...order,
        shippingAddress
      };
    });

    return res.status(200).json(formattedOrders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching order history' });
  }
};

// Fetch order by ID
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    let shippingAddress = {};
    try {
      shippingAddress = JSON.parse(order.shippingAddress);
    } catch (e) {
      // Ignore
    }

    return res.status(200).json({
      ...order,
      shippingAddress
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching order details' });
  }
};

// Admin: Get all orders
exports.adminGetAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = orders.map(o => {
      let addr = {};
      try {
        addr = JSON.parse(o.shippingAddress);
      } catch (e) {
        // Ignore
      }
      return {
        ...o,
        shippingAddress: addr
      };
    });

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error fetching all orders' });
  }
};

// Admin: Update order status
exports.adminUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || existing.orderStatus,
        paymentStatus: paymentStatus || existing.paymentStatus
      },
      include: { items: true }
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error updating order' });
  }
};

// Admin: Dashboard stats
exports.adminGetDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'customer' } });
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    
    // Sum finalAmount of all orders
    const orders = await prisma.order.findMany();
    const totalSales = orders.reduce((acc, order) => acc + order.finalAmount, 0);

    // Group sales by category
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return res.status(200).json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalSales: Math.round(totalSales)
      },
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        productCount: c._count.products
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error fetching dashboard statistics' });
  }
};
