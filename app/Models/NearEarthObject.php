<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NearEarthObject extends Model
{
    use HasFactory;

    protected $fillable = [
        'neo_reference_id',
        'name',
        'estimated_diameter_min',
        'estimated_diameter_max',
        'is_hazardous',
        'absolute_magnitude',
        'miss_distance',
        'relative_velocity',
        'close_approach_date',
    ];

    protected $casts = [
        'is_hazardous' => 'boolean',
        'close_approach_date' => 'date',
        'estimated_diameter_min' => 'decimal:2',
        'estimated_diameter_max' => 'decimal:2',
        'absolute_magnitude' => 'decimal:2',
        'miss_distance' => 'decimal:2',
        'relative_velocity' => 'decimal:2',
    ];

    public function dailyAnalyses(): BelongsToMany
    {
        return $this->belongsToMany(DailyAnalysis::class)
            ->withTimestamps();
    }
}
