import { BitBoard } from '../lib/game/bitboard';
import { getBestMove } from '../lib/game/minimax';
//D:\Downloads\jules_session\src\workers\ai.worker.ts
// Web Worker for offloading AI calculations
self.onmessage = (e: MessageEvent) => {
  const { grid, depth, isPlayer1AI } = e.data;

  // Convert the standard 2D grid from the frontend into our optimized BitBoard
  const board = BitBoard.fromGrid(grid);

  // Run the minimax algorithm
  const bestCol = getBestMove(board, depth, isPlayer1AI);

  // Send the result back to the main thread
  self.postMessage({ bestCol });
};
