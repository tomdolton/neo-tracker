<?php

use App\Http\Controllers\Api\NeoController;
use Illuminate\Support\Facades\Route;

// Analysis endpoint
// Complete list: GET /api/analyses
// By date range: GET /api/analyses?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
Route::get('/analyses', [NeoController::class, 'getAnalyses'])
    ->name('api.analyses.index');
