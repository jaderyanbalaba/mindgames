/* =====================================================
   WORD SEARCH - JavaScript Game Logic
   LEAR / PETC Company Edition - Mind Games
   Multiple rotating puzzle sets (see wordsearch_data.js)
   ===================================================== */

let PUZZLE = null;
let currentIndex = 0;
let foundWords = new Set();
let gameOver = false;

let isSelecting = false;
let startCell = null;   // {row, col}
let currentPath = [];   // array of {row, col}
let cellEls = [];       // 2D array of DOM elements

const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const wordListEl = document.getElementById("wordList");
const popup = document.getElementById("popup");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const helpBtn = document.getElementById("helpBtn");
const helpPopup = document.getElementById("helpPopup");
const themeNameEl = document.getElementById("themeName");
const themeCountEl = document.getElementById("themeCount");

helpBtn.addEventListener("click", () => helpPopup.classList.remove("hidden"));

// ---------- DAY-OF-YEAR ROTATION (matches Crossword behavior) ----------
function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / 86400000);
}

function getDefaultPuzzleIndex() {
    return dayOfYear(new Date()) % ALL_WORDSEARCH_PUZZLES.length;
}

// ---------- LOAD / SWITCH PUZZLE ----------
function loadPuzzle(index) {
    currentIndex = ((index % ALL_WORDSEARCH_PUZZLES.length) + ALL_WORDSEARCH_PUZZLES.length) % ALL_WORDSEARCH_PUZZLES.length;
    PUZZLE = ALL_WORDSEARCH_PUZZLES[currentIndex];
    gameOver = false;
    foundWords = new Set();
    themeNameEl.textContent = PUZZLE.theme;
    themeCountEl.textContent = `(${PUZZLE.words.length} words - ${currentIndex + 1} of ${ALL_WORDSEARCH_PUZZLES.length})`;
    buildGrid();
    buildWordList();
    statusEl.textContent = "Find every word in the list by dragging across the grid.";
    statusEl.style.color = "#2FBF9B";
    localStorage.setItem("wordsearch_last_index", String(currentIndex));
}

function nextPuzzle() {
    loadPuzzle(currentIndex + 1);
}

function nextPuzzleFromPopup() {
    popup.classList.add("hidden");
    nextPuzzle();
}

// ---------- BUILD GRID ----------
function buildGrid() {
    const size = PUZZLE.size;
    gridEl.style.gridTemplateColumns = `repeat(${size}, 32px)`;
    gridEl.innerHTML = "";
    cellEls = [];
    for (let r = 0; r < size; r++) {
        const rowEls = [];
        for (let c = 0; c < size; c++) {
            const cellDiv = document.createElement("div");
            cellDiv.className = "ws-cell";
            cellDiv.textContent = PUZZLE.grid[r][c];
            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;

            cellDiv.addEventListener("mousedown", (e) => { e.preventDefault(); startSelection(r, c); });
            cellDiv.addEventListener("mouseenter", () => { if (isSelecting) updateSelection(r, c); });
            cellDiv.addEventListener("touchstart", (e) => { e.preventDefault(); startSelection(r, c); }, { passive: false });

            gridEl.appendChild(cellDiv);
            rowEls.push(cellDiv);
        }
        cellEls.push(rowEls);
    }
    document.addEventListener("mouseup", endSelection);
    gridEl.addEventListener("touchmove", handleTouchMove, { passive: false });
    gridEl.addEventListener("touchend", endSelection);
}

// ---------- SELECTION LOGIC ----------
function startSelection(row, col) {
    if (gameOver) return;
    isSelecting = true;
    startCell = { row, col };
    currentPath = [{ row, col }];
    renderSelection();
}

function updateSelection(row, col) {
    if (!isSelecting || !startCell) return;
    const dr = row - startCell.row;
    const dc = col - startCell.col;
    // Determine straight-line direction (including diagonals)
    const stepR = dr === 0 ? 0 : dr > 0 ? 1 : -1;
    const stepC = dc === 0 ? 0 : dc > 0 ? 1 : -1;
    const isStraight = (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc));
    if (!isStraight) return;

    const length = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
    const path = [];
    for (let i = 0; i < length; i++) {
        path.push({ row: startCell.row + stepR * i, col: startCell.col + stepC * i });
    }
    currentPath = path;
    renderSelection();
}

function handleTouchMove(e) {
    if (!isSelecting) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.classList.contains("ws-cell")) {
        const row = parseInt(el.dataset.row);
        const col = parseInt(el.dataset.col);
        updateSelection(row, col);
    }
}

function renderSelection() {
    // Clear old "selecting" highlights
    document.querySelectorAll(".ws-cell.selecting").forEach(el => el.classList.remove("selecting"));
    currentPath.forEach(({ row, col }) => {
        if (cellEls[row] && cellEls[row][col]) {
            cellEls[row][col].classList.add("selecting");
        }
    });
}

