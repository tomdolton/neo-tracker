import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/DatePicker';
import { format } from 'date-fns';
import { useAnalyses } from '@/hooks/useAnalyses';
import { AnalysesFilters } from '@/types/neo';
import { NeoChart } from '@/components/NeoChart';
import { StatCard } from '@/components/StatCard';
import { PageHeader } from '@/components/PageHeader';
import { MetricSelect } from '@/components/MetricSelect';
import { AnalysesTable } from '@/components/AnalysesTable';
import { calculateNeoStatistics } from '@/lib/neoStats';

export default function NeoAnalysis() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [filters, setFilters] = useState<AnalysesFilters | undefined>();
  const [lineMetric, setLineMetric] = useState<'smallest_miss_distance' | 'max_velocity'>('smallest_miss_distance'); // new

  const { data: analyses = [], isLoading, isError, error } = useAnalyses(filters);

  const friendlyError =
    (error as any)?.response?.data?.message ??
    (error as any)?.response?.data?.errors?.end_date?.[0] ??
    error?.message ??
    'Something went wrong';

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
      setFilters(undefined);
  };

  // Calculate summary statistics
  const { totalNeoCount, avgDiameter, maxVelocity, closestMiss } = calculateNeoStatistics(analyses);

  return (
      <>
          <Head title="NEO Analysis Dashboard" />

          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <PageHeader title="Near-Earth Objects Analysis Dashboard" />

              <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  {isError && (
                      <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          <p className="font-semibold">Error loading data</p>
                          <p className="text-sm">{friendlyError}</p>
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
                    {[
                      { title: 'Total NEO Count', value: totalNeoCount },
                      { title: 'Avg Diameter (m)', value: avgDiameter },
                      { title: 'Max Velocity (m/s)', value: maxVelocity },
                      { title: 'Closest Miss (m)', value: closestMiss },
                    ].map((s) => (
                      <StatCard key={s.title} title={s.title} value={s.value} loading={isLoading} />
                    ))}
                  </div>

                  {/* D3.js Chart Section */}
                  <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                    <div className="mb-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        NEO Analysis Over Time
                        </h2>
                        <MetricSelect value={lineMetric} onChange={setLineMetric} />
                    </div>

                    {isLoading ? (
                      <div className="flex h-96 items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">Loading chart...</span>
                      </div>
                    ) : (
                      <NeoChart data={analyses} lineMetric={lineMetric} />
                    )}
                  </div>

                    {/* Table Section */}
                    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Analysis Data Table ({analyses.length} records)
                        </h2>

                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <div className="flex h-64 items-center justify-center">
                                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                                </div>
                            ) : (
                                <AnalysesTable data={analyses as any} />
                            )}
                        </div>
                  </div>
              </main>
          </div>
      </>
  );
}
