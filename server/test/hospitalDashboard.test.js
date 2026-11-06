import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { BloodRequest } from '../src/models/bloodRequest.model.js';
import { BloodStock } from '../src/models/bloodStock.model.js';
import { AuditLog } from '../src/models/auditLog.model.js';
import { ROLES, REQUEST_STATUS, REQUEST_PRIORITIES, HOSPITAL_VERIFICATION_STATUS } from '../src/utils/constants.js';

let mongod;
let verifiedHospitalToken;
let verifiedHospitalUser;
let unverifiedHospitalToken;
let unverifiedHospitalUser;
let otherHospitalToken;
let otherHospitalUser;
let adminToken;
let patientToken;
let patientUser;
let donorToken;
let donorUser;
let assignedRequestId;
let otherRequestId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_phase8_hospital_dashboard_min32chars';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_hospital_dashboard_test'
  });

  // 1. Admin User
  const resAdmin = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Super Admin Healthboard',
      email: 'admin.board@lifelink.org',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN
    });
  adminToken = resAdmin.body.data.token;

  // 2. Verified Hospital User
  const resVerifiedHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Metro Trauma Apex Center',
      email: 'chief@metrotrauma.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-4001',
      city: 'Metropolis',
      hospitalDetails: {
        facilityName: 'Metro Regional Apex Trauma Center',
        licenseNumber: 'LIC-METRO-001',
        isVerified: true,
        verificationStatus: HOSPITAL_VERIFICATION_STATUS.VERIFIED
      }
    });
  verifiedHospitalToken = resVerifiedHosp.body.data.token;
  verifiedHospitalUser = resVerifiedHosp.body.data.user;

  // 3. Unverified Hospital User (Pending Verification)
  const resUnverifiedHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Sunrise Community Clinic',
      email: 'contact@sunriseclinic.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-4002',
      city: 'Metropolis',
      hospitalDetails: {
        facilityName: 'Sunrise Community Clinic',
        licenseNumber: 'LIC-SUN-999',
        isVerified: false,
        verificationStatus: HOSPITAL_VERIFICATION_STATUS.PENDING
      }
    });
  unverifiedHospitalToken = resUnverifiedHosp.body.data.token;
  unverifiedHospitalUser = resUnverifiedHosp.body.data.user;

  // 4. Other Hospital User (for data isolation checks)
  const resOtherHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Gotham Central Hospital',
      email: 'admin@gothamcentral.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-4003',
      city: 'Gotham',
      hospitalDetails: {
        facilityName: 'Gotham Central Hospital',
        licenseNumber: 'LIC-GOTHAM-777',
        isVerified: true,
        verificationStatus: HOSPITAL_VERIFICATION_STATUS.VERIFIED
      }
    });
  otherHospitalToken = resOtherHosp.body.data.token;
  otherHospitalUser = resOtherHosp.body.data.user;

  // 5. Patient User
  const resPatient = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Pamela Patient',
      email: 'pamela.p@lifelink.org',
      password: 'PatientPassword123!',
      role: ROLES.PATIENT,
      phone: '+1 555-4004',
      city: 'Metropolis'
    });
  patientToken = resPatient.body.data.token;
  patientUser = resPatient.body.data.user;

  // 6. Compatible Donor User
  const resDonor = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Daniel Donor',
      email: 'daniel.donor@lifelink.org',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-4005',
      city: 'Metropolis',
      bloodGroup: 'O+'
    });
  donorToken = resDonor.body.data.token;
  donorUser = resDonor.body.data.user;

  // 7. Seed Requisitions
  const patientId = patientUser._id || patientUser.id;
  const verifiedHospId = verifiedHospitalUser._id || verifiedHospitalUser.id;
  const otherHospId = otherHospitalUser._id || otherHospitalUser.id;

  const req1 = await BloodRequest.create({
    patient: patientId,
    patientName: patientUser.name,
    bloodGroup: 'O+',
    unitsRequired: 2,
    hospital: verifiedHospitalUser.hospitalDetails?.facilityName || verifiedHospitalUser.name,
    hospitalId: verifiedHospId,
    priority: REQUEST_PRIORITIES.CRITICAL,
    status: REQUEST_STATUS.PENDING,
    contactPhone: '+1 555-4004',
    city: 'Metropolis',
    requiredDate: new Date(Date.now() + 24 * 3600 * 1000)
  });
  assignedRequestId = req1._id;

  const req2 = await BloodRequest.create({
    patient: patientId,
    patientName: patientUser.name,
    bloodGroup: 'A+',
    unitsRequired: 3,
    hospital: otherHospitalUser.hospitalDetails?.facilityName || otherHospitalUser.name,
    hospitalId: otherHospId,
    priority: REQUEST_PRIORITIES.HIGH,
    status: REQUEST_STATUS.PENDING,
    contactPhone: '+1 555-4004',
    city: 'Gotham',
    requiredDate: new Date(Date.now() + 48 * 3600 * 1000)
  });
  otherRequestId = req2._id;
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

describe('Phase 8: Hospital Operational Verification Gate', () => {
  it('should FORBID unverified hospital from stocking in blood batches (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-in')
      .set('Authorization', `Bearer ${unverifiedHospitalToken}`)
      .send({
        bloodGroup: 'O+',
        units: 5,
        componentType: 'WHOLE_BLOOD'
      });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Operational features are restricted to verified healthcare facilities/);
  });

  it('should FORBID unverified hospital from modifying blood requisition status (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/requests/${assignedRequestId}/status`)
      .set('Authorization', `Bearer ${unverifiedHospitalToken}`)
      .send({
        status: REQUEST_STATUS.APPROVED,
        notes: 'Unauthorized approval attempt'
      });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Operational features are restricted to verified healthcare facilities/);
  });

  it('should ALLOW verified hospital to stock in blood and log audit trail', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-in')
      .set('Authorization', `Bearer ${verifiedHospitalToken}`)
      .send({
        bloodGroup: 'O+',
        units: 10,
        componentType: 'WHOLE_BLOOD',
        storageLocation: 'Apex Trauma Cold Vault B'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.batch.units, 10);
    assert.equal(res.body.data.inventory.unitsAvailable, 10);

    const log = await AuditLog.findOne({
      targetIdentifier: res.body.data.batch.batchNumber,
      action: 'STOCK_IN'
    });
    assert.ok(log);
    assert.equal(log.details.bloodGroup, 'O+');
  });
});

