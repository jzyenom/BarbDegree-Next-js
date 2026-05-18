export type BarberReputationBadge =
  | "Top Rated Barber"
  | "Elite Barber"
  | "Most Trusted Barber";

export type BarberReputationInput = {
  averageRating: number;
  reviewCount: number;
  completedJobs: number;
  ratingStandardDeviation?: number | null;
  cancelledJobs?: number;
  responseSpeedMinutes?: number | null;
  recentAverageRating?: number | null;
  recentReviewCount?: number;
};

export type BarberReputationResult = {
  reputationScore: number;
  averageRating: number;
  adjustedAverageRating: number;
  completedJobs: number;
  completedJobsScore: number;
  consistencyScore: number;
  cancellationRate: number;
  cancellationPenalty: number;
  responseSpeedScore: number | null;
  recentPerformanceBoost: number;
  reviewCount: number;
  qualifiesForRecognition: boolean;
  badges: BarberReputationBadge[];
};

export const BARBER_REPUTATION_CONFIG = {
  minimumReviewsForRecognition: 5,
  confidenceReviewThreshold: 20,
  baselineRating: 3.8,
  completedJobsNormalizer: 100,
  recentBoostMinimumReviews: 3,
  maxRecentPerformanceBoost: 0.25,
  maxCancellationPenalty: 0.5,
  targetResponseMinutes: 30,
} as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const round = (value: number, digits = 2) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

export class BarberReputationEngine {
  static calculate(input: BarberReputationInput): BarberReputationResult {
    const reviewCount = Math.max(0, input.reviewCount);
    const completedJobs = Math.max(0, input.completedJobs);
    const cancelledJobs = Math.max(0, input.cancelledJobs ?? 0);
    const totalClosedJobs = completedJobs + cancelledJobs;
    const cancellationRate = totalClosedJobs > 0 ? cancelledJobs / totalClosedJobs : 0;

    const adjustedAverageRating = BarberReputationEngine.calculateAdjustedRating(
      input.averageRating,
      reviewCount
    );
    const completedJobsScore = clamp(
      (completedJobs / BARBER_REPUTATION_CONFIG.completedJobsNormalizer) * 5,
      0,
      5
    );
    const consistencyScore = BarberReputationEngine.calculateConsistencyScore(
      input.ratingStandardDeviation,
      reviewCount
    );
    const cancellationPenalty = clamp(
      cancellationRate * 2,
      0,
      BARBER_REPUTATION_CONFIG.maxCancellationPenalty
    );
    const responseSpeedScore =
      typeof input.responseSpeedMinutes === "number"
        ? BarberReputationEngine.calculateResponseSpeedScore(input.responseSpeedMinutes)
        : null;
    const recentPerformanceBoost = BarberReputationEngine.calculateRecentPerformanceBoost(
      adjustedAverageRating,
      input.recentAverageRating,
      input.recentReviewCount ?? 0
    );

    const baseScore =
      adjustedAverageRating * 0.7 + completedJobsScore * 0.2 + consistencyScore * 0.1;
    const reputationScore = clamp(
      baseScore - cancellationPenalty + recentPerformanceBoost,
      0,
      5
    );
    const qualifiesForRecognition =
      reviewCount >= BARBER_REPUTATION_CONFIG.minimumReviewsForRecognition;
    const badges = BarberReputationEngine.resolveBadges({
      averageRating: input.averageRating,
      reviewCount,
      completedJobs,
      cancellationRate,
      reputationScore,
      qualifiesForRecognition,
    });

    return {
      reputationScore: round(reputationScore),
      averageRating: round(input.averageRating, 1),
      adjustedAverageRating: round(adjustedAverageRating),
      completedJobs,
      completedJobsScore: round(completedJobsScore),
      consistencyScore: round(consistencyScore),
      cancellationRate: round(cancellationRate, 4),
      cancellationPenalty: round(cancellationPenalty),
      responseSpeedScore,
      recentPerformanceBoost: round(recentPerformanceBoost),
      reviewCount,
      qualifiesForRecognition,
      badges,
    };
  }

  private static calculateAdjustedRating(averageRating: number, reviewCount: number) {
    const threshold = BARBER_REPUTATION_CONFIG.confidenceReviewThreshold;
    const baseline = BARBER_REPUTATION_CONFIG.baselineRating;

    if (reviewCount <= 0) return 0;

    return (
      (averageRating * reviewCount + baseline * threshold) / (reviewCount + threshold)
    );
  }

  private static calculateConsistencyScore(
    ratingStandardDeviation: number | null | undefined,
    reviewCount: number
  ) {
    if (reviewCount <= 1) return 0;

    const deviation = typeof ratingStandardDeviation === "number" ? ratingStandardDeviation : 0;
    const stability = clamp(5 - deviation * 1.5, 0, 5);
    const confidence = clamp(
      reviewCount / BARBER_REPUTATION_CONFIG.confidenceReviewThreshold,
      0,
      1
    );

    return stability * confidence;
  }

  private static calculateResponseSpeedScore(responseSpeedMinutes: number) {
    if (responseSpeedMinutes <= 0) return 5;

    return round(
      clamp(
        BARBER_REPUTATION_CONFIG.targetResponseMinutes / responseSpeedMinutes,
        0,
        1
      ) * 5
    );
  }

  private static calculateRecentPerformanceBoost(
    adjustedAverageRating: number,
    recentAverageRating: number | null | undefined,
    recentReviewCount: number
  ) {
    if (
      typeof recentAverageRating !== "number" ||
      recentReviewCount < BARBER_REPUTATION_CONFIG.recentBoostMinimumReviews
    ) {
      return 0;
    }

    return clamp(
      (recentAverageRating - adjustedAverageRating) * 0.2,
      0,
      BARBER_REPUTATION_CONFIG.maxRecentPerformanceBoost
    );
  }

  private static resolveBadges(input: {
    averageRating: number;
    reviewCount: number;
    completedJobs: number;
    cancellationRate: number;
    reputationScore: number;
    qualifiesForRecognition: boolean;
  }) {
    if (!input.qualifiesForRecognition) return [];

    const badges: BarberReputationBadge[] = [];

    if (input.averageRating >= 4.7 && input.reputationScore >= 4.2) {
      badges.push("Top Rated Barber");
    }

    if (
      input.averageRating >= 4.7 &&
      input.reputationScore >= 4.5 &&
      input.completedJobs >= 50 &&
      input.cancellationRate <= 0.05
    ) {
      badges.push("Elite Barber");
    }

    if (
      input.reviewCount >= 20 &&
      input.completedJobs >= 100 &&
      input.cancellationRate <= 0.03
    ) {
      badges.push("Most Trusted Barber");
    }

    return badges;
  }
}
