import { AdminService } from '../services/admin.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AdminController {
  static async getDashboardKPIs(req, res, next) {
    try {
      const kpis = await AdminService.getDashboardKPIs();
      res.status(200).json(new ApiResponse(200, kpis, 'Super Admin dashboard KPIs fetched successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const { page, limit, role, isActive, bloodGroup, city, search } = req.query;
      const result = await AdminService.getUsers({
        page,
        limit,
        role,
        isActive,
        bloodGroup,
        city,
        search
      });
      res.status(200).json(new ApiResponse(200, result, 'User directory retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id);
      res.status(200).json(new ApiResponse(200, user, 'User details retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive, reason } = req.body;
      const updatedUser = await AdminService.updateUserStatus(
        id,
        { isActive, reason },
        req.user,
        req
      );
      res.status(200).json(new ApiResponse(200, updatedUser, 'User active status updated successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role, reason } = req.body;
      const updatedUser = await AdminService.updateUserRole(
        id,
        { role, reason },
        req.user,
        req
      );
      res.status(200).json(new ApiResponse(200, updatedUser, 'User role updated successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async getPendingHospitals(req, res, next) {
    try {
      const { page, limit, search } = req.query;
      const result = await AdminService.getPendingHospitals({ page, limit, search });
      res.status(200).json(new ApiResponse(200, result, 'Pending hospital approvals retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async getAllHospitals(req, res, next) {
    try {
      const { page, limit, verificationStatus, hospitalType, city, search } = req.query;
      const result = await AdminService.getAllHospitals({
        page,
        limit,
        verificationStatus,
        hospitalType,
        city,
        search
      });
      res.status(200).json(new ApiResponse(200, result, 'Hospitals list retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async verifyHospital(req, res, next) {
    try {
      const { id } = req.params;
      const { verificationNotes } = req.body;
      const hospital = await AdminService.verifyHospital(
        id,
        { verificationNotes },
        req.user,
        req
      );
      res.status(200).json(new ApiResponse(200, hospital, 'Hospital credentials verified successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async rejectHospital(req, res, next) {
    try {
      const { id } = req.params;
      const { verificationNotes } = req.body;
      const hospital = await AdminService.rejectHospital(
        id,
        { verificationNotes },
        req.user,
        req
      );
      res.status(200).json(new ApiResponse(200, hospital, 'Hospital verification rejected.'));
    } catch (error) {
      next(error);
    }
  }

  static async getBloodRequests(req, res, next) {
    try {
      const {
        page,
        limit,
        status,
        priority,
        bloodGroup,
        hospitalId,
        search,
        startDate,
        endDate
      } = req.query;

      const result = await AdminService.getBloodRequests({
        page,
        limit,
        status,
        priority,
        bloodGroup,
        hospitalId,
        search,
        startDate,
        endDate
      });

      res.status(200).json(new ApiResponse(200, result, 'Blood requests retrieved for admin oversight.'));
    } catch (error) {
      next(error);
    }
  }

  static async overrideRequestStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const updatedRequest = await AdminService.overrideRequestStatus(
        id,
        { status, reason },
        req.user,
        req
      );
      res.status(200).json(new ApiResponse(200, updatedRequest, 'Request status updated successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async getInventoryOverview(req, res, next) {
    try {
      const { bloodGroup, hospitalId, lowStockOnly } = req.query;
      const inventory = await AdminService.getInventoryOverview({
        bloodGroup,
        hospitalId,
        lowStockOnly
      });
      res.status(200).json(new ApiResponse(200, inventory, 'System-wide inventory overview retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async broadcastAnnouncement(req, res, next) {
    try {
      const { title, message, targetRoles, isEmergency } = req.body;
      const result = await AdminService.broadcastAnnouncement(
        { title, message, targetRoles, isEmergency },
        req.user,
        req
      );
      res.status(200).json(new ApiResponse(200, result, 'Platform announcement dispatched successfully.'));
    } catch (error) {
      next(error);
    }
  }
}

export default AdminController;

