const BEST_KEY = "y9-snake-best";
const GRID = 16;
const BASE_TICK_MS = 140;
const MIN_TICK_MS = 75;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stageOuter = document.querySelector(".stage-outer");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");
const dpad = document.getElementById("dpad");

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let snake, dir, nextDir, food, score, cellPx, dpr, tickTimer;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  const size = canvas.clientWidth;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cellPx = size / GRID;
  render();
}

function randomEmptyCell() {
  while (true) {
    const c = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!snake.some(s => s.x === c.x && s.y === c.y)) return c;
  }
}

function reset() {
  const mid = Math.floor(GRID / 2);
  snake = [{ x: mid, y: mid }, { x: mid - 1, y: mid }, { x: mid - 2, y: mid }];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = "0";
  food = randomEmptyCell();
}

function currentTickMs() {
  return Math.max(MIN_TICK_MS, BASE_TICK_MS - score * 3);
}

function scheduleTick() {
  clearTimeout(tickTimer);
  tickTimer = setTimeout(tick, currentTickMs());
}

function setDirection(dx, dy) {
  if (state === "ready") { startGame(); return; }
  if (state !== "playing") return;
  // chặn quay đầu 180 độ ngay lập tức (dựa trên hướng đã cam kết, không phải hướng đang chờ)
  if (dx === -dir.x && dy === -dir.y) return;
  nextDir = { x: dx, y: dy };
}

function tick() {
  if (state !== "playing") return;
  dir = nextDir;

  const head = snake[0];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
    endGame();
    return;
  }
  const willEat = newHead.x === food.x && newHead.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  if (bodyToCheck.some(s => s.x === newHead.x && s.y === newHead.y)) {
    endGame();
    return;
  }

  snake.unshift(newHead);
  if (willEat) {
    score++;
    scoreEl.textContent = score;
    food = randomEmptyCell();
  } else {
    snake.pop();
  }

  render();
  scheduleTick();
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
  scheduleTick();
}

function endGame() {
  state = "over";
  clearTimeout(tickTimer);
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = "Toi rồi!";
  overlayMsgEl.textContent = `Điểm: ${score} · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
  render();
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Rắn Săn Mồi";
  overlayMsgEl.textContent = "Bấm hoặc nhấn phím mũi tên để bắt đầu";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

function drawCell(x, y, fillStyle, inset) {
  const pad = inset || 1.5;
  const px = x * cellPx, py = y * cellPx;
  ctx.fillStyle = fillStyle;
  const r = 5;
  const w = cellPx - pad * 2, h = cellPx - pad * 2;
  const rx = px + pad, ry = py + pad;
  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.arcTo(rx + w, ry, rx + w, ry + h, r);
  ctx.arcTo(rx + w, ry + h, rx, ry + h, r);
  ctx.arcTo(rx, ry + h, rx, ry, r);
  ctx.arcTo(rx, ry, rx + w, ry, r);
  ctx.closePath();
  ctx.fill();
}

function render() {
  const size = canvas.clientWidth;
  ctx.clearRect(0, 0, size, size);

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#1a2140");
  bg.addColorStop(1, "#11162a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  for (let i = 1; i < GRID; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellPx, 0);
    ctx.lineTo(i * cellPx, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellPx);
    ctx.lineTo(size, i * cellPx);
    ctx.stroke();
  }

  drawCell(food.x, food.y, "#ff9f43", 3);

  snake.forEach((s, i) => {
    const t = i / Math.max(1, snake.length - 1);
    const hue = 165 + (275 - 165) * t;
    drawCell(s.x, s.y, i === 0 ? "#00d9c0" : `hsl(${hue},70%,55%)`, i === 0 ? 1 : 2);
  });
}

overlayBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startGame();
});
stageOuter.addEventListener("pointerdown", () => {
  if (state === "ready") startGame();
});

window.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  };
  const v = map[e.key];
  if (v) {
    e.preventDefault();
    setDirection(v[0], v[1]);
  }
});

dpad.addEventListener("click", (e) => {
  const btn = e.target.closest(".dpad-btn");
  if (!btn) return;
  const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const v = map[btn.dataset.dir];
  setDirection(v[0], v[1]);
});

let touchStartX = 0, touchStartY = 0;
stageOuter.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });
stageOuter.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const absX = Math.abs(dx), absY = Math.abs(dy);
  if (Math.max(absX, absY) < 20) return;
  if (absX > absY) setDirection(dx > 0 ? 1 : -1, 0);
  else setDirection(0, dy > 0 ? 1 : -1);
}, { passive: true });

window.addEventListener("resize", resizeCanvas);

reset();
resizeCanvas();
showReadyOverlay();
