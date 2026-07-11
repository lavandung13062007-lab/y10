const BEST_KEY = "y9-jumper-best";

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
const GRAVITY = 900;
const JUMP_VELOCITY = -480;
const HORIZ_SPEED = 230;
const PLAYER_R = 14;
const PLAT_W = 62, PLAT_H = 12;
const FIXED_Y = VH * 0.42;

let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10);
bestEl.textContent = best;

let state = "ready"; // ready | playing | over
let player, platforms, highestPlatY, cameraOffset, score, dpr, moveDir;

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = VW * dpr;
  canvas.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnPlatformsUpTo(targetY) {
  while (highestPlatY > targetY) {
    const gap = 65 + Math.random() * 45;
    highestPlatY -= gap;
    const x = Math.random() * (VW - PLAT_W);
    platforms.push({ x, y: highestPlatY, w: PLAT_W });
  }
}

function reset() {
  player = { x: VW / 2, y: VH - 80, vx: 0, vy: JUMP_VELOCITY };
  platforms = [{ x: VW / 2 - PLAT_W / 2, y: VH - 50, w: PLAT_W }];
  highestPlatY = VH - 50;
  spawnPlatformsUpTo(-VH);
  cameraOffset = 0;
  score = 0;
  moveDir = 0;
  scoreEl.textContent = "0";
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
  overlayTitleEl.textContent = "💥 Rơi mất rồi!";
  overlayMsgEl.textContent = `Điểm: ${score} · Kỷ lục: ${best}`;
  overlayBtn.textContent = "Chơi lại";
  overlayEl.classList.remove("hidden");
}

function showReadyOverlay() {
  overlayTitleEl.textContent = "Nhảy Lên Cao";
  overlayMsgEl.textContent = "Giữ trái/phải màn hình hoặc phím mũi tên để di chuyển";
  overlayBtn.textContent = "Bắt đầu";
  overlayEl.classList.remove("hidden");
}

overlayBtn.addEventListener("click", (e) => { e.stopPropagation(); startGame(); });

stageOuter.addEventListener("pointerdown", (e) => {
  if (state === "ready") { startGame(); return; }
  const rect = canvas.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  moveDir = relX < 0.5 ? -1 : 1;
});
window.addEventListener("pointerup", () => { moveDir = 0; });
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); moveDir = -1; }
  else if (e.key === "ArrowRight") { e.preventDefault(); moveDir = 1; }
});
window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") moveDir = 0;
});

function update(dt) {
  if (state !== "playing") return;

  player.x += moveDir * HORIZ_SPEED * dt;
  if (player.x < -PLAYER_R) player.x = VW + PLAYER_R;
  if (player.x > VW + PLAYER_R) player.x = -PLAYER_R;

  player.vy += GRAVITY * dt;
  const prevY = player.y;
  player.y += player.vy * dt;

  if (player.vy > 0) {
    for (const p of platforms) {
      const wasAbove = prevY + PLAYER_R <= p.y;
      const nowBelowTop = player.y + PLAYER_R >= p.y;
      const withinX = player.x + PLAYER_R * 0.6 > p.x && player.x - PLAYER_R * 0.6 < p.x + p.w;
      if (wasAbove && nowBelowTop && withinX && player.y + PLAYER_R <= p.y + PLAT_H + 6) {
        player.vy = JUMP_VELOCITY;
        break;
      }
    }
  }

  const desired = Math.max(0, FIXED_Y - player.y);
  if (desired > cameraOffset) cameraOffset = desired;

  const climbed = Math.floor(Math.max(0, (VH - 80 - player.y)) / 8);
  if (climbed > score) score = climbed;
  scoreEl.textContent = score;

  spawnPlatformsUpTo(player.y - cameraOffset - 200 - VH);
  platforms = platforms.filter(p => p.y + cameraOffset < VH + 100);

  if (player.y + cameraOffset - PLAYER_R > VH) {
    endGame();
  }
}

function render() {
  ctx.clearRect(0, 0, VW, VH);
  const bg = ctx.createLinearGradient(0, 0, 0, VH);
  bg.addColorStop(0, "#241a44");
  bg.addColorStop(1, "#0f1420");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VW, VH);

  for (const p of platforms) {
    const sy = p.y + cameraOffset;
    if (sy > VH || sy < -PLAT_H) continue;
    const grad = ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
    grad.addColorStop(0, "#00d9c0");
    grad.addColorStop(1, "#4ea8ff");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(p.x, sy, p.w, PLAT_H, 5) : ctx.rect(p.x, sy, p.w, PLAT_H);
    ctx.fill();
  }

  const psy = player.y + cameraOffset;
  ctx.fillStyle = "#ff9f43";
  ctx.beginPath();
  ctx.arc(player.x, psy, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(player.x - 5, psy - 3, 2.4, 0, Math.PI * 2);
  ctx.arc(player.x + 5, psy - 3, 2.4, 0, Math.PI * 2);
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
