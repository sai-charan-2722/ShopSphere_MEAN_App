import mongoose from 'mongoose';
import { env } from './env';

/**
 * Establish a connection to MongoDB Atlas.
 * Handles connection errors gracefully and logs connection lifecycle events.
 */
export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
      autoIndex: !env.isProd, // build indexes automatically in dev only
    });

    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Fail fast — a marketplace cannot run without its database.
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err);
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected gracefully');
}
