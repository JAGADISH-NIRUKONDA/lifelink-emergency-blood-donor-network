import mongoose from 'mongoose';
import {
  BLOOD_GROUPS,
  STOCK_TRANSACTION_TYPES,
  STOCK_TRANSACTION_TYPE_LIST
} from '../utils/constants.js';

const bloodTransactionSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Hospital reference is required'],
      index: true
    },
    transactionType: {
      type: String,
      enum: {
        values: STOCK_TRANSACTION_TYPE_LIST,
        message: '{VALUE} is not a valid transaction type'
      },
      required: [true, 'Transaction type is mandatory'],
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
    units: {
      type: Number,
      required: [true, 'Number of units is mandatory'],
      min: [1, 'Must transact at least 1 unit']
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodStock',
      default: null
    },
    batchNumber: {
      type: String,
      trim: true,
      default: ''
    },
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null
    },
    patientName: {
      type: String,
      trim: true,
      default: ''
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User performing transaction is mandatory']
    },
    reason: {
      type: String,
      trim: true,
      default: ''
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

export const BloodTransaction = mongoose.model('BloodTransaction', bloodTransactionSchema);

