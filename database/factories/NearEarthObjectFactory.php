<?php

namespace Database\Factories;

use App\Models\NearEarthObject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NearEarthObject>
 */
class NearEarthObjectFactory extends Factory
{
    protected $model = NearEarthObject::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'neo_reference_id' => $this->faker->unique()->bothify('#######'),
            'name' => $this->faker->bothify('??####') . ' ' . $this->faker->lastName(),
            'estimated_diameter_min' => $this->faker->randomFloat(2, 10, 500),
            'estimated_diameter_max' => $this->faker->randomFloat(2, 500, 2000),
            'is_hazardous' => $this->faker->boolean(30), // 30% chance of being hazardous
            'absolute_magnitude' => $this->faker->randomFloat(2, 15, 30),
            'miss_distance' => $this->faker->randomFloat(2, 1000000, 50000000), // meters
            'relative_velocity' => $this->faker->randomFloat(2, 5000, 100000), // meters per second
            'close_approach_date' => now()->addDays($this->faker->numberBetween(-30, 30))->format('Y-m-d'),
        ];
    }

    /**
     * Indicate that the NEO is hazardous.
     */
    public function hazardous(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_hazardous' => true,
        ]);
    }

    /**
     * Indicate that the NEO is not hazardous.
     */
    public function safe(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_hazardous' => false,
        ]);
    }

    /**
     * Set a specific close approach date.
     */
    public function onDate(string $date): static
    {
        return $this->state(fn (array $attributes) => [
            'close_approach_date' => $date,
        ]);
    }
}
