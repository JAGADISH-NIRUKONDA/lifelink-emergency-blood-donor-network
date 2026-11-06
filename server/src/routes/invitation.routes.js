import { Router } from 'express';
import { InvitationController } from '../controllers/invitation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// All invitation routes require authentication
router.use(authenticate);

// Donor actions on invitations
router.post(
  '/:id/accept',
  authorizeRoles(ROLES.DONOR),
  InvitationController.acceptInvitation
);

router.post(
  '/:id/reject',
  authorizeRoles(ROLES.DONOR),
  InvitationController.rejectInvitation
);

// View invitation details (RBAC checked inside controller)
router.get('/:id', InvitationController.getInvitationById);

export default router;

