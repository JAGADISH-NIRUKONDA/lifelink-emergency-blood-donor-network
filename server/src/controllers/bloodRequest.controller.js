import { BloodRequestService } from '../services/bloodRequest.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createBloodRequest = async (req, res, next) => {
  try {
    const data = await BloodRequestService.createRequest(req.user._id, req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, data, 'Emergency blood request created successfully.'));
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const data = await BloodRequestService.getPatientRequests(req.user._id, req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Patient blood request history retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const getRequestDetails = async (req, res, next) => {
  try {
    const data = await BloodRequestService.getRequestById(req.params.id, req.user);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Blood request details retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const cancelBloodRequest = async (req, res, next) => {
  try {
    const data = await BloodRequestService.cancelRequest(
      req.params.id,
      req.user,
      req.body.cancellationReason
    );
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Blood request cancelled successfully.'));
  } catch (error) {
    next(error);
  }
};

export const listAllRequests = async (req, res, next) => {
  try {
    const data = await BloodRequestService.listRequests(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Blood requests directory retrieved.'));
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const data = await BloodRequestService.updateStatus(
      req.params.id,
      req.user,
      req.body
    );
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          data,
          `Blood request status updated to ${data.status} successfully.`
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getMatchingDonors = async (req, res, next) => {
  try {
    const data = await BloodRequestService.findMatchingDonors(req.params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Matching compatible donors identified.'));
  } catch (error) {
    next(error);
  }
};

export const getRequestStats = async (req, res, next) => {
  try {
    const data = await BloodRequestService.getDashboardStats(req.user);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Blood request statistics aggregated.'));
  } catch (error) {
    next(error);
  }
};

