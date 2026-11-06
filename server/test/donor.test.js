import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { ROLES } from '../src/utils/constants.js';

let mongod;
let donor1Token;
let donor1Id;
let donor2Token;
let donor2Id;
let adminToken;
let hospitalToken;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_for_donor_tests';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_donor_test'
  });
  console.log('[Donor Test Setup] In-Memory MongoDB Connected:', uri);

  // Setup test users: Donor 1
  const resDonor1 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Alice Walker',
      email: 'alice.donor@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0101',
      bloodGroup: 'A+',
      city: 'Metropolis'
    });
  donor1Token = resDonor1.body.data.token;
  donor1Id = resDonor1.body.data.user._id;

  // Setup test users: Donor 2
  const resDonor2 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Bob Miller',
      email: 'bob.donor@example.com',
      password: 'DonorPassword456!',
      role: ROLES.DONOR,
      phone: '+1 555-0102',
      bloodGroup: 'O-',
      city: 'Gotham'
    });
  donor2Token = resDonor2.body.data.token;
  donor2Id = resDonor2.body.data.user._id;

  // Setup test users: Admin
  const resAdmin = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Chief Admin',
      email: 'chief.admin@lifelink.org',
      password: 'AdminPassword999!',
      role: ROLES.ADMIN
    });
  adminToken = resAdmin.body.data.token;

  // Setup test users: Hospital
  const resHospital = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'St. Jude Hospital Coordinator',
      email: 'coordinator@stjude.org',
      password: 'HospitalPassword888!',
      role: ROLES.HOSPITAL,
      hospitalDetails: {
        licenseNumber: 'HOSP-NY-7721',
        facilityName: 'St. Jude Hospital',
        department: 'Blood Bank'
      }
    });
  hospitalToken = resHospital.body.data.token;
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  console.log('[Donor Test Teardown] In-Memory MongoDB Stopped.');
});

describe('1. Donor Profile Retrieval (GET /api/v1/donors/profile)', () => {
  it('should return authenticated donor profile with calculated eligibility and compatibility', async () => {
    const res = await request(app)
      .get('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.email, 'alice.donor@example.com');
    assert.equal(res.body.data.profile.bloodGroup, 'A+');
    assert.equal(res.body.data.profile.password, undefined);

    // Verify calculated clinical eligibility object
    assert.ok(res.body.data.eligibility);
    assert.equal(typeof res.body.data.eligibility.isEligible, 'boolean');

    // Verify compatibility matrix
    assert.ok(res.body.data.compatibility);
    assert.equal(res.body.data.compatibility.bloodGroup, 'A+');
    assert.ok(Array.isArray(res.body.data.compatibility.giveTo));
    assert.ok(res.body.data.compatibility.giveTo.includes('A+'));
  });

  it('should reject unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/v1/donors/profile');
    assert.equal(res.status, 401);
  });
});

describe('2. Donor Profile Update (PUT /api/v1/donors/profile)', () => {
  it('should successfully update blood group, location, phone, and clinical parameters', async () => {
    const updatePayload = {
      bloodGroup: 'O-',
      phone: '+1 555-9876',
      city: 'Star City',
      address: '742 Evergreen Terrace',
      state: 'West Coast',
      postalCode: '90210',
      age: 28,
      weight: 68,
      gender: 'FEMALE',
      emergencyContact: '+1 555-4321 (Spouse)',
      totalDonations: 4
    };

    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send(updatePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.bloodGroup, 'O-');
    assert.equal(res.body.data.profile.phone, '+1 555-9876');
    assert.equal(res.body.data.profile.city, 'Star City');
    assert.equal(res.body.data.profile.donorDetails.age, 28);
    assert.equal(res.body.data.profile.donorDetails.weight, 68);
    assert.equal(res.body.data.profile.donorDetails.totalDonations, 4);
    assert.equal(res.body.data.profile.donorDetails.address, '742 Evergreen Terrace');

    // Verify compatibility updated to O- (Universal donor)
    assert.equal(res.body.data.compatibility.bloodGroup, 'O-');
    assert.equal(res.body.data.compatibility.isUniversalDonor, true);

    // Verify persistence in MongoDB
    const userInDb = await User.findById(donor1Id);
    assert.equal(userInDb.bloodGroup, 'O-');
    assert.equal(userInDb.donorDetails.weight, 68);
  });
});

describe('3. Blood Group Validation', () => {
  it('should reject invalid blood groups (400 Bad Request)', async () => {
    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({ bloodGroup: 'C_POSITIVE' });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.field === 'bloodGroup'));
  });

  it('should accept all valid blood groups', async () => {
    const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const group of validGroups) {
      const res = await request(app)
        .put('/api/v1/donors/profile')
        .set('Authorization', `Bearer ${donor1Token}`)
        .send({ bloodGroup: group });

      assert.equal(res.status, 200);
      assert.equal(res.body.data.profile.bloodGroup, group);
    }
  });
});

