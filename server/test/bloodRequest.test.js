import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { BloodRequest } from '../src/models/bloodRequest.model.js';
import { ROLES, REQUEST_STATUS, REQUEST_PRIORITIES } from '../src/utils/constants.js';

let mongod;
let patientToken;
let patientId;
let patient2Token;
let patient2Id;
let hospitalToken;
let hospitalId;
let donorToken;
let donorId;
let adminToken;

let createdRequestId;
let createdRequestDocId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_for_blood_req_tests';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_blood_request_test'
  });
  console.log('[Blood Request Test Setup] In-Memory MongoDB Connected:', uri);

  // 1. Patient User 1
  const resPat1 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Michael Davis',
      email: 'michael.patient@example.com',
      password: 'PatientPassword123!',
      role: ROLES.PATIENT,
      phone: '+1 555-0201',
      city: 'Metropolis'
    });
  patientToken = resPat1.body.data.token;
  patientId = resPat1.body.data.user._id;

  // 2. Patient User 2
  const resPat2 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Emma Watson',
      email: 'emma.patient@example.com',
      password: 'PatientPassword456!',
      role: ROLES.PATIENT,
      phone: '+1 555-0202',
      city: 'Gotham'
    });
  patient2Token = resPat2.body.data.token;
  patient2Id = resPat2.body.data.user._id;

  // 3. Hospital User
  const resHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Memorial Blood Bank',
      email: 'bloodbank@memorialhospital.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      city: 'Metropolis',
      hospitalDetails: {
        licenseNumber: 'HOSP-METRO-01',
        facilityName: 'Memorial General Hospital',
        department: 'Emergency & Transfusion'
      }
    });
  hospitalToken = resHosp.body.data.token;
  hospitalId = resHosp.body.data.user._id;

  // 4. Compatible Donor (A+ in Metropolis, eligible)
  const resDonor = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'David Banner',
      email: 'david.donor@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      bloodGroup: 'A+',
      phone: '+1 555-0301',
      city: 'Metropolis'
    });
  donorToken = resDonor.body.data.token;
  donorId = resDonor.body.data.user._id;

  // Update donor profile with complete eligible details
  await request(app)
    .put('/api/v1/donors/profile')
    .set('Authorization', `Bearer ${donorToken}`)
    .send({
      isAvailable: true,
      age: 32,
      weight: 75,
      lastDonationDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString()
    });

  // 5. Admin User
  const resAdmin = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'System Admin',
      email: 'admin.req@lifelink.org',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN
    });
  adminToken = resAdmin.body.data.token;
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  console.log('[Blood Request Test Teardown] In-Memory MongoDB Stopped.');
});

describe('1. Blood Request Creation (POST /api/v1/blood-requests)', () => {
  it('should successfully create an emergency blood request', async () => {
    const payload = {
      patientName: 'Jane Davis',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospital: 'Memorial General Hospital',
      city: 'Metropolis',
      requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      priority: REQUEST_PRIORITIES.CRITICAL,
      contactPhone: '+1 555-0201',
      medicalNotes: 'Acute trauma patient, emergency surgery scheduled'
    };

    const res = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.requestId);
    assert.equal(res.body.data.patient, patientId);
    assert.equal(res.body.data.bloodGroup, 'A+');
    assert.equal(res.body.data.unitsRequired, 2);
    assert.equal(res.body.data.status, REQUEST_STATUS.PENDING);
    assert.equal(res.body.data.priority, REQUEST_PRIORITIES.CRITICAL);

    createdRequestId = res.body.data.requestId;
    createdRequestDocId = res.body.data._id;
  });

  it('should reject blood request with invalid blood group (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientName: 'John Doe',
        bloodGroup: 'Z_UNKNOWN',
        unitsRequired: 1,
        hospital: 'City Clinic',
        city: 'Metropolis',
        requiredDate: new Date().toISOString(),
        contactPhone: '+1 555-1234'
      });

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some((e) => e.field === 'bloodGroup'));
  });

  it('should reject blood request with invalid units (400 Bad Request)', async () => {
    // 0 units
    const resZero = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientName: 'John Doe',
        bloodGroup: 'O+',
        unitsRequired: 0,
        hospital: 'City Clinic',
        city: 'Metropolis',
        requiredDate: new Date().toISOString(),
        contactPhone: '+1 555-1234'
      });

    assert.equal(resZero.status, 400);
    assert.ok(resZero.body.errors.some((e) => e.field === 'unitsRequired'));

    // Exceeding 20 units
    const resExcess = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientName: 'John Doe',
        bloodGroup: 'O+',
        unitsRequired: 25,
        hospital: 'City Clinic',
        city: 'Metropolis',
        requiredDate: new Date().toISOString(),
        contactPhone: '+1 555-1234'
      });

    assert.equal(resExcess.status, 400);
  });
});

