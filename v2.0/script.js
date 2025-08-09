(() => {
  // --- 定数 ---
  const STORAGE_KEY = "calendarData-v2";
  const CALENDAR_VERSION = "2.0";

  // --- DOM要素の取得 ---
  const calendarBody = document.getElementById("calendar-body");
  const monthYear = document.getElementById("month-year");
  const modalBg = document.getElementById("modal-bg");
  const modalDate = document.getElementById("modal-date");
  const eventList = document.getElementById("event-list");
  const newEventStart = document.getElementById("new-event-start");
  const newEventEnd = document.getElementById("new-event-end");
  const newEventText = document.getElementById("new-event-text");
  const addEventBtn = document.getElementById("add-event-btn");
  const closeBtn = document.getElementById("close-btn");
  const prevBtn = document.getElementById("prev-month");
  const nextBtn = document.getElementById("next-month");
  const todayBtn = document.getElementById("today-button");
  const saveJsonBtn = document.getElementById("save-json-btn");
  const loadJsonInput = document.getElementById("load-json-input");
  const loadJsonBtn = document.getElementById("load-json-btn");

  const settingsBtn = document.getElementById("settings-btn");
  const settingsModalBg = document.getElementById("settings-modal-bg");
  const settingsModal = document.getElementById("settings-modal");
  const settingsForm = document.getElementById("settings-form");
  const settingsCancelBtn = document.getElementById("settings-cancel-btn");
  const tagColorList = document.getElementById("tag-color-list");
  const addTagBtn = document.getElementById("add-tag-btn");
  const newTagNameInput = document.getElementById("new-tag-name");
  const newTagColorInput = document.getElementById("new-tag-color");

  // --- 日本語の月名 ---
  const monthNamesJP = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  // --- 状態変数 ---
  let today = new Date();
  let currentDate = new Date(today);
  let events = {};
  let tagColors = {
    "仕事": "#4a7c59",
    "重要": "#a14a44",
    "趣味": "#4a6c7c"
  };
  let selectedDate = null;

  // --- localStorageから全体データをロード ---
  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    try {
      const data = JSON.parse(raw);
      if(data.version === CALENDAR_VERSION) {
        if(data.currentDate) currentDate = new Date(data.currentDate);
        if(data.events) events = data.events;
        if(data.tagColors) tagColors = data.tagColors;
      }
    } catch(e) {
      console.error("Failed to load data:", e);
    }
  }

  // --- localStorageに全体データを保存 ---
  function saveData() {
    const data = {
      version: CALENDAR_VERSION,
      currentDate: currentDate.toISOString(),
      events,
      tagColors,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // --- 空のタグは削除 ---
  function cleanEmptyTags() {
    for(const tag in tagColors) {
      if(!tag.trim()) delete tagColors[tag];
    }
  }

  // --- YYYY-MM-DD形式の日付キー ---
  function formatDateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
  }

  // --- タグ設定UIレンダリング ---
  function renderTagColorInputs() {
    cleanEmptyTags();
    tagColorList.innerHTML = "";
    for(const tag in tagColors) {
      const div = document.createElement("div");
      div.classList.add("tag-row", "flex", "items-center", "mb-2");
      const label = document.createElement("label");
      label.textContent = tag;
      label.htmlFor = `color-${tag}`;
      label.classList.add("w-20", "text-gray-700");
      const input = document.createElement("input");
      input.type = "color";
      input.id = `color-${tag}`;
      input.name = tag;
      input.value = tagColors[tag];
      input.classList.add("flex-grow", "mr-2", "rounded-md", "p-1", "border", "border-gray-300");
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "削除";
      delBtn.title = `タグ「${tag}」を削除`;
      delBtn.classList.add("bg-red-500", "hover:bg-red-600", "text-white", "font-bold", "py-1", "px-3", "rounded-md", "shadow-sm");
      delBtn.onclick = () => {
        if(confirm(`タグ「${tag}」を削除しますか？`)) {
          delete tagColors[tag];
          renderTagColorInputs();
        }
      };
      div.append(label, input, delBtn);
      tagColorList.appendChild(div);
    }
  }

  // --- カレンダー描画 ---
  function renderCalendar() {
    calendarBody.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    monthYear.textContent = `${year}年 ${monthNamesJP[month]}`;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();

    let dayCount = 1;
    for(let week=0; week<6; week++) {
      const tr = document.createElement("tr");
      for(let d=0; d<7; d++) {
        const td = document.createElement("td");
        td.style.cursor = "default";
        td.textContent = "";
        td.className = "";
        td.removeAttribute("tabindex");
        td.removeAttribute("data-date-key");

        if((week > 0 || d >= firstDay) && dayCount <= daysInMonth) {
          td.textContent = dayCount;
          td.style.cursor = "pointer";
          const dateKey = formatDateKey(new Date(year, month, dayCount));
          td.dataset.dateKey = dateKey;

          if(d === 0) td.classList.add("sunday");
          if(d === 6) td.classList.add("saturday");

          if(formatDateKey(today) === dateKey) {
            td.classList.add("today");
            td.setAttribute("aria-current", "date");
          }
          td.setAttribute("tabindex", "0");
          td.addEventListener("click", () => openModal(dateKey));
          td.addEventListener("keydown", e => {
            if(e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openModal(dateKey);
            }
          });

          if(events[dateKey]) {
            events[dateKey].slice(0, 3).forEach(ev => {
              if(!ev.text) return;
              const evSpan = document.createElement("span");
              evSpan.className = "event-preview";
              const timeStr = (ev.start ? ev.start : "") + (ev.end ? "〜"+ev.end : "");
              evSpan.title = timeStr + " " + ev.text;
              evSpan.textContent = (timeStr ? `[${timeStr}] ` : "") + ev.text.replace(/#\S+/g,"").trim();
              td.appendChild(evSpan);
            });
            if(events[dateKey].length > 3) {
              const moreSpan = document.createElement("span");
              moreSpan.textContent = `＋${events[dateKey].length - 3} 件`;
              moreSpan.classList.add("more-events");
              td.appendChild(moreSpan);
            }
          }

          dayCount++;
        } else {
          td.classList.add("empty-cell");
        }
        tr.appendChild(td);
      }
      calendarBody.appendChild(tr);
    }
  }

  // --- モーダルを開く ---
  function openModal(dateKey) {
    selectedDate = dateKey;
    modalDate.textContent = dateKey;
    eventList.innerHTML = "";

    if(events[dateKey] && events[dateKey].length) {
      events[dateKey].forEach((ev, i) => {
        const div = document.createElement("div");
        div.className = "event-item";
        let timeStr = ev.start ? ev.start : "";
        if(ev.end) timeStr += "〜" + ev.end;
        const textNode = document.createTextNode((timeStr ? `[${timeStr}] ` : "") + ev.text.replace(/#\S+/g,"").trim());
        div.appendChild(textNode);

        // タグ表示
        const tags = (ev.text.match(/#(\S+)/g) || []).map(t => t.slice(1));
        tags.forEach(t => {
          const tagSpan = document.createElement("span");
          tagSpan.className = "event-tag";
          tagSpan.textContent = "#" + t;
          tagSpan.style.backgroundColor = tagColors[t] || "#999";
          div.appendChild(tagSpan);
        });

        // 削除ボタン
        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.classList.add("ml-2", "bg-red-500", "hover:bg-red-600", "text-white", "font-bold", "py-1", "px-2", "rounded-md", "shadow-sm", "text-sm");
        delBtn.onclick = () => {
          if(confirm("この予定を削除しますか？")) {
            events[dateKey].splice(i, 1);
            if(events[dateKey].length === 0) delete events[dateKey];
            saveData();
            openModal(dateKey);
            renderCalendar();
          }
        };
        div.appendChild(delBtn);

        eventList.appendChild(div);
      });
    } else {
      eventList.textContent = "予定はありません。";
    }

    newEventStart.value = "";
    newEventEnd.value = "";
    newEventText.value = "";

    modalBg.style.display = "flex";
    newEventText.focus();
  }

  // --- モーダルを閉じる ---
  function closeModal() {
    modalBg.style.display = "none";
    selectedDate = null;
  }

  // --- 予定追加 ---
  addEventBtn.onclick = () => {
    const text = newEventText.value.trim();
    if(!text) {
      alert("予定内容を入力してください。");
      return;
    }
    const start = newEventStart.value;
    const end = newEventEnd.value;
    if(start && end && start > end) {
      alert("終了時間は開始時間以降にしてください。");
      return;
    }

    if(!events[selectedDate]) events[selectedDate] = [];
    events[selectedDate].push({start, end, text});
    saveData();
    openModal(selectedDate);
    renderCalendar();
  };

  closeBtn.onclick = closeModal;
  modalBg.onclick = e => { if(e.target === modalBg) closeModal(); };

  // --- 月切り替え ---
  prevBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    saveData();
    renderCalendar();
  };
  nextBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    saveData();
    renderCalendar();
  };
  todayBtn.onclick = () => {
    currentDate = new Date(today);
    saveData();
    renderCalendar();
  };

  // --- JSON保存 ---
  saveJsonBtn.onclick = () => {
    const now = new Date();
    const fname = `Calendar-${CALENDAR_VERSION}_${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,"0")}_${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}_${String(now.getMinutes()).padStart(2,"0")}_${String(now.getSeconds()).padStart(2,"0")}.json`;
    const dataToSave = {
      version: CALENDAR_VERSION,
      currentDate: currentDate.toISOString(),
      events,
      tagColors
    };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  // --- JSONロード ---
  loadJsonBtn.onclick = () => loadJsonInput.click();
  loadJsonInput.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        if(json.version === CALENDAR_VERSION) {
          if(json.currentDate) currentDate = new Date(json.currentDate);
          if(json.events) events = json.events;
          if(json.tagColors) {
            tagColors = json.tagColors;
            cleanEmptyTags();
          }
          saveData();
          renderCalendar();
          alert("ファイルを読み込みました。");
        } else {
          alert("バージョンが異なるか不正なファイルです。");
        }
      } catch(err) {
        console.error("JSON読み込みエラー:", err);
        alert("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  // --- 設定UI ---
  settingsBtn.onclick = () => {
    renderTagColorInputs();
    settingsModalBg.style.display = "flex";
  };
  settingsCancelBtn.onclick = () => {
    settingsModalBg.style.display = "none";
  };
  settingsModalBg.onclick = e => {
    if(e.target === settingsModalBg) settingsModalBg.style.display = "none";
  };
  addTagBtn.onclick = () => {
    const tagName = newTagNameInput.value.trim();
    if(!tagName) return alert("タグ名を入力してください。");
    if(tagColors[tagName]) return alert("そのタグ名は既に存在します。");
    tagColors[tagName] = newTagColorInput.value;
    newTagNameInput.value = "";
    newTagColorInput.value = "#4a7c59";
    renderTagColorInputs();
  };
  settingsForm.onsubmit = e => {
    e.preventDefault();
    const colors = settingsForm.querySelectorAll("input[type=color]");
    colors.forEach(inp => {
      tagColors[inp.name] = inp.value;
    });
    cleanEmptyTags();
    saveData();
    settingsModalBg.style.display = "none";
    renderCalendar();
  };

  // --- 初期化 ---
  loadData();
  renderCalendar();

})();