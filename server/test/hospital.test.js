import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { BloodStock } from '../src/models/bloodStock.model.js';
import { BloodRequest } from '../src/models/bloodRequest.model.js';
import { ROLES, HOSPITAL_VERIFICATION_STATUS, STOCK_TRANSACTION_TYPES } from '../src/utils/constants.js';

let mongod;
let hospitalToken;
let hospitalId;
let hospital2Token;
let hospital2Id;
let adminToken;
let donorToken;
let patientToken;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_phase6_hospital_mgmt_min32chars';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_hospital_test'
  });
  console.log('[Hospital Test Setup] In-Memory MongoDB Connected:', uri);

  // 1. Hospital User 1 (Metro Trauma Hospital)
  const resHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Metro Trauma Center',
      email: 'admin@metrotrauma.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-7701',
      city: 'Metropolis',
      hospitalDetails: {
        facilityName: 'Metro Regional Trauma & Transfusion Hospital',
        licenseNumber: 'LIC-METRO-991',
        department: 'Blood Bank & Transfusion Medicine'
      }
    });
  hospitalToken = resHosp.body.data.token;
  hospitalId = resHosp.body.data.user._id;

  // 2. Hospital User 2 (St. Jude)
  const resHosp2 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'St. Jude General',
      email: 'desk@stjudegeneral.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-7702',
      city: 'Gotham'
    });
  hospital2Token = resHosp2.body.data.token;
  hospital2Id = resHosp2.body.data.user._id;

  // 3. Admin User
  const resAdmin = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'LifeLink Director',
      email: 'director@lifelink.org',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN
    });
  adminToken = resAdmin.body.data.token;

  // 4. Donor User
  const resDonor = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Dave Donor',
      email: 'dave.donor@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      bloodGroup: 'O+'
    });
  donorToken = resDonor.body.data.token;

  // 5. Patient User
  const resPatient = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Pam Patient',
      email: 'pam.patient@example.com',
      password: 'PatientPassword123!',
      role: ROLES.PATIENT
    });
  patientToken = resPatient.body.data.token;
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
  console.log('[Hospital Test Teardown] In-Memory MongoDB Stopped.');
});

