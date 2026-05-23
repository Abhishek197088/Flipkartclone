const prisma = require('../config/prisma');

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// Add a review for a product
exports.createReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existing = await prisma.review.findFirst({
      where: { userId, productId }
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating: parseInt(rating), comment }
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating: parseInt(rating),
          comment
        }
      });
    }

    // Update product overall rating and rating count
    const allReviews = await prisma.review.findMany({
      where: { productId }
    });
    const ratingCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / ratingCount;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        ratingCount
      }
    });

    const finalReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });

    return res.status(201).json(finalReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error saving review' });
  }
};
