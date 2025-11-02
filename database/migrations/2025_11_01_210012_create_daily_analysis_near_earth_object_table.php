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
        Schema::create('daily_analysis_near_earth_object', function (Blueprint $table) {
            $table->id();
            $table->foreignId('daily_analysis_id')->constrained()->onDelete('cascade');
            $table->foreignId('near_earth_object_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['daily_analysis_id', 'near_earth_object_id'], 'analysis_neo_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_analysis_near_earth_object');
    }
};
