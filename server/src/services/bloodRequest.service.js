import { BloodRequest } from '../models/bloodRequest.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import {
  ROLES,
  REQUEST_STATUS,
  REQUEST_PRIORITIES,
  VALID_STATUS_TRANSITIONS
} from '../utils/constants.js';
import {
  COMPATIBILITY_TABLE,
  calculateDonationEligibility,
  getBloodCompatibility
} from '../utils/eligibilityCalculator.js';

export class BloodRequestService {
  /**
   * Create a new emergency blood request
   */
  static async createRequest(userId, requestData) {
    const patientUser = await User.findById(userId);
    if (!patientUser || !patientUser.isActive) {
      throw new ApiError(401, 'Requester account is invalid or deactivated.');
    }

    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospital,
      hospitalId,
      city,
      requiredDate,
      priority = REQUEST_PRIORITIES.NORMAL,
      medicalNotes = '',
      contactPhone,
      attendantName = ''
    } = requestData;

    const newRequest = new BloodRequest({
      patient: userId,
      patientName: patientName.trim(),
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      hospital: hospital.trim(),
      hospitalId: hospitalId || null,
      city: city.trim(),
      requiredDate: new Date(requiredDate),
      priority,
      medicalNotes: medicalNotes.trim(),
      contactPhone: contactPhone.trim(),
      attendantName: attendantName.trim(),
      status: REQUEST_STATUS.PENDING,
      statusHistory: [
        {
          status: REQUEST_STATUS.PENDING,
          changedBy: userId,
          changedAt: new Date(),
          note: 'Blood request submitted by patient/attendant.'
        }
      ]
    });

