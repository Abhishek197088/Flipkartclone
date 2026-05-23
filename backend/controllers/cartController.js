const prisma = require('../config/prisma');

// Fetch user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: { userId, productId }
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + parseInt(quantity) }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity: parseInt(quantity)
        }
      });
    }

    // Fetch updated item with product associations
    const updatedItem = await prisma.cartItem.findUnique({
      where: { id: cartItem.id },
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

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // CartItem ID
    const { quantity } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity) }
    });

    // Fetch updated item
    const updatedItem = await prisma.cartItem.findUnique({
      where: { id: updated.id },
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

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error updating cart' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // CartItem ID

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Item removed from cart', id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error removing item' });
  }
};
