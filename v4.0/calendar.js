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

// 通知ポップアップ要素 (HTMLに存在することを前提)
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

// --- 通知済みイベント管理 ---
const notifiedEvents = new Set();

// --- ヘルパー関数 ---
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
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- バージョン変換 (Migration) ---
function convertDataToV4(data) {
  if (!data) return data;
  const originalVersion = data.version || "1.0";
  if (originalVersion === "4.0") return data;

  const convertedEvents = {};
  const oldEvents = data.events || {};

  for (const dateKey in oldEvents) {
    const list = oldEvents[dateKey];
    if (!Array.isArray(list)) {
      // v1.0の単一文字列形式への対応
      if (typeof list === "string") {
        convertedEvents[dateKey] = [parseOldStringEvent(list)];
      }
      continue;
    }

    convertedEvents[dateKey] = list.map(ev => {
      if (typeof ev === "string") return parseOldStringEvent(ev);
      
      // v2.0, v3.0 からの変換
      return {
        start: ev.start || "",
        end: ev.end || "",
        text: (ev.text || "").replace(/#\S+/g, "").trim(),
        location: ev.location || "",
        notify: ev.notify || false,
        tags: ev.tags || (ev.text ? ev.text.match(/#\S+/g) || [] : [])
      };
    });
  }

  return {
    version: "4.0",
    events: convertedEvents,
    tagColors: data.tagColors || data.settings?.tagColors || calendarData.tagColors
  };
}

// 古い文字列形式 ("10:00～11:00 会議 #仕事") をパース
function parseOldStringEvent(str) {
  const timeMatches = str.match(/(\d{1,2}:\d{2})(?:～(\d{1,2}:\d{2}))?/);
  const start = timeMatches ? timeMatches[1] : "";
  const end = timeMatches && timeMatches[2] ? timeMatches[2] : "";
  const tags = str.match(/#\S+/g) || [];
  const text = str.replace(/(\d{1,2}:\d{2})(～(\d{1,2}:\d{2}))?/, "").replace(/#\S+/g, "").trim();
  return { start, end, text, location: "", notify: false, tags };
}

// --- ストレージ処理 ---
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
      console.error("Failed to load data", e);
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
      let cellDate, isAdjacent = false;

      if (cellIndex < firstWeekday) {
        let dayNum = daysInPrevMonth - (firstWeekday - cellIndex) + 1;
        cellDate = new Date(year, month - 1, dayNum);
        isAdjacent = true;
      } else if (cellIndex >= firstWeekday + daysInMonth) {
        let dayNum = cellIndex - (firstWeekday + daysInMonth) + 1;
        cellDate = new Date(year, month + 1, dayNum);
        isAdjacent = true;
      } else {
        let dayNum = cellIndex - firstWeekday + 1;
        cellDate = new Date(year, month, dayNum);
      }

      const dateStr = formatDate(cellDate);
      td.dataset.date = dateStr;
      if (isAdjacent) td.classList.add("adjacent-month");
      if (wd === 0) td.classList.add("sunday");
      if (wd === 6) td.classList.add("saturday");
      if (dateStr === formatDate(new Date()) && !isAdjacent) td.classList.add("today");

      const dayDiv = document.createElement("div");
      dayDiv.textContent = cellDate.getDate();
      dayDiv.style.fontWeight = "bold";
      td.appendChild(dayDiv);

      const evList = calendarData.events[dateStr] || [];
      evList.forEach(ev => {
        const evDiv = document.createElement("span");
        evDiv.className = "event";
        const timeText = ev.start ? `${ev.start} ` : "";
        evDiv.textContent = timeText + ev.text;

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

// --- モーダル・通知ポップアップ ---
let selectedDate = null;
let editingIndex = null;

function openModal(date) {
  selectedDate = formatDate(date);
  modalDateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  updateEventList();
  resetForm();
  modalBg.style.display = "flex";
  newEventText.focus();
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
    div.className = "event-item-detail"; // スタイルに合わせて調整してください
    div.innerHTML = `<span>${ev.start || ""} ${ev.text}</span>`;
    
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.onclick = () => {
      newEventStart.value = ev.start;
      newEventEnd.value = ev.end;
      newEventText.value = ev.text;
      newEventTagsInput.value = (ev.tags || []).join(" ");
      newEventLocation.value = ev.location || "";
      newEventNotify.checked = ev.notify;
      editingIndex = i;
      addEventBtn.textContent = "更新 / Update";
    };

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => {
      if (confirm("削除しますか？")) {
        calendarData.events[selectedDate].splice(i, 1);
        if (calendarData.events[selectedDate].length === 0) delete calendarData.events[selectedDate];
        saveAndRefresh();
      }
    };
    div.append(editBtn, delBtn);
    eventList.appendChild(div);
  });
}

function showNotificationPopup(title, body) {
  if (!notificationPopup) return;
  notificationTitle.textContent = title;
  notificationBody.innerText = body;
  notificationPopup.style.display = "block";
}

// --- 追加・更新ボタン ---
addEventBtn.addEventListener("click", () => {
  const textRaw = newEventText.value.trim();
  if (!textRaw) return alert("予定内容を入力してください");

  const tagsInput = newEventTagsInput.value.trim();
  const tagsFromText = textRaw.match(/#\S+/g) || [];
  const tagsFromInput = tagsInput ? tagsInput.split(/[\s,]+/).map(t => t.startsWith("#") ? t : "#" + t) : [];
  const tags = Array.from(new Set([...tagsFromText, ...tagsFromInput]));

  tags.forEach(t => { if (!calendarData.tagColors[t]) calendarData.tagColors[t] = getRandomColor(); });

  const eventObj = {
    start: newEventStart.value,
    end: newEventEnd.value,
    text: textRaw.replace(/#\S+/g, "").trim(),
    location: newEventLocation.value.trim(),
    notify: newEventNotify.checked,
    tags: tags
  };

  if (!calendarData.events[selectedDate]) calendarData.events[selectedDate] = [];
  if (editingIndex !== null) {
    calendarData.events[selectedDate][editingIndex] = eventObj;
  } else {
    calendarData.events[selectedDate].push(eventObj);
  }

  saveAndRefresh();
  if (editingIndex === null) resetForm(); else modalBg.style.display = "none";
});

function saveAndRefresh() {
  saveToLocalStorage();
  updateEventList();
  drawCalendar(currentDate);
}

// --- 通知機能 ---
function checkNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const now = new Date();
  const todayStr = formatDate(now);
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const events = calendarData.events[todayStr] || [];
  events.forEach(ev => {
    if (!ev.notify || !ev.start) return;
    if (ev.start === currentTime) {
      const key = eventUniqueKey(todayStr, ev.start, ev.text);
      if (!notifiedEvents.has(key)) {
        const title = ev.text || "予定の時間です";
        const body = `開始: ${ev.start}\n場所: ${ev.location || "未設定"}`;
        
        new Notification(title, { body, icon: "/icon.svg" });
        showNotificationPopup(title, body);
        notifiedEvents.add(key);
      }
    }
  });

  // 1分経過した通知キーをクリーンアップ（翌日分など）
  if (now.getSeconds() === 0) {
    notifiedEvents.forEach(key => {
      if (!key.startsWith(todayStr)) notifiedEvents.delete(key);
    });
  }
}
setInterval(checkNotifications, 1000 * 30); // 30秒ごとにチェック

// --- JSON保存・読込 ---
saveJsonBtn.addEventListener("click", () => {
  const jsonStr = JSON.stringify(calendarData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Calendar_Export_${formatDate(new Date())}.json`;
  a.click();
});

loadJsonBtn.addEventListener("click", () => loadJsonInput.click());
loadJsonInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      calendarData = convertDataToV4(data);
      saveAndRefresh();
      alert("データを読み込みました。");
    } catch { alert("無効なファイルです。"); }
  };
  reader.readAsText(file);
});

// --- 初期化 ---
loadFromLocalStorage();
drawCalendar(currentDate);

// 基本イベントリスナー
prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); drawCalendar(currentDate); };
nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); drawCalendar(currentDate); };
todayBtn.onclick = () => { currentDate = new Date(); currentDate.setHours(0,0,0,0); drawCalendar(currentDate); };
closeBtn.onclick = () => modalBg.style.display = "none";
if (notificationCloseBtn) notificationCloseBtn.onclick = () => notificationPopup.style.display = "none";
if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
