const BEST_KEY = "y9-blockpuzzle-best";
const GRID = 8;

const board = document.getElementById("board");
const tray = document.getElementById("tray");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restartBtn");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

const SHAPES = [
  { cells: [[0, 0]] },
  { cells: [[0, 0], [1, 0]] },
  { cells: [[0, 0], [0, 1]] },
  { cells: [[0, 0], [1, 0], [2, 0]] },
  { cells: [[0, 0], [0, 1], [0, 2]] },
  { cells: [[0, 0], [0, 1], [1, 1]] },
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
  { cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3]] },
  { cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
  { cells: [[0, 0], [0, 1], [0, 2], [1, 2]] },
  { cells: [[1, 0], [2, 0], [0, 1], [1, 1]] },
];

const COLORS = ["hsl(165,60%,50%)", "hsl(255,60%,60%)", "hsl(30,80%,55%)", "hsl(340,70%,60%)", "hsl(200,70%,55%)", "hsl(48,80%,55%)"];

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let cells, pending, selectedIndex, score, over;

function idx(r, c) { return r * GRID + c; }

function randomShape() {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { cells: shape.cells, color };
}

function shapeSize(shape) {
  let maxX = 0, maxY = 0;
  for (const [x, y] of shape.cells) { maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  return { w: maxX + 1, h: maxY + 1 };
}

function canPlace(shape, originR, originC) {
  for (const [dx, dy] of shape.cells) {
    const r = originR + dy, c = originC + dx;
    if (r < 0 || r >= GRID || c < 0 || c >= GRID) return false;
    if (cells[idx(r, c)]) return false;
  }
  return true;
}

function anyPlacementExists(shape) {
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (canPlace(shape, r, c)) return true;
    }
  }
  return false;
}

function placeShape(shape, originR, originC) {
  for (const [dx, dy] of shape.cells) {
    cells[idx(originR + dy, originC + dx)] = shape.color;
  }
  let cleared = 0;
  const fullRows = [];
  const fullCols = [];
  for (let r = 0; r < GRID; r++) {
    let full = true;
    for (let c = 0; c < GRID; c++) if (!cells[idx(r, c)]) { full = false; break; }
    if (full) fullRows.push(r);
  }
  for (let c = 0; c < GRID; c++) {
    let full = true;
    for (let r = 0; r < GRID; r++) if (!cells[idx(r, c)]) { full = false; break; }
    if (full) fullCols.push(c);
  }
  for (const r of fullRows) for (let c = 0; c < GRID; c++) cells[idx(r, c)] = null;
  for (const c of fullCols) for (let r = 0; r < GRID; r++) cells[idx(r, c)] = null;
  cleared = fullRows.length + fullCols.length;

  score += shape.cells.length + cleared * 10;
  scoreEl.textContent = score;
}

function renderBoard() {
  board.innerHTML = "";
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const el = document.createElement("div");
      el.className = "bcell" + (cells[idx(r, c)] ? " filled" : "");
      if (cells[idx(r, c)]) el.style.background = cells[idx(r, c)];
      el.dataset.r = r;
      el.dataset.c = c;
      el.addEventListener("click", () => onCellClick(r, c));
      board.appendChild(el);
    }
  }
}

function renderTray() {
  tray.innerHTML = "";
  pending.forEach((item, i) => {
    const slot = document.createElement("div");
    slot.className = "tray-slot" + (item ? "" : " empty") + (selectedIndex === i ? " selected" : "");
    if (item) {
      const { w, h } = shapeSize(item);
      const shapeEl = document.createElement("div");
      shapeEl.className = "tray-shape";
      shapeEl.style.gridTemplateColumns = `repeat(${w}, 12px)`;
      shapeEl.style.gridTemplateRows = `repeat(${h}, 12px)`;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const on = item.cells.some(([cx, cy]) => cx === x && cy === y);
          const c = document.createElement("div");
          c.className = "tray-cell " + (on ? "on" : "off");
          if (on) c.style.setProperty("--shape-color", item.color);
          shapeEl.appendChild(c);
        }
      }
      slot.appendChild(shapeEl);
      slot.addEventListener("click", () => { selectedIndex = i; renderTray(); });
    }
    tray.appendChild(slot);
  });
}

function refillIfNeeded() {
  if (pending.every(p => p === null)) {
    pending = [randomShape(), randomShape(), randomShape()];
  }
}

function checkGameOver() {
  const anyFits = pending.some(p => p && anyPlacementExists(p));
  if (!anyFits) endGame();
}

function onCellClick(r, c) {
  if (over || selectedIndex == null) return;
  const shape = pending[selectedIndex];
  if (!shape || !canPlace(shape, r, c)) return;
  placeShape(shape, r, c);
  pending[selectedIndex] = null;
  selectedIndex = null;
  refillIfNeeded();
  renderBoard();
  renderTray();
  checkGameOver();
}

function endGame() {
  over = true;
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayMsgEl.textContent = `Hết chỗ đặt rồi! Điểm: ${score} · Kỷ lục: ${best}`;
  overlayEl.classList.remove("hidden");
}

function newGame() {
  cells = Array(GRID * GRID).fill(null);
  pending = [randomShape(), randomShape(), randomShape()];
  selectedIndex = null;
  score = 0;
  over = false;
  scoreEl.textContent = "0";
  overlayEl.classList.add("hidden");
  renderBoard();
  renderTray();
}

restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
