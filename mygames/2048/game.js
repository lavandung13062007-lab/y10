const SIZE = 4;
const WIN_VALUE = 2048;
const BEST_KEY = "y9-2048-best";

const boardEl = document.getElementById("board");
const gridBgEl = document.getElementById("gridBg");
const tileLayerEl = document.getElementById("tileLayer");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");
const restartBtn = document.getElementById("restartBtn");

let grid, score, best, won, keepPlaying, tileIdSeq;
let tileEls = new Map();
let geom = { originX: 0, originY: 0, step: 0, size: 0 };

const DIRS = {
  ArrowLeft: { dr: 0, dc: -1 },
  ArrowRight: { dr: 0, dc: 1 },
  ArrowUp: { dr: -1, dc: 0 },
  ArrowDown: { dr: 1, dc: 0 },
};

function inBounds(r, c) {
  return r >= 0 && r < SIZE && c >= 0 && c < SIZE;
}

function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function buildBackgroundCells() {
  gridBgEl.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    gridBgEl.appendChild(cell);
  }
}

function measureGeometry() {
  const cells = gridBgEl.children;
  const c0 = cells[0].getBoundingClientRect();
  const c1 = cells[1].getBoundingClientRect();
  const layerRect = tileLayerEl.getBoundingClientRect();
  geom.size = c0.width;
  geom.step = c1.left - c0.left;
  geom.originX = c0.left - layerRect.left;
  geom.originY = c0.top - layerRect.top;
}

function positionTileEl(el, r, c, animate = true) {
  const x = geom.originX + c * geom.step;
  const y = geom.originY + r * geom.step;
  if (!animate) {
    el.style.transition = "none";
    // force reflow so the transition:none takes effect before re-enabling
    void el.offsetWidth;
  }
  el.style.transform = `translate(${x}px, ${y}px)`;
  if (!animate) {
    requestAnimationFrame(() => { el.style.transition = ""; });
  }
}

function digitClass(value) {
  const len = String(value).length;
  if (len >= 5) return "digits-5";
  if (len >= 4) return "digits-4";
  return "";
}

function tileColor(value) {
  if (value >= WIN_VALUE) {
    return "linear-gradient(135deg, #ffd76e, #ff9f43)";
  }
  const exp = Math.log2(value);
  const t = Math.min(Math.max((exp - 1) / 10, 0), 1);
  const hue = 165 + (275 - 165) * t;
  const light = 50 - t * 10;
  return `linear-gradient(135deg, hsl(${hue},70%,${light + 8}%), hsl(${hue + 25},70%,${light}%))`;
}

function createTileEl(tile) {
  const el = document.createElement("div");
  el.className = "tile";
  el.style.width = geom.size + "px";
  el.style.height = geom.size + "px";
  const inner = document.createElement("div");
  inner.className = "tile-inner " + digitClass(tile.value);
  inner.style.background = tileColor(tile.value);
  const span = document.createElement("span");
  span.className = "num";
  span.textContent = tile.value;
  inner.appendChild(span);
  el.appendChild(inner);
  positionTileEl(el, tile.r, tile.c, false);
  tileLayerEl.appendChild(el);
  tileEls.set(tile.id, el);
  return el;
}

function removeTileEl(id) {
  const el = tileEls.get(id);
  if (!el) return;
  tileEls.delete(id);
  el.classList.add("removing");
  setTimeout(() => el.remove(), 160);
}

function updateTileValue(tile) {
  const el = tileEls.get(tile.id);
  if (!el) return;
  const inner = el.querySelector(".tile-inner");
  inner.className = "tile-inner " + digitClass(tile.value);
  inner.style.background = tileColor(tile.value);
  inner.querySelector(".num").textContent = tile.value;
  void inner.offsetWidth;
  inner.classList.add("pop-bump");
  inner.addEventListener("animationend", () => inner.classList.remove("pop-bump"), { once: true });
}

function spawnRandomTile() {
  const empties = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return null;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const tile = { id: tileIdSeq++, value, r, c };
  grid[r][c] = tile;
  return tile;
}

function buildTraversals(dr, dc) {
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3];
  if (dr === 1) rows.reverse();
  if (dc === 1) cols.reverse();
  return { rows, cols };
}

function findFarthest(r, c, dr, dc) {
  let pr = r, pc = c;
  while (true) {
    const nr = pr + dr, nc = pc + dc;
    if (!inBounds(nr, nc) || grid[nr][nc] !== null) break;
    pr = nr; pc = nc;
  }
  return { r: pr, c: pc };
}

