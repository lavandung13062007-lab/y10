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
  if (game.thumbKind === "memory-preview") {
    return `<div class="card-thumb thumb-memory">
      <div class="mini-cards">
        <span class="mc mc-open" style="--c:hsl(165,70%,50%)"></span>
        <span class="mc mc-back">?</span>
        <span class="mc mc-back">?</span>
        <span class="mc mc-open" style="--c:hsl(48,90%,60%)"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "rps-preview") {
    return `<div class="card-thumb thumb-rps">
      <span class="rp-emoji">✊</span><span class="rp-vs">VS</span><span class="rp-emoji">✋</span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "guessnum-preview") {
    return `<div class="card-thumb thumb-guessnum">
      <div class="mini-digits">
        <span>3</span><span>7</span><span>1</span><span>9</span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "pong-preview") {
    return `<div class="card-thumb thumb-pong">
      <span class="pp-paddle pp-top"></span>
      <span class="pp-ball"></span>
      <span class="pp-paddle pp-bottom"></span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "stack-preview") {
    return `<div class="card-thumb thumb-stack">
      <div class="mini-stack">
        <span style="width:70%;background:hsl(165,60%,50%)"></span>
        <span style="width:55%;background:hsl(190,60%,50%)"></span>
        <span style="width:40%;background:hsl(220,60%,55%)"></span>
        <span style="width:65%;background:hsl(250,60%,55%)"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "lanedodge-preview") {
    return `<div class="card-thumb thumb-lanedodge">
      <span class="ld-lane"></span><span class="ld-lane"></span>
      <span class="ld-car ld-car-1" style="background:#ff6b81"></span>
      <span class="ld-car ld-car-2" style="background:#00d9c0"></span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "jumper-preview") {
    return `<div class="card-thumb thumb-jumper">
      <span class="jp-plat" style="left:20%;bottom:15%"></span>
      <span class="jp-plat" style="left:55%;bottom:45%"></span>
      <span class="jp-plat" style="left:25%;bottom:75%"></span>
      <span class="jp-char"></span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "basketball-preview") {
    return `<div class="card-thumb thumb-basketball">
      <span class="bk-hoop"></span>
      <span class="bk-ball"></span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "blockpuzzle-preview") {
    return `<div class="card-thumb thumb-blockpuzzle">
      <div class="mini-bp">
        <span class="on" style="background:hsl(165,60%,50%)"></span><span class="on" style="background:hsl(165,60%,50%)"></span><span></span><span class="on" style="background:hsl(30,80%,55%)"></span>
        <span></span><span class="on" style="background:hsl(255,60%,60%)"></span><span></span><span class="on" style="background:hsl(30,80%,55%)"></span>
        <span class="on" style="background:hsl(340,70%,60%)"></span><span class="on" style="background:hsl(255,60%,60%)"></span><span></span><span></span>
        <span class="on" style="background:hsl(340,70%,60%)"></span><span></span><span class="on" style="background:hsl(200,70%,55%)"></span><span class="on" style="background:hsl(200,70%,55%)"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "bubblepop-preview") {
    return `<div class="card-thumb thumb-bubblepop">
      <div class="mini-bubbles">
        <span style="background:#ff6b81"></span><span style="background:#ffd76e"></span><span style="background:#00d9c0"></span>
        <span style="background:#ff6b81"></span><span style="background:#4ea8ff"></span><span style="background:#00d9c0"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "sudoku-preview") {
    return `<div class="card-thumb thumb-sudoku">
      <div class="mini-sudoku">
        <span>1</span><span>2</span><span></span>
        <span></span><span>4</span><span>5</span>
        <span>3</span><span></span><span>6</span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "simon-preview") {
    return `<div class="card-thumb thumb-simon">
      <div class="mini-simon">
        <span class="sp sp-0"></span><span class="sp sp-1"></span>
        <span class="sp sp-2"></span><span class="sp sp-3 lit"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "connect4-preview") {
    return `<div class="card-thumb thumb-connect4">
      <div class="mini-c4">
        <span></span><span class="you"></span><span class="ai"></span><span></span>
        <span class="ai"></span><span class="you"></span><span class="ai"></span><span></span>
        <span class="you"></span><span class="you"></span><span class="ai"></span><span class="you"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "minesweeper-preview") {
    return `<div class="card-thumb thumb-mine">
      <div class="mini-mine">
        <span class="mm-c mm-num n1">1</span><span class="mm-c mm-num n2">2</span><span class="mm-c mm-hidden"></span>
        <span class="mm-c mm-num n3">3</span><span class="mm-c mm-flag">🚩</span><span class="mm-c mm-hidden"></span>
        <span class="mm-c mm-hidden"></span><span class="mm-c mm-hidden"></span><span class="mm-c mm-num n1">1</span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "caro-preview") {
    return `<div class="card-thumb thumb-caro">
      <div class="mini-caro">
        <span class="tc x">✕</span><span class="tc o">○</span><span class="tc"></span>
        <span class="tc"></span><span class="tc x">✕</span><span class="tc o">○</span>
        <span class="tc o">○</span><span class="tc"></span><span class="tc x">✕</span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "breakout-preview") {
    return `<div class="card-thumb thumb-breakout">
      <div class="mini-bricks">
        <span style="background:#ff6b81"></span><span style="background:#ff9f43"></span><span style="background:#ffd76e"></span>
        <span style="background:#00d9c0"></span><span style="background:#6c5ce7"></span><span style="background:#ff6b81"></span>
      </div>
      <span class="mb-ball"></span>
      <span class="mb-paddle"></span>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "whack-preview") {
    return `<div class="card-thumb thumb-whack">
      <div class="mini-holes">
        <span class="wh"></span><span class="wh"></span><span class="wh"></span>
        <span class="wh"></span><span class="wh up"></span><span class="wh"></span>
      </div>
      ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
      <span class="card-plays">▶ ${plays}</span>
    </div>`;
  }
  if (game.thumbKind === "snake-preview") {
    return `<div class="card-thumb thumb-snake">
      <span class="ms-seg" style="left:20%;top:52%"></span>
      <span class="ms-seg" style="left:32%;top:52%"></span>
      <span class="ms-seg ms-head" style="left:44%;top:52%"></span>
      <span class="ms-seg" style="left:44%;top:38%"></span>
      <span class="ms-food" style="left:62%;top:38%"></span>
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
