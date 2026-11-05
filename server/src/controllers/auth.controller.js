import { AuthService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Controller: Register new user
 * POST /api/v1/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const result = await AuthService.registerUser(req.body);

    return res
      .status(201)
      .json(new ApiResponse(201, result, 'User registered successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Authenticate user login
 * POST /api/v1/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);

    return res
      .status(200)
      .json(new ApiResponse(200, result, 'User logged in successfully.'));
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Logout current user
 * POST /api/v1/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    // In stateless JWT architectures, the client discards the token.
    // If httpOnly cookies are used in the future, we clear the cookie here.
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'User logged out successfully. Please discard the client token.'
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get currently authenticated user profile
 * GET /api/v1/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    const userProfile = await AuthService.getCurrentUserProfile(req.user._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userProfile,
          'Current user profile retrieved successfully.'
        )
      );
  } catch (error) {
    next(error);
  }
};

