import { DailyAnalysis } from '@/types/neo';

export interface NeoStatistics {
  totalNeoCount: number;
  avgDiameter: string;
  maxVelocity: string;
  closestMiss: string;
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
export function calculateAverageDiameter(analyses: DailyAnalysis[]): string {
  if (analyses.length === 0) return '0';

  const totalAvg = analyses.reduce(
    (sum, a) => sum + (Number(a.average_diameter_min) + Number(a.average_diameter_max)) / 2,
    0
  );

  return (totalAvg / analyses.length).toFixed(2);
}

/**
 * Find the maximum velocity across all analyses
 */
export function calculateMaxVelocity(analyses: DailyAnalysis[]): string {
  if (analyses.length === 0) return '0';

  return Math.max(...analyses.map(a => Number(a.max_velocity))).toFixed(2);
}

/**
 * Find the smallest miss distance across all analyses
 */
export function calculateClosestMiss(analyses: DailyAnalysis[]): string {
  if (analyses.length === 0) return '0';

  return Math.min(...analyses.map(a => Number(a.smallest_miss_distance))).toFixed(2);
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
