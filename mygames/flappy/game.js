const BEST_KEY = "y9-flappy-best";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stageOuter = document.querySelector(".stage-outer");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

const VW = 380, VH = 570;
const GRAVITY = 1500;
const FLAP_VELOCITY = -420;
const PIPE_SPEED = 165;
const PIPE_GAP = 155;
const PIPE_WIDTH = 62;
const PIPE_INTERVAL = 1.45;
const GROUND_HEIGHT = 56;
const BIRD_X = 100;
const BIRD_RADIUS = 15;

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let bird, pipes, score, spawnTimer, elapsed, clouds, dpr;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function reset() {
  bird = { y: VH / 2, vy: 0, rot: 0 };
  pipes = [];
  score = 0;
  spawnTimer = 0;
  elapsed = 0;
  scoreEl.textContent = "0";
}

function initClouds() {
  clouds = Array.from({ length: 5 }, () => ({
    x: Math.random() * VW,
    y: 30 + Math.random() * 140,
    r: 20 + Math.random() * 24,
    speed: 12 + Math.random() * 10,
  }));
}

function spawnPipe() {
  const margin = 60;
  const gapTop = margin + Math.random() * (VH - GROUND_HEIGHT - margin * 2 - PIPE_GAP);
  pipes.push({ x: VW + PIPE_WIDTH, gapTop, scored: false });
}

function flap() {
  if (state === "ready") {
    startGame();
    return;
  }
  if (state === "over") return;
  bird.vy = FLAP_VELOCITY;
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
}

function endGame() {
  state = "over";
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = "Va chạm rồi!";
  overlayMsgEl.textContent = `Điểm: ${score} · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Flappy";
  overlayMsgEl.textContent = "Bấm hoặc nhấn phím cách để bắt đầu";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startGame();
});
stageOuter.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  flap();
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.key === "ArrowUp") {
    e.preventDefault();
    flap();
  }
});

function update(dt) {
  if (state !== "playing") return;
  elapsed += dt;

  bird.vy += GRAVITY * dt;
  bird.y += bird.vy * dt;
  bird.rot = Math.max(-0.5, Math.min(1.1, bird.vy / 500));

  spawnTimer += dt;
  if (spawnTimer >= PIPE_INTERVAL) {
    spawnTimer = 0;
    spawnPipe();
  }

  for (const p of pipes) p.x -= PIPE_SPEED * dt;
  pipes = pipes.filter(p => p.x > -PIPE_WIDTH);

  for (const p of pipes) {
    if (!p.scored && p.x + PIPE_WIDTH < BIRD_X - BIRD_RADIUS) {
      p.scored = true;
      score++;
      scoreEl.textContent = score;
    }
  }

  for (const cl of clouds) {
    cl.x -= cl.speed * dt;
    if (cl.x < -cl.r) cl.x = VW + cl.r;
  }

  if (bird.y + BIRD_RADIUS > VH - GROUND_HEIGHT) {
    bird.y = VH - GROUND_HEIGHT - BIRD_RADIUS;
    endGame();
    return;
  }
  if (bird.y - BIRD_RADIUS < 0) {
    bird.y = BIRD_RADIUS;
    bird.vy = 0;
  }

  for (const p of pipes) {
    const withinX = BIRD_X + BIRD_RADIUS > p.x && BIRD_X - BIRD_RADIUS < p.x + PIPE_WIDTH;
    if (withinX) {
      const hitsTop = bird.y - BIRD_RADIUS < p.gapTop;
      const hitsBottom = bird.y + BIRD_RADIUS > p.gapTop + PIPE_GAP;
      if (hitsTop || hitsBottom) {
        endGame();
        return;
      }
    }
  }
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, "#2a1f55");
  g.addColorStop(1, "#0f1420");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  for (const cl of clouds) {
    ctx.beginPath();
    ctx.ellipse(cl.x, cl.y, cl.r, cl.r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPipe(p) {
  const grad = ctx.createLinearGradient(p.x, 0, p.x + PIPE_WIDTH, 0);
  grad.addColorStop(0, "hsl(165,65%,42%)");
  grad.addColorStop(1, "hsl(190,65%,34%)");
  ctx.fillStyle = grad;

  const topH = p.gapTop;
  ctx.fillRect(p.x, 0, PIPE_WIDTH, topH);
  ctx.fillRect(p.x - 4, topH - 18, PIPE_WIDTH + 8, 18);

  const bottomY = p.gapTop + PIPE_GAP;
  ctx.fillRect(p.x, bottomY, PIPE_WIDTH, VH - GROUND_HEIGHT - bottomY);
  ctx.fillRect(p.x - 4, bottomY, PIPE_WIDTH + 8, 18);
}

function drawGround() {
  const y = VH - GROUND_HEIGHT;
  const grad = ctx.createLinearGradient(0, y, 0, VH);
  grad.addColorStop(0, "#3a2e63");
  grad.addColorStop(1, "#241a44");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, VW, GROUND_HEIGHT);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 3;
  const offset = (elapsed * PIPE_SPEED) % 28;
  ctx.beginPath();
  for (let x = -offset; x < VW + 28; x += 28) {
    ctx.moveTo(x, y + 4);
    ctx.lineTo(x + 14, y + GROUND_HEIGHT - 4);
  }
  ctx.stroke();
}

function drawBird() {
  ctx.save();
  ctx.translate(BIRD_X, bird.y);
  ctx.rotate(bird.rot);

  const grad = ctx.createLinearGradient(-BIRD_RADIUS, -BIRD_RADIUS, BIRD_RADIUS, BIRD_RADIUS);
  grad.addColorStop(0, "#8a7bff");
  grad.addColorStop(1, "#00d9c0");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  const wingPhase = Math.sin(elapsed * 14) * 0.5 + 0.5;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.ellipse(-3, 3 + wingPhase * 3, 8, 5, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(5, -4, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(6, -4, 1.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffb84d";
  ctx.beginPath();
  ctx.moveTo(BIRD_RADIUS - 2, -2);
  ctx.lineTo(BIRD_RADIUS + 9, 1);
  ctx.lineTo(BIRD_RADIUS - 2, 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function render() {
  drawBackground();
  for (const p of pipes) drawPipe(p);
  drawGround();
  drawBird();
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
initClouds();
render();
showReadyOverlay();
requestAnimationFrame(loop);
