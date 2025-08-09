(() => {
  const STORAGE_KEY = "calendarData-v2";
  const CALENDAR_VERSION = "2.0";

  // --- DOM取得 ---
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

  // --- 定数 ---
  const monthNamesJP = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
  const today = new Date();

  // --- ストレージデータ読み込み ---
  let data = {
    version: CALENDAR_VERSION,
    events: {},
    view: today.toISOString(),
    settings: {
      tagColors: {"仕事": "#4a7c59", "重要": "#a14a44", "趣味": "#4a6c7c"}
    }
  };

  // 1つのlocalStorageキーから読み込む関数
  function loadData(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if(parsed.version === CALENDAR_VERSION){
        data = parsed;
      }
    } catch {}
  }
  loadData();

  // 保存関数（dataオブジェクトを丸ごと保存）
  function saveData(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // --- ユーティリティ ---
  function formatDateKey(date){
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function cleanEmptyTags(){
    Object.keys(data.settings.tagColors).forEach(t=>{
      if(!t.trim()) delete data.settings.tagColors[t];
    });
  }

  // --- 状態変数 ---
  let currentDate = new Date(data.view);
  let selectedDate = null;

  // --- カレンダー描画 ---
  function renderCalendar(){
    calendarBody.innerHTML = "";
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    monthYear.textContent = `${y}年 ${monthNamesJP[m]}`;

    const firstDay = new Date(y,m,1).getDay();
    const daysInMonth = new Date(y,m+1,0).getDate();

    let day = 1;
    for(let w=0; w<6; w++){
      const tr = document.createElement("tr");
      for(let d=0; d<7; d++){
        const td = document.createElement("td");
        td.style.cursor = "default";
        td.textContent = "";
        td.className = "";
        td.removeAttribute("tabindex");
        td.removeAttribute("data-date-key");

        if((w>0 || d>=firstDay) && day <= daysInMonth){
          const dateKey = formatDateKey(new Date(y,m,day));
          td.textContent = day;
          td.style.cursor = "pointer";
          td.dataset.dateKey = dateKey;
          if(d===0) td.classList.add("sunday");
          if(d===6) td.classList.add("saturday");
          if(formatDateKey(today) === dateKey){
            td.classList.add("today");
            td.setAttribute("aria-current","date");
          }
          td.setAttribute("tabindex","0");
          td.addEventListener("click", () => openModal(dateKey));
          td.addEventListener("keydown", e => {
            if(e.key === "Enter" || e.key === " "){
              e.preventDefault();
              openModal(dateKey);
            }
          });

          // 予定プレビュー（最大3件）
          if(data.events[dateKey]){
            data.events[dateKey].slice(0,3).forEach(ev => {
              if(!ev.text) return;
              const span = document.createElement("span");
              span.className = "event-preview";
              const timeStr = (ev.start||"") + (ev.end ? "〜"+ev.end : "");
              span.title = timeStr + " " + ev.text;
              span.textContent = (timeStr ? `[${timeStr}] ` : "") + ev.text.replace(/#\S+/g,"").trim();
              td.appendChild(span);
            });
            if(data.events[dateKey].length > 3){
              const moreSpan = document.createElement("span");
              moreSpan.className = "more-events";
              moreSpan.textContent = `＋${data.events[dateKey].length - 3} 件`;
              td.appendChild(moreSpan);
            }
          }
          day++;
        } else {
          td.classList.add("empty-cell");
        }
        tr.appendChild(td);
      }
      calendarBody.appendChild(tr);
    }
  }

  // --- モーダル開く ---
  function openModal(dateKey){
    selectedDate = dateKey;
    modalDate.textContent = dateKey;
    eventList.innerHTML = "";

    if(data.events[dateKey] && data.events[dateKey].length){
      data.events[dateKey].forEach((ev,i) => {
        const div = document.createElement("div");
        div.className = "event-item";
        let timeStr = ev.start || "";
        if(ev.end) timeStr += "〜" + ev.end;
        const textNode = document.createTextNode((timeStr ? `[${timeStr}] ` : "") + ev.text.replace(/#\S+/g,"").trim());
        div.appendChild(textNode);

        const tags = (ev.text.match(/#(\S+)/g) || []).map(t => t.slice(1));
        tags.forEach(t => {
          const span = document.createElement("span");
          span.className = "event-tag";
          span.textContent = "#" + t;
          span.style.backgroundColor = data.settings.tagColors[t] || "#999";
          div.appendChild(span);
        });

        const delBtn = document.createElement("button");
        delBtn.textContent = "削除";
        delBtn.className = "ml-2 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded-md shadow-sm text-sm";
        delBtn.onclick = () => {
          if(confirm("この予定を削除しますか？")){
            data.events[dateKey].splice(i,1);
            if(data.events[dateKey].length === 0) delete data.events[dateKey];
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

  // --- モーダル閉じる ---
  function closeModal(){
    modalBg.style.display = "none";
    selectedDate = null;
  }

  // --- 予定追加 ---
  addEventBtn.onclick = () => {
    const text = newEventText.value.trim();
    if(!text){
      alert("予定内容を入力してください。");
      return;
    }
    const start = newEventStart.value;
    const end = newEventEnd.value;
    if(start && end && start > end){
      alert("終了時間は開始時間以降にしてください。");
      return;
    }
    if(!data.events[selectedDate]) data.events[selectedDate] = [];
    data.events[selectedDate].push({start,end,text});
    saveData();
    openModal(selectedDate);
    renderCalendar();
  };

  closeBtn.onclick = closeModal;
  modalBg.onclick = e => { if(e.target === modalBg) closeModal(); };

  // --- 月移動・今日ボタン ---
  prevBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth()-1);
    data.view = currentDate.toISOString();
    saveData();
    renderCalendar();
  };
  nextBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth()+1);
    data.view = currentDate.toISOString();
    saveData();
    renderCalendar();
  };
  todayBtn.onclick = () => {
    currentDate = new Date(today);
    data.view = currentDate.toISOString();
    saveData();
    renderCalendar();
  };

  // --- 設定UI描画 ---
  function renderTagColorInputs(){
    cleanEmptyTags();
    tagColorList.innerHTML = "";
    for(const tag in data.settings.tagColors){
      const div = document.createElement("div");
      div.className = "tag-row flex items-center mb-2";

      const label = document.createElement("label");
      label.textContent = tag;
      label.htmlFor = `color-${tag}`;
      label.className = "w-20 text-gray-700";

      const input = document.createElement("input");
      input.type = "color";
      input.id = `color-${tag}`;
      input.name = tag;
      input.value = data.settings.tagColors[tag];
      input.className = "flex-grow mr-2 rounded-md p-1 border border-gray-300";

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "削除";
      delBtn.title = `タグ「${tag}」を削除`;
      delBtn.className = "bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded-md shadow-sm";
      delBtn.onclick = () => {
        if(confirm(`タグ「${tag}」を削除しますか？`)){
          delete data.settings.tagColors[tag];
          renderTagColorInputs();
          renderCalendar();
          saveData();
        }
      };

      div.append(label, input, delBtn);
      tagColorList.appendChild(div);
    }
  }

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
    const name = newTagNameInput.value.trim();
    if(!name) return alert("タグ名を入力してください。");
    if(data.settings.tagColors[name]) return alert("そのタグ名は既に存在します。");
    data.settings.tagColors[name] = newTagColorInput.value;
    newTagNameInput.value = "";
    newTagColorInput.value = "#4a7c59";
    renderTagColorInputs();
  };
  settingsForm.onsubmit = e => {
    e.preventDefault();
    settingsForm.querySelectorAll("input[type=color]").forEach(inp => {
      data.settings.tagColors[inp.name] = inp.value;
    });
    cleanEmptyTags();
    saveData();
    settingsModalBg.style.display = "none";
    renderCalendar();
  };

  // --- JSON保存 ---
  saveJsonBtn.onclick = () => {
    const now = new Date();
    const fname = `Calendar-${CALENDAR_VERSION}_${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,"0")}_${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}_${String(now.getMinutes()).padStart(2,"0")}_${String(now.getSeconds()).padStart(2,"0")}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  // --- JSON読み込み ---
  loadJsonBtn.onclick = () => loadJsonInput.click();
  loadJsonInput.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        if(json.version === CALENDAR_VERSION){
          data = json;
          cleanEmptyTags();
          currentDate = new Date(data.view);
          saveData();
          renderCalendar();
          alert("ファイルを読み込みました。");
        } else {
          alert("不正なファイル形式です。");
        }
      } catch {
        alert("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  // 初回描画
  renderCalendar();

})();