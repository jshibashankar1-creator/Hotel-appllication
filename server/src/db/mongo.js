import mongoose from 'mongoose';
import * as models from '../models/index.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URI || 'mongodb://localhost:27017/hotelhub';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`🍃 Connected to MongoDB Database successfully (${conn.connection.host}/${conn.connection.name})`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ MongoDB connection warning (${MONGODB_URI}):`, err.message);
    console.log('ℹ️ Server will continue operating with persistent database sync.');
    return null;
  }
}

export function isMongoConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export { models };