describe('2. Patient Request History (GET /api/v1/blood-requests/my-requests)', () => {
  it('should return patient request history scoped to the authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/blood-requests/my-requests')
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.requests));
    assert.equal(res.body.data.requests.length, 1);
    assert.equal(res.body.data.requests[0].requestId, createdRequestId);
  });

  it('should return empty list for patient with no submitted requests', async () => {
    const res = await request(app)
      .get('/api/v1/blood-requests/my-requests')
      .set('Authorization', `Bearer ${patient2Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.requests.length, 0);
  });
});

describe('3. Request Details (GET /api/v1/blood-requests/:id)', () => {
  it('should allow requesting patient to view their own request details', async () => {
    const res = await request(app)
      .get(`/api/v1/blood-requests/${createdRequestDocId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.request.requestId, createdRequestId);
    assert.ok(res.body.data.compatibility);
  });

  it('should allow hospital staff to view any blood request', async () => {
    const res = await request(app)
      .get(`/api/v1/blood-requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.request.requestId, createdRequestId);
  });

  it('should FORBID another patient from viewing another patient request (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/v1/blood-requests/${createdRequestDocId}`)
      .set('Authorization', `Bearer ${patient2Token}`);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access denied/i);
  });
});

describe('4. Hospital Request Directory & Filters (GET /api/v1/blood-requests)', () => {
  it('should ALLOW hospital staff to view request directory with filters', async () => {
    const res = await request(app)
      .get('/api/v1/blood-requests?bloodGroup=A+&priority=CRITICAL')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.requests.length >= 1);
    assert.ok(res.body.data.pagination);
  });

  it('should FORBID patient role from accessing the hospital request directory (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`);

    assert.equal(res.status, 403);
  });

  it('should FORBID donor role from accessing the hospital request directory (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 403);
  });
});

describe('5. Status Updates & Transitions (PATCH /api/v1/blood-requests/:id/status)', () => {
  it('should FORBID patients from approving their own request (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/v1/blood-requests/${createdRequestDocId}/status`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ status: REQUEST_STATUS.APPROVED });

    assert.equal(res.status, 403);
  });

  it('should ALLOW hospital staff to approve a PENDING request (200 OK)', async () => {
    const res = await request(app)
      .patch(`/api/v1/blood-requests/${createdRequestDocId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        status: REQUEST_STATUS.APPROVED,
        note: 'Hospital confirmed patient admission and clinical requisition'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, REQUEST_STATUS.APPROVED);
    assert.ok(res.body.data.statusHistory.some((h) => h.status === REQUEST_STATUS.APPROVED));
  });

  it('should reject invalid status transition (400 Bad Request)', async () => {
    // Current is APPROVED. Allowed transitions: MATCHED, FULFILLED, CANCELLED.
    // Transitioning back to PENDING is invalid.
    const res = await request(app)
      .patch(`/api/v1/blood-requests/${createdRequestDocId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ status: REQUEST_STATUS.PENDING });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Invalid status transition/i);
  });

  it('should transition to MATCHED and then to FULFILLED', async () => {
    // Transition APPROVED -> MATCHED
    const resMatched = await request(app)
      .patch(`/api/v1/blood-requests/${createdRequestDocId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ status: REQUEST_STATUS.MATCHED, note: 'Matched with 2 voluntary donors' });

    assert.equal(resMatched.status, 200);
    assert.equal(resMatched.body.data.status, REQUEST_STATUS.MATCHED);

    // Transition MATCHED -> FULFILLED
    const resFulfilled = await request(app)
      .patch(`/api/v1/blood-requests/${createdRequestDocId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ status: REQUEST_STATUS.FULFILLED, unitsFulfilled: 2 });

    assert.equal(resFulfilled.status, 200);
    assert.equal(resFulfilled.body.data.status, REQUEST_STATUS.FULFILLED);
    assert.equal(resFulfilled.body.data.unitsFulfilled, 2);
  });
});

