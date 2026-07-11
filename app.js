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

  gameGrid.innerHTML = filtered.map(game => cardMarkup(game)).join("");
}

searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderGrid();
});

async function loadPlayCounts() {
  if (!PLAY_STATS_URL) return;
  try {
    const res = await fetch(`${PLAY_STATS_URL}?action=counts`);
    playCounts = await res.json();
    renderGrid();
  } catch (e) {
    // Google Sheet chưa sẵn sàng hoặc mạng lỗi — cứ dùng số mẫu, không chặn trang.
  }
}

renderNav();
renderGrid();
loadPlayCounts();
