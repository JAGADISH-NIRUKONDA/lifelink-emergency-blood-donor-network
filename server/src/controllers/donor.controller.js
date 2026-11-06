import { DonorService } from '../services/donor.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../utils/constants.js';

/**
 * Controller: Get currently authenticated donor's profile
 * GET /api/v1/donors/profile
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const data = await DonorService.getDonorProfile(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor profile retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update currently authenticated donor's profile
 * PUT /api/v1/donors/profile
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const data = await DonorService.updateDonorProfile(req.user._id, req.body, req.user);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor profile updated successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Quick toggle / pause donor availability
 * PATCH /api/v1/donors/availability
 */
export const updateMyAvailability = async (req, res, next) => {
  try {
    const data = await DonorService.updateAvailability(req.user._id, req.body, req.user);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          data,
          `Donor availability status updated to ${data.availabilityStatus}.`
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get donor dashboard analytics and summary
 * GET /api/v1/donors/dashboard
 */
export const getMyDashboard = async (req, res, next) => {
  try {
    const data = await DonorService.getDonorDashboard(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor dashboard loaded successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Discover relevant nearby blood requests
 * GET /api/v1/donors/requests/nearby
 */
export const getNearbyRequests = async (req, res, next) => {
  try {
    const data = await DonorService.getNearbyRequests(req.user._id, req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Nearby blood requests retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Respond to an active blood request
 * POST /api/v1/donors/requests/:requestId/respond
 */
export const respondToBloodRequest = async (req, res, next) => {
  try {
    const data = await DonorService.respondToBloodRequest(
      req.user._id,
      req.params.requestId,
      req.body,
      req.user
    );
    return res
      .status(200)
      .json(new ApiResponse(200, data, data.message));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get verified donation records
 * GET /api/v1/donors/donation-history
 */
export const getDonationHistory = async (req, res, next) => {
  try {
    const data = await DonorService.getDonationHistory(req.user._id, req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donation history retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Record a verified donation
 * POST /api/v1/donors/donation-history
 */
export const recordDonation = async (req, res, next) => {
  try {
    const data = await DonorService.recordDonation(req.user._id, req.body, req.user);
    return res
      .status(201)
      .json(new ApiResponse(201, data, 'Donation record logged successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get personal donor analytics
 * GET /api/v1/donors/analytics
 */
export const getDonorAnalytics = async (req, res, next) => {
  try {
    const data = await DonorService.getDonorAnalytics(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor analytics loaded successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get donation eligibility information & reminder
 * GET /api/v1/donors/eligibility
 */
export const getEligibilityInfo = async (req, res, next) => {
  try {
    const data = await DonorService.getEligibilityInfo(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Eligibility information retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: List/search donors with filters and pagination
 * GET /api/v1/donors
 * Access: ADMIN, HOSPITAL
 */
export const getAllDonors = async (req, res, next) => {
  try {
    const data = await DonorService.listDonors(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor directory retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single donor by ID
 * GET /api/v1/donors/:id
 * Access: Self, ADMIN, HOSPITAL
 */
export const getDonorById = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isAuthorizedRole = [ROLES.ADMIN, ROLES.HOSPITAL].includes(req.user.role);

    if (!isSelf && !isAuthorizedRole) {
      throw new ApiError(403, 'Access denied. You may only inspect your own donor profile.');
    }

    const data = await DonorService.getDonorProfile(req.params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor details retrieved successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update donor by ID
 * PUT /api/v1/donors/:id
 * Access: Self, ADMIN
 */
export const updateDonorById = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ApiError(403, 'Access denied. You may only edit your own donor profile.');
    }

    const data = await DonorService.updateDonorProfile(req.params.id, req.body, req.user);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor record updated successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Delete donor account by ID
 * DELETE /api/v1/donors/:id
 * Access: ADMIN only
 */
export const deleteDonorById = async (req, res, next) => {
  try {
    const data = await DonorService.deleteDonor(req.params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, data.message));
  } catch (error) {
    next(error);
  }
};
