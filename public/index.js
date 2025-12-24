// DOM Elements
const textArea = document.getElementById("text-input");
const coordInput = document.getElementById("coord");
const valInput = document.getElementById("val");
const errorMsg = document.getElementById("error-msg");
const solveBtn = document.getElementById("solve-button");
const checkBtn = document.getElementById("check-button");
const clearBtn = document.getElementById("clear-button");
const randomBtn = document.getElementById("random-button");

// Collection of sudoku puzzles (easy to hard)
const puzzleCollection = [
	// Easy puzzles
	"..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
	"53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79",
	"6..3.2....5.....1.2.7.5.9.4...1.8.7..74..9....8..6..3....4.5.2.6..7.3.8..2....4..",
	"..3.2.6..9..3.5..1..18.64....81.29..7.......8..67.82....26.95..8..2.3..9..5.1.3..",

	// Medium puzzles
	".....6....59.....82....8....45........3........6..3.54...325..6..................",
	"4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......",
	"2.......4....1.9...8.....5..6..3...2...8..1.....9...6...7..3...5.....4..2....8...",
	"85...24..72......9..4.........1.7..23.5...9...4...........8..7..17..........36.4.",

	// Hard puzzles
	"..53.....8......2..7..1.5..4....53...1..7...6..32...8..6.5....9..4....3......97..",
	"12.3....435....1....4........54..2..6...7.........8.9...31..5.......9.7.....6...8",
	".....9.7...42.18....7.....4...2.8..1.5.........6.1.....3.....6....25.71..6..8....",
	"1....7.9..3..2...8..96..5....53..9...1..8...26....4...3......1..4......7..7...3..",

	// Expert puzzles
	"...5.1...3...4..2...6..8..4...9.6...2.......7.3.......8...1..5...3.2...9.....7...",
	"....1...9..5....8....4...7....8.3....2.......5.9....1...6.....4...3.8..7.........",
	".......2.4.8..1.....6..3.......4.....2...6..7...1.....5.......8.7....2...9...3...",
	"........6.5.3...1.7..2.9..4.....6.8..3......5..1.......9.1..8..4...7.2...2.......",
];

// Store initial puzzle for reset
let initialPuzzle = puzzleCollection[0];

// Initialize with random puzzle on page load
document.addEventListener("DOMContentLoaded", () => {
	loadRandomPuzzle();
});

// Update grid when textarea changes
textArea.addEventListener("input", () => {
	fillPuzzle(textArea.value);
	clearError();
	// Update initial puzzle when user manually changes it
	if (textArea.value.length === 81) {
		initialPuzzle = textArea.value;
	}
});

// Clear error when inputs change
coordInput.addEventListener("input", clearError);
valInput.addEventListener("input", clearError);

/**
 * Load a random puzzle from the collection
 */
function loadRandomPuzzle() {
	const randomIndex = Math.floor(Math.random() * puzzleCollection.length);
	initialPuzzle = puzzleCollection[randomIndex];
	textArea.value = initialPuzzle;
	fillPuzzle(initialPuzzle);
	clearError();

	// Clear check inputs
	coordInput.value = "";
	valInput.value = "";

	// Show feedback
	const difficulty = getDifficulty(randomIndex);
	showSuccess(`New ${difficulty} puzzle loaded! 🎲`);
}

/**
 * Get puzzle difficulty based on index
 */
function getDifficulty(index) {
	if (index < 4) return "Easy";
	if (index < 8) return "Medium";
	if (index < 12) return "Hard";
	return "Expert";
}

/**
 * Clear the grid and reset to initial puzzle
 */
function clearGrid() {
	textArea.value = initialPuzzle;
	fillPuzzle(initialPuzzle);
	clearError();

	// Clear check inputs
	coordInput.value = "";
	valInput.value = "";

	// Show feedback
	showSuccess("Grid reset to initial puzzle! 🔄");
}

/**
 * Fill the sudoku grid with puzzle data
 * @param {string} data - String of 81 characters (digits 1-9 or dots)
 */
function fillPuzzle(data) {
	const len = Math.min(data.length, 81);

	// Clear all cells first
	for (let i = 0; i < 81; i++) {
		const rowLetter = String.fromCharCode(
			"A".charCodeAt(0) + Math.floor(i / 9),
		);
		const col = (i % 9) + 1;
		const cell = document.getElementsByClassName(rowLetter + col)[0];

		if (i < len && data[i] && data[i] !== ".") {
			cell.innerText = data[i];
			cell.style.color = "#1e293b"; // Dark color for given numbers
			cell.style.fontWeight = "700";
		} else {
			cell.innerText = "";
		}
	}
}

/**
 * Solve the sudoku puzzle via API
 */
async function getSolved() {
	const puzzle = textArea.value.trim();

	// Validate puzzle length
	if (puzzle.length !== 81) {
		showError({
			error: "Invalid puzzle length",
			message: "Puzzle must be exactly 81 characters",
		});
		return;
	}

	// Show loading state
	solveBtn.disabled = true;
	solveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Solving...';
	clearError();

	try {
		const response = await fetch("/api/solve", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ puzzle }),
		});

		const data = await response.json();

		if (data.error) {
			showError(data);
		} else if (data.solution) {
			fillPuzzle(data.solution);
			textArea.value = data.solution;
			showSuccess("Puzzle solved successfully! ✓");
		}
	} catch (error) {
		showError({
			error: "Network Error",
			message: "Failed to connect to the server. Please try again.",
		});
	} finally {
		// Reset button
		solveBtn.disabled = false;
		solveBtn.innerHTML = '<i class="fas fa-magic"></i> Solve Puzzle';
	}
}

