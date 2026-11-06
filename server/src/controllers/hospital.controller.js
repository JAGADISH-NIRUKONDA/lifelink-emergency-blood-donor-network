import { hospitalService } from '../services/hospital.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES } from '../utils/constants.js';

export class HospitalController {
  /**
   * Helper to resolve the target hospital ID:
   * Hospital users operate on their own account (`req.user._id`).
   * Admins can optionally target another hospital via `req.query.hospitalId` or `req.params.id`.
   */
  static getTargetHospitalId(req) {
    if (req.user.role === ROLES.ADMIN && (req.query.hospitalId || req.params.hospitalId)) {
      return req.query.hospitalId || req.params.hospitalId;
    }
    return req.user._id;
  }

  // 1. Profile Management
  static async getProfile(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getHospitalProfile(hospitalId);
      return res.status(200).json(new ApiResponse(200, result, 'Hospital profile retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.updateHospitalProfile(hospitalId, req.body);
      return res.status(200).json(new ApiResponse(200, result, 'Hospital profile updated successfully.'));
    } catch (error) {
      next(error);
    }
  }

  // 2. Admin Verification Workflow
  static async verifyHospital(req, res, next) {
    try {
      const { id } = req.params;
      const result = await hospitalService.verifyHospital(id, req.user, req.body);
      return res.status(200).json(new ApiResponse(200, result, 'Hospital verification status updated.'));
    } catch (error) {
      next(error);
    }
  }

  static async listHospitals(req, res, next) {
    try {
      const result = await hospitalService.listHospitals(req.query);
      return res.status(200).json(new ApiResponse(200, result, 'Hospitals directory retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  // 3. Hospital Dashboard Stats (100% Real MongoDB)
  static async getDashboardStats(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getHospitalDashboardStats(hospitalId);
      return res.status(200).json(new ApiResponse(200, result, 'Hospital dashboard statistics retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  // 4. Blood Inventory Management
  static async getInventory(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getInventory(hospitalId);
      return res.status(200).json(new ApiResponse(200, result, 'Blood inventory retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async updateInventoryThreshold(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.updateInventoryThreshold(hospitalId, req.body);
      return res.status(200).json(new ApiResponse(200, result, 'Stock threshold updated.'));
    } catch (error) {
      next(error);
    }
  }

  static async getStockBatches(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getStockBatches(hospitalId, req.query);
      return res.status(200).json(new ApiResponse(200, result, 'Blood stock batches retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async stockIn(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.stockIn(hospitalId, req.user, req.body);
      return res.status(201).json(new ApiResponse(201, result, 'Blood units stocked in successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async stockOut(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.stockOut(hospitalId, req.user, req.body);
      return res.status(200).json(new ApiResponse(200, result, 'Stock-out / Transfusion recorded successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async discardExpired(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.discardExpired(hospitalId, req.user, req.body);
      return res.status(200).json(new ApiResponse(200, result, result.message));
    } catch (error) {
      next(error);
    }
  }

  // 5. Staff Management
  static async getStaff(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getStaffMembers(hospitalId, req.query);
      return res.status(200).json(new ApiResponse(200, result, 'Staff roster retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async addStaff(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.addStaffMember(hospitalId, req.body);
      return res.status(201).json(new ApiResponse(201, result, 'Staff member added successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async updateStaff(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const { staffId } = req.params;
      const result = await hospitalService.updateStaffMember(hospitalId, staffId, req.body);
      return res.status(200).json(new ApiResponse(200, result, 'Staff member updated successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async removeStaff(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const { staffId } = req.params;
      const result = await hospitalService.removeStaffMember(hospitalId, staffId);
      return res.status(200).json(new ApiResponse(200, result, result.message));
    } catch (error) {
      next(error);
    }
  }

  // 6. Transactions / History
  static async getTransactions(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getTransactions(hospitalId, req.query);
      return res.status(200).json(new ApiResponse(200, result, 'Transactions history retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  // 7. Analytics & Reports
  static async getAnalytics(req, res, next) {
    try {
      const hospitalId = HospitalController.getTargetHospitalId(req);
      const result = await hospitalService.getHospitalAnalytics(hospitalId);
      return res.status(200).json(new ApiResponse(200, result, 'Hospital analytics generated.'));
    } catch (error) {
      next(error);
    }
  }
}

