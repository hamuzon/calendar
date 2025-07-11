"use strict";

// --- 初期設定 ---
const CURRENT_SAVE_VERSION = "4.0";
const calendarBody = document.getElementById("calendar-body");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const todayBtn = document.getElementById("today-button");
const modalBg = document.getElementById("modal-bg");
const modalDateTitle = document.getElementById("modal-date");
const addEventBtn = document.getElementById("add-event-btn");
const newEventStart = document.getElementById("new-event-start");
const newEventEnd = document.getElementById("new-event-end");
const newEventText = document.getElementById("new-event-text");

let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

// --- カレンダーイベント ---
let calendarData = {
  version: CURRENT_SAVE_VERSION,
  events: {},
};

// --- カレンダー描画 ---
function drawCalendar(date) {
  calendarBody.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();
  modalDateTitle.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");

    for (let wd = 0; wd < 7; wd++) {
      const td = document.createElement("td");
      let dayNumber, cellDate;

      if (wd < firstWeekday) {
        dayNumber = daysInMonth - (firstWeekday - wd) + 1;
        cellDate = new Date(year, month - 1, dayNumber);
      } else if (wd >= firstWeekday + daysInMonth) {
        dayNumber = wd - (firstWeekday + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dayNumber);
      } else {
        dayNumber = wd - firstWeekday + 1;
        cellDate = new Date(year, month, dayNumber);
      }

      const dayDiv = document.createElement("div");
      dayDiv.textContent = dayNumber;
      td.appendChild(dayDiv);
      td.dataset.date = formatDate(cellDate);

      const events = calendarData.events[formatDate(cellDate)] || [];
      events.forEach(event => {
        const eventDiv = document.createElement("div");
        eventDiv.textContent = event.text;
        td.appendChild(eventDiv);
      });

      td.addEventListener("click", () => openModal(cellDate));
      tr.appendChild(td);
    }
    calendarBody.appendChild(tr);
  }
}

// --- 日付フォーマット ---
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// --- モーダル操作 ---
function openModal(date) {
  modalBg.style.display = "flex";
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
  addEventBtn.textContent = "追加 / Add";

  addEventBtn.onclick = function () {
    const start = newEventStart.value.trim();
    const end = newEventEnd.value.trim();
    const text = newEventText.value.trim();
    if (!text) return alert("予定内容を入力してください");

    const dateStr = formatDate(date);
    if (!calendarData.events[dateStr]) calendarData.events[dateStr] = [];
    calendarData.events[dateStr].push({ start, end, text });
    drawCalendar(currentDate);
    saveToLocalStorage();
    modalBg.style.display = "none";
  };
}

// --- ローカルストレージに保存 ---
function saveToLocalStorage() {
  localStorage.setItem("calendarData", JSON.stringify(calendarData));
}

// --- ローカルストレージから読み込み ---
function loadFromLocalStorage() {
  const savedData = localStorage.getItem("calendarData");
  if (savedData) {
    try {
      calendarData = JSON.parse(savedData);
      if (calendarData.version !== CURRENT_SAVE_VERSION) {
        alert("このファイルは異なるバージョンのカレンダーです。データが変換されます。");
      }
      drawCalendar(currentDate);
    } catch (e) {
      console.error("ローカルストレージの読み込みに失敗しました:", e);
    }
  }
}

// --- 月移動ボタン ---
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  drawCalendar(currentDate);
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  drawCalendar(currentDate);
});

// --- 今日に戻るボタン ---
todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  drawCalendar(currentDate);
});

// --- 初期化処理 ---
loadFromLocalStorage();
drawCalendar(currentDate);
