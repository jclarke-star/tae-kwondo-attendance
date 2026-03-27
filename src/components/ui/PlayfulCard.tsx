import React from 'react';
import { cn } from '@/lib/utils';
interface PlayfulCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}
export function PlayfulCard({ children, className, color = 'bg-white' }: PlayfulCardProps) {
  return (
    <div className={cn('playful-card', color, className)}>
      {children}
    </div>
  );
}