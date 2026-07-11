const SCORE_KEY = "y9-connect4-scores";
const ROWS = 6, COLS = 7;

const boardEl = document.getElementById("board");
const turnMsg = document.getElementById("turnMsg");
const restartBtn = document.getElementById("restartBtn");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");
const scoreYouEl = document.getElementById("scoreYou");
const scoreDrawEl = document.getElementById("scoreDraw");
const scoreAiEl = document.getElementById("scoreAi");

let scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{"you":0,"draw":0,"ai":0}');
scoreYouEl.textContent = scores.you;
scoreDrawEl.textContent = scores.draw;
scoreAiEl.textContent = scores.ai;

let grid, gameOver, winCells, busy;

function inBounds(r, c) { return r >= 0 && r < ROWS && c >= 0 && c < COLS; }

function dropDisc(col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!grid[r][col]) { grid[r][col] = player; return r; }
  }
  return -1;
}

function countDir(row, col, dr, dc, player) {
  let r = row + dr, c = col + dc, count = 0;
  while (inBounds(r, c) && grid[r][c] === player) { count++; r += dr; c += dc; }
  return count;
}

function checkWinAt(row, col, player) {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of dirs) {
    const forward = countDir(row, col, dr, dc, player);
    const backward = countDir(row, col, -dr, -dc, player);
    if (1 + forward + backward >= 4) {
      const cells = [[row, col]];
      let r = row + dr, c = col + dc;
      while (inBounds(r, c) && grid[r][c] === player) { cells.push([r, c]); r += dr; c += dc; }
      r = row - dr; c = col - dc;
      while (inBounds(r, c) && grid[r][c] === player) { cells.push([r, c]); r -= dr; c -= dc; }
      return cells;
    }
  }
  return null;
}

function validCols() {
  const cols = [];
  for (let c = 0; c < COLS; c++) if (!grid[0][c]) cols.push(c);
  return cols;
}

function isFull() { return validCols().length === 0; }

function aiChooseColumn() {
  const cols = validCols();

  for (const c of cols) {
    const r = dropDisc(c, "ai");
    const win = checkWinAt(r, c, "ai");
    grid[r][c] = null;
    if (win) return c;
  }
  for (const c of cols) {
    const r = dropDisc(c, "you");
    const win = checkWinAt(r, c, "you");
    grid[r][c] = null;
    if (win) return c;
  }

  let bestScore = -Infinity, bestCols = [];
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const c of cols) {
    const r = dropDisc(c, "ai");
    let score = 0;
    for (const [dr, dc] of dirs) {
      score += countDir(r, c, dr, dc, "ai") + countDir(r, c, -dr, -dc, "ai");
    }
    score -= Math.abs(c - 3) * 0.5;
    grid[r][c] = null;
    if (score > bestScore) { bestScore = score; bestCols = [c]; }
    else if (score === bestScore) bestCols.push(c);
  }
  return bestCols[Math.floor(Math.random() * bestCols.length)];
}

function render() {
  let html = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = grid[r][c];
      const isWin = winCells && winCells.some(([wr, wc]) => wr === r && wc === c);
      html += `<div class="c4-cell${player ? " " + player : ""}${isWin ? " win" : ""}" data-col="${c}"></div>`;
    }
  }
  boardEl.innerHTML = html;
  boardEl.querySelectorAll(".c4-cell").forEach(el => {
    el.addEventListener("click", () => onColumnClick(parseInt(el.dataset.col, 10)));
  });
}

function saveScores() { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); }

function endGame(result) {
  gameOver = true;
  if (result === "you") { scores.you++; overlayMsgEl.textContent = "🎉 Bạn thắng!"; }
  else if (result === "ai") { scores.ai++; overlayMsgEl.textContent = "😢 Máy thắng rồi"; }
  else { scores.draw++; overlayMsgEl.textContent = "🤝 Hòa nhau"; }
  saveScores();
  scoreYouEl.textContent = scores.you;
  scoreDrawEl.textContent = scores.draw;
  scoreAiEl.textContent = scores.ai;
  render();
  overlayEl.classList.remove("hidden");
}

function onColumnClick(col) {
  if (gameOver || busy) return;
  const r = dropDisc(col, "you");
  if (r === -1) return;

  const win = checkWinAt(r, col, "you");
  if (win) { winCells = win; render(); endGame("you"); return; }
  if (isFull()) { render(); endGame("draw"); return; }

  busy = true;
  turnMsg.textContent = "Máy đang suy nghĩ...";
  render();

  setTimeout(() => {
    const aiCol = aiChooseColumn();
    const ar = dropDisc(aiCol, "ai");
    const aiWin = checkWinAt(ar, aiCol, "ai");
    if (aiWin) { winCells = aiWin; render(); endGame("ai"); busy = false; return; }
    if (isFull()) { render(); endGame("draw"); busy = false; return; }
    turnMsg.textContent = "Đến lượt bạn";
    busy = false;
    render();
  }, 500);
}

function newGame() {
  grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameOver = false;
  winCells = null;
  busy = false;
  turnMsg.textContent = "Đến lượt bạn";
  overlayEl.classList.add("hidden");
  render();
}

restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
