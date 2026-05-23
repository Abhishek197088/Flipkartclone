const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.get('/me', authController.getMe);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/address', authMiddleware, authController.saveAddress);

// Admin route
router.get('/admin/users', authMiddleware, adminMiddleware, authController.adminGetAllUsers);

module.exports = router;
