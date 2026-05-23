const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing database records...');
  
  // Clean up in correct order to respect foreign key constraints
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Default Customers and Admins...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Create customer user
  const customer = await prisma.user.create({
    data: {
      email: 'user@flipkart.com',
      password: hashedPassword,
      name: 'Abhishek Kumar',
      phone: '9876543210',
      role: 'customer'
    }
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@flipkart.com',
      password: hashedPassword,
      name: 'Flipkart Admin',
      phone: '9999999999',
      role: 'admin'
    }
  });

  console.log('Seeding Default Address...');
  await prisma.address.create({
    data: {
      userId: customer.id,
      name: 'Abhishek Kumar',
      phone: '9876543210',
      pincode: '560001',
      locality: 'Koramangala',
      addressLine: 'Flat 302, Sunrise Apartments, 4th Block, 80 Feet Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      addressType: 'Home',
      isDefault: true
    }
  });

  console.log('Seeding Categories...');
  const categoriesData = [
    { name: 'Mobiles', slug: 'mobiles', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=128&q=80' },
    { name: 'Electronics', slug: 'electronics', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=128&q=80' },
    { name: 'Fashion', slug: 'fashion', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=128&q=80' },
    { name: 'Home & Furniture', slug: 'home', imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=128&q=80' },
    { name: 'Appliances', slug: 'appliances', imageUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=128&q=80' },
    { name: 'Flight Bookings', slug: 'flights', imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=128&q=80' },
    { name: 'Beauty, Toys & More', slug: 'beauty-toys', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=128&q=80' },
    { name: 'Two Wheelers', slug: 'two-wheelers', imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=128&q=80' }
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat
    });
    categories[cat.slug] = created.id;
  }

  console.log('Seeding Products...');
  const productsData = [
    {
      categoryId: categories['mobiles'],
      title: 'Apple iPhone 15 Pro (Natural Titanium, 128 GB)',
      description: 'iPhone 15 Pro has a strong and light aerospace-grade titanium design with a textured matte-glass back. It also features a Ceramic Shield front that’s tougher than any smartphone glass. The 15.49 cm display with ProMotion ramps up refresh rates to 120Hz.',
      price: 129900.00,
      mrp: 134900.00,
      discountPercent: 3,
      rating: 4.7,
      ratingCount: 12543,
      stock: 25,
      isAssured: true,
      brand: 'Apple',
      specifications: JSON.stringify({
        'In The Box': 'iPhone, USB-C Charge Cable',
        'Model Name': 'iPhone 15 Pro',
        'Color': 'Natural Titanium',
        'SIM Type': 'Dual Sim (Nano + e-SIM)',
        'Display Size': '15.49 cm (6.1 inch)',
        'Primary Camera': '48MP + 12MP + 12MP',
        'Processor Type': 'A17 Pro Chip'
      }),
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['mobiles'],
      title: 'SAMSUNG Galaxy S24 Ultra 5G (Titanium Gray, 256 GB)',
      description: 'Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a flat display. The built-in S Pen legacy lives on. Write, tap and navigate with precision.',
      price: 129999.00,
      mrp: 144999.00,
      discountPercent: 10,
      rating: 4.6,
      ratingCount: 8432,
      stock: 18,
      isAssured: true,
      brand: 'Samsung',
      specifications: JSON.stringify({
        'In The Box': 'Handset, S-Pen, Data Cable (C to C), Ejection Pin',
        'Model Name': 'Galaxy S24 Ultra 5G',
        'Color': 'Titanium Gray',
        'Display Size': '17.27 cm (6.8 inch)',
        'Primary Camera': '200MP + 50MP + 12MP + 10MP',
        'Internal Storage': '256 GB',
        'RAM': '12 GB'
      }),
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['mobiles'],
      title: 'POCO X6 Pro 5G (Racing Yellow, 256 GB) (8 GB RAM)',
      description: 'Unleash the supreme performance with the POCO X6 Pro 5G, boasting a powerful MediaTek Dimensity 8300-Ultra processor. Re-engineered yellow vegan leather back adds a flagship-level aesthetic.',
      price: 24999.00,
      mrp: 30999.00,
      discountPercent: 19,
      rating: 4.3,
      ratingCount: 22401,
      stock: 50,
      isAssured: true,
      brand: 'POCO',
      specifications: JSON.stringify({
        'In The Box': 'Handset, 67W Charger, Type-C Cable, Protective Case',
        'Model Name': 'X6 Pro 5G',
        'Color': 'Racing Yellow',
        'RAM': '8 GB',
        'Display Size': '16.94 cm (6.67 inch)'
      }),
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['electronics'],
      title: 'Apple MacBook Air M2 (Space Grey, 8 GB RAM, 256 GB SSD)',
      description: 'Redesigned around the next-generation M2 chip, the incredibly thin MacBook Air brings exceptional speed and power efficiency inside its durable all-aluminum enclosure.',
      price: 89990.00,
      mrp: 99900.00,
      discountPercent: 9,
      rating: 4.7,
      ratingCount: 15432,
      stock: 12,
      isAssured: true,
      brand: 'Apple',
      specifications: JSON.stringify({
        'Model Name': 'MacBook Air',
        'Color': 'Space Grey',
        'Processor': 'Apple M2 Chip',
        'RAM': '8 GB',
        'SSD Capacity': '256 GB'
      }),
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['electronics'],
      title: 'Sony WH-1000XM5 Active Noise Cancelling Bluetooth Headset',
      description: 'With two processors controlling eight microphones, Auto NC Optimizer for automatically optimizing noise cancelling. WH-1000XM5 headphones rewrite the rules for distraction-free listening.',
      price: 26990.00,
      mrp: 34990.00,
      discountPercent: 22,
      rating: 4.5,
      ratingCount: 3405,
      stock: 35,
      isAssured: true,
      brand: 'Sony',
      specifications: JSON.stringify({
        'Model Name': 'WH-1000XM5',
        'Color': 'Black',
        'Headphone Type': 'Over the Ear',
        'Connectivity': 'Bluetooth / Wired',
        'Battery Life': '30 Hours'
      }),
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['fashion'],
      title: 'Puma Club II Era Sneakers For Men (White, Red)',
      description: 'Step into classic style with the Puma Club II Era Sneakers. Designed for everyday streetwear, these sneakers feature a premium synthetic leather upper and a durable rubber outsole.',
      price: 1899.00,
      mrp: 3999.00,
      discountPercent: 52,
      rating: 4.1,
      ratingCount: 15403,
      stock: 80,
      isAssured: true,
      brand: 'Puma',
      specifications: JSON.stringify({
        'Type': 'Sneakers',
        'Color': 'White, Red',
        'Outer Material': 'Synthetic Leather',
        'Sole Material': 'Rubber'
      }),
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['home'],
      title: 'Pigeon Amaze Plus 1.5 L Electric Kettle (Silver, Black)',
      description: 'Boil water quickly and safely with the Pigeon Amaze Plus Electric Kettle. With a 1.5-liter capacity, automatic shut-off feature, and cordless operation.',
      price: 649.00,
      mrp: 1195.00,
      discountPercent: 45,
      rating: 4.2,
      ratingCount: 382049,
      stock: 120,
      isAssured: true,
      brand: 'Pigeon',
      specifications: JSON.stringify({
        'Capacity': '1.5 L',
        'Power Required': '1500 W',
        'Body Material': 'Stainless Steel'
      }),
      images: [
        'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['appliances'],
      title: 'LG 242 L Frost Free Double Door Refrigerator (Shiny Steel)',
      description: 'LG Frost Free Double Door Refrigerator with Smart Inverter Compressor and Smart Diagnosis. Keeps fruits and vegetables fresh for up to 14 days with multi-air flow cooling.',
      price: 25990.00,
      mrp: 31990.00,
      discountPercent: 18,
      rating: 4.4,
      ratingCount: 18430,
      stock: 15,
      isAssured: true,
      brand: 'LG',
      specifications: JSON.stringify({
        'Type': 'Double Door Refrigerator',
        'Capacity': '242 L',
        'Energy Rating': '3 Star'
      }),
      images: [
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['beauty-toys'],
      title: 'Happilo Premium California Almonds (500g)',
      description: 'Healthy, raw and natural almonds from the orchards of California. Highly nutritious and loaded with protein and healthy fats.',
      price: 399.00,
      mrp: 799.00,
      discountPercent: 50,
      rating: 4.5,
      ratingCount: 45310,
      stock: 200,
      isAssured: true,
      brand: 'Happilo',
      specifications: JSON.stringify({
        'Weight': '500g',
        'Type': 'Almonds',
        'Package Type': 'Pouch'
      }),
      images: [
        'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['electronics'],
      title: 'boAt Storm Call 3 Smartwatch (Charcoal Black)',
      description: 'Smartwatch featuring built-in calling, a 1.83-inch HD display, 700+ active sports modes, and customizable watch faces.',
      price: 1299.00,
      mrp: 4999.00,
      discountPercent: 74,
      rating: 4.2,
      ratingCount: 8540,
      stock: 150,
      isAssured: true,
      brand: 'boAt',
      specifications: JSON.stringify({
        'Display': '1.83 inches HD',
        'Color': 'Charcoal Black',
        'Calling': 'Bluetooth Calling Support'
      }),
      images: [
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['home'],
      title: 'Classic Foldable Polyester Mosquito Net',
      description: 'Durable self-supporting mosquito net made from strong polyester mesh. Fits easily on double size beds.',
      price: 899.00,
      mrp: 1999.00,
      discountPercent: 55,
      rating: 4.3,
      ratingCount: 1502,
      stock: 60,
      isAssured: true,
      brand: 'Classic Net',
      specifications: JSON.stringify({
        'Size': 'Double Bed',
        'Material': 'Polyester Mesh',
        'Foldable': 'Yes'
      }),
      images: [
        'https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['appliances'],
      title: 'Philips OneBlade Hybrid Trimmer & Shaver',
      description: 'Unique hybrid styler that can trim, shave, and create clean lines and edges on any length of hair. Water-resistant.',
      price: 1499.00,
      mrp: 2199.00,
      discountPercent: 31,
      rating: 4.4,
      ratingCount: 4210,
      stock: 90,
      isAssured: true,
      brand: 'Philips',
      specifications: JSON.stringify({
        'Blade material': 'Stainless Steel',
        'Runtime': '45 minutes',
        'Type': 'Cordless'
      }),
      images: [
        'https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['beauty-toys'],
      title: 'Lifelong Solid Hex Dumbbells Set (5kg x 2)',
      description: 'Solid rubber hex dumbbells perfect for strength training and muscle toning. Contoured chrome handles prevent slipping.',
      price: 1199.00,
      mrp: 2499.00,
      discountPercent: 52,
      rating: 4.4,
      ratingCount: 954,
      stock: 40,
      isAssured: true,
      brand: 'Lifelong',
      specifications: JSON.stringify({
        'Weight': '10kg Total (5kg x 2)',
        'Material': 'Solid Rubber & Steel',
        'Shape': 'Hexagonal'
      }),
      images: [
        'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['fashion'],
      title: 'Roadster Men\'s Checkered Casual Shirt',
      description: 'Classic checkered shirt styled in premium pure cotton. Tailored for comfort with structured cuffs and patch pockets.',
      price: 799.00,
      mrp: 1799.00,
      discountPercent: 55,
      rating: 4.1,
      ratingCount: 15430,
      stock: 120,
      isAssured: true,
      brand: 'Roadster',
      specifications: JSON.stringify({
        'Fabric': '100% Cotton',
        'Pattern': 'Checkered',
        'Fit': 'Slim Fit'
      }),
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['two-wheelers'],
      title: 'Ola S1 Pro Gen 2 (Electric Scooter)',
      description: 'High performance electric scooter featuring a certified range of 195km, 120km/h top speed, and digital touchscreen dashboard.',
      price: 147499.00,
      mrp: 154999.00,
      discountPercent: 4,
      rating: 4.5,
      ratingCount: 1250,
      stock: 10,
      isAssured: true,
      brand: 'Ola Electric',
      specifications: JSON.stringify({
        'Motor Power': '11 kW Peak',
        'Range': '195 km',
        'Charging Time': '6.5 Hours'
      }),
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80'
      ]
    },
    {
      categoryId: categories['flights'],
      title: 'Indigo Domestic Flight Voucher (₹5000 Value)',
      description: 'Prepaid flight e-voucher redeemable on Indigo web/mobile ticketing app. Valid for travel across all domestic sectors.',
      price: 4499.00,
      mrp: 5000.00,
      discountPercent: 10,
      rating: 4.6,
      ratingCount: 840,
      stock: 500,
      isAssured: true,
      brand: 'Indigo',
      specifications: JSON.stringify({
        'Voucher Value': '₹5,000',
        'Validity': '1 Year from issuance',
        'Type': 'Digital Gift Card'
      }),
      images: [
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&auto=format&fit=crop&q=80'
      ]
    }
  ];

  for (const prod of productsData) {
    const { images, ...productFields } = prod;
    const createdProduct = await prisma.product.create({
      data: productFields
    });
    
    // Seed Product Images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          imageUrl: images[i]
        }
      });
    }
  }

  console.log('Seeding mock reviews...');
  const allProducts = await prisma.product.findMany();
  for (const p of allProducts) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: p.id,
        rating: Math.floor(p.rating),
        comment: `Excellent product, matches descriptions perfectly! Highly recommend purchasing it.`
      }
    });
  }

  console.log('Prisma Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('Seeder failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
