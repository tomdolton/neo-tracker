<?php

namespace Database\Factories;

use App\Models\DailyAnalysis;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DailyAnalysis>
 */
class DailyAnalysisFactory extends Factory
{
    protected $model = DailyAnalysis::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'analysis_date' => now()->addDays($this->faker->numberBetween(-30, 30))->format('Y-m-d'),
            'total_neo_count' => $this->faker->numberBetween(1, 50),
            'average_diameter_min' => $this->faker->randomFloat(2, 50, 500),
            'average_diameter_max' => $this->faker->randomFloat(2, 500, 2000),
            'max_velocity' => $this->faker->randomFloat(2, 10000, 100000),
            'smallest_miss_distance' => $this->faker->randomFloat(2, 1000000, 30000000),
        ];
    }

    /**
     * Set a specific analysis date.
     */
    public function forDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'analysis_date' => $date,
        ]);
    }
}
