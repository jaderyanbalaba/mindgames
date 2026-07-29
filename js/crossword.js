/* =====================================================
   CROSSWORD — JavaScript Game Logic
   LEAR / PETC Company Edition — Mind Games
   Multiple rotating puzzle sets (see crossword_data.js)
   ===================================================== */

let PUZZLE = null;
let currentIndex = 0;

let userGrid = [];
let selected = { row: null, col: null };
let currentDir = "across"; // across or down
let gameOver = false;

const gridEl = document.getElementById("grid");
const statusEl = document.getElementById("status");
const acrossListEl = document.getElementById("acrossClues");
const downListEl = document.getElementById("downClues");
const popup = document.getElementById("popup");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const helpBtn = document.getElementById("helpBtn");
const helpPopup = document.getElementById("helpPopup");
const themeNameEl = document.getElementById("themeName");
const themeCountEl = document.getElementById("themeCount");

helpBtn.addEventListener("click", () => helpPopup.classList.remove("hidden"));

// ---------- DAY-OF-YEAR ROTATION ----------
function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / 86400000);
}

function getDefaultPuzzleIndex() {
    return dayOfYear(new Date()) % ALL_PUZZLES.length;
}

// ---------- LOAD / SWITCH PUZZLE ----------
function loadPuzzle(index) {
    currentIndex = ((index % ALL_PUZZLES.length) + ALL_PUZZLES.length) % ALL_PUZZLES.length;
    PUZZLE = ALL_PUZZLES[currentIndex];
    gameOver = false;
    selected = { row: null, col: null };
    currentDir = "across";
    themeNameEl.textContent = PUZZLE.theme;
    themeCountEl.textContent = `(${PUZZLE.entries.length} words · ${currentIndex + 1} of ${ALL_PUZZLES.length})`;
    buildGrid();
    buildClues();
    statusEl.textContent = "Fill in the grid using the clues below.";
    statusEl.style.color = "#2FBF9B";
    localStorage.setItem("crossword_last_index", String(currentIndex));
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
    gridEl.style.gridTemplateColumns = `repeat(${PUZZLE.cols}, 30px)`;
    gridEl.innerHTML = "";
    userGrid = [];
    for (let r = 0; r < PUZZLE.rows; r++) {
        const rowArr = [];
        for (let c = 0; c < PUZZLE.cols; c++) {
            const cellData = PUZZLE.cells[r][c];
            const cellDiv = document.createElement("div");
            cellDiv.className = "cw-cell";
            if (!cellData.active) {
                cellDiv.classList.add("blocked");
                rowArr.push(null);
            } else {
                if (cellData.number) {
                    const numSpan = document.createElement("span");
                    numSpan.className = "cw-number";
                    numSpan.textContent = cellData.number;
                    cellDiv.appendChild(numSpan);
                }
                const input = document.createElement("input");
                input.maxLength = 1;
                input.dataset.row = r;
                input.dataset.col = c;
                input.addEventListener("focus", () => onCellFocus(r, c));
                input.addEventListener("click", () => onCellClick(r, c));
                input.addEventListener("input", (e) => onCellInput(e, r, c));
                input.addEventListener("keydown", (e) => onKeyDown(e, r, c));
                cellDiv.appendChild(input);
                rowArr.push(input);
            }
            gridEl.appendChild(cellDiv);
        }
        userGrid.push(rowArr);
    }
}

// ---------- ENTRY LOOKUP ----------
function entriesAt(row, col) {
    return PUZZLE.entries.filter(e => {
        const dr = e.dir === "down" ? 1 : 0;
        const dc = e.dir === "across" ? 1 : 0;
        for (let i = 0; i < e.length; i++) {
            if (e.row + dr * i === row && e.col + dc * i === col) return true;
        }
        return false;
    });
}

// ---------- FOCUS / SELECTION ----------
function onCellFocus(row, col) {
    selected = { row, col };
    const here = entriesAt(row, col);
    if (!here.some(e => e.dir === currentDir)) {
        currentDir = here[0] ? here[0].dir : "across";
    }
    highlightSelection();
}

function onCellClick(row, col) {
    const here = entriesAt(row, col);
    if (selected.row === row && selected.col === col && here.length > 1) {
        currentDir = currentDir === "across" ? "down" : "across";
        if (!here.some(e => e.dir === currentDir)) {
            currentDir = here[0].dir;
        }
    }
    selected = { row, col };
    highlightSelection();
}

function activeEntry() {
    if (selected.row === null) return null;
    const here = entriesAt(selected.row, selected.col);
    return here.find(e => e.dir === currentDir) || here[0] || null;
}

function highlightSelection() {
    document.querySelectorAll(".cw-cell").forEach(c => {
        c.classList.remove("active-word", "selected");
    });
    document.querySelectorAll(".clue-list li").forEach(li => li.classList.remove("active-clue"));

    const entry = activeEntry();
    if (!entry) return;
    const dr = entry.dir === "down" ? 1 : 0;
    const dc = entry.dir === "across" ? 1 : 0;
    for (let i = 0; i < entry.length; i++) {
        const r = entry.row + dr * i;
        const c = entry.col + dc * i;
        const input = userGrid[r][c];
        if (input) input.parentElement.classList.add("active-word");
    }
    if (selected.row !== null) {
        const sel = userGrid[selected.row][selected.col];
        if (sel) sel.parentElement.classList.add("selected");
    }
    const li = document.getElementById(`clue-${entry.dir}-${entry.number}`);
    if (li) {
        li.classList.add("active-clue");
        li.scrollIntoView({ block: "nearest" });
    }
}

// ---------- INPUT HANDLING ----------
function onCellInput(e, row, col) {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    e.target.value = val.slice(-1);
    e.target.classList.remove("correct", "incorrect");
    if (val) {
        moveNext(row, col);
    }
    checkAutoComplete();
}

function moveNext(row, col) {
    const entry = activeEntry();
    if (!entry) return;
    const dr = entry.dir === "down" ? 1 : 0;
    const dc = entry.dir === "across" ? 1 : 0;
    const nr = row + dr;
    const nc = col + dc;
    if (nr < PUZZLE.rows && nc < PUZZLE.cols && userGrid[nr] && userGrid[nr][nc]) {
        userGrid[nr][nc].focus();
    }
}

function movePrev(row, col) {
    const entry = activeEntry();
    if (!entry) return;
    const dr = entry.dir === "down" ? 1 : 0;
    const dc = entry.dir === "across" ? 1 : 0;
    const pr = row - dr;
    const pc = col - dc;
    if (pr >= 0 && pc >= 0 && userGrid[pr] && userGrid[pr][pc]) {
        userGrid[pr][pc].focus();
    }
}

function onKeyDown(e, row, col) {
    if (e.key === "Backspace" && !e.target.value) {
        movePrev(row, col);
    } else if (e.key === "ArrowRight" && userGrid[row][col + 1]) {
        userGrid[row][col + 1].focus();
    } else if (e.key === "ArrowLeft" && userGrid[row][col - 1]) {
        userGrid[row][col - 1].focus();
    } else if (e.key === "ArrowDown" && userGrid[row + 1] && userGrid[row + 1][col]) {
        userGrid[row + 1][col].focus();
    } else if (e.key === "ArrowUp" && userGrid[row - 1] && userGrid[row - 1][col]) {
        userGrid[row - 1][col].focus();
    }
}

// ---------- CLUES ----------
function buildClues() {
    const across = PUZZLE.entries.filter(e => e.dir === "across").sort((a, b) => a.number - b.number);
    const down = PUZZLE.entries.filter(e => e.dir === "down").sort((a, b) => a.number - b.number);
    acrossListEl.innerHTML = "";
    downListEl.innerHTML = "";
    across.forEach(e => acrossListEl.appendChild(buildClueItem(e)));
    down.forEach(e => downListEl.appendChild(buildClueItem(e)));
}

function buildClueItem(entry) {
    const li = document.createElement("li");
    li.id = `clue-${entry.dir}-${entry.number}`;
    li.innerHTML = `<span class="clue-num">${entry.number}.</span>${entry.clue} (${entry.length})`;
    li.addEventListener("click", () => {
        currentDir = entry.dir;
        selected = { row: entry.row, col: entry.col };
        userGrid[entry.row][entry.col].focus();
        highlightSelection();
    });
    return li;
}

// ---------- CHECK / HINT / CLEAR ----------
function checkSolution() {
    let allFilled = true;
    let allCorrect = true;
    for (let r = 0; r < PUZZLE.rows; r++) {
        for (let c = 0; c < PUZZLE.cols; c++) {
            const cellData = PUZZLE.cells[r][c];
            if (!cellData.active) continue;
            const input = userGrid[r][c];
            input.classList.remove("correct", "incorrect");
            if (!input.value) {
                allFilled = false;
                continue;
            }
            if (input.value.toUpperCase() === cellData.solution) {
                input.classList.add("correct");
            } else {
                input.classList.add("incorrect");
                allCorrect = false;
            }
        }
    }
    markSolvedClues();
    if (!allFilled) {
        statusEl.textContent = "Keep going — some cells are still empty.";
        statusEl.style.color = "#E8A93B";
    } else if (allCorrect) {
        statusEl.textContent = "All correct! Great job! 🎉";
        statusEl.style.color = "#2FBF9B";
        finishPuzzle();
    } else {
        statusEl.textContent = "Some letters are incorrect — check the highlighted cells.";
        statusEl.style.color = "#E85D5D";
    }
}

