const BEST_KEY = "y9-guessnum-best";

const digitSlots = [...document.querySelectorAll(".digit-slot")];
const feedbackEl = document.getElementById("feedback");
const attemptsEl = document.getElementById("attempts");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restartBtn");
const keypad = document.getElementById("keypad");
const historyEl = document.getElementById("history");

let best = localStorage.getItem(BEST_KEY);
bestEl.textContent = best ? best : "—";

let secret, input, attempts, over;

function makeSecret() {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, 4).map(String);
}

function renderDigits() {
  digitSlots.forEach((el, i) => {
    el.textContent = input[i] != null ? input[i] : "";
    el.classList.toggle("filled", input[i] != null);
  });
}

function computeFeedback(guess) {
  let bulls = 0;
  for (let i = 0; i < 4; i++) if (guess[i] === secret[i]) bulls++;
  const commonDigits = guess.filter(d => secret.includes(d)).length;
  const cows = commonDigits - bulls;
  return { bulls, cows };
}

function addHistoryRow(guess, bulls, cows) {
  const row = document.createElement("div");
  row.className = "history-row";
  row.innerHTML = `<span class="guess-val">${guess.join("")}</span><span class="hint-val">${bulls} đúng vị trí · ${cows} đúng số sai vị trí</span>`;
  historyEl.prepend(row);
}

function onKey(key) {
  if (over) return;
  if (key === "clear") {
    input = [];
    renderDigits();
    feedbackEl.textContent = "Nhập 4 chữ số khác nhau rồi bấm Đoán";
    feedbackEl.className = "feedback";
    return;
  }
  if (key === "guess") {
    if (input.length < 4) {
      feedbackEl.textContent = "Nhập đủ 4 chữ số đã";
      feedbackEl.className = "feedback error";
      return;
    }
    if (new Set(input).size < 4) {
      feedbackEl.textContent = "4 chữ số phải khác nhau nhé";
      feedbackEl.className = "feedback error";
      return;
    }
    attempts++;
    attemptsEl.textContent = String(attempts);
    const { bulls, cows } = computeFeedback(input);
    addHistoryRow(input, bulls, cows);
    if (bulls === 4) {
      over = true;
      if (!best || attempts < parseInt(best, 10)) {
        best = String(attempts);
        bestEl.textContent = best;
        localStorage.setItem(BEST_KEY, best);
      }
      feedbackEl.textContent = `🎉 Chính xác! Bạn đoán đúng sau ${attempts} lượt`;
      feedbackEl.className = "feedback win";
    } else {
      feedbackEl.textContent = `${bulls} đúng vị trí, ${cows} đúng số sai vị trí`;
      feedbackEl.className = "feedback";
    }
    input = [];
    renderDigits();
    return;
  }
  // số
  if (input.length >= 4) return;
  input.push(key);
  renderDigits();
}

keypad.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  onKey(btn.dataset.key);
});

window.addEventListener("keydown", (e) => {
  if (/^[0-9]$/.test(e.key)) onKey(e.key);
  else if (e.key === "Backspace") onKey("clear");
  else if (e.key === "Enter") onKey("guess");
});

function newGame() {
  secret = makeSecret();
  input = [];
  attempts = 0;
  over = false;
  attemptsEl.textContent = "0";
  feedbackEl.textContent = "Nhập 4 chữ số khác nhau rồi bấm Đoán";
  feedbackEl.className = "feedback";
  historyEl.innerHTML = "";
  renderDigits();
}

restartBtn.addEventListener("click", newGame);

newGame();
