<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('near_earth_objects', function (Blueprint $table) {
            $table->id();
            $table->string('neo_reference_id');
            $table->string('name');
            $table->decimal('estimated_diameter_min', 10, 2);
            $table->decimal('estimated_diameter_max', 10, 2);
            $table->boolean('is_hazardous')->default(false);
            $table->decimal('absolute_magnitude', 10, 2);
            $table->decimal('miss_distance', 15, 2);
            $table->decimal('relative_velocity', 12, 2);
            $table->date('close_approach_date');
            $table->timestamps();

            $table->unique(['neo_reference_id', 'close_approach_date']);

            $table->index('close_approach_date');
            $table->index('neo_reference_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('near_earth_objects');
    }
};
