const SCORE_KEY = "y9-caro-scores";

const board = document.getElementById("board");
const turnMsg = document.getElementById("turnMsg");
const restartBtn = document.getElementById("restartBtn");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");
const scoreYouEl = document.getElementById("scoreYou");
const scoreDrawEl = document.getElementById("scoreDraw");
const scoreAiEl = document.getElementById("scoreAi");

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

let scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{"you":0,"draw":0,"ai":0}');
scoreYouEl.textContent = scores.you;
scoreDrawEl.textContent = scores.draw;
scoreAiEl.textContent = scores.ai;

let cells, gameOver, winLine;

function markSvg(player) {
  if (player === "X") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" class="mark-x"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="3" class="mark-o"><circle cx="12" cy="12" r="8"/></svg>`;
}

function checkWinner(state) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { player: state[a], line };
    }
  }
  return null;
}

function isDraw(state) {
  return state.every(c => c) && !checkWinner(state);
}

function minimax(state, isMaximizing) {
  const winner = checkWinner(state);
  if (winner) return winner.player === "O" ? 10 : -10;
  if (isDraw(state)) return 0;

  const empties = state.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empties) {
      state[i] = "O";
      best = Math.max(best, minimax(state, false));
      state[i] = null;
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of empties) {
      state[i] = "X";
      best = Math.min(best, minimax(state, true));
      state[i] = null;
    }
    return best;
  }
}

function aiMove() {
  const empties = cells.map((v, i) => (v ? -1 : i)).filter(i => i >= 0);
  let bestScore = -Infinity;
  let bestMoves = [];
  for (const i of empties) {
    cells[i] = "O";
    const score = minimax(cells, false);
    cells[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [i];
    } else if (score === bestScore) {
      bestMoves.push(i);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function render() {
  board.innerHTML = cells.map((v, i) => `
    <div class="tcell${v ? " taken" : ""}${winLine && winLine.includes(i) ? " win" : ""}" data-index="${i}">
      ${v ? markSvg(v) : ""}
    </div>
  `).join("");
  board.querySelectorAll(".tcell").forEach(el => {
    el.addEventListener("click", () => onCellClick(parseInt(el.dataset.index, 10)));
  });
}

function saveScores() {
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
}

function endGame(result) {
  gameOver = true;
  if (result === "you") {
    scores.you++;
    overlayMsgEl.textContent = "🎉 Bạn thắng!";
  } else if (result === "ai") {
    scores.ai++;
    overlayMsgEl.textContent = "😢 Máy thắng rồi";
  } else {
    scores.draw++;
    overlayMsgEl.textContent = "🤝 Hòa nhau";
  }
  saveScores();
  scoreYouEl.textContent = scores.you;
  scoreDrawEl.textContent = scores.draw;
  scoreAiEl.textContent = scores.ai;
  render();
  overlayEl.classList.remove("hidden");
}

function onCellClick(i) {
  if (gameOver || cells[i]) return;
  cells[i] = "X";
  const win = checkWinner(cells);
  if (win) {
    winLine = win.line;
    render();
    endGame("you");
    return;
  }
  if (isDraw(cells)) {
    render();
    endGame("draw");
    return;
  }

  turnMsg.textContent = "Máy đang suy nghĩ...";
  render();

  setTimeout(() => {
    const aiIdx = aiMove();
    cells[aiIdx] = "O";
    const aiWin = checkWinner(cells);
    if (aiWin) {
      winLine = aiWin.line;
      render();
      endGame("ai");
      return;
    }
    if (isDraw(cells)) {
      render();
      endGame("draw");
      return;
    }
    turnMsg.textContent = "Đến lượt bạn (X)";
    render();
  }, 450);
}

function newGame() {
  cells = Array(9).fill(null);
  gameOver = false;
  winLine = null;
  turnMsg.textContent = "Đến lượt bạn (X)";
  overlayEl.classList.add("hidden");
  render();
}

restartBtn.addEventListener("click", newGame);
overlayBtn.addEventListener("click", newGame);

newGame();
