import dotenv from 'dotenv';

dotenv.config();
import mongoose from 'mongoose';

import { User } from './src/models/User.model';
import { Category } from './src/models/Category.model';
import { Product } from './src/models/Product.model';
import { Cart } from './src/models/Cart.model';
import { Order } from './src/models/Order.model';
import { Review } from './src/models/Review.model';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in .env');
}

// -----------------------------------------------------
// Helpers
// -----------------------------------------------------

const inr = (amount: number) => amount * 100;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');


// -----------------------------------------------------
// Seed
// -----------------------------------------------------

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected successfully');


    // -------------------------------------------------
    // 1. CLEAR EXISTING TEST DATA
    // -------------------------------------------------

    console.log('\nClearing existing data...');

    await Review.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    console.log('Existing data cleared');


    // -------------------------------------------------
    // 2. USERS
    // -------------------------------------------------

    console.log('\nCreating users...');

    const users = await User.insertMany([
      // ---------------- BUYERS ----------------

      {
        clerkId: 'seed_buyer_001',
        name: 'Rahul Sharma',
        email: 'rahul@example.com',
        role: 'buyer',
        address: {
          street: '12 MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560001',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      {
        clerkId: 'seed_buyer_002',
        name: 'Priya Reddy',
        email: 'priya@example.com',
        role: 'buyer',
        address: {
          street: '24 Banjara Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          zip: '500034',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      {
        clerkId: 'seed_buyer_003',
        name: 'Arjun Kumar',
        email: 'arjun@example.com',
        role: 'buyer',
        address: {
          street: '15 Anna Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zip: '600040',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      {
        clerkId: 'seed_buyer_004',
        name: 'Sneha Patel',
        email: 'sneha@example.com',
        role: 'buyer',
        address: {
          street: '42 Satellite Road',
          city: 'Ahmedabad',
          state: 'Gujarat',
          zip: '380015',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      {
        clerkId: 'seed_buyer_005',
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        role: 'buyer',
        address: {
          street: '8 Sector 17',
          city: 'Chandigarh',
          state: 'Chandigarh',
          zip: '160017',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      // ---------------- SELLERS ----------------

      {
        clerkId: 'seed_seller_001',
        name: 'TechWorld Store',
        email: 'techworld@example.com',
        role: 'seller',
        address: {
          street: '101 Electronic City',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560100',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      {
        clerkId: 'seed_seller_002',
        name: 'FashionHub Store',
        email: 'fashionhub@example.com',
        role: 'seller',
        address: {
          street: '55 Linking Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400052',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      {
        clerkId: 'seed_seller_003',
        name: 'HomeStyle Store',
        email: 'homestyle@example.com',
        role: 'seller',
        address: {
          street: '22 Whitefield Main Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560066',
          country: 'India',
        },
        wishlist: [],
        isActive: true,
      },

      // ---------------- ADMIN ----------------

      {
        clerkId: 'seed_admin_001',
        name: 'ShopSphere Admin',
        email: 'admin@shopsphere.test',
        role: 'admin',
        wishlist: [],
        isActive: true,
      },
    ]);

    const buyers = users.filter((u) => u.role === 'buyer');
    const sellers = users.filter((u) => u.role === 'seller');

    console.log(`Created ${users.length} users`);


    // -------------------------------------------------
    // 3. CATEGORIES
    // -------------------------------------------------

    console.log('\nCreating categories...');

    const electronics = await Category.create({
      name: 'Electronics',
      slug: slugify('Electronics'),
      isActive: true,
    });

    const fashion = await Category.create({
      name: 'Fashion',
      slug: slugify('Fashion'),
      isActive: true,
    });

    const home = await Category.create({
      name: 'Home & Kitchen',
      slug: slugify('Home & Kitchen'),
      isActive: true,
    });

    const beauty = await Category.create({
      name: 'Beauty',
      slug: slugify('Beauty'),
      isActive: true,
    });

    // Subcategories

    const smartphones = await Category.create({
      name: 'Smartphones',
      slug: slugify('Smartphones'),
      parent: electronics._id,
      isActive: true,
    });

    const laptops = await Category.create({
      name: 'Laptops',
      slug: slugify('Laptops'),
      parent: electronics._id,
      isActive: true,
    });

    const audio = await Category.create({
      name: 'Audio',
      slug: slugify('Audio'),
      parent: electronics._id,
      isActive: true,
    });

    const mensFashion = await Category.create({
      name: "Men's Fashion",
      slug: slugify("Men's Fashion"),
      parent: fashion._id,
      isActive: true,
    });

    const womensFashion = await Category.create({
      name: "Women's Fashion",
      slug: slugify("Women's Fashion"),
      parent: fashion._id,
      isActive: true,
    });

    const kitchen = await Category.create({
      name: 'Kitchen',
      slug: slugify('Kitchen'),
      parent: home._id,
      isActive: true,
    });

    const furniture = await Category.create({
      name: 'Furniture',
      slug: slugify('Furniture'),
      parent: home._id,
      isActive: true,
    });

    const skincare = await Category.create({
      name: 'Skincare',
      slug: slugify('Skincare'),
      parent: beauty._id,
      isActive: true,
    });

    console.log('Created categories');


    // -------------------------------------------------
    // 4. PRODUCTS
    // -------------------------------------------------

    console.log('\nCreating products...');

    const products = await Product.insertMany([

      // ================= ELECTRONICS =================

      {
        title: 'iPhone 16',
        description:
          'Apple iPhone 16 with powerful performance and advanced camera system.',
        price: inr(79999),
        discountPrice: inr(74999),
        images: ['https://placehold.co/600x600?text=iPhone+16'],
        category: smartphones._id,
        seller: sellers[0]._id,
        stock: 25,
        sku: 'SP-IPHONE16',
        tags: ['apple', 'iphone', 'smartphone', '5g'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Samsung Galaxy S25',
        description:
          'Premium Samsung smartphone with high-performance processor and AMOLED display.',
        price: inr(74999),
        discountPrice: inr(69999),
        images: ['https://placehold.co/600x600?text=Galaxy+S25'],
        category: smartphones._id,
        seller: sellers[0]._id,
        stock: 30,
        sku: 'SP-SAMS25',
        tags: ['samsung', 'galaxy', 'android', '5g'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'OnePlus 13',
        description:
          'Flagship OnePlus smartphone with fast charging and premium display.',
        price: inr(69999),
        discountPrice: inr(64999),
        images: ['https://placehold.co/600x600?text=OnePlus+13'],
        category: smartphones._id,
        seller: sellers[0]._id,
        stock: 20,
        sku: 'SP-ONEPLUS13',
        tags: ['oneplus', 'android', '5g', 'fast-charging'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      {
        title: 'MacBook Air M3',
        description:
          'Apple MacBook Air powered by the M3 chip with excellent battery life.',
        price: inr(114999),
        discountPrice: inr(109999),
        images: ['https://placehold.co/600x600?text=MacBook+Air'],
        category: laptops._id,
        seller: sellers[0]._id,
        stock: 12,
        sku: 'LT-MBA-M3',
        tags: ['apple', 'macbook', 'laptop', 'm3'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Dell Inspiron 14',
        description:
          'Everyday productivity laptop with a compact design and reliable performance.',
        price: inr(64999),
        discountPrice: inr(59999),
        images: ['https://placehold.co/600x600?text=Dell+Inspiron'],
        category: laptops._id,
        seller: sellers[0]._id,
        stock: 18,
        sku: 'LT-DELL14',
        tags: ['dell', 'laptop', 'windows'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      {
        title: 'Sony WH-1000XM5',
        description:
          'Premium wireless noise cancelling headphones with excellent sound quality.',
        price: inr(29999),
        discountPrice: inr(26999),
        images: ['https://placehold.co/600x600?text=Sony+Headphones'],
        category: audio._id,
        seller: sellers[0]._id,
        stock: 35,
        sku: 'AU-SONYXM5',
        tags: ['sony', 'headphones', 'wireless', 'noise-cancelling'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Apple AirPods Pro 2',
        description:
          'Wireless earbuds with active noise cancellation and spatial audio.',
        price: inr(24999),
        discountPrice: inr(22999),
        images: ['https://placehold.co/600x600?text=AirPods+Pro'],
        category: audio._id,
        seller: sellers[0]._id,
        stock: 45,
        sku: 'AU-AIRPODS2',
        tags: ['apple', 'airpods', 'earbuds', 'wireless'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      // ================= FASHION =================

      {
        title: 'Nike Air Max 270',
        description:
          'Comfortable lifestyle sneakers suitable for everyday use.',
        price: inr(11999),
        discountPrice: inr(9999),
        images: ['https://placehold.co/600x600?text=Nike+Air+Max'],
        category: mensFashion._id,
        seller: sellers[1]._id,
        stock: 40,
        sku: 'FN-NIKE270',
        tags: ['nike', 'shoes', 'sneakers', 'men'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Levi’s Classic Denim Jacket',
        description:
          'Classic denim jacket with a timeless casual look.',
        price: inr(4999),
        discountPrice: inr(3999),
        images: ['https://placehold.co/600x600?text=Denim+Jacket'],
        category: mensFashion._id,
        seller: sellers[1]._id,
        stock: 25,
        sku: 'FN-LEVIJACKET',
        tags: ['levis', 'jacket', 'denim', 'men'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      {
        title: 'Adidas Running Shoes',
        description:
          'Lightweight running shoes designed for daily workouts.',
        price: inr(7999),
        discountPrice: inr(6999),
        images: ['https://placehold.co/600x600?text=Adidas+Shoes'],
        category: mensFashion._id,
        seller: sellers[1]._id,
        stock: 50,
        sku: 'FN-ADIRUN',
        tags: ['adidas', 'running', 'shoes', 'fitness'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      {
        title: 'Women’s Cotton Kurti',
        description:
          'Comfortable printed cotton kurti suitable for casual and office wear.',
        price: inr(1999),
        discountPrice: inr(1499),
        images: ['https://placehold.co/600x600?text=Cotton+Kurti'],
        category: womensFashion._id,
        seller: sellers[1]._id,
        stock: 60,
        sku: 'FW-KURTI01',
        tags: ['kurti', 'cotton', 'women', 'ethnic'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Women’s Handbag',
        description:
          'Stylish everyday handbag with multiple compartments.',
        price: inr(3499),
        discountPrice: inr(2999),
        images: ['https://placehold.co/600x600?text=Handbag'],
        category: womensFashion._id,
        seller: sellers[1]._id,
        stock: 30,
        sku: 'FW-HANDBAG01',
        tags: ['handbag', 'women', 'fashion'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      // ================= HOME =================

      {
        title: 'Philips Air Fryer',
        description:
          'Digital air fryer for convenient low-oil cooking.',
        price: inr(8999),
        discountPrice: inr(7499),
        images: ['https://placehold.co/600x600?text=Air+Fryer'],
        category: kitchen._id,
        seller: sellers[2]._id,
        stock: 22,
        sku: 'HK-AIRFRY01',
        tags: ['philips', 'air-fryer', 'kitchen'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Prestige Electric Kettle',
        description:
          'Fast boiling electric kettle suitable for tea and coffee.',
        price: inr(1799),
        discountPrice: inr(1499),
        images: ['https://placehold.co/600x600?text=Electric+Kettle'],
        category: kitchen._id,
        seller: sellers[2]._id,
        stock: 50,
        sku: 'HK-KETTLE01',
        tags: ['prestige', 'kettle', 'kitchen'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      {
        title: 'Ergonomic Office Chair',
        description:
          'Comfortable ergonomic chair designed for long working hours.',
        price: inr(12999),
        discountPrice: inr(10999),
        images: ['https://placehold.co/600x600?text=Office+Chair'],
        category: furniture._id,
        seller: sellers[2]._id,
        stock: 15,
        sku: 'HM-CHAIR01',
        tags: ['chair', 'office', 'ergonomic', 'furniture'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Modern Study Table',
        description:
          'Minimal wooden study table for home and office use.',
        price: inr(6999),
        discountPrice: inr(5999),
        images: ['https://placehold.co/600x600?text=Study+Table'],
        category: furniture._id,
        seller: sellers[2]._id,
        stock: 18,
        sku: 'HM-TABLE01',
        tags: ['table', 'study', 'furniture'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },

      // ================= BEAUTY =================

      {
        title: 'Vitamin C Face Serum',
        description:
          'Lightweight vitamin C serum for everyday skincare.',
        price: inr(899),
        discountPrice: inr(699),
        images: ['https://placehold.co/600x600?text=Vitamin+C+Serum'],
        category: skincare._id,
        seller: sellers[1]._id,
        stock: 100,
        sku: 'BS-SERUM01',
        tags: ['serum', 'vitamin-c', 'skincare'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: true,
      },

      {
        title: 'Hydrating Face Moisturizer',
        description:
          'Daily moisturizer designed to keep skin hydrated.',
        price: inr(699),
        discountPrice: inr(549),
        images: ['https://placehold.co/600x600?text=Moisturizer'],
        category: skincare._id,
        seller: sellers[1]._id,
        stock: 80,
        sku: 'BS-MOIST01',
        tags: ['moisturizer', 'skincare', 'hydration'],
        ratings: 0,
        numReviews: 0,
        isActive: true,
        isFeatured: false,
      },
    ]);

    console.log(`Created ${products.length} products`);


    // -------------------------------------------------
    // 5. WISHLISTS
    // -------------------------------------------------

    console.log('\nAdding wishlist items...');

    await User.findByIdAndUpdate(buyers[0]._id, {
      wishlist: [products[0]._id, products[5]._id],
    });

    await User.findByIdAndUpdate(buyers[1]._id, {
      wishlist: [products[3]._id, products[11]._id],
    });

    await User.findByIdAndUpdate(buyers[2]._id, {
      wishlist: [products[8]._id, products[13]._id],
    });


    // -------------------------------------------------
    // 6. CARTS
    // -------------------------------------------------

    console.log('\nCreating carts...');

    await Cart.insertMany([
      {
        user: buyers[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 1,
            priceAtAdd: products[0].discountPrice ?? products[0].price,
          },
          {
            product: products[5]._id,
            quantity: 1,
            priceAtAdd: products[5].discountPrice ?? products[5].price,
          },
        ],
      },

      {
        user: buyers[1]._id,
        items: [
          {
            product: products[8]._id,
            quantity: 2,
            priceAtAdd: products[8].discountPrice ?? products[8].price,
          },
          {
            product: products[11]._id,
            quantity: 1,
            priceAtAdd: products[11].discountPrice ?? products[11].price,
          },
        ],
      },

      {
        user: buyers[2]._id,
        items: [
          {
            product: products[13]._id,
            quantity: 1,
            priceAtAdd: products[13].discountPrice ?? products[13].price,
          },
        ],
      },
    ]);

    console.log('Created carts');


    // -------------------------------------------------
    // 7. ORDERS
    // -------------------------------------------------

    console.log('\nCreating orders...');

    const order1Subtotal =
      products[0].discountPrice! +
      products[5].discountPrice!;

    const order1Shipping = inr(99);
    const order1Tax = Math.round(order1Subtotal * 0.18);
    const order1Total =
      order1Subtotal +
      order1Shipping +
      order1Tax;

    const order1 = await Order.create({
      buyer: buyers[0]._id,

      items: [
        {
          product: products[0]._id,
          title: products[0].title,
          image: products[0].images[0],
          quantity: 1,
          price: products[0].discountPrice!,
          seller: products[0].seller,
        },
        {
          product: products[5]._id,
          title: products[5].title,
          image: products[5].images[0],
          quantity: 1,
          price: products[5].discountPrice!,
          seller: products[5].seller,
        },
      ],

      shippingAddress: {
        name: buyers[0].name,
        street: buyers[0].address?.street ?? '12 MG Road',
        city: buyers[0].address?.city ?? 'Bengaluru',
        state: buyers[0].address?.state ?? 'Karnataka',
        zip: buyers[0].address?.zip ?? '560001',
        country: 'India',
        phone: '+919876543210',
      },

      subtotal: order1Subtotal,
      shippingFee: order1Shipping,
      tax: order1Tax,
      totalAmount: order1Total,

      paymentStatus: 'paid',
      orderStatus: 'delivered',

      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(Date.now() - 5 * 86400000),
          note: 'Order placed',
        },
        {
          status: 'confirmed',
          timestamp: new Date(Date.now() - 4 * 86400000),
          note: 'Payment confirmed',
        },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() - 3 * 86400000),
          note: 'Order shipped',
        },
        {
          status: 'out_for_delivery',
          timestamp: new Date(Date.now() - 2 * 86400000),
          note: 'Out for delivery',
        },
        {
          status: 'delivered',
          timestamp: new Date(Date.now() - 1 * 86400000),
          note: 'Delivered successfully',
        },
      ],

      trackingNumber: 'SS-TRACK-10001',
    });


    const order2Subtotal =
      products[8].discountPrice! * 2 +
      products[11].discountPrice!;

    const order2Shipping = inr(99);
    const order2Tax = Math.round(order2Subtotal * 0.18);
    const order2Total =
      order2Subtotal +
      order2Shipping +
      order2Tax;

    const order2 = await Order.create({
      buyer: buyers[1]._id,

      items: [
        {
          product: products[8]._id,
          title: products[8].title,
          image: products[8].images[0],
          quantity: 2,
          price: products[8].discountPrice!,
          seller: products[8].seller,
        },
        {
          product: products[11]._id,
          title: products[11].title,
          image: products[11].images[0],
          quantity: 1,
          price: products[11].discountPrice!,
          seller: products[11].seller,
        },
      ],

      shippingAddress: {
        name: buyers[1].name,
        street: buyers[1].address?.street ?? '24 Banjara Hills',
        city: buyers[1].address?.city ?? 'Hyderabad',
        state: buyers[1].address?.state ?? 'Telangana',
        zip: buyers[1].address?.zip ?? '500034',
        country: 'India',
        phone: '+919876543211',
      },

      subtotal: order2Subtotal,
      shippingFee: order2Shipping,
      tax: order2Tax,
      totalAmount: order2Total,

      paymentStatus: 'paid',
      orderStatus: 'shipped',

      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(Date.now() - 3 * 86400000),
        },
        {
          status: 'confirmed',
          timestamp: new Date(Date.now() - 2 * 86400000),
        },
        {
          status: 'shipped',
          timestamp: new Date(Date.now() - 1 * 86400000),
        },
      ],

      trackingNumber: 'SS-TRACK-10002',
    });


    const order3Subtotal = products[13].discountPrice!;
    const order3Shipping = inr(49);
    const order3Tax = Math.round(order3Subtotal * 0.18);
    const order3Total =
      order3Subtotal +
      order3Shipping +
      order3Tax;

    const order3 = await Order.create({
      buyer: buyers[2]._id,

      items: [
        {
          product: products[13]._id,
          title: products[13].title,
          image: products[13].images[0],
          quantity: 1,
          price: products[13].discountPrice!,
          seller: products[13].seller,
        },
      ],

      shippingAddress: {
        name: buyers[2].name,
        street: buyers[2].address?.street ?? '15 Anna Nagar',
        city: buyers[2].address?.city ?? 'Chennai',
        state: buyers[2].address?.state ?? 'Tamil Nadu',
        zip: buyers[2].address?.zip ?? '600040',
        country: 'India',
        phone: '+919876543212',
      },

      subtotal: order3Subtotal,
      shippingFee: order3Shipping,
      tax: order3Tax,
      totalAmount: order3Total,

      paymentStatus: 'pending',
      orderStatus: 'placed',

      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date(),
          note: 'Order placed',
        },
      ],
    });


    console.log(`Created 3 orders`);


    // -------------------------------------------------
    // 8. REVIEWS
    // -------------------------------------------------

    console.log('\nCreating reviews...');

    await Review.create([
      {
        product: products[0]._id,
        user: buyers[0]._id,
        order: order1._id,
        rating: 5,
        title: 'Excellent phone',
        comment:
          'The phone is excellent. Performance and camera quality are great.',
        images: [],
        isVerifiedPurchase: true,
      },

      {
        product: products[5]._id,
        user: buyers[0]._id,
        order: order1._id,
        rating: 5,
        title: 'Amazing headphones',
        comment:
          'Excellent sound quality and very good noise cancellation.',
        images: [],
        isVerifiedPurchase: true,
      },

      {
        product: products[8]._id,
        user: buyers[1]._id,
        order: order2._id,
        rating: 4,
        title: 'Very comfortable',
        comment:
          'Comfortable shoes and good quality. Would recommend them.',
        images: [],
        isVerifiedPurchase: true,
      },

      {
        product: products[11]._id,
        user: buyers[1]._id,
        order: order2._id,
        rating: 5,
        title: 'Great product',
        comment:
          'The kurti looks exactly like the pictures and the material is comfortable.',
        images: [],
        isVerifiedPurchase: true,
      },
    ]);

    console.log('Created reviews');


    // -------------------------------------------------
    // 9. RECALCULATE PRODUCT RATINGS
    // -------------------------------------------------

    console.log('\nUpdating product ratings...');

    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: '$product',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    for (const stat of reviewStats) {
      await Product.findByIdAndUpdate(stat._id, {
        ratings: Number(stat.avgRating.toFixed(1)),
        numReviews: stat.count,
      });
    }

    console.log('Product ratings updated');


    // -------------------------------------------------
    // DONE
    // -------------------------------------------------

    console.log('\n========================================');
    console.log('SHOPSPHERE DATABASE SEEDED SUCCESSFULLY');
    console.log('========================================');

    console.log(`Users:      ${await User.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Products:   ${await Product.countDocuments()}`);
    console.log(`Carts:      ${await Cart.countDocuments()}`);
    console.log(`Orders:     ${await Order.countDocuments()}`);
    console.log(`Reviews:    ${await Review.countDocuments()}`);

    console.log('\nSeed users:');

    users.forEach((user) => {
      console.log(
        `${user.role.padEnd(7)} | ${user.email} | ${user.clerkId}`,
      );
    });

  } catch (error) {
    console.error('\nSEED ERROR:');
    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();

    console.log('\nMongoDB connection closed');
  }
}

seedDatabase();