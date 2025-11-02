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
        Schema::create('daily_analyses', function (Blueprint $table) {
            $table->id();
            $table->date('analysis_date')->unique();
            $table->integer('total_neo_count');
            $table->decimal('average_diameter_min', 10, 2);
            $table->decimal('average_diameter_max', 10, 2);
            $table->decimal('max_velocity', 12, 2);
            $table->decimal('smallest_miss_distance', 15, 2);
            $table->timestamps();

            $table->index('analysis_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_analyses');
    }
};
