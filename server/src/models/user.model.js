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
      department: { type: String, trim: true, default: '' }
    },
    donorDetails: {
      lastDonationDate: { type: Date, default: null },
      isAvailable: { type: Boolean, default: true },
      eligibilityStatus: {
        type: String,
        enum: ['PENDING_SCREENING', 'VERIFIED_ELIGIBLE', 'TEMPORARILY_INELIGIBLE'],
        default: 'PENDING_SCREENING'
      }
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

