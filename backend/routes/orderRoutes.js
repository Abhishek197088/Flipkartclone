const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.use(authMiddleware); // Force resolve userId

// Client routes
router.get('/', orderController.getOrders);
router.get('/detail/:id', orderController.getOrderById); // Use detail path to avoid admin routes collision
router.post('/', orderController.placeOrder);

// Admin routes
router.get('/admin/all', adminMiddleware, orderController.adminGetAllOrders);
router.put('/admin/status/:id', adminMiddleware, orderController.adminUpdateOrderStatus);
router.get('/admin/dashboard', adminMiddleware, orderController.adminGetDashboardStats);

module.exports = router;
