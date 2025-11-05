import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg bg-white p-6 shadow dark:bg-gray-800', className)}>
      {children}
    </div>
  );
}

export default Card;