describe('Phase 8: Hospital Data Isolation & Ownership', () => {
  it('should list only incoming requests assigned to the authenticated hospital', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/requests')
      .set('Authorization', `Bearer ${verifiedHospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.requests.length >= 1);
    // Verified hospital must see its assigned request
    assert.ok(res.body.data.requests.some((r) => r._id.toString() === assignedRequestId.toString()));
    // Must NOT see the request assigned to Gotham Central Hospital
    assert.equal(res.body.data.requests.some((r) => r._id.toString() === otherRequestId.toString()), false);
  });

  it('should FORBID hospital from modifying requisitions belonging to another facility (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/requests/${otherRequestId}/status`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`)
      .send({
        status: REQUEST_STATUS.APPROVED,
        notes: 'Cross-facility modification attempt'
      });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access Denied/);
  });

  it('should FORBID hospital from accessing donor coordination on another facility requisition', async () => {
    const res = await request(app)
      .get(`/api/v1/hospitals/requests/${otherRequestId}/donors`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access Denied/);
  });
});

describe('Phase 8: Emergency Blood Requisitions Management', () => {
  it('should fetch single assigned requisition details', async () => {
    const res = await request(app)
      .get(`/api/v1/hospitals/requests/${assignedRequestId}`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.patientName, 'Pamela Patient');
    assert.equal(res.body.data.bloodGroup, 'O+');
  });

  it('should accept/approve blood request and record administrative notes & audit log', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/requests/${assignedRequestId}/status`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`)
      .send({
        status: REQUEST_STATUS.APPROVED,
        notes: 'Clinical criteria validated. Crossmatching reserve initiated.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, REQUEST_STATUS.APPROVED);
    assert.ok(res.body.data.statusHistory.some((h) => h.status === 'APPROVED'));

    const log = await AuditLog.findOne({
      targetId: assignedRequestId.toString(),
      action: 'REQUEST_STATUS_CHANGE'
    });
    assert.ok(log);
    assert.equal(log.details.newStatus, REQUEST_STATUS.APPROVED);
  });

  it('should fulfill blood request with units fulfilled tracking', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/requests/${assignedRequestId}/status`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`)
      .send({
        status: REQUEST_STATUS.FULFILLED,
        unitsFulfilled: 2,
        notes: 'Transfusion protocol completed successfully.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, REQUEST_STATUS.FULFILLED);
    assert.equal(res.body.data.unitsFulfilled, 2);
  });
});

describe('Phase 8: Donor Coordination & Safety Advisory', () => {
  let newReqId;

  before(async () => {
    // Create new approved request for donor coordination
    const req = await BloodRequest.create({
      patient: patientUser._id || patientUser.id,
      patientName: patientUser.name,
      bloodGroup: 'O+',
      unitsRequired: 1,
      hospital: verifiedHospitalUser.hospitalDetails?.facilityName || verifiedHospitalUser.name,
      hospitalId: verifiedHospitalUser._id || verifiedHospitalUser.id,
      priority: REQUEST_PRIORITIES.HIGH,
      status: REQUEST_STATUS.APPROVED,
      contactPhone: '+1 555-4004',
      city: 'Metropolis',
      requiredDate: new Date(Date.now() + 24 * 3600 * 1000)
    });
    newReqId = req._id;
  });

  it('should discover compatible donor candidates and include strict clinical safety disclaimer', async () => {
    const res = await request(app)
      .get(`/api/v1/hospitals/requests/${newReqId}/donors`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.candidates.length >= 1);
    // Verify clinical safety notice is strictly present
    assert.ok(res.body.data.clinicalSafetyNotice);
    assert.match(res.body.data.clinicalSafetyNotice, /CLINICAL ADVISORY/);
    assert.match(res.body.data.clinicalSafetyNotice, /NOT constitute certified clinical compatibility/);
  });

  it('should dispatch donor outreach invitations with audit logging', async () => {
    const donorId = donorUser._id || donorUser.id;
    const res = await request(app)
      .post(`/api/v1/hospitals/requests/${newReqId}/invite`)
      .set('Authorization', `Bearer ${verifiedHospitalToken}`)
      .send({
        donorIds: [donorId],
        message: 'Immediate O+ voluntary donor requested for scheduled surgery.'
      });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.sentCount >= 1);

    const log = await AuditLog.findOne({
      targetId: newReqId.toString(),
      action: 'DONOR_COORDINATION_OUTREACH'
    });
    assert.ok(log);
    assert.equal(log.details.donorCount, 1);
  });
});

describe('Phase 8: Hospital Reports & Platform Analytics', () => {
  it('should generate real MongoDB hospital analytics with inventory trends and fulfillment rate', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/analytics')
      .set('Authorization', `Bearer ${verifiedHospitalToken}`);

    assert.equal(res.status, 200);
    const data = res.body.data;
    assert.ok(Array.isArray(data.inventoryTrends));
    assert.ok(data.requestVolume.total >= 1);
    assert.ok(data.requestVolume.fulfilled >= 1);
    assert.ok(data.requestVolume.fulfillmentRate !== undefined);
    assert.ok(data.expiringStockReport);
  });
});
