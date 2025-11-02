<?php

namespace App\Services;

use App\Models\NearEarthObject;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NeoDataService
{
    public function __construct(
        private readonly NasaApiService $nasaApiService,
        private readonly NeoAnalysisService $analysisService
    ) {}

    /**
     * Fetch, transform, store and analyze NEO data for a specific date
     *
     * @param string $date Date in Y-m-d format
     * @return array Summary of operations
     */
    public function processNeoDataForDate(string $date): array
    {
        try {
            // 1. Fetch from NASA API
            $rawNeoData = $this->nasaApiService->fetchNeoDataForDate($date);

            if (empty($rawNeoData)) {
                Log::info("No NEO data available for date: {$date}");
                return [
                    'success' => true,
                    'date' => $date,
                    'neos_stored' => 0,
                    'message' => 'No NEO data available for this date',
                ];
            }

            // 2. Transform and store
            $storedCount = $this->transformAndStore($rawNeoData, $date);

            // 3. Analyse
            $analysis = $this->analysisService->analyseDate($date);

            Log::info("NEO data processed successfully", [
                'date' => $date,
                'neos_stored' => $storedCount,
            ]);

            return [
                'success' => true,
                'date' => $date,
                'neos_stored' => $storedCount,
                'analysis' => $analysis,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to process NEO data', [
                'date' => $date,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Transform API data and store in database
     *
     * @param array $rawNeoData
     * @param string $date
     * @return int Number of NEOs stored
     */
    private function transformAndStore(array $rawNeoData, string $date): int
    {
        $storedCount = 0;

        DB::transaction(function () use ($rawNeoData, $date, &$storedCount) {
            foreach ($rawNeoData as $neo) {
                // Get the correct close approach data for this date
                $closeApproach = $this->findCloseApproachForDate($neo, $date);

                if (!$closeApproach) {
                    continue; // Skip if no matching close approach
                }

                // Convert kilometers to meters for miss distance
                $missDistanceMeters = isset($closeApproach['miss_distance']['kilometers'])
                    ? floatval($closeApproach['miss_distance']['kilometers']) * 1000
                    : 0;

                // Convert kilometers per second to meters per second for velocity
                $velocityMetersPerSecond = isset($closeApproach['relative_velocity']['kilometers_per_second'])
                    ? floatval($closeApproach['relative_velocity']['kilometers_per_second']) * 1000
                    : 0;

                // Transform and store using Eloquent
                NearEarthObject::updateOrCreate(
                    [
                        'neo_reference_id' => $neo['neo_reference_id'],
                        'close_approach_date' => $date,
                    ],
                    [
                        'name' => $neo['name'],
                        'estimated_diameter_min' => $neo['estimated_diameter']['meters']['estimated_diameter_min'] ?? 0,
                        'estimated_diameter_max' => $neo['estimated_diameter']['meters']['estimated_diameter_max'] ?? 0,
                        'is_hazardous' => $neo['is_potentially_hazardous_asteroid'] ?? false,
                        'absolute_magnitude' => $neo['absolute_magnitude_h'] ?? 0,
                        'miss_distance' => $missDistanceMeters,
                        'relative_velocity' => $velocityMetersPerSecond,
                    ]
                );

                $storedCount++;
            }
        });

        return $storedCount;
    }

    /**
     * Find the close approach data matching the specific date
     *
     * @param array $neo
     * @param string $date
     * @return array|null
     */
    private function findCloseApproachForDate(array $neo, string $date): ?array
    {
        $closeApproaches = $neo['close_approach_data'] ?? [];

        foreach ($closeApproaches as $approach) {
            if (($approach['close_approach_date'] ?? null) === $date) {
                return $approach;
            }
        }

        // Log if no match found
        Log::warning('No matching close approach found', [
            'neo_id' => $neo['neo_reference_id'] ?? 'unknown',
            'date' => $date,
        ]);

        return null;
    }
}
