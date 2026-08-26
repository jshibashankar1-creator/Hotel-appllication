import 'dotenv/config';
import app from './app.js';
import { connectDB } from './db/mongo.js';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  console.log(`🚀 HotelHub Backend API Server running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}/api/health`);
  await connectDB();
});

// Handle Graceful Shutdown
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Closing server & database connection...`);
  server.close(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
      }
    } catch (e) {}
    console.log('✅ Server & DB connection closed cleanly.');
    process.exit(0);
  });
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
