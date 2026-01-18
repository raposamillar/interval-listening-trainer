const notes = [
  "C4","Csharp4","D4","Dsharp4","E4","F4","Fsharp4","G4","Gsharp4",
  "A4","Asharp4","B4","C5","Csharp5","D5"
];

const intervals = [
  { name: "Minor 2nd", semitones: 1 },
  { name: "Major 2nd", semitones: 2 },
  { name: "Minor 3rd", semitones: 3 },
  { name: "Major 3rd", semitones: 4 },
  { name: "Perfect 4th", semitones: 5 },
  { name: "Tritone (Dim 5)", semitones: 6 },
  { name: "Perfect 5th", semitones: 7 },
  { name: "Minor 6th", semitones: 8 },
  { name: "Major 6th", semitones: 9 },
  { name: "Minor 7th", semitones: 10 },
  { name: "Major 7th", semitones: 11 },
  { name: "Octave", semitones: 12 },
  { name: "Minor 9th", semitones: 13 },
  { name: "Major 9th", semitones: 14 }
];

let cycle = [];
let styleQueue = [];
let current = null;
let selected = null;
let score = 0;
let total = 0;

const playBtn = document.getElementById("playBtn");
const checkBtn = document.getElementById("checkBtn");
const nextBtn = document.getElementById("nextBtn");
const resetBtn = document.getElementById("resetBtn");
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");
const cycleEl = document.getElementById("cycle");
const answersEl = document.getElementById("answers");

function initCycle() {
  cycle = [...intervals];
  shuffle(cycle);
  initStyleQueue();  // <-- add this
  cycleEl.textContent = `Progress: 0 / ${intervals.length}`;
  score = 0;
  total = 0;
  scoreEl.textContent = `Score: ${score} / ${total} (0%)`;
}

function initStyleQueue() {
  styleQueue = [
    ...Array(7).fill("harmonic"),
    ...Array(7).fill("melodic")
  ];
  shuffle(styleQueue);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function loadInterval() {
  if (cycle.length === 0) {
    finishGame();
    return;
  }

  selected = null;
  current = cycle.pop();
  cycleEl.textContent = `Progress: ${intervals.length - cycle.length} / ${intervals.length}`;
  messageEl.textContent = "Listen and choose the interval.";

  renderAnswers();
  checkBtn.disabled = true;
  nextBtn.disabled = true;

  playInterval(current);
}

function renderAnswers() {
  answersEl.innerHTML = "";
  intervals.forEach((i) => {
    const btn = document.createElement("button");
    btn.textContent = i.name;
    btn.addEventListener("click", () => {
      selected = i;
      document.querySelectorAll(".answers button").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      checkBtn.disabled = false;
    });
    answersEl.appendChild(btn);
  });
}

async function playInterval(interval) {
  const direction = Math.random() > 0.5 ? "up" : "down";

  // Pop the next style from the queue
  const style = styleQueue.pop();

  const startIndex = Math.floor(Math.random() * (notes.length - interval.semitones));
  const note1 = notes[startIndex];
  const note2 = notes[startIndex + interval.semitones];

  if (style === "harmonic") {
    const audio1 = new Audio(`audio/${note1}.mp3`);
    const audio2 = new Audio(`audio/${note2}.mp3`);

    audio1.play();
    setTimeout(() => {
    audio2.play();
}, 40);

await wait(1000);

    // Play both notes at the same time
    // const audio1 = new Audio(`audio/${note1}.mp3`);
    // const audio2 = new Audio(`audio/${note2}.mp3`);

    // audio1.play();
    // audio2.play();

    // await wait(1000); // give it time to finish
    
  } else {
    // melodic
    if (direction === "up") {
      await playNotes([note1, note2]);
    } else {
      await playNotes([note2, note1]);
    }
  }
}

async function playNotes(noteList) {
  for (let n of noteList) {
    const audio = new Audio(`audio/${n}.mp3`);
    await audio.play();
    await wait(700);
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkAnswer() {
  total++;
  const isCorrect = selected && selected.name === current.name;

  if (isCorrect) {
    score++;
    messageEl.textContent = "Correct!";
  } else {
    messageEl.textContent = `Incorrect. The answer was ${current.name}.`;
  }

  scoreEl.textContent = `Score: ${score} / ${total} (${Math.round((score/total)*100)}%)`;

  checkBtn.disabled = true;
  nextBtn.disabled = false;
}

function finishGame() {
  const percent = Math.round((score / total) * 100);

  if (percent === 100) {
    messageEl.textContent = `🎉 Yay! Perfect Score: 100% 🎉`;
    confetti();
  } else {
    messageEl.textContent = `Final Score: ${percent}% (${score}/${total})`;
  }

  nextBtn.disabled = true;
  playBtn.disabled = true;
  resetBtn.classList.remove("hidden");
}

function resetGame() {
  playBtn.disabled = false;
  resetBtn.classList.add("hidden");
  initCycle();
  messageEl.textContent = "Press Play to start.";
  answersEl.innerHTML = "";
}

// 🎉 Simple Confetti 🎉
function confetti() {
  const colors = ["#1383A6", "#43A6C6", "#FDC82F", "#C7E4ED", "#5B5B5B"];
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = "-10px";
    confetti.style.opacity = Math.random();
    confetti.style.borderRadius = "50%";
    confetti.style.zIndex = "9999";
    confetti.style.animation = "fall 3s ease-in forwards";
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 3000);
  }
}

// Confetti animation
const style = document.createElement("style");
style.innerHTML = `
@keyframes fall {
  to {
    transform: translateY(100vh) rotate(360deg);
  }
}
`;
document.head.appendChild(style);

playBtn.addEventListener("click", loadInterval);
checkBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", loadInterval);
resetBtn.addEventListener("click", resetGame);

initCycle();
renderAnswers();