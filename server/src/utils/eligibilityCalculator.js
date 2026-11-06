const MIN_DONATION_INTERVAL_DAYS = 56; // Standard 8-week interval for whole blood
const MIN_DONOR_AGE = 18;
const MAX_DONOR_AGE = 65;
const MIN_DONOR_WEIGHT_KG = 50;

export const COMPATIBILITY_TABLE = Object.freeze({
  'O-': {
    giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-'],
    tag: 'Universal Red Cell Donor',
    isUniversalDonor: true,
    isUniversalRecipient: false
  },
  'O+': {
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O+', 'O-'],
    tag: 'Most Needed Common Type',
    isUniversalDonor: false,
    isUniversalRecipient: false
  },
  'A-': {
    giveTo: ['A-', 'A+', 'AB-', 'AB+'],
    receiveFrom: ['A-', 'O-'],
    tag: 'Selective Match',
    isUniversalDonor: false,
    isUniversalRecipient: false
  },
  'A+': {
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['A+', 'A-', 'O+', 'O-'],
    tag: 'High Clinical Demand',
    isUniversalDonor: false,
    isUniversalRecipient: false
  },
  'B-': {
    giveTo: ['B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['B-', 'O-'],
    tag: 'Rare Blood Group',
    isUniversalDonor: false,
    isUniversalRecipient: false
  },
  'B+': {
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['B+', 'B-', 'O+', 'O-'],
    tag: 'Regular Demand',
    isUniversalDonor: false,
    isUniversalRecipient: false
  },
  'AB-': {
    giveTo: ['AB-', 'AB+'],
    receiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    tag: 'Rare Type',
    isUniversalDonor: false,
    isUniversalRecipient: false
  },
  'AB+': {
    giveTo: ['AB+'],
    receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    tag: 'Universal Recipient',
    isUniversalDonor: false,
    isUniversalRecipient: true
  }
});

/**
 * Returns biological compatibility matrix for a blood group
 */
export function getBloodCompatibility(bloodGroup) {
  if (!bloodGroup || !COMPATIBILITY_TABLE[bloodGroup]) {
    return {
      bloodGroup: bloodGroup || 'UNKNOWN',
      giveTo: [],
      receiveFrom: [],
      tag: 'Pending Group Verification',
      isUniversalDonor: false,
      isUniversalRecipient: false
    };
  }

  return {
    bloodGroup,
    ...COMPATIBILITY_TABLE[bloodGroup]
  };
}

/**
 * Evaluates clinical whole blood donation eligibility
 * Checks 56-day rest period, age (18-65), weight (>=50kg), and availability
 */
export function calculateDonationEligibility(donor) {
  const donorDetails = donor?.donorDetails || {};
  const lastDonationDate = donorDetails.lastDonationDate
    ? new Date(donorDetails.lastDonationDate)
    : null;

  const now = new Date();
  let daysSinceLastDonation = null;
  let daysUntilEligible = 0;
  let nextEligibleDate = null;
  let isEligible = true;
  const reasons = [];

  // 1. Check 56-Day Whole Blood Donation Interval
  if (lastDonationDate && !isNaN(lastDonationDate.getTime())) {
    const diffMs = now.getTime() - lastDonationDate.getTime();
    daysSinceLastDonation = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysSinceLastDonation < MIN_DONATION_INTERVAL_DAYS) {
      isEligible = false;
      daysUntilEligible = MIN_DONATION_INTERVAL_DAYS - daysSinceLastDonation;
      nextEligibleDate = new Date(
        lastDonationDate.getTime() + MIN_DONATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000
      );
      reasons.push(
        `Clinical rest interval active: ${daysUntilEligible} day(s) remaining until eligible (minimum 56 days between donations).`
      );
    }
  }

  // 2. Check Age (18 - 65)
  const age = donorDetails.age;
  if (age !== null && age !== undefined) {
    if (age < MIN_DONOR_AGE) {
      isEligible = false;
      reasons.push(`Minimum donor age is ${MIN_DONOR_AGE} years (current age: ${age}).`);
    } else if (age > MAX_DONOR_AGE) {
      isEligible = false;
      reasons.push(
        `Maximum voluntary donor age is ${MAX_DONOR_AGE} years unless approved by hospital physician.`
      );
    }
  }

  // 3. Check Weight (>= 50kg)
  const weight = donorDetails.weight;
  if (weight !== null && weight !== undefined) {
    if (weight < MIN_DONOR_WEIGHT_KG) {
      isEligible = false;
      reasons.push(
        `Minimum body weight requirement is ${MIN_DONOR_WEIGHT_KG} kg (recorded weight: ${weight} kg).`
      );
    }
  }

  // 4. Check explicit administrative ineligibility
  if (donorDetails.eligibilityStatus === 'PERMANENTLY_INELIGIBLE') {
    isEligible = false;
    reasons.push('Permanently deferred by medical advisory board.');
  }

  const status = isEligible
    ? 'VERIFIED_ELIGIBLE'
    : daysUntilEligible > 0
    ? 'TEMPORARILY_INELIGIBLE'
    : donorDetails.eligibilityStatus || 'PENDING_SCREENING';

  return {
    isEligible,
    status,
    daysSinceLastDonation,
    daysUntilEligible,
    nextEligibleDate,
    lastDonationDate,
    reasons,
    summary: isEligible
      ? 'Currently eligible for voluntary blood donation screening.'
      : reasons.join(' '),
    guidelines: {
      minIntervalDays: MIN_DONATION_INTERVAL_DAYS,
      minAge: MIN_DONOR_AGE,
      maxAge: MAX_DONOR_AGE,
      minWeightKg: MIN_DONOR_WEIGHT_KG
    }
  };
}

