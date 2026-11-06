import { User } from '../models/user.model.js';
import { BloodRequest } from '../models/bloodRequest.model.js';
import { BloodInventory } from '../models/bloodInventory.model.js';
import { BloodStock } from '../models/bloodStock.model.js';
import { BloodTransaction } from '../models/bloodTransaction.model.js';
import { HospitalStaff } from '../models/hospitalStaff.model.js';
import { ApiError } from '../utils/apiError.js';
import {
  ROLES,
  BLOOD_GROUPS,
  STOCK_TRANSACTION_TYPES,
  STOCK_BATCH_STATUS,
  HOSPITAL_VERIFICATION_STATUS,
  NOTIFICATION_TYPES
} from '../utils/constants.js';
import { notificationService } from './notification.service.js';

class HospitalService {
  /**
   * Helper to ensure all 8 blood groups have an inventory document initialized for this hospital
   */
  async ensureInventoryInitialized(hospitalId) {
    const existing = await BloodInventory.find({ hospital: hospitalId });
    const existingGroups = new Set(existing.map((i) => i.bloodGroup));

    const missing = BLOOD_GROUPS.filter((bg) => !existingGroups.has(bg));
    if (missing.length > 0) {
      const docs = missing.map((bg) => ({
        hospital: hospitalId,
        bloodGroup: bg,
        unitsAvailable: 0,
        unitsReserved: 0,
        lowStockThreshold: 5
      }));
      await BloodInventory.insertMany(docs);
    }
  }

  /**
   * Retrieve hospital profile details
   */
  async getHospitalProfile(hospitalId) {
    const hospital = await User.findById(hospitalId).select('-password');
    if (!hospital || hospital.role !== ROLES.HOSPITAL) {
      throw new ApiError(404, 'Hospital profile not found.');
    }
    return hospital;
  }

  /**
   * Update hospital profile details
   */
  async updateHospitalProfile(hospitalId, updateData = {}) {
    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== ROLES.HOSPITAL) {
      throw new ApiError(404, 'Hospital profile not found.');
    }

    const {
      name,
      phone,
      city,
      facilityName,
      department,
      hospitalType,
      registrationNumber,
      address,
      state,
      postalCode,
      emergencyHotline,
      totalBeds,
      bloodBankLicense
    } = updateData;

    if (name) hospital.name = name.trim();
    if (phone) hospital.phone = phone.trim();
    if (city) hospital.city = city.trim();

    hospital.hospitalDetails = {
      ...hospital.hospitalDetails.toObject(),
      facilityName: facilityName !== undefined ? facilityName.trim() : hospital.hospitalDetails.facilityName,
      department: department !== undefined ? department.trim() : hospital.hospitalDetails.department,
      hospitalType: hospitalType || hospital.hospitalDetails.hospitalType,
      registrationNumber: registrationNumber !== undefined ? registrationNumber.trim() : hospital.hospitalDetails.registrationNumber,
      address: address !== undefined ? address.trim() : hospital.hospitalDetails.address,
      state: state !== undefined ? state.trim() : hospital.hospitalDetails.state,
      postalCode: postalCode !== undefined ? postalCode.trim() : hospital.hospitalDetails.postalCode,
      emergencyHotline: emergencyHotline !== undefined ? emergencyHotline.trim() : hospital.hospitalDetails.emergencyHotline,
      totalBeds: totalBeds !== undefined ? Number(totalBeds) : hospital.hospitalDetails.totalBeds,
      bloodBankLicense: bloodBankLicense !== undefined ? bloodBankLicense.trim() : hospital.hospitalDetails.bloodBankLicense
    };

