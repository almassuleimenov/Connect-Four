import { useReducer, useCallback } from 'react';

type Player = 1 | 2;
type Cell = 0 | 1 | 2;
type Grid = Cell[][];

interface GameState {
  grid: Grid;
  currentPlayer: Player;
  winner: number | null; // 1, 2, or 3 for draw
  winningCells: { row: number; col: number }[];
  history: number[]; // Array of columns played
  isThinking: boolean;
}

type GameAction =
  | { type: 'PLAY_MOVE'; col: number }
  | { type: 'SET_THINKING'; isThinking: boolean }
  | { type: 'RESET' };

const createEmptyGrid = (): Grid => Array.from({ length: 6 }, () => Array(7).fill(0));

const initialState: GameState = {
  grid: createEmptyGrid(),
  currentPlayer: 1, // Player 1 always starts
  winner: null,
  winningCells: [],
  history: [],
  isThinking: false,
};

// Simple check win function for the frontend grid to show highlights
function checkWin(grid: Grid, player: Player): { isWin: boolean; cells: { row: number; col: number }[] } {
  const rows = 6;
  const cols = 7;

  // Horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 3; c++) {
      if (grid[r][c] === player && grid[r][c + 1] === player && grid[r][c + 2] === player && grid[r][c + 3] === player) {
        return { isWin: true, cells: [{ row: r, col: c }, { row: r, col: c + 1 }, { row: r, col: c + 2 }, { row: r, col: c + 3 }] };
      }
    }
  }
  // Vertical
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === player && grid[r + 1][c] === player && grid[r + 2][c] === player && grid[r + 3][c] === player) {
        return { isWin: true, cells: [{ row: r, col: c }, { row: r + 1, col: c }, { row: r + 2, col: c }, { row: r + 3, col: c }] };
      }
    }
  }
  // Diagonal \
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 0; c < cols - 3; c++) {
      if (grid[r][c] === player && grid[r + 1][c + 1] === player && grid[r + 2][c + 2] === player && grid[r + 3][c + 3] === player) {
        return { isWin: true, cells: [{ row: r, col: c }, { row: r + 1, col: c + 1 }, { row: r + 2, col: c + 2 }, { row: r + 3, col: c + 3 }] };
      }
    }
  }
  // Diagonal /
  for (let r = 0; r < rows - 3; r++) {
    for (let c = 3; c < cols; c++) {
      if (grid[r][c] === player && grid[r + 1][c - 1] === player && grid[r + 2][c - 2] === player && grid[r + 3][c - 3] === player) {
        return { isWin: true, cells: [{ row: r, col: c }, { row: r + 1, col: c - 1 }, { row: r + 2, col: c - 2 }, { row: r + 3, col: c - 3 }] };
      }
    }
  }

  return { isWin: false, cells: [] };
}

function checkDraw(grid: Grid): boolean {
  return grid[0].every(cell => cell !== 0);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLAY_MOVE': {
      if (state.winner !== null || state.isThinking) return state;

      const { col } = action;
      // Find lowest empty row in col
      let targetRow = -1;
      for (let r = 5; r >= 0; r--) {
        if (state.grid[r][col] === 0) {
          targetRow = r;
          break;
        }
      }

      if (targetRow === -1) return state; // Column full

      const newGrid = state.grid.map(row => [...row]);
      newGrid[targetRow][col] = state.currentPlayer;

      const winResult = checkWin(newGrid, state.currentPlayer);
      let newWinner = null;
      let newWinningCells: {row: number, col: number}[] = [];

      if (winResult.isWin) {
        newWinner = state.currentPlayer;
        newWinningCells = winResult.cells;
      } else if (checkDraw(newGrid)) {
        newWinner = 3; // Draw
      }

      return {
        ...state,
        grid: newGrid,
        currentPlayer: state.currentPlayer === 1 ? 2 : 1,
        winner: newWinner,
        winningCells: newWinningCells,
        history: [...state.history, col],
      };
    }
    case 'SET_THINKING':
      return { ...state, isThinking: action.isThinking };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const playMove = useCallback((col: number) => {
    dispatch({ type: 'PLAY_MOVE', col });
  }, []);

  const setThinking = useCallback((isThinking: boolean) => {
    dispatch({ type: 'SET_THINKING', isThinking });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    playMove,
    setThinking,
    resetGame,
  };
}