function checkAutoComplete() {
    for (let r = 0; r < PUZZLE.rows; r++) {
        for (let c = 0; c < PUZZLE.cols; c++) {
            const cellData = PUZZLE.cells[r][c];
            if (!cellData.active) continue;
            const input = userGrid[r][c];
            if (!input.value || input.value.toUpperCase() !== cellData.solution) return;
        }
    }
    checkSolution();
}

function markSolvedClues() {
    PUZZLE.entries.forEach(entry => {
        const dr = entry.dir === "down" ? 1 : 0;
        const dc = entry.dir === "across" ? 1 : 0;
        let solved = true;
        for (let i = 0; i < entry.length; i++) {
            const r = entry.row + dr * i;
            const c = entry.col + dc * i;
            const input = userGrid[r][c];
            if (!input || input.value.toUpperCase() !== PUZZLE.cells[r][c].solution) {
                solved = false;
                break;
            }
        }
        const li = document.getElementById(`clue-${entry.dir}-${entry.number}`);
        if (li) li.classList.toggle("solved", solved);
    });
}

function giveHint() {
    const empties = [];
    for (let r = 0; r < PUZZLE.rows; r++) {
        for (let c = 0; c < PUZZLE.cols; c++) {
            const cellData = PUZZLE.cells[r][c];
            if (!cellData.active) continue;
            const input = userGrid[r][c];
            if (input.value.toUpperCase() !== cellData.solution) empties.push([r, c]);
        }
    }
    if (empties.length === 0) {
        statusEl.textContent = "The grid is already complete!";
        return;
    }
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    userGrid[r][c].value = PUZZLE.cells[r][c].solution;
    userGrid[r][c].classList.remove("incorrect");
    userGrid[r][c].classList.add("correct");
    statusEl.textContent = "Here's a letter to help you along. 💡";
    statusEl.style.color = "#E8A93B";
    markSolvedClues();
    checkAutoComplete();
}

function clearUser() {
    for (let r = 0; r < PUZZLE.rows; r++) {
        for (let c = 0; c < PUZZLE.cols; c++) {
            const input = userGrid[r][c];
            if (input) {
                input.value = "";
                input.classList.remove("correct", "incorrect");
            }
        }
    }
    markSolvedClues();
    statusEl.textContent = "Grid cleared. Fill in the words using the clues below.";
    statusEl.style.color = "#2FBF9B";
}

// ---------- COMPLETE ----------
function finishPuzzle() {
    if (gameOver) return;
    gameOver = true;
    setTimeout(() => {
        popupTitle.textContent = "Puzzle Solved!";
        popupMessage.textContent = `You filled in every "${PUZZLE.theme}" term correctly. Sharp thinking!`;
        popupIcon.textContent = "🏆";
        popup.classList.remove("hidden");
    }, 300);
}

function closePopupAndReset() {
    popup.classList.add("hidden");
    gameOver = false;
    clearUser();
}

// ---------- DAILY TIMER ----------
let remainingSeconds = 15 * 60;
const timerEl = document.getElementById("timer");
const today = new Date().toDateString();
const saved = JSON.parse(localStorage.getItem("crossword_daily") || "{}");
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
        localStorage.setItem("crossword_daily", JSON.stringify({ date: today, remaining: remainingSeconds }));
        if (remainingSeconds === 0) {
            alert("Daily 15-minute allowance for Crossword has been used.\n\nIt will renew automatically tomorrow.");
            window.location.href = "index.html";
        }
    }
}, 1000);

// ---------- INIT ----------
// Default to today's rotating theme (same for everyone each day),
// but respect an explicit "New Puzzle" choice made earlier today.
const lastIndex = localStorage.getItem("crossword_last_index");
const lastDate = localStorage.getItem("crossword_last_date");
let startIndex;
if (lastDate === today && lastIndex !== null) {
    startIndex = parseInt(lastIndex, 10);
} else {
    startIndex = getDefaultPuzzleIndex();
}
localStorage.setItem("crossword_last_date", today);
loadPuzzle(startIndex);
console.log("Crossword (LEAR & PETC rotating edition) loaded ✓ — theme:", PUZZLE.theme);