    await hospital.save();
    return hospital.toJSON();
  }

  /**
   * Admin verification workflow: verify or reject hospital
   */
  async verifyHospital(hospitalId, adminUser, { verificationStatus, verificationNotes = '' }) {
    if (![HOSPITAL_VERIFICATION_STATUS.VERIFIED, HOSPITAL_VERIFICATION_STATUS.REJECTED].includes(verificationStatus)) {
      throw new ApiError(400, 'Invalid verification status. Must be VERIFIED or REJECTED.');
    }

    const hospital = await User.findById(hospitalId);
    if (!hospital || hospital.role !== ROLES.HOSPITAL) {
      throw new ApiError(404, 'Hospital not found.');
    }

    const isVerified = verificationStatus === HOSPITAL_VERIFICATION_STATUS.VERIFIED;
    hospital.hospitalDetails.verificationStatus = verificationStatus;
    hospital.hospitalDetails.isVerified = isVerified;
    hospital.hospitalDetails.verifiedAt = new Date();
    hospital.hospitalDetails.verifiedBy = adminUser._id;
    hospital.hospitalDetails.verificationNotes = verificationNotes.trim();

    await hospital.save();

    // Send real-time notification to the hospital
    await notificationService.createNotification({
      recipient: hospital._id,
      type: NOTIFICATION_TYPES.REQUEST_STATUS_UPDATED,
      title: isVerified ? 'Hospital Clinical Verification Approved' : 'Hospital Verification Rejected',
      message: isVerified
        ? 'Your hospital blood bank account has been verified by the LifeLink Medical Board.'
        : `Verification deferred: ${verificationNotes || 'Please contact clinical administration.'}`,
      data: { verificationStatus }
    });

    return hospital.toJSON();
  }

  /**
   * List hospitals with filters and verification status (Public / Admin directory)
   */
  async listHospitals(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = { role: ROLES.HOSPITAL, isActive: true };

    if (query.city) {
      filter.city = { $regex: new RegExp(query.city.trim(), 'i') };
    }

    if (query.verificationStatus) {
      filter['hospitalDetails.verificationStatus'] = query.verificationStatus.toUpperCase();
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { 'hospitalDetails.facilityName': searchRegex },
        { city: searchRegex }
      ];
    }

    const [hospitals, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ 'hospitalDetails.isVerified': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    return {
      hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Hospital Dashboard: 100% Real MongoDB Statistics
   */
  async getHospitalDashboardStats(hospitalId) {
    const hospital = await User.findById(hospitalId);
    if (!hospital) {
      throw new ApiError(404, 'Hospital not found.');
    }

    await this.ensureInventoryInitialized(hospitalId);

    // Auto-update expired batches first
    const now = new Date();
    await BloodStock.updateMany(
      { hospital: hospitalId, status: STOCK_BATCH_STATUS.AVAILABLE, expiryDate: { $lt: now } },
      { $set: { status: STOCK_BATCH_STATUS.EXPIRED } }
    );

    // 1. Incoming Blood Requests Stats
    // Query requests either explicitly tagged with hospitalId or matching hospital name or city
    const requestFilter = {
      $or: [
        { hospitalId: hospital._id },
        { hospital: hospital.name },
        { hospital: hospital.hospitalDetails?.facilityName }
      ]
    };

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      fulfilledRequests,
      criticalRequests
    ] = await Promise.all([
      BloodRequest.countDocuments(requestFilter),
      BloodRequest.countDocuments({ ...requestFilter, status: 'PENDING' }),
      BloodRequest.countDocuments({ ...requestFilter, status: 'APPROVED' }),
      BloodRequest.countDocuments({ ...requestFilter, status: 'FULFILLED' }),
      BloodRequest.countDocuments({ ...requestFilter, priority: 'CRITICAL', status: { $in: ['PENDING', 'APPROVED', 'MATCHED'] } })
    ]);

    // 2. Inventory Breakdown & Aggregates
    const inventoryDocs = await BloodInventory.find({ hospital: hospitalId });
    const totalUnitsAvailable = inventoryDocs.reduce((acc, curr) => acc + curr.unitsAvailable, 0);
    const totalUnitsReserved = inventoryDocs.reduce((acc, curr) => acc + curr.unitsReserved, 0);

    const lowStockAlerts = [];
    const inventoryByGroup = {};

    for (const item of inventoryDocs) {
      const isLow = item.unitsAvailable <= item.lowStockThreshold;
      inventoryByGroup[item.bloodGroup] = {
        unitsAvailable: item.unitsAvailable,
        unitsReserved: item.unitsReserved,
        lowStockThreshold: item.lowStockThreshold,
        storageLocation: item.storageLocation,
        isLowStock: isLow
      };

      if (isLow) {
        lowStockAlerts.push({
          bloodGroup: item.bloodGroup,
          unitsAvailable: item.unitsAvailable,
          threshold: item.lowStockThreshold,
          message: `Stock critically low: ${item.unitsAvailable} unit(s) remaining (threshold: ${item.lowStockThreshold}).`
        });
      }
    }

    // 3. Expiry Tracking
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const [expiredBatchesCount, expiringSoonBatches] = await Promise.all([
      BloodStock.countDocuments({ hospital: hospitalId, status: STOCK_BATCH_STATUS.EXPIRED }),
      BloodStock.find({
        hospital: hospitalId,
        status: STOCK_BATCH_STATUS.AVAILABLE,
        expiryDate: { $gte: now, $lte: in7Days }
      }).sort({ expiryDate: 1 }).limit(10)
    ]);

    // 4. Staff count
    const activeStaffCount = await HospitalStaff.countDocuments({ hospital: hospitalId, isActive: true });

    // 5. Recent Activity & Transactions (Latest 10)
    const recentTransactions = await BloodTransaction.find({ hospital: hospitalId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    return {
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        facilityName: hospital.hospitalDetails?.facilityName || hospital.name,
        city: hospital.city,
        isVerified: hospital.hospitalDetails?.isVerified || false,
        verificationStatus: hospital.hospitalDetails?.verificationStatus || 'PENDING'
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        fulfilled: fulfilledRequests,
        critical: criticalRequests
      },
      inventory: {
        totalUnitsAvailable,
        totalUnitsReserved,
        byBloodGroup: inventoryByGroup,
        lowStockCount: lowStockAlerts.length,
        lowStockAlerts
      },
      expiryTracking: {
        expiredBatchesCount,
        expiringSoonCount: expiringSoonBatches.length,
        expiringSoonBatches
      },
      staff: {
        activeCount: activeStaffCount
      },
      recentActivity: recentTransactions
    };
  }

  /**
   * Get blood group-wise inventory records
   */
  async getInventory(hospitalId) {
    await this.ensureInventoryInitialized(hospitalId);
    const inventory = await BloodInventory.find({ hospital: hospitalId }).sort({ bloodGroup: 1 });

    return inventory.map((item) => ({
      _id: item._id,
      bloodGroup: item.bloodGroup,
      unitsAvailable: item.unitsAvailable,
      unitsReserved: item.unitsReserved,
      lowStockThreshold: item.lowStockThreshold,
      storageLocation: item.storageLocation,
      isLowStock: item.unitsAvailable <= item.lowStockThreshold,
      lastUpdated: item.lastUpdated
    }));
  }

  /**
   * Update low stock threshold for a blood group
   */
  async updateInventoryThreshold(hospitalId, { bloodGroup, threshold, storageLocation }) {
    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      throw new ApiError(400, 'Invalid blood group.');
    }

    const item = await BloodInventory.findOneAndUpdate(
      { hospital: hospitalId, bloodGroup },
      {
        $set: {
          lowStockThreshold: Math.max(1, parseInt(threshold, 10) || 5),
          storageLocation: storageLocation || 'Central Blood Bank Cold Storage',
          lastUpdated: new Date()
        }
      },
      { new: true, upsert: true }
    );

    return item;
  }

  /**
   * Record Stock-In: creates batch, updates aggregate inventory, logs transaction
   */
  async stockIn(hospitalId, user, stockData = {}) {
    const {
      bloodGroup,
      units,
      componentType,
      collectionDate,
      expiryDate,
      donorId,
      donorName,
      storageLocation,
      notes
    } = stockData;

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      throw new ApiError(400, 'Invalid blood group provided.');
    }

    const parsedUnits = parseInt(units, 10);
    if (!parsedUnits || parsedUnits <= 0) {
      throw new ApiError(400, 'Units to stock-in must be at least 1.');
    }

    const colDate = collectionDate ? new Date(collectionDate) : new Date();
    // Default shelf life: 42 days for whole blood
    const expDate = expiryDate
      ? new Date(expiryDate)
      : new Date(colDate.getTime() + 42 * 24 * 60 * 60 * 1000);

    if (expDate <= colDate) {
      throw new ApiError(400, 'Expiry date must be after collection date.');
    }

    // Auto-generate batch number
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const batchNumber = `BAT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${randomSuffix}`;

    // 1. Create BloodStock Batch
    const batch = await BloodStock.create({
      hospital: hospitalId,
      batchNumber,
      bloodGroup,
      units: parsedUnits,
      remainingUnits: parsedUnits,
      componentType: componentType || 'WHOLE_BLOOD',
      collectionDate: colDate,
      expiryDate: expDate,
      status: STOCK_BATCH_STATUS.AVAILABLE,
      donor: donorId || null,
      donorName: donorName || '',
      storageLocation: storageLocation || 'Refrigeration Unit A-1',
      notes: notes || ''
    });

    // 2. Increment Aggregate BloodInventory
    const inventory = await BloodInventory.findOneAndUpdate(
      { hospital: hospitalId, bloodGroup },
      {
        $inc: { unitsAvailable: parsedUnits },
        $set: { lastUpdated: new Date() }
      },
      { new: true, upsert: true }
    );

    // 3. Log Stock Transaction
    const transaction = await BloodTransaction.create({
      hospital: hospitalId,
      transactionType: STOCK_TRANSACTION_TYPES.STOCK_IN,
      bloodGroup,
      units: parsedUnits,
      batch: batch._id,
      batchNumber: batch.batchNumber,
      performedBy: user._id,
      reason: 'Donation collection intake / Procurement',
      notes: notes || ''
    });

    return {
      batch,
      inventory,
      transaction
    };
  }

  /**
   * Record Stock-Out / Transfusion: deducts from available batches (FIFO), decrements inventory, logs transaction
   */
  async stockOut(hospitalId, user, stockOutData = {}) {
    const {
      bloodGroup,
      units,
      transactionType = STOCK_TRANSACTION_TYPES.STOCK_OUT,
      reason = 'Clinical transfusion',
      patientName = '',
      bloodRequestId = null,
      notes = ''
    } = stockOutData;

    if (!BLOOD_GROUPS.includes(bloodGroup)) {
      throw new ApiError(400, 'Invalid blood group provided.');
    }

    const parsedUnits = parseInt(units, 10);
    if (!parsedUnits || parsedUnits <= 0) {
      throw new ApiError(400, 'Units to stock-out must be at least 1.');
    }

    // Check available inventory
    const inventory = await BloodInventory.findOne({ hospital: hospitalId, bloodGroup });
    const currentAvailable = inventory ? inventory.unitsAvailable : 0;

    if (currentAvailable < parsedUnits) {
      throw new ApiError(
        400,
        `Insufficient inventory for blood group ${bloodGroup}. Available: ${currentAvailable} unit(s), requested: ${parsedUnits} unit(s).`
      );
    }

    // Deduct from batches using FIFO (earliest expiry first)
    const availableBatches = await BloodStock.find({
      hospital: hospitalId,
      bloodGroup,
      status: STOCK_BATCH_STATUS.AVAILABLE,
      remainingUnits: { $gt: 0 },
      expiryDate: { $gt: new Date() }
    }).sort({ expiryDate: 1 });

    let unitsRemainingToDeduct = parsedUnits;
    const deductedBatches = [];

    for (const batch of availableBatches) {
      if (unitsRemainingToDeduct <= 0) break;

      const toDeduct = Math.min(batch.remainingUnits, unitsRemainingToDeduct);
      batch.remainingUnits -= toDeduct;
      unitsRemainingToDeduct -= toDeduct;

      if (batch.remainingUnits === 0) {
        batch.status =
          transactionType === STOCK_TRANSACTION_TYPES.TRANSFUSION
            ? STOCK_BATCH_STATUS.TRANSFUSED
            : STOCK_BATCH_STATUS.AVAILABLE;
      }

      await batch.save();
      deductedBatches.push({ batchId: batch._id, batchNumber: batch.batchNumber, deducted: toDeduct });
    }

    // Decrement aggregate inventory
    inventory.unitsAvailable -= parsedUnits;
    inventory.lastUpdated = new Date();
    await inventory.save();

    // Log transaction
    const transaction = await BloodTransaction.create({
      hospital: hospitalId,
      transactionType,
      bloodGroup,
      units: parsedUnits,
      batchNumber: deductedBatches.map((b) => b.batchNumber).join(', '),
      bloodRequest: bloodRequestId || null,
      patientName: patientName.trim(),
      performedBy: user._id,
      reason,
      notes
    });

    // Check for low stock alert
    if (inventory.unitsAvailable <= inventory.lowStockThreshold) {
      await notificationService.createNotification({
        recipient: hospitalId,
        type: NOTIFICATION_TYPES.REQUEST_STATUS_UPDATED,
        title: `⚠️ Low Stock Alert: ${bloodGroup}`,
        message: `Inventory for blood group ${bloodGroup} dropped to ${inventory.unitsAvailable} unit(s) (threshold: ${inventory.lowStockThreshold}).`,
        priority: 'HIGH',
        data: { bloodGroup, unitsAvailable: inventory.unitsAvailable }
      });
    }

    return {
      success: true,
      deductedUnits: parsedUnits,
      remainingUnitsAvailable: inventory.unitsAvailable,
      transaction,
      deductedBatches
    };
  }

  /**
   * Discard expired batches and adjust aggregate inventory
   */
  async discardExpired(hospitalId, user, { batchId = null, notes = '' } = {}) {
    const filter = {
      hospital: hospitalId,
      status: { $in: [STOCK_BATCH_STATUS.AVAILABLE, STOCK_BATCH_STATUS.EXPIRED] },
      expiryDate: { $lt: new Date() }
    };

    if (batchId) {
      filter._id = batchId;
    }

    const expiredBatches = await BloodStock.find(filter);
    if (expiredBatches.length === 0) {
      return { discardedCount: 0, totalUnitsDiscarded: 0, message: 'No expired units found to discard.' };
    }

    let totalUnitsDiscarded = 0;
    for (const batch of expiredBatches) {
      const unitsToDiscard = batch.remainingUnits;
      if (unitsToDiscard > 0) {
        totalUnitsDiscarded += unitsToDiscard;
        batch.remainingUnits = 0;

        // Decrement from aggregate inventory
        await BloodInventory.findOneAndUpdate(
          { hospital: hospitalId, bloodGroup: batch.bloodGroup },
          {
            $inc: { unitsAvailable: -unitsToDiscard },
            $set: { lastUpdated: new Date() }
          }
        );

        // Record discard transaction
        await BloodTransaction.create({
          hospital: hospitalId,
          transactionType: STOCK_TRANSACTION_TYPES.DISCARD_EXPIRED,
          bloodGroup: batch.bloodGroup,
          units: unitsToDiscard,
          batch: batch._id,
          batchNumber: batch.batchNumber,
          performedBy: user._id,
          reason: 'Biological shelf-life expiration discard',
          notes: notes || 'Clinical discard per safety protocol'
        });
      }

      batch.status = STOCK_BATCH_STATUS.DISCARDED;
      await batch.save();
    }

    return {
      discardedCount: expiredBatches.length,
      totalUnitsDiscarded,
      message: `Safely discarded ${totalUnitsDiscarded} expired unit(s) across ${expiredBatches.length} batch(es).`
    };
  }

  /**
   * Get batches with pagination and filtering
   */
  async getStockBatches(hospitalId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = { hospital: hospitalId };

    if (query.bloodGroup) {
      filter.bloodGroup = query.bloodGroup.toUpperCase();
    }

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    if (query.componentType) {
      filter.componentType = query.componentType.toUpperCase();
    }

    const [batches, total] = await Promise.all([
      BloodStock.find(filter).sort({ expiryDate: 1 }).skip(skip).limit(limit),
      BloodStock.countDocuments(filter)
    ]);

    return {
      batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Hospital Staff CRUD
   */
  async getStaffMembers(hospitalId, query = {}) {
    const filter = { hospital: hospitalId, isActive: true };

    if (query.role) {
      filter.role = query.role.toUpperCase();
    }

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }, { department: regex }];
    }

    const staff = await HospitalStaff.find(filter).sort({ createdAt: -1 });
    return staff;
  }

  async addStaffMember(hospitalId, staffData = {}) {
    const { name, email, phone, role, department, shift } = staffData;

    if (!name || !email) {
      throw new ApiError(400, 'Name and email are mandatory for hospital staff.');
    }

    const existing = await HospitalStaff.findOne({
      hospital: hospitalId,
      email: email.toLowerCase().trim()
    });

    if (existing && existing.isActive) {
      throw new ApiError(409, 'Staff member with this email already exists in your hospital roster.');
    }

    const staff = await HospitalStaff.create({
      hospital: hospitalId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      role: role || 'LAB_TECHNICIAN',
      department: department ? department.trim() : 'Blood Transfusion Service',
      shift: shift || 'MORNING',
      isActive: true
    });

    return staff;
  }

  async updateStaffMember(hospitalId, staffId, staffData = {}) {
    const staff = await HospitalStaff.findOne({ _id: staffId, hospital: hospitalId });
    if (!staff) {
      throw new ApiError(404, 'Staff member not found.');
    }

    const { name, phone, role, department, shift } = staffData;
    if (name) staff.name = name.trim();
    if (phone !== undefined) staff.phone = phone.trim();
    if (role) staff.role = role;
    if (department) staff.department = department.trim();
    if (shift) staff.shift = shift;

    await staff.save();
    return staff;
  }

  async removeStaffMember(hospitalId, staffId) {
    const staff = await HospitalStaff.findOne({ _id: staffId, hospital: hospitalId });
    if (!staff) {
      throw new ApiError(404, 'Staff member not found.');
    }

    staff.isActive = false;
    await staff.save();
    return { success: true, message: 'Staff member deactivated successfully.' };
  }

  /**
   * List Transactions / Audit History
   */
  async getTransactions(hospitalId, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    const filter = { hospital: hospitalId };

    if (query.transactionType) {
      filter.transactionType = query.transactionType.toUpperCase();
    }

    if (query.bloodGroup) {
      filter.bloodGroup = query.bloodGroup.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      BloodTransaction.find(filter)
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BloodTransaction.countDocuments(filter)
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Hospital Analytics & Reports
   */
  async getHospitalAnalytics(hospitalId) {
    const hospital = await User.findById(hospitalId);
    if (!hospital) {
      throw new ApiError(404, 'Hospital not found.');
    }

    // 1. Transaction volume breakdown by type
    const transactionTypeStats = await BloodTransaction.aggregate([
      { $match: { hospital: hospital._id } },
      { $group: { _id: '$transactionType', totalUnits: { $sum: '$units' }, count: { $sum: 1 } } }
    ]);

    // 2. Transfusion vs Donation distribution by blood group
    const groupDistribution = await BloodTransaction.aggregate([
      { $match: { hospital: hospital._id } },
      {
        $group: {
          _id: { bloodGroup: '$bloodGroup', type: '$transactionType' },
          totalUnits: { $sum: '$units' }
        }
      }
    ]);

    return {
      hospitalId,
      hospitalName: hospital.name,
      summary: transactionTypeStats,
      distributionByGroup: groupDistribution,
      generatedAt: new Date()
    };
  }
}

export const hospitalService = new HospitalService();

