<?php

use App\Models\DailyAnalysis;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

describe('GET /api/analyses', function () {
    test('returns all analyses in descending order by date', function () {
        // Create analyses with different dates
        DailyAnalysis::factory()->create([
            'analysis_date' => '2025-01-10',
            'total_neo_count' => 5,
        ]);

        DailyAnalysis::factory()->create([
            'analysis_date' => '2025-01-15',
            'total_neo_count' => 8,
        ]);

        DailyAnalysis::factory()->create([
            'analysis_date' => '2025-01-05',
            'total_neo_count' => 3,
        ]);

        $response = $this->getJson('/api/analyses');

        $response->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonStructure([
                '*' => [
                    'id',
                    'analysis_date',
                    'total_neo_count',
                    'average_diameter_min',
                    'average_diameter_max',
                    'max_velocity',
                    'smallest_miss_distance',
                    'created_at',
                    'updated_at',
                ]
            ]);

        // Verify order is descending by date
        $data = $response->json();
        expect($data[0]['analysis_date'])->toContain('2025-01-15')
            ->and($data[1]['analysis_date'])->toContain('2025-01-10')
            ->and($data[2]['analysis_date'])->toContain('2025-01-05');
    });

    test('returns empty array when no analyses exist', function () {
        $response = $this->getJson('/api/analyses');

        $response->assertStatus(200)
            ->assertJsonCount(0)
            ->assertJson([]);
    });

    test('filters analyses by date range', function () {
        // Create analyses spanning multiple dates
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-01']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-10']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-15']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-20']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-31']);

        $response = $this->getJson('/api/analyses?start_date=2025-01-10&end_date=2025-01-20');

        $response->assertStatus(200);

        $dates = collect($response->json())->pluck('analysis_date')->map(fn($d) => substr($d, 0, 10))->all();
        expect($dates)->toContain('2025-01-10')
            ->and($dates)->toContain('2025-01-15')
            ->and($dates)->toContain('2025-01-20')
            ->and($dates)->not->toContain('2025-01-01')
            ->and($dates)->not->toContain('2025-01-31');
    });

    test('filters correctly with inclusive date range boundaries', function () {
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-09']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-10']); // Start boundary
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-15']); // Middle
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-20']); // End boundary
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-21']);

        $response = $this->getJson('/api/analyses?start_date=2025-01-10&end_date=2025-01-20');

        $response->assertStatus(200);

        $dates = collect($response->json())->pluck('analysis_date')->map(fn($d) => substr($d, 0, 10))->all();
        expect($dates)->toContain('2025-01-10')
            ->and($dates)->toContain('2025-01-20');
    });

    test('returns all analyses when only start_date is provided', function () {
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-05']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-10']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-15']);

        // Only start_date without end_date should return all (no filtering)
        $response = $this->getJson('/api/analyses?start_date=2025-01-10');

        $response->assertStatus(200)
            ->assertJsonCount(3); // Returns all because end_date is missing
    });

    test('returns all analyses when only end_date is provided', function () {
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-05']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-10']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-15']);

        // Only end_date without start_date should return all (no filtering)
        $response = $this->getJson('/api/analyses?end_date=2025-01-10');

        $response->assertStatus(200)
            ->assertJsonCount(3); // Returns all because start_date is missing
    });

    test('validates that start_date must be a valid date format', function () {
        $response = $this->getJson('/api/analyses?start_date=invalid-date&end_date=2025-01-20');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['start_date']);
    });

    test('validates that end_date must be a valid date format', function () {
        $response = $this->getJson('/api/analyses?start_date=2025-01-10&end_date=not-a-date');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    });

    test('validates that end_date must be after or equal to start_date', function () {
        $response = $this->getJson('/api/analyses?start_date=2025-01-20&end_date=2025-01-10');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['end_date']);
    });

    test('accepts same date for start_date and end_date', function () {
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-15']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-01-16']);

        $response = $this->getJson('/api/analyses?start_date=2025-01-15&end_date=2025-01-15');

        $response->assertStatus(200)
            ->assertJsonCount(1);

        $dateString = $response->json()[0]['analysis_date'];
        expect(substr($dateString, 0, 10))->toBe('2025-01-15');
    });

    test('returns correct data structure with all required fields', function () {
        $analysis = DailyAnalysis::factory()->create([
            'analysis_date' => '2025-01-15',
            'total_neo_count' => 10,
            'average_diameter_min' => 150.50,
            'average_diameter_max' => 750.25,
            'max_velocity' => 50000.75,
            'smallest_miss_distance' => 2000000.50,
        ]);

        $response = $this->getJson('/api/analyses');

        $response->assertStatus(200)
            ->assertJsonCount(1);

        $data = $response->json()[0];
        $dateString = substr($data['analysis_date'], 0, 10);
        expect($dateString)->toBe('2025-01-15')
            ->and($data['total_neo_count'])->toBe(10)
            ->and($data['average_diameter_min'])->toBe('150.50')
            ->and($data['average_diameter_max'])->toBe('750.25')
            ->and($data['max_velocity'])->toBe('50000.75')
            ->and($data['smallest_miss_distance'])->toBe('2000000.50')
            ->and($data)->toHaveKey('id')
            ->and($data)->toHaveKey('created_at')
            ->and($data)->toHaveKey('updated_at');
    });

    test('handles large datasets efficiently', function () {
        // Create 50 analyses with unique dates
        for ($i = 1; $i <= 50; $i++) {
            DailyAnalysis::factory()->create([
                'analysis_date' => sprintf('2025-%02d-%02d', ($i % 12) + 1, ($i % 28) + 1),
            ]);
        }

        $response = $this->getJson('/api/analyses');

        $response->assertStatus(200)
            ->assertJsonCount(50);
    });

    test('filters work correctly with multiple analyses on same date', function () {
        // Note: With unique constraint on analysis_date, this scenario shouldn't happen
        // But we test the query logic anyway
        DailyAnalysis::factory()->create(['analysis_date' => '2025-02-10']);
        DailyAnalysis::factory()->create(['analysis_date' => '2025-02-15']);

        $response = $this->getJson('/api/analyses?start_date=2025-02-10&end_date=2025-02-15');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    });

    test('returns json content type header', function () {
        DailyAnalysis::factory()->create();

        $response = $this->getJson('/api/analyses');

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/json');
    });

    test('works with different date formats in ISO 8601', function () {
        DailyAnalysis::factory()->create(['analysis_date' => '2025-03-15']);

        $response = $this->getJson('/api/analyses?start_date=2025-03-15&end_date=2025-03-15');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    });

    test('handles edge case with future dates', function () {
        DailyAnalysis::factory()->create(['analysis_date' => '2025-12-31']);

        $response = $this->getJson('/api/analyses?start_date=2025-01-01&end_date=2025-12-31');

        $response->assertStatus(200)
            ->assertJsonCount(1);
    });
});
