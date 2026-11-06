import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateMyAvailability,
  getMyDashboard,
  getNearbyRequests,
  respondToBloodRequest,
  getDonationHistory,
  recordDonation,
  getDonorAnalytics,
  getEligibilityInfo,
  getAllDonors,
  getDonorById,
  updateDonorById,
  deleteDonorById
} from '../controllers/donor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  validateDonorProfileUpdate,
  validateAvailability,
  validateDonationRecord,
  validateRequestResponse
} from '../middleware/donorValidate.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// All donor routes require authentication
router.use(authenticate);

// 1. Authenticated Donor Self-Management & Modules (DONOR, ADMIN)
router.get('/dashboard', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), getMyDashboard);
router.get('/profile', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), getMyProfile);
router.put('/profile', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), validateDonorProfileUpdate, updateMyProfile);
router.patch('/availability', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), validateAvailability, updateMyAvailability);
router.get('/eligibility', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), getEligibilityInfo);
router.get('/analytics', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), getDonorAnalytics);

// 2. Blood Request Discovery & Response
router.get('/requests/nearby', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), getNearbyRequests);
router.post('/requests/:requestId/respond', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), validateRequestResponse, respondToBloodRequest);

// 3. Donation History Management
router.get('/donation-history', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), getDonationHistory);
router.post('/donation-history', authorizeRoles(ROLES.DONOR, ROLES.ADMIN), validateDonationRecord, recordDonation);

// 4. Directory Querying (Admin & Hospital Access)
router.get('/', authorizeRoles(ROLES.ADMIN, ROLES.HOSPITAL), getAllDonors);

// 5. Donor by ID Management (Self or Admin/Hospital as appropriate)
router.get('/:id', getDonorById);
router.put('/:id', validateDonorProfileUpdate, updateDonorById);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteDonorById);

export default router;
