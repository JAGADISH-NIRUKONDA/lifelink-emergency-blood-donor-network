import { ApiError } from '../utils/apiError.js';
import { BLOOD_GROUPS } from '../utils/constants.js';

/**
 * Validate donor profile update payload
 */
export const validateDonorProfileUpdate = (req, res, next) => {
  const {
    bloodGroup,
    phone,
    city,
    state,
    address,
    postalCode,
    isAvailable,
    lastDonationDate,
    age,
    weight,
    gender,
    emergencyContact,
    totalDonations
  } = req.body;

  const errors = [];

  // Blood Group Validation
  if (bloodGroup !== undefined && bloodGroup !== '') {
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      errors.push({
        field: 'bloodGroup',
        message: `Invalid blood group '${bloodGroup}'. Allowed groups: ${BLOOD_GROUPS.join(', ')}`
      });
    }
  }

  // Last Donation Date Validation (cannot be in the future)
  if (lastDonationDate !== undefined && lastDonationDate !== null && lastDonationDate !== '') {
    const parsedDate = new Date(lastDonationDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push({
        field: 'lastDonationDate',
        message: 'Invalid lastDonationDate format. Please provide a valid ISO date string.'
      });
    } else if (parsedDate > new Date()) {
      errors.push({
        field: 'lastDonationDate',
        message: 'Last donation date cannot be in the future.'
      });
    }
  }

  // Age Validation
  if (age !== undefined && age !== null && age !== '') {
    const numAge = Number(age);
    if (isNaN(numAge) || numAge < 16 || numAge > 100) {
      errors.push({
        field: 'age',
        message: 'Age must be a valid number between 16 and 100.'
      });
    }
  }

  // Weight Validation
  if (weight !== undefined && weight !== null && weight !== '') {
    const numWeight = Number(weight);
    if (isNaN(numWeight) || numWeight < 30 || numWeight > 250) {
      errors.push({
        field: 'weight',
        message: 'Weight must be a valid number between 30 kg and 250 kg.'
      });
    }
  }

  // Availability Validation
  if (isAvailable !== undefined && typeof isAvailable !== 'boolean') {
    errors.push({
      field: 'isAvailable',
      message: 'isAvailable must be a boolean (true or false).'
    });
  }

  // Gender Validation
  const validGenders = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', ''];
  if (gender !== undefined && !validGenders.includes(gender)) {
    errors.push({
      field: 'gender',
      message: `Invalid gender '${gender}'. Allowed: ${validGenders.join(', ')}`
    });
  }

  // Total Donations Validation
  if (totalDonations !== undefined) {
    const numDonations = Number(totalDonations);
    if (isNaN(numDonations) || numDonations < 0 || !Number.isInteger(numDonations)) {
      errors.push({
        field: 'totalDonations',
        message: 'totalDonations must be a non-negative integer.'
      });
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for donor profile input', errors));
  }

  next();
};

/**
 * Validate availability toggle payload
 */
export const validateAvailability = (req, res, next) => {
  const { isAvailable } = req.body;

  if (typeof isAvailable !== 'boolean') {
    return next(
      new ApiError(400, 'Validation failed: isAvailable field is required and must be a boolean (true or false).', [
        { field: 'isAvailable', message: 'isAvailable must be a boolean' }
      ])
    );
  }

  next();
};

