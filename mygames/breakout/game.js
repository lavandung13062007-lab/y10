const BEST_KEY = "y9-breakout-best";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stageOuter = document.querySelector(".stage-outer");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

const VW = 380, VH = 570;
const PADDLE_W = 74, PADDLE_H = 12, PADDLE_Y = VH - 34;
const BALL_R = 7;
const BALL_SPEED = 270;
const ROWS = 5, COLS = 7;
const BRICK_TOP = 54, BRICK_H = 18, BRICK_GAP = 5;
const BRICK_W = (VW - BRICK_GAP * (COLS + 1)) / COLS;
const START_LIVES = 3;

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over | win
let paddleX, ball, launched, bricks, score, lives, dpr;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildBricks() {
  const rowColors = ["#ff6b81", "#ff9f43", "#ffd76e", "#00d9c0", "#6c5ce7"];
  const arr = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      arr.push({
        x: BRICK_GAP + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        w: BRICK_W, h: BRICK_H,
        color: rowColors[r % rowColors.length],
        alive: true,
      });
    }
  }
  return arr;
}

function resetBall() {
  ball = { x: paddleX + PADDLE_W / 2, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 };
  launched = false;
}

function reset() {
  paddleX = (VW - PADDLE_W) / 2;
  bricks = buildBricks();
  score = 0;
  lives = START_LIVES;
  scoreEl.textContent = "0";
  livesEl.textContent = String(lives);
  resetBall();
}

function launch() {
  if (state === "ready") { startGame(); return; }
  if (state !== "playing" || launched) return;
  const angle = (Math.random() * 0.5 - 0.25) * Math.PI; // lệch nhẹ so với thẳng đứng
  ball.vx = BALL_SPEED * Math.sin(angle);
  ball.vy = -BALL_SPEED * Math.cos(angle);
  launched = true;
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
}

function loseLife() {
  lives--;
  livesEl.textContent = String(lives);
  if (lives <= 0) {
    endGame(false);
  } else {
    resetBall();
  }
}

function endGame(won) {
  state = won ? "win" : "over";
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = won ? "🎉 Phá hết gạch!" : "💥 Hết mạng rồi";
  overlayMsgEl.textContent = `Điểm: ${score} · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Phá Gạch";
  overlayMsgEl.textContent = "Bấm hoặc nhấn phím cách để thả bóng";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startGame();
});
stageOuter.addEventListener("pointerdown", () => {
  if (state === "ready") { startGame(); return; }
  launch();
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Space") { e.preventDefault(); launch(); }
});

function setPaddleFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const relX = ((clientX - rect.left) / rect.width) * VW;
  paddleX = Math.max(0, Math.min(VW - PADDLE_W, relX - PADDLE_W / 2));
  if (!launched) ball.x = paddleX + PADDLE_W / 2;
}

stageOuter.addEventListener("mousemove", (e) => setPaddleFromClientX(e.clientX));
stageOuter.addEventListener("touchmove", (e) => {
  setPaddleFromClientX(e.touches[0].clientX);
}, { passive: true });

const keys = {};
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") { keys[e.key] = true; e.preventDefault(); }
});
window.addEventListener("keyup", (e) => { keys[e.key] = false; });

function update(dt) {
  if (state !== "playing") return;

  if (keys.ArrowLeft) paddleX = Math.max(0, paddleX - 320 * dt);
  if (keys.ArrowRight) paddleX = Math.min(VW - PADDLE_W, paddleX + 320 * dt);

  if (!launched) {
    ball.x = paddleX + PADDLE_W / 2;
    return;
  }

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx *= -1; }
  if (ball.x + BALL_R > VW) { ball.x = VW - BALL_R; ball.vx *= -1; }
  if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy *= -1; }

  if (
    ball.vy > 0 &&
    ball.y + BALL_R >= PADDLE_Y &&
    ball.y + BALL_R <= PADDLE_Y + PADDLE_H + 8 &&
    ball.x >= paddleX - BALL_R && ball.x <= paddleX + PADDLE_W + BALL_R
  ) {
    ball.y = PADDLE_Y - BALL_R;
    const hitPos = (ball.x - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2); // -1..1
    const angle = hitPos * (Math.PI * 0.38);
    const speed = Math.hypot(ball.vx, ball.vy);
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));
  }

  for (const b of bricks) {
    if (!b.alive) continue;
    if (ball.x + BALL_R > b.x && ball.x - BALL_R < b.x + b.w && ball.y + BALL_R > b.y && ball.y - BALL_R < b.y + b.h) {
      b.alive = false;
      score += 10;
      scoreEl.textContent = score;
      const overlapLeft = ball.x + BALL_R - b.x;
      const overlapRight = b.x + b.w - (ball.x - BALL_R);
      const overlapTop = ball.y + BALL_R - b.y;
      const overlapBottom = b.y + b.h - (ball.y - BALL_R);
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      if (minOverlap === overlapTop || minOverlap === overlapBottom) ball.vy *= -1;
      else ball.vx *= -1;
      if (bricks.every(x => !x.alive)) { endGame(true); return; }
      break;
    }
  }

  if (ball.y - BALL_R > VH) {
    loseLife();
  }
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  const bg = ctx.createLinearGradient(0, 0, 0, VH);
  bg.addColorStop(0, "#1a2140");
  bg.addColorStop(1, "#11162a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, VH);

  for (const b of bricks) {
    if (!b.alive) continue;
    ctx.fillStyle = b.color;
    const r = 4;
    ctx.beginPath();
    ctx.moveTo(b.x + r, b.y);
    ctx.arcTo(b.x + b.w, b.y, b.x + b.w, b.y + b.h, r);
    ctx.arcTo(b.x + b.w, b.y + b.h, b.x, b.y + b.h, r);
    ctx.arcTo(b.x, b.y + b.h, b.x, b.y, r);
    ctx.arcTo(b.x, b.y, b.x + b.w, b.y, r);
    ctx.closePath();
    ctx.fill();
  }

  const paddleGrad = ctx.createLinearGradient(paddleX, 0, paddleX + PADDLE_W, 0);
  paddleGrad.addColorStop(0, "#8a7bff");
  paddleGrad.addColorStop(1, "#00d9c0");
  ctx.fillStyle = paddleGrad;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(paddleX, PADDLE_Y, PADDLE_W, PADDLE_H, 6) : ctx.rect(paddleX, PADDLE_Y, PADDLE_W, PADDLE_H);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
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
