const BEST_KEY = "y9-sudoku-best";
const SIZE = 6;
const CLEAR_COUNT = 20;

const board = document.getElementById("board");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restartBtn");
const numpad = document.getElementById("numpad");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

let best = localStorage.getItem(BEST_KEY);
bestEl.textContent = best ? best + "s" : "—";

const BASE_SOLUTION = [
  [1, 2, 3, 4, 5, 6],
  [4, 5, 6, 1, 2, 3],
  [2, 3, 1, 5, 6, 4],
  [5, 6, 4, 2, 3, 1],
  [3, 1, 2, 6, 4, 5],
  [6, 4, 5, 3, 1, 2],
];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateSolution() {
  const digitMap = shuffleArray([1, 2, 3, 4, 5, 6]);
  let grid = BASE_SOLUTION.map(row => row.map(v => digitMap[v - 1]));

  const rowBands = [[0, 1], [2, 3], [4, 5]];
  let newRowOrder = [];
  for (const band of rowBands) newRowOrder.push(...shuffleArray(band));
  grid = newRowOrder.map(r => grid[r]);

  const bandOrder = shuffleArray([0, 1, 2]);
  const bandedRows = [];
  for (const b of bandOrder) bandedRows.push(grid[b * 2], grid[b * 2 + 1]);
  grid = bandedRows;

  const colBands = [[0, 1, 2], [3, 4, 5]];
  let newColOrder = [];
  for (const band of colBands) newColOrder.push(...shuffleArray(band));
  grid = grid.map(row => newColOrder.map(c => row[c]));

  const colBandOrder = shuffleArray([0, 1]);
  grid = grid.map(row => {
    const newRow = [];
    for (const b of colBandOrder) newRow.push(row[b * 3], row[b * 3 + 1], row[b * 3 + 2]);
    return newRow;
  });

  return grid;
}

let solution, given, userGrid, selected, startTime, timerInterval, won;

function idx(r, c) { return r * SIZE + c; }

function makePuzzle() {
  solution = generateSolution();
  given = Array.from({ length: SIZE }, () => Array(SIZE).fill(true));
  const positions = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) positions.push([r, c]);
  const toClear = shuffleArray(positions).slice(0, CLEAR_COUNT);
  for (const [r, c] of toClear) given[r][c] = false;
  userGrid = solution.map((row, r) => row.map((v, c) => (given[r][c] ? v : 0)));
}

function render() {
  board.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const el = document.createElement("div");
      const v = userGrid[r][c];
      let cls = "scell";
      if (given[r][c]) cls += " given";
      if (selected && selected[0] === r && selected[1] === c) cls += " selected";
      if (!given[r][c] && v !== 0 && v !== solution[r][c]) cls += " wrong";
      if (c % 3 === 2 && c !== SIZE - 1) cls += " band-right";
      if (r % 2 === 1 && r !== SIZE - 1) cls += " band-bottom";
      el.className = cls;
      el.textContent = v === 0 ? "" : String(v);
      el.addEventListener("click", () => onCellClick(r, c));
      board.appendChild(el);
    }
  }
}

function onCellClick(r, c) {
  if (won || given[r][c]) return;
  selected = [r, c];
  render();
}

function onNumClick(n) {
  if (won || !selected) return;
  const [r, c] = selected;
  userGrid[r][c] = n;
  render();
  checkWin();
}

function checkWin() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (userGrid[r][c] !== solution[r][c]) return;
    }
  }
  won = true;
  clearInterval(timerInterval);
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  if (!best || elapsed < parseInt(best, 10)) {
    best = String(elapsed);
    bestEl.textContent = best + "s";
    localStorage.setItem(BEST_KEY, best);
  }
  overlayMsgEl.textContent = `🎉 Xong rồi! ${elapsed} giây`;
  overlayEl.classList.remove("hidden");
}

numpad.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  onNumClick(parseInt(btn.dataset.n, 10));
});

function newGame() {
  makePuzzle();
  selected = null;
  won = false;
  overlayEl.classList.add("hidden");
  startTime = Date.now();
  timerEl.textContent = "0";
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerEl.textContent = String(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);
  render();
}

restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
