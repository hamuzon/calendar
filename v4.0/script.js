"use strict";

// --- サポートバージョン ---
const SUPPORTED_VERSIONS = ["1.0", "2.0", "3.0", "4.0"];
const CURRENT_SAVE_VERSION = "4.0";

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

const STORAGE_KEY = "calendarData-v4";

// --- 通知済みイベント管理 ---
const notifiedEvents = new Set();

// --- 日付文字列フォーマット ---
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
function pad(n) {
  return n.toString().padStart(2, "0");
}
// イベント固有キー（通知済み管理用）
function eventUniqueKey(dateStr, startTime, text) {
  return `${dateStr}|${startTime}|${text}`;
}

// --- ローカルストレージ読み書き ---
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
}
function loadFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      calendarData = convertDataToV4(data);
    } catch {}
  }
}

// --- バージョン変換 ---
function convertDataToV4(data) {
  if (!data) return data;
  const originalVersion = data.version || "1.0";

  if (originalVersion === "4.0") return data;
  if (originalVersion === "3.0") return convertV3toV4(data);
  if (originalVersion === "2.0") return convertV2toV4(data);
  return convertV1toV4(data);
}

function convertV1toV4(data) {
  const convertedEvents = {};
  for (const dateKey in data.events) {
    const val = data.events[dateKey];
    if (typeof val === "string") {
      const timeMatches = val.match(/(\d{1,2}:\d{2})(?:～(\d{1,2}:\d{2}))?/);
      const start = timeMatches ? timeMatches[1] : "";
      const end = timeMatches && timeMatches[2] ? timeMatches[2] : "";
      let text = val.replace(/(\d{1,2}:\d{2})(～(\d{1,2}:\d{2}))?/, "").replace(/#\S+/g, "").trim();
      const tags = val.match(/#\S+/g) || [];
      if (!convertedEvents[dateKey]) convertedEvents[dateKey] = [];
      convertedEvents[dateKey].push({ start, end, text, location: "", notify: false, tags });
    } else if (Array.isArray(val)) {
      convertedEvents[dateKey] = val.map(ev => ({
        start: ev.start || "",
        end: ev.end || "",
        text: ev.text || "",
        location: ev.location || "",
        notify: ev.notify || false,
        tags: ev.tags || []
      }));
    }
  }
  return {
    version: "4.0",
    events: convertedEvents,
    tagColors: data.settings?.tagColors || {}
  };
}

function convertV2toV4(data) {
  const convertedEvents = {};
  for (const dateKey in data.events) {
    convertedEvents[dateKey] = data.events[dateKey].map(ev => ({
      start: ev.start || "",
      end: ev.end || "",
      text: ev.text || "",
      location: ev.location || "",
      notify: ev.notify || false,
      tags: ev.tags || []
    }));
  }
  return {
    version: "4.0",
    events: convertedEvents,
    tagColors: data.tagColors || {}
  };
}

function convertV3toV4(data) {
  const convertedEvents = {};
  for (const dateKey in data.events) {
    convertedEvents[dateKey] = data.events[dateKey].map(ev => ({
      start: ev.start || "",
      end: ev.end || "",
      text: ev.text || "",
      location: ev.location || "",
      notify: ev.notify || false,
      tags: ev.tags || []
    }));
  }
  return {
    version: "4.0",
    events: convertedEvents,
    tagColors: data.tagColors || {}
  };
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

        const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : ev.start ? `${ev.start} ` : "";
        const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();
        evDiv.textContent = timeText + textWithoutTags;

        (ev.tags || []).forEach(tag => {
          const tagSpan = document.createElement("span");
          tagSpan.className = "event-tag";
          tagSpan.textContent = tag;
          tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
          evDiv.appendChild(tagSpan);
        });

        if (ev.location) {
          const locSpan = document.createElement("span");
          locSpan.className = "event-location";
          locSpan.textContent = "📍 " + ev.location;
          locSpan.style.marginLeft = "4px";
          locSpan.style.fontSize = "0.75em";
          evDiv.appendChild(locSpan);
        }

        if (ev.notify) {
          const notifySpan = document.createElement("span");
          notifySpan.className = "event-notify";
          notifySpan.textContent = "🔔";
          notifySpan.style.marginLeft = "4px";
          evDiv.appendChild(notifySpan);
        }

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

// --- モーダル処理 ---
let selectedDate = null;
let editingIndex = null;

function openModal(date) {
  selectedDate = formatDate(date);
  modalDateTitle.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  updateEventList();
  newEventStart.value = "";
  newEventEnd.value = "";
  newEventText.value = "";
  newEventLocation.value = "";
  newEventNotify.checked = false;
  editingIndex = null;
  addEventBtn.textContent = "追加 / Add";
  modalBg.style.display = "flex";
  newEventText.focus();
}
function closeModal() {
  modalBg.style.display = "none";
}
modalBg.addEventListener("click", e => {
  if (e.target === modalBg) closeModal();
});
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

    const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : ev.start ? `${ev.start} ` : "";
    const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();

    const textSpan = document.createElement("span");
    textSpan.textContent = timeText + textWithoutTags;
    div.appendChild(textSpan);

    (ev.tags || []).forEach(tag => {
      const tagSpan = document.createElement("span");
      tagSpan.className = "event-tag";
      tagSpan.textContent = tag;
      tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
      div.appendChild(tagSpan);
    });

    if (ev.location) {
      const locSpan = document.createElement("span");
      locSpan.textContent = "📍 " + ev.location;
      locSpan.style.marginLeft = "8px";
      locSpan.style.fontSize = "0.85em";
      div.appendChild(locSpan);
    }
    if (ev.notify) {
      const notifySpan = document.createElement("span");
      notifySpan.textContent = "🔔";
      notifySpan.style.marginLeft = "8px";
      div.appendChild(notifySpan);
    }

    // 編集ボタン
    const editBtn = document.createElement("button");
    editBtn.textContent = "編集";
    editBtn.addEventListener("click", () => {
      newEventStart.value = ev.start || "";
      newEventEnd.value = ev.end || "";
      newEventText.value = ev.text;
      newEventLocation.value = ev.location || "";
      newEventNotify.checked = !!ev.notify;
      editingIndex = i;
      addEventBtn.textContent = "更新 / Update";
      newEventText.focus();
    });
    div.appendChild(editBtn);

    // 削除ボタン
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.style.marginLeft = "6px";
    deleteBtn.addEventListener("click", () => {
      if (confirm("この予定を削除してもよろしいですか？")) {
        calendarData.events[selectedDate].splice(i, 1);
        if (calendarData.events[selectedDate].length === 0) {
          delete calendarData.events[selectedDate];
        }
        saveToLocalStorage();
        updateEventList();
        drawCalendar(currentDate);
      }
    });
    div.appendChild(deleteBtn);

    eventList.appendChild(div);
  });
}

// --- 予定追加・更新 ---
addEventBtn.addEventListener("click", () => {
  const start = newEventStart.value.trim();
  const end = newEventEnd.value.trim();
  const textRaw = newEventText.value.trim();
  const location = newEventLocation.value.trim();
  const notify = newEventNotify.checked;

  if (!textRaw) {
    alert("予定内容を入力してください");
    newEventText.focus();
    return;
  }

  // タグ抽出 (#付きの単語)
  const tags = (textRaw.match(/#\S+/g) || []).map(t => (t.startsWith("#") ? t : "#" + t));

  // タグがある場合はtagColorsに登録（なければデフォルト色）
  tags.forEach(tag => {
    if (!calendarData.tagColors[tag]) {
      calendarData.tagColors[tag] = getRandomColor();
    }
  });

  // タグ部分は予定テキストから除去
  const text = textRaw.replace(/#\S+/g, "").trim();

  if (!calendarData.events[selectedDate]) {
    calendarData.events[selectedDate] = [];
  }

  const eventObj = { start, end, text, location, notify, tags };

  if (editingIndex !== null) {
    calendarData.events[selectedDate][editingIndex] = eventObj;
  } else {
    calendarData.events[selectedDate].push(eventObj);
  }

  saveToLocalStorage();
  updateEventList();
  drawCalendar(currentDate);

  if (editingIndex === null) {
    newEventStart.value = "";
    newEventEnd.value = "";
    newEventText.value = "";
    newEventLocation.value = "";
    newEventNotify.checked = false;
    newEventText.focus();
  } else {
    closeModal();
  }
});

// --- タグカラー管理 ---
function renderTagColorList() {
  tagColorList.innerHTML = "";
  for (const tag in calendarData.tagColors) {
    const div = document.createElement("div");
    div.className = "tag-color-item";

    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.value = calendarData.tagColors[tag];
    colorInput.addEventListener("input", () => {
      calendarData.tagColors[tag] = colorInput.value;
      saveToLocalStorage();
      drawCalendar(currentDate);
      renderTagColorList();
    });

    const label = document.createElement("span");
    label.textContent = tag;
    label.style.marginLeft = "8px";
    label.style.fontWeight = "bold";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.style.marginLeft = "12px";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`${tag} をタグカラー設定から削除しますか？`)) {
        delete calendarData.tagColors[tag];
        for (const date in calendarData.events) {
          calendarData.events[date].forEach(ev => {
            ev.tags = ev.tags.filter(t => t !== tag);
          });
        }
        saveToLocalStorage();
        drawCalendar(currentDate);
        renderTagColorList();
      }
    });

    div.appendChild(colorInput);
    div.appendChild(label);
    div.appendChild(deleteBtn);
    tagColorList.appendChild(div);
  }
}
addTagBtn.addEventListener("click", () => {
  let tagName = newTagName.value.trim();
  if (!tagName) {
    alert("タグ名を入力してください。例: #仕事");
    newTagName.focus();
    return;
  }
  if (!tagName.startsWith("#")) tagName = "#" + tagName;

  if (calendarData.tagColors[tagName]) {
    alert("このタグは既に存在します。");
    newTagName.focus();
    return;
  }
  calendarData.tagColors[tagName] = newTagColor.value;
  saveToLocalStorage();
  renderTagColorList();
  newTagName.value = "";
  newTagColor.value = "#4a7c59";
  newTagName.focus();
});
settingsCancelBtn.addEventListener("click", () => {
  settingsModalBg.style.display = "none";
});
settingsBtn.addEventListener("click", () => {
  renderTagColorList();
  settingsModalBg.style.display = "flex";
});
settingsModalBg.addEventListener("click", e => {
  if (e.target === settingsModalBg) {
    settingsModalBg.style.display = "none";
  }
});

// --- 月切替 ---
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

// --- JSON保存・読込み ---
saveJsonBtn.addEventListener("click", () => {
  const dataStr = JSON.stringify(calendarData, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Calendar-${CURRENT_SAVE_VERSION}_${formatDate(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

loadJsonBtn.addEventListener("click", () => {
  loadJsonInput.click();
});

loadJsonInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      calendarData = convertDataToV4(data);
      saveToLocalStorage();
      drawCalendar(currentDate);
      alert("カレンダーの読み込みに成功しました。");
    } catch {
      alert("ファイルの読み込みに失敗しました。正しい形式のJSONファイルを指定してください。");
    }
  };
  reader.readAsText(file);
  loadJsonInput.value = "";
});

// --- ランダムカラー生成 ---
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- 通知機能 ---
// 通知が許可されていなければ要求
if ("Notification" in window) {
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

// 毎秒通知チェック
setInterval(() => {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const nowTime = now.getHours() * 60 + now.getMinutes();

  // 今日の日付文字列
  const todayStr = formatDate(now);

  const todayEvents = calendarData.events[todayStr] || [];
  todayEvents.forEach(ev => {
    if (!ev.notify || !ev.start) return;

    // 開始時間を分に変換
    const [h, m] = ev.start.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;

    const eventTime = h * 60 + m;

    // 今の時間とイベント開始時間の差が0〜1分なら通知
    if (nowTime >= eventTime && nowTime < eventTime + 1) {
      const key = eventUniqueKey(todayStr, ev.start, ev.text);
      if (!notifiedEvents.has(key)) {
        // 通知表示
        new Notification("予定の時間です！", {
          body: `${ev.start} - ${ev.text}`,
          icon: "/icon.svg"
        });
        notifiedEvents.add(key);
      }
    }
  });

  // 1分以上経過した通知はSetから削除（過去の通知クリア）
  notifiedEvents.forEach(key => {
    const parts = key.split("|");
    if (parts.length < 2) return;
    const timeParts = parts[1].split(":").map(Number);
    if (timeParts.length < 2) return;
    const eventTime = timeParts[0] * 60 + timeParts[1];
    if (nowTime > eventTime + 1) {
      notifiedEvents.delete(key);
    }
  });
}, 1000);

// --- 初期化 ---
loadFromLocalStorage();
drawCalendar(currentDate);
