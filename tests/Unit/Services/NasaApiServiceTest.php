<?php

use App\Services\NasaApiService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

uses(Tests\TestCase::class);

beforeEach(function () {
    config(['services.nasa.api_key' => 'test_api_key']);
    config(['services.nasa.base_url' => 'https://api.nasa.gov/neo/rest/v1']);

    $this->service = new NasaApiService();
    $this->testDate = '2025-01-15';
});describe('fetchNeoDataForDate', function () {
    test('successfully fetches NEO data from NASA API', function () {
        $mockResponse = [
            'near_earth_objects' => [
                $this->testDate => [
                    [
                        'neo_reference_id' => '2000433',
                        'name' => '433 Eros',
                        'absolute_magnitude_h' => 10.4,
                        'is_potentially_hazardous_asteroid' => false,
                        'estimated_diameter' => [
                            'meters' => [
                                'estimated_diameter_min' => 100.5,
                                'estimated_diameter_max' => 500.8,
                            ],
                        ],
                        'close_approach_data' => [
                            [
                                'close_approach_date' => $this->testDate,
                                'miss_distance' => [
                                    'kilometers' => '5000000',
                                ],
                                'relative_velocity' => [
                                    'kilometers_per_second' => '15.5',
                                ],
                            ],
                        ],
                    ],
                    [
                        'neo_reference_id' => '3542519',
                        'name' => '(2010 PK9)',
                        'absolute_magnitude_h' => 20.23,
                        'is_potentially_hazardous_asteroid' => true,
                        'estimated_diameter' => [
                            'meters' => [
                                'estimated_diameter_min' => 200.3,
                                'estimated_diameter_max' => 800.1,
                            ],
                        ],
                        'close_approach_data' => [
                            [
                                'close_approach_date' => $this->testDate,
                                'miss_distance' => [
                                    'kilometers' => '2500000',
                                ],
                                'relative_velocity' => [
                                    'kilometers_per_second' => '25.8',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        Http::fake([
            '*/feed*' => Http::response($mockResponse, 200),
        ]);

        $result = $this->service->fetchNeoDataForDate($this->testDate);

        expect($result)->toBeArray()
            ->and($result)->toHaveCount(2)
            ->and($result[0]['neo_reference_id'])->toBe('2000433')
            ->and($result[0]['name'])->toBe('433 Eros')
            ->and($result[1]['neo_reference_id'])->toBe('3542519')
            ->and($result[1]['is_potentially_hazardous_asteroid'])->toBeTrue();

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'https://api.nasa.gov/neo/rest/v1/feed') &&
                   $request['start_date'] === $this->testDate &&
                   $request['end_date'] === $this->testDate &&
                   $request['api_key'] === 'test_api_key';
        });
    });

    test('returns empty array when no NEOs found for date', function () {
        $mockResponse = [
            'near_earth_objects' => [],
        ];

        Http::fake([
            '*/feed*' => Http::response($mockResponse, 200),
        ]);

        $result = $this->service->fetchNeoDataForDate($this->testDate);

        expect($result)->toBeArray()
            ->and($result)->toBeEmpty();
    });

    test('throws exception when API returns error status', function () {
        Http::fake([
            '*/feed*' => Http::response(['error' => 'API rate limit exceeded'], 429),
        ]);

        Log::shouldReceive('error')
            ->once()
            ->with('NASA API Error', \Mockery::type('array'));

        expect(fn() => $this->service->fetchNeoDataForDate($this->testDate))
            ->toThrow(Exception::class);
    });

    test('throws exception when API returns server error', function () {
        Http::fake([
            '*/feed*' => Http::response(['error' => 'Internal server error'], 500),
        ]);

        Log::shouldReceive('error')
            ->once()
            ->with('NASA API Error', \Mockery::type('array'));

        expect(fn() => $this->service->fetchNeoDataForDate($this->testDate))
            ->toThrow(Exception::class);
    });

    test('retries on failure up to 3 times', function () {
        $callCount = 0;

        Http::fake(function () use (&$callCount) {
            $callCount++;
            if ($callCount < 3) {
                return Http::response([], 500);
            }
            return Http::response([
                'near_earth_objects' => [
                    $this->testDate => [],
                ],
            ], 200);
        });

        $result = $this->service->fetchNeoDataForDate($this->testDate);

        expect($callCount)->toBe(3)
            ->and($result)->toBeArray();
    });

    test('includes correct query parameters in request', function () {
        Http::fake([
            '*/feed*' => Http::response([
                'near_earth_objects' => [$this->testDate => []],
            ], 200),
        ]);

        $this->service->fetchNeoDataForDate($this->testDate);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'start_date=' . $this->testDate) &&
                   str_contains($request->url(), 'end_date=' . $this->testDate) &&
                   str_contains($request->url(), 'api_key=');
        });
    });

    test('handles network timeout exceptions', function () {
        Http::fake(function () {
            throw new \Illuminate\Http\Client\ConnectionException('Connection timeout');
        });

        Log::shouldReceive('error')
            ->once()
            ->with('NASA API Error', \Mockery::type('array'));

        expect(fn() => $this->service->fetchNeoDataForDate($this->testDate))
            ->toThrow(\Illuminate\Http\Client\ConnectionException::class);
    });

    test('logs error with correct context when API fails', function () {
        Http::fake([
            '*/feed*' => Http::response([], 500),
        ]);

        Log::shouldReceive('error')
            ->once()
            ->withArgs(function ($message, $context) {
                return $message === 'NASA API Error' &&
                       $context['date'] === $this->testDate &&
                       isset($context['error']);
            });

        try {
            $this->service->fetchNeoDataForDate($this->testDate);
        } catch (Exception $e) {
            // Expected exception
        }
    });

    test('handles malformed API response gracefully', function () {
        Http::fake([
            '*/feed*' => Http::response(['invalid' => 'structure'], 200),
        ]);

        $result = $this->service->fetchNeoDataForDate($this->testDate);

        expect($result)->toBeArray()
            ->and($result)->toBeEmpty();
    });
});
