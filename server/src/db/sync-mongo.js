import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { db } from './database.js';

async function syncUsersToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('No MONGODB_URI found.');
    return;
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected! Upserting users safely without deleting any data...');

    const userSchema = new mongoose.Schema({
      id: String,
      name: String,
      email: { type: String, unique: true },
      password: String,
      role: String,
      status: String,
      phone: String,
      hotel_id: String,
      permissions: [String]
    }, { timestamps: true });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    const usersToSync = db.getUsers();
    for (const u of usersToSync) {
      await User.findOneAndUpdate(
        { email: u.email.toLowerCase() },
        {
          $set: {
            id: u.id,
            name: u.name,
            email: u.email.toLowerCase(),
            password: u.password,
            role: u.role,
            status: u.status || 'active',
            phone: u.phone || '',
            hotel_id: u.hotel_id || null,
            permissions: u.permissions || []
          }
        },
        { upsert: true, new: true }
      );
      console.log('  -> Upserted user:', u.email, `(${u.role})`);
    }

    console.log('✅ All users synced to MongoDB Atlas successfully!');
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas sync info:', err.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  }
}

syncUsersToMongo();
