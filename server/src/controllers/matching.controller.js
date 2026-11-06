import { matchingService } from '../services/matching.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class MatchingController {
  /**
   * Run biological matching engine and rank donors for a blood request
   * POST /api/v1/matching/:requestId/run
   */
  static async runMatching(req, res, next) {
    try {
      const { requestId } = req.params;
      const result = await matchingService.runMatching(requestId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Matching algorithm executed successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get matching results and candidate donors for a blood request
   * GET /api/v1/matching/:requestId
   */
  static async getMatching(req, res, next) {
    try {
      const { requestId } = req.params;
      const result = await matchingService.runMatching(requestId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Matching candidates retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all donation invitations for the authenticated donor
   * GET /api/v1/matching/my-invitations
   */
  static async getMyInvitations(req, res, next) {
    try {
      const result = await matchingService.getDonorInvitations(req.user._id, req.query);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Donor invitations retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send invitations to selected candidate donors
   * POST /api/v1/matching/:requestId/invite
   */
  static async sendInvitations(req, res, next) {
    try {
      const { requestId } = req.params;
      const { donorIds } = req.body;
      const result = await matchingService.sendInvitations(requestId, donorIds, req.user);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Donation invitations dispatched successfully.'));
    } catch (error) {
      next(error);
    }
  }
}

