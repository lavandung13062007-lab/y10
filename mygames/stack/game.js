const BEST_KEY = "y9-stack-best";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stageOuter = document.querySelector(".stage-outer");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

const VW = 380, VH = 560;
const BLOCK_H = 30;
const FIXED_Y = VH * 0.55;
const BASE_WIDTH = 200;
const BASE_SPEED = 130;

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let blocks, stackTopY, cameraOffset, score, dpr;
let current; // { x, width, y, dir, speed, color }

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function colorForIndex(i) {
  const hue = (165 + i * 18) % 360;
  return `hsl(${hue},65%,55%)`;
}

function spawnCurrent(width) {
  const fromLeft = Math.random() < 0.5;
  current = {
    x: fromLeft ? -width : VW,
    width,
    y: stackTopY - BLOCK_H,
    dir: fromLeft ? 1 : -1,
    speed: BASE_SPEED + Math.min(score * 4, 160),
    color: colorForIndex(blocks.length),
  };
}

function reset() {
  blocks = [{ x: (VW - BASE_WIDTH) / 2, width: BASE_WIDTH, y: VH - BLOCK_H, color: "hsl(165,60%,45%)" }];
  stackTopY = VH - BLOCK_H;
  cameraOffset = 0;
  score = 0;
  scoreEl.textContent = "0";
  spawnCurrent(BASE_WIDTH);
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
}

function drop() {
  if (state === "ready") { startGame(); return; }
  if (state !== "playing") return;

  const prev = blocks[blocks.length - 1];
  const left = Math.max(current.x, prev.x);
  const right = Math.min(current.x + current.width, prev.x + prev.width);
  const overlap = right - left;

  if (overlap <= 4) {
    endGame();
    return;
  }

  const newBlock = { x: left, width: overlap, y: current.y, color: current.color };
  blocks.push(newBlock);
  stackTopY = newBlock.y;
  score++;
  scoreEl.textContent = score;
  spawnCurrent(overlap);
}

function endGame() {
  state = "over";
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = "Đổ tháp rồi!";
  overlayMsgEl.textContent = `Xếp được ${score} tầng · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Xếp Tháp";
  overlayMsgEl.textContent = "Bấm để thả khối, càng thẳng hàng càng tốt";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", (e) => { e.stopPropagation(); startGame(); });
stageOuter.addEventListener("pointerdown", drop);
window.addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); drop(); } });

function update(dt) {
  if (state !== "playing") return;
  current.x += current.dir * current.speed * dt;
  if (current.x <= 0 || current.x + current.width >= VW) {
    current.x = Math.max(0, Math.min(current.x, VW - current.width));
    current.dir *= -1;
  }
  const desired = Math.max(0, FIXED_Y - stackTopY);
  if (desired > cameraOffset) cameraOffset = desired;
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  const bg = ctx.createLinearGradient(0, 0, 0, VH);
  bg.addColorStop(0, "#241a44");
  bg.addColorStop(1, "#0f1420");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, VH);

  for (const b of blocks) {
    const sy = b.y + cameraOffset;
    if (sy > VH || sy + BLOCK_H < 0) continue;
    ctx.fillStyle = b.color || "hsl(165,60%,45%)";
    ctx.fillRect(b.x, sy, b.width, BLOCK_H);
  }

  if (current) {
    const sy = current.y + cameraOffset;
    ctx.fillStyle = current.color;
    ctx.fillRect(current.x, sy, current.width, BLOCK_H);
  }
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
reset();
render();
showReadyOverlay();
requestAnimationFrame(loop);
