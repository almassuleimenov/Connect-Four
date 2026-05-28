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
        // Empty slot - soft inset shadow to look like a friendly hole
        player === 0 && 'bg-white/40 dark:bg-gray-800/40 shadow-[inset_0_4px_8px_rgba(0,0,0,0.1)] border-2 border-white/20',

        // Player 1 (Red) - 3D candy effect
        player === 1 && 'bg-gradient-to-br from-pink-300 to-rose-400 shadow-[0_4px_8px_rgba(244,63,94,0.4),inset_0_4px_4px_rgba(255,255,255,0.6)] animate-in zoom-in spin-in-12 duration-500 border-b-4 border-rose-500',

        // Player 2 (Yellow) - 3D candy effect
        player === 2 && 'bg-gradient-to-br from-yellow-200 to-amber-400 shadow-[0_4px_8px_rgba(251,191,36,0.4),inset_0_4px_4px_rgba(255,255,255,0.6)] animate-in zoom-in spin-in-12 duration-500 border-b-4 border-amber-500',

        // Winning animation - joyful bounce and pulse
        isWinning && 'ring-4 ring-white/80 animate-[bounce_1s_infinite,pulse_2s_infinite]',
        className
      )}
    >
      {/* Tiny highlight to make it look shiny and cute */}
      {player !== 0 && (
        <div className="absolute top-1 left-2 sm:top-2 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full opacity-60"></div>
      )}
    </div>
  );
}
