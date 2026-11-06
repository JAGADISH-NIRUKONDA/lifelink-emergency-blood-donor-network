import { matchingService } from '../services/matching.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class InvitationController {
  /**
   * Donor accepts donation invitation
   * POST /api/v1/invitations/:id/accept
   */
  static async acceptInvitation(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body || {};
      const result = await matchingService.respondToInvitation(id, req.user._id, 'ACCEPT', notes);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Donation invitation accepted successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Donor rejects donation invitation
   * POST /api/v1/invitations/:id/reject
   */
  static async rejectInvitation(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body || {};
      const result = await matchingService.respondToInvitation(id, req.user._id, 'REJECT', notes);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Donation invitation declined successfully.'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve single donation invitation by ID
   * GET /api/v1/invitations/:id
   */
  static async getInvitationById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await matchingService.getInvitationById(id, req.user);

      return res
        .status(200)
        .json(new ApiResponse(200, result, 'Invitation details retrieved successfully.'));
    } catch (error) {
      next(error);
    }
  }
}