function endSelection() {
    if (!isSelecting) return;
    isSelecting = false;
    checkSelection();
    document.querySelectorAll(".ws-cell.selecting").forEach(el => el.classList.remove("selecting"));
    currentPath = [];
    startCell = null;
}

function checkSelection() {
    if (currentPath.length < 2) return;
    const selectedCoords = currentPath.map(p => `${p.row},${p.col}`);
    const selectedCoordsRev = [...selectedCoords].reverse();

    for (const entry of PUZZLE.words) {
        if (foundWords.has(entry.word)) continue;
        const wordCoords = entry.cells.map(([r, c]) => `${r},${c}`);
        if (arraysEqual(selectedCoords, wordCoords) || arraysEqual(selectedCoordsRev, wordCoords)) {
            markWordFound(entry);
            return;
        }
    }
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

function markWordFound(entry) {
    foundWords.add(entry.word);
    entry.cells.forEach(([r, c]) => {
        const el = cellEls[r][c];
        el.classList.add("found");
    });
    const li = document.getElementById(`word-${entry.word}`);
    if (li) li.classList.add("found");
    statusEl.textContent = `Found "${entry.word}"! Keep going.`;
    statusEl.style.color = "#2FBF9B";

    if (foundWords.size === PUZZLE.words.length) {
        finishPuzzle();
    }
}

// ---------- WORD LIST ----------
function buildWordList() {
    wordListEl.innerHTML = "";
    PUZZLE.words.forEach(entry => {
        const li = document.createElement("li");
        li.id = `word-${entry.word}`;
        li.textContent = entry.word;
        wordListEl.appendChild(li);
    });
}

// ---------- HINT ----------
function giveHint() {
    const remaining = PUZZLE.words.filter(e => !foundWords.has(e.word));
    if (remaining.length === 0) {
        statusEl.textContent = "All words are already found!";
        return;
    }
    const entry = remaining[Math.floor(Math.random() * remaining.length)];
    markWordFound(entry);
    statusEl.textContent = `Revealed "${entry.word}".`;
    statusEl.style.color = "#E8A93B";
}

// ---------- CLEAR ----------
function clearProgress() {
    foundWords = new Set();
    document.querySelectorAll(".ws-cell.found").forEach(el => el.classList.remove("found", "overlap"));
    document.querySelectorAll(".word-list li.found").forEach(li => li.classList.remove("found"));
    statusEl.textContent = "Progress cleared. Find every word in the list.";
    statusEl.style.color = "#2FBF9B";
}

// ---------- COMPLETE ----------
function finishPuzzle() {
    if (gameOver) return;
    gameOver = true;
    setTimeout(() => {
        popupTitle.textContent = "All Words Found!";
        popupMessage.textContent = `You found every "${PUZZLE.theme}" word. Sharp eyes!`;
        popupIcon.textContent = "Trophy";
        popup.classList.remove("hidden");
    }, 300);
}

function closePopupAndReset() {
    popup.classList.add("hidden");
    gameOver = false;
    clearProgress();
}

// ---------- DAILY TIMER ----------
let remainingSeconds = 15 * 60;
const timerEl = document.getElementById("timer");
const today = new Date().toDateString();
const saved = JSON.parse(localStorage.getItem("wordsearch_daily") || "{}");
if (saved.date === today) {
    remainingSeconds = Math.max(0, saved.remaining);
}
function updateTimer() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerEl.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    if (remainingSeconds <= 60) timerEl.style.color = "#E85D5D";
    else if (remainingSeconds <= 300) timerEl.style.color = "#E8A93B";
    else timerEl.style.color = "#2FBF9B";
}
updateTimer();
setInterval(() => {
    if (remainingSeconds > 0 && !gameOver) {
        remainingSeconds--;
        updateTimer();
        localStorage.setItem("wordsearch_daily", JSON.stringify({ date: today, remaining: remainingSeconds }));
        if (remainingSeconds === 0) {
            alert("Daily 15-minute allowance for Word Search has been used.\n\nIt will renew automatically tomorrow.");
            window.location.href = "index.html";
        }
    }
}, 1000);

// ---------- INIT ----------
const lastIndex = localStorage.getItem("wordsearch_last_index");
const lastDate = localStorage.getItem("wordsearch_last_date");
let startIndex;
if (lastDate === today && lastIndex !== null) {
    startIndex = parseInt(lastIndex, 10);
} else {
    startIndex = getDefaultPuzzleIndex();
}
localStorage.setItem("wordsearch_last_date", today);
loadPuzzle(startIndex);
console.log("Word Search (LEAR & PETC rotating edition) loaded - theme:", PUZZLE.theme);
