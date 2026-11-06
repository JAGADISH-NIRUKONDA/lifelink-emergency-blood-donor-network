import { Router } from 'express';
import { MatchingController } from '../controllers/matching.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// All matching routes require authentication
router.use(authenticate);

// Donor access to their own invitations
router.get(
  '/my-invitations',
  authorizeRoles(ROLES.DONOR, ROLES.ADMIN),
  MatchingController.getMyInvitations
);

// Hospital and Admin operations
router.post(
  '/:requestId/run',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  MatchingController.runMatching
);

router.get(
  '/:requestId',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  MatchingController.getMatching
);

router.post(
  '/:requestId/invite',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  MatchingController.sendInvitations
);

export default router;