describe('6. Donor Matching Engine (GET /api/v1/blood-requests/:id/matching-donors)', () => {
  let matchReqId;

  before(async () => {
    // Create a new request for matching test
    const res = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientName: 'Sarah Connor',
        bloodGroup: 'A+',
        unitsRequired: 1,
        hospital: 'Memorial General Hospital',
        city: 'Metropolis',
        requiredDate: new Date().toISOString(),
        contactPhone: '+1 555-9988'
      });
    matchReqId = res.body.data._id;
  });

  it('should return compatible donors with scoring and medical disclaimer', async () => {
    const res = await request(app)
      .get(`/api/v1/blood-requests/${matchReqId}/matching-donors`)
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.donors));
    assert.ok(res.body.data.totalMatchesFound >= 1);

    // Verify compatible donor David Banner was identified
    const davidMatch = res.body.data.donors.find((d) => d.donor.name === 'David Banner');
    assert.ok(davidMatch);
    assert.equal(davidMatch.matchDetails.isExactMatch, true);
    assert.equal(davidMatch.matchDetails.isSameCity, true);
    assert.equal(davidMatch.matchDetails.eligibility.isEligible, true);

    // SECURITY CHECK: Verify donor password hash is never exposed
    assert.equal(davidMatch.donor.password, undefined);

    // CLINICAL NOTICE CHECK
    assert.ok(res.body.data.clinicalNotice.includes('biological safety'));
  });
});

describe('7. Request Cancellation (PATCH /api/v1/blood-requests/:id/cancel)', () => {
  let cancelableReqId;

  before(async () => {
    const res = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientName: 'Test Cancellation',
        bloodGroup: 'B+',
        unitsRequired: 1,
        hospital: 'General Hospital',
        city: 'Metropolis',
        requiredDate: new Date().toISOString(),
        contactPhone: '+1 555-7766'
      });
    cancelableReqId = res.body.data._id;
  });

  it('should allow patient owner to cancel their PENDING request', async () => {
    const res = await request(app)
      .patch(`/api/v1/blood-requests/${cancelableReqId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ cancellationReason: 'Arranged alternative supply at clinic' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, REQUEST_STATUS.CANCELLED);
    assert.equal(res.body.data.cancellationReason, 'Arranged alternative supply at clinic');
  });

  it('should prevent cancelling an already CANCELLED request (400 Bad Request)', async () => {
    const res = await request(app)
      .patch(`/api/v1/blood-requests/${cancelableReqId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ cancellationReason: 'Trying to cancel again' });

    assert.equal(res.status, 400);
  });
});

describe('8. Hospital Rejection & Terminal State', () => {
  let rejectableReqId;

  before(async () => {
    const res = await request(app)
      .post('/api/v1/blood-requests')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        patientName: 'Rejection Candidate',
        bloodGroup: 'O-',
        unitsRequired: 1,
        hospital: 'Memorial General Hospital',
        city: 'Metropolis',
        requiredDate: new Date().toISOString(),
        contactPhone: '+1 555-3344'
      });
    rejectableReqId = res.body.data._id;
  });

  it('should allow hospital to reject a PENDING request with reason', async () => {
    const res = await request(app)
      .patch(`/api/v1/blood-requests/${rejectableReqId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        status: REQUEST_STATUS.REJECTED,
        rejectionReason: 'Invalid medical center ward identification'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, REQUEST_STATUS.REJECTED);
    assert.equal(res.body.data.rejectionReason, 'Invalid medical center ward identification');
  });
});

describe('9. Dashboard Stats (GET /api/v1/blood-requests/dashboard/stats)', () => {
  it('should return aggregated platform metrics for hospital staff', async () => {
    const res = await request(app)
      .get('/api/v1/blood-requests/dashboard/stats')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.scope, 'HOSPITAL_PLATFORM');
    assert.ok(res.body.data.overview.totalRequests >= 3);
    assert.ok(typeof res.body.data.overview.fulfillmentRatePercentage === 'number');
    assert.ok(res.body.data.bloodGroupBreakdown);
  });
});
