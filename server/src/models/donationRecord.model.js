import mongoose from 'mongoose';
import {
  BLOOD_GROUPS,
  DONATION_RECORD_STATUS,
  DONATION_RECORD_STATUS_LIST,
  BLOOD_COMPONENTS,
  BLOOD_COMPONENT_LIST
} from '../utils/constants.js';

const donationRecordSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is mandatory'],
      index: true
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital or blood center name is mandatory'],
      trim: true
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group'
      },
      required: [true, 'Blood group is mandatory']
    },
    units: {
      type: Number,
      required: [true, 'Number of donated units is mandatory'],
      min: [1, 'Must record at least 1 donated unit'],
      default: 1
    },
    donationDate: {
      type: Date,
      required: [true, 'Donation date is mandatory'],
      default: Date.now,
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
    status: {
      type: String,
      enum: {
        values: DONATION_RECORD_STATUS_LIST,
        message: '{VALUE} is not a valid donation status'
      },
      default: DONATION_RECORD_STATUS.VERIFIED,
      index: true
    },
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null
    },
    certificateNumber: {
      type: String,
      trim: true,
      default: ''
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

// Indexes for fast donor history queries
donationRecordSchema.index({ donor: 1, donationDate: -1 });
donationRecordSchema.index({ donor: 1, status: 1 });

export const DonationRecord = mongoose.model('DonationRecord', donationRecordSchema);

