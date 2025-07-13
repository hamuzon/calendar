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

// --- localStorageキー ---
const STORAGE_KEY = "calendarData-v4";

// --- 保存関数 ---
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
}

// --- 読み込み関数 ---
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

// --- 日付フォーマット ---
function formatDate(date) {
  return date.toISOString().slice(0, 10);
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

        // 時刻表示
        const timeText = ev.start && ev.end ? `${ev.start}〜${ev.end} ` : ev.start ? `${ev.start} ` : "";
        const textWithoutTags = ev.text.replace(/#\S+/g, "").trim();
        evDiv.textContent = timeText + textWithoutTags;

        // タグ表示
        (ev.tags || []).forEach(tag => {
          const tagSpan = document.createElement("span");
          tagSpan.className = "event-tag";
          tagSpan.textContent = tag;
          tagSpan.style.backgroundColor = calendarData.tagColors[tag] || "#777";
          evDiv.appendChild(tagSpan);
        });

        // 場所表示 (アイコン付き)
        if (ev.location) {
          const locSpan = document.createElement("span");
          locSpan.className = "event-location";
          locSpan.textContent = "📍 " + ev.location;
          locSpan.style.marginLeft = "4px";
          locSpan.style.fontSize = "0.75em";
          evDiv.appendChild(locSpan);
        }

        // 通知表示 (ベルアイコン)
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

  // 追加後に入力欄クリア（編集時は閉じる）
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
        // そのタグをイベントからも削除（テキストからはそのまま）
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

// --- 設定モーダル開閉 ---
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

// --- 保存ボタン処理 ---
saveJsonBtn.addEventListener("click", () => {
  const jsonStr = JSON.stringify(calendarData, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const now = new Date();
  const filename = `Calendar-${CURRENT_SAVE_VERSION}_${formatDate(now)}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.json`;
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

function pad(n) {
  return n.toString().padStart(2, "0");
}

// --- 読み込みボタン処理（元バージョン表示付き） ---
loadJsonBtn.addEventListener("click", () => {
  loadJsonInput.value = "";
  loadJsonInput.click();
});
loadJsonInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      let data = JSON.parse(ev.target.result);
      const originalVersion = data.version || "1.0";
      data = convertDataToV4(data);
      calendarData = data;
      saveToLocalStorage();
      drawCalendar(currentDate);
      alert(`✅ データを読み込みました！\n旧バージョン: v${originalVersion} → 現行バージョン: v${CURRENT_SAVE_VERSION}`);
    } catch {
      alert("⚠️ ファイルの読み込みに失敗しました。");
    }
  };
  reader.readAsText(file);
});

// --- ランダムカラー生成（タグ新規登録用） ---
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- 通知機能サンプル（ブラウザ通知API利用） ---
function notifyEvent(eventText) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification("予定の通知", { body: eventText });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("予定の通知", { body: eventText });
      }
    });
  }
}


// --- 初期処理 ---
loadFromLocalStorage();
drawCalendar(currentDate);
