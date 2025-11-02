import React from 'react';

export type StatCardProps = {
  title: string;
  value: React.ReactNode;
  loading?: boolean;
};

export function StatCard({ title, value, loading }: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {loading ? '...' : value}
      </p>
    </div>
  );
}

export default StatCard;
