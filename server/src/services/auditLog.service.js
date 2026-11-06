import { AuditLog } from '../models/auditLog.model.js';
import { ApiError } from '../utils/apiError.js';

export class AuditLogService {
  /**
   * Retrieve paginated audit logs with flexible filtering
   */
  static async getAuditLogs({
    page = 1,
    limit = 20,
    action,
    actorRole,
    targetResource,
    startDate,
    endDate,
    search
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (actorRole) {
      filter.actorRole = actorRole;
    }

    if (targetResource) {
      filter.targetResource = targetResource;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { actorName: searchRegex },
        { actorEmail: searchRegex },
        { targetIdentifier: searchRegex },
        { action: searchRegex }
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    };
  }

  /**
   * Get audit log by ID
   */
  static async getAuditLogById(id) {
    const log = await AuditLog.findById(id).populate('actor', 'name email role').lean();
    if (!log) {
      throw new ApiError(404, 'Audit log entry not found.');
    }
    return log;
  }
}

export default AuditLogService;

