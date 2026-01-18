"use strict";

/* =========================================================
 * Calendar App v4.0 (v1.0 / v2.0 / v3.0 完全対応 修正版)
 * ========================================================= */

/* ---------- 定数 ---------- */
const SUPPORTED_VERSIONS = ["1.0", "2.0", "3.0", "4.0"];
const CURRENT_SAVE_VERSION = "4.0";
const STORAGE_KEY = "calendarData-v4";

/* ---------- HTML要素 ---------- */
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

/* ---------- 状態 ---------- */
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

/* ---------- util ---------- */
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}
function getRandomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}

/* =========================================================
 * バージョンロード & 変換
 * ========================================================= */

function loadCalendarData(raw) {
  if (!raw || typeof raw !== "object") throw new Error("invalid data");
  const version = raw.version || "1.0";
  if (!SUPPORTED_VERSIONS.includes(version)) throw new Error("unsupported version");

  switch (version) {
    case "1.0": return convertV1toV4(raw);
    case "2.0": return convertV2toV4(raw);
    case "3.0": return convertV3toV4(raw);
    case "4.0": return raw;
  }
}

function convertV1toV4(data) {
  const events = {};
  for (const date in data.events || {}) {
    const raw = data.events[date];
    if (!events[date]) events[date] = [];
    if (typeof raw === "string") {
      const time = raw.match(/(\d{1,2}:\d{2})(?:～(\d{1,2}:\d{2}))?/);
      const tags = raw.match(/#\S+/g) || [];
      events[date].push({
        start: time ? time[1] : "",
        end: time && time[2] ? time[2] : "",
        text: raw.replace(/(\d{1,2}:\d{2})(～(\d{1,2}:\d{2}))?/,"").replace(/#\S+/g,"").trim(),
        location: "",
        notify: false,
        tags
      });
    }
  }
  return { version: "4.0", events, tagColors: calendarData.tagColors };
}

function convertV2toV4(data) {
  const events = {};
  for (const date in data.events || {}) {
    events[date] = data.events[date].map(ev => ({
      start: ev.start || "",
      end: ev.end || "",
      text: ev.text || "",
      location: "",
      notify: false,
      tags: ev.tags || []
    }));
  }
  return { version: "4.0", events, tagColors: data.tagColors || {} };
}

function convertV3toV4(data) {
  const events = {};
  for (const date in data.events || {}) {
    events[date] = data.events[date].map(ev => ({
      start: ev.start || "",
      end: ev.end || "",
      text: ev.text || "",
      location: ev.location || "",
      notify: !!ev.notify,
      tags: ev.tags || []
    }));
  }
  return { version: "4.0", events, tagColors: data.tagColors || {} };
}

/* =========================================================
 * LocalStorage
 * ========================================================= */

function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(calendarData));
}
function loadFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;
  calendarData = loadCalendarData(JSON.parse(stored));
}

/* =========================================================
 * Calendar描画
 * ========================================================= */

function drawCalendar(date) {
  calendarBody.innerHTML = "";
  const year = date.getFullYear();
  const month = date.getMonth();
  monthYear.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const tr = document.createElement("tr");
    for (let d = 0; d < 7; d++, day++) {
      const td = document.createElement("td");
      const cellDate = new Date(year, month, day);
      td.dataset.date = formatDate(cellDate);
      td.textContent = cellDate.getDate();
      if (cellDate.getMonth() !== month) td.classList.add("adjacent-month");
      td.addEventListener("click", () => openModal(cellDate));
      tr.appendChild(td);
    }
    calendarBody.appendChild(tr);
  }
}

/* =========================================================
 * Modal
 * ========================================================= */

let selectedDate = null;
let editingIndex = null;

function openModal(date) {
  selectedDate = formatDate(date);
  modalDateTitle.textContent = selectedDate;
  updateEventList();
  modalBg.style.display = "flex";
}
function closeModal() {
  modalBg.style.display = "none";
}

closeBtn.onclick = closeModal;
modalBg.onclick = e => e.target === modalBg && closeModal();

/* =========================================================
 * Event List
 * ========================================================= */

function updateEventList() {
  eventList.innerHTML = "";
  const list = calendarData.events[selectedDate] || [];
  list.forEach((ev, i) => {
    const div = document.createElement("div");
    div.textContent = `${ev.start} ${ev.text}`;
    const del = document.createElement("button");
    del.textContent = "削除";
    del.onclick = () => {
      list.splice(i, 1);
      if (!list.length) delete calendarData.events[selectedDate];
      saveToLocalStorage();
      updateEventList();
      drawCalendar(currentDate);
    };
    div.appendChild(del);
    eventList.appendChild(div);
  });
}

/* =========================================================
 * Add / Update
 * ========================================================= */

addEventBtn.onclick = () => {
  const text = newEventText.value.trim();
  if (!text) return;

  const tags = (newEventTagsInput.value.match(/#\S+/g) || []);
  tags.forEach(t => calendarData.tagColors[t] ||= getRandomColor());

  const ev = {
    start: newEventStart.value,
    end: newEventEnd.value,
    text,
    location: newEventLocation.value,
    notify: newEventNotify.checked,
    tags
  };

  calendarData.events[selectedDate] ||= [];
  calendarData.events[selectedDate].push(ev);
  saveToLocalStorage();
  updateEventList();
  drawCalendar(currentDate);
};

/* =========================================================
 * 起動
 * ========================================================= */

loadFromLocalStorage();
drawCalendar(currentDate);