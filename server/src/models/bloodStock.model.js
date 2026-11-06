import mongoose from 'mongoose';
import {
  BLOOD_GROUPS,
  BLOOD_COMPONENT_LIST,
  BLOOD_COMPONENTS,
  STOCK_BATCH_STATUS,
  STOCK_BATCH_STATUS_LIST
} from '../utils/constants.js';

const bloodStockSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hospital reference is required'],
      index: true
    },
    batchNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group'
      },
      required: [true, 'Blood group is mandatory'],
      index: true
    },
    componentType: {
      type: String,
      enum: {
        values: BLOOD_COMPONENT_LIST,
        message: '{VALUE} is not a valid component type'
      },
      default: BLOOD_COMPONENTS.WHOLE_BLOOD
    },
    units: {
      type: Number,
      required: [true, 'Original units amount is mandatory'],
      min: [1, 'At least 1 unit must be entered']
    },
    remainingUnits: {
      type: Number,
      required: true,
      min: [0, 'Remaining units cannot be negative']
    },
    collectionDate: {
      type: Date,
      required: [true, 'Collection date is mandatory']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is mandatory'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: STOCK_BATCH_STATUS_LIST,
        message: '{VALUE} is not a valid batch status'
      },
      default: STOCK_BATCH_STATUS.AVAILABLE,
      index: true
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    donorName: {
      type: String,
      trim: true,
      default: ''
    },
    storageLocation: {
      type: String,
      trim: true,
      default: 'Refrigeration Unit A-1'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

bloodStockSchema.methods.hasExpired = function () {
  return (
    this.status === STOCK_BATCH_STATUS.AVAILABLE &&
    new Date() > new Date(this.expiryDate)
  );
};

export const BloodStock = mongoose.model('BloodStock', bloodStockSchema);

