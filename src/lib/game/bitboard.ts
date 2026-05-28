// Connect Four Bitboard Implementation
// Board is 7 columns x 6 rows
// Using 64-bit integer, we represent the board as a bitboard where each column is separated by an extra bit to prevent false positive matches
// Each column takes 7 bits (6 rows + 1 padding bit), so 7 columns take 49 bits, which fits nicely in a BigInt (or a standard number up to 53 bits, but BigInt is safer for bitwise logic).
// Layout:
// 6 13 20 27 34 41 48 (padding row to prevent horizontal wrap-around wins)
// 5 12 19 26 33 40 47
// 4 11 18 25 32 39 46
// 3 10 17 24 31 38 45
// 2  9 16 23 30 37 44
// 1  8 15 22 29 36 43
// 0  7 14 21 28 35 42

export const ROWS = 6;
export const COLS = 7;
export const WIN_LENGTH = 4;

export class BitBoard {
  public player1: bigint; // Represents player 1 (red)
  public player2: bigint; // Represents player 2 (yellow)
  public heights: number[]; // Next available row for each column
  public moves: number;
//D:\Downloads\jules_session\src\lib\game\bitboard.ts
  constructor() {
    this.player1 = 0n;
    this.player2 = 0n;
    this.heights = [0, 7, 14, 21, 28, 35, 42]; // Initial bit indices for each column
    this.moves = 0;
  }

  public clone(): BitBoard {
    const clone = new BitBoard();
    clone.player1 = this.player1;
    clone.player2 = this.player2;
    clone.heights = [...this.heights];
    clone.moves = this.moves;
    return clone;
  }

  public canPlay(col: number): boolean {
    // Check if the top bit of the column is set
    // The top row is at offset 5 (0-indexed). The padding row is at offset 6.
    // If the height reaches the padding row, the column is full.
    // col * 7 is the bottom, so (col * 7) + 6 is the padding row.
    const topRowMask = 1n << BigInt(col * 7 + 5);
    const mask = this.player1 | this.player2;
    return (mask & topRowMask) === 0n;
  }

  public play(col: number, isPlayer1: boolean): void {
    if (!this.canPlay(col)) return;

    const moveMask = 1n << BigInt(this.heights[col]++);
    if (isPlayer1) {
      this.player1 |= moveMask;
    } else {
      this.player2 |= moveMask;
    }
    this.moves++;
  }

  public checkWin(isPlayer1: boolean): boolean {
    const board = isPlayer1 ? this.player1 : this.player2;

    // Horizontal check (shift by 7)
    let m = board & (board >> 7n);
    if ((m & (m >> 14n)) !== 0n) return true;

    // Vertical check (shift by 1)
    m = board & (board >> 1n);
    if ((m & (m >> 2n)) !== 0n) return true;

    // Diagonal \ (shift by 6)
    m = board & (board >> 6n);
    if ((m & (m >> 12n)) !== 0n) return true;

    // Diagonal / (shift by 8)
    m = board & (board >> 8n);
    if ((m & (m >> 16n)) !== 0n) return true;

    return false;
  }

  public isDraw(): boolean {
    return this.moves === ROWS * COLS && !this.checkWin(true) && !this.checkWin(false);
  }

  public getValidMoves(): number[] {
    const validMoves: number[] = [];
    // Order moves from center outwards for better alpha-beta pruning
    const columnOrder = [3, 2, 4, 1, 5, 0, 6];
    for (const col of columnOrder) {
      if (this.canPlay(col)) {
        validMoves.push(col);
      }
    }
    return validMoves;
  }

  // Convert 2D grid to BitBoard
  public static fromGrid(grid: number[][]): BitBoard {
    const bb = new BitBoard();
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        // Grid usually is r=0 at top, so we reverse it or just assume standard
        // Let's assume grid[r][c] where r=0 is top, r=5 is bottom
        // Bitboard is r=0 is bottom, r=5 is top
        const player = grid[r][c];
        if (player !== 0) {
            // Find the correct bit index. In our grid, row 5 is bottom (index 0 for bitboard)
            const bitIndex = BigInt(c * 7 + (5 - r));
            if (player === 1) {
                bb.player1 |= (1n << bitIndex);
            } else if (player === 2) {
                bb.player2 |= (1n << bitIndex);
            }
        }
      }
    }
    
    // Recalculate heights
    for (let c = 0; c < COLS; c++) {
        let height = c * 7;
        const mask = bb.player1 | bb.player2;
        while ((mask & (1n << BigInt(height))) !== 0n && height < c * 7 + 6) {
            height++;
        }
        bb.heights[c] = height;
    }
    
    // Recalculate moves
    let moves = 0;
    const mask = bb.player1 | bb.player2;
    for(let i=0; i<49; i++) {
        if((mask & (1n << BigInt(i))) !== 0n) moves++;
    }
    bb.moves = moves;

    return bb;
  }
}
