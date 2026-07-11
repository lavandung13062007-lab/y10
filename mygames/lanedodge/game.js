const BEST_KEY = "y9-lanedodge-best";

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
const LANES = 3;
const ROAD_MARGIN = 30;
const LANE_W = (VW - ROAD_MARGIN * 2) / LANES;
const CAR_W = 46, CAR_H = 76;
const PLAYER_Y = VH - 110;
const OBST_W = 46, OBST_H = 72;

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let playerLane, playerX, obstacles, elapsed, spawnTimer, score, dpr, stripeOffset;

function laneCenterX(lane) { return ROAD_MARGIN + LANE_W * lane + LANE_W / 2; }

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function reset() {
  playerLane = 1;
  playerX = laneCenterX(playerLane);
  obstacles = [];
  elapsed = 0;
  spawnTimer = 0;
  score = 0;
  stripeOffset = 0;
  scoreEl.textContent = "0";
}

function currentSpeed() {
  return 160 + Math.min(elapsed * 12, 260);
}

function spawnInterval() {
  return Math.max(0.55, 1.1 - elapsed * 0.02);
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * LANES);
  obstacles.push({
    lane, y: -OBST_H,
    color: ["#ff6b81", "#ffd76e", "#4ea8ff", "#ff9f43"][Math.floor(Math.random() * 4)],
  });
}

function startGame() {
  reset();
  state = "playing";
  overlayEl.classList.add("hidden");
}

function moveLane(dir) {
  if (state === "ready") { startGame(); return; }
  if (state !== "playing") return;
  playerLane = Math.max(0, Math.min(LANES - 1, playerLane + dir));
}

overlayBtn.addEventListener("click", (e) => { e.stopPropagation(); startGame(); });
stageOuter.addEventListener("pointerdown", (e) => {
  if (state === "ready") { startGame(); return; }
  const rect = canvas.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  moveLane(relX < 0.5 ? -1 : 1);
});
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); moveLane(-1); }
  else if (e.key === "ArrowRight") { e.preventDefault(); moveLane(1); }
});

function endGame() {
  state = "over";
  if (score > best) {
    best = score;
    bestEl.textContent = best;
    localStorage.setItem(BEST_KEY, String(best));
  }
  overlayTitleEl.textContent = "💥 Va chạm rồi!";
  overlayMsgEl.textContent = `Điểm: ${score} · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function update(dt) {
  if (state !== "playing") return;
  elapsed += dt;
  score = Math.floor(elapsed * 10);
  scoreEl.textContent = score;

  const target = laneCenterX(playerLane);
  playerX += (target - playerX) * Math.min(1, dt * 12);

  const speed = currentSpeed();
  stripeOffset = (stripeOffset + speed * dt) % 40;

  spawnTimer += dt;
  if (spawnTimer >= spawnInterval()) {
    spawnTimer = 0;
    spawnObstacle();
  }

  for (const o of obstacles) o.y += speed * dt;
  obstacles = obstacles.filter(o => o.y < VH + OBST_H);

  const playerRect = { x: playerX - CAR_W / 2, y: PLAYER_Y, w: CAR_W, h: CAR_H };
  for (const o of obstacles) {
    const ox = laneCenterX(o.lane) - OBST_W / 2;
    const oRect = { x: ox, y: o.y, w: OBST_W, h: OBST_H };
    if (playerRect.x < oRect.x + oRect.w && playerRect.x + playerRect.w > oRect.x &&
        playerRect.y < oRect.y + oRect.h && playerRect.y + playerRect.h > oRect.y) {
      endGame();
      return;
    }
  }
}

function drawCar(x, y, color) {
  ctx.fillStyle = color;
  const r = 8;
  ctx.beginPath();
  ctx.moveTo(x - CAR_W / 2 + r, y);
  ctx.arcTo(x + CAR_W / 2, y, x + CAR_W / 2, y + CAR_H, r);
  ctx.arcTo(x + CAR_W / 2, y + CAR_H, x - CAR_W / 2, y + CAR_H, r);
  ctx.arcTo(x - CAR_W / 2, y + CAR_H, x - CAR_W / 2, y, r);
  ctx.arcTo(x - CAR_W / 2, y, x + CAR_W / 2, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(15,20,32,0.35)";
  ctx.fillRect(x - CAR_W / 2 + 6, y + 12, CAR_W - 12, 16);
  ctx.fillRect(x - CAR_W / 2 + 6, y + CAR_H - 28, CAR_W - 12, 16);
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  ctx.fillStyle = "#1a1f30";
  ctx.fillRect(0, 0, VW, VH);
  ctx.fillStyle = "#232a42";
  ctx.fillRect(ROAD_MARGIN, 0, VW - ROAD_MARGIN * 2, VH);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 16]);
  ctx.lineDashOffset = -stripeOffset;
  for (let l = 1; l < LANES; l++) {
    const x = ROAD_MARGIN + LANE_W * l;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, VH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (const o of obstacles) drawCar(laneCenterX(o.lane), o.y, o.color);
  drawCar(playerX, PLAYER_Y, "#00d9c0");
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
overlayTitleEl.textContent = "Né Làn";
overlayMsgEl.textContent = "Bấm trái/phải màn hình hoặc phím mũi tên để đổi làn";
overlayBtn.textContent = "Bắt đầu";
requestAnimationFrame(loop);