function move(dirKey) {
  if (!overlayEl.classList.contains("hidden") && !keepPlaying) return;
  const { dr, dc } = DIRS[dirKey];
  const { rows, cols } = buildTraversals(dr, dc);
  let moved = false;
  const mergedIds = new Set();

  for (const r of rows) {
    for (const c of cols) {
      const tile = grid[r][c];
      if (!tile) continue;

      const farthest = findFarthest(r, c, dr, dc);
      let destR = farthest.r, destC = farthest.c;
      let didMerge = false;

      const nr = farthest.r + dr, nc = farthest.c + dc;
      if (inBounds(nr, nc)) {
        const nextTile = grid[nr][nc];
        if (nextTile && nextTile.value === tile.value && !mergedIds.has(nextTile.id)) {
          destR = nr; destC = nc;
          didMerge = true;
        }
      }

      if (destR === r && destC === c) continue;

      grid[r][c] = null;
      if (didMerge) {
        const target = grid[destR][destC];
        target.value *= 2;
        mergedIds.add(target.id);
        score += target.value;
        if (target.value >= WIN_VALUE && !won) won = true;

        positionTileEl(tileEls.get(tile.id), destR, destC);
        removeTileEl(tile.id);
        setTimeout(() => updateTileValue(target), 100);
      } else {
        grid[destR][destC] = tile;
        tile.r = destR; tile.c = destC;
        positionTileEl(tileEls.get(tile.id), destR, destC);
      }
      moved = true;
    }
  }

  if (!moved) return;

  updateScoreDisplay();
  const newTile = spawnRandomTile();
  if (newTile) {
    const el = createTileEl(newTile);
    const inner = el.querySelector(".tile-inner");
    inner.classList.add("pop-new");
  }

  if (won && !keepPlaying) {
    showOverlay("win");
  } else if (isGameOver()) {
    showOverlay("lose");
  }
}

function isGameOver() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) return false;
      const v = grid[r][c].value;
      if (c + 1 < SIZE && grid[r][c + 1] && grid[r][c + 1].value === v) return false;
      if (r + 1 < SIZE && grid[r + 1][c] && grid[r + 1][c].value === v) return false;
    }
  }
  return true;
}

function updateScoreDisplay() {
  scoreEl.textContent = score;
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
}

function showOverlay(kind) {
  overlayMsgEl.textContent = kind === "win" ? "🎉 Bạn đã đạt 2048!" : "💥 Hết nước đi rồi!";
  overlayBtn.textContent = kind === "win" ? "Chơi tiếp" : "Chơi lại";
  overlayEl.classList.remove("hidden");
  overlayEl.dataset.kind = kind;
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function newGame() {
  grid = createEmptyGrid();
  score = 0;
  won = false;
  keepPlaying = false;
  tileIdSeq = 1;
  tileEls.forEach(el => el.remove());
  tileEls.clear();
  hideOverlay();
  updateScoreDisplay();
  measureGeometry();
  const t1 = spawnRandomTile();
  const t2 = spawnRandomTile();
  if (t1) createTileEl(t1).querySelector(".tile-inner").classList.add("pop-new");
  if (t2) createTileEl(t2).querySelector(".tile-inner").classList.add("pop-new");
}

overlayBtn.addEventListener("click", () => {
  if (overlayEl.dataset.kind === "win") {
    keepPlaying = true;
    hideOverlay();
  } else {
    newGame();
  }
});
restartBtn.addEventListener("click", newGame);

window.addEventListener("keydown", (e) => {
  if (DIRS[e.key]) {
    e.preventDefault();
    move(e.key);
  }
});

let touchStartX = 0, touchStartY = 0;
boardEl.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

boardEl.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) < 24) return;
  if (absX > absY) {
    move(dx > 0 ? "ArrowRight" : "ArrowLeft");
  } else {
    move(dy > 0 ? "ArrowDown" : "ArrowUp");
  }
}, { passive: true });

window.addEventListener("resize", () => {
  measureGeometry();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = grid[r][c];
      if (tile) {
        const el = tileEls.get(tile.id);
        if (el) {
          el.style.width = geom.size + "px";
          el.style.height = geom.size + "px";
          positionTileEl(el, r, c, false);
        }
      }
    }
  }
});

best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;
buildBackgroundCells();
newGame();
