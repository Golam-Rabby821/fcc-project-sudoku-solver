'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body || {};

      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const valueStr = String(value);
      if (!/^[1-9]$/.test(valueStr)) {
        return res.json({ error: 'Invalid value' });
      }

      if (
        typeof coordinate !== 'string' ||
        coordinate.length !== 2 ||
        !/^[A-Ia-i][1-9]$/.test(coordinate)
      ) {
        return res.json({ error: 'Invalid coordinate' });
      }

      const validation = solver.validate(puzzle);
      if (!validation.valid) {
        return res.json({ error: validation.error });
      }

      const row = coordinate.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
      const column = parseInt(coordinate[1], 10) - 1;

      const conflicts = [];
      if (!solver.checkRowPlacement(puzzle, row, column, valueStr)) conflicts.push('row');
      if (!solver.checkColPlacement(puzzle, row, column, valueStr)) conflicts.push('column');
      if (!solver.checkRegionPlacement(puzzle, row, column, valueStr)) conflicts.push('region');

      if (conflicts.length) {
        return res.json({ valid: false, conflict: conflicts });
      }

      return res.json({ valid: true });
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body || {};
      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const validation = solver.validate(puzzle, { checkConflicts: true });
      if (!validation.valid && validation.error !== 'Puzzle cannot be solved') {
        return res.json({ error: validation.error });
      }

      const solution = solver.solve(puzzle);
      if (!solution) {
        return res.json({ error: 'Puzzle cannot be solved' });
      }

      return res.json({ solution });
    });
};
