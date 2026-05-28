import React, { useState } from 'react';
import { Chip } from './Chip';
import { cn } from '@/lib/utils';

interface BoardProps {
  grid: number[][]; // 6 rows, 7 cols
  winningCells?: { row: number; col: number }[];
  onColumnClick?: (col: number) => void;
  disabled?: boolean;
}

export function Board({ grid, winningCells = [], onColumnClick, disabled = false }: BoardProps) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const isWinningCell = (row: number, col: number) => {
    return winningCells.some((cell) => cell.row === row && cell.col === col);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-900/80 dark:to-blue-900/80 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_4px_10px_rgba(255,255,255,0.5)] max-w-full overflow-hidden border-4 border-white/40 dark:border-white/10 backdrop-blur-md">
      <div className="grid grid-cols-7 gap-3 md:gap-4 relative">
        {/* Hover Highlight Overlay */}
        {hoveredCol !== null && !disabled && (
          <div
            className="absolute top-[-10px] bottom-[-10px] bg-white/20 dark:bg-white/5 rounded-2xl pointer-events-none transition-all duration-300 ease-out"
            style={{
              left: `calc(${hoveredCol * (100 / 7)}% + 4px)`,
              width: `calc(${100 / 7}% - 8px)`
            }}
          />
        )}

        {grid.map((row, rIndex) =>
          row.map((cell, cIndex) => (
            <div
              key={`cell-${rIndex}-${cIndex}`}
              className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 cursor-pointer relative z-10 transition-transform duration-200",
                !disabled && hoveredCol === cIndex && "scale-105"
              )}
              onClick={() => {
                if (!disabled && onColumnClick) {
                  onColumnClick(cIndex);
                }
              }}
              onMouseEnter={() => setHoveredCol(cIndex)}
              onMouseLeave={() => setHoveredCol(null)}
            >
              <Chip player={cell} isWinning={isWinningCell(rIndex, cIndex)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
