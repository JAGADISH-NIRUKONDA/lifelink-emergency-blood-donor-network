import mongoose from 'mongoose';
import { BLOOD_GROUPS } from '../utils/constants.js';

const bloodInventorySchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hospital reference is required'],
      index: true
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group'
      },
      required: [true, 'Blood group is mandatory']
    },
    unitsAvailable: {
      type: Number,
      min: [0, 'Available units cannot be negative'],
      default: 0
    },
    unitsReserved: {
      type: Number,
      min: [0, 'Reserved units cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      min: [1, 'Threshold must be at least 1 unit'],
      default: 5
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'Central Blood Bank Cold Storage'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// One inventory record per blood group per hospital
bloodInventorySchema.index({ hospital: 1, bloodGroup: 1 }, { unique: true });

export const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);

