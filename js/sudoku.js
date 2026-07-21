/* =====================================================
   SUDOKU — JavaScript Game Logic
   Converted from your Python Mind Games
   ===================================================== */

// ---------- PUZZLE BANK (from your Python code) ----------
const SUDOKU_BANK = {
    "Easy": [
        [
            [5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],
            [8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],
            [0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]
        ],
        [
            [0,0,0,2,6,0,7,0,1],[6,8,0,0,7,0,0,9,0],[1,9,0,0,0,4,5,0,0],
            [8,2,0,1,0,0,0,4,0],[0,0,4,6,0,2,9,0,0],[0,5,0,0,0,3,0,2,8],
            [0,0,9,3,0,0,0,7,4],[0,4,0,0,5,0,0,3,6],[7,0,3,0,1,8,0,0,0]
        ],
        [
            [1,0,0,4,8,9,0,0,6],[7,3,0,0,0,0,0,4,0],[0,0,0,0,0,1,2,9,5],
            [0,0,7,1,2,0,6,0,0],[5,0,0,7,0,3,0,0,8],[0,0,6,0,9,5,7,0,0],
            [9,1,4,6,0,0,0,0,0],[0,2,0,0,0,0,0,3,7],[8,0,0,5,1,2,0,0,4]
        ],
        [
            [0,2,0,6,0,8,0,0,0],[5,8,0,0,0,9,7,0,0],[0,0,0,0,4,0,0,0,0],
            [3,7,0,0,0,0,5,0,0],[6,0,0,0,0,0,0,0,4],[0,0,8,0,0,0,0,1,3],
            [0,0,0,0,2,0,0,0,0],[0,0,9,8,0,0,0,3,6],[0,0,0,3,0,6,0,9,0]
        ]
    ],
    "Medium": [
        [
            [0,0,0,0,0,0,6,8,0],[0,0,0,0,7,3,0,0,9],[3,0,9,0,0,0,0,4,5],
            [4,9,0,0,0,0,0,0,0],[8,0,3,0,5,0,9,0,2],[0,0,0,0,0,0,0,3,6],
            [9,6,0,0,0,0,3,0,8],[7,0,0,6,8,0,0,0,0],[0,2,8,0,0,0,0,0,0]
        ],
        [
            [0,0,0,6,0,0,4,0,0],[7,0,0,0,0,3,6,0,0],[0,0,0,0,9,1,0,8,0],
            [0,0,0,0,0,0,0,0,0],[0,5,0,1,8,0,0,0,3],[0,0,0,3,0,6,0,4,5],
            [0,4,0,2,0,0,0,6,0],[9,0,3,0,0,0,0,0,0],[0,2,0,0,0,0,1,0,0]
        ],
        [
            [2,0,0,3,0,0,0,0,0],[8,0,4,0,6,2,0,0,3],[0,1,3,8,0,0,2,0,0],
            [0,0,0,0,2,0,3,9,0],[5,0,7,0,0,0,6,2,1],[0,3,2,0,0,6,0,0,0],
            [0,2,0,0,0,9,1,4,0],[6,0,1,2,5,0,8,0,9],[0,0,0,0,0,1,0,0,2]
        ]
    ],
    "Hard": [
        [
            [8,0,0,0,0,0,0,0,0],[0,0,3,6,0,0,0,0,0],[0,7,0,0,9,0,2,0,0],
            [0,5,0,0,0,7,0,0,0],[0,0,0,0,4,5,7,0,0],[0,0,0,1,0,0,0,3,0],
            [0,0,1,0,0,0,0,6,8],[0,0,8,5,0,0,0,1,0],[0,9,0,0,0,0,4,0,0]
        ],
        [
            [0,0,5,3,0,0,0,0,0],[8,0,0,0,0,0,0,2,0],[0,7,0,0,1,0,5,0,0],
            [4,0,0,0,0,5,3,0,0],[0,1,0,0,7,0,0,0,6],[0,0,3,2,0,0,0,8,0],
            [0,6,0,5,0,0,0,0,9],[0,0,4,0,0,0,0,3,0],[0,0,0,0,0,9,7,0,0]
        ],
        [
            [0,0,0,0,0,0,0,1,2],[0,0,0,0,3,5,0,0,0],[0,0,0,6,0,0,0,7,0],
            [7,0,0,0,0,0,3,0,0],[0,0,0,4,0,0,8,0,0],[1,0,0,0,0,0,0,0,0],
            [0,0,0,1,2,0,0,0,0],[0,8,0,0,0,0,0,4,0],[0,5,0,0,0,0,6,0,0]
        ]
    ]
};

