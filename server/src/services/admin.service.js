import { User } from '../models/user.model.js';
import { BloodRequest } from '../models/bloodRequest.model.js';
import { BloodInventory } from '../models/bloodInventory.model.js';
import { BloodStock } from '../models/bloodStock.model.js';
import { BloodTransaction } from '../models/bloodTransaction.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import { ApiError } from '../utils/apiError.js';
import {
  ROLES,
  ROLE_LIST,
  REQUEST_STATUS,
  REQUEST_PRIORITIES,
  AUDIT_ACTIONS,
  VALID_STATUS_TRANSITIONS
} from '../utils/constants.js';
import { notificationService } from './notification.service.js';

export class AdminService {
  /**
   * 100% Real MongoDB calculated dashboard KPIs
   */
  static async getDashboardKPIs() {
    const [
      totalUsers,
      totalDonors,
      totalPatients,
      totalHospitals,
      totalVolunteers,
      verifiedHospitals,
      pendingHospitals,
      totalBloodRequests,
      pendingBloodRequests,
      fulfilledBloodRequests,
      activeDonors,
      criticalBloodRequests,
      inventorySummary
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: ROLES.DONOR }),
      User.countDocuments({ role: ROLES.PATIENT }),
      User.countDocuments({ role: ROLES.HOSPITAL }),
      User.countDocuments({ role: ROLES.VOLUNTEER }),
      User.countDocuments({
        role: ROLES.HOSPITAL,
        'hospitalDetails.verificationStatus': 'VERIFIED'
      }),
      User.countDocuments({
        role: ROLES.HOSPITAL,
        'hospitalDetails.verificationStatus': 'PENDING'
      }),
      BloodRequest.countDocuments({}),
      BloodRequest.countDocuments({ status: REQUEST_STATUS.PENDING }),
      BloodRequest.countDocuments({ status: REQUEST_STATUS.FULFILLED }),
      User.countDocuments({
        role: ROLES.DONOR,
        isActive: true,
        'donorDetails.isAvailable': true
      }),
      BloodRequest.countDocuments({
        priority: REQUEST_PRIORITIES.CRITICAL,
        status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED] }
      }),
      BloodInventory.aggregate([
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$unitsAvailable' },
            lowStockCount: {
              $sum: {
                $cond: [{ $lte: ['$unitsAvailable', '$lowStockThreshold'] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const totalAvailableUnits = inventorySummary[0]?.totalUnits || 0;
    const lowStockAlerts = inventorySummary[0]?.lowStockCount || 0;

    return {
      totalUsers,
      totalDonors,
      totalPatients,
      totalHospitals,
      totalVolunteers,
      verifiedHospitals,
      pendingHospitals,
      totalBloodRequests,
      pendingBloodRequests,
      fulfilledBloodRequests,
      activeDonors,
      criticalBloodRequests,
      totalAvailableUnits,
      lowStockAlerts
    };
  }

  /**
   * User directory listing with search, filtering, and pagination
   */
  static async getUsers({
    page = 1,
    limit = 20,
    role,
    isActive,
    bloodGroup,
    city,
    search
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (role && ROLE_LIST.includes(role)) {
      filter.role = role;
    }

    if (typeof isActive !== 'undefined' && isActive !== '') {
      filter.isActive = isActive === 'true' || isActive === true;
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (city) {
      filter.city = new RegExp(city.trim(), 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'hospitalDetails.facilityName': searchRegex }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get single user details by ID
   */
  static async getUserById(userId) {
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    // Supplementary context based on role
    let supplementary = {};
    if (user.role === ROLES.PATIENT) {
      const requests = await BloodRequest.find({ patient: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      supplementary.recentRequests = requests;
    } else if (user.role === ROLES.HOSPITAL) {
      const inventories = await BloodInventory.find({ hospital: userId }).lean();
      supplementary.inventory = inventories;
    }

    return {
      ...user,
      supplementary
    };
  }

  /**
   * Update user status (activate / deactivate)
   * Enforces safety guard: Last active Super Admin cannot be deactivated
   */
  static async updateUserStatus(userId, { isActive, reason = '' }, adminUser, req) {
    if (typeof isActive !== 'boolean') {
      throw new ApiError(400, 'isActive flag must be a boolean.');
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found.');
    }

    // Safety guard: Last active admin protection
    if (targetUser.role === ROLES.ADMIN && !isActive) {
      const activeAdminCount = await User.countDocuments({
        role: ROLES.ADMIN,
        isActive: true
      });

      if (activeAdminCount <= 1) {
        throw new ApiError(
          400,
          'Operation prohibited: Cannot deactivate the platform’s last active Super Admin.'
        );
      }
    }

    const previousStatus = targetUser.isActive;
    targetUser.isActive = isActive;
    await targetUser.save();

    await AuditLog.record({
      actor: adminUser,
      action: AUDIT_ACTIONS.USER_STATUS_CHANGE,
      targetResource: 'User',
      targetId: targetUser._id,
      targetIdentifier: targetUser.email,
      details: {
        userName: targetUser.name,
        previousStatus,
        newStatus: isActive,
        reason
      },
      req
    });

    return targetUser.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
  }

  /**
   * Update user role
   * Enforces safety guard: Last active Super Admin cannot be demoted
   */
  static async updateUserRole(userId, { role, reason = '' }, adminUser, req) {
    if (!ROLE_LIST.includes(role)) {
      throw new ApiError(400, `Invalid role: ${role}. Allowed roles: ${ROLE_LIST.join(', ')}`);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found.');
    }

    if (targetUser.role === role) {
      return targetUser.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
    }

    // Guard: Prevent demoting the last active Super Admin
    if (targetUser.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const activeAdminCount = await User.countDocuments({
        role: ROLES.ADMIN,
        isActive: true
      });

      if (activeAdminCount <= 1) {
        throw new ApiError(
          400,
          'Operation prohibited: Cannot demote the platform’s last active Super Admin.'
        );
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await AuditLog.record({
      actor: adminUser,
      action: AUDIT_ACTIONS.USER_ROLE_CHANGE,
      targetResource: 'User',
      targetId: targetUser._id,
      targetIdentifier: targetUser.email,
      details: {
        userName: targetUser.name,
        previousRole,
        newRole: role,
        reason
      },
      req
    });

    return targetUser.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
  }

  /**
   * Hospital verification queue: list pending hospital applications
   */
  static async getPendingHospitals({ page = 1, limit = 20, search }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      role: ROLES.HOSPITAL,
      'hospitalDetails.verificationStatus': 'PENDING'
    };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { 'hospitalDetails.facilityName': searchRegex },
        { 'hospitalDetails.licenseNumber': searchRegex }
      ];
    }

    const [hospitals, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: 1 }) // oldest pending first
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    return {
      hospitals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * List all hospitals with full filtering
   */
  static async getAllHospitals({
    page = 1,
    limit = 20,
    verificationStatus,
    hospitalType,
    city,
    search
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = { role: ROLES.HOSPITAL };

    if (verificationStatus) {
      filter['hospitalDetails.verificationStatus'] = verificationStatus;
    }

    if (hospitalType) {
      filter['hospitalDetails.hospitalType'] = hospitalType;
    }

    if (city) {
      filter.city = new RegExp(city.trim(), 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { 'hospitalDetails.facilityName': searchRegex },
        { 'hospitalDetails.licenseNumber': searchRegex },
        { 'hospitalDetails.registrationNumber': searchRegex }
      ];
    }

    const [hospitals, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    return {
      hospitals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Approve/Verify hospital registration
   */
  static async verifyHospital(hospitalId, { verificationNotes = '' } = {}, adminUser, req) {
    const hospital = await User.findOne({ _id: hospitalId, role: ROLES.HOSPITAL });
    if (!hospital) {
      throw new ApiError(404, 'Hospital account not found.');
    }

    hospital.hospitalDetails = hospital.hospitalDetails || {};
    hospital.hospitalDetails.verificationStatus = 'VERIFIED';
    hospital.hospitalDetails.isVerified = true;
    hospital.hospitalDetails.verifiedAt = new Date();
    hospital.hospitalDetails.verifiedBy = adminUser._id;
    hospital.hospitalDetails.verificationNotes = verificationNotes || 'Verified by Super Admin';
    await hospital.save();

    await AuditLog.record({
      actor: adminUser,
      action: AUDIT_ACTIONS.HOSPITAL_VERIFIED,
      targetResource: 'Hospital',
      targetId: hospital._id,
      targetIdentifier: hospital.hospitalDetails?.facilityName || hospital.name,
      details: {
        facilityName: hospital.hospitalDetails?.facilityName,
        licenseNumber: hospital.hospitalDetails?.licenseNumber,
        notes: verificationNotes
      },
      req
    });

    // Notify hospital user
    try {
      await notificationService.createNotification({
        recipient: hospital._id,
        type: 'REQUEST_STATUS_UPDATED',
        title: 'Hospital Credentials Verified',
        message: 'Your healthcare facility credentials have been approved by LifeLink Super Administration. Full inventory and triage capabilities are now active.',
        data: { hospitalId: hospital._id }
      });
    } catch (e) {
      // Non-fatal
    }

    return hospital.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
  }

  /**
   * Reject hospital registration
   */
  static async rejectHospital(hospitalId, { verificationNotes = '' } = {}, adminUser, req) {
    const hospital = await User.findOne({ _id: hospitalId, role: ROLES.HOSPITAL });
    if (!hospital) {
      throw new ApiError(404, 'Hospital account not found.');
    }

    hospital.hospitalDetails = hospital.hospitalDetails || {};
    hospital.hospitalDetails.verificationStatus = 'REJECTED';
    hospital.hospitalDetails.isVerified = false;
    hospital.hospitalDetails.verifiedAt = new Date();
    hospital.hospitalDetails.verifiedBy = adminUser._id;
    hospital.hospitalDetails.verificationNotes = verificationNotes || 'Application rejected by Super Admin';
    await hospital.save();

    await AuditLog.record({
      actor: adminUser,
      action: AUDIT_ACTIONS.HOSPITAL_REJECTED,
      targetResource: 'Hospital',
      targetId: hospital._id,
      targetIdentifier: hospital.hospitalDetails?.facilityName || hospital.name,
      details: {
        facilityName: hospital.hospitalDetails?.facilityName,
        notes: verificationNotes
      },
      req
    });

    try {
      await notificationService.createNotification({
        recipient: hospital._id,
        type: 'REQUEST_STATUS_UPDATED',
        title: 'Hospital Verification Status Updated',
        message: `Your hospital verification was not approved. Notes: ${verificationNotes || 'Incomplete documentation.'}`,
        data: { hospitalId: hospital._id }
      });
    } catch (e) {
      // Non-fatal
    }

    return hospital.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
  }

  /**
   * System-wide blood request oversight
   */
  static async getBloodRequests({
    page = 1,
    limit = 20,
    status,
    priority,
    bloodGroup,
    hospitalId,
    search,
    startDate,
    endDate
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    if (hospitalId) {
      filter.$or = [{ hospitalId }, { hospital: hospitalId }];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { requestId: searchRegex },
        { patientName: searchRegex },
        { hospital: searchRegex },
        { contactPhone: searchRegex }
      ];
    }

    const [requests, total] = await Promise.all([
      BloodRequest.find(filter)
        .populate('patient', 'name email phone')
        .populate('hospitalId', 'name email hospitalDetails.facilityName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BloodRequest.countDocuments(filter)
    ]);

    return {
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Admin status override for blood request (with audit logging and status validation)
   */
  static async overrideRequestStatus(requestId, { status, reason = '' }, adminUser, req) {
    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      throw new ApiError(404, 'Blood request not found.');
    }

    const previousStatus = bloodRequest.status;
    const allowedTransitions = VALID_STATUS_TRANSITIONS[previousStatus] || [];

    // Allow transition if in allowed list or if an explicit administrative override reason is provided
    if (!allowedTransitions.includes(status) && !reason) {
      throw new ApiError(
        400,
        `Invalid status transition from ${previousStatus} to ${status}. Admin override requires an explicit reason.`
      );
    }

    bloodRequest.status = status;
    if (status === REQUEST_STATUS.CANCELLED) {
      bloodRequest.cancellationReason = `Super Admin Override: ${reason}`;
    }
    await bloodRequest.save();

    await AuditLog.record({
      actor: adminUser,
      action: AUDIT_ACTIONS.REQUEST_STATUS_OVERRIDE,
      targetResource: 'BloodRequest',
      targetId: bloodRequest._id,
      targetIdentifier: bloodRequest.requestId,
      details: {
        previousStatus,
        newStatus: status,
        reason
      },
      req
    });

    return bloodRequest;
  }

  /**
   * System-wide blood inventory oversight
   */
  static async getInventoryOverview({ bloodGroup, hospitalId, lowStockOnly = false }) {
    const matchFilter = {};

    if (bloodGroup) {
      matchFilter.bloodGroup = bloodGroup;
    }

    if (hospitalId) {
      matchFilter.hospital = hospitalId;
    }

    let inventories = await BloodInventory.find(matchFilter)
      .populate('hospital', 'name email city hospitalDetails.facilityName')
      .sort({ unitsAvailable: 1 })
      .lean();

    if (lowStockOnly === true || lowStockOnly === 'true') {
      inventories = inventories.filter(
        (inv) => inv.unitsAvailable <= inv.lowStockThreshold
      );
    }

    // Aggregated statistics across all inventory rows
    const summary = inventories.reduce(
      (acc, curr) => {
        acc.totalUnitsAvailable += curr.unitsAvailable || 0;
        acc.totalUnitsReserved += curr.unitsReserved || 0;
        if (curr.unitsAvailable <= curr.lowStockThreshold) {
          acc.lowStockCount += 1;
        }
        acc.byBloodGroup[curr.bloodGroup] =
          (acc.byBloodGroup[curr.bloodGroup] || 0) + (curr.unitsAvailable || 0);
        return acc;
      },
      {
        totalUnitsAvailable: 0,
        totalUnitsReserved: 0,
        lowStockCount: 0,
        byBloodGroup: {}
      }
    );

    // Recent 10 stock transactions
    const recentTransactions = await BloodTransaction.find({})
      .populate('hospital', 'name hospitalDetails.facilityName')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Expiring batches in next 14 days
    const next14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const expiringBatches = await BloodStock.find({
      status: 'AVAILABLE',
      expiryDate: { $lte: next14Days }
    })
      .populate('hospital', 'name hospitalDetails.facilityName')
      .sort({ expiryDate: 1 })
      .limit(15)
      .lean();

    return {
      summary,
      inventories,
      expiringBatches,
      recentTransactions
    };
  }

  /**
   * Broadcast platform-wide emergency alert or announcement
   */
  static async broadcastAnnouncement(
    { title, message, targetRoles = [], isEmergency = false },
    adminUser,
    req
  ) {
    if (!title || !message) {
      throw new ApiError(400, 'Announcement title and message are required.');
    }

    const filter = { isActive: true };
    if (Array.isArray(targetRoles) && targetRoles.length > 0) {
      filter.role = { $in: targetRoles };
    }

    const recipients = await User.find(filter).select('_id').lean();

    // Batch insert notifications
    const priority = isEmergency
      ? REQUEST_PRIORITIES.CRITICAL
      : REQUEST_PRIORITIES.NORMAL;

    const notificationDocs = recipients.map((u) => ({
      recipient: u._id,
      type: isEmergency ? 'EMERGENCY_REQUEST' : 'REQUEST_STATUS_UPDATED',
      title,
      message,
      priority,
      isRead: false,
      data: { broadcastBy: adminUser.name, isBroadcast: true }
    }));

    if (notificationDocs.length > 0) {
      await notificationService.createNotification({
        recipient: recipients[0]._id,
        type: isEmergency ? 'EMERGENCY_REQUEST' : 'REQUEST_STATUS_UPDATED',
        title,
        message,
        priority,
        data: { broadcastBy: adminUser.name, isBroadcast: true }
      });
      // For testing and small environments, also insert remainder
      if (notificationDocs.length > 1) {
        // Bulk write remainder without spamming sockets
        const remainingDocs = notificationDocs.slice(1);
        const { Notification } = await import('../models/notification.model.js');
        await Notification.insertMany(remainingDocs, { ordered: false });
      }
    }

    await AuditLog.record({
      actor: adminUser,
      action: AUDIT_ACTIONS.SYSTEM_ANNOUNCEMENT,
      targetResource: 'System',
      targetIdentifier: title,
      details: {
        title,
        message,
        recipientCount: recipients.length,
        targetRoles,
        isEmergency
      },
      req
    });

    return {
      success: true,
      recipientsNotified: recipients.length,
      isEmergency
    };
  }
}

export default AdminService;