    await newRequest.save();
    return newRequest;
  }

  /**
   * Retrieve request history for the logged-in patient
   */
  static async getPatientRequests(userId, query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { patient: userId };

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    if (query.priority) {
      filter.priority = query.priority.toUpperCase();
    }

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BloodRequest.countDocuments(filter)
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single blood request details with authorization check
   */
  static async getRequestById(idOrRequestId, user) {
    const isObjectId = idOrRequestId.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrRequestId } : { requestId: idOrRequestId };

    const request = await BloodRequest.findOne(query)
      .populate('patient', 'name email phone')
      .populate('matchedDonors.donor', 'name bloodGroup city phone donorDetails');

    if (!request) {
      throw new ApiError(404, 'Blood request not found.');
    }

    // Access control:
    // Patient can view their own request
    // Admin and Hospital can view all requests
    const isOwner = request.patient && request.patient._id.toString() === user._id.toString();
    const isStaff = [ROLES.ADMIN, ROLES.HOSPITAL].includes(user.role);

    if (!isOwner && !isStaff) {
      throw new ApiError(
        403,
        'Access denied: You do not have permission to view this blood request.'
      );
    }

    const compatibility = getBloodCompatibility(request.bloodGroup);

    return {
      request,
      compatibility
    };
  }

  /**
   * Cancel an eligible blood request
   */
  static async cancelRequest(idOrRequestId, user, cancellationReason = '') {
    const isObjectId = idOrRequestId.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrRequestId } : { requestId: idOrRequestId };

    const request = await BloodRequest.findOne(query);
    if (!request) {
      throw new ApiError(404, 'Blood request not found.');
    }

    const isOwner = request.patient.toString() === user._id.toString();
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ApiError(
        403,
        'Access denied: Only the requesting patient or an administrator can cancel this request.'
      );
    }

    const eligibleForCancel = [
      REQUEST_STATUS.PENDING,
      REQUEST_STATUS.APPROVED,
      REQUEST_STATUS.MATCHED
    ];

    if (!eligibleForCancel.includes(request.status)) {
      throw new ApiError(
        400,
        `Cannot cancel request in '${request.status}' status. Only PENDING, APPROVED, or MATCHED requests can be cancelled.`
      );
    }

    request.status = REQUEST_STATUS.CANCELLED;
    request.cancellationReason = cancellationReason || 'Cancelled by requester.';
    request.statusHistory.push({
      status: REQUEST_STATUS.CANCELLED,
      changedBy: user._id,
      changedAt: new Date(),
      note: request.cancellationReason
    });

    await request.save();
    return request;
  }

  /**
   * List blood requests with search and filters (Hospital & Admin access)
   */
  static async listRequests(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { requestId: searchRegex },
        { patientName: searchRegex },
        { hospital: searchRegex },
        { city: searchRegex }
      ];
    }

    if (query.bloodGroup) {
      let grp = query.bloodGroup.trim().toUpperCase();
      if (!grp.endsWith('+') && !grp.endsWith('-')) {
        grp = grp + '+';
      }
      filter.bloodGroup = grp;
    }

    if (query.priority) {
      filter.priority = query.priority.toUpperCase();
    }

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    if (query.city) {
      filter.city = { $regex: new RegExp(query.city.trim(), 'i') };
    }

    // Sort order: Critical priority first, then high, then by creation date
    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate('patient', 'name email phone')
        .sort({
          // Priority weighting: CRITICAL > HIGH > NORMAL
          createdAt: -1
        })
        .skip(skip)
        .limit(limit),
      BloodRequest.countDocuments(filter)
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update request status (Hospital or Admin with transition validation)
   */
  static async updateStatus(idOrRequestId, user, updatePayload) {
    const { status, note = '', rejectionReason = '', unitsFulfilled } = updatePayload;

    const isObjectId = idOrRequestId.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrRequestId } : { requestId: idOrRequestId };

    const request = await BloodRequest.findOne(query);
    if (!request) {
      throw new ApiError(404, 'Blood request not found.');
    }

    // Status transition validation
    if (!request.canTransitionTo(status)) {
      const allowed = VALID_STATUS_TRANSITIONS[request.status] || [];
      throw new ApiError(
        400,
        `Invalid status transition from '${request.status}' to '${status}'. Allowed transitions: [${allowed.join(', ') || 'None (Terminal state)'}]`
      );
    }

    request.status = status;

    if (status === REQUEST_STATUS.REJECTED) {
      request.rejectionReason = rejectionReason || note || 'Rejected by hospital administrator.';
    }

    if (unitsFulfilled !== undefined) {
      request.unitsFulfilled = Number(unitsFulfilled);
    } else if (status === REQUEST_STATUS.FULFILLED && request.unitsFulfilled === 0) {
      request.unitsFulfilled = request.unitsRequired;
    }

    request.statusHistory.push({
      status,
      changedBy: user._id,
      changedAt: new Date(),
      note: note || (status === REQUEST_STATUS.REJECTED ? request.rejectionReason : `Status updated to ${status}`)
    });

    await request.save();
    return request;
  }

  /**
   * Donor Matching Engine: finds compatible donors for a blood request
   */
  static async findMatchingDonors(idOrRequestId) {
    const isObjectId = idOrRequestId.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrRequestId } : { requestId: idOrRequestId };

    const request = await BloodRequest.findOne(query);
    if (!request) {
      throw new ApiError(404, 'Blood request not found.');
    }

    // Determine compatible red blood cell donor blood types
    const compatibility = COMPATIBILITY_TABLE[request.bloodGroup];
    const compatibleDonorGroups = compatibility ? compatibility.receiveFrom : [request.bloodGroup];

    // Query active donors with compatible blood types
    const candidateDonors = await User.find({
      role: ROLES.DONOR,
      isActive: true,
      bloodGroup: { $in: compatibleDonorGroups }
    }).select('-password');

    // Filter and score donors using clinical eligibility
    const matchedDonors = candidateDonors.map((donor) => {
      const eligibility = calculateDonationEligibility(donor);
      const isSameCity = donor.city && request.city
        ? donor.city.toLowerCase().trim() === request.city.toLowerCase().trim()
        : false;

      const isExactMatch = donor.bloodGroup === request.bloodGroup;

      // Scoring heuristic:
      // +100 for eligible, +50 for same city, +30 for exact blood group match, +20 for available
      let score = 0;
      if (eligibility.isEligible) score += 100;
      if (donor.donorDetails?.isAvailable !== false) score += 50;
      if (isSameCity) score += 40;
      if (isExactMatch) score += 30;

      return {
        donor: {
          _id: donor._id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          state: donor.donorDetails?.state || '',
          isAvailable: donor.donorDetails?.isAvailable !== false,
          totalDonations: donor.donorDetails?.totalDonations || 0
        },
        matchDetails: {
          score,
          isExactMatch,
          isSameCity,
          compatibleType: donor.bloodGroup,
          eligibility
        }
      };
    });

    // Sort by score descending (highest priority matches first)
    matchedDonors.sort((a, b) => b.matchDetails.score - a.matchDetails.score);

    return {
      request: {
        _id: request._id,
        requestId: request.requestId,
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        unitsRequired: request.unitsRequired,
        priority: request.priority,
        hospital: request.hospital,
        city: request.city,
        status: request.status
      },
      compatibleBloodGroups: compatibleDonorGroups,
      totalMatchesFound: matchedDonors.length,
      donors: matchedDonors,
      clinicalNotice:
        'IMPORTANT: Donor matching identifies potential candidates based on recorded ABO/Rh compatibility, proximity, and eligibility intervals. Final clinical cross-match and biological safety must be performed by authorized hospital medical staff.'
    };
  }

  /**
   * Get blood request aggregate statistics
   */
  static async getDashboardStats(user) {
    const isPatient = user.role === ROLES.PATIENT;
    const baseFilter = isPatient ? { patient: user._id } : {};

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      matchedRequests,
      fulfilledRequests,
      cancelledRequests,
      criticalRequests,
      highPriorityRequests,
      allRequests
    ] = await Promise.all([
      BloodRequest.countDocuments(baseFilter),
      BloodRequest.countDocuments({ ...baseFilter, status: REQUEST_STATUS.PENDING }),
      BloodRequest.countDocuments({ ...baseFilter, status: REQUEST_STATUS.APPROVED }),
      BloodRequest.countDocuments({ ...baseFilter, status: REQUEST_STATUS.MATCHED }),
      BloodRequest.countDocuments({ ...baseFilter, status: REQUEST_STATUS.FULFILLED }),
      BloodRequest.countDocuments({ ...baseFilter, status: REQUEST_STATUS.CANCELLED }),
      BloodRequest.countDocuments({ ...baseFilter, priority: REQUEST_PRIORITIES.CRITICAL }),
      BloodRequest.countDocuments({ ...baseFilter, priority: REQUEST_PRIORITIES.HIGH }),
      BloodRequest.find(baseFilter).select('unitsRequired unitsFulfilled bloodGroup status priority')
    ]);

    const totalUnitsRequired = allRequests.reduce((acc, curr) => acc + (curr.unitsRequired || 0), 0);
    const totalUnitsFulfilled = allRequests.reduce((acc, curr) => acc + (curr.unitsFulfilled || 0), 0);

    // Blood group distribution
    const groupBreakdown = {};
    allRequests.forEach((req) => {
      groupBreakdown[req.bloodGroup] = (groupBreakdown[req.bloodGroup] || 0) + 1;
    });

    return {
      scope: isPatient ? 'PATIENT_PERSONAL' : 'HOSPITAL_PLATFORM',
      overview: {
        totalRequests,
        pendingRequests,
        approvedRequests,
        matchedRequests,
        fulfilledRequests,
        cancelledRequests,
        criticalRequests,
        highPriorityRequests,
        totalUnitsRequired,
        totalUnitsFulfilled,
        fulfillmentRatePercentage: totalUnitsRequired > 0
          ? Math.round((totalUnitsFulfilled / totalUnitsRequired) * 100)
          : 0
      },
      bloodGroupBreakdown: groupBreakdown
    };
  }
}
