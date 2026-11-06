import mongoose from 'mongoose';
import { NOTIFICATION_TYPE_LIST, REQUEST_PRIORITIES, REQUEST_PRIORITY_LIST } from '../utils/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPE_LIST,
        message: '{VALUE} is not a valid notification type'
      },
      required: [true, 'Notification type is mandatory'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is mandatory'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is mandatory'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    priority: {
      type: String,
      enum: {
        values: REQUEST_PRIORITY_LIST,
        message: '{VALUE} is not a valid priority'
      },
      default: REQUEST_PRIORITIES.NORMAL,
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user unread notifications efficiently
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);

