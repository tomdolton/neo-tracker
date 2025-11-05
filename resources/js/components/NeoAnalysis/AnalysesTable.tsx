import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { DailyAnalysis } from '@/types/neo';

export interface AnalysesTableProps {
  data: DailyAnalysis[];
  className?: string;
}


export function AnalysesTable({ data, className }: AnalysesTableProps) {
  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Date</TableHead>
            <TableHead className="whitespace-nowrap text-right">NEO Count</TableHead>
            <TableHead className="whitespace-nowrap text-right">Avg Diameter Min (m)</TableHead>
            <TableHead className="whitespace-nowrap text-right">Avg Diameter Max (m)</TableHead>
            <TableHead className="whitespace-nowrap text-right">Max Velocity (m/s)</TableHead>
            <TableHead className="whitespace-nowrap text-right">Closest Miss (m)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                No analysis records found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{format(new Date(row.analysis_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-right">{row.total_neo_count}</TableCell>
                <TableCell className="text-right">{row.average_diameter_min}</TableCell>
                <TableCell className="text-right">{row.average_diameter_max}</TableCell>
                <TableCell className="text-right">{row.max_velocity}</TableCell>
                <TableCell className="text-right">{row.smallest_miss_distance}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default AnalysesTable;
