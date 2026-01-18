"use strict";

// --- サポートバージョン ---
const SUPPORTED_VERSIONS = ["1.0", "2.0", "3.0", "4.0"];
const CURRENT_SAVE_VERSION = "4.0";
const STORAGE_KEY = "calendarData-v4";

// --- HTML要素取得 ---
const calendarBody = document.getElementById("calendar-body");
const monthYear = document.getElementById("month-year");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");
const todayBtn = document.getElementById("today-button");

const modalBg = document.getElementById("modal-bg");
const modalDateTitle = document.getElementById("modal-date");
const eventList = document.getElementById("event-list");
const newEventStart = document.getElementById("new-event-start");
const newEventEnd = document.getElementById("new-event-end");
const newEventText = document.getElementById("new-event-text");
const newEventTagsInput = document.getElementById("new-event-tags");
const newEventLocation = document.getElementById("new-event-location");
const newEventNotify = document.getElementById("new-event-notify");
const addEventBtn = document.getElementById("add-event-btn");
const closeBtn = document.getElementById("close-btn");

const settingsBtn = document.getElementById("settings-btn");
const settingsModalBg = document.getElementById("settings-modal-bg");
const tagColorList = document.getElementById("tag-color-list");
const newTagName = document.getElementById("new-tag-name");
const newTagColor = document.getElementById("new-tag-color");
const addTagBtn = document.getElementById("add-tag-btn");
const settingsCancelBtn = document.getElementById("settings-cancel-btn");

const saveJsonBtn = document.getElementById("save-json-btn");
const loadJsonBtn = document.getElementById("load-json-btn");
const loadJsonInput = document.getElementById("load-json-input");

const notificationPopup = document.getElementById("notification-popup");
const notificationTitle = document.getElementById("notification-title");
const notificationBody = document.getElementById("notification-body");
const notificationCloseBtn = document.getElementById("notification-close-btn");

// --- 状態管理 ---
let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

let calendarData = {
  version: CURRENT_SAVE_VERSION,
  events: {},
  tagColors: {
    "#仕事": "#4a7c59",
    "#プライベート": "#d27c7c",
    "#重要": "#7c4a7c"
  }
};

const notifiedEvents = new Set();

// --- ユーティリティ ---
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function eventUniqueKey(dateStr, startTime, text) {
  return `${dateStr}|${startTime}|${text}`;
}

function getRandomColor() {
  return "#" + Math.random().toString(16).slice(2, 8).padEnd(6, "0");
}

// --- バージョン変換ロジック (Migration) ---
function convertDataToV4(data) {
  if (!data) return data;
  const oldVersion = data.version || "1.0";
  if (oldVersion === "4.0") return data;

  const newEvents = {};
  const oldEvents = data.events || {};

  for (const dateKey in oldEvents) {
    const list = oldEvents[dateKey];
    if (!Array.isArray(list)) continue;

    newEvents[dateKey] = list.map(ev => {
      // v3以前はtext内に#タグが混在している可能性があるため抽出
      const textRaw = typeof ev === "string" ? ev : (ev.text || "");
      const tagsFromText = textRaw.match(/#\S+/g) || [];
      const cleanText = textRaw.replace(/#\S+/g, "").trim();

      return {
        start: ev.start || "",
        end: ev.end || "",
        text: cleanText,
        location: ev.location || "",
        notify: ev.notify || false,
        tags: ev.tags || tagsFromText // すでにtags配列があればそれ、なければテキストから
      };
    });
  }

  return {
    version: "4.0",
    events: newEvents,
    tagColors: data.tagColors || { "#仕事": "#4a7c59", "#プライベート": "#d27c7c", "#重要": "#7c4a7c" }
  };
}

// --- ストレージ操作 ---
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
}

function loadFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("calendarData-v3");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      calendarData = convertDataToV4(data);
    } catch (e) {
      console.error("Data load error:", e);
    }
  }
}

