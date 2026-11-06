import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { BloodRequest } from '../src/models/bloodRequest.model.js';
import { AuditLog } from '../src/models/auditLog.model.js';
import { ROLES, REQUEST_PRIORITIES, REQUEST_STATUS } from '../src/utils/constants.js';

let mongod;
let donorToken;
let donorId;
let otherDonorToken;
let otherDonorId;
let hospitalToken;
let hospitalId;
let sampleRequestId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_for_donor_dashboard';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { dbName: 'lifelink_donor_dashboard_test' });

  // 1. Register Primary Donor (O-)
  const resDonor = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Elena Rostova',
      email: 'elena.donor@test.org',
      password: 'Password123!',
      role: ROLES.DONOR,
      phone: '+1 555-0199',
      bloodGroup: 'O-',
      city: 'Metropolis'
    });
  donorToken = resDonor.body.data.token;
  donorId = resDonor.body.data.user._id;

  // 2. Register Second Donor (A+)
  const resOther = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Marcus Brody',
      email: 'marcus.brody@test.org',
      password: 'Password123!',
      role: ROLES.DONOR,
      phone: '+1 555-0288',
      bloodGroup: 'A+',
      city: 'Metropolis'
    });
  otherDonorToken = resOther.body.data.token;
  otherDonorId = resOther.body.data.user._id;

  // 3. Register Hospital
  const resHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Metropolis Apex General Hospital',
      email: 'contact@apexgeneral.org',
      password: 'Password123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-0377',
      city: 'Metropolis',
      hospitalDetails: {
        facilityName: 'Metropolis Apex General Hospital',
        licenseNumber: 'LIC-APEX-001',
        isVerified: true,
        verificationStatus: 'VERIFIED'
      }
    });
  hospitalToken = resHosp.body.data.token;
  hospitalId = resHosp.body.data.user._id;

  // 4. Create an active blood request
  const bloodReq = await BloodRequest.create({
    requestId: 'BLR-2026-TEST01',
    patient: otherDonorId,
    patientName: 'Jane Doe',
    bloodGroup: 'A+',
    unitsRequired: 2,
    hospital: 'Metropolis Apex General Hospital',
    hospitalId,
    city: 'Metropolis',
    requiredDate: new Date(Date.now() + 48 * 3600 * 1000),
    priority: REQUEST_PRIORITIES.CRITICAL,
    status: REQUEST_STATUS.APPROVED,
    medicalNotes: 'Emergency ICU transfusion',
    contactPhone: '+1 555-9999'
  });
  sampleRequestId = bloodReq.requestId;
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('Phase 9: Donor Dashboard & Operations', () => {
  it('should reject unauthenticated access to donor dashboard with 401', async () => {
    const res = await request(app).get('/api/v1/donors/dashboard');
    assert.equal(res.status, 401);
  });

  it('should reject non-donor access to donor dashboard with 403', async () => {
    const res = await request(app)
      .get('/api/v1/donors/dashboard')
      .set('Authorization', `Bearer ${hospitalToken}`);
    assert.equal(res.status, 403);
  });

  it('should return real calculated dashboard metrics for authenticated donor', async () => {
    const res = await request(app)
      .get('/api/v1/donors/dashboard')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.overview);
    assert.equal(res.body.data.overview.name, 'Elena Rostova');
    assert.equal(res.body.data.overview.bloodGroup, 'O-');
    assert.ok(typeof res.body.data.overview.profileCompletion === 'number');
    assert.ok(res.body.data.eligibility);
    assert.ok(res.body.data.clinicalSafetyNotice);
    assert.ok(res.body.data.clinicalSafetyNotice.includes('Never independently declare a donor medically eligible'));
  });

  it('should update donor profile fields and recalculate profile completion score', async () => {
    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        dateOfBirth: '1995-04-12',
        address: '42 Maple Street, Apt 3B',
        state: 'Metro State',
        postalCode: '10001',
        emergencyContact: '+1 555-9111',
        emergencyContactName: 'Dr. Bruce Rostova',
        gender: 'FEMALE',
        weight: 62,
        age: 31
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.profile.donorDetails.dateOfBirth);
    assert.equal(res.body.data.profile.donorDetails.emergencyContactName, 'Dr. Bruce Rostova');
    assert.ok(res.body.data.profile.profileCompletion >= 70);

    // Verify audit log recorded
    const audit = await AuditLog.findOne({
      action: 'DONOR_PROFILE_UPDATE',
      targetId: donorId
    });
    assert.ok(audit, 'Audit log entry must be created for profile update');
  });

  it('should update availability to PAUSED with operational notes', async () => {
    const res = await request(app)
      .patch('/api/v1/donors/availability')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        availabilityStatus: 'PAUSED',
        availabilityNotes: 'Traveling internationally until next month'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.availabilityStatus, 'PAUSED');
    assert.equal(res.body.data.isAvailable, false);
    assert.equal(res.body.data.availabilityNotes, 'Traveling internationally until next month');
  });

  it('should resume availability to AVAILABLE', async () => {
    const res = await request(app)
      .patch('/api/v1/donors/availability')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        availabilityStatus: 'AVAILABLE'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.availabilityStatus, 'AVAILABLE');
    assert.equal(res.body.data.isAvailable, true);
  });

  it('should discover nearby compatible blood requests without leaking patient contact phone', async () => {
    const res = await request(app)
      .get('/api/v1/donors/requests/nearby')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.requests));
    assert.ok(res.body.data.requests.length >= 1);

    const found = res.body.data.requests.find((r) => r.requestId === sampleRequestId);
    assert.ok(found, 'O- universal donor should find A+ request');
    assert.equal(found.contactPhone, undefined, 'Patient private contact phone must be protected');
    assert.equal(found.hospital, 'Metropolis Apex General Hospital');
  });

  it('should allow donor to respond ACCEPTED to a blood request and create invitation', async () => {
    const res = await request(app)
      .post(`/api/v1/donors/requests/${sampleRequestId}/respond`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        response: 'ACCEPTED',
        notes: 'Available for immediate apheresis collection.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'ACCEPTED');
    assert.ok(res.body.data.invitation);
    assert.equal(res.body.data.invitation.status, 'ACCEPTED');
  });

  it('should record a verified donation and update donor total donations', async () => {
    const res = await request(app)
      .post('/api/v1/donors/donation-history')
      .set('Authorization', `Bearer ${donorToken}`)
      .send({
        hospitalName: 'Metropolis Apex General Hospital',
        bloodGroup: 'O-',
        units: 1,
        componentType: 'WHOLE_BLOOD',
        donationDate: new Date().toISOString(),
        notes: 'Mobile blood bus donation drive'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.hospitalName, 'Metropolis Apex General Hospital');
    assert.equal(res.body.data.status, 'VERIFIED');

    // Verify user subdocument was updated
    const updatedUser = await User.findById(donorId);
    assert.ok(updatedUser.donorDetails.totalDonations >= 1);
  });

  it('should retrieve verified donation records with summary and pagination', async () => {
    const res = await request(app)
      .get('/api/v1/donors/donation-history')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.donations));
    assert.ok(res.body.data.donations.length >= 1);
    assert.ok(res.body.data.summary.totalVerifiedRecords >= 1);
  });

  it('should return real donor analytics including timeline and response stats', async () => {
    const res = await request(app)
      .get('/api/v1/donors/analytics')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.overview);
    assert.ok(Array.isArray(res.body.data.timeline));
    assert.ok(Array.isArray(res.body.data.responseDistribution));
  });

  it('should return educational donation eligibility with mandatory clinical disclaimer', async () => {
    const res = await request(app)
      .get('/api/v1/donors/eligibility')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.eligibility);
    assert.ok(res.body.data.clinicalSafetyNotice.includes('Never independently declare a donor medically eligible'));
    assert.ok(Array.isArray(res.body.data.informationalReminders));
  });

  it('should enforce donor ownership: donor A cannot inspect or edit donor B private profile', async () => {
    // Donor A attempts to inspect Donor B private profile by ID
    const resGet = await request(app)
      .get(`/api/v1/donors/${otherDonorId}`)
      .set('Authorization', `Bearer ${donorToken}`);
    assert.equal(resGet.status, 403, 'Donor must be forbidden from inspecting other donor private profile');

    // Donor A attempts to edit Donor B private profile
    const resPut = await request(app)
      .put(`/api/v1/donors/${otherDonorId}`)
      .set('Authorization', `Bearer ${donorToken}`)
      .send({ name: 'Malicious Name Hack' });
    assert.equal(resPut.status, 403, 'Donor must be forbidden from editing other donor private profile');
  });
});

