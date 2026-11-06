import { AnalyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AnalyticsController {
  static async getOverviewMetrics(req, res, next) {
    try {
      const { range, startDate, endDate } = req.query;
      const metrics = await AnalyticsService.getOverviewMetrics(range, startDate, endDate);
      res.status(200).json(new ApiResponse(200, metrics, 'Analytics overview metrics retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async getRegistrationTrends(req, res, next) {
    try {
      const { range, startDate, endDate } = req.query;
      const trends = await AnalyticsService.getRegistrationTrends(range, startDate, endDate);
      res.status(200).json(new ApiResponse(200, trends, 'User registration trends retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async getRequestTrends(req, res, next) {
    try {
      const { range, startDate, endDate } = req.query;
      const trends = await AnalyticsService.getRequestTrends(range, startDate, endDate);
      res.status(200).json(new ApiResponse(200, trends, 'Blood request trends retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async getBloodGroupDistribution(req, res, next) {
    try {
      const distribution = await AnalyticsService.getBloodGroupDistribution();
      res.status(200).json(new ApiResponse(200, distribution, 'Blood group distribution retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async getPriorityBreakdown(req, res, next) {
    try {
      const { range, startDate, endDate } = req.query;
      const breakdown = await AnalyticsService.getPriorityBreakdown(range, startDate, endDate);
      res.status(200).json(new ApiResponse(200, breakdown, 'Emergency priority breakdown retrieved.'));
    } catch (error) {
      next(error);
    }
  }

  static async getHospitalPerformance(req, res, next) {
    try {
      const performance = await AnalyticsService.getHospitalPerformance();
      res.status(200).json(new ApiResponse(200, performance, 'Hospital performance rankings retrieved.'));
    } catch (error) {
      next(error);
    }
  }
}

export default AnalyticsController;

