import React from 'react';
import { Chip } from './Chip';
//D:\Downloads\jules_session\src\components\Board.tsx
interface BoardProps {
  grid: number[][]; // 6 rows, 7 cols
  winningCells?: { row: number; col: number }[];
  onColumnClick?: (col: number) => void;
  disabled?: boolean;
}

export function Board({ grid, winningCells = [], onColumnClick, disabled = false }: BoardProps) {
  const isWinningCell = (row: number, col: number) => {
    return winningCells.some((cell) => cell.row === row && cell.col === col);
  };

  return (
    <div className="bg-pastel-blue p-4 rounded-xl shadow-lg max-w-full overflow-hidden">
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {grid.map((row, rIndex) =>
          row.map((cell, cIndex) => (
            <div
              key={`cell-${rIndex}-${cIndex}`}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 cursor-pointer relative"
              onClick={() => {
                if (!disabled && onColumnClick) {
                  onColumnClick(cIndex);
                }
              }}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10" />
              <Chip player={cell} isWinning={isWinningCell(rIndex, cIndex)} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
