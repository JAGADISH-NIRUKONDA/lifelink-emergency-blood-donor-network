import mongoose from 'mongoose';
import { STAFF_ROLE_LIST, STAFF_ROLES } from '../utils/constants.js';

const hospitalStaffSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hospital reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Staff member name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
      type: String,
      required: [true, 'Staff email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: {
        values: STAFF_ROLE_LIST,
        message: '{VALUE} is not a valid staff role'
      },
      default: STAFF_ROLES.LAB_TECHNICIAN
    },
    department: {
      type: String,
      trim: true,
      default: 'Blood Transfusion Service'
    },
    shift: {
      type: String,
      enum: ['MORNING', 'EVENING', 'NIGHT', 'ROTATING'],
      default: 'MORNING'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

hospitalStaffSchema.index({ hospital: 1, email: 1 }, { unique: true });

export const HospitalStaff = mongoose.model('HospitalStaff', hospitalStaffSchema);

