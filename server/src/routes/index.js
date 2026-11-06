import { Router } from 'express';
import authRoutes from './auth.routes.js';
import healthRoutes from './health.routes.js';
import donorRoutes from './donor.routes.js';
import bloodRequestRoutes from './bloodRequest.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
router.use('/donors', donorRoutes);
router.use('/blood-requests', bloodRequestRoutes);

export default router;
