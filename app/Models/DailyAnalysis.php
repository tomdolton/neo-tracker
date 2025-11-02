<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class DailyAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'analysis_date',
        'total_neo_count',
        'average_diameter_min',
        'average_diameter_max',
        'max_velocity',
        'smallest_miss_distance',
    ];

    protected $casts = [
        'analysis_date' => 'date',
        'average_diameter_min' => 'decimal:2',
        'average_diameter_max' => 'decimal:2',
        'max_velocity' => 'decimal:2',
        'smallest_miss_distance' => 'decimal:2',
    ];

    public function nearEarthObjects(): BelongsToMany
    {
        return $this->belongsToMany(NearEarthObject::class);
    }
}
