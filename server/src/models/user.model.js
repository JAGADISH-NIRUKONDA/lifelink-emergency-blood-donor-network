import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLE_LIST, ROLES, BLOOD_GROUPS } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Crucial: Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ROLE_LIST,
        message: '{VALUE} is not a valid user role. Allowed: ' + ROLE_LIST.join(', ')
      },
      default: ROLES.DONOR
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    bloodGroup: {
      type: String,
      enum: {
        values: [...BLOOD_GROUPS, ''],
        message: '{VALUE} is not a valid blood group'
      },
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    hospitalDetails: {
      licenseNumber: { type: String, trim: true, default: '' },
      facilityName: { type: String, trim: true, default: '' },
      department: { type: String, trim: true, default: '' },
      hospitalType: {
        type: String,
        enum: ['GOVERNMENT', 'PRIVATE', 'TRUST', 'MILITARY', 'CLINIC', ''],
        default: 'PRIVATE'
      },
      registrationNumber: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      emergencyHotline: { type: String, trim: true, default: '' },
      totalBeds: { type: Number, min: 0, default: 0 },
      bloodBankLicense: { type: String, trim: true, default: '' },
      isVerified: { type: Boolean, default: false },
      verificationStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED'],
        default: 'PENDING'
      },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      verificationNotes: { type: String, trim: true, default: '' }
    },
    donorDetails: {
      lastDonationDate: { type: Date, default: null },
      isAvailable: { type: Boolean, default: true },
      availabilityStatus: {
        type: String,
        enum: ['AVAILABLE', 'UNAVAILABLE', 'PAUSED'],
        default: 'AVAILABLE'
      },
      availabilityUpdatedAt: { type: Date, default: Date.now },
      availabilityNotes: { type: String, trim: true, default: '' },
      eligibilityStatus: {
        type: String,
        enum: [
          'PENDING_SCREENING',
          'VERIFIED_ELIGIBLE',
          'TEMPORARILY_INELIGIBLE',
          'PERMANENTLY_INELIGIBLE'
        ],
        default: 'PENDING_SCREENING'
      },
      dateOfBirth: { type: Date, default: null },
      avatar: { type: String, trim: true, default: '' },
      age: { type: Number, min: 16, max: 100, default: null },
      weight: { type: Number, min: 30, max: 250, default: null },
      gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', ''],
        default: ''
      },
      address: { type: String, trim: true, default: '' },
      state: { type: String, trim: true, default: '' },
      postalCode: { type: String, trim: true, default: '' },
      emergencyContact: { type: String, trim: true, default: '' },
      emergencyContactName: { type: String, trim: true, default: '' },
      totalDonations: { type: Number, min: 0, default: 0 },
      medicalNotes: { type: String, trim: true, default: '' },
      profileCompletion: { type: Number, min: 0, max: 100, default: 0 }
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

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare plain password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error('Password field not selected in database query');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate signed JWT access token
userSchema.methods.generateAuthToken = function () {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

// Override toJSON to ensure sensitive fields are never exposed in API responses
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

export const User = mongoose.model('User', userSchema);

