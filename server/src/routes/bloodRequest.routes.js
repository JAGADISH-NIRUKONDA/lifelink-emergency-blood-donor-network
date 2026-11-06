import { Router } from 'express';
import {
  createBloodRequest,
  getMyRequests,
  getRequestDetails,
  cancelBloodRequest,
  listAllRequests,
  updateRequestStatus,
  getMatchingDonors,
  getRequestStats
} from '../controllers/bloodRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  validateCreateRequest,
  validateStatusUpdate
} from '../middleware/bloodRequestValidate.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// All blood request routes require authentication
router.use(authenticate);

// 1. Patient Requisitions & Personal Management
router.post('/', validateCreateRequest, createBloodRequest);
router.get('/my-requests', getMyRequests);
router.get('/dashboard/stats', getRequestStats);

// 2. Hospital & Admin Management Directory
router.get('/', authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN), listAllRequests);

// 3. Request Specific Operations
router.get('/:id', getRequestDetails);
router.patch('/:id/cancel', cancelBloodRequest);
router.patch(
  '/:id/status',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  validateStatusUpdate,
  updateRequestStatus
);
router.get(
  '/:id/matching-donors',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN, ROLES.PATIENT),
  getMatchingDonors
);

export default router;