// ---------- STATE ----------
let difficulty = "Easy";
let puzzle = [];
let given = [];
let solutionBoard = [];
let startTime = Date.now();

// ---------- DOM ----------
const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const popup = document.getElementById("popup");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");

// ---------- BUILD BOARD ----------
function buildBoard() {
    boardEl.innerHTML = "";
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const input = document.createElement("input");
            input.type = "text";
            input.maxLength = 1;
            input.className = "sudoku-cell";
            input.dataset.row = r;
            input.dataset.col = c;

            // Only allow digits 1–9
            input.addEventListener("input", (e) => {
                const val = e.target.value;
                if (!/^[1-9]$/.test(val)) {
                    e.target.value = "";
                }
            });

            boardEl.appendChild(input);
        }
    }
}

// ---------- NEW PUZZLE ----------
function newPuzzle() {
    const diffRadio = document.querySelector('input[name="diff"]:checked');
    difficulty = diffRadio.value;

    const bank = SUDOKU_BANK[difficulty];
    puzzle = JSON.parse(JSON.stringify(bank[Math.floor(Math.random() * bank.length)]));

    given = puzzle.map(row => row.map(v => v !== 0));

    // Solve for hints/checking
    const solveCopy = JSON.parse(JSON.stringify(puzzle));
    if (solve(solveCopy)) {
        solutionBoard = solveCopy;
    } else {
        solutionBoard = null;
    }

    // Fill in the cells
    const cells = document.querySelectorAll(".sudoku-cell");
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        const val = puzzle[r][c];

        cell.classList.remove("given", "hint");
        cell.disabled = false;
        cell.value = "";

        if (val !== 0) {
            cell.value = val;
            cell.classList.add("given");
            cell.disabled = true;
        }
    });

    startTime = Date.now();
    statusEl.textContent = `New ${difficulty} puzzle — good luck!`;
    statusEl.style.color = "#4A6CF7";
}

// ---------- CLEAR USER ENTRIES ----------
function clearUser() {
    const cells = document.querySelectorAll(".sudoku-cell");
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (!given[r][c]) {
            cell.value = "";
            cell.classList.remove("hint");
        }
    });
    statusEl.textContent = "Cleared your entries.";
    statusEl.style.color = "#6B7A99";
}

// ---------- READ BOARD ----------
function readBoard() {
    const b = Array.from({ length: 9 }, () => Array(9).fill(0));
    const cells = document.querySelectorAll(".sudoku-cell");
    for (const cell of cells) {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        const v = cell.value.trim();
        if (v === "") {
            b[r][c] = 0;
        } else if (/^[1-9]$/.test(v)) {
            b[r][c] = parseInt(v);
        } else {
            return { board: null, err: `Invalid entry at row ${r+1}, col ${c+1}` };
        }
    }
    return { board: b, err: null };
}

// ---------- CHECK SOLUTION ----------
function checkSolution() {
    const { board, err } = readBoard();
    if (err) {
        statusEl.textContent = err;
        statusEl.style.color = "#E85D5D";
        return;
    }
    if (board.some(row => row.includes(0))) {
        statusEl.textContent = "Some cells are still empty.";
        statusEl.style.color = "#E8A93B";
        return;
    }
    if (validFull(board)) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        statusEl.textContent = `🎉 Solved in ${mins}m ${secs}s! Great job!`;
        statusEl.style.color = "#2FBF9B";
        setTimeout(() => showPopup(
            "Puzzle Solved!",
            `You completed the ${difficulty} Sudoku puzzle in ${mins}m ${secs}s.\n\nExcellent focus and logical reasoning!`
        ), 250);
    } else {
        statusEl.textContent = "Not quite right — check your rows, columns, and 3×3 boxes.";
        statusEl.style.color = "#E85D5D";
    }
}

