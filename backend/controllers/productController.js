const prisma = require('../config/prisma');

// Fetch all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching categories' });
  }
};

// Fetch products with search, category filtering, and sorting
exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const whereClause = {};

    // 1. Filter by category slug
    if (category) {
      const cat = await prisma.category.findFirst({
        where: {
          OR: [
            { slug: category.toLowerCase() },
            { name: { contains: category } }
          ]
        }
      });
      if (cat) {
        whereClause.categoryId = cat.id;
      } else {
        // If category query doesn't match, return empty array
        return res.status(200).json([]);
      }
    }

    // 2. Search by title or brand
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { brand: { contains: search } }
      ];
    }

    // 3. Sorting logic
    let orderBy = { createdAt: 'desc' }; // default newest
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: true
      },
      orderBy
    });

    // Parse specifications JSON strings for frontend consumption
    const parsedProducts = products.map(product => {
      let specifications = {};
      if (product.specifications) {
        try {
          specifications = JSON.parse(product.specifications);
        } catch (e) {
          specifications = {};
        }
      }
      return {
        ...product,
        specifications
      };
    });

    return res.status(200).json(parsedProducts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching products' });
  }
};

// Fetch product details by ID (including reviews)
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let specifications = {};
    if (product.specifications) {
      try {
        specifications = JSON.parse(product.specifications);
      } catch (e) {
        specifications = {};
      }
    }

    return res.status(200).json({
      ...product,
      specifications
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error fetching product details' });
  }
};

// Admin: Add new product
exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, mrp, brand, stock, categoryId, specifications, images } = req.body;
    
    if (!title || !price || !categoryId) {
      return res.status(400).json({ message: 'Missing required product fields' });
    }

    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    const newProduct = await prisma.product.create({
      data: {
        title,
        description: description || '',
        price: parseFloat(price),
        mrp: parseFloat(mrp || price),
        discountPercent,
        brand: brand || 'Generic',
        stock: parseInt(stock || 0),
        categoryId,
        specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : (specifications || '{}'),
      }
    });

    // Create images if any provided
    if (Array.isArray(images)) {
      for (const imgUrl of images) {
        await prisma.productImage.create({
          data: {
            productId: newProduct.id,
            imageUrl: imgUrl
          }
        });
      }
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: { category: true, images: true }
    });

    return res.status(201).json(finalProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error creating product' });
  }
};

// Admin: Edit product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, mrp, brand, stock, categoryId, specifications, images } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedPrice = price !== undefined ? parseFloat(price) : existing.price;
    const updatedMrp = mrp !== undefined ? parseFloat(mrp) : existing.mrp;
    const discountPercent = updatedMrp > updatedPrice ? Math.round(((updatedMrp - updatedPrice) / updatedMrp) * 100) : 0;

    await prisma.product.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        price: updatedPrice,
        mrp: updatedMrp,
        discountPercent,
        brand: brand || existing.brand,
        stock: stock !== undefined ? parseInt(stock) : existing.stock,
        categoryId: categoryId || existing.categoryId,
        specifications: typeof specifications === 'object' ? JSON.stringify(specifications) : (specifications || existing.specifications),
      }
    });

    // Update images if provided
    if (Array.isArray(images)) {
      // Clear old images
      await prisma.productImage.deleteMany({ where: { productId: id } });
      // Insert new
      for (const imgUrl of images) {
        await prisma.productImage.create({
          data: {
            productId: id,
            imageUrl: imgUrl
          }
        });
      }
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true }
    });

    return res.status(200).json(finalProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error updating product' });
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({ where: { id } });
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Admin error deleting product' });
  }
};
