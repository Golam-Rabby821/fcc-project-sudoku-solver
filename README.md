# Sudoku Solver API

Node/Express service that validates and solves Sudoku puzzles. Built for the freeCodeCamp Quality Assurance certification project.

## Endpoints

- `POST /api/solve`  
  - Body: `puzzle` (81-char string, digits 1-9 and `.` for empty).  
  - Responses: `{ solution }` on success; `{ error: 'Required field missing' | 'Invalid characters in puzzle' | 'Expected puzzle to be 81 characters long' | 'Puzzle cannot be solved' }`.

- `POST /api/check`  
  - Body: `puzzle`, `coordinate` (A-I + 1-9), `value` (1-9).  
  - Responses: `{ valid: true }` when placement is allowed; `{ valid: false, conflict: ['row','column','region'] }` if blocked; same error shapes as above plus `{ error: 'Invalid coordinate' | 'Invalid value' | 'Required field(s) missing' }`.

## Run locally

```bash
npm install
npm start   # runs nodemon server.js
npm test    # runs unit + functional tests (Mocha/Chai)
```

The server defaults to `PORT=3000`. Adjust via `.env` if needed.

## Logic overview

- Input validation: length 81, only digits/periods; optional conflict check on given clues.
- Placement checks: row, column, and 3x3 region validation against current board state.
- Solver: backtracking search fills empties with valid candidates, returns solved puzzle or failure.

## Sample puzzles

See `controllers/puzzle-strings.js` for ready-made puzzles and solutions you can post to the API.
