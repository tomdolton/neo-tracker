import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/DatePicker';

interface DateRangeFilterProps {
    startDate: Date | undefined;
    endDate: Date | undefined;
    onStartDateChange: (date: Date | undefined) => void;
    onEndDateChange: (date: Date | undefined) => void;
    onFilter: () => void;
    onClear: () => void;
    isLoading?: boolean;
}


// UI for selecting and filtering by date range.
export function DateRangeFilter({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onFilter,
    onClear,
    isLoading = false,
}: DateRangeFilterProps) {
    return (
        <Card className="mb-8">
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
                        onSelect={onStartDateChange}
                        placeholder="Select start date"
                    />
                </div>

                <div className="flex-1">
                    <Label htmlFor="end-date" className="mb-2">
                        End Date
                    </Label>
                    <DatePicker
                        date={endDate}
                        onSelect={onEndDateChange}
                        placeholder="Select end date"
                    />
                </div>

                <Button
                    onClick={onFilter}
                    disabled={!startDate || !endDate || isLoading}
                    className="w-full sm:w-32"
                >
                    {isLoading ? 'Loading...' : 'Filter'}
                </Button>

                <Button
                    onClick={onClear}
                    variant="outline"
                    disabled={isLoading}
                    className="w-full sm:w-32"
                >
                    Clear
                </Button>
            </div>
        </Card>
    );
}
