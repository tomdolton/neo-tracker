<?php

namespace App\Services;

use App\Models\DailyAnalysis;
use App\Models\NearEarthObject;
use Illuminate\Support\Facades\DB;

class NeoAnalysisService
{
    /**
     * Calculate and store daily analysis
     *
     * @param string $date
     * @return DailyAnalysis
     */
    public function analyseDate(string $date): DailyAnalysis
    {
        $neos = NearEarthObject::whereDate('close_approach_date', $date)->get();

        if ($neos->isEmpty()) {
            throw new \Exception("No NEO data found for date: {$date}");
        }

        $analysisData = $this->calculateMetrics($neos);
        $analysisData['analysis_date'] = $date;

        return DB::transaction(function () use ($analysisData, $neos) {
            // Create or update the daily analysis
            $analysis = DailyAnalysis::updateOrCreate(
                ['analysis_date' => $analysisData['analysis_date']],
                $analysisData
            );

            // Sync the NEOs with this analysis (many-to-many)
            $analysis->nearEarthObjects()->sync($neos->pluck('id'));

            return $analysis;
        });
    }

    /**
     * Calculate metrics from NEO collection
     *
     * @param \Illuminate\Support\Collection $neos
     * @return array
     */
    public function calculateMetrics($neos): array
    {
        return [
            'total_neo_count' => $neos->count(),
            'average_diameter_min' => round($neos->avg('estimated_diameter_min'), 2),
            'average_diameter_max' => round($neos->avg('estimated_diameter_max'), 2),
            'max_velocity' => round($neos->max('relative_velocity'), 2),
            'smallest_miss_distance' => round($neos->min('miss_distance'), 2),
        ];
    }
}
