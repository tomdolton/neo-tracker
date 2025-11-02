<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DailyAnalysis;
use Illuminate\Http\JsonResponse;

class NeoController extends Controller
{
    /**
     * Get all analysis data with optional date range filtering
     */
    public function getAnalyses(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = DailyAnalysis::query();

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('analysis_date', [
                $request->start_date,
                $request->end_date
            ]);
        }

        $analyses = $query->orderBy('analysis_date', 'desc')->get();

        return response()->json($analyses);
    }
}
