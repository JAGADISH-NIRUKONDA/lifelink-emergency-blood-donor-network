import { ApiError } from '../utils/apiError.js';
import { BLOOD_GROUPS, DONOR_AVAILABILITY_STATUS_LIST } from '../utils/constants.js';

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
    availabilityStatus,
    lastDonationDate,
    dateOfBirth,
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

  // Date of Birth / Last Donation Date Validation (cannot be in the future)
  if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== '') {
    const parsedDob = new Date(dateOfBirth);
    if (isNaN(parsedDob.getTime())) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Invalid dateOfBirth format. Please provide a valid ISO date string.'
      });
    } else if (parsedDob > new Date()) {
      errors.push({
        field: 'dateOfBirth',
        message: 'Date of birth cannot be in the future.'
      });
    }
  }

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

  if (availabilityStatus !== undefined && !DONOR_AVAILABILITY_STATUS_LIST.includes(availabilityStatus)) {
    errors.push({
      field: 'availabilityStatus',
      message: `Invalid availabilityStatus. Allowed: ${DONOR_AVAILABILITY_STATUS_LIST.join(', ')}`
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
  const { isAvailable, availabilityStatus } = req.body;

  const hasBool = typeof isAvailable === 'boolean';
  const hasStatus = typeof availabilityStatus === 'string' && DONOR_AVAILABILITY_STATUS_LIST.includes(availabilityStatus);

  if (!hasBool && !hasStatus) {
    return next(
      new ApiError(
        400,
        `Validation failed: provide either a boolean isAvailable or valid availabilityStatus (${DONOR_AVAILABILITY_STATUS_LIST.join(', ')}).`,
        [{ field: 'isAvailable', message: 'isAvailable or availabilityStatus is required' }]
      )
    );
  }

  next();
};

/**
 * Validate recording a verified donation
 */
export const validateDonationRecord = (req, res, next) => {
  const { hospitalName, bloodGroup, units, donationDate } = req.body;
  const errors = [];

  if (!hospitalName || typeof hospitalName !== 'string' || !hospitalName.trim()) {
    errors.push({ field: 'hospitalName', message: 'Hospital name is required.' });
  }

  if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push({ field: 'bloodGroup', message: `Valid bloodGroup is required (${BLOOD_GROUPS.join(', ')}).` });
  }

  if (units !== undefined) {
    const numUnits = Number(units);
    if (isNaN(numUnits) || numUnits < 1 || numUnits > 10) {
      errors.push({ field: 'units', message: 'Units must be between 1 and 10.' });
    }
  }

  if (donationDate) {
    const parsed = new Date(donationDate);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'donationDate', message: 'Invalid donation date.' });
    } else if (parsed > new Date()) {
      errors.push({ field: 'donationDate', message: 'Donation date cannot be in the future.' });
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for donation record', errors));
  }

  next();
};

/**
 * Validate donor response to blood request
 */
export const validateRequestResponse = (req, res, next) => {
  const { response } = req.body;
  const validResponses = ['ACCEPTED', 'REJECTED', 'INTERESTED'];

  if (!response || !validResponses.includes(response)) {
    return next(
      new ApiError(400, `Validation failed: response must be one of: ${validResponses.join(', ')}`, [
        { field: 'response', message: `Invalid response status. Allowed: ${validResponses.join(', ')}` }
      ])
    );
  }

  next();
};
