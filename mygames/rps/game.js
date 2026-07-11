const SCORE_KEY = "y9-rps-scores";

const msgEl = document.getElementById("msg");
const youHand = document.getElementById("youHand");
const aiHand = document.getElementById("aiHand");
const scoreYouEl = document.getElementById("scoreYou");
const scoreDrawEl = document.getElementById("scoreDraw");
const scoreAiEl = document.getElementById("scoreAi");
const buttons = [...document.querySelectorAll(".choice-btn")];

const EMOJI = { rock: "✊", paper: "✋", scissors: "✌️" };
const LABEL = { rock: "Búa", paper: "Bao", scissors: "Kéo" };
const BEATS = { rock: "scissors", paper: "rock", scissors: "paper" };

let scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{"you":0,"draw":0,"ai":0}');
scoreYouEl.textContent = scores.you;
scoreDrawEl.textContent = scores.draw;
scoreAiEl.textContent = scores.ai;

let busy = false;

function saveScores() { localStorage.setItem(SCORE_KEY, JSON.stringify(scores)); }

function play(choice) {
  if (busy) return;
  busy = true;
  youHand.textContent = EMOJI[choice];
  youHand.className = "hand you-hand shake";
  aiHand.className = "hand ai-hand shake";
  msgEl.textContent = "...";

  setTimeout(() => {
    const aiChoice = ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];
    aiHand.textContent = EMOJI[aiChoice];
    youHand.classList.remove("shake");
    aiHand.classList.remove("shake");

    let result;
    if (choice === aiChoice) result = "draw";
    else if (BEATS[choice] === aiChoice) result = "you";
    else result = "ai";

    if (result === "you") {
      scores.you++;
      msgEl.textContent = `${LABEL[choice]} thắng ${LABEL[aiChoice]}! Bạn thắng 🎉`;
      youHand.classList.add("win");
      aiHand.classList.add("lose");
    } else if (result === "ai") {
      scores.ai++;
      msgEl.textContent = `${LABEL[aiChoice]} thắng ${LABEL[choice]}! Máy thắng`;
      aiHand.classList.add("win");
      youHand.classList.add("lose");
    } else {
      scores.draw++;
      msgEl.textContent = `Cả hai ra ${LABEL[choice]}. Hòa!`;
    }
    saveScores();
    scoreYouEl.textContent = scores.you;
    scoreDrawEl.textContent = scores.draw;
    scoreAiEl.textContent = scores.ai;
    busy = false;
  }, 500);
}

buttons.forEach(btn => btn.addEventListener("click", () => play(btn.dataset.choice)));
