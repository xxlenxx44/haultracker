const STORAGE_KEY = "haul-tracker-data";
let hourlyData = {};
let totalToday = 0;
let storedDate = new Date().toLocaleDateString();
let history = []; // for undo

function getCurrentHour() {
  return new Date().getHours();
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    date: storedDate,
    hourlyData,
    totalToday,
    history
  }));
}

function loadData() {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && saved.date === new Date().toLocaleDateString()) {
    hourlyData = saved.hourlyData || {};
    totalToday = saved.totalToday || 0;
    history = saved.history || [];
  } else {
    hourlyData = {};
    totalToday = 0;
    history = [];
    storedDate = new Date().toLocaleDateString();
    saveData();
  }
}

function updateDisplay() {
  document.getElementById("total-today").textContent = totalToday;

  const hourlyLog = document.getElementById("hourly-log");
  hourlyLog.innerHTML = '';

  for (let hour = 0; hour < 24; hour++) {
    if (hourlyData[hour]) {
      const li = document.createElement("li");
      li.textContent = `${hour}:00 - ${hourlyData[hour]} pallets`;
      hourlyLog.appendChild(li);
    }
  }

  saveData();
}

function logPallets(amount) {
  const hour = getCurrentHour();
  if (!hourlyData[hour]) hourlyData[hour] = 0;
  hourlyData[hour] += amount;
  totalToday += amount;
  history.push({ hour, amount });
  updateDisplay();
}

function undoLast() {
  const last = history.pop();
  if (last) {
    hourlyData[last.hour] -= last.amount;
    if (hourlyData[last.hour] <= 0) delete hourlyData[last.hour];
    totalToday -= last.amount;
    updateDisplay();
  }
}

function resetDay() {
  if (confirm("Are you sure you want to reset today's data?")) {
    hourlyData = {};
    totalToday = 0;
    history = [];
    storedDate = new Date().toLocaleDateString();
    updateDisplay();
  }
}

document.querySelectorAll('[data-count]').forEach(btn => {
  btn.addEventListener('click', () => {
    const count = parseInt(btn.getAttribute('data-count'), 10);
    logPallets(count);
  });
});

document.getElementById("log-custom").addEventListener('click', () => {
  const customVal = parseInt(document.getElementById("custom-count").value, 10);
  if (!isNaN(customVal) && customVal > 0) {
    logPallets(customVal);
    document.getElementById("custom-count").value = '';
  }
});

document.getElementById("undo-button").addEventListener('click', undoLast);
document.getElementById("reset-button").addEventListener('click', resetDay);

// Show clock
setInterval(() => {
  const now = new Date();
  document.getElementById("current-time").textContent = now.toLocaleTimeString();
}, 1000);

loadData();
updateDisplay();

// Show date
const dateElement = document.getElementById("date");
dateElement.textContent = new Date().toLocaleDateString();
