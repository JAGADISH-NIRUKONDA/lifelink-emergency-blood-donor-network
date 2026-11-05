import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe
} from '../controllers/auth.controller.js';
import {
  validateRegister,
  validateLogin
} from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Public Authentication Endpoints
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected Authentication Endpoints
router.get('/me', authenticate, getMe);

// Role-protected test verification routes
router.get(
  '/admin-check',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  (req, res) => {
    res.json(
      new ApiResponse(
        200,
        { role: req.user.role, access: 'granted' },
        'Admin authorization verified successfully.'
      )
    );
  }
);

router.get(
  '/hospital-check',
  authenticate,
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  (req, res) => {
    res.json(
      new ApiResponse(
        200,
        { role: req.user.role, access: 'granted' },
        'Hospital authorization verified successfully.'
      )
    );
  }
);

export default router;

