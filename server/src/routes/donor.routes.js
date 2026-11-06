import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  getMyDashboard,
  getAllDonors,
  getDonorById,
  updateDonorById,
  deleteDonorById
} from '../controllers/donor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  validateDonorProfileUpdate,
  validateAvailability
} from '../middleware/donorValidate.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// All donor routes require authentication
router.use(authenticate);

// 1. Authenticated Donor Self Management
router.get('/profile', getMyProfile);
router.put('/profile', validateDonorProfileUpdate, updateMyProfile);
router.patch('/availability', validateAvailability, updateMyAvailability);
router.get('/dashboard', getMyDashboard);

// 2. Directory Querying (Admin & Hospital Access)
router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.HOSPITAL), getAllDonors);

// 3. Donor by ID Management (Self or Admin/Hospital as appropriate)
router.get('/:id', getDonorById);
router.put('/:id', validateDonorProfileUpdate, updateDonorById);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteDonorById);

export default router;

