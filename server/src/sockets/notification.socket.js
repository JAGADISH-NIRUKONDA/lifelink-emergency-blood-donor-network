import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

let io = null;

/**
 * Initializes Socket.IO on the HTTP server instance
 */
export const initSocketServer = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  // Socket Authentication Middleware via JWT
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

      if (!token) {
        return next(new Error('Socket authentication error: Token missing.'));
      }

      if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lifelink_default_secret_key_change_in_production');
      const user = await User.findById(decoded.id).select('-password');

      if (!user || !user.isActive) {
        return next(new Error('Socket authentication error: User inactive or not found.'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error(`Socket authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const userRole = socket.user.role;

    // Join personal user room
    socket.join(`user:${userId}`);

    // Join role-based room (e.g. role:DONOR, role:HOSPITAL, role:PATIENT, role:ADMIN)
    socket.join(`role:${userRole}`);

    socket.emit('connected', {
      message: 'LifeLink real-time notification socket connected.',
      userId,
      role: userRole
    });

    socket.on('join_request', (requestId) => {
      if (requestId) {
        socket.join(`request:${requestId}`);
      }
    });

    socket.on('leave_request', (requestId) => {
      if (requestId) {
        socket.leave(`request:${requestId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      // Disconnection handled cleanly
    });
  });

  return io;
};

/**
 * Get active Socket.IO server instance
 */
export const getIO = () => io;

/**
 * Emit event to a specific user by ID
 */
export const emitToUser = (userId, event, payload) => {
  if (!io) return false;
  const targetId = userId?._id ? userId._id.toString() : userId.toString();
  return io.to(`user:${targetId}`).emit(event, payload);
};

/**
 * Emit event to all users within a specific role
 */
export const emitToRole = (role, event, payload) => {
  if (!io) return false;
  return io.to(`role:${role}`).emit(event, payload);
};

/**
 * Emit event to subscribers of a specific blood request room
 */
export const emitToRequest = (requestId, event, payload) => {
  if (!io) return false;
  return io.to(`request:${requestId}`).emit(event, payload);
};

/**
 * Broadcast event to all connected sockets
 */
export const broadcastEvent = (event, payload) => {
  if (!io) return false;
  return io.emit(event, payload);
};

