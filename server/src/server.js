import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocketServer } from './sockets/notification.socket.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas and start Express listener
const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://localhost:3000'];

    initSocketServer(httpServer, allowedOrigins);

    const server = httpServer.listen(PORT, () => {
      console.log('====================================================');
      console.log(`[Server] LifeLink API & Socket.IO running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log('====================================================');
    });

    // Graceful Shutdown Handlers
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        console.log('[Server] Process terminated safely.');
        process.exit(0);
      });

      // Force shutdown after 10s timeout
      setTimeout(() => {
        console.error('[Server] Could not close connections in time, forcefully shutting down.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    process.on('unhandledRejection', (reason, promise) => {
      console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('[Server] Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error(`[Server] Initialization failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();

