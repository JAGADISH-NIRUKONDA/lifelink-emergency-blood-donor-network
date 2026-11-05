import { ApiError } from '../utils/apiError.js';
import { ROLE_LIST, BLOOD_GROUPS } from '../utils/constants.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate User Registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, role, bloodGroup } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters long' });
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.push({ field: 'password', message: 'Password is required and must be at least 8 characters long' });
  }

  if (role && !ROLE_LIST.includes(role)) {
    errors.push({
      field: 'role',
      message: `Invalid role '${role}'. Allowed roles: ${ROLE_LIST.join(', ')}`
    });
  }

  if (bloodGroup && !BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push({
      field: 'bloodGroup',
      message: `Invalid blood group '${bloodGroup}'. Allowed: ${BLOOD_GROUPS.join(', ')}`
    });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for registration input', errors));
  }

  next();
};

/**
 * Validate User Login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for login credentials', errors));
  }

  next();
};

