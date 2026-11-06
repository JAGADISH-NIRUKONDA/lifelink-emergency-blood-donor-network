import mongoose from 'mongoose';
import {
  BLOOD_GROUPS,
  REQUEST_STATUS,
  REQUEST_STATUS_LIST,
  REQUEST_PRIORITIES,
  REQUEST_PRIORITY_LIST,
  VALID_STATUS_TRANSITIONS
} from '../utils/constants.js';

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      index: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient/Requester ID is required'],
      index: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Patient name must be at least 2 characters long'],
      maxlength: [100, 'Patient name cannot exceed 100 characters']
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group. Allowed: ' + BLOOD_GROUPS.join(', ')
      },
      index: true
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Units required is mandatory'],
      min: [1, 'At least 1 unit must be requested'],
      max: [20, 'Cannot request more than 20 units in a single requisition']
    },
    unitsFulfilled: {
      type: Number,
      default: 0,
      min: [0, 'Fulfilled units cannot be negative']
    },
    hospital: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    city: {
      type: String,
      required: [true, 'City/Region is required'],
      trim: true,
      index: true
    },
    requiredDate: {
      type: Date,
      required: [true, 'Required date is mandatory']
    },
    priority: {
      type: String,
      enum: {
        values: REQUEST_PRIORITY_LIST,
        message: '{VALUE} is not a valid priority. Allowed: ' + REQUEST_PRIORITY_LIST.join(', ')
      },
      default: REQUEST_PRIORITIES.NORMAL,
      index: true
    },
    status: {
      type: String,
      enum: {
        values: REQUEST_STATUS_LIST,
        message: '{VALUE} is not a valid status'
      },
      default: REQUEST_STATUS.PENDING,
      index: true
    },
    medicalNotes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Medical notes cannot exceed 1000 characters']
    },
    contactPhone: {
      type: String,
      required: [true, 'Emergency contact phone is required'],
      trim: true
    },
    attendantName: {
      type: String,
      trim: true,
      default: ''
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: ''
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: ''
    },
    matchedDonors: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        matchedAt: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: ['NOTIFIED', 'CONFIRMED', 'DECLINED'],
          default: 'NOTIFIED'
        }
      }
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: REQUEST_STATUS_LIST,
          required: true
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        note: {
          type: String,
          default: ''
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate readable request ID if not provided
bloodRequestSchema.pre('save', function (next) {
  if (!this.requestId) {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    this.requestId = `BLR-${timestamp}-${randomHex}`;
  }
  next();
});

// Helper instance method to check whether transition is valid
bloodRequestSchema.methods.canTransitionTo = function (nextStatus) {
  const allowed = VALID_STATUS_TRANSITIONS[this.status] || [];
  return allowed.includes(nextStatus);
};

export const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);