// --- 描画処理 ---
function drawCalendar(date) {
  calendarBody.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();
  monthYear.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let week = 0; week < 6; week++) {
    const tr = document.createElement("tr");
    for (let wd = 0; wd < 7; wd++) {
      const td = document.createElement("td");
      const cellIndex = week * 7 + wd;
      let dayNumber, cellDate, isAdjacent = false;

      if (cellIndex < firstWeekday) {
        dayNumber = daysInPrevMonth - (firstWeekday - cellIndex) + 1;
        cellDate = new Date(year, month - 1, dayNumber);
        isAdjacent = true;
      } else if (cellIndex >= firstWeekday + daysInMonth) {
        dayNumber = cellIndex - (firstWeekday + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dayNumber);
        isAdjacent = true;
      } else {
        dayNumber = cellIndex - firstWeekday + 1;
        cellDate = new Date(year, month, dayNumber);
      }

      td.innerHTML = `<div style="font-weight:bold">${dayNumber}</div>`;
      const dateStr = formatDate(cellDate);
      td.dataset.date = dateStr;

      if (wd === 0) td.classList.add("sunday");
      if (wd === 6) td.classList.add("saturday");
      if (isAdjacent) td.classList.add("adjacent-month");
      if (dateStr === formatDate(new Date()) && !isAdjacent) td.classList.add("today");

      const evList = calendarData.events[dateStr] || [];
      evList.forEach(ev => {
        const evDiv = document.createElement("span");
        evDiv.className = "event";
        const timePart = ev.start ? `${ev.start} ` : "";
        evDiv.textContent = timePart + ev.text;

        (ev.tags || []).forEach(tag => {
          const tSpan = document.createElement("span");
          tSpan.className = "event-tag";
          tSpan.textContent = tag;
          tSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
          evDiv.appendChild(tSpan);
        });
        td.appendChild(evDiv);
      });

      if (!isAdjacent) {
        td.style.cursor = "pointer";
        td.addEventListener("click", () => openModal(cellDate));
      }
      tr.appendChild(td);
    }
    calendarBody.appendChild(tr);
  }
}

// --- モーダル・イベント管理 ---
let selectedDate = null;
let editingIndex = null;

function openModal(date) {
  selectedDate = formatDate(date);
  modalDateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  updateEventList();
  resetForm();
  modalBg.style.display = "flex";
}

function resetForm() {
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
  newEventTagsInput.value = "";
  newEventLocation.value = "";
  newEventNotify.checked = false;
  editingIndex = null;
  addEventBtn.textContent = "追加 / Add";
}

function updateEventList() {
  eventList.innerHTML = "";
  const list = calendarData.events[selectedDate] || [];
  if (list.length === 0) {
    eventList.textContent = "予定はありません";
    return;
  }

  list.forEach((ev, i) => {
    const div = document.createElement("div");
    div.className = "event-item"; // スタイルに合わせて調整
    div.innerHTML = `<strong>${ev.start || ""}</strong> ${ev.text}`;
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.onclick = () => {
      newEventStart.value = ev.start;
      newEventEnd.value = ev.end;
      newEventText.value = ev.text;
      newEventTagsInput.value = ev.tags.join(" ");
      newEventLocation.value = ev.location;
      newEventNotify.checked = ev.notify;
      editingIndex = i;
      addEventBtn.textContent = "更新 / Update";
    };
    
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      if (confirm("削除しますか？")) {
        calendarData.events[selectedDate].splice(i, 1);
        saveAndRefresh();
      }
    };

    div.append(editBtn, delBtn);
    eventList.appendChild(div);
  });
}

addEventBtn.addEventListener("click", () => {
  const textRaw = newEventText.value.trim();
  if (!textRaw) return alert("内容を入力してください");

  const tags = newEventTagsInput.value.split(/[\s,]+/).filter(t => t).map(t => t.startsWith("#") ? t : "#" + t);
  
  const eventObj = {
    start: newEventStart.value,
    end: newEventEnd.value,
    text: textRaw,
    tags: tags,
    location: newEventLocation.value,
    notify: newEventNotify.checked
  };

  if (!calendarData.events[selectedDate]) calendarData.events[selectedDate] = [];
  
  if (editingIndex !== null) {
    calendarData.events[selectedDate][editingIndex] = eventObj;
  } else {
    calendarData.events[selectedDate].push(eventObj);
  }

  saveAndRefresh();
  resetForm();
});

function saveAndRefresh() {
  saveToLocalStorage();
  updateEventList();
  drawCalendar(currentDate);
}

// --- 通知チェック ---
function checkNotifications() {
  if (Notification.permission !== "granted") return;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const todayStr = formatDate(now);
  
  const events = calendarData.events[todayStr] || [];
  events.forEach(ev => {
    if (ev.notify && ev.start === timeStr) {
      const key = eventUniqueKey(todayStr, ev.start, ev.text);
      if (!notifiedEvents.has(key)) {
        new Notification("予定時刻です", { body: ev.text });
        notifiedEvents.add(key);
      }
    }
  });
}
setInterval(checkNotifications, 1000 * 30);

// --- JSON入出力 ---
saveJsonBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(calendarData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `calendar_v4_${formatDate(new Date())}.json`;
  a.click();
});

loadJsonBtn.addEventListener("click", () => loadJsonInput.click());
loadJsonInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      calendarData = convertDataToV4(data);
      saveAndRefresh();
      alert("読み込み完了");
    } catch { alert("失敗"); }
  };
  reader.readAsText(file);
});

// --- 初期化 ---
loadFromLocalStorage();
drawCalendar(currentDate);
if ("Notification" in window) Notification.requestPermission();

// ナビゲーションイベント
prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); drawCalendar(currentDate); };
nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); drawCalendar(currentDate); };
todayBtn.onclick = () => { currentDate = new Date(); drawCalendar(currentDate); };
closeBtn.onclick = () => modalBg.style.display = "none";
