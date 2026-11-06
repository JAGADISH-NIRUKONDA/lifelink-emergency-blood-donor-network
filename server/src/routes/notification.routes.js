import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// Get paginated notifications
router.get('/', NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark single notification as read
router.patch('/:id/read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

export default router;

