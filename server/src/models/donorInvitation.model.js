import mongoose from 'mongoose';
import {
  INVITATION_STATUS,
  INVITATION_STATUS_LIST,
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LIST
} from '../utils/constants.js';

const donorInvitationSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      required: [true, 'Blood request reference is required'],
      index: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
      index: true
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: {
        values: INVITATION_STATUS_LIST,
        message: '{VALUE} is not a valid invitation status'
      },
      default: INVITATION_STATUS.INVITED,
      index: true
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
    matchScore: {
      type: Number,
      default: 0
    },
    compatibilityDetails: {
      compatibleBloodGroup: { type: String, default: '' },
      isExactMatch: { type: Boolean, default: false },
      isSameCity: { type: Boolean, default: false }
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: [true, 'Invitation expiry timestamp is mandatory']
    },
    respondedAt: {
      type: Date,
      default: null
    },
    responseNotes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Response notes cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate invitations for the same blood request and donor
donorInvitationSchema.index({ request: 1, donor: 1 }, { unique: true });

// Check whether invitation has expired
donorInvitationSchema.methods.hasExpired = function () {
  return this.status === INVITATION_STATUS.INVITED && new Date() > new Date(this.expiresAt);
};

export const DonorInvitation = mongoose.model('DonorInvitation', donorInvitationSchema);

