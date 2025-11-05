import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type LineMetric = 'smallest_miss_distance' | 'max_velocity';

export interface MetricSelectProps {
  id?: string;
  label?: string;
  value: LineMetric;
  onChange: (value: LineMetric) => void;
  className?: string;
}

export function MetricSelect({ id = 'metric-select', label = 'Line metric', value, onChange, className }: MetricSelectProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Label htmlFor={id} className="text-sm text-gray-600 dark:text-gray-400">
        {label}
      </Label>
      <Select value={value} onValueChange={(v) => onChange(v as LineMetric)}>
        <SelectTrigger id={id} className="w-56">
          <SelectValue placeholder="Select metric" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="smallest_miss_distance">Closest Miss (m)</SelectItem>
          <SelectItem value="max_velocity">Max Velocity (m/s)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default MetricSelect;
