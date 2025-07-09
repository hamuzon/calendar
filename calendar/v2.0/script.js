(() => {
  // DOM要素の取得
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

  // 設定関連のDOM要素
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModalBg = document.getElementById("settings-modal-bg");
  const settingsModal = document.getElementById("settings-modal");
  const settingsForm = document.getElementById("settings-form");
  const settingsCancelBtn = document.getElementById("settings-cancel-btn");
  const tagColorList = document.getElementById("tag-color-list");
  const addTagBtn = document.getElementById("add-tag-btn");
  const newTagNameInput = document.getElementById("new-tag-name");
  const newTagColorInput = document.getElementById("new-tag-color");

  // localStorageのキーとカレンダーのバージョン
  const STORAGE_EVENTS = "calendar_events";
  const STORAGE_VIEW = "calendar_view";
  const STORAGE_SETTINGS = "calendar_settings";
 const CALENDAR_VERSION = "2.0";;

  // 日本語の月名
  const monthNamesJP = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

  // 初期状態の変数
  let today = new Date(); // 今日の日付
  // localStorageから現在のビュー（月）をロード、なければ今日の日付
  let currentDate = localStorage.getItem(STORAGE_VIEW) ? new Date(localStorage.getItem(STORAGE_VIEW)) : new Date(today);
  // localStorageから予定をロード、なければ空のオブジェクト
  let events = JSON.parse(localStorage.getItem(STORAGE_EVENTS) || "{}");
  // デフォルトのタグ色
  let tagColors = {
    "仕事": "#4a7c59",
    "重要": "#a14a44",
    "趣味": "#4a6c7c"
  };
  let selectedDate = null; // モーダルで選択中の日付

  // 空タグをタグ色から除去する関数
  function cleanEmptyTags() {
    for(const tag in tagColors) {
      if(!tag.trim()) { // タグ名が空文字列の場合
        delete tagColors[tag]; // 削除
      }
    }
  }

  // 設定をlocalStorageからロードする関数
  function loadSettings() {
    const saved = localStorage.getItem(STORAGE_SETTINGS);
    if(saved) {
      try {
        const data = JSON.parse(saved);
        if(data.tagColors) {
          tagColors = data.tagColors;
          cleanEmptyTags(); // ロード後も掃除
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }
  loadSettings(); // アプリケーション起動時に設定をロード

  // タグ色設定UIをレンダリングする関数
  function renderTagColorInputs() {
    cleanEmptyTags(); // 描画前に掃除

    tagColorList.innerHTML = ""; // リストをクリア
    for(const tag in tagColors) {
      const div = document.createElement("div");
      div.classList.add("tag-row", "flex", "items-center", "mb-2"); // Tailwind classes
      
      const label = document.createElement("label");
      label.textContent = tag;
      label.htmlFor = `color-${tag}`;
      label.classList.add("w-20", "text-gray-700"); // Tailwind classes

      const input = document.createElement("input");
      input.type = "color";
      input.id = `color-${tag}`;
      input.name = tag;
      input.value = tagColors[tag];
      input.classList.add("flex-grow", "mr-2", "rounded-md", "p-1", "border", "border-gray-300"); // Tailwind classes

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.textContent = "削除";
      delBtn.title = `タグ「${tag}」を削除`;
      delBtn.classList.add("bg-red-500", "hover:bg-red-600", "text-white", "font-bold", "py-1", "px-3", "rounded-md", "shadow-sm"); // Tailwind classes
      delBtn.onclick = () => {
        if(confirm(`タグ「${tag}」を削除しますか？`)) {
          delete tagColors[tag];
          renderTagColorInputs(); // UIを再描画
        }
      };
      div.append(label, input, delBtn);
      tagColorList.appendChild(div);
    }
  }

  // 設定ボタンクリックイベント
  settingsBtn.onclick = () => {
    renderTagColorInputs(); // 設定UIをレンダリング
    settingsModalBg.style.display = "flex"; // モーダルを表示
  };
  // 設定キャンセルボタンクリックイベント
  settingsCancelBtn.onclick = () => settingsModalBg.style.display = "none";
  // 設定モーダルの背景クリックイベント（背景クリックで閉じる）
  settingsModalBg.onclick = e => { if(e.target === settingsModalBg) settingsModalBg.style.display = "none"; };

  // タグ追加ボタンクリックイベント
  addTagBtn.onclick = () => {
    const tagName = newTagNameInput.value.trim();
    if(!tagName) return alert("タグ名を入力してください。");
    if(tagColors[tagName]) return alert("そのタグ名はすでに存在します。");
    tagColors[tagName] = newTagColorInput.value; // 新しいタグと色を追加
    newTagNameInput.value = ""; // 入力フィールドをクリア
    newTagColorInput.value = "#4a7c59"; // 色をデフォルトに戻す
    renderTagColorInputs(); // UIを再描画
  };

  // 設定フォームの送信イベント
  settingsForm.onsubmit = e => {
    e.preventDefault(); // デフォルトのフォーム送信を防止

    const colors = settingsForm.querySelectorAll("input[type=color]");
    colors.forEach(inp => {
      tagColors[inp.name] = inp.value; // 変更されたタグ色を更新
    });

    cleanEmptyTags(); // 保存前に掃除

    // 設定をlocalStorageに保存
    localStorage.setItem(STORAGE_SETTINGS, JSON.stringify({tagColors}));
    settingsModalBg.style.display = "none"; // モーダルを閉じる
    renderCalendar(); // カレンダーを再描画して変更を反映
  };

  // YYYY-MM-DD形式で日付キーを作成する関数
  function formatDateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
  }

  // 複数予定タグ付きテキストdivを作成する関数 (現在未使用だが、将来的に再利用可能)
  function createEventElements(eventsArray) {
    const container = document.createElement("div");
    eventsArray.sort((a,b) => (a.start || "") < (b.start || "") ? -1 : 1); // 開始時刻でソート
    eventsArray.forEach(ev => {
      if(!ev.text) return;
      const evDiv = document.createElement("div");
      evDiv.className = "event";
      let timeStr = "";
      if(ev.start) {
        timeStr += ev.start;
        if(ev.end) timeStr += "〜" + ev.end;
        timeStr += " ";
      }
      evDiv.textContent = timeStr + ev.text.replace(/#\S+/g,"").trim(); // タグ部分を除去したテキスト

      // タグ表示
      const tags = (ev.text.match(/#(\S+)/g) || []).map(t => t.slice(1)); // テキストからタグを抽出
      tags.forEach(t => {
        const tagSpan = document.createElement("span");
        tagSpan.className = "event-tag";
        tagSpan.textContent = "#" + t;
        tagSpan.style.backgroundColor = tagColors[t] || "#999"; // 設定された色、なければグレー
        evDiv.appendChild(tagSpan);
      });
      container.appendChild(evDiv);
    });
    return container;
  }

  // カレンダーを描画する関数
  function renderCalendar() {
    calendarBody.innerHTML = ""; // カレンダーの中身をクリア
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYear.textContent = `${year}年 ${monthNamesJP[month]}`; // 月と年を表示

    const firstDay = new Date(year, month, 1).getDay(); // 月の最初の日（曜日）
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // その月の日数

    let dayCount = 1;

    // 6週間分の行を生成
    for(let week = 0; week < 6; week++) {
      const tr = document.createElement("tr");
      for(let d = 0; d < 7; d++) {
        const td = document.createElement("td");
        td.style.cursor = "default";
        td.textContent = "";
        td.className = "";
        td.removeAttribute("tabindex");
        td.removeAttribute("data-date-key");

        // 月の範囲内の日付の場合
        if((week > 0 || d >= firstDay) && dayCount <= daysInMonth) {
          td.textContent = dayCount;
          td.style.cursor = "pointer";
          td.dataset.dateKey = formatDateKey(new Date(year, month, dayCount)); // 日付キーを設定

          if(d === 0) td.classList.add("sunday"); // 日曜日
          if(d === 6) td.classList.add("saturday"); // 土曜日

          // 今日の日付をハイライト
          if(formatDateKey(today) === td.dataset.dateKey) {
            td.classList.add("today");
            td.setAttribute("aria-current", "date");
          }

          td.setAttribute("tabindex", "0"); // キーボード操作可能に
          td.addEventListener("click", () => openModal(td.dataset.dateKey)); // クリックでモーダルを開く
          td.addEventListener("keydown", e => {
            if(e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openModal(td.dataset.dateKey);
            }
          });

          // 予定簡易表示（最大3件）
          const dateKey = td.dataset.dateKey;
          if(events[dateKey]) {
            events[dateKey].slice(0, 3).forEach(ev => { // 最大3件
              if(!ev.text) return;
              const evSpan = document.createElement("span");
              evSpan.className = "event-preview"; // プレビュー用のクラス
              const timeStr = (ev.start ? ev.start : "") + (ev.end ? "〜" + ev.end : "");
              evSpan.title = timeStr + " " + ev.text; // ホバーで全文表示
              evSpan.textContent = (timeStr ? `[${timeStr}] ` : "") + ev.text.replace(/#\S+/g,"").trim(); // タグを除去したテキスト
              td.appendChild(evSpan);
            });
            if(events[dateKey].length > 3) {
              const moreSpan = document.createElement("span");
              moreSpan.textContent = `＋${events[dateKey].length - 3} 件`;
              moreSpan.classList.add("more-events"); // スタイリング用のクラス
              td.appendChild(moreSpan);
            }
          }

          dayCount++;
        } else {
          td.classList.add("empty-cell"); // 月の範囲外のセル
        }
        tr.appendChild(td);
      }
      calendarBody.appendChild(tr);
    }
  }

  // モーダルを開く関数
  function openModal(dateKey) {
    selectedDate = dateKey; // 選択された日付を保存
    modalDate.textContent = dateKey; // モーダルに日付を表示

    eventList.innerHTML = ""; // 予定リストをクリア
    if(events[dateKey] && events[dateKey].length) {
      // 予定がある場合
      events[dateKey].forEach((ev, i) => {
        const div = document.createElement("div");
        div.className = "event-item"; // モーダル内の予定アイテム用クラス
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
        delBtn.classList.add("ml-2", "bg-red-500", "hover:bg-red-600", "text-white", "font-bold", "py-1", "px-2", "rounded-md", "shadow-sm", "text-sm"); // Tailwind classes
        delBtn.onclick = () => {
          if(confirm("この予定を削除しますか？")) {
            events[dateKey].splice(i, 1); // 該当の予定を削除
            if(events[dateKey].length === 0) delete events[dateKey]; // 予定がなくなったら日付キーも削除
            localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events)); // localStorageを更新
            openModal(dateKey); // モーダルを再描画
            renderCalendar(); // カレンダーを再描画
          }
        };
        div.appendChild(delBtn);

        eventList.appendChild(div);
      });
    } else {
      eventList.textContent = "予定はありません。"; // 予定がない場合
    }

    // 新規予定入力フォームをクリア
    newEventStart.value = "";
    newEventEnd.value = "";
    newEventText.value = "";

    modalBg.style.display = "flex"; // モーダルを表示
    newEventText.focus(); // テキスト入力にフォーカス
  }

  // モーダルを閉じる関数
  function closeModal() {
    modalBg.style.display = "none";
    selectedDate = null;
  }

  // 予定追加ボタンクリックイベント
  addEventBtn.onclick = () => {
    const text = newEventText.value.trim();
    if(!text) {
      alert("予定内容を入力してください。");
      return;
    }
    const start = newEventStart.value;
    const end = newEventEnd.value;
    // 開始時刻と終了時刻のバリデーション
    if(start && end && start > end) {
      alert("終了時間は開始時間以降にしてください。");
      return;
    }

    if(!events[selectedDate]) events[selectedDate] = []; // その日の予定がなければ配列を初期化
    events[selectedDate].push({start, end, text}); // 予定を追加
    localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events)); // localStorageを更新
    openModal(selectedDate); // モーダルを再描画
    renderCalendar(); // カレンダーを再描画
  };

  closeBtn.onclick = closeModal; // 閉じるボタン
  modalBg.onclick = e => { if(e.target === modalBg) closeModal(); }; // 背景クリックで閉じる

  // 前月ボタンクリックイベント
  prevBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1); // 月を1つ戻す
    localStorage.setItem(STORAGE_VIEW, currentDate.toISOString()); // 表示月を保存
    renderCalendar(); // カレンダーを再描画
  };
  // 翌月ボタンクリックイベント
  nextBtn.onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1); // 月を1つ進める
    localStorage.setItem(STORAGE_VIEW, currentDate.toISOString()); // 表示月を保存
    renderCalendar(); // カレンダーを再描画
  };
  // 今日ボタンクリックイベント
  todayBtn.onclick = () => {
    currentDate = new Date(today); // 今日を現在の表示月に設定
    localStorage.setItem(STORAGE_VIEW, currentDate.toISOString()); // 表示月を保存
    renderCalendar(); // カレンダーを再描画
  };

  // JSON保存ボタンクリックイベント
  saveJsonBtn.onclick = () => {
    const now = new Date();
    // ファイル名を生成 (例: Calendar-1.0_2025_07_09_14_30_00.json)
    const fname = `Calendar-${CALENDAR_VERSION}_${now.getFullYear()}_${String(now.getMonth()+1).padStart(2,"0")}_${String(now.getDate()).padStart(2,"0")}_${String(now.getHours()).padStart(2,"0")}_${String(now.getMinutes()).padStart(2,"0")}_${String(now.getSeconds()).padStart(2,"0")}.json`;
    const dataToSave = {
      version: CALENDAR_VERSION, // バージョン情報を含める
      events, // 全ての予定データ
      tagColors // タグ色データ
    };
    // Blobを作成し、ダウンロードリンクを生成
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fname;
    document.body.appendChild(a); // DOMに追加しないとFirefoxで動作しない場合がある
    a.click(); // ダウンロードを開始
    document.body.removeChild(a); // リンクを削除
    URL.revokeObjectURL(a.href); // オブジェクトURLを解放
  };

  loadJsonBtn.onclick = () => loadJsonInput.click(); // JSONロードボタンクリックでファイル選択ダイアログを開く
  loadJsonInput.onchange = e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        if(json.version) { // バージョンチェック
          if(json.events) events = json.events; // 予定をロード
          if(json.tagColors) {
            tagColors = json.tagColors; // タグ色をロード
            cleanEmptyTags(); // ロード後も掃除
          }
          localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events)); // localStorageに保存
          localStorage.setItem(STORAGE_SETTINGS, JSON.stringify({tagColors})); // localStorageに保存
          renderCalendar(); // カレンダーを再描画
          alert("ファイルを読み込みました。");
        } else {
          alert("不正なファイル形式です。"); // バージョンがない場合のエラー
        }
      } catch (error) {
        console.error("Error loading JSON file:", error);
        alert("ファイルの読み込みに失敗しました。"); // JSONパースエラーなど
      }
    };
    reader.readAsText(file); // ファイルをテキストとして読み込む
  };

  // 初回描画
  renderCalendar();

})();
