// Hàm dùng chung để vẽ thẻ game (thumbnail + số lượt chơi), dùng ở cả index.html và play.html.

function initials(title) {
  return title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatPlays(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

// playCounts (từ games.js) chứa số lượt chơi thật lấy về từ Google Sheet.
// Nếu chưa tải được (hoặc chưa cấu hình PLAY_STATS_URL) thì dùng số mẫu có sẵn trong games.js.
function resolvePlays(game) {
  if (typeof playCounts === "object" && playCounts && playCounts[game.id] != null) {
    return formatPlays(playCounts[game.id]);
  }
  return game.plays;
}

function thumbMarkup(game) {
  const plays = resolvePlays(game);
  if (game.thumbKind === "2048-grid") {
    return `<div class="card-thumb thumb-2048">
      <div class="mini-grid">
        <span class="mt" style="background:hsl(165,70%,50%)">2</span>
        <span class="mt" style="background:hsl(195,70%,48%)">8</span>
        <span class="mt" style="background:hsl(235,70%,52%)">32</span>
        <span class="mt" style="background:linear-gradient(135deg,#ffd76e,#ff9f43)">2048</span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "flappy-preview") {
    return `<div class="card-thumb thumb-flappy">
      <span class="mf-pipe mf-pipe-top"></span>
      <span class="mf-pipe mf-pipe-bottom"></span>
      <span class="mf-bird"></span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  return `<div class="card-thumb" style="background:linear-gradient(135deg, hsl(${game.hue},70%,45%), hsl(${game.hue + 40},70%,30%))">
    ${initials(game.title)}
    ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
    <span class="card-plays">▶ ${plays}</span>
  </div>`;
}

function cardMarkup(game, extraClass) {
  return `<a class="card${extraClass ? " " + extraClass : ""}" href="play.html?id=${game.id}">
    ${thumbMarkup(game)}
    <div class="card-body">
      <div class="card-title">${game.title}</div>
      <div class="card-cat">${game.category}</div>
    </div>
  </a>`;
}
