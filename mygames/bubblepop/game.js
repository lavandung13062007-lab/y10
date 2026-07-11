const BEST_KEY = "y9-bubblepop-best";
const ROWS = 9, COLS = 8;
const COLORS = ["#ff6b81", "#ffd76e", "#00d9c0", "#4ea8ff", "#8a7bff"];

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restartBtn");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let grid, score, over;

function idx(r, c) { return r * COLS + c; }

function buildGrid() {
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = [];
    for (let c = 0; c < COLS; c++) row.push(Math.floor(Math.random() * COLORS.length));
    grid.push(row);
  }
}

function findGroup(r, c) {
  const color = grid[r][c];
  if (color == null) return [];
  const seen = new Set([idx(r, c)]);
  const stack = [[r, c]];
  const group = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const nr = cr + dr, nc = cc + dc;
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      const key = idx(nr, nc);
      if (seen.has(key)) continue;
      if (grid[nr][nc] === color) {
        seen.add(key);
        stack.push([nr, nc]);
        group.push([nr, nc]);
      }
    }
  }
  return group;
}

function applyGravity() {
  for (let c = 0; c < COLS; c++) {
    const stack = [];
    for (let r = ROWS - 1; r >= 0; r--) if (grid[r][c] != null) stack.push(grid[r][c]);
    for (let r = ROWS - 1; r >= 0; r--) {
      grid[r][c] = r >= ROWS - stack.length ? stack[ROWS - 1 - r] : null;
    }
  }
}

function anyGroupExists() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] == null) continue;
      if (findGroup(r, c).length >= 2) return true;
    }
  }
  return false;
}

function isBoardEmpty() {
  return grid.every(row => row.every(v => v == null));
}

function render() {
  board.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = grid[r][c];
      const el = document.createElement("div");
      el.className = "bubble" + (v == null ? " empty" : "");
      if (v != null) el.style.background = COLORS[v];
      el.addEventListener("click", () => onCellClick(r, c));
      board.appendChild(el);
    }
  }
}

function onCellClick(r, c) {
  if (over || grid[r][c] == null) return;
  const group = findGroup(r, c);
  if (group.length < 2) return;
  for (const [gr, gc] of group) grid[gr][gc] = null;
  score += (group.length - 1) * (group.length - 1) * 5;
  scoreEl.textContent = score;
  applyGravity();
  render();

  if (isBoardEmpty()) {
    score += 200;
    scoreEl.textContent = score;
    endGame(true);
    return;
  }
  if (!anyGroupExists()) endGame(false);
}

function endGame(cleared) {
  over = true;
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayMsgEl.textContent = cleared
    ? `🎉 Sạch bàn! Điểm: ${score} · Kỷ lục: ${best}`
    : `Hết nhóm để nổ. Điểm: ${score} · Kỷ lục: ${best}`;
  overlayEl.classList.remove("hidden");
}

function newGame() {
  buildGrid();
  score = 0;
  over = false;
  scoreEl.textContent = "0";
  overlayEl.classList.add("hidden");
  render();
}

restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
