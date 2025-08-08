
import { User } from "../types";

export enum TrialStatus {
  ACTIVE = "active",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
  NO_TRIAL = "no_trial"
}

/**
 * Check the trial status of a user
 * @param user The user object
 * @returns The trial status
 */
export const getTrialStatus = (user: User | null): TrialStatus => {
  if (!user || !user.trial_ends_at) {
    return TrialStatus.NO_TRIAL;
  }

  const now = new Date();
  const trialEndDate = new Date(user.trial_ends_at);
  const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

  if (now > trialEndDate) {
    return TrialStatus.EXPIRED;
  } else if (daysRemaining <= 3) {
    return TrialStatus.EXPIRING_SOON;
  } else {
    return TrialStatus.ACTIVE;
  }
};

/**
 * Get the number of days remaining in the trial
 * @param user The user object
 * @returns The number of days remaining, or null if no trial
 */
export const getTrialDaysRemaining = (user: User | null): number | null => {
  if (!user || !user.trial_ends_at) {
    return null;
  }

  const now = new Date();
  const trialEndDate = new Date(user.trial_ends_at);
  return Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
};

/**
 * Format the trial message based on trial status
 */
export const getTrialStatusMessage = (status: TrialStatus, daysRemaining: number | null): string => {
  switch (status) {
    case TrialStatus.ACTIVE:
      return `Your trial is active. ${daysRemaining} days remaining.`;
    case TrialStatus.EXPIRING_SOON:
      return `Your trial expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}!`;
    case TrialStatus.EXPIRED:
      return "Your trial has expired. Please upgrade to continue using premium features.";
    case TrialStatus.NO_TRIAL:
      return "No active trial.";
  }
};

/**
 * Check if a user can access premium features
 */
export const canAccessPremiumFeatures = (user: User | null): boolean => {
  if (!user) return false;

  if (user.subscribed) return true;

  if (user.trial_ends_at) {
    const now = new Date();
    const trialEndDate = new Date(user.trial_ends_at);
    return now < trialEndDate;
  }

  return false;
};