describe('4. Donation Eligibility Calculation & 56-Day Rule', () => {
  it('should mark donor as TEMPORARILY_INELIGIBLE if last donation was within 56 days', async () => {
    // Set last donation date to 20 days ago
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({
        lastDonationDate: twentyDaysAgo.toISOString()
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.eligibility.isEligible, false);
    assert.equal(res.body.data.eligibility.status, 'TEMPORARILY_INELIGIBLE');
    assert.equal(res.body.data.eligibility.daysUntilEligible, 36);
    assert.ok(res.body.data.eligibility.nextEligibleDate);
  });

  it('should mark donor as VERIFIED_ELIGIBLE if last donation was more than 56 days ago', async () => {
    // Set last donation date to 70 days ago
    const seventyDaysAgo = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({
        lastDonationDate: seventyDaysAgo.toISOString(),
        weight: 65,
        age: 30
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.eligibility.isEligible, true);
    assert.equal(res.body.data.eligibility.status, 'VERIFIED_ELIGIBLE');
    assert.equal(res.body.data.eligibility.daysUntilEligible, 0);
  });

  it('should mark donor as INELIGIBLE if weight is below 50kg', async () => {
    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({
        weight: 46
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.eligibility.isEligible, false);
    assert.ok(res.body.data.eligibility.reasons.some((r) => r.includes('50 kg')));
  });

  it('should reject future lastDonationDate (400 Bad Request)', async () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .put('/api/v1/donors/profile')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({
        lastDonationDate: futureDate.toISOString()
      });

    assert.equal(res.status, 400);
    assert.ok(res.body.errors.some((e) => e.field === 'lastDonationDate'));
  });
});

describe('5. Donor Availability Updates (PATCH /api/v1/donors/availability)', () => {
  it('should toggle availability to false', async () => {
    const res = await request(app)
      .patch('/api/v1/donors/availability')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({ isAvailable: false });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.isAvailable, false);

    // Verify in DB
    const userInDb = await User.findById(donor1Id);
    assert.equal(userInDb.donorDetails.isAvailable, false);
  });

  it('should toggle availability back to true', async () => {
    const res = await request(app)
      .patch('/api/v1/donors/availability')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({ isAvailable: true });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.isAvailable, true);
  });

  it('should reject non-boolean isAvailable value (400 Bad Request)', async () => {
    const res = await request(app)
      .patch('/api/v1/donors/availability')
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({ isAvailable: 'yes' });

    assert.equal(res.status, 400);
  });
});

describe('6. Donor Dashboard Integration (GET /api/v1/donors/dashboard)', () => {
  it('should return complete donor dashboard payload with metrics, eligibility, and tips', async () => {
    const res = await request(app)
      .get('/api/v1/donors/dashboard')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const data = res.body.data;
    assert.ok(data.overview);
    assert.equal(data.overview.name, 'Alice Walker');
    assert.ok(data.metrics);
    assert.equal(typeof data.metrics.totalDonations, 'number');
    assert.equal(typeof data.metrics.livesSavedEstimate, 'number');
    assert.ok(data.eligibility);
    assert.ok(data.compatibility);
    assert.ok(Array.isArray(data.clinicalGuidance));
    assert.ok(data.clinicalGuidance.length >= 3);
  });
});

describe('7. Security, Authorization & RBAC', () => {
  it('should FORBID Donor 1 from viewing Donor 2 by ID (403 Forbidden)', async () => {
    const res = await request(app)
      .get(`/api/v1/donors/${donor2Id}`)
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access denied/i);
  });

  it('should FORBID Donor 1 from updating Donor 2 by ID (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/v1/donors/${donor2Id}`)
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({ city: 'Hacked City' });

    assert.equal(res.status, 403);
    assert.match(res.body.message, /Access denied/i);
  });

  it('should ALLOW Donor 1 to view their own profile by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/donors/${donor1Id}`)
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.donor._id, donor1Id);
  });

  it('should ALLOW ADMIN to view any donor profile by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/donors/${donor2Id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.donor.email, 'bob.donor@example.com');
  });

  it('should ALLOW ADMIN to update any donor profile by ID', async () => {
    const res = await request(app)
      .put(`/api/v1/donors/${donor2Id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ city: 'Admin Updated City' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.profile.city, 'Admin Updated City');
  });

  it('should FORBID DONOR role from searching donor directory (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/donors')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 403);
  });

  it('should ALLOW HOSPITAL role to query donor directory with filters', async () => {
    const res = await request(app)
      .get('/api/v1/donors?bloodGroup=O-')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.donors));
    assert.ok(res.body.data.pagination);
  });

  it('should ALLOW ADMIN to deactivate/delete donor by ID', async () => {
    const res = await request(app)
      .delete(`/api/v1/donors/${donor2Id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    const deactivatedUser = await User.findById(donor2Id);
    assert.equal(deactivatedUser.isActive, false);
  });
});

