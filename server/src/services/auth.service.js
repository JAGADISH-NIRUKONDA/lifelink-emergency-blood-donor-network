import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../utils/constants.js';

export class AuthService {
  /**
   * Register a new user in LifeLink
   */
  static async registerUser(userData) {
    const {
      name,
      email,
      password,
      role = ROLES.DONOR,
      phone,
      bloodGroup,
      city,
      hospitalDetails,
      donorDetails
    } = userData;

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user with identical email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(
        409,
        'An account with this email address already exists. Please login instead.'
      );
    }

    // Build user instance
    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      phone: phone ? phone.trim() : '',
      bloodGroup: bloodGroup || '',
      city: city ? city.trim() : '',
      hospitalDetails: role === ROLES.HOSPITAL ? hospitalDetails : undefined,
      donorDetails: role === ROLES.DONOR ? donorDetails : undefined
    });

    await newUser.save();

    // Generate JWT token
    const token = newUser.generateAuthToken();

    return {
      user: newUser.toJSON(),
      token
    };
  }

  /**
   * Authenticate user with email and password
   */
  static async loginUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user and explicitly include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    // Check account status
    if (!user.isActive) {
      throw new ApiError(403, 'Your account is deactivated. Please contact an administrator.');
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Fetch current user profile by MongoDB ObjectId
   */
  static async getCurrentUserProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User account not found.');
    }

    return user.toJSON();
  }
}

