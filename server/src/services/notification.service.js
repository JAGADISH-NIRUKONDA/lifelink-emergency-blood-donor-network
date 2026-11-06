import { Notification } from '../models/notification.model.js';
import { ApiError } from '../utils/apiError.js';
import { emitToUser } from '../sockets/notification.socket.js';
import { REQUEST_PRIORITIES } from '../utils/constants.js';

class NotificationService {
  /**
   * Persists a notification to MongoDB and emits real-time event via Socket.IO
   */
  async createNotification({
    recipient,
    type,
    title,
    message,
    data = {},
    priority = REQUEST_PRIORITIES.NORMAL
  }) {
    if (!recipient) {
      throw new ApiError(400, 'Notification recipient ID is required');
    }

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data,
      priority,
      isRead: false
    });

    // Real-time dispatch via Socket.IO if socket server is initialized
    try {
      emitToUser(recipient, 'notification:new', notification);
      const unreadCount = await this.getUnreadCount(recipient);
      emitToUser(recipient, 'notification:unread_count', { count: unreadCount });
    } catch (err) {
      // Sockets should never fail database persistence
    }

    return notification;
  }

  /**
   * Dispatches notifications to multiple users in bulk
   */
  async notifyUsers(recipients = [], payload = {}) {
    if (!Array.isArray(recipients) || recipients.length === 0) return [];

    const createdNotifications = [];
    for (const recipientId of recipients) {
      try {
        const notif = await this.createNotification({
          ...payload,
          recipient: recipientId
        });
        createdNotifications.push(notif);
      } catch (err) {
        // Continue notifying remaining users
      }
    }
    return createdNotifications;
  }

  /**
   * Retrieves paginated notifications for the authenticated user
   */
  async getUserNotifications(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = { recipient: userId };

    if (query.isRead !== undefined && query.isRead !== '') {
      filter.isRead = query.isRead === 'true' || query.isRead === true;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.priority) {
      filter.priority = query.priority.toUpperCase();
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Retrieves count of unread notifications for a user
   */
  async getUnreadCount(userId) {
    return Notification.countDocuments({ recipient: userId, isRead: false });
  }

  /**
   * Marks a single notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found or unauthorized access.');
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      // Emit updated count to socket
      const unreadCount = await this.getUnreadCount(userId);
      emitToUser(userId, 'notification:unread_count', { count: unreadCount });
    }

    return notification;
  }

  /**
   * Marks all notifications as read for a user
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    // Emit updated count to socket
    emitToUser(userId, 'notification:unread_count', { count: 0 });

    return {
      success: true,
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Deletes a notification (with ownership check)
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found or unauthorized access.');
    }

    // Refresh unread count if deleted item was unread
    if (!notification.isRead) {
      const unreadCount = await this.getUnreadCount(userId);
      emitToUser(userId, 'notification:unread_count', { count: unreadCount });
    }

    return { success: true, message: 'Notification deleted successfully.' };
  }
}

export const notificationService = new NotificationService();

