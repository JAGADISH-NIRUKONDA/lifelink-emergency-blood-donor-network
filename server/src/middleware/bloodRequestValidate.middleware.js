import { ApiError } from '../utils/apiError.js';
import {
  BLOOD_GROUPS,
  REQUEST_STATUS_LIST,
  REQUEST_PRIORITY_LIST
} from '../utils/constants.js';

export const validateCreateRequest = (req, res, next) => {
  const {
    patientName,
    bloodGroup,
    unitsRequired,
    hospital,
    city,
    requiredDate,
    contactPhone,
    priority,
    medicalNotes
  } = req.body;

  const errors = [];

  if (!patientName || typeof patientName !== 'string' || patientName.trim().length < 2) {
    errors.push({ field: 'patientName', message: 'Patient name is required (at least 2 characters)' });
  }

  if (!bloodGroup || !BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push({
      field: 'bloodGroup',
      message: `Invalid blood group. Allowed: ${BLOOD_GROUPS.join(', ')}`
    });
  }

  const units = Number(unitsRequired);
  if (!unitsRequired || isNaN(units) || units < 1 || units > 20 || !Number.isInteger(units)) {
    errors.push({
      field: 'unitsRequired',
      message: 'Units required must be an integer between 1 and 20'
    });
  }

  if (!hospital || typeof hospital !== 'string' || hospital.trim().length < 2) {
    errors.push({ field: 'hospital', message: 'Treating hospital name is required' });
  }

  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    errors.push({ field: 'city', message: 'City or medical district location is required' });
  }

  if (!requiredDate) {
    errors.push({ field: 'requiredDate', message: 'Required date is mandatory' });
  } else {
    const parsed = new Date(requiredDate);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'requiredDate', message: 'Invalid required date format' });
    }
  }

  if (!contactPhone || typeof contactPhone !== 'string' || contactPhone.trim().length < 6) {
    errors.push({ field: 'contactPhone', message: 'Valid contact phone number is required' });
  }

  if (priority && !REQUEST_PRIORITY_LIST.includes(priority)) {
    errors.push({
      field: 'priority',
      message: `Invalid priority '${priority}'. Allowed: ${REQUEST_PRIORITY_LIST.join(', ')}`
    });
  }

  if (medicalNotes && typeof medicalNotes === 'string' && medicalNotes.length > 1000) {
    errors.push({
      field: 'medicalNotes',
      message: 'Medical notes cannot exceed 1000 characters'
    });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for blood request input', errors));
  }

  next();
};

export const validateStatusUpdate = (req, res, next) => {
  const { status, unitsFulfilled } = req.body;
  const errors = [];

  if (!status || !REQUEST_STATUS_LIST.includes(status)) {
    errors.push({
      field: 'status',
      message: `Valid status is required. Allowed: ${REQUEST_STATUS_LIST.join(', ')}`
    });
  }

  if (unitsFulfilled !== undefined) {
    const units = Number(unitsFulfilled);
    if (isNaN(units) || units < 0 || !Number.isInteger(units)) {
      errors.push({
        field: 'unitsFulfilled',
        message: 'unitsFulfilled must be a non-negative integer'
      });
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation failed for status update', errors));
  }

  next();
};

