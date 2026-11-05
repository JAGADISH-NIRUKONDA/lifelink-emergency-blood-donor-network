import { ApiError } from '../utils/apiError.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * Checks if req.user has one of the allowed roles.
 * Must be used after authenticate middleware.
 *
 * @param  {...string} allowedRoles - List of authorized roles (e.g., 'ADMIN', 'HOSPITAL')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(401, 'Authentication required before checking authorization.')
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

