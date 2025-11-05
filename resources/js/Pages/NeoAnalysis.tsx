import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { format } from 'date-fns';

import { Card } from '@/components/ui/card';
import { NeoChart } from '@/components/NeoAnalysis/NeoChart';
import { StatCard } from '@/components/NeoAnalysis/StatCard';
import { PageHeader } from '@/components/NeoAnalysis/PageHeader';
import { MetricSelect } from '@/components/NeoAnalysis/MetricSelect';
import { AnalysesTable } from '@/components/NeoAnalysis/AnalysesTable';
import { ErrorAlert } from '@/components/NeoAnalysis/ErrorAlert';
import { DateRangeFilter } from '@/components/NeoAnalysis/DateRangeFilter';

import { useAnalyses } from '@/hooks/useAnalyses';
import { calculateNeoStatistics } from '@/lib/neoStats';
import type { AnalysesFilters } from '@/types/neo';

export default function NeoAnalysis() {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [filters, setFilters] = useState<AnalysesFilters | undefined>();
  const [lineMetric, setLineMetric] = useState<'smallest_miss_distance' | 'max_velocity'>('smallest_miss_distance');

  // Fetch analyses data with applied filters
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
                  {isError && <ErrorAlert error={error} />}

                  <DateRangeFilter
                      startDate={startDate}
                      endDate={endDate}
                      onStartDateChange={setStartDate}
                      onEndDateChange={setEndDate}
                      onFilter={handleFilter}
                      onClear={handleClear}
                      isLoading={isLoading}
                  />

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
                  <Card className="mb-8">
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
                  </Card>

                    {/* Table Section */}
                    <Card>
                        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Analysis Data Table ({analyses.length} records)
                        </h2>

                        <div className="overflow-x-auto">
                            {isLoading ? (
                                <div className="flex h-64 items-center justify-center">
                                    <span className="text-gray-500 dark:text-gray-400">Loading...</span>
                                </div>
                            ) : (
                                <AnalysesTable data={analyses} />
                            )}
                        </div>
                  </Card>
              </main>
          </div>
      </>
  );
}
