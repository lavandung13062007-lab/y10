const navScroll = document.getElementById("navScroll");
const gameGrid = document.getElementById("gameGrid");
const resultLabel = document.getElementById("resultLabel");
const searchInput = document.getElementById("searchInput");

let activeCategory = "Tất Cả";
let searchTerm = "";

function renderNav() {
  navScroll.innerHTML = CATEGORIES.map(cat =>
    `<button class="nav-pill${cat === activeCategory ? " active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");

  navScroll.querySelectorAll(".nav-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      renderNav();
      renderGrid();
    });
  });
}

function initials(title) {
  return title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function matchesFilter(game) {
  const matchesCat =
    activeCategory === "Tất Cả" ||
    (activeCategory === "Game Mới" && game.isNew) ||
    game.category === activeCategory;
  const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesCat && matchesSearch;
}

function renderGrid() {
  const filtered = GAMES.filter(matchesFilter);
  resultLabel.textContent = searchTerm ? `Kết quả cho "${searchTerm}"` : activeCategory;

  if (filtered.length === 0) {
    gameGrid.innerHTML = "";
    gameGrid.insertAdjacentHTML("afterend", "");
    gameGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Không tìm thấy game phù hợp.</div>`;
    return;
  }

  gameGrid.innerHTML = filtered.map(game => `
    <a class="card" href="play?id=${game.id}">
      <div class="card-thumb" style="background:linear-gradient(135deg, hsl(${game.hue},70%,45%), hsl(${game.hue + 40},70%,30%))">
        ${initials(game.title)}
        ${game.isNew ? '<span class="card-badge">MỚI</span>' : ""}
        <span class="card-plays">▶ ${game.plays}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${game.title}</div>
        <div class="card-cat">${game.category}</div>
      </div>
    </a>
  `).join("");
}

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderGrid();
});

renderNav();
renderGrid();
