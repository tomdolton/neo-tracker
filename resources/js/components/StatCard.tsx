import React from 'react';
import { Card } from '@/components/ui/card';

export type StatCardProps = {
  title: string;
  value: React.ReactNode;
  loading?: boolean;
};

export function StatCard({ title, value, loading }: StatCardProps) {
  return (
    <Card>
      <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {loading ? '...' : value}
      </p>
    </Card>
  );
}

export default StatCard;
