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
    const data = await DonorService.updateDonorProfile(req.user._id, req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor profile updated successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Quick toggle donor availability
 * PATCH /api/v1/donors/availability
 */
export const updateMyAvailability = async (req, res, next) => {
  try {
    const data = await DonorService.updateAvailability(
      req.user._id,
      req.body.isAvailable
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          data,
          `Donor availability status updated to ${data.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}.`
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
      .json(new ApiResponse(200, data, 'Donor dashboard data loaded successfully.'));
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
      throw new ApiError(
        403,
        'Access denied: You do not have permission to view this donor record.'
      );
    }

    const data = await DonorService.getDonorById(req.params.id);
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
      throw new ApiError(
        403,
        'Access denied: Only the account owner or an administrator can update this donor record.'
      );
    }

    const data = await DonorService.updateDonorProfile(req.params.id, req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor record updated successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Deactivate donor by ID
 * DELETE /api/v1/donors/:id
 * Access: ADMIN
 */
export const deleteDonorById = async (req, res, next) => {
  try {
    const data = await DonorService.deleteDonor(req.params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Donor account deleted/deactivated successfully.'));
  } catch (error) {
    next(error);
  }
};

