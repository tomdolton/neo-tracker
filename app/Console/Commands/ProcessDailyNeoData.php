<?php

namespace App\Console\Commands;

use App\Services\NeoDataService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessDailyNeoData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'neo:process-daily {date? : The date to process (Y-m-d format). Defaults to yesterday}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch, store, and analyse NEO data for a specific date';

    /**
     * Execute the console command.
     */
    public function handle(NeoDataService $neoDataService): int
    {
        $date = $this->argument('date') ?? now()->subDay()->format('Y-m-d');

        // Validate date format
        if (!$this->isValidDate($date)) {
            $this->error("Invalid date format. Please use Y-m-d format (e.g., 2025-11-01)");
            return self::FAILURE;
        }

        $this->info("Processing NEO data for date: {$date}");
        $this->newLine();

        try {
            // Show progress
            $this->info("Fetching data from NASA API");

            $result = $neoDataService->processNeoDataForDate($date);

            $this->newLine();

            if ($result['success']) {
                $this->info("Processing completed successfully!");
                $this->newLine();

                // Display summary
                $this->table(
                    ['Metric', 'Value'],
                    [
                        ['Date', $result['date']],
                        ['NEOs Stored', $result['neos_stored']],
                        ['Total Count', $result['analysis']->total_neo_count ?? 'N/A'],
                        ['Avg Diameter (min)', $result['analysis']->average_diameter_min ?? 'N/A'],
                        ['Avg Diameter (max)', $result['analysis']->average_diameter_max ?? 'N/A'],
                        ['Max Velocity', $result['analysis']->max_velocity ?? 'N/A'],
                        ['Smallest Miss Distance', $result['analysis']->smallest_miss_distance ?? 'N/A'],
                    ]
                );

                Log::info('Daily NEO processing completed', [
                    'date' => $date,
                    'neos_stored' => $result['neos_stored'],
                ]);

                return self::SUCCESS;
            }

            $this->warn($result['message'] ?? 'Processing completed with warnings');
            return self::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to process NEO data: {$e->getMessage()}");
            $this->newLine();

            if ($this->option('verbose')) {
                $this->error($e->getTraceAsString());
            }

            Log::error('Daily NEO processing failed', [
                'date' => $date,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return self::FAILURE;
        }
    }

    /**
     * Validate date format
     */
    private function isValidDate(string $date): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}