/**
 * Check if a value can be placed at a coordinate
 */
async function getChecked() {
	const puzzle = textArea.value.trim();
	const coordinate = coordInput.value.trim().toUpperCase();
	const value = valInput.value.trim();

	// Input validation
	if (!coordinate) {
		showError({
			error: "Missing coordinate",
			message: "Please enter a coordinate (e.g., A1, C7)",
		});
		return;
	}

	if (!value) {
		showError({
			error: "Missing value",
			message: "Please enter a value (1-9)",
		});
		return;
	}

	if (puzzle.length !== 81) {
		showError({
			error: "Invalid puzzle",
			message: "Puzzle must be exactly 81 characters",
		});
		return;
	}

	// Show loading state
	checkBtn.disabled = true;
	checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
	clearError();

	try {
		const response = await fetch("/api/check", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				puzzle,
				coordinate,
				value,
			}),
		});

		const data = await response.json();
		displayCheckResult(data);
	} catch (error) {
		showError({
			error: "Network Error",
			message: "Failed to connect to the server. Please try again.",
		});
	} finally {
		// Reset button
		checkBtn.disabled = false;
		checkBtn.innerHTML = '<i class="fas fa-search"></i> Validate Placement';
	}
}

/**
 * Display the validation check result
 * @param {object} result - Result from /api/check
 */
function displayCheckResult(result) {
	if (result.error) {
		showError(result);
		return;
	}

	const errorDiv = document.getElementById("error-msg");
	errorDiv.innerHTML = "";

	if (result.valid) {
		// Valid placement
		errorDiv.style.background = "#f0fdf4";
		errorDiv.style.borderLeft = "4px solid #10b981";
		errorDiv.style.color = "#166534";
		errorDiv.innerHTML = `
      <div style="padding: 1rem; border-radius: 8px;">
        <strong style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <i class="fas fa-check-circle" style="color: #10b981;"></i>
          Valid Placement!
        </strong>
        <p style="font-size: 0.9rem;">
          The value <strong>${
						result.value || valInput.value
					}</strong> can be placed at 
          <strong>${result.coordinate || coordInput.value}</strong>
        </p>
      </div>
    `;
	} else {
		// Invalid placement
		errorDiv.style.background = "#fef2f2";
		errorDiv.style.borderLeft = "4px solid #ef4444";
		errorDiv.style.color = "#991b1b";

		const conflicts = result.conflict || [];
		const conflictList = conflicts
			.map(
				(c) =>
					`<li style="padding: 0.25rem 0;">
        <i class="fas fa-times" style="color: #ef4444;"></i> ${c}
      </li>`,
			)
			.join("");

		errorDiv.innerHTML = `
      <div style="padding: 1rem; border-radius: 8px;">
        <strong style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
          Invalid Placement
        </strong>
        <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">
          The value <strong>${
						result.value || valInput.value
					}</strong> cannot be placed at 
          <strong>${result.coordinate || coordInput.value}</strong>
        </p>
        <strong style="font-size: 0.85rem; display: block; margin-bottom: 0.5rem;">
          Conflicts detected:
        </strong>
        <ul style="list-style: none; padding-left: 0; font-size: 0.9rem;">
          ${conflictList}
        </ul>
      </div>
    `;
	}

	errorDiv.style.display = "block";
}

/**
 * Show error message
 * @param {object} errorData - Error object with error and message properties
 */
function showError(errorData) {
	const errorDiv = document.getElementById("error-msg");
	errorDiv.style.background = "#fef2f2";
	errorDiv.style.borderLeft = "4px solid #ef4444";
	errorDiv.style.color = "#991b1b";
	errorDiv.style.display = "block";

	errorDiv.innerHTML = `
    <div style="padding: 1rem;">
      <strong style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <i class="fas fa-exclamation-circle"></i>
        ${errorData.error || "Error"}
      </strong>
      ${
				errorData.message
					? `<p style="font-size: 0.9rem;">${errorData.message}</p>`
					: ""
			}
      ${
				errorData.conflict
					? `<p style="font-size: 0.9rem;">Conflicts: ${errorData.conflict.join(
							", ",
					  )}</p>`
					: ""
			}
    </div>
  `;
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
	const errorDiv = document.getElementById("error-msg");
	errorDiv.style.background = "#f0fdf4";
	errorDiv.style.borderLeft = "4px solid #10b981";
	errorDiv.style.color = "#166534";
	errorDiv.style.display = "block";

	errorDiv.innerHTML = `
    <div style="padding: 1rem;">
      <strong style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-check-circle"></i>
        ${message}
      </strong>
    </div>
  `;

	// Auto-hide success message after 3 seconds
	setTimeout(clearError, 3000);
}

/**
 * Clear error/success messages
 */
function clearError() {
	const errorDiv = document.getElementById("error-msg");
	errorDiv.style.display = "none";
	errorDiv.innerHTML = "";
}

// Event Listeners
solveBtn.addEventListener("click", getSolved);
checkBtn.addEventListener("click", getChecked);
clearBtn.addEventListener("click", clearGrid);
randomBtn.addEventListener("click", loadRandomPuzzle);

// Allow Enter key to submit
textArea.addEventListener("keypress", (e) => {
	if (e.key === "Enter" && e.ctrlKey) {
		getSolved();
	}
});

coordInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		valInput.focus();
	}
});

valInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		getChecked();
	}
});

// Auto-format coordinate input (convert to uppercase)
coordInput.addEventListener("input", (e) => {
	e.target.value = e.target.value.toUpperCase();
});

// Restrict value input to 1-9
valInput.addEventListener("input", (e) => {
	e.target.value = e.target.value.replace(/[^1-9]/g, "");
});
