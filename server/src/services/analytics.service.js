import { User } from '../models/user.model.js';
import { BloodRequest } from '../models/bloodRequest.model.js';
import { BloodInventory } from '../models/bloodInventory.model.js';
import { BloodTransaction } from '../models/bloodTransaction.model.js';
import { BLOOD_GROUPS, ROLES, REQUEST_STATUS, REQUEST_PRIORITIES } from '../utils/constants.js';

export class AnalyticsService {
  /**
   * Helper to compute start and end dates based on range string
   */
  static getDateRange(range = '30d', customStart = null, customEnd = null) {
    const end = customEnd ? new Date(customEnd) : new Date();
    let start;

    if (customStart) {
      start = new Date(customStart);
    } else {
      start = new Date(end);
      switch (range) {
        case '7d':
          start.setDate(end.getDate() - 7);
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          break;
        case 'year':
          start.setFullYear(end.getFullYear() - 1);
          break;
        case '30d':
        default:
          start.setDate(end.getDate() - 30);
          break;
      }
    }

    return { start, end };
  }

  /**
   * Overview metrics for high-level KPIs over selected window
   */
  static async getOverviewMetrics(range = '30d', customStart = null, customEnd = null) {
    const { start, end } = this.getDateRange(range, customStart, customEnd);

    const [
      newUsersCount,
      requestsInWindow,
      fulfilledInWindow,
      totalUnitsStocked,
      unitsTransfusedResult
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      BloodRequest.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      BloodRequest.countDocuments({
        createdAt: { $gte: start, $lte: end },
        status: REQUEST_STATUS.FULFILLED
      }),
      BloodInventory.aggregate([
        { $group: { _id: null, total: { $sum: '$unitsAvailable' } } }
      ]),
      BloodTransaction.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            transactionType: 'TRANSFUSION'
          }
        },
        { $group: { _id: null, totalUnits: { $sum: '$units' } } }
      ])
    ]);

    const fulfillmentRate = requestsInWindow > 0
      ? Math.round((fulfilledInWindow / requestsInWindow) * 100)
      : 100;

    const totalAvailableStock = totalUnitsStocked[0]?.total || 0;
    const unitsTransfused = unitsTransfusedResult[0]?.totalUnits || 0;

    return {
      period: { start, end, range },
      newUsersCount,
      requestsInWindow,
      fulfilledInWindow,
      fulfillmentRate,
      totalAvailableStock,
      unitsTransfused
    };
  }

  /**
   * User registration trend over time grouped by date & role
   */
  static async getRegistrationTrends(range = '30d', customStart = null, customEnd = null) {
    const { start, end } = this.getDateRange(range, customStart, customEnd);

    const trends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Format into chronological array: [{ date, DONOR, PATIENT, HOSPITAL, VOLUNTEER, total }]
    const dateMap = {};
    for (const item of trends) {
      const { date, role } = item._id;
      if (!dateMap[date]) {
        dateMap[date] = { date, DONOR: 0, PATIENT: 0, HOSPITAL: 0, VOLUNTEER: 0, total: 0 };
      }
      dateMap[date][role] = item.count;
      dateMap[date].total += item.count;
    }

    return Object.values(dateMap);
  }

  /**
   * Blood request & fulfillment trends over time
   */
  static async getRequestTrends(range = '30d', customStart = null, customEnd = null) {
    const { start, end } = this.getDateRange(range, customStart, customEnd);

    const rawTrends = await BloodRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
            priority: '$priority'
          },
          count: { $sum: 1 },
          units: { $sum: '$unitsRequired' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    const dateMap = {};
    for (const item of rawTrends) {
      const { date, status, priority } = item._id;
      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          totalRequests: 0,
          fulfilled: 0,
          pending: 0,
          critical: 0,
          unitsRequired: 0
        };
      }
      dateMap[date].totalRequests += item.count;
      dateMap[date].unitsRequired += item.units;
      if (status === REQUEST_STATUS.FULFILLED) {
        dateMap[date].fulfilled += item.count;
      }
      if (status === REQUEST_STATUS.PENDING) {
        dateMap[date].pending += item.count;
      }
      if (priority === REQUEST_PRIORITIES.CRITICAL) {
        dateMap[date].critical += item.count;
      }
    }

    return Object.values(dateMap);
  }

  /**
   * Platform-wide blood group distribution (Donors vs Requests vs Inventory Stock)
   */
  static async getBloodGroupDistribution() {
    const [donorDist, requestDist, inventoryDist] = await Promise.all([
      User.aggregate([
        {
          $match: {
            role: ROLES.DONOR,
            bloodGroup: { $in: [...BLOOD_GROUPS] }
          }
        },
        {
          $group: {
            _id: '$bloodGroup',
            donorsCount: { $sum: 1 }
          }
        }
      ]),
      BloodRequest.aggregate([
        {
          $group: {
            _id: '$bloodGroup',
            requestsCount: { $sum: 1 },
            unitsRequested: { $sum: '$unitsRequired' }
          }
        }
      ]),
      BloodInventory.aggregate([
        {
          $group: {
            _id: '$bloodGroup',
            unitsAvailable: { $sum: '$unitsAvailable' }
          }
        }
      ])
    ]);

    const distribution = BLOOD_GROUPS.map((group) => {
      const d = donorDist.find((item) => item._id === group);
      const r = requestDist.find((item) => item._id === group);
      const i = inventoryDist.find((item) => item._id === group);

      return {
        bloodGroup: group,
        donors: d?.donorsCount || 0,
        requests: r?.requestsCount || 0,
        unitsRequested: r?.unitsRequested || 0,
        stockAvailable: i?.unitsAvailable || 0
      };
    });

    return distribution;
  }

  /**
   * Priority breakdown of requests (CRITICAL, HIGH, NORMAL)
   */
  static async getPriorityBreakdown(range = '30d', customStart = null, customEnd = null) {
    const { start, end } = this.getDateRange(range, customStart, customEnd);

    const breakdown = await BloodRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          units: { $sum: '$unitsRequired' }
        }
      }
    ]);

    const result = {
      CRITICAL: 0,
      HIGH: 0,
      NORMAL: 0,
      total: 0
    };

    breakdown.forEach((item) => {
      if (item._id && result[item._id] !== undefined) {
        result[item._id] = item.count;
        result.total += item.count;
      }
    });

    return result;
  }

  /**
   * Hospital performance rankings & processing volume
   */
  static async getHospitalPerformance() {
    const performance = await BloodRequest.aggregate([
      {
        $match: {
          $or: [
            { hospitalId: { $exists: true, $ne: null } },
            { hospital: { $exists: true, $ne: '' } }
          ]
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$hospitalId', '$hospital'] },
          hospitalName: { $first: '$hospital' },
          totalHandled: { $sum: 1 },
          fulfilledCount: {
            $sum: { $cond: [{ $eq: ['$status', REQUEST_STATUS.FULFILLED] }, 1, 0] }
          },
          totalUnitsRequested: { $sum: '$unitsRequired' },
          totalUnitsFulfilled: { $sum: '$unitsFulfilled' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'hospitalUser'
        }
      },
      {
        $unwind: { path: '$hospitalUser', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          hospitalId: '$_id',
          facilityName: {
            $ifNull: ['$hospitalUser.hospitalDetails.facilityName', '$hospitalName']
          },
          city: '$hospitalUser.city',
          isVerified: '$hospitalUser.hospitalDetails.isVerified',
          totalHandled: 1,
          fulfilledCount: 1,
          fulfillmentRate: {
            $cond: [
              { $gt: ['$totalHandled', 0] },
              { $round: [{ $multiply: [{ $divide: ['$fulfilledCount', '$totalHandled'] }, 100] }] },
              0
            ]
          },
          totalUnitsRequested: 1,
          totalUnitsFulfilled: 1
        }
      },
      {
        $sort: { totalHandled: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return performance;
  }
}

export default AnalyticsService;
