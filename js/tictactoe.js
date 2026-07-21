/* =====================================================
   TIC TAC TOE — JavaScript Game Logic
   Converted from your Python Mind Games
   ===================================================== */

const HUMAN = "X";
const AI = "O";

let board = ["", "", "", "", "", "", "", "", ""];
let mode = "Easy";
let turn = HUMAN;
let gameOver = false;
let startTime = Date.now();

// ---------- WIN LINES ----------
const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diagonals
];

// ---------- DOM ----------
const cells = document.querySelectorAll(".cell");
const statusEl = document.getElementById("status");
const popup = document.getElementById("popup");
const popupCard = document.getElementById("popupCard");
const popupIcon = document.getElementById("popupIcon");
const popupTitle = document.getElementById("popupTitle");
const popupMessage = document.getElementById("popupMessage");
const modeRadios = document.querySelectorAll('input[name="mode"]');

// ---------- INIT ----------
cells.forEach(cell => {
    cell.addEventListener("click", () => onCellClick(parseInt(cell.dataset.idx)));
});

modeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
        mode = e.target.value;
        resetGame();
    });
});

// ---------- GAME LOGIC ----------
function onCellClick(idx) {
    if (gameOver || board[idx] !== "") return;

    board[idx] = turn;
    updateCell(idx);

    if (checkEnd()) return;

    if (mode === "PvP") {
        turn = (turn === HUMAN) ? AI : HUMAN;
        updateStatus();
    } else {
        turn = AI;
        statusEl.textContent = "AI is thinking…";
        statusEl.style.color = "#6B7A99";
        setTimeout(aiMove, 400);
    }
}

function aiMove() {
    if (gameOver) return;

    const move = getAIMove();
    if (move !== null) {
        board[move] = AI;
        updateCell(move);
    }

    if (!checkEnd()) {
        turn = HUMAN;
        updateStatus();
    }
}

function updateCell(idx) {
    cells[idx].textContent = board[idx];
    cells[idx].classList.add(board[idx] === "X" ? "x-mark" : "o-mark");
    cells[idx].disabled = true;
}

function updateStatus() {
    if (mode === "PvP") {
        const who = (turn === HUMAN) ? "Player 1 (X)" : "Player 2 (O)";
        statusEl.textContent = `${who}'s turn`;
        statusEl.style.color = "#4A6CF7";
    } else {
        statusEl.textContent = "Your turn (X)";
        statusEl.style.color = "#2FBF9B";
    }
}

// ---------- AI STRATEGIES ----------
function getAIMove() {
    const empties = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    if (empties.length === 0) return null;

    if (mode === "Easy") {
        return empties[Math.floor(Math.random() * empties.length)];
    }

    if (mode === "Medium") {
        // 60% smart, 40% random
        if (Math.random() < 0.6) {
            let m = findImmediate(AI);      // try to win
            if (m !== null) return m;
            m = findImmediate(HUMAN);       // block
            if (m !== null) return m;
            if (empties.includes(4)) return 4;
            const corners = [0,2,6,8].filter(c => empties.includes(c));
            if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
        }
        return empties[Math.floor(Math.random() * empties.length)];
    }

    if (mode === "Hard") {
        const [_, move] = minimax([...board], AI);
        return move;
    }

    return empties[Math.floor(Math.random() * empties.length)];
}

function findImmediate(player) {
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            const temp = [...board];
            temp[i] = player;
            if (getWinner(temp) === player) return i;
        }
    }
    return null;
}

function minimax(b, player) {
    const win = getWinner(b);
    if (win === AI) return [1, null];
    if (win === HUMAN) return [-1, null];
    if (!b.includes("")) return [0, null];

    let bestMove = null;

    if (player === AI) {
        let best = -2;
        for (let i = 0; i < 9; i++) {
            if (b[i] === "") {
                b[i] = AI;
                const [score, _] = minimax(b, HUMAN);
                b[i] = "";
                if (score > best) { best = score; bestMove = i; }
            }
        }
        return [best, bestMove];
    } else {
        let best = 2;
        for (let i = 0; i < 9; i++) {
            if (b[i] === "") {
                b[i] = HUMAN;
                const [score, _] = minimax(b, AI);
                b[i] = "";
                if (score < best) { best = score; bestMove = i; }
            }
        }
        return [best, bestMove];
    }
}

function getWinner(b) {
    for (const [a, c, d] of WIN_LINES) {
        if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return null;
}

// ---------- CHECK END ----------
function checkEnd() {
    const winner = getWinner(board);

    if (winner) {
        gameOver = true;

        if (mode === "PvP") {
            const who = winner === "X" ? "Player 1 (X)" : "Player 2 (O)";
            statusEl.textContent = `${who} wins! 🎉`;
            statusEl.style.color = "#2FBF9B";
            setTimeout(() => showPopup(
                `${winner === "X" ? "Player 1" : "Player 2"} Wins!`,
                `Excellent strategy! ${who} completed three in a row.`,
                "win"
            ), 250);
        } else if (winner === HUMAN) {
            statusEl.textContent = "You win! 🎉";
            statusEl.style.color = "#2FBF9B";
            setTimeout(() => showPopup(
                "Congratulations!",
                "You outsmarted the AI and completed three in a row. Great strategic thinking!",
                "win"
            ), 250);
        } else {
            statusEl.textContent = "AI wins. Try again! 🤖";
            statusEl.style.color = "#E85D5D";
            setTimeout(() => showPopup(
                "Good Effort!",
                "The AI won this round, but every match helps strengthen planning and strategy. Try another round!",
                "loss"
            ), 250);
        }
        return true;
    }

    if (!board.includes("")) {
        gameOver = true;
        statusEl.textContent = "It's a draw! 🤝";
        statusEl.style.color = "#6B7A99";
        setTimeout(() => showPopup(
            "Great Match!",
            "The round ended in a draw. Strong defense from both sides—try again to find the winning move!",
            "draw"
        ), 250);
        return true;
    }

    return false;
}

// ---------- POPUP ----------
function showPopup(title, message, type) {
    popupTitle.textContent = title;
    popupMessage.textContent = message;

    const icons = { win: "🏆", loss: "🌱", draw: "🤝" };
    popupIcon.textContent = icons[type] || "🤝";

    popupCard.classList.remove("loss", "draw");
    if (type === "loss") popupCard.classList.add("loss");
    if (type === "draw") popupCard.classList.add("draw");

    popup.classList.remove("hidden");
}

function closePopupAndReset() {
    popup.classList.add("hidden");
    resetGame();
}

// ---------- RESET ----------
function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    turn = HUMAN;
    gameOver = false;
    startTime = Date.now();

    cells.forEach(cell => {
        cell.textContent = "";
        cell.disabled = false;
        cell.classList.remove("x-mark", "o-mark");
    });

    updateStatus();
    popup.classList.add("hidden");
}

// ---------- DAILY TIMER (simple version) ----------
let remainingSeconds = 15 * 60;
const timerEl = document.getElementById("timer");

// Load from localStorage if same day
const today = new Date().toDateString();
const saved = JSON.parse(localStorage.getItem("ttt_daily") || "{}");
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
        localStorage.setItem("ttt_daily", JSON.stringify({
            date: today,
            remaining: remainingSeconds
        }));

        if (remainingSeconds === 0) {
            alert("Daily 15-minute allowance for Tic Tac Toe has been used.\n\nIt will renew automatically tomorrow.");
            window.location.href = "index.html";
        }
    }
}, 1000);

console.log("Tic Tac Toe loaded ✓");
