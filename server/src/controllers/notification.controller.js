import { notificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  /**
   * Get notifications for authenticated user
   * GET /api/v1/notifications
   */
  static async getNotifications(req, res, next) {
    try {
      const result = await notificationService.getUserNotifications(req.user._id, req.query);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Notifications retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notifications count
   * GET /api/v1/notifications/unread-count
   */
  static async getUnreadCount(req, res, next) {
    try {
      const count = await notificationService.getUnreadCount(req.user._id);

      return res
        .status(200)
        .json(new ApiResponse(200, { unreadCount: count }, 'Unread count retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark single notification as read
   * PATCH /api/v1/notifications/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.markAsRead(id, req.user._id);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Notification marked as read.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await notificationService.markAllAsRead(req.user._id);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'All notifications marked as read.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete single notification
   * DELETE /api/v1/notifications/:id
   */
  static async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const result = await notificationService.deleteNotification(id, req.user._id);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Notification deleted successfully.'));
    } catch (error) {
      next(error);
    }
  }
}

