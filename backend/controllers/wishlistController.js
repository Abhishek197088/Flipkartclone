const prisma = require('../config/prisma');

// Get wishlist items for user
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: { take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(items);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const newItem = await prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          include: {
            images: { take: 1 }
          }
        }
      }
    });

    return res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error adding to wishlist' });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params; // WishlistItem ID or Product ID? Let's check both or support deleting by productId

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Attempt to delete by wishlistItem ID first, if not found try by productId
    const item = await prisma.wishlistItem.findFirst({
      where: {
        OR: [
          { id, userId },
          { productId: id, userId }
        ]
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id }
    });

    return res.status(200).json({ message: 'Item removed from wishlist', id: item.id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error removing from wishlist' });
  }
};
