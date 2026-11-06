import { User } from '../models/user.model.js';
import { DonationRecord } from '../models/donationRecord.model.js';
import { BloodRequest } from '../models/bloodRequest.model.js';
import { DonorInvitation } from '../models/donorInvitation.model.js';
import { Notification } from '../models/notification.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { ApiError } from '../utils/apiError.js';
import {
  ROLES,
  AUDIT_ACTIONS,
  NOTIFICATION_TYPES,
  INVITATION_STATUS,
  DONATION_RECORD_STATUS,
  DONOR_AVAILABILITY_STATUS
} from '../utils/constants.js';
import {
  calculateDonationEligibility,
  getBloodCompatibility,
  calculateProfileCompletion,
  CLINICAL_ELIGIBILITY_DISCLAIMER
} from '../utils/eligibilityCalculator.js';

export class DonorService {
  /**
   * Retrieve donor profile with real-time calculated eligibility, compatibility, and completion score
   */
  static async getDonorProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const eligibility = calculateDonationEligibility(user);
    const compatibility = getBloodCompatibility(user.bloodGroup);
    const profileCompletion = calculateProfileCompletion(user);

    return {
      donor: user.toJSON(),
      profile: {
        ...user.toJSON(),
        profileCompletion
      },
      eligibility,
      compatibility
    };
  }

  /**
   * Update donor profile fields, recalculate clinical eligibility and profile completion
   */
  static async updateDonorProfile(userId, updateData, actorUser = null) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    // Top-level fields
    if (updateData.name !== undefined) user.name = updateData.name.trim();
    if (updateData.phone !== undefined) user.phone = updateData.phone.trim();
    if (updateData.city !== undefined) user.city = updateData.city.trim();
    if (updateData.bloodGroup !== undefined) user.bloodGroup = updateData.bloodGroup;

    // Ensure donorDetails subdocument exists
    if (!user.donorDetails) {
      user.donorDetails = {};
    }

    // Donor Details fields
    if (updateData.dateOfBirth !== undefined) {
      user.donorDetails.dateOfBirth = updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null;
    }

    if (updateData.avatar !== undefined) {
      user.donorDetails.avatar = updateData.avatar.trim();
    }

    if (updateData.lastDonationDate !== undefined) {
      user.donorDetails.lastDonationDate = updateData.lastDonationDate
        ? new Date(updateData.lastDonationDate)
        : null;
    }

    if (updateData.isAvailable !== undefined) {
      user.donorDetails.isAvailable = Boolean(updateData.isAvailable);
      user.donorDetails.availabilityStatus = user.donorDetails.isAvailable
        ? DONOR_AVAILABILITY_STATUS.AVAILABLE
        : DONOR_AVAILABILITY_STATUS.UNAVAILABLE;
      user.donorDetails.availabilityUpdatedAt = new Date();
    }

    if (updateData.availabilityStatus !== undefined) {
      user.donorDetails.availabilityStatus = updateData.availabilityStatus;
      user.donorDetails.isAvailable = updateData.availabilityStatus === DONOR_AVAILABILITY_STATUS.AVAILABLE;
      user.donorDetails.availabilityUpdatedAt = new Date();
    }

    if (updateData.availabilityNotes !== undefined) {
      user.donorDetails.availabilityNotes = updateData.availabilityNotes.trim();
    }

    if (updateData.age !== undefined) {
      user.donorDetails.age = updateData.age !== null ? Number(updateData.age) : null;
    }

    if (updateData.weight !== undefined) {
      user.donorDetails.weight = updateData.weight !== null ? Number(updateData.weight) : null;
    }

    if (updateData.gender !== undefined) {
      user.donorDetails.gender = updateData.gender;
    }

    if (updateData.address !== undefined) {
      user.donorDetails.address = updateData.address.trim();
    }

    if (updateData.state !== undefined) {
      user.donorDetails.state = updateData.state.trim();
    }

    if (updateData.postalCode !== undefined) {
      user.donorDetails.postalCode = updateData.postalCode.trim();
    }

    if (updateData.emergencyContact !== undefined) {
      user.donorDetails.emergencyContact = updateData.emergencyContact.trim();
    }

    if (updateData.emergencyContactName !== undefined) {
      user.donorDetails.emergencyContactName = updateData.emergencyContactName.trim();
    }

    if (updateData.totalDonations !== undefined) {
      user.donorDetails.totalDonations = Number(updateData.totalDonations);
    }

    if (updateData.medicalNotes !== undefined) {
      user.donorDetails.medicalNotes = updateData.medicalNotes.trim();
    }

    // Recalculate eligibility status and profile completion
    const eligibility = calculateDonationEligibility(user);
    user.donorDetails.eligibilityStatus = eligibility.status;
    const profileCompletion = calculateProfileCompletion(user);
    user.donorDetails.profileCompletion = profileCompletion;

    await user.save();

    // Record audit log
    if (actorUser) {
      await AuditLog.record({
        actor: actorUser,
        action: AUDIT_ACTIONS.DONOR_PROFILE_UPDATE,
        targetResource: 'User',
        targetId: user._id.toString(),
        targetIdentifier: user.email,
        details: { profileCompletion }
      });
    }

    const compatibility = getBloodCompatibility(user.bloodGroup);

    return {
      donor: user.toJSON(),
      profile: {
        ...user.toJSON(),
        profileCompletion
      },
      eligibility,
      compatibility
    };
  }

  /**
   * Fast toggle / pause donor availability status
   */
  static async updateAvailability(userId, payload, actorUser = null) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    if (!user.donorDetails) {
      user.donorDetails = {};
    }

    let isAvailable = user.donorDetails.isAvailable;
    let availabilityStatus = user.donorDetails.availabilityStatus || DONOR_AVAILABILITY_STATUS.AVAILABLE;

    if (typeof payload.isAvailable === 'boolean') {
      isAvailable = payload.isAvailable;
      availabilityStatus = isAvailable
        ? DONOR_AVAILABILITY_STATUS.AVAILABLE
        : DONOR_AVAILABILITY_STATUS.UNAVAILABLE;
    }

    if (payload.availabilityStatus) {
      availabilityStatus = payload.availabilityStatus;
      isAvailable = availabilityStatus === DONOR_AVAILABILITY_STATUS.AVAILABLE;
    }

    user.donorDetails.isAvailable = isAvailable;
    user.donorDetails.availabilityStatus = availabilityStatus;
    user.donorDetails.availabilityUpdatedAt = new Date();

    if (payload.availabilityNotes !== undefined) {
      user.donorDetails.availabilityNotes = payload.availabilityNotes.trim();
    }

    await user.save();

    if (actorUser) {
      await AuditLog.record({
        actor: actorUser,
        action: AUDIT_ACTIONS.DONOR_AVAILABILITY_CHANGE,
        targetResource: 'User',
        targetId: user._id.toString(),
        targetIdentifier: user.email,
        details: {
          isAvailable,
          availabilityStatus,
          notes: user.donorDetails.availabilityNotes
        }
      });
    }

    return {
      userId: user._id,
      isAvailable,
      availabilityStatus,
      availabilityUpdatedAt: user.donorDetails.availabilityUpdatedAt,
      availabilityNotes: user.donorDetails.availabilityNotes
    };
  }

  /**
   * Aggregate donor dashboard analytics and clinical summary from MongoDB
   */
  static async getDonorDashboard(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const donorDetails = user.donorDetails || {};
    const eligibility = calculateDonationEligibility(user);
    const compatibility = getBloodCompatibility(user.bloodGroup);
    const profileCompletion = calculateProfileCompletion(user);

    // Verified donations count from DonationRecord
    const verifiedDonationsCount = await DonationRecord.countDocuments({
      donor: userId,
      status: { $in: [DONATION_RECORD_STATUS.VERIFIED, DONATION_RECORD_STATUS.COMPLETED] }
    });

    const totalDonations = Math.max(verifiedDonationsCount, donorDetails.totalDonations || 0);
    const livesSavedEstimate = totalDonations * 3;

    // Recent verified donations
    const recentDonations = await DonationRecord.find({
      donor: userId,
      status: { $in: [DONATION_RECORD_STATUS.VERIFIED, DONATION_RECORD_STATUS.COMPLETED] }
    })
      .sort({ donationDate: -1 })
      .limit(5);

    // Nearby compatible blood requests
    const compatibleGroups = compatibility.giveTo || [user.bloodGroup];
    const recentNearbyRequests = await BloodRequest.find({
      status: { $in: ['PENDING', 'APPROVED', 'MATCHED'] },
      bloodGroup: { $in: compatibleGroups }
    })
      .select('requestId patientName bloodGroup unitsRequired unitsFulfilled hospital city requiredDate priority status createdAt')
      .sort({ priority: 1, createdAt: -1 })
      .limit(4);

    // Invitations and activity summary
    const invitations = await DonorInvitation.find({ donor: userId })
      .populate('request', 'requestId patientName bloodGroup hospital city priority status')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalInvited = await DonorInvitation.countDocuments({ donor: userId });
    const acceptedCount = await DonorInvitation.countDocuments({
      donor: userId,
      status: INVITATION_STATUS.ACCEPTED
    });
    const rejectedCount = await DonorInvitation.countDocuments({
      donor: userId,
      status: INVITATION_STATUS.REJECTED
    });

    return {
      overview: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        bloodGroup: user.bloodGroup || 'Not specified',
        city: user.city || 'Not specified',
        isAvailable: donorDetails.isAvailable !== false,
        availabilityStatus: donorDetails.availabilityStatus || (donorDetails.isAvailable !== false ? 'AVAILABLE' : 'UNAVAILABLE'),
        availabilityUpdatedAt: donorDetails.availabilityUpdatedAt || user.updatedAt,
        availabilityNotes: donorDetails.availabilityNotes || '',
        profileCompletion,
        totalDonations,
        livesSavedEstimate,
        lastDonationDate: donorDetails.lastDonationDate || null
      },
      metrics: {
        totalDonations,
        livesSavedEstimate,
        lastDonationDate: donorDetails.lastDonationDate || null,
        daysSinceLastDonation: eligibility.daysSinceLastDonation
      },
      eligibility,
      compatibility,
      recentDonations,
      recentNearbyRequests,
      recentInvitations: invitations,
      clinicalGuidance: [
        {
          id: 'hydration',
          title: 'Pre-Donation Hydration',
          tip: 'Drink an extra 16-24 oz of water or fluids 2 hours prior to clinical collection.'
        },
        {
          id: 'nutrition',
          title: 'Iron-Rich Nutrition',
          tip: 'Maintain iron-rich meals (spinach, beans, poultry) to support optimal hemoglobin levels.'
        },
        {
          id: 'rest',
          title: 'Adequate Rest',
          tip: 'Ensure at least 7-8 hours of sleep the night before your scheduled donation.'
        },
        {
          id: 'safety',
          title: 'Post-Donation Care',
          tip: 'Avoid strenuous heavy lifting or intense cardiovascular workouts for 24 hours.'
        }
      ],
      responseStatistics: {
        totalInvited,
        acceptedCount,
        rejectedCount,
        pendingCount: Math.max(0, totalInvited - acceptedCount - rejectedCount),
        responseRate: totalInvited > 0 ? Math.round(((acceptedCount + rejectedCount) / totalInvited) * 100) : 100
      },
      clinicalSafetyNotice: CLINICAL_ELIGIBILITY_DISCLAIMER
    };
  }

  /**
   * Discover relevant nearby emergency blood requests for the donor
   */
  static async getNearbyRequests(userId, query = {}) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const compatibility = getBloodCompatibility(user.bloodGroup);
    const compatibleGroups = compatibility.giveTo || [user.bloodGroup];

    const {
      bloodGroup,
      urgency,
      city,
      page = 1,
      limit = 10
    } = query;

    const filter = {
      status: { $in: ['PENDING', 'APPROVED', 'MATCHED'] }
    };

    if (bloodGroup && bloodGroup !== 'ALL') {
      filter.bloodGroup = bloodGroup;
    } else {
      filter.bloodGroup = { $in: compatibleGroups };
    }

    if (urgency && urgency !== 'ALL') {
      filter.priority = urgency;
    }

    if (city && city.trim()) {
      filter.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Protect patient privacy: omit contact phone/email
    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .select('requestId patientName bloodGroup unitsRequired unitsFulfilled hospital hospitalId city requiredDate priority status medicalNotes createdAt')
        .sort({ priority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BloodRequest.countDocuments(filter)
    ]);

    // Check if donor has responded to each request
    const requestIds = requests.map((r) => r._id);
    const myInvitations = await DonorInvitation.find({
      donor: userId,
      request: { $in: requestIds }
    }).lean();

    const invitationMap = new Map();
    for (const inv of myInvitations) {
      invitationMap.set(inv.request.toString(), inv);
    }

    const enrichedRequests = requests.map((req) => {
      const inv = invitationMap.get(req._id.toString());
      return {
        ...req,
        myResponse: inv
          ? {
              status: inv.status,
              respondedAt: inv.respondedAt,
              notes: inv.responseNotes
            }
          : null
      };
    });

    return {
      requests: enrichedRequests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Respond to an active blood request (Accept or Decline)
   */
  static async respondToBloodRequest(userId, requestId, responseData, actorUser = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const bloodRequest = await BloodRequest.findOne({
      $or: [{ _id: requestId.match(/^[0-9a-fA-F]{24}$/) ? requestId : null }, { requestId }]
    });

    if (!bloodRequest) {
      throw new ApiError(404, 'Blood request not found.');
    }

    if (['FULFILLED', 'REJECTED', 'CANCELLED'].includes(bloodRequest.status)) {
      throw new ApiError(400, `Cannot respond to blood request in ${bloodRequest.status} state.`);
    }

    const status = responseData.response === 'REJECTED' ? INVITATION_STATUS.REJECTED : INVITATION_STATUS.ACCEPTED;

    // Find or create invitation record
    let invitation = await DonorInvitation.findOne({
      request: bloodRequest._id,
      donor: userId
    });

    if (!invitation) {
      invitation = new DonorInvitation({
        request: bloodRequest._id,
        donor: userId,
        hospital: bloodRequest.hospitalId || null,
        priority: bloodRequest.priority,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }

    invitation.status = status;
    invitation.respondedAt = new Date();
    invitation.responseNotes = responseData.notes ? responseData.notes.trim() : '';
    await invitation.save();

    // Create notifications for the hospital if assigned
    if (bloodRequest.hospitalId) {
      await Notification.create({
        recipient: bloodRequest.hospitalId,
        type: NOTIFICATION_TYPES.DONATION_ACCEPTED,
        title: `Donor Responded: ${user.name} (${user.bloodGroup})`,
        message: `Donor ${user.name} has ${status.toLowerCase()} the emergency requisition for patient ${bloodRequest.patientName} (${bloodRequest.requestId}).`,
        priority: bloodRequest.priority,
        data: {
          requestId: bloodRequest.requestId,
          donorId: user._id,
          status
        }
      });
    }

    // Record audit log
    if (actorUser) {
      await AuditLog.record({
        actor: actorUser,
        action: AUDIT_ACTIONS.DONOR_REQUEST_RESPONSE,
        targetResource: 'BloodRequest',
        targetId: bloodRequest._id.toString(),
        targetIdentifier: bloodRequest.requestId,
        details: {
          status,
          notes: invitation.responseNotes
        }
      });
    }

    return {
      invitation,
      bloodRequest: {
        requestId: bloodRequest.requestId,
        patientName: bloodRequest.patientName,
        bloodGroup: bloodRequest.bloodGroup,
        hospital: bloodRequest.hospital
      },
      status,
      message: `Successfully recorded ${status} response for requisition ${bloodRequest.requestId}.`
    };
  }

  /**
   * Retrieve verified donation records with pagination and filters
   */
  static async getDonationHistory(userId, query = {}) {
    const { year, bloodGroup, page = 1, limit = 10 } = query;

    const filter = {
      donor: userId,
      status: { $in: [DONATION_RECORD_STATUS.VERIFIED, DONATION_RECORD_STATUS.COMPLETED] }
    };

    if (bloodGroup && bloodGroup !== 'ALL') {
      filter.bloodGroup = bloodGroup;
    }

    if (year && !isNaN(year)) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      filter.donationDate = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [donations, total, unitsAgg] = await Promise.all([
      DonationRecord.find(filter)
        .sort({ donationDate: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DonationRecord.countDocuments(filter),
      DonationRecord.aggregate([
        { $match: filter },
        { $group: { _id: null, totalUnits: { $sum: '$units' } } }
      ])
    ]);

    const totalUnits = unitsAgg.length > 0 ? unitsAgg[0].totalUnits : 0;

    return {
      donations,
      summary: {
        totalVerifiedRecords: total,
        totalUnitsDonated: totalUnits,
        livesSavedEstimate: totalUnits * 3
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Record a new verified donation event
   */
  static async recordDonation(userId, payload, actorUser = null) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const donationDate = payload.donationDate ? new Date(payload.donationDate) : new Date();
    const units = Number(payload.units) || 1;

    const record = await DonationRecord.create({
      donor: userId,
      hospital: payload.hospitalId || null,
      hospitalName: payload.hospitalName.trim(),
      bloodGroup: payload.bloodGroup || user.bloodGroup,
      units,
      donationDate,
      componentType: payload.componentType || 'WHOLE_BLOOD',
      status: DONATION_RECORD_STATUS.VERIFIED,
      bloodRequest: payload.bloodRequestId || null,
      certificateNumber: payload.certificateNumber ? payload.certificateNumber.trim() : `CERT-${Date.now().toString(36).toUpperCase()}`,
      verifiedBy: actorUser ? actorUser._id : null,
      notes: payload.notes ? payload.notes.trim() : ''
    });

    // Update user donorDetails
    if (!user.donorDetails) user.donorDetails = {};
    user.donorDetails.totalDonations = (user.donorDetails.totalDonations || 0) + units;
    user.donorDetails.lastDonationDate = donationDate;

    // Recalculate eligibility with the new last donation date
    const eligibility = calculateDonationEligibility(user);
    user.donorDetails.eligibilityStatus = eligibility.status;
    await user.save();

    if (actorUser) {
      await AuditLog.record({
        actor: actorUser,
        action: AUDIT_ACTIONS.DONATION_RECORD_CREATED,
        targetResource: 'DonationRecord',
        targetId: record._id.toString(),
        targetIdentifier: record.certificateNumber,
        details: {
          hospitalName: record.hospitalName,
          bloodGroup: record.bloodGroup,
          units: record.units
        }
      });
    }

    return record;
  }

  /**
   * Aggregates real MongoDB analytics for the donor
   */
  static async getDonorAnalytics(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    // Donation timeline: aggregate verified donations by year-month
    const monthlyAgg = await DonationRecord.aggregate([
      {
        $match: {
          donor: user._id,
          status: { $in: [DONATION_RECORD_STATUS.VERIFIED, DONATION_RECORD_STATUS.COMPLETED] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          units: { $sum: '$units' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const timeline = monthlyAgg.map((item) => ({
      period: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      units: item.units,
      donations: item.count
    }));

    // Invitations stats
    const [totalInvited, accepted, rejected] = await Promise.all([
      DonorInvitation.countDocuments({ donor: userId }),
      DonorInvitation.countDocuments({ donor: userId, status: INVITATION_STATUS.ACCEPTED }),
      DonorInvitation.countDocuments({ donor: userId, status: INVITATION_STATUS.REJECTED })
    ]);

    const totalDonations = await DonationRecord.countDocuments({
      donor: userId,
      status: { $in: [DONATION_RECORD_STATUS.VERIFIED, DONATION_RECORD_STATUS.COMPLETED] }
    });

    return {
      overview: {
        totalDonations: Math.max(totalDonations, user.donorDetails?.totalDonations || 0),
        livesSavedEstimate: Math.max(totalDonations, user.donorDetails?.totalDonations || 0) * 3,
        totalInvited,
        accepted,
        rejected,
        responseRate: totalInvited > 0 ? Math.round(((accepted + rejected) / totalInvited) * 100) : 100
      },
      timeline,
      responseDistribution: [
        { name: 'Accepted', value: accepted, color: '#10B981' },
        { name: 'Declined', value: rejected, color: '#EF4444' },
        { name: 'Pending', value: Math.max(0, totalInvited - accepted - rejected), color: '#F59E0B' }
      ]
    };
  }

  /**
   * Informational donation eligibility reminder details with clinical disclaimer
   */
  static async getEligibilityInfo(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const eligibility = calculateDonationEligibility(user);

    return {
      eligibility,
      lastDonationDate: user.donorDetails?.lastDonationDate || null,
      nextAssessmentReminder: eligibility.nextEligibleDate,
      clinicalSafetyNotice: CLINICAL_ELIGIBILITY_DISCLAIMER,
      informationalReminders: [
        'A minimum rest interval of 56 days is recommended between whole blood donations.',
        'Donors must be aged between 18 and 65 years and weigh at least 50 kg.',
        'Hydrate adequately with at least 500ml water and eat an iron-rich meal prior to screening.',
        'Final eligibility can only be declared after on-site medical and hemoglobin assessment by qualified medical personnel.'
      ]
    };
  }

  /**
   * Search and list donors with filters and pagination (Admin / Hospital access)
   */
  static async listDonors(query = {}) {
    const {
      bloodGroup,
      city,
      isAvailable,
      eligibilityStatus,
      search,
      page = 1,
      limit = 10
    } = query;

    const filter = {
      role: ROLES.DONOR,
      isActive: true
    };

    if (bloodGroup && bloodGroup !== 'ALL') {
      filter.bloodGroup = bloodGroup;
    }

    if (city && city.trim()) {
      filter.city = { $regex: new RegExp(city.trim(), 'i') };
    }

    if (isAvailable !== undefined && isAvailable !== '') {
      filter['donorDetails.isAvailable'] = isAvailable === 'true' || isAvailable === true;
    }

    if (eligibilityStatus && eligibilityStatus !== 'ALL') {
      filter['donorDetails.eligibilityStatus'] = eligibilityStatus;
    }

    if (search && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { city: { $regex: term, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [donors, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    const enrichedDonors = donors.map((d) => ({
      ...d,
      eligibility: calculateDonationEligibility(d),
      compatibility: getBloodCompatibility(d.bloodGroup),
      profileCompletion: calculateProfileCompletion(d)
    }));

    return {
      donors: enrichedDonors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Delete donor by ID (Admin only)
   */
  static async deleteDonor(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    user.isActive = false;
    await user.save();

    return {
      message: `Donor account for ${user.email} deactivated successfully.`
    };
  }
}
