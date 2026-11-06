import { Router } from 'express';
import { HospitalController } from '../controllers/hospital.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Public / Authenticated Directory of Hospitals
router.get('/', HospitalController.listHospitals);

// All routes below require authentication
router.use(authenticate);

// Admin-only verification route
router.patch(
  '/:id/verify',
  authorizeRoles(ROLES.ADMIN),
  HospitalController.verifyHospital
);

// Hospital Profile Management
router.get(
  '/profile',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getProfile
);

router.put(
  '/profile',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.updateProfile
);

// Hospital Dashboard Statistics (100% Real MongoDB)
router.get(
  '/dashboard/stats',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getDashboardStats
);

// Blood Inventory Management
router.get(
  '/inventory',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getInventory
);

router.patch(
  '/inventory/threshold',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.updateInventoryThreshold
);

router.get(
  '/inventory/batches',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getStockBatches
);

router.post(
  '/inventory/stock-in',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.stockIn
);

router.post(
  '/inventory/stock-out',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.stockOut
);

router.post(
  '/inventory/discard-expired',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.discardExpired
);

// Staff Management
router.get(
  '/staff',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getStaff
);

router.post(
  '/staff',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.addStaff
);

router.put(
  '/staff/:staffId',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.updateStaff
);

router.delete(
  '/staff/:staffId',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.removeStaff
);

// Transactions / Activity Audit
router.get(
  '/transactions',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getTransactions
);

// Analytics & Reports
router.get(
  '/analytics',
  authorizeRoles(ROLES.HOSPITAL, ROLES.ADMIN),
  HospitalController.getAnalytics
);

export default router;

