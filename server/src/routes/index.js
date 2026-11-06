import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import donorRoutes from './donor.routes.js';
import bloodRequestRoutes from './bloodRequest.routes.js';
import matchingRoutes from './matching.routes.js';
import invitationRoutes from './invitation.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/donors', donorRoutes);
router.use('/blood-requests', bloodRequestRoutes);
router.use('/matching', matchingRoutes);
router.use('/invitations', invitationRoutes);
router.use('/notifications', notificationRoutes);

export default router;
