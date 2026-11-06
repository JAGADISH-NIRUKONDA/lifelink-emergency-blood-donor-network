import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES } from '../utils/constants.js';
import {
  calculateDonationEligibility,
  getBloodCompatibility
} from '../utils/eligibilityCalculator.js';

export class DonorService {
  /**
   * Retrieve donor profile with real-time calculated eligibility & compatibility
   */
  static async getDonorProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const eligibility = calculateDonationEligibility(user);
    const compatibility = getBloodCompatibility(user.bloodGroup);

    return {
      profile: user.toJSON(),
      eligibility,
      compatibility
    };
  }

  /**
   * Update donor profile fields and recalculate clinical eligibility
   */
  static async updateDonorProfile(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    // Top-level fields
    if (updateData.name !== undefined) user.name = updateData.name.trim();
    if (updateData.phone !== undefined) user.phone = updateData.phone.trim();
    if (updateData.city !== undefined) user.city = updateData.city.trim();
    if (updateData.bloodGroup !== undefined) user.bloodGroup = updateData.bloodGroup;

    // Ensure donorDetails subdocument exists
    if (!user.donorDetails) {
      user.donorDetails = {};
    }

    // Donor Details fields
    if (updateData.lastDonationDate !== undefined) {
      user.donorDetails.lastDonationDate = updateData.lastDonationDate
        ? new Date(updateData.lastDonationDate)
        : null;
    }

    if (updateData.isAvailable !== undefined) {
      user.donorDetails.isAvailable = Boolean(updateData.isAvailable);
    }

    if (updateData.age !== undefined) {
      user.donorDetails.age = updateData.age !== null ? Number(updateData.age) : null;
    }

    if (updateData.weight !== undefined) {
      user.donorDetails.weight = updateData.weight !== null ? Number(updateData.weight) : null;
    }

    if (updateData.gender !== undefined) {
      user.donorDetails.gender = updateData.gender;
    }

    if (updateData.address !== undefined) {
      user.donorDetails.address = updateData.address.trim();
    }

    if (updateData.state !== undefined) {
      user.donorDetails.state = updateData.state.trim();
    }

    if (updateData.postalCode !== undefined) {
      user.donorDetails.postalCode = updateData.postalCode.trim();
    }

    if (updateData.emergencyContact !== undefined) {
      user.donorDetails.emergencyContact = updateData.emergencyContact.trim();
    }

    if (updateData.totalDonations !== undefined) {
      user.donorDetails.totalDonations = Number(updateData.totalDonations);
    }

    if (updateData.medicalNotes !== undefined) {
      user.donorDetails.medicalNotes = updateData.medicalNotes.trim();
    }

    // Recalculate eligibility status based on updated clinical parameters
    const eligibility = calculateDonationEligibility(user);
    user.donorDetails.eligibilityStatus = eligibility.status;

    await user.save();

    const compatibility = getBloodCompatibility(user.bloodGroup);

    return {
      profile: user.toJSON(),
      eligibility,
      compatibility
    };
  }

  /**
   * Fast toggle for donor availability status
   */
  static async updateAvailability(userId, isAvailable) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    if (!user.donorDetails) {
      user.donorDetails = {};
    }

    user.donorDetails.isAvailable = Boolean(isAvailable);
    await user.save();

    return {
      userId: user._id,
      isAvailable: user.donorDetails.isAvailable,
      updatedAt: user.updatedAt
    };
  }

  /**
   * Aggregate donor dashboard analytics and clinical summary
   */
  static async getDonorDashboard(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'Donor account not found.');
    }

    const donorDetails = user.donorDetails || {};
    const eligibility = calculateDonationEligibility(user);
    const compatibility = getBloodCompatibility(user.bloodGroup);

    const totalDonations = donorDetails.totalDonations || 0;
    const livesSavedEstimate = totalDonations * 3; // Standard clinical average (3 lives per whole blood unit)

    return {
      overview: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        bloodGroup: user.bloodGroup || 'Not specified',
        city: user.city || 'Not specified',
        isAvailable: donorDetails.isAvailable !== false
      },
      eligibility,
      compatibility,
      metrics: {
        totalDonations,
        livesSavedEstimate,
        lastDonationDate: donorDetails.lastDonationDate || null,
        daysSinceLastDonation: eligibility.daysSinceLastDonation
      },
      clinicalGuidance: [
        {
          id: 'hydration',
          title: 'Pre-Donation Hydration',
          tip: 'Drink an extra 16-24 oz of water or fluids 2 hours prior to clinical collection.'
        },
        {
          id: 'nutrition',
          title: 'Iron-Rich Nutrition',
          tip: 'Maintain iron-rich meals (spinach, beans, poultry) to support optimal hemoglobin levels.'
        },
        {
          id: 'rest',
          title: 'Adequate Rest',
          tip: 'Ensure at least 7-8 hours of sleep the night before your scheduled donation.'
        },
        {
          id: 'safety',
          title: 'Post-Donation Care',
          tip: 'Avoid strenuous heavy lifting or intense cardiovascular workouts for 24 hours.'
        }
      ]
    };
  }

  /**
   * Search and list donors with filters and pagination (Admin / Hospital access)
   */
  static async listDonors(query = {}) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      role: ROLES.DONOR,
      isActive: true
    };

    if (query.bloodGroup) {
      let grp = query.bloodGroup.trim().toUpperCase();
      if (!grp.endsWith('+') && !grp.endsWith('-')) {
        grp = grp + '+';
      }
      filter.bloodGroup = grp;
    }

    if (query.city) {
      filter.city = { $regex: new RegExp(query.city.trim(), 'i') };
    }

    if (query.isAvailable !== undefined) {
      const isAvail = query.isAvailable === 'true' || query.isAvailable === true;
      filter['donorDetails.isAvailable'] = isAvail;
    }

    if (query.eligibilityStatus) {
      filter['donorDetails.eligibilityStatus'] = query.eligibilityStatus;
    }

    const [donors, total] = await Promise.all([
      User.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    // Enhance each donor record with computed eligibility summary
    const enhancedDonors = donors.map((d) => {
      const json = d.toJSON();
      const eligibility = calculateDonationEligibility(d);
      return {
        ...json,
        eligibilitySummary: {
          isEligible: eligibility.isEligible,
          status: eligibility.status,
          daysUntilEligible: eligibility.daysUntilEligible
        }
      };
    });

    return {
      donors: enhancedDonors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single donor by MongoDB ID
   */
  static async getDonorById(donorId) {
    const user = await User.findById(donorId);

    if (!user) {
      throw new ApiError(404, 'Donor not found.');
    }

    const eligibility = calculateDonationEligibility(user);
    const compatibility = getBloodCompatibility(user.bloodGroup);

    return {
      donor: user.toJSON(),
      eligibility,
      compatibility
    };
  }

  /**
   * Deactivate or delete donor account (Admin only)
   */
  static async deleteDonor(donorId) {
    const user = await User.findById(donorId);

    if (!user) {
      throw new ApiError(404, 'Donor not found.');
    }

    user.isActive = false;
    await user.save();

    return {
      id: user._id,
      message: 'Donor account has been deactivated successfully.'
    };
  }
}