describe('1. Hospital Profile & Verification Workflow', () => {
  it('should retrieve hospital profile (GET /api/v1/hospitals/profile)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/profile')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.role, ROLES.HOSPITAL);
    assert.equal(res.body.data.hospitalDetails.verificationStatus, 'PENDING');
  });

  it('should update hospital profile (PUT /api/v1/hospitals/profile)', async () => {
    const res = await request(app)
      .put('/api/v1/hospitals/profile')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        facilityName: 'Metro Regional Apex Trauma Center',
        hospitalType: 'GOVERNMENT',
        address: '100 Medical Blvd, Level 3',
        emergencyHotline: '+1 555-EMERGENCY',
        totalBeds: 450,
        bloodBankLicense: 'BB-LIC-2026-X99'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.hospitalDetails.facilityName, 'Metro Regional Apex Trauma Center');
    assert.equal(res.body.data.hospitalDetails.hospitalType, 'GOVERNMENT');
    assert.equal(res.body.data.hospitalDetails.totalBeds, 450);
  });

  it('should FORBID non-admin from verifying hospital (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/${hospitalId}/verify`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ verificationStatus: 'VERIFIED' });

    assert.equal(res.status, 403);
  });

  it('should ALLOW Admin to verify hospital (PATCH /:id/verify)', async () => {
    const res = await request(app)
      .patch(`/api/v1/hospitals/${hospitalId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        verificationStatus: HOSPITAL_VERIFICATION_STATUS.VERIFIED,
        verificationNotes: 'State license verified and physical inspection passed.'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.hospitalDetails.verificationStatus, 'VERIFIED');
    assert.equal(res.body.data.hospitalDetails.isVerified, true);
    assert.ok(res.body.data.hospitalDetails.verifiedAt);
  });
});

describe('2. Blood Inventory & Stock-In / Stock-Out Operations', () => {
  it('should initialize and return 8 blood groups in inventory (GET /api/v1/hospitals/inventory)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/inventory')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 8, 'Must return all 8 ABO/Rh blood groups');

    const oNeg = res.body.data.find((i) => i.bloodGroup === 'O-');
    assert.ok(oNeg);
    assert.equal(oNeg.unitsAvailable, 0);
    assert.equal(oNeg.isLowStock, true);
  });

  it('should stock-in 10 units of A+ blood (POST /api/v1/hospitals/inventory/stock-in)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-in')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        bloodGroup: 'A+',
        units: 10,
        componentType: 'WHOLE_BLOOD',
        storageLocation: 'Refrigeration Unit 1B',
        notes: 'Mobile donation drive procurement'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.batch.bloodGroup, 'A+');
    assert.equal(res.body.data.batch.units, 10);
    assert.equal(res.body.data.inventory.unitsAvailable, 10);
    assert.equal(res.body.data.transaction.transactionType, STOCK_TRANSACTION_TYPES.STOCK_IN);
  });

  it('should stock-in 4 units of O- blood with custom expiry date', async () => {
    const expiryDate = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-in')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        bloodGroup: 'O-',
        units: 4,
        expiryDate: expiryDate.toISOString(),
        storageLocation: 'Emergency Trauma Fridge'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.inventory.unitsAvailable, 4);
  });

  it('should stock-out 3 units of A+ blood for transfusion (POST /inventory/stock-out)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-out')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        bloodGroup: 'A+',
        units: 3,
        transactionType: 'TRANSFUSION',
        patientName: 'Jane Doe',
        reason: 'Emergency surgery in OR 2'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.deductedUnits, 3);
    assert.equal(res.body.data.remainingUnitsAvailable, 7);
  });

  it('should REJECT stock-out when requested units exceed available inventory (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-out')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        bloodGroup: 'O-',
        units: 50, // Only 4 available
        reason: 'Bulk transfer request'
      });

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes('Insufficient inventory'));
  });

  it('should update low stock threshold for a blood group', async () => {
    const res = await request(app)
      .patch('/api/v1/hospitals/inventory/threshold')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        bloodGroup: 'A+',
        threshold: 8,
        storageLocation: 'Primary Cold Bay Level 2'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.lowStockThreshold, 8);
  });
});

describe('3. Unit Expiry Tracking & Discard Handling', () => {
  let expiredBatchId;

  before(async () => {
    // Manually insert an expired batch (collection was 50 days ago, expired 10 days ago)
    const colDate = new Date(Date.now() - 50 * 24 * 60 * 60 * 1000);
    const expDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);

    const batch = await BloodStock.create({
      hospital: hospitalId,
      batchNumber: 'BAT-EXPIRED-TEST-001',
      bloodGroup: 'B+',
      units: 2,
      remainingUnits: 2,
      collectionDate: colDate,
      expiryDate: expDate,
      status: 'AVAILABLE'
    });
    expiredBatchId = batch._id.toString();

    // Increment aggregate inventory so discard has units to deduct
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-in')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        bloodGroup: 'B+',
        units: 2
      });
  });

  it('should retrieve stock batches with status and expiry details', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/inventory/batches')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.batches.length >= 2);
  });

  it('should safely discard expired units and update inventory (POST /inventory/discard-expired)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/discard-expired')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ batchId: expiredBatchId, notes: 'Routine biological discard' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.discardedCount, 1);
    assert.equal(res.body.data.totalUnitsDiscarded, 2);

    const batchDoc = await BloodStock.findById(expiredBatchId);
    assert.equal(batchDoc.status, 'DISCARDED');
    assert.equal(batchDoc.remainingUnits, 0);
  });
});

describe('4. Hospital Staff Management', () => {
  let staffId;

  it('should add a staff member (POST /api/v1/hospitals/staff)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/staff')
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({
        name: 'Dr. Gregory House',
        email: 'house.diag@metrotrauma.org',
        phone: '+1 555-8833',
        role: 'CHIEF_MEDICAL_OFFICER',
        department: 'Diagnostic & Transfusion Services',
        shift: 'MORNING'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.name, 'Dr. Gregory House');
    assert.equal(res.body.data.role, 'CHIEF_MEDICAL_OFFICER');
    staffId = res.body.data._id;
  });

  it('should list active hospital staff (GET /api/v1/hospitals/staff)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/staff')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
  });

  it('should update a staff member (PUT /api/v1/hospitals/staff/:staffId)', async () => {
    const res = await request(app)
      .put(`/api/v1/hospitals/staff/${staffId}`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ shift: 'ROTATING', phone: '+1 555-9944' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.shift, 'ROTATING');
    assert.equal(res.body.data.phone, '+1 555-9944');
  });

  it('should deactivate a staff member (DELETE /api/v1/hospitals/staff/:staffId)', async () => {
    const res = await request(app)
      .delete(`/api/v1/hospitals/staff/${staffId}`)
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);

    const listRes = await request(app)
      .get('/api/v1/hospitals/staff')
      .set('Authorization', `Bearer ${hospitalToken}`);
    const found = listRes.body.data.find((s) => s._id === staffId);
    assert.equal(found, undefined, 'Deactivated staff should not appear in active list');
  });
});

describe('5. Real MongoDB Dashboard Statistics & Transactions Audit', () => {
  before(async () => {
    // Insert a blood request directed to this hospital
    await BloodRequest.create({
      patient: hospitalId,
      patientName: 'Emergency Trauma Victim',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospital: 'Metro Trauma Center',
      hospitalId: hospitalId,
      city: 'Metropolis',
      requiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      priority: 'CRITICAL',
      status: 'PENDING',
      contactPhone: '+1 555-0000'
    });
  });

  it('should return complete real MongoDB statistics (GET /api/v1/hospitals/dashboard/stats)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/dashboard/stats')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const stats = res.body.data;
    assert.equal(stats.hospital.name, 'Metro Trauma Center');
    assert.ok(stats.requests.total >= 1);
    assert.ok(stats.requests.pending >= 1);
    assert.ok(stats.inventory.totalUnitsAvailable >= 7);
    assert.ok(stats.inventory.byBloodGroup['A+'].unitsAvailable >= 7);
    assert.ok(Array.isArray(stats.inventory.lowStockAlerts));
    assert.ok(Array.isArray(stats.recentActivity));
    assert.ok(stats.recentActivity.length >= 1);
  });

  it('should retrieve transactions audit trail (GET /api/v1/hospitals/transactions)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/transactions')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.transactions.length >= 1);
    assert.ok(res.body.data.pagination.total >= 1);
  });

  it('should retrieve hospital analytics (GET /api/v1/hospitals/analytics)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/analytics')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data.summary));
  });

  it('should FORBID DONOR role from accessing hospital dashboard stats (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/hospitals/dashboard/stats')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 403);
  });

  it('should FORBID PATIENT role from performing stock-in operations (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/hospitals/inventory/stock-in')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ bloodGroup: 'O+', units: 2 });

    assert.equal(res.status, 403);
  });
});

