/**
 * Development seed script: populates categories, a demo seller, and sample products.
 * Run with:  npm run seed
 *
 * NOTE: The demo users use placeholder clerkIds — sign in via Clerk to create real
 * users, then promote them to seller/admin from the Admin Panel.
 */
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User.model';
import { Category } from '../models/Category.model';
import { Product } from '../models/Product.model';
import { slugify } from './slug';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];

const SAMPLE_PRODUCTS = [
  { title: 'Wireless Noise-Cancelling Headphones', price: 799900, stock: 40, cat: 'Electronics', featured: true },
  { title: 'Mechanical Gaming Keyboard', price: 499900, stock: 60, cat: 'Electronics', featured: true },
  { title: 'Cotton Casual T-Shirt', price: 79900, stock: 200, cat: 'Fashion', featured: false },
  { title: 'Stainless Steel Cookware Set', price: 349900, stock: 25, cat: 'Home & Kitchen', featured: true },
  { title: 'Bestselling Mystery Novel', price: 39900, stock: 150, cat: 'Books', featured: false },
  { title: 'Yoga Mat (Eco-Friendly)', price: 129900, stock: 80, cat: 'Sports', featured: true },
];

const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

async function seed(): Promise<void> {
  await connectDB();

  console.log('Seeding categories...');
  const categoryMap = new Map<string, mongoose.Types.ObjectId>();
  for (const name of CATEGORIES) {
    const cat = await Category.findOneAndUpdate(
      { name },
      { name, slug: slugify(name), isActive: true },
      { upsert: true, new: true },
    );
    categoryMap.set(name, cat._id as mongoose.Types.ObjectId);
  }

  console.log('Seeding demo seller...');
  const seller = await User.findOneAndUpdate(
    { clerkId: 'seed_seller_demo' },
    {
      clerkId: 'seed_seller_demo',
      name: 'Demo Seller',
      email: 'demo-seller@shopsphere.dev',
      role: 'seller',
      isActive: true,
    },
    { upsert: true, new: true },
  );

  console.log('Seeding products...');
  for (const p of SAMPLE_PRODUCTS) {
    await Product.findOneAndUpdate(
      { title: p.title },
      {
        title: p.title,
        description: `${p.title} — a great product available on ShopSphere.`,
        price: p.price,
        images: [PLACEHOLDER_IMAGE],
        category: categoryMap.get(p.cat),
        seller: seller._id,
        stock: p.stock,
        tags: [p.cat.toLowerCase()],
        isActive: true,
        isFeatured: p.featured,
      },
      { upsert: true, new: true },
    );
  }

  console.log('✅ Seed complete');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
