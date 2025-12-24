const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
let solver;

suite('Unit Tests', () => {
  before(() => {
    solver = new Solver();
  });

  test('Logic handles a valid puzzle string of 81 characters', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const result = solver.validate(puzzle);
    assert.isTrue(result.valid);
  });

  test('Logic handles a puzzle string with invalid characters', () => {
    const result = solver.validate('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37@');
    assert.isFalse(result.valid);
    assert.equal(result.error, 'Invalid characters in puzzle');
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const result = solver.validate('1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.3');
    assert.isFalse(result.valid);
    assert.equal(result.error, 'Expected puzzle to be 81 characters long');
  });

  test('Logic handles a valid row placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const row = 0; // A
    const col = 1; // 2nd column currently '.'
    assert.isTrue(solver.checkRowPlacement(puzzle, row, col, '3'));
  });

  test('Logic handles an invalid row placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const row = 0; // A
    const col = 1;
    assert.isFalse(solver.checkRowPlacement(puzzle, row, col, '1'));
  });

  test('Logic handles a valid column placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const row = 1; // B
    const col = 0; // first column
    assert.isTrue(solver.checkColPlacement(puzzle, row, col, '6'));
  });

  test('Logic handles an invalid column placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const row = 1;
    const col = 0;
    assert.isFalse(solver.checkColPlacement(puzzle, row, col, '1'));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const row = 1; // B
    const col = 1; // inside top-left box
    assert.isTrue(solver.checkRegionPlacement(puzzle, row, col, '3'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    const puzzle = puzzlesAndSolutions[0][0];
    const row = 1;
    const col = 1;
    assert.isFalse(solver.checkRegionPlacement(puzzle, row, col, '1'));
  });

  test('Valid puzzle strings pass the solver', () => {
    const [puzzle, solution] = puzzlesAndSolutions[0];
    const result = solver.solve(puzzle);
    assert.isString(result);
    assert.equal(result, solution);
  });

  test('Invalid puzzle strings fail the solver', () => {
    const invalid = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37@';
    const result = solver.solve(invalid);
    assert.isFalse(result);
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const [puzzle, solution] = puzzlesAndSolutions[1];
    const result = solver.solve(puzzle);
    assert.equal(result, solution);
  });
});