// ---------- HINT ----------
function giveHint() {
    if (!solutionBoard) return;
    const empties = [];
    const cells = document.querySelectorAll(".sudoku-cell");
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (!given[r][c] && cell.value.trim() === "") {
            empties.push({ r, c, cell });
        }
    });
    if (empties.length === 0) {
        statusEl.textContent = "No empty cells to hint.";
        statusEl.style.color = "#6B7A99";
        return;
    }
    const pick = empties[Math.floor(Math.random() * empties.length)];
    pick.cell.value = solutionBoard[pick.r][pick.c];
    pick.cell.classList.add("hint");
    statusEl.textContent = `Hint placed at row ${pick.r+1}, col ${pick.c+1}.`;
    statusEl.style.color = "#8B7DE8";
}

// ---------- VALIDATION ----------
function validFull(b) {
    for (let i = 0; i < 9; i++) {
        const row = [...b[i]].sort((a,b) => a-b);
        const col = b.map(r => r[i]).sort((a,b) => a-b);
        for (let n = 0; n < 9; n++) {
            if (row[n] !== n+1 || col[n] !== n+1) return false;
        }
    }
    for (let br = 0; br < 9; br += 3) {
        for (let bc = 0; bc < 9; bc += 3) {
            const box = [];
            for (let r = br; r < br+3; r++)
                for (let c = bc; c < bc+3; c++)
                    box.push(b[r][c]);
            box.sort((a,b) => a-b);
            for (let n = 0; n < 9; n++) if (box[n] !== n+1) return false;
        }
    }
    return true;
}

// ---------- SOLVER ----------
function solve(b) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (b[r][c] === 0) {
                for (let n = 1; n <= 9; n++) {
                    if (canPlace(b, r, c, n)) {
                        b[r][c] = n;
                        if (solve(b)) return true;
                        b[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function canPlace(b, r, c, n) {
    for (let i = 0; i < 9; i++) {
        if (b[r][i] === n) return false;
        if (b[i][c] === n) return false;
    }
    const br = Math.floor(r/3) * 3;
    const bc = Math.floor(c/3) * 3;
    for (let i = br; i < br+3; i++)
        for (let j = bc; j < bc+3; j++)
            if (b[i][j] === n) return false;
    return true;
}

// ---------- POPUP ----------
function showPopup(title, message) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;
    popup.classList.remove("hidden");
}

function closePopupAndNew() {
    popup.classList.add("hidden");
    newPuzzle();
}

// ---------- DIFFICULTY CHANGE ----------
document.querySelectorAll('input[name="diff"]').forEach(radio => {
    radio.addEventListener("change", newPuzzle);
});

// ---------- DAILY TIMER ----------
let remainingSeconds = 15 * 60;
const timerEl = document.getElementById("timer");

const today = new Date().toDateString();
const saved = JSON.parse(localStorage.getItem("sudoku_daily") || "{}");
if (saved.date === today) {
    remainingSeconds = Math.max(0, saved.remaining);
}

function updateTimer() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
    if (remainingSeconds <= 60) timerEl.style.color = "#E85D5D";
    else if (remainingSeconds <= 300) timerEl.style.color = "#E8A93B";
    else timerEl.style.color = "#2FBF9B";
}
updateTimer();

setInterval(() => {
    if (remainingSeconds > 0) {
        remainingSeconds--;
        updateTimer();
        localStorage.setItem("sudoku_daily", JSON.stringify({
            date: today,
            remaining: remainingSeconds
        }));
        if (remainingSeconds === 0) {
            alert("Daily 15-minute allowance for Sudoku has been used.\n\nIt will renew automatically tomorrow.");
            window.location.href = "index.html";
        }
    }
}, 1000);

// ---------- INIT ----------
buildBoard();
newPuzzle();

console.log("Sudoku loaded ✓");
