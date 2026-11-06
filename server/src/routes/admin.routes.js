import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { AuditLogController } from '../controllers/auditLog.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

// Protect ALL admin routes with authentication & Super Admin role authorization
router.use(authenticate, authorizeRoles(ROLES.ADMIN));

// Dashboard KPIs
router.get('/kpis', AdminController.getDashboardKPIs);

// User Management
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);

// Hospital Oversight & Verification
router.get('/hospitals/pending', AdminController.getPendingHospitals);
router.get('/hospitals', AdminController.getAllHospitals);
router.patch('/hospitals/:id/verify', AdminController.verifyHospital);
router.patch('/hospitals/:id/reject', AdminController.rejectHospital);

// Blood Requests System-wide Monitoring
router.get('/blood-requests', AdminController.getBloodRequests);
router.patch('/blood-requests/:id/status', AdminController.overrideRequestStatus);

// Inventory System-wide Oversight
router.get('/inventory', AdminController.getInventoryOverview);

// Platform Announcements & Emergency Broadcasts
router.post('/broadcast', AdminController.broadcastAnnouncement);

// Platform Analytics
router.get('/analytics/overview', AnalyticsController.getOverviewMetrics);
router.get('/analytics/registrations', AnalyticsController.getRegistrationTrends);
router.get('/analytics/blood-requests', AnalyticsController.getRequestTrends);
router.get('/analytics/blood-groups', AnalyticsController.getBloodGroupDistribution);
router.get('/analytics/priorities', AnalyticsController.getPriorityBreakdown);
router.get('/analytics/hospitals', AnalyticsController.getHospitalPerformance);

// Audit Logging
router.get('/audit-logs', AuditLogController.getAuditLogs);
router.get('/audit-logs/:id', AuditLogController.getAuditLogById);

export default router;

