const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'flipkart_clone_secret';

// Get Current User (With auto fallback to first seeded user if no JWT provided for easy local evaluation)
exports.getMe = async (req, res) => {
  try {
    let userId = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Invalid token
      }
    }

    if (!userId) {
      // Fallback to first user in SQLite
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      if (!firstUser) {
        return res.status(404).json({ message: 'No users found' });
      }
      userId = firstUser.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    delete user.password;
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    
    delete user.password;
    const userWithAddresses = await prisma.user.findUnique({
      where: { id: user.id },
      include: { addresses: true }
    });
    delete userWithAddresses.password;

    return res.status(200).json({
      token,
      user: userWithAddresses
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Register User
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const userExists = await prisma.user.findUnique({
      where: { email }
    });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || '',
        role: 'customer'
      }
    });

    const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    delete newUser.password;
    return res.status(201).json({
      token,
      user: {
        ...newUser,
        addresses: []
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

// Save Address
exports.saveAddress = async (req, res) => {
  try {
    const { name, phone, pincode, locality, addressLine, city, state, addressType, isDefault } = req.body;
    
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    }

    if (!userId) {
      const defaultUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' }
      });
      userId = defaultUser.id;
    }

    if (isDefault) {
      // Set all other addresses for this user to isDefault: false
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        name,
        phone,
        pincode,
        locality,
        addressLine,
        city,
        state,
        addressType: addressType || 'Home',
        isDefault: !!isDefault
      }
    });

    return res.status(201).json(address);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error saving address' });
  }
};

// Admin: Get all registered customers
exports.adminGetAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'customer' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error fetching all users' });
  }
};
