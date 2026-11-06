import { AuditLogService } from '../services/auditLog.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuditLogController {
  static async getAuditLogs(req, res, next) {
    try {
      const {
        page,
        limit,
        action,
        actorRole,
        targetResource,
        startDate,
        endDate,
        search
      } = req.query;

      const result = await AuditLogService.getAuditLogs({
        page,
        limit,
        action,
        actorRole,
        targetResource,
        startDate,
        endDate,
        search
      });

      res.status(200).json(new ApiResponse(200, result, 'Audit logs retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogById(req, res, next) {
    try {
      const { id } = req.params;
      const log = await AuditLogService.getAuditLogById(id);
      res.status(200).json(new ApiResponse(200, log, 'Audit log details retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }
}

export default AuditLogController;

