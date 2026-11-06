import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { BloodRequest } from '../src/models/bloodRequest.model.js';
import { BloodInventory } from '../src/models/bloodInventory.model.js';
import { BloodStock } from '../src/models/bloodStock.model.js';
import { AuditLog } from '../src/models/auditLog.model.js';
import { ROLES, REQUEST_STATUS, REQUEST_PRIORITIES } from '../src/utils/constants.js';

let mongod;
let adminToken;
let adminUser;
let secondAdminToken;
let secondAdminUser;
let donorToken;
let donorUser;
let patientToken;
let patientUser;
let hospitalToken;
let hospitalUser;
let pendingHospitalToken;
let pendingHospitalUser;
let sampleRequestId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_phase7_super_admin_min32chars';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_admin_test'
  });

  // 1. Primary Super Admin
  const resAdmin = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Super Admin Alpha',
      email: 'admin.alpha@lifelink.org',
      password: 'AdminMasterPassword123!',
      role: ROLES.ADMIN,
      phone: '+1 555-0001',
      city: 'Capital City'
    });
  adminToken = resAdmin.body.data.token;
  adminUser = resAdmin.body.data.user;

  // 2. Second Admin (to test last admin protection)
  const resAdmin2 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Super Admin Beta',
      email: 'admin.beta@lifelink.org',
      password: 'AdminMasterPassword123!',
      role: ROLES.ADMIN,
      phone: '+1 555-0002',
      city: 'Metro City'
    });
  secondAdminToken = resAdmin2.body.data.token;
  secondAdminUser = resAdmin2.body.data.user;

  // 3. Donor User
  const resDonor = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'David Donor',
      email: 'david.donor@lifelink.org',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0003',
      city: 'Metropolis',
      bloodGroup: 'O+'
    });
  donorToken = resDonor.body.data.token;
  donorUser = resDonor.body.data.user;

  // 4. Patient User
  const resPatient = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Pamela Patient',
      email: 'pamela.patient@lifelink.org',
      password: 'PatientPassword123!',
      role: ROLES.PATIENT,
      phone: '+1 555-0004',
      city: 'Metropolis'
    });
  patientToken = resPatient.body.data.token;
  patientUser = resPatient.body.data.user;

  // 5. Verified Hospital
  const resHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'General Medical Center',
      email: 'contact@genmed.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-0005',
      city: 'Metropolis',
      hospitalDetails: {
        facilityName: 'General Medical Center',
        licenseNumber: 'LIC-GEN-888',
        hospitalType: 'GOVERNMENT',
        isVerified: true,
        verificationStatus: 'VERIFIED'
      }
    });
  hospitalToken = resHosp.body.data.token;
  hospitalUser = resHosp.body.data.user;

  // 6. Pending Hospital Applicant
  const resPendingHosp = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Hope Specialized Clinic',
      email: 'info@hopeclinic.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-0006',
      city: 'Gotham',
      hospitalDetails: {
        facilityName: 'Hope Specialized Clinic',
        licenseNumber: 'LIC-HOPE-999',
        hospitalType: 'PRIVATE',
        verificationStatus: 'PENDING'
      }
    });
  pendingHospitalToken = resPendingHosp.body.data.token;
  pendingHospitalUser = resPendingHosp.body.data.user;

  // 7. Seed Blood Request
  const patientId = patientUser._id || patientUser.id;
  const hospitalDocId = hospitalUser._id || hospitalUser.id;

  const bloodReq = await BloodRequest.create({
    patient: patientId,
    patientName: patientUser.name,
    bloodGroup: 'O+',
    unitsRequired: 3,
    hospital: hospitalUser.hospitalDetails?.facilityName || hospitalUser.name,
    hospitalId: hospitalDocId,
    priority: REQUEST_PRIORITIES.CRITICAL,
    status: REQUEST_STATUS.PENDING,
    contactPhone: '+1 555-0004',
    city: 'Metropolis',
    requiredDate: new Date(Date.now() + 48 * 3600 * 1000)
  });
  sampleRequestId = bloodReq._id;

  // 8. Seed Inventory & Stock
  await BloodInventory.create({
    hospital: hospitalDocId,
    bloodGroup: 'O+',
    unitsAvailable: 8,
    lowStockThreshold: 10
  });

  await BloodStock.create({
    hospital: hospitalDocId,
    batchNumber: 'BATCH-ADM-001',
    bloodGroup: 'O+',
    units: 8,
    remainingUnits: 8,
    status: 'AVAILABLE',
    collectionDate: new Date(),
    expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000)
  });
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
});

