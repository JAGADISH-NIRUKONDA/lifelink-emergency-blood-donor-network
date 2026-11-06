import { BloodRequest } from '../models/bloodRequest.model.js';
import { User } from '../models/user.model.js';
import { DonorInvitation } from '../models/donorInvitation.model.js';
import { COMPATIBILITY_TABLE, calculateDonationEligibility } from '../utils/eligibilityCalculator.js';
import { ApiError } from '../utils/apiError.js';
import {
  ROLES,
  REQUEST_STATUS,
  INVITATION_STATUS,
  NOTIFICATION_TYPES,
  REQUEST_PRIORITIES
} from '../utils/constants.js';
import { notificationService } from './notification.service.js';
import { emailService } from './email.service.js';
import { emitToRole, emitToUser } from '../sockets/notification.socket.js';

class MatchingService {
  /**
   * Runs the biological matching and donor ranking engine for a blood request
   */
  async runMatching(idOrRequestId) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrRequestId);
    const query = isObjectId ? { _id: idOrRequestId } : { requestId: idOrRequestId };

    const request = await BloodRequest.findOne(query).populate('patient', 'name email phone');
    if (!request) {
      throw new ApiError(404, 'Blood request not found.');
    }

    // Determine compatible red blood cell donor groups
    const compatibility = COMPATIBILITY_TABLE[request.bloodGroup];
    const compatibleDonorGroups = compatibility ? compatibility.receiveFrom : [request.bloodGroup];

    // Find all active donors with compatible blood types
    const candidateDonors = await User.find({
      role: ROLES.DONOR,
      isActive: true,
      bloodGroup: { $in: compatibleDonorGroups }
    }).select('-password');

    // Retrieve existing invitations for this request to track current invitation status
    const existingInvitations = await DonorInvitation.find({ request: request._id });
    const invitationMap = new Map();
    existingInvitations.forEach((inv) => {
      invitationMap.set(inv.donor.toString(), inv);
    });

    const candidates = [];

    for (const donor of candidateDonors) {
      // Exclude permanently ineligible donors
      if (donor.donorDetails?.eligibilityStatus === 'PERMANENTLY_INELIGIBLE') {
        continue;
      }

      const eligibility = calculateDonationEligibility(donor);
      const isSameCity = donor.city && request.city
        ? donor.city.toLowerCase().trim() === request.city.toLowerCase().trim()
        : false;

      const isExactMatch = donor.bloodGroup === request.bloodGroup;
      const isAvailable = donor.donorDetails?.isAvailable !== false;

      // Scoring heuristic:
      // +100 for verified clinical eligibility
      // +50 for availability
      // +40 for same city proximity
      // +30 for exact ABO/Rh match
      // +20 bonus for emergency/critical priority requests
      let score = 0;
      if (eligibility.isEligible) score += 100;
      if (isAvailable) score += 50;
      if (isSameCity) score += 40;
      if (isExactMatch) score += 30;
      if (request.priority === REQUEST_PRIORITIES.CRITICAL && isAvailable) score += 20;

      const existingInv = invitationMap.get(donor._id.toString());
      let invitationStatus = null;
      let invitationId = null;

      if (existingInv) {
        // Auto-check expiry
        if (existingInv.hasExpired()) {
          existingInv.status = INVITATION_STATUS.EXPIRED;
          await existingInv.save();
        }
        invitationStatus = existingInv.status;
        invitationId = existingInv._id;
      }

      candidates.push({
        donor: {
          _id: donor._id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          bloodGroup: donor.bloodGroup,
          city: donor.city,
          state: donor.donorDetails?.state || '',
          isAvailable,
          totalDonations: donor.donorDetails?.totalDonations || 0,
          lastDonationDate: donor.donorDetails?.lastDonationDate
        },
        matchDetails: {
          score,
          isExactMatch,
          isSameCity,
          compatibleType: donor.bloodGroup,
          eligibility,
          invitationStatus,
          invitationId
        }
      });
    }

    // Sort descending by score, prioritizing available & eligible donors
    candidates.sort((a, b) => b.matchDetails.score - a.matchDetails.score);

    return {
      request: {
        _id: request._id,
        requestId: request.requestId,
        patientName: request.patientName,
        bloodGroup: request.bloodGroup,
        unitsRequired: request.unitsRequired,
        unitsFulfilled: request.unitsFulfilled,
        hospital: request.hospital,
        city: request.city,
        priority: request.priority,
        status: request.status,
        requiredDate: request.requiredDate
      },
      compatibility: {
        requestedBloodGroup: request.bloodGroup,
        compatibleDonorGroups,
        tag: compatibility?.tag || 'Standard Match'
      },
      summary: {
        totalCompatibleDonors: candidates.length,
        availableCount: candidates.filter((c) => c.donor.isAvailable).length,
        eligibleCount: candidates.filter((c) => c.matchDetails.eligibility.isEligible).length,
        alreadyInvitedCount: candidates.filter((c) => c.matchDetails.invitationStatus).length
      },
      candidates,
      clinicalNotice:
        'IMPORTANT: Compatibility matching represents preliminary biological compatibility based on ABO/Rh grouping and clinical rest intervals. Qualified hospital staff must perform official typing and cross-matching before transfusion.'
    };
  }

  /**
   * Hospital dispatches donation invitations to matched donors
   */
  async sendInvitations(requestIdOrId, donorIds = [], sendingUser) {
    if (!Array.isArray(donorIds) || donorIds.length === 0) {
      throw new ApiError(400, 'At least one donor ID is required to send invitations.');
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(requestIdOrId);
    const query = isObjectId ? { _id: requestIdOrId } : { requestId: requestIdOrId };

    const request = await BloodRequest.findOne(query).populate('patient', 'name email phone');
    if (!request) {
      throw new ApiError(404, 'Blood request not found.');
    }

    // Must be approved before sending invitations
    if (request.status === REQUEST_STATUS.PENDING) {
      throw new ApiError(
        400,
        'Blood request must be approved by hospital before sending donation invitations.'
      );
    }

    if (request.status === REQUEST_STATUS.REJECTED || request.status === REQUEST_STATUS.CANCELLED || request.status === REQUEST_STATUS.FULFILLED) {
      throw new ApiError(
        400,
        `Cannot send invitations for a request in '${request.status}' status.`
      );
    }

    // Calculate expiration based on emergency priority
    const now = new Date();
    let expiryHours = 48; // NORMAL
    if (request.priority === REQUEST_PRIORITIES.CRITICAL) {
      expiryHours = 12;
    } else if (request.priority === REQUEST_PRIORITIES.HIGH) {
      expiryHours = 24;
    }
    const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);

    // Retrieve active donors
    const donors = await User.find({
      _id: { $in: donorIds },
      role: ROLES.DONOR,
      isActive: true
    });

    if (donors.length === 0) {
      throw new ApiError(400, 'No valid, active donors found for the provided IDs.');
    }

    // Prevent duplicate invitations: check existing invitations for this request
    const existing = await DonorInvitation.find({
      request: request._id,
      donor: { $in: donorIds }
    });
    const existingDonorIds = new Set(existing.map((e) => e.donor.toString()));

    const createdInvitations = [];
    const skippedDonorIds = [];

    for (const donor of donors) {
      const donorIdStr = donor._id.toString();

      if (existingDonorIds.has(donorIdStr)) {
        skippedDonorIds.push(donorIdStr);
        continue;
      }

      const isSameCity = donor.city && request.city
        ? donor.city.toLowerCase().trim() === request.city.toLowerCase().trim()
        : false;

      const invitation = await DonorInvitation.create({
        request: request._id,
        donor: donor._id,
        hospital: sendingUser?._id || request.hospitalId,
        status: INVITATION_STATUS.INVITED,
        priority: request.priority,
        expiresAt,
        compatibilityDetails: {
          compatibleBloodGroup: donor.bloodGroup,
          isExactMatch: donor.bloodGroup === request.bloodGroup,
          isSameCity
        }
      });

      createdInvitations.push(invitation);

      // Create notification for donor
      await notificationService.createNotification({
        recipient: donor._id,
        type: request.priority === REQUEST_PRIORITIES.CRITICAL
          ? NOTIFICATION_TYPES.EMERGENCY_REQUEST
          : NOTIFICATION_TYPES.DONOR_INVITATION,
        title: `Donation Invitation: ${request.bloodGroup} Needed`,
        message: `Emergency request for ${request.bloodGroup} at ${request.hospital} (${request.city}). Priority: ${request.priority}. Please accept or decline.`,
        priority: request.priority,
        data: {
          invitationId: invitation._id,
          requestId: request.requestId,
          bloodRequestDbId: request._id,
          hospital: request.hospital,
          city: request.city,
          bloodGroup: request.bloodGroup,
          priority: request.priority,
          expiresAt
        }
      });

      // Send Email notification (graceful failure)
      emailService.sendEmergencyDonorInvitation(donor, request, invitation).catch(() => {});
    }

    // If request status was APPROVED, transition to MATCHED
    if (request.status === REQUEST_STATUS.APPROVED && createdInvitations.length > 0) {
      request.status = REQUEST_STATUS.MATCHED;
      request.statusHistory.push({
        status: REQUEST_STATUS.MATCHED,
        changedBy: sendingUser?._id,
        changedAt: new Date(),
        note: `Dispatched ${createdInvitations.length} donor invitation(s).`
      });
      await request.save();
    }

    return {
      success: true,
      requestId: request.requestId,
      sentCount: createdInvitations.length,
      skippedCount: skippedDonorIds.length,
      invitations: createdInvitations,
      expiresAt
    };
  }

  /**
   * Retrieves all invitations sent to an authenticated donor
   */
  async getDonorInvitations(donorId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = { donor: donorId };

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    // Auto-check and mark expired invitations for this donor
    const pendingInvitations = await DonorInvitation.find({
      donor: donorId,
      status: INVITATION_STATUS.INVITED
    });

    for (const inv of pendingInvitations) {
      if (inv.hasExpired()) {
        inv.status = INVITATION_STATUS.EXPIRED;
        await inv.save();
      }
    }

    const [invitations, total] = await Promise.all([
      DonorInvitation.find(filter)
        .populate({
          path: 'request',
          select: 'requestId patientName bloodGroup unitsRequired unitsFulfilled hospital city priority status requiredDate medicalNotes'
        })
        .populate('hospital', 'name email hospitalDetails')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DonorInvitation.countDocuments(filter)
    ]);

    return {
      invitations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Donor responds to a donation invitation (ACCEPT or REJECT)
   */
  async respondToInvitation(invitationId, donorId, action, notes = '') {
    const normalizedAction = action?.toUpperCase();
    if (normalizedAction !== 'ACCEPT' && normalizedAction !== 'REJECT') {
      throw new ApiError(400, "Action must be either 'ACCEPT' or 'REJECT'.");
    }

    const invitation = await DonorInvitation.findOne({
      _id: invitationId,
      donor: donorId
    }).populate('request');

    if (!invitation) {
      throw new ApiError(404, 'Donation invitation not found or unauthorized.');
    }

    // Check expiration
    if (invitation.hasExpired() || invitation.status === INVITATION_STATUS.EXPIRED) {
      invitation.status = INVITATION_STATUS.EXPIRED;
      await invitation.save();
      throw new ApiError(400, 'This donation invitation has expired.');
    }

    // Prevent duplicate response
    if (invitation.status !== INVITATION_STATUS.INVITED) {
      throw new ApiError(
        400,
        `Invitation has already been responded to. Current status: ${invitation.status}`
      );
    }

    const donor = await User.findById(donorId).select('-password');
    const bloodRequest = invitation.request;

    if (normalizedAction === 'ACCEPT') {
      invitation.status = INVITATION_STATUS.ACCEPTED;
      invitation.respondedAt = new Date();
      invitation.responseNotes = notes || 'Accepted by donor';
      await invitation.save();

      // Add donor to bloodRequest.matchedDonors if not present
      const alreadyInList = bloodRequest.matchedDonors?.some(
        (m) => m.donor?.toString() === donorId.toString()
      );
      if (!alreadyInList) {
        bloodRequest.matchedDonors.push({
          donor: donorId,
          matchedAt: new Date(),
          status: 'CONFIRMED'
        });
        await bloodRequest.save();
      }

      // Notify Hospital Staff
      if (bloodRequest.hospitalId) {
        await notificationService.createNotification({
          recipient: bloodRequest.hospitalId,
          type: NOTIFICATION_TYPES.DONATION_ACCEPTED,
          title: `Donor Accepted: ${donor.name} (${donor.bloodGroup})`,
          message: `Donor ${donor.name} has accepted invitation for request ${bloodRequest.requestId}. Please proceed with cross-matching.`,
          priority: bloodRequest.priority,
          data: {
            invitationId: invitation._id,
            requestId: bloodRequest.requestId,
            donorId: donor._id,
            donorName: donor.name,
            donorPhone: donor.phone,
            donorBloodGroup: donor.bloodGroup
          }
        });
      }

      // Also emit to all HOSPITAL roles
      emitToRole(ROLES.HOSPITAL, 'invitation:accepted', {
        requestId: bloodRequest.requestId,
        donorName: donor.name,
        bloodGroup: donor.bloodGroup
      });

      // Notify Patient
      if (bloodRequest.patient) {
        await notificationService.createNotification({
          recipient: bloodRequest.patient,
          type: NOTIFICATION_TYPES.DONATION_ACCEPTED,
          title: `Compatible Donor Found for ${bloodRequest.bloodGroup}`,
          message: `A verified donor (${donor.bloodGroup}) has accepted the invitation for request ${bloodRequest.requestId}. Hospital staff will contact for crossmatch.`,
          priority: bloodRequest.priority,
          data: { requestId: bloodRequest.requestId }
        });
      }

      // Send email notifications
      emailService.sendDonorAcceptanceNotification(
        { name: bloodRequest.hospital, email: donor.email },
        donor,
        bloodRequest
      ).catch(() => {});
    } else {
      // REJECT
      invitation.status = INVITATION_STATUS.REJECTED;
      invitation.respondedAt = new Date();
      invitation.responseNotes = notes || 'Declined by donor';
      await invitation.save();

      // Notify Hospital
      if (bloodRequest.hospitalId) {
        await notificationService.createNotification({
          recipient: bloodRequest.hospitalId,
          type: NOTIFICATION_TYPES.DONATION_REJECTED,
          title: `Donor Declined Invitation (${bloodRequest.requestId})`,
          message: `Donor ${donor.name} was unable to accept donation request ${bloodRequest.requestId}.`,
          priority: REQUEST_PRIORITIES.NORMAL,
          data: {
            invitationId: invitation._id,
            requestId: bloodRequest.requestId,
            donorId: donor._id
          }
        });
      }

      emitToRole(ROLES.HOSPITAL, 'invitation:rejected', {
        requestId: bloodRequest.requestId,
        donorName: donor.name
      });
    }

    return invitation;
  }

  /**
   * Retrieves an invitation by ID with RBAC authorization
   */
  async getInvitationById(invitationId, user) {
    const invitation = await DonorInvitation.findById(invitationId)
      .populate('request')
      .populate('donor', 'name email phone bloodGroup city donorDetails')
      .populate('hospital', 'name email hospitalDetails');

    if (!invitation) {
      throw new ApiError(404, 'Donation invitation not found.');
    }

    // RBAC: Donor can see their own; Hospital & Admin can see any; Patient of request can see
    const isDonor = user.role === ROLES.DONOR && invitation.donor._id.equals(user._id);
    const isStaff = user.role === ROLES.HOSPITAL || user.role === ROLES.ADMIN;
    const isPatientOfRequest =
      user.role === ROLES.PATIENT &&
      invitation.request?.patient &&
      invitation.request.patient.toString() === user._id.toString();

    if (!isDonor && !isStaff && !isPatientOfRequest) {
      throw new ApiError(403, 'Forbidden: You do not have permission to view this invitation.');
    }

    return invitation;
  }
}

export const matchingService = new MatchingService();

