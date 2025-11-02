import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { format } from 'date-fns';
import { useAnalyses } from '@/hooks/useAnalyses';
import { AnalysesFilters } from '@/types/neo';

export default function NeoAnalysis() {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [filters, setFilters] = useState<AnalysesFilters | undefined>();

    // Use the custom hook
    const { data: analyses = [], isLoading, isError, error } = useAnalyses(filters);

    const handleFilter = () => {
        if (startDate && endDate) {
            setFilters({
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
            });
        }
    };

    const handleClear = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        setFilters(undefined); // This will refetch all data
    };

    // Calculate summary statistics
    const totalNeoCount = analyses.reduce((sum, a) => sum + a.total_neo_count, 0);
    const avgDiameter = analyses.length > 0
        ? (analyses.reduce((sum, a) => sum + (Number(a.average_diameter_min) + Number(a.average_diameter_max)) / 2, 0) / analyses.length).toFixed(2)
        : '0';
    const maxVelocity = analyses.length > 0
        ? Math.max(...analyses.map(a => Number(a.max_velocity))).toFixed(2)
        : '0';
    const closestMiss = analyses.length > 0
        ? Math.min(...analyses.map(a => Number(a.smallest_miss_distance))).toFixed(2)
        : '0';

    return (
        <>
            <Head title="NEO Analysis Dashboard" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Near-Earth Objects Analysis Dashboard
                        </h1>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Error State */}
                    {isError && (
                        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <p className="font-semibold">Error loading data</p>
                            <p className="text-sm">{error?.message || 'Something went wrong'}</p>
                        </div>
                    )}

                    {/* Date Range Filter */}
                    <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Filter by Date Range
                        </h2>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <Label htmlFor="start-date" className="mb-2">
                                    Start Date
                                </Label>
                                <DatePicker
                                    date={startDate}
                                    onSelect={setStartDate}
                                    placeholder="Select start date"
                                />
                            </div>

                            <div className="flex-1">
                                <Label htmlFor="end-date" className="mb-2">
                                    End Date
                                </Label>
                                <DatePicker
                                    date={endDate}
                                    onSelect={setEndDate}
                                    placeholder="Select end date"
                                />
                            </div>

                            <Button
                                onClick={handleFilter}
                                disabled={!startDate || !endDate || isLoading}
                                className="w-full sm:w-32"
                            >
                                {isLoading ? 'Loading...' : 'Filter'}
                            </Button>

                            <Button
                                onClick={handleClear}
                                variant="outline"
                                disabled={isLoading}
                                className="w-full sm:w-32"
                            >
                                Clear
                            </Button>
                        </div>
                    </div>

                    {/* Statistics Summary Cards */}
                    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total NEO Count
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {isLoading ? '...' : totalNeoCount}
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Avg Diameter (m)
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {isLoading ? '...' : avgDiameter}
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Max Velocity (m/s)
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {isLoading ? '...' : maxVelocity}
                            </p>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                            <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                                Closest Miss (m)
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {isLoading ? '...' : closestMiss}
                            </p>
                        </div>
                    </div>

                    {/* D3.js Chart Section */}
                    <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                            NEO Analysis Over Time
                        </h2>
                        <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                            <span className="text-gray-500 dark:text-gray-400">
                                {isLoading ? 'Loading...' : `D3.js Chart Component (${analyses.length} records)`}
                            </span>
                        </div>
                    </div>

                    {/* Data Table Section */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Analysis Data Table ({analyses.length} records)
                        </h2>
                        <div className="overflow-x-auto">
                            <div className="h-64 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                                {isLoading && (
                                    <div className="flex h-full items-center justify-center">
                                        <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
