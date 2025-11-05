import { Card } from '@/components/ui/card';

export interface StatCardProps {
  title: string;
  value: number;
  loading?: boolean;
}

export function StatCard({ title, value, loading }: StatCardProps) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {loading ? '...' : value.toLocaleString()}
      </p>
    </Card>
  );
}

export default StatCard;
