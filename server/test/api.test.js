import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { ROLES } from '../src/utils/constants.js';

let mongod;
let donorToken;
let adminToken;
let hospitalToken;

before(async () => {
  // Ensure test environment flags
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_key_minimum_32_characters_for_unit_tests';
  process.env.JWT_EXPIRES_IN = '1d';

  // Start in-memory MongoDB instance for fast, isolated, reliable testing
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_test'
  });
  console.log('[Test Setup] In-Memory MongoDB Connected:', uri);
});

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  console.log('[Test Teardown] In-Memory MongoDB Stopped.');
});

describe('1. Health Check Endpoint', () => {
  it('GET /api/v1/health should return system status and database connection info', async () => {
    const res = await request(app).get('/api/v1/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'OK');
    assert.equal(res.body.data.database.isConnected, true);
    assert.equal(res.body.data.database.status, 'connected');
  });

  it('GET / should return LifeLink API metadata', async () => {
    const res = await request(app).get('/');

    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'LifeLink Emergency Blood Donor Network API');
    assert.equal(res.body.version, 'v1');
  });
});

describe('2. User Registration (POST /api/v1/auth/register)', () => {
  it('should successfully register a DONOR and return user data with token', async () => {
    const payload = {
      name: 'John Doe',
      email: 'john.donor@example.com',
      password: 'SecurePassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0100',
      bloodGroup: 'O+',
      city: 'Metropolis'
    };

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(payload);

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token, 'JWT token must be returned');
    assert.equal(res.body.data.user.email, 'john.donor@example.com');
    assert.equal(res.body.data.user.role, ROLES.DONOR);
    assert.equal(res.body.data.user.bloodGroup, 'O+');

    // SECURITY CHECK: Ensure password is never exposed in the response
    assert.equal(res.body.data.user.password, undefined);

    // DATABASE CHECK: Verify password in database is hashed with bcrypt
    const userInDb = await User.findOne({ email: 'john.donor@example.com' }).select('+password');
    assert.ok(userInDb);
    assert.notEqual(userInDb.password, 'SecurePassword123!');
    assert.match(userInDb.password, /^\$2[aby]\$\d+\$/);

    donorToken = res.body.data.token;
  });

  it('should register an ADMIN user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'System Admin',
        email: 'admin@lifelink.org',
        password: 'AdminPassword2026!',
        role: ROLES.ADMIN
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, ROLES.ADMIN);
    adminToken = res.body.data.token;
  });

  it('should register a HOSPITAL user with hospitalDetails', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dr. Sarah Smith',
        email: 'sarah@centralhospital.org',
        password: 'HospitalPassword123!',
        role: ROLES.HOSPITAL,
        hospitalDetails: {
          licenseNumber: 'HOSP-MED-9941',
          facilityName: 'Central General Hospital',
          department: 'Transfusion Medicine'
        }
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.role, ROLES.HOSPITAL);
    hospitalToken = res.body.data.token;
  });

  it('should reject registration with duplicate email (409 Conflict)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Duplicate John',
        email: 'john.donor@example.com',
        password: 'AnotherPassword123!'
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /already exists/i);
  });

  it('should reject registration with invalid email (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Bad Email User',
        email: 'invalid-email-format',
        password: 'ValidPassword123!'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.field === 'email'));
  });

  it('should reject registration with password shorter than 8 chars (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Short Pass',
        email: 'shortpass@example.com',
        password: '123'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.field === 'password'));
  });

  it('should reject registration with invalid role (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Invalid Role',
        email: 'invalidrole@example.com',
        password: 'Password12345!',
        role: 'SUPER_HERO'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((e) => e.field === 'role'));
  });
});

describe('3. User Login (POST /api/v1/auth/login)', () => {
  it('should successfully log in with valid credentials and return JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'john.donor@example.com',
        password: 'SecurePassword123!'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'john.donor@example.com');
    assert.equal(res.body.data.user.password, undefined);
  });

  it('should reject login with wrong password (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'john.donor@example.com',
        password: 'IncorrectPassword999!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid email or password/i);
  });

  it('should reject login with non-existent email (401 Unauthorized)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ghost.user@nonexistent.org',
        password: 'SomePassword123!'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid email or password/i);
  });

  it('should reject login with missing credentials (400 Bad Request)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe('4. Current User Profile (GET /api/v1/auth/me)', () => {
  it('should retrieve current user profile when given valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.email, 'john.donor@example.com');
    assert.equal(res.body.data.name, 'John Doe');
    assert.equal(res.body.data.role, ROLES.DONOR);
    assert.equal(res.body.data.bloodGroup, 'O+');
    assert.equal(res.body.data.password, undefined);
  });

  it('should reject request without Authorization header (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Authentication required/i);
  });

  it('should reject request with invalid or malformed token (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid or malformed/i);
  });
});

describe('5. Role-Based Access Control Middleware (authorizeRoles)', () => {
  it('should ALLOW access to admin-only route for ADMIN role', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin-check')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.role, ROLES.ADMIN);
  });

  it('should FORBID access to admin-only route for DONOR role (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin-check')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Access denied/i);
  });

  it('should ALLOW access to hospital-only route for HOSPITAL role', async () => {
    const res = await request(app)
      .get('/api/v1/auth/hospital-check')
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('should FORBID access to hospital-only route for DONOR role (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/auth/hospital-check')
      .set('Authorization', `Bearer ${donorToken}`);

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Access denied/i);
  });
});

describe('6. Logout Endpoint (POST /api/v1/auth/logout)', () => {
  it('should return 200 with logout confirmation', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.match(res.body.message, /logged out successfully/i);
  });
});

describe('7. Unhandled Routes (404 Not Found)', () => {
  it('should return standardized 404 ApiError response for non-existent route', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Route not found/i);
  });
});

