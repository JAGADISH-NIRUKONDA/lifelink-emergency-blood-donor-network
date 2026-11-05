import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Authentication Middleware
 * Validates JWT access token from Authorization header (Bearer schema).
 * Attaches authenticated user document to req.user.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(
        401,
        'Authentication required. Please provide a valid Bearer token in Authorization header.'
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new ApiError(500, 'JWT secret is not configured on the server.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token has expired. Please log in again.');
      }
      throw new ApiError(401, 'Invalid or malformed authentication token.');
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User account associated with this token no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

