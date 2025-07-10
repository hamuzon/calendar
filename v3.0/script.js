"use strict";

// --- バージョン管理 ---
const SUPPORTED_VERSIONS = ["2.0", "3.0"];
const CURRENT_SAVE_VERSION = "3.0";

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

// --- 状態管理 ---
let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);

// --- 初期データ ---
let calendarData = {
  version: CURRENT_SAVE_VERSION,
  events: {},
  tagColors: {
    "#仕事": "#4a7c59",
    "#プライベート": "#d27c7c",
    "#重要": "#7c4a7c",
  }
};

// --- localStorage処理 ---
const STORAGE_KEY = "calendarData-v3";

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.version && SUPPORTED_VERSIONS.includes(parsed.version)) {
        calendarData = parsed;
      }
    } catch (e) {
      console.warn("ローカルデータの読み込みに失敗しました", e);
    }
  }
}

// --- 日付フォーマット ---
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// --- カレンダー描画 ---
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

      const dayDiv = document.createElement("div");
      dayDiv.textContent = dayNumber;
      dayDiv.style.fontWeight = "bold";
      td.appendChild(dayDiv);
      td.dataset.date = formatDate(cellDate);

      if (wd === 0) td.classList.add("sunday");
      if (wd === 6) td.classList.add("saturday");
      if (isAdjacent) td.classList.add("adjacent-month");

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (cellDate.getTime() === today.getTime() && !isAdjacent) {
        td.classList.add("today");
      }

      const evList = calendarData.events[formatDate(cellDate)] || [];
      evList.forEach(ev => {
        const evDiv = document.createElement("span");
        evDiv.className = "event";
        const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : "";
        const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();
        const tags = ev.text.match(/#\S+/g) || [];
        evDiv.textContent = timeText + textWithoutTags;
        tags.forEach(tag => {
          const tagSpan = document.createElement("span");
          tagSpan.className = "event-tag";
          tagSpan.textContent = tag;
          tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
          evDiv.appendChild(tagSpan);
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

// --- モーダル操作 ---
let selectedDate = null;
let editingIndex = null;

function openModal(date) {
  selectedDate = formatDate(date);
  modalDateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  updateEventList();
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
  editingIndex = null;
  addEventBtn.textContent = "追加 / Add";
  modalBg.style.display = "flex";
  newEventText.focus();
}
function closeModal() {
  modalBg.style.display = "none";
}
modalBg.addEventListener("click", e => { if (e.target === modalBg) closeModal(); });
closeBtn.addEventListener("click", closeModal);

function updateEventList() {
  eventList.innerHTML = "";
  const list = calendarData.events[selectedDate] || [];
  if (list.length === 0) {
    eventList.textContent = "予定はありません";
    return;
  }

  list.forEach((ev, i) => {
    const div = document.createElement("div");
    div.className = "event";
    const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : "";
    const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();
    const tags = ev.text.match(/#\S+/g) || [];

    const textSpan = document.createElement("span");
    textSpan.textContent = timeText + textWithoutTags;
    div.appendChild(textSpan);

    tags.forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "event-tag";
      tagSpan.textContent = tag;
      tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
      div.appendChild(tagSpan);
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      newEventStart.value = ev.start || "";
      newEventEnd.value = ev.end || "";
      newEventText.value = ev.text;
      editingIndex = i;
      addEventBtn.textContent = "更新 / Update";
    });
    div.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      if (confirm("この予定を削除しますか？")) {
        list.splice(i, 1);
        if (list.length === 0) delete calendarData.events[selectedDate];
        updateEventList();
        drawCalendar(currentDate);
        saveToLocalStorage();
      }
    });
    div.appendChild(delBtn);

    eventList.appendChild(div);
  });
}

addEventBtn.addEventListener("click", () => {
  const start = newEventStart.value.trim();
  const end = newEventEnd.value.trim();
  const text = newEventText.value.trim();
  if (!text) return alert("予定内容を入力してください");

  if (!calendarData.events[selectedDate]) calendarData.events[selectedDate] = [];
  if (editingIndex === null) {
    calendarData.events[selectedDate].push({ start, end, text });
  } else {
    calendarData.events[selectedDate][editingIndex] = { start, end, text };
    editingIndex = null;
    addEventBtn.textContent = "追加 / Add";
  }

  updateEventList();
  drawCalendar(currentDate);
  saveToLocalStorage();
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
});

// --- タグ設定 ---
settingsBtn.addEventListener("click", () => {
  settingsModalBg.style.display = "flex";
  renderTagList();
  newTagName.value = "";
  newTagColor.value = "#4a7c59";
});
settingsCancelBtn.addEventListener("click", () => settingsModalBg.style.display = "none");
settingsModalBg.addEventListener("click", e => { if (e.target === settingsModalBg) settingsModalBg.style.display = "none"; });

function renderTagList() {
  tagColorList.innerHTML = "";
  for (const tag in calendarData.tagColors) {
    const div = document.createElement("div");
    div.className = "tag-row";
    const label = document.createElement("label");
    label.textContent = tag;

    const input = document.createElement("input");
    input.type = "color";
    input.value = calendarData.tagColors[tag];
    input.addEventListener("input", e => {
      calendarData.tagColors[tag] = e.target.value;
      drawCalendar(currentDate);
      saveToLocalStorage();
    });

    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.addEventListener("click", () => {
      if (confirm(`${tag} を削除しますか？`)) {
        delete calendarData.tagColors[tag];
        renderTagList();
        drawCalendar(currentDate);
        saveToLocalStorage();
      }
    });

    div.append(label, input, delBtn);
    tagColorList.appendChild(div);
  }
}

addTagBtn.addEventListener("click", () => {
  const tag = newTagName.value.trim();
  const color = newTagColor.value;
  if (!tag.startsWith("#")) return alert("タグは # で始めてください");
  if (calendarData.tagColors[tag]) return alert("すでに存在するタグです");
  calendarData.tagColors[tag] = color;
  renderTagList();
  drawCalendar(currentDate);
  saveToLocalStorage();
  newTagName.value = "";
  newTagColor.value = "#4a7c59";
});

// --- JSON保存 ---
function makeSaveFileName() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `Calendar-${CURRENT_SAVE_VERSION}_${y}_${m}_${day}_${h}_${min}_${s}.json`;
}

saveJsonBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(calendarData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = makeSaveFileName();
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

loadJsonBtn.addEventListener("click", () => loadJsonInput.click());
loadJsonInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const json = JSON.parse(ev.target.result);
      if (json.version && SUPPORTED_VERSIONS.includes(json.version)) {
        calendarData = json;
        drawCalendar(currentDate);
        saveToLocalStorage();
        alert(`バージョン${json.version}のファイルを読み込みました`);
      } else {
        alert("非対応バージョンのファイルです");
      }
    } catch {
      alert("JSON読み込みに失敗しました");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// --- ナビゲーション ---
prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  drawCalendar(currentDate);
});
nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  drawCalendar(currentDate);
});
todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  drawCalendar(currentDate);
});

// --- 初期化 ---
loadFromLocalStorage();
drawCalendar(currentDate);
