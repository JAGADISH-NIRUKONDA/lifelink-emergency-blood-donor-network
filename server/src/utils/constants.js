export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  HOSPITAL: 'HOSPITAL',
  DONOR: 'DONOR',
  PATIENT: 'PATIENT',
  VOLUNTEER: 'VOLUNTEER'
});

export const ROLE_LIST = Object.values(ROLES);

export const BLOOD_GROUPS = Object.freeze([
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-'
]);

export const REQUEST_STATUS = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  MATCHED: 'MATCHED',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
});

export const REQUEST_STATUS_LIST = Object.values(REQUEST_STATUS);

export const REQUEST_PRIORITIES = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  NORMAL: 'NORMAL'
});

export const REQUEST_PRIORITY_LIST = Object.values(REQUEST_PRIORITIES);

export const VALID_STATUS_TRANSITIONS = Object.freeze({
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['MATCHED', 'FULFILLED', 'CANCELLED'],
  MATCHED: ['FULFILLED', 'CANCELLED'],
  FULFILLED: [],
  REJECTED: [],
  CANCELLED: []
});
