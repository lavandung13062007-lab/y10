const BEST_KEY = "y9-basketball-best";
const ROUND_SECONDS = 40;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const timeLeftEl = document.getElementById("timeLeft");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

const VW = 380, VH = 560;
const GRAVITY = 900;
const BALL_R = 15;
const START_X = VW / 2, START_Y = VH - 70;
const HOOP_Y = 100, HOOP_HALF_W = 30, HOOP_AMPL = 90;
const POWER = 3.4;

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let ball, hoopCenterX, hoopPhase, score, timeLeft, countdownTimer, dpr;
let dragging = false, dragStart = null, dragCurrent = null;
let scoredThisFlight = false;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function resetBall() {
  ball = { x: START_X, y: START_Y, vx: 0, vy: 0, flying: false };
  scoredThisFlight = false;
}

function reset() {
  resetBall();
  hoopPhase = 0;
  score = 0;
  timeLeft = ROUND_SECONDS;
  scoreEl.textContent = "0";
  timeLeftEl.textContent = String(timeLeft);
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
  countdownTimer = setInterval(() => {
    timeLeft--;
    timeLeftEl.textContent = String(timeLeft);
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  state = "over";
  clearInterval(countdownTimer);
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = "Hết giờ!";
  overlayMsgEl.textContent = `Ném vào ${score} lần · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Ném Bóng Rổ";
  overlayMsgEl.textContent = "40 giây, ném càng nhiều càng tốt";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", (e) => { e.stopPropagation(); startGame(); });

function pointFromEvent(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: ((clientX - rect.left) / rect.width) * VW,
    y: ((clientY - rect.top) / rect.height) * VH,
  };
}

canvas.addEventListener("pointerdown", (e) => {
  if (state === "ready") { startGame(); return; }
  if (state !== "playing" || ball.flying) return;
  dragging = true;
  dragStart = pointFromEvent(e);
  dragCurrent = dragStart;
});
window.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  dragCurrent = pointFromEvent(e);
});
window.addEventListener("pointerup", (e) => {
  if (!dragging) return;
  dragging = false;
  const dx = dragStart.x - dragCurrent.x;
  const dy = dragStart.y - dragCurrent.y;
  if (dy > 12) {
    const vx = dx * POWER;
    const vy = dy * POWER;
    const speed = Math.hypot(vx, vy);
    const clamped = Math.max(150, Math.min(700, speed));
    const scale = clamped / speed;
    ball.vx = vx * scale;
    ball.vy = -vy * scale;
    ball.flying = true;
    scoredThisFlight = false;
  }
});

function update(dt) {
  if (state !== "playing") return;
  hoopPhase += dt;
  hoopCenterX = VW / 2 + Math.sin(hoopPhase * 0.7) * HOOP_AMPL;

  if (!ball.flying) return;

  ball.vy += GRAVITY * dt;
  const prevY = ball.y;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx *= -0.6; }
  if (ball.x + BALL_R > VW) { ball.x = VW - BALL_R; ball.vx *= -0.6; }

  if (!scoredThisFlight && ball.vy > 0 && prevY < HOOP_Y && ball.y >= HOOP_Y) {
    const hoopL = hoopCenterX - HOOP_HALF_W + 8;
    const hoopR = hoopCenterX + HOOP_HALF_W - 8;
    if (ball.x > hoopL && ball.x < hoopR) {
      scoredThisFlight = true;
      score++;
      scoreEl.textContent = score;
    }
  }

  if (ball.y - BALL_R > VH) {
    resetBall();
  }
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  const bg = ctx.createLinearGradient(0, 0, 0, VH);
  bg.addColorStop(0, "#241a44");
  bg.addColorStop(1, "#0f1420");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, VH);

  if (state === "playing") {
    ctx.strokeStyle = "#ff6b81";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(hoopCenterX - HOOP_HALF_W, HOOP_Y);
    ctx.lineTo(hoopCenterX + HOOP_HALF_W, HOOP_Y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      const x = hoopCenterX + i * (HOOP_HALF_W / 2.2);
      ctx.beginPath();
      ctx.moveTo(x, HOOP_Y + 2);
      ctx.lineTo(x * 0.94 + hoopCenterX * 0.06, HOOP_Y + 34);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffd76e";
    ctx.fillRect(hoopCenterX - 2, HOOP_Y - 40, 4, 40);

    if (dragging) {
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(dragCurrent.x, dragCurrent.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.fillStyle = "#ff9f43";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(15,20,32,0.5)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ball.x - BALL_R, ball.y);
  ctx.lineTo(ball.x + BALL_R, ball.y);
  ctx.moveTo(ball.x, ball.y - BALL_R);
  ctx.lineTo(ball.x, ball.y + BALL_R);
  ctx.stroke();
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
