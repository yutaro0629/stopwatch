const display = document.getElementById("display");
const msEl = document.getElementById("ms");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapsList = document.getElementById("laps");

let startTime = 0;
let elapsed = 0;
let timerId = null;
let lapCount = 0;
let lastLapTime = 0;

function format(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");
  return { main: `${hh}:${mm}:${ss}`, cs };
}

function render() {
  const now = performance.now();
  const total = elapsed + (timerId ? now - startTime : 0);
  const { main, cs } = format(total);
  display.childNodes[0].nodeValue = main + ".";
  msEl.textContent = cs;
}

function tick() {
  render();
  timerId = requestAnimationFrame(tick);
}

function start() {
  startTime = performance.now();
  timerId = requestAnimationFrame(tick);
  startBtn.disabled = true;
  stopBtn.disabled = false;
  lapBtn.disabled = false;
  resetBtn.disabled = false;
}

function stop() {
  if (!timerId) return;
  cancelAnimationFrame(timerId);
  elapsed += performance.now() - startTime;
  timerId = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  lapBtn.disabled = true;
}

function reset() {
  if (timerId) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }
  elapsed = 0;
  startTime = 0;
  lapCount = 0;
  lastLapTime = 0;
  lapsList.innerHTML = "";
  render();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  lapBtn.disabled = true;
  resetBtn.disabled = true;
}

function lap() {
  const now = performance.now();
  const total = elapsed + (timerId ? now - startTime : 0);
  const split = total - lastLapTime;
  lastLapTime = total;
  lapCount += 1;
  const { main, cs } = format(split);
  const li = document.createElement("li");
  li.innerHTML = `<span class="lap-label">Lap ${lapCount}</span><span class="lap-time">${main}.${cs}</span>`;
  lapsList.prepend(li);
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", lap);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    timerId ? stop() : start();
  } else if (e.key.toLowerCase() === "r") {
    if (!resetBtn.disabled) reset();
  } else if (e.key.toLowerCase() === "l") {
    if (!lapBtn.disabled) lap();
  }
});

render();
