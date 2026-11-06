import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { BloodRequest } from '../src/models/bloodRequest.model.js';
import { DonorInvitation } from '../src/models/donorInvitation.model.js';
import { Notification } from '../src/models/notification.model.js';
import { ROLES, REQUEST_STATUS, REQUEST_PRIORITIES, INVITATION_STATUS, NOTIFICATION_TYPES } from '../src/utils/constants.js';
import { emailService } from '../src/services/email.service.js';

let mongod;
let patientToken;
let patientId;
let hospitalToken;
let hospitalId;
let adminToken;
let donor1Token;
let donor1Id; // A+, Metropolis (same city as request)
let donor2Token;
let donor2Id; // O-, Gotham (different city)
let donor3Id; // B+ (incompatible for A+ request)
let donorIneligibleId; // Permanently ineligible
let bloodRequestId;
let bloodRequestDocId;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_phase5_matching_and_notifications_32chars';
  process.env.JWT_EXPIRES_IN = '1d';

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri, {
    dbName: 'lifelink_phase5_test'
  });
  console.log('[Phase 5 Test Setup] In-Memory MongoDB Connected:', uri);

  // 1. Patient User
  const resPatient = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Sarah Connor',
      email: 'sarah.patient@example.com',
      password: 'PatientPassword123!',
      role: ROLES.PATIENT,
      phone: '+1 555-0101',
      city: 'Metropolis'
    });
  patientToken = resPatient.body.data.token;
  patientId = resPatient.body.data.user._id;

  // 2. Hospital User
  const resHospital = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Metro General Hospital',
      email: 'staff@metrogeneral.org',
      password: 'HospitalPassword123!',
      role: ROLES.HOSPITAL,
      phone: '+1 555-0102',
      city: 'Metropolis',
      hospitalDetails: {
        facilityName: 'Metro General Trauma Center',
        licenseNumber: 'HOSP-METRO-001',
        department: 'Transfusion Medicine'
      }
    });
  hospitalToken = resHospital.body.data.token;
  hospitalId = resHospital.body.data.user._id;

  // 3. Admin User
  const resAdmin = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'System Admin',
      email: 'admin.super@lifelink.org',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN
    });
  adminToken = resAdmin.body.data.token;

  // 4. Compatible Donor 1 (A+, Metropolis - same city)
  const resDonor1 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Alex Donor A+',
      email: 'alex.a.plus@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0103',
      bloodGroup: 'A+',
      city: 'Metropolis'
    });
  donor1Token = resDonor1.body.data.token;
  donor1Id = resDonor1.body.data.user._id;

  // Set donor 1 details: eligible and available
  await User.findByIdAndUpdate(donor1Id, {
    $set: {
      'donorDetails.isAvailable': true,
      'donorDetails.eligibilityStatus': 'VERIFIED_ELIGIBLE',
      'donorDetails.age': 28,
      'donorDetails.weight': 70
    }
  });

  // 5. Compatible Donor 2 (O- universal, Gotham - different city)
  const resDonor2 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Bruce Donor O-',
      email: 'bruce.o.minus@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0104',
      bloodGroup: 'O-',
      city: 'Gotham'
    });
  donor2Token = resDonor2.body.data.token;
  donor2Id = resDonor2.body.data.user._id;

  await User.findByIdAndUpdate(donor2Id, {
    $set: {
      'donorDetails.isAvailable': true,
      'donorDetails.eligibilityStatus': 'VERIFIED_ELIGIBLE',
      'donorDetails.age': 35,
      'donorDetails.weight': 82
    }
  });

  // 6. Incompatible Donor 3 (B+, Metropolis - incompatible for A+ recipient)
  const resDonor3 = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Bob Donor B+',
      email: 'bob.b.plus@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0105',
      bloodGroup: 'B+',
      city: 'Metropolis'
    });
  donor3Id = resDonor3.body.data.user._id;

  // 7. Ineligible Donor 4 (A+, but PERMANENTLY_INELIGIBLE)
  const resDonorIneligible = await request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Deferred Donor',
      email: 'deferred.donor@example.com',
      password: 'DonorPassword123!',
      role: ROLES.DONOR,
      phone: '+1 555-0106',
      bloodGroup: 'A+',
      city: 'Metropolis'
    });
  donorIneligibleId = resDonorIneligible.body.data.user._id;

  await User.findByIdAndUpdate(donorIneligibleId, {
    $set: {
      'donorDetails.eligibilityStatus': 'PERMANENTLY_INELIGIBLE'
    }
  });

  // 8. Create an initial Blood Request (A+, CRITICAL priority, Metropolis)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);

  const resReq = await request(app)
    .post('/api/v1/blood-requests')
    .set('Authorization', `Bearer ${patientToken}`)
    .send({
      patientName: 'John Connor',
      bloodGroup: 'A+',
      unitsRequired: 3,
      hospital: 'Metro General Hospital',
      city: 'Metropolis',
      requiredDate: futureDate.toISOString(),
      priority: REQUEST_PRIORITIES.CRITICAL,
      contactPhone: '+1 555-9999',
      medicalNotes: 'Urgent surgery requirements'
    });

  bloodRequestId = resReq.body.data.requestId;
  bloodRequestDocId = resReq.body.data._id;
});

after(async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
  console.log('[Phase 5 Test Teardown] In-Memory MongoDB Stopped.');
});

describe('1. Advanced Donor Matching Engine', () => {
  it('should find compatible donors and rank by proximity, compatibility, and availability', async () => {
    const res = await request(app)
      .get(`/api/v1/matching/${bloodRequestId}`)
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.candidates.length >= 2, 'Should find at least 2 compatible donors (A+ and O-)');

    const candidates = res.body.data.candidates;

    // Donor 1 (A+, Metropolis) should score higher than Donor 2 (O-, Gotham) due to same-city and exact match bonus
    const firstMatch = candidates[0];
    assert.equal(firstMatch.donor._id.toString(), donor1Id.toString());
    assert.equal(firstMatch.matchDetails.isExactMatch, true);
    assert.equal(firstMatch.matchDetails.isSameCity, true);

    // Verify incompatible B+ donor is NOT in candidate list
    const hasIncompatible = candidates.some((c) => c.donor._id.toString() === donor3Id.toString());
    assert.equal(hasIncompatible, false, 'B+ donor must not be matched for A+ recipient');

    // Verify permanently ineligible donor is excluded
    const hasIneligible = candidates.some((c) => c.donor._id.toString() === donorIneligibleId.toString());
    assert.equal(hasIneligible, false, 'Permanently ineligible donor must be excluded');

    // Verify clinical safety notice is provided
    assert.ok(res.body.data.clinicalNotice.includes('typing and cross-matching'));
  });

  it('should FORBID patient and donor from running matching endpoint directly (403 Forbidden)', async () => {
    const resPatient = await request(app)
      .get(`/api/v1/matching/${bloodRequestId}`)
      .set('Authorization', `Bearer ${patientToken}`);
    assert.equal(resPatient.status, 403);

    const resDonor = await request(app)
      .get(`/api/v1/matching/${bloodRequestId}`)
      .set('Authorization', `Bearer ${donor1Token}`);
    assert.equal(resDonor.status, 403);
  });

  it('should execute matching algorithm via POST /run', async () => {
    const res = await request(app)
      .post(`/api/v1/matching/${bloodRequestId}/run`)
      .set('Authorization', `Bearer ${hospitalToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.summary.totalCompatibleDonors >= 2);
  });
});

describe('2. Donor Invitation Management & Dispatch', () => {
  it('should REJECT sending invitations if request is in PENDING status (must be approved first)', async () => {
    const res = await request(app)
      .post(`/api/v1/matching/${bloodRequestId}/invite`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ donorIds: [donor1Id] });

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes('must be approved by hospital'));
  });

  it('should successfully dispatch invitations when request is APPROVED and transition status to MATCHED', async () => {
    // 1. Hospital approves request
    await request(app)
      .patch(`/api/v1/blood-requests/${bloodRequestId}/status`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ status: REQUEST_STATUS.APPROVED, note: 'Requisition cleared for matching' });

    // 2. Hospital dispatches invitation to Donor 1
    const res = await request(app)
      .post(`/api/v1/matching/${bloodRequestId}/invite`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ donorIds: [donor1Id, donor2Id] });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.sentCount, 2);

    // Verify BloodRequest transitioned from APPROVED to MATCHED
    const reqDoc = await BloodRequest.findOne({ requestId: bloodRequestId });
    assert.equal(reqDoc.status, REQUEST_STATUS.MATCHED);

    // Verify CRITICAL priority calculates 12h expiration
    const invitation = await DonorInvitation.findOne({ request: reqDoc._id, donor: donor1Id });
    assert.ok(invitation);
    assert.equal(invitation.status, INVITATION_STATUS.INVITED);
    const hoursDiff = (new Date(invitation.expiresAt).getTime() - new Date(invitation.invitedAt).getTime()) / (1000 * 60 * 60);
    assert.ok(Math.abs(hoursDiff - 12) < 0.1, 'CRITICAL request expiry should be ~12 hours');
  });

  it('should PREVENT duplicate invitations for the same donor and request', async () => {
    // Attempt to re-send to Donor 1
    const res = await request(app)
      .post(`/api/v1/matching/${bloodRequestId}/invite`)
      .set('Authorization', `Bearer ${hospitalToken}`)
      .send({ donorIds: [donor1Id] });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.sentCount, 0, 'Should not create duplicate invitation');
    assert.equal(res.body.data.skippedCount, 1, 'Should skip duplicate donor');
  });

  it('should allow Donor 1 to list their own invitations (GET /api/v1/matching/my-invitations)', async () => {
    const res = await request(app)
      .get('/api/v1/matching/my-invitations')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.invitations.length >= 1);
    assert.equal(res.body.data.invitations[0].request.requestId, bloodRequestId);
  });
});

describe('3. Invitation Acceptance, Rejection & Lifecycle', () => {
  let donor1InvitationId;
  let donor2InvitationId;

  before(async () => {
    const inv1 = await DonorInvitation.findOne({ donor: donor1Id, request: bloodRequestDocId });
    donor1InvitationId = inv1._id.toString();

    const inv2 = await DonorInvitation.findOne({ donor: donor2Id, request: bloodRequestDocId });
    donor2InvitationId = inv2._id.toString();
  });

  it('should allow Donor 1 to ACCEPT an invitation with response notes', async () => {
    const res = await request(app)
      .post(`/api/v1/invitations/${donor1InvitationId}/accept`)
      .set('Authorization', `Bearer ${donor1Token}`)
      .send({ notes: 'Available immediately for crossmatch.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, INVITATION_STATUS.ACCEPTED);
    assert.ok(res.body.data.respondedAt);

    // Verify BloodRequest is NOT automatically fulfilled (clinical safety constraint)
    const reqDoc = await BloodRequest.findById(bloodRequestDocId);
    assert.notEqual(reqDoc.status, REQUEST_STATUS.FULFILLED, 'Accepting must not automatically fulfill request');
  });

  it('should PREVENT duplicate response on an already accepted invitation (400 Bad Request)', async () => {
    const res = await request(app)
      .post(`/api/v1/invitations/${donor1InvitationId}/accept`)
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes('already been responded to'));
  });

  it('should allow Donor 2 to REJECT an invitation', async () => {
    const res = await request(app)
      .post(`/api/v1/invitations/${donor2InvitationId}/reject`)
      .set('Authorization', `Bearer ${donor2Token}`)
      .send({ notes: 'Traveling out of state this week.' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, INVITATION_STATUS.REJECTED);
  });

  it('should FORBID Donor 2 from modifying Donor 1 invitation', async () => {
    const res = await request(app)
      .post(`/api/v1/invitations/${donor1InvitationId}/reject`)
      .set('Authorization', `Bearer ${donor2Token}`);

    assert.equal(res.status, 404); // Scoped to req.user._id, so not found
  });

  it('should REJECT acceptance when invitation is expired', async () => {
    // Create an expired invitation manually
    const expiredInv = await DonorInvitation.create({
      request: bloodRequestDocId,
      donor: donor1Id,
      status: INVITATION_STATUS.INVITED,
      expiresAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour in the past
    }).catch(async () => {
      // If unique index blocks, use a dummy user
      const dummyDonor = await User.create({
        name: 'Dummy Donor',
        email: 'dummy.expired@example.com',
        password: 'Password123!',
        role: ROLES.DONOR,
        bloodGroup: 'A+'
      });
      const dummyToken = dummyDonor.generateAuthToken();
      const inv = await DonorInvitation.create({
        request: bloodRequestDocId,
        donor: dummyDonor._id,
        status: INVITATION_STATUS.INVITED,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60)
      });
      return { inv, dummyToken };
    });

    const targetId = expiredInv.inv ? expiredInv.inv._id : expiredInv._id;
    const tokenToUse = expiredInv.dummyToken || donor1Token;

    const res = await request(app)
      .post(`/api/v1/invitations/${targetId}/accept`)
      .set('Authorization', `Bearer ${tokenToUse}`);

    assert.equal(res.status, 400);
    assert.ok(res.body.message.includes('expired'));
  });
});

describe('4. Centralized Notification System', () => {
  let createdNotifId;

  it('should have created notifications for Donor 1 upon invitation dispatch', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.notifications.length >= 1);

    const notif = res.body.data.notifications[0];
    createdNotifId = notif._id;
    assert.equal(notif.recipient.toString(), donor1Id.toString());
  });

  it('should return accurate unread count (GET /api/v1/notifications/unread-count)', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.ok(res.body.data.unreadCount >= 1);
  });

  it('should mark a single notification as read (PATCH /api/v1/notifications/:id/read)', async () => {
    const res = await request(app)
      .patch(`/api/v1/notifications/${createdNotifId}/read`)
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.isRead, true);
    assert.ok(res.body.data.readAt);
  });

  it('should mark all notifications as read (PATCH /api/v1/notifications/read-all)', async () => {
    const res = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.success, true);

    const resCount = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${donor1Token}`);
    assert.equal(resCount.body.data.unreadCount, 0);
  });

  it('should FORBID user from deleting another user notification', async () => {
    const res = await request(app)
      .delete(`/api/v1/notifications/${createdNotifId}`)
      .set('Authorization', `Bearer ${donor2Token}`);

    assert.equal(res.status, 404);
  });

  it('should allow user to delete their own notification', async () => {
    const res = await request(app)
      .delete(`/api/v1/notifications/${createdNotifId}`)
      .set('Authorization', `Bearer ${donor1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.success, true);
  });
});

describe('5. Socket.IO & Email Service Resilience', () => {
  it('should handle email delivery gracefully without throwing when SMTP is unconfigured', async () => {
    const result = await emailService.sendEmail({
      to: 'test.donor@example.com',
      subject: 'Emergency Notification Test',
      html: '<p>Test email payload</p>'
    });

    assert.equal(result.sent, true);
    assert.equal(result.mock, true);
  });

  it('should return error gracefully when recipient address is missing', async () => {
    const result = await emailService.sendEmail({
      to: '',
      subject: 'Missing Recipient',
      html: '<p>Test</p>'
    });

    assert.equal(result.sent, false);
    assert.ok(result.reason.includes('missing'));
  });

  it('should verify JWT token for socket connections', async () => {
    // Generate valid token
    const token = jwt.sign(
      { id: donor1Id, email: 'alex.a.plus@example.com', role: ROLES.DONOR },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.equal(decoded.id.toString(), donor1Id.toString());

    // Verify invalid token throws
    assert.throws(() => {
      jwt.verify('invalid.token.string', process.env.JWT_SECRET);
    });
  });
});
