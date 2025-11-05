import type { DailyAnalysis } from '@/types/neo';

export interface NeoStatistics {
  totalNeoCount: number;
  avgDiameter: number;
  maxVelocity: number;
  closestMiss: number;
}

/**
 * Calculate the total count of NEOs across all analyses
 */
export function calculateTotalNeoCount(analyses: DailyAnalysis[]): number {
  return analyses.reduce((sum, a) => sum + a.total_neo_count, 0);
}

/**
 * Calculate the average diameter across all analyses
 * Returns the mean of (min + max) / 2 for each analysis
 */
export function calculateAverageDiameter(analyses: DailyAnalysis[]): number {
  if (analyses.length === 0) return 0;

  const totalAvg = analyses.reduce(
    (sum, a) => sum + (Number(a.average_diameter_min) + Number(a.average_diameter_max)) / 2,
    0
  );

  return totalAvg / analyses.length;
}

/**
 * Find the maximum velocity across all analyses
 */
export function calculateMaxVelocity(analyses: DailyAnalysis[]): number {
  if (analyses.length === 0) return 0;

  return Math.max(...analyses.map(a => Number(a.max_velocity)));
}

/**
 * Find the smallest miss distance across all analyses
 */
export function calculateClosestMiss(analyses: DailyAnalysis[]): number {
  if (analyses.length === 0) return 0;

  return Math.min(...analyses.map(a => Number(a.smallest_miss_distance)));
}

/**
 * Calculate all NEO statistics at once
 */
export function calculateNeoStatistics(analyses: DailyAnalysis[]): NeoStatistics {
  return {
    totalNeoCount: calculateTotalNeoCount(analyses),
    avgDiameter: calculateAverageDiameter(analyses),
    maxVelocity: calculateMaxVelocity(analyses),
    closestMiss: calculateClosestMiss(analyses),
  };
}
