class SudokuSolver {

  validate(puzzleString, { checkConflicts = false } = {}) {
    if (typeof puzzleString !== 'string') {
      return { valid: false, error: 'Required field missing' };
    }

    if (/[^1-9.]/.test(puzzleString)) {
      return { valid: false, error: 'Invalid characters in puzzle' };
    }

    if (puzzleString.length !== 81) {
      return { valid: false, error: 'Expected puzzle to be 81 characters long' };
    }

    if (checkConflicts) {
      const board = puzzleString.split('');
      for (let i = 0; i < 81; i++) {
        const val = board[i];
        if (val === '.') continue;
        const row = Math.floor(i / 9);
        const col = i % 9;
        if (
          !this.checkRowPlacement(board, row, col, val) ||
          !this.checkColPlacement(board, row, col, val) ||
          !this.checkRegionPlacement(board, row, col, val)
        ) {
          return { valid: false, error: 'Puzzle cannot be solved' };
        }
      }
    }

    return { valid: true };
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const board = Array.isArray(puzzleString) ? puzzleString : puzzleString.split('');
    for (let c = 0; c < 9; c++) {
      if (c === column) continue;
      if (board[row * 9 + c] === value) return false;
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const board = Array.isArray(puzzleString) ? puzzleString : puzzleString.split('');
    for (let r = 0; r < 9; r++) {
      if (r === row) continue;
      if (board[r * 9 + column] === value) return false;
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const board = Array.isArray(puzzleString) ? puzzleString : puzzleString.split('');
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(column / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (r === row && c === column) continue;
        if (board[r * 9 + c] === value) return false;
      }
    }
    return true;
  }

  solve(puzzleString) {
    const validation = this.validate(puzzleString, { checkConflicts: true });
    if (!validation.valid) return false;

    const board = puzzleString.split('');

    const backtrack = () => {
      const emptyIndex = board.indexOf('.');
      if (emptyIndex === -1) return true;

      const row = Math.floor(emptyIndex / 9);
      const col = emptyIndex % 9;

      for (let num = 1; num <= 9; num++) {
        const val = String(num);
        if (
          this.checkRowPlacement(board, row, col, val) &&
          this.checkColPlacement(board, row, col, val) &&
          this.checkRegionPlacement(board, row, col, val)
        ) {
          board[emptyIndex] = val;
          if (backtrack()) return true;
          board[emptyIndex] = '.';
        }
      }

      return false;
    };

    return backtrack() ? board.join('') : false;
  }
}

module.exports = SudokuSolver;

