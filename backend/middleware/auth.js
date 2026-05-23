const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'flipkart_clone_secret';

module.exports = async (req, res, next) => {
  try {
    let userId = null;
    let userRole = 'customer';
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        userRole = decoded.role || 'customer';
      } catch (err) {
        // Invalid token
      }
    }

    if (!userId) {
      // Fallback to first user in SQLite
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      if (firstUser) {
        userId = firstUser.id;
        userRole = firstUser.role;
      }
    }

    req.userId = userId;
    req.userRole = userRole;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};