describe('Phase 7: Super Admin Dashboard & RBAC Access Control', () => {
  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/admin/kpis');
    assert.equal(res.status, 401);
  });

  it('should reject non-admin users (DONOR) with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/kpis')
      .set('Authorization', `Bearer ${donorToken}`);
    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access denied/);
  });

  it('should reject non-admin users (HOSPITAL) with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${hospitalToken}`);
    assert.equal(res.status, 403);
  });

  it('should allow Super Admin to fetch real calculated KPI metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/kpis')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const kpis = res.body.data;
    assert.ok(kpis.totalUsers >= 6);
    assert.ok(kpis.totalDonors >= 1);
    assert.ok(kpis.totalPatients >= 1);
    assert.ok(kpis.totalHospitals >= 2);
    assert.ok(kpis.totalBloodRequests >= 1);
    assert.ok(kpis.criticalBloodRequests >= 1);
    assert.equal(kpis.totalAvailableUnits, 8);
    assert.equal(kpis.lowStockAlerts, 1);
  });
});

describe('Phase 7: User Management Oversight', () => {
  it('should return paginated user directory with role filter', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?role=DONOR')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.users.length >= 1);
    assert.equal(res.body.data.users[0].role, ROLES.DONOR);
    // Ensure password hash is NEVER exposed
    assert.equal(res.body.data.users[0].password, undefined);
  });

  it('should support full-text search across users', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?search=David')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.users.some((u) => u.name === 'David Donor'));
  });

  it('should fetch user details by ID', async () => {
    const donorId = donorUser._id || donorUser.id;
    const res = await request(app)
      .get(`/api/v1/admin/users/${donorId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.email, 'david.donor@lifelink.org');
    assert.equal(res.body.data.password, undefined);
  });

  it('should allow updating user active status and log audit event', async () => {
    const donorId = donorUser._id || donorUser.id;
    const res = await request(app)
      .patch(`/api/v1/admin/users/${donorId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false, reason: 'Temporary administrative review' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.isActive, false);

    // Verify audit log was created
    const log = await AuditLog.findOne({
      targetId: donorId.toString(),
      action: 'USER_STATUS_CHANGE'
    });
    assert.ok(log);
    assert.equal(log.details.newStatus, false);

    // Reactivate donor for subsequent tests
    await request(app)
      .patch(`/api/v1/admin/users/${donorId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true, reason: 'Restoring active status' });
  });

  it('should prevent deactivating the last active Super Admin', async () => {
    const secondAdminId = secondAdminUser._id || secondAdminUser.id;
    const primaryAdminId = adminUser._id || adminUser.id;

    // First deactivate second admin
    await request(app)
      .patch(`/api/v1/admin/users/${secondAdminId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false, reason: 'Testing guard' });

    // Now attempt to deactivate primary admin (the only remaining active admin)
    const res = await request(app)
      .patch(`/api/v1/admin/users/${primaryAdminId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false, reason: 'Should fail' });

    assert.equal(res.status, 400);
    assert.match(res.body.message, /Cannot deactivate the platform’s last active Super Admin/);

    // Reactivate second admin for subsequent tests
    await request(app)
      .patch(`/api/v1/admin/users/${secondAdminId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true, reason: 'Reactivation' });
  });

  it('should allow updating user role and log audit event', async () => {
    const donorId = donorUser._id || donorUser.id;
    const res = await request(app)
      .patch(`/api/v1/admin/users/${donorId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: ROLES.VOLUNTEER, reason: 'Promoted to volunteer coordinator' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.role, ROLES.VOLUNTEER);

    const log = await AuditLog.findOne({
      targetId: donorId.toString(),
      action: 'USER_ROLE_CHANGE'
    });
    assert.ok(log);
    assert.equal(log.details.newRole, ROLES.VOLUNTEER);
  });
});

describe('Phase 7: Hospital Oversight & Verification', () => {
  it('should list pending hospital applications', async () => {
    const res = await request(app)
      .get('/api/v1/admin/hospitals/pending')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.hospitals.some((h) => h.email === 'info@hopeclinic.org'));
  });

  it('should verify a hospital with audit logging', async () => {
    const pendingHospId = pendingHospitalUser._id || pendingHospitalUser.id;
    const res = await request(app)
      .patch(`/api/v1/admin/hospitals/${pendingHospId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ verificationNotes: 'All clinical and blood bank licenses authenticated.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.hospitalDetails.verificationStatus, 'VERIFIED');
    assert.equal(res.body.data.hospitalDetails.isVerified, true);

    const log = await AuditLog.findOne({
      targetId: pendingHospId.toString(),
      action: 'HOSPITAL_VERIFIED'
    });
    assert.ok(log);
    assert.match(log.details.notes, /authenticated/);
  });

  it('should reject a hospital verification with audit logging', async () => {
    // Create another applicant
    const resHosp = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Unverified Clinic',
        email: 'invalid@unverified.org',
        password: 'HospitalPassword123!',
        role: ROLES.HOSPITAL,
        city: 'Metropolis',
        hospitalDetails: {
          facilityName: 'Unverified Clinic',
          licenseNumber: 'LIC-FAKE-000',
          verificationStatus: 'PENDING'
        }
      });
    const unverifiedId = resHosp.body.data.user._id || resHosp.body.data.user.id;

    const res = await request(app)
      .patch(`/api/v1/admin/hospitals/${unverifiedId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ verificationNotes: 'Invalid license documentation provided.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.hospitalDetails.verificationStatus, 'REJECTED');
    assert.equal(res.body.data.hospitalDetails.isVerified, false);
  });
});

describe('Phase 7: Blood Request Monitoring & Inventory Oversight', () => {
  it('should list system-wide blood requests with filtering', async () => {
    const res = await request(app)
      .get('/api/v1/admin/blood-requests?priority=CRITICAL')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.requests.length >= 1);
    assert.equal(res.body.data.requests[0].priority, 'CRITICAL');
  });

  it('should allow admin status override with reason', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/blood-requests/${sampleRequestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: REQUEST_STATUS.APPROVED,
        reason: 'Super Admin emergency expedited approval'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, REQUEST_STATUS.APPROVED);

    const log = await AuditLog.findOne({
      targetId: sampleRequestId.toString(),
      action: 'REQUEST_STATUS_OVERRIDE'
    });
    assert.ok(log);
    assert.equal(log.details.newStatus, REQUEST_STATUS.APPROVED);
  });

  it('should get system-wide inventory overview', async () => {
    const res = await request(app)
      .get('/api/v1/admin/inventory')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.summary.totalUnitsAvailable >= 8);
    assert.ok(res.body.data.inventories.length >= 1);
  });
});

describe('Phase 7: Platform Announcements & Broadcasts', () => {
  it('should dispatch platform announcements to targeted roles', async () => {
    const res = await request(app)
      .post('/api/v1/admin/broadcast')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Emergency Blood Drive Notice',
        message: 'Severe O-Negative shortage in Metropolis region. Immediate donations needed.',
        targetRoles: [ROLES.DONOR, ROLES.VOLUNTEER],
        isEmergency: true
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.recipientsNotified >= 1);

    const log = await AuditLog.findOne({
      action: 'SYSTEM_ANNOUNCEMENT'
    });
    assert.ok(log);
    assert.equal(log.details.isEmergency, true);
  });
});

describe('Phase 7: Platform Analytics API', () => {
  it('should get overview metrics for 30d window', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/overview?range=30d')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.newUsersCount >= 1);
    assert.ok(res.body.data.fulfillmentRate !== undefined);
  });

  it('should get registration trends grouped by date', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/registrations?range=7d')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it('should get blood request trends', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/blood-requests?range=30d')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });

  it('should get blood group distribution breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/blood-groups')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.equal(res.body.data.length, 8); // 8 blood groups
  });

  it('should get emergency priority breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/priorities?range=30d')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.CRITICAL >= 1);
  });

  it('should get hospital performance metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/hospitals')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
  });
});

describe('Phase 7: Audit Logging Retrieval', () => {
  it('should retrieve paginated audit logs', async () => {
    const res = await request(app)
      .get('/api/v1/admin/audit-logs?limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.logs.length >= 3);
    assert.ok(res.body.data.pagination.total >= 3);
  });

  it('should retrieve audit log details by ID', async () => {
    const sampleLog = await AuditLog.findOne();
    const res = await request(app)
      .get(`/api/v1/admin/audit-logs/${sampleLog._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.action, sampleLog.action);
  });
});
