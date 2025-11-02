<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NasaApiService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.nasa.api_key');
        $this->baseUrl = config('services.nasa.base_url');
    }

    /**
     * Fetch NEO data for a specific date
     *
     * @param string $date Date in Y-m-d format
     * @return array Raw NEO data from API
     * @throws \Exception
     */
    public function fetchNeoDataForDate(string $date): array
    {
        try {
            $response = Http::retry(3, 100)
                ->timeout(30)
                ->get("{$this->baseUrl}/feed", [
                    'start_date' => $date,
                    'end_date' => $date,
                    'api_key' => $this->apiKey,
                ]);

            if ($response->failed()) {
                throw new \Exception(
                    "NASA API request failed with status {$response->status()}: {$response->body()}"
                );
            }

            $data = $response->json();

            return $data['near_earth_objects'][$date] ?? [];

        } catch (\Exception $e) {
            Log::error('NASA API Error', [
                'date' => $date,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
