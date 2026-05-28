import React from 'react';
import { cn } from '@/lib/utils';
//D:\Downloads\jules_session\src\components\Chip.tsx
interface ChipProps {
  player: number; // 0 = empty, 1 = player 1, 2 = player 2
  isWinning?: boolean;
  className?: string;
}

export function Chip({ player, isWinning, className }: ChipProps) {
  return (
    <div
      className={cn(
        'w-full h-full rounded-full flex items-center justify-center transition-all duration-300 ease-in-out',
        player === 0 && 'bg-white dark:bg-gray-800 shadow-inner',
        player === 1 && 'bg-pastel-red shadow-md',
        player === 2 && 'bg-pastel-yellow shadow-md',
        isWinning && 'ring-4 ring-pastel-purple ring-opacity-50 animate-pulse',
        className
      )}
    />
  );
}
