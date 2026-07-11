const SCORE_KEY = "y9-pong-scores";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const stageOuter = document.querySelector(".stage-outer");
const scoreYouEl = document.getElementById("scoreYou");
const scoreAiEl = document.getElementById("scoreAi");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const overlayMsgEl = document.getElementById("overlayMsg");
const overlayBtn = document.getElementById("overlayBtn");

const VW = 380, VH = 560;
const PADDLE_W = 76, PADDLE_H = 10;
const PLAYER_Y = VH - 26, AI_Y = 16;
const BALL_R = 7;
const WIN_SCORE = 5;
const AI_SPEED = 190;

let matchScores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{"you":0,"ai":0}');

let state = "ready"; // ready | playing | over
let playerX, aiX, ball, scoreYou, scoreAi, dpr;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function serveBall(towardPlayer) {
  const angle = (Math.random() * 0.7 - 0.35) * Math.PI * 0.5;
  const speed = 220;
  ball = {
    x: VW / 2, y: VH / 2,
    vx: speed * Math.sin(angle),
    vy: (towardPlayer ? 1 : -1) * speed * Math.cos(angle),
  };
}

function reset() {
  playerX = (VW - PADDLE_W) / 2;
  aiX = (VW - PADDLE_W) / 2;
  scoreYou = 0;
  scoreAi = 0;
  scoreYouEl.textContent = "0";
  scoreAiEl.textContent = "0";
  serveBall(Math.random() < 0.5);
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
}

function saveMatchScores() { localStorage.setItem(SCORE_KEY, JSON.stringify(matchScores)); }

function endGame(playerWon) {
  state = "over";
  if (playerWon) matchScores.you++; else matchScores.ai++;
  saveMatchScores();
  overlayTitleEl.textContent = playerWon ? "🎉 Bạn thắng ván này!" : "😢 Máy thắng ván này";
  overlayMsgEl.textContent = `Tỉ số ${scoreYou} - ${scoreAi} · Tổng: Bạn ${matchScores.you} - Máy ${matchScores.ai}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Bóng Bàn";
  overlayMsgEl.textContent = "Kéo để di chuyển vợt của bạn ở dưới";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", (e) => { e.stopPropagation(); startGame(); });

function setPlayerFromClientX(clientX) {
  const rect = canvas.getBoundingClientRect();
  const relX = ((clientX - rect.left) / rect.width) * VW;
  playerX = Math.max(0, Math.min(VW - PADDLE_W, relX - PADDLE_W / 2));
}
stageOuter.addEventListener("mousemove", (e) => setPlayerFromClientX(e.clientX));
stageOuter.addEventListener("touchmove", (e) => { setPlayerFromClientX(e.touches[0].clientX); }, { passive: true });
stageOuter.addEventListener("pointerdown", () => { if (state === "ready") startGame(); });

function update(dt) {
  if (state !== "playing") return;

  const targetX = ball.x - PADDLE_W / 2;
  const maxMove = AI_SPEED * dt;
  if (Math.abs(targetX - aiX) < maxMove) aiX = targetX;
  else aiX += Math.sign(targetX - aiX) * maxMove;
  aiX = Math.max(0, Math.min(VW - PADDLE_W, aiX));

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.vx *= -1; }
  if (ball.x + BALL_R > VW) { ball.x = VW - BALL_R; ball.vx *= -1; }

  if (ball.vy > 0 && ball.y + BALL_R >= PLAYER_Y && ball.y + BALL_R <= PLAYER_Y + PADDLE_H + 10 &&
      ball.x >= playerX - BALL_R && ball.x <= playerX + PADDLE_W + BALL_R) {
    ball.y = PLAYER_Y - BALL_R;
    const hit = (ball.x - (playerX + PADDLE_W / 2)) / (PADDLE_W / 2);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.05, 420);
    const angle = hit * (Math.PI * 0.35);
    ball.vx = speed * Math.sin(angle);
    ball.vy = -Math.abs(speed * Math.cos(angle));
  }

  if (ball.vy < 0 && ball.y - BALL_R <= AI_Y + PADDLE_H && ball.y - BALL_R >= AI_Y - 10 &&
      ball.x >= aiX - BALL_R && ball.x <= aiX + PADDLE_W + BALL_R) {
    ball.y = AI_Y + PADDLE_H + BALL_R;
    const hit = (ball.x - (aiX + PADDLE_W / 2)) / (PADDLE_W / 2);
    const speed = Math.min(Math.hypot(ball.vx, ball.vy) * 1.05, 420);
    const angle = hit * (Math.PI * 0.35);
    ball.vx = speed * Math.sin(angle);
    ball.vy = Math.abs(speed * Math.cos(angle));
  }

  if (ball.y - BALL_R > VH) {
    scoreAi++;
    scoreAiEl.textContent = scoreAi;
    if (scoreAi >= WIN_SCORE) { endGame(false); return; }
    serveBall(false);
  } else if (ball.y + BALL_R < 0) {
    scoreYou++;
    scoreYouEl.textContent = scoreYou;
    if (scoreYou >= WIN_SCORE) { endGame(true); return; }
    serveBall(true);
  }
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  const bg = ctx.createLinearGradient(0, 0, 0, VH);
  bg.addColorStop(0, "#1a2140");
  bg.addColorStop(1, "#11162a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, VH);

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(0, VH / 2);
  ctx.lineTo(VW, VH / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  const playerGrad = ctx.createLinearGradient(playerX, 0, playerX + PADDLE_W, 0);
  playerGrad.addColorStop(0, "#8a7bff");
  playerGrad.addColorStop(1, "#00d9c0");
  ctx.fillStyle = playerGrad;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(playerX, PLAYER_Y, PADDLE_W, PADDLE_H, 5) : ctx.rect(playerX, PLAYER_Y, PADDLE_W, PADDLE_H);
  ctx.fill();

  ctx.fillStyle = "#ff9f43";
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(aiX, AI_Y, PADDLE_W, PADDLE_H, 5) : ctx.rect(aiX, AI_Y, PADDLE_W, PADDLE_H);
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
