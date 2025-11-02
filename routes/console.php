<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule daily NEO data processing
Schedule::command('neo:process-daily')
    ->dailyAt(config('neo.processing_time', '03:00'))
    ->timezone(config('neo.timezone', 'UTC'))
    ->withoutOverlapping()
    ->runInBackground()
    ->onSuccess(function () {
        \Illuminate\Support\Facades\Log::info('Scheduled NEO processing completed successfully', [
            'timestamp' => now()->toDateTimeString(),
        ]);
    })
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('Scheduled NEO processing failed', [
            'timestamp' => now()->toDateTimeString(),
        ]);
    });
