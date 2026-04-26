const container = document.getElementById("container");
const segH = document.getElementById("seg-h");
const segM = document.getElementById("seg-m");
const segS = document.getElementById("seg-s");
const segMs = document.getElementById("seg-ms");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapsList = document.getElementById("laps");
const lapsHeader = document.getElementById("lapsHeader");
const lapsCount = document.getElementById("lapsCount");
const status = document.getElementById("status");
const statusText = status.querySelector(".status-text");

let startTime = 0;
let elapsed = 0;
let timerId = null;
let lapNum = 0;
let lastLapTime = 0;
const lapTimes = [];

function pad(n, w = 2) {
  return String(n).padStart(w, "0");
}

function format(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hh = pad(Math.floor(totalSec / 3600));
  const mm = pad(Math.floor((totalSec % 3600) / 60));
  const ss = pad(totalSec % 60);
  const cs = pad(Math.floor((ms % 1000) / 10));
  return { hh, mm, ss, cs };
}

function render() {
  const now = performance.now();
  const total = elapsed + (timerId ? now - startTime : 0);
  const { hh, mm, ss, cs } = format(total);
  segH.textContent = hh;
  segM.textContent = mm;
  segS.textContent = ss;
  segMs.textContent = cs;
}

function tick() {
  render();
  timerId = requestAnimationFrame(tick);
}

function setStatus(state) {
  status.classList.remove("is-running", "is-paused");
  if (state === "running") {
    status.classList.add("is-running");
    statusText.textContent = "RUNNING";
  } else if (state === "paused") {
    status.classList.add("is-paused");
    statusText.textContent = "PAUSED";
  } else {
    statusText.textContent = "READY";
  }
}

function showButtons({ start, stop }) {
  startBtn.hidden = !start;
  stopBtn.hidden = !stop;
}

function start() {
  startTime = performance.now();
  timerId = requestAnimationFrame(tick);
  container.classList.add("is-running");
  setStatus("running");
  showButtons({ start: false, stop: true });
  lapBtn.disabled = false;
  resetBtn.disabled = false;
}

function stop() {
  if (!timerId) return;
  cancelAnimationFrame(timerId);
  elapsed += performance.now() - startTime;
  timerId = null;
  container.classList.remove("is-running");
  setStatus("paused");
  showButtons({ start: true, stop: false });
  lapBtn.disabled = true;
}

function reset() {
  if (timerId) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }
  elapsed = 0;
  startTime = 0;
  lapNum = 0;
  lastLapTime = 0;
  lapTimes.length = 0;
  lapsList.innerHTML = "";
  lapsHeader.hidden = true;
  container.classList.remove("is-running");
  setStatus("ready");
  showButtons({ start: true, stop: false });
  lapBtn.disabled = true;
  resetBtn.disabled = true;
  render();
}

function recolorLaps() {
  if (lapTimes.length < 2) return;
  const min = Math.min(...lapTimes);
  const max = Math.max(...lapTimes);
  [...lapsList.children].forEach((li) => {
    const t = Number(li.dataset.split);
    li.classList.remove("lap-best", "lap-worst");
    if (t === min) li.classList.add("lap-best");
    else if (t === max) li.classList.add("lap-worst");
    const range = max - min || 1;
    const ratio = (t - min) / range;
    li.querySelector(".lap-bar").style.width = `${20 + ratio * 80}%`;
  });
}

function lap() {
  const now = performance.now();
  const total = elapsed + (timerId ? now - startTime : 0);
  const split = total - lastLapTime;
  lastLapTime = total;
  lapNum += 1;
  lapTimes.push(split);
  const { hh, mm, ss, cs } = format(split);
  const li = document.createElement("li");
  li.dataset.split = String(split);
  li.innerHTML = `
    <span class="lap-label">LAP ${pad(lapNum)}</span>
    <span class="lap-bar"></span>
    <span class="lap-time">${hh}:${mm}:${ss}.${cs}</span>
  `;
  lapsList.prepend(li);
  lapsHeader.hidden = false;
  lapsCount.textContent = String(lapNum);
  recolorLaps();
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);
resetBtn.addEventListener("click", reset);
lapBtn.addEventListener("click", lap);

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    btn.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT") return;
  if (e.code === "Space") {
    e.preventDefault();
    timerId ? stop() : start();
  } else if (e.key.toLowerCase() === "r") {
    if (!resetBtn.disabled) reset();
  } else if (e.key.toLowerCase() === "l") {
    if (!lapBtn.disabled) lap();
  }
});

showButtons({ start: true, stop: false });
render();
