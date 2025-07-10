
(() => {
  const calendarBody = document.getElementById("calendar-body");
  const monthYear = document.getElementById("month-year");
  const modalBg = document.getElementById("modal-bg");
  const modalDate = document.getElementById("modal-date");
  const eventText = document.getElementById("event-text");
  const eventTime = document.getElementById("event-time");
  const saveBtn = document.getElementById("save-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const closeBtn = document.getElementById("close-btn");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const todayBtn = document.getElementById("today-button");
  const saveJsonBtn = document.getElementById("save-json-btn");
  const loadJsonInput = document.getElementById("load-json-input");
  const loadJsonBtn = document.getElementById("load-json-btn");

  // 設定関連DOM
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModalBg = document.getElementById("settings-modal-bg");
  const settingsModal = document.getElementById("settings-modal");
  const settingsForm = document.getElementById("settings-form");
  const settingsCancelBtn = document.getElementById("settings-cancel-btn");
  const tagColorList = document.getElementById("tag-color-list");
  const addTagBtn = document.getElementById("add-tag-btn");
  const newTagNameInput = document.getElementById("new-tag-name");
  const newTagColorInput = document.getElementById("new-tag-color");

  const STORAGE_EVENTS = "calendar_events";
  const STORAGE_VIEW = "calendar_view";
  const STORAGE_SETTINGS = "calendar_settings";

  let today = new Date();
  let currentDate = localStorage.getItem(STORAGE_VIEW) ? new Date(localStorage.getItem(STORAGE_VIEW)) : new Date(today);
  let events = JSON.parse(localStorage.getItem(STORAGE_EVENTS) || "{}");
  let selectedDateKey = null;

  // デフォルトタグカラー（ここで初期タグを指定）
  let tagColors = {
    "仕事": "#4c6cb3",
    "重要": "#b53a3a",
    "趣味": "#4c8c3c"
  };

  // 保存されている設定の読み込み
  function loadSettings() {
    const saved = localStorage.getItem(STORAGE_SETTINGS);
    if(saved) {
      try {
        const obj = JSON.parse(saved);
        if(obj.tagColors) tagColors = obj.tagColors;
      } catch {}
    }
  }

  // 設定画面タグ色リストを描画
  function renderTagColorInputs() {
    tagColorList.innerHTML = "";
    for(const [tag, color] of Object.entries(tagColors)) {
      const div = document.createElement("div");
      div.classList.add("tag-row");

      const label = document.createElement("label");
      label.textContent = tag;
      label.setAttribute("for", `color-${tag}`);

      const input = document.createElement("input");
      input.type = "color";
      input.id = `color-${tag}`;
      input.name = tag;
      input.value = color;

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.textContent = "削除";
      deleteBtn.title = `タグ「${tag}」を削除`;
      deleteBtn.onclick = () => {
        if(confirm(`タグ「${tag}」を削除してもよろしいですか？`)) {
          delete tagColors[tag];
          renderTagColorInputs();
        }
      };

      div.appendChild(label);
      div.appendChild(input);
      div.appendChild(deleteBtn);

      tagColorList.appendChild(div);
    }
  }

  // 設定ボタンクリック
  settingsBtn.onclick = () => {
    renderTagColorInputs();
    settingsModalBg.style.display = "flex";
  };

  // キャンセルボタン
  settingsCancelBtn.onclick = () => {
    settingsModalBg.style.display = "none";
  };

  // モーダル外クリックで閉じる（設定モーダル）
  settingsModalBg.onclick = e => {
    if(e.target === settingsModalBg) settingsModalBg.style.display = "none";
  };

  // タグ追加ボタンクリック
  addTagBtn.onclick = () => {
    let newTag = newTagNameInput.value.trim();
    if(!newTag) {
      alert("タグ名を入力してください。");
      return;
    }
    if(tagColors.hasOwnProperty(newTag)) {
      alert("そのタグ名はすでに存在します。");
      return;
    }
    tagColors[newTag] = newTagColorInput.value;
    newTagNameInput.value = "";
    newTagColorInput.value = "#4c6cb3";
    renderTagColorInputs();
  };

  // 設定フォーム送信（保存）
  settingsForm.onsubmit = e => {
    e.preventDefault();
    // 色入力反映
    const inputs = settingsForm.querySelectorAll("input[type=color]");
    inputs.forEach(input => {
      tagColors[input.name] = input.value;
    });
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify({tagColors}));
    settingsModalBg.style.display = "none";
    renderCalendar();
  };

  // 日付キー生成
  function formatDateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
  }

  // 予定表示用タグスパン作成
  function createEventTagSpans(eventText) {
    const container = document.createElement("span");
    container.classList.add("event");

    // 時間部分強調表示
    const timeMatch = eventText.match(/\b(\d{1,2}:\d{2})\b/);
    if(timeMatch) {
      const timeSpan = document.createElement("span");
      timeSpan.textContent = timeMatch[1] + " ";
      timeSpan.style.fontWeight = "bold";
      container.appendChild(timeSpan);
    }

    // 時間除去してタグとテキスト分離
    const textWithoutTime = eventText.replace(/\b(\d{1,2}:\d{2})\b/, "").trim();
    const parts = textWithoutTime.split(/(#[^\s#]+)/g).filter(Boolean);

    parts.forEach(part => {
      if(part.startsWith("#")) {
        const tagName = part.substring(1);
        const tagSpan = document.createElement("span");
        tagSpan.textContent = part;
        tagSpan.classList.add("event-tag");
        tagSpan.style.backgroundColor = tagColors[tagName] || "#999";
        container.appendChild(tagSpan);
      } else {
        const textNode = document.createTextNode(part);
        container.appendChild(textNode);
      }
    });

    return container;
  }

  // カレンダー描画
  function renderCalendar() {
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();

    monthYear.textContent = year + "年 " + monthNamesJP[month];

    calendarBody.innerHTML = "";
    let firstDay = new Date(year, month, 1).getDay();
    let lastDate = new Date(year, month+1, 0).getDate();

    let row = document.createElement("tr");

    // 空白セル埋め
    for(let i=0; i<firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for(let day=1; day<=lastDate; day++) {
      if((firstDay + day -1) % 7 === 0 && day !==1) {
        calendarBody.appendChild(row);
        row = document.createElement("tr");
      }
      let td = document.createElement("td");
      let dateKey = year + "-" + String(month+1).padStart(2,"0") + "-" + String(day).padStart(2,"0");
      td.dataset.date = dateKey;
      td.textContent = day;

      let dayOfWeek = (firstDay + day - 1) % 7;
      if(dayOfWeek === 0) td.classList.add("sunday");
      if(dayOfWeek === 6) td.classList.add("saturday");
      if(year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        td.classList.add("today");
      }

      if(events[dateKey]) {
        td.appendChild(createEventTagSpans(events[dateKey]));
      }

      td.onclick = () => openModal(dateKey);
      row.appendChild(td);
    }
    calendarBody.appendChild(row);
  }

  // モーダル開く
  function openModal(dateKey) {
    selectedDateKey = dateKey;
    modalDate.textContent = dateKey;
    eventText.value = events[dateKey] ? extractText(events[dateKey]) : "";
    eventTime.value = events[dateKey] ? extractTime(events[dateKey]) : "";
    modalBg.style.display = "flex";
    eventText.focus();
  }

  // モーダル閉じる
  function closeModal() {
    modalBg.style.display = "none";
    selectedDateKey = null;
  }

  // 時間抽出
  function extractTime(str) {
    let timeMatch = str.match(/\b(\d{1,2}:\d{2})\b/);
    return timeMatch ? timeMatch[1] : "";
  }

  // 時間とタグを除いたテキスト抽出
  function extractText(str) {
    return str.replace(/\b(\d{1,2}:\d{2})\b/g, "").trim();
  }

  // 保存ボタンクリック
  saveBtn.onclick = () => {
    let text = eventText.value.trim();
    let time = eventTime.value.trim();
    let combined = (time ? time + " " : "") + text;
    if(combined) {
      events[selectedDateKey] = combined;
    }
    else {
      delete events[selectedDateKey];
    }
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
    closeModal();
    renderCalendar();
  };

  // 削除ボタンクリック
  deleteBtn.onclick = () => {
    delete events[selectedDateKey];
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
    closeModal();
    renderCalendar();
  };

  closeBtn.onclick = closeModal;
  modalBg.onclick = e => { if(e.target === modalBg) closeModal(); };

  prevBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    localStorage.setItem(STORAGE_VIEW, currentDate.toISOString());
    renderCalendar();
  };

  nextBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    localStorage.setItem(STORAGE_VIEW, currentDate.toISOString());
    renderCalendar();
  };

  todayBtn.onclick = () => {
    currentDate = new Date(today);
    localStorage.setItem(STORAGE_VIEW, currentDate.toISOString());
    renderCalendar();
  };

  saveJsonBtn.onclick = () => {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth()+1).padStart(2,"0");
    const d = String(now.getDate()).padStart(2,"0");
    const h = String(now.getHours()).padStart(2,"0");
    const mi = String(now.getMinutes()).padStart(2,"0");
    const s = String(now.getSeconds()).padStart(2,"0");
    const filename = `calendar_events_${y}${mo}${d}_${h}${mi}${s}.json`;

    const savedData = {
      savedAt: now.toISOString(),
      events: events,
      settings: {tagColors}
    };
    const blob = new Blob([JSON.stringify(savedData, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  loadJsonBtn.onclick = () => loadJsonInput.click();

  loadJsonInput.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        if(json && typeof json.events === "object") {
          events = json.events;
          if(json.settings && typeof json.settings.tagColors === "object") {
            tagColors = json.settings.tagColors;
            localStorage.setItem(STORAGE_SETTINGS, JSON.stringify({tagColors}));
          }
          localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events));
          alert("予定と設定ファイルを読み込みました。");
          renderCalendar();
        }
        else {
          alert("不正なファイルです。");
        }
      } catch {
        alert("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
    loadJsonInput.value = "";
  };

  // 日本語の月名
  const monthNamesJP = ["1月", "2月", "3月", "4月", "5月", "6月",
                        "7月", "8月", "9月", "10月", "11月", "12月"];

  loadSettings();
  renderCalendar();
})();
