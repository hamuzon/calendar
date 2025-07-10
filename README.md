# 📅 カレンダー / Calendar

## 📖 概要 / Overview

このカレンダーアプリは、**シンプルで直感的に使えるウェブベースのカレンダー**です。  
月単位で表示され、**1日に複数の予定を追加・管理**できます。(v2.0〜)
予定には**開始時間・終了時間**を設定でき、**タグによる分類・色分け**も可能です。

ユーザーの設定や予定はブラウザの `localStorage` に保存され、再訪時にも状態が保持されます。  
予定データは**JSON形式で保存・読み込み**できるため、バックアップや環境間の移行も容易です。

---

This calendar app is a **simple and intuitive web-based calendar**.  
It displays a monthly view and allows users to **add and manage multiple events per day**.  
Each event can have **start and end times**, and can be **tagged and color-coded**.

User settings and events are stored in the browser’s `localStorage`, so the state is preserved on revisit.  
All data can be **saved and loaded in JSON format**, making backups and migration easy.

---

## ✅ 主な機能 / Main Features

- 📆 月単位のカレンダー表示（日本語月名に対応）  
- 🌞 日曜・土曜に色をつけ視認性向上  
- 📍 今日の日付を強調表示  
- 📝 各日に複数予定を追加（時間指定対応）  
- 🏷️ タグによる分類、タグごとの色設定  
- 🎨 タグの追加・削除・色変更（設定画面）  
- ⌨️ キーボード操作対応（アクセシビリティ考慮）  
- 🔢 各日最大3件まで予定表示、超過分は「+件数」表示  
- ✏️ モーダルでの予定編集・削除  
- 📌 「今日へ戻る」ボタンで現在の月に即移動  
- 💾 JSONで予定と設定の保存・読み込み可能  
- 🌙 ダークモード対応（OS設定に連動）  
- 📱 レスポンシブデザイン（スマホ・PC対応）  

---

- 📆 Monthly calendar view (supports Japanese month names)  
- 🌞 Sundays and Saturdays are color-coded for clarity  
- 📍 Highlights today’s date  
- 📝 Add multiple events per day (with start and end time)  
- 🏷️ Tagging system with customizable tag colors  
- 🎨 Add, remove, or edit tags from the settings panel  
- ⌨️ Keyboard navigation supported (accessibility-friendly)  
- 🔢 Up to 3 events previewed per day cell, with "+N" indicator for extras  
- ✏️ Edit and delete events via modal dialog  
- 📌 "Back to Today" button for quick navigation  
- 💾 JSON save/load support for events and tag settings  
- 🌙 Dark mode support based on OS preference  
- 📱 Responsive design for both mobile and desktop  

---

## 🌐 オンライン版 / Online Version

このアプリは以下のURLからオンラインで利用できます：  
📎 [https://hamuzon.github.io/calendar/](https://hamuzon.github.io/calendar/)

アクセスすると、バージョン「v1.0」「v2.0」の選択画面が表示されます。  
それぞれのUIや機能の違いを確認して使用できます。

---

This app is available online at:  
📎 [https://hamuzon.github.io/calendar/](https://hamuzon.github.io/calendar/)

The site provides a selector between version “v1.0” and “v2.0”, allowing users to compare and choose the UI/features they prefer.

---

## 📁 ファイル構成 / File Structure

- `index.html` : HTML本体  
- `style.css` : カレンダーのスタイル  
- `script.js` : カレンダーの動作ロジック  
- `icon-light.svg` : ライトモード用アイコン  
- `icon-dark.svg` : ダークモード用アイコン  

---

- `index.html` : Main HTML file  
- `style.css` : Calendar styling  
- `script.js` : Logic and behavior (JavaScript)  
- `icon-light.svg` : Icon for light mode  
- `icon-dark.svg` : Icon for dark mode  

---

## 🚀 利用方法 / How to Use

1. `index.html` をブラウザで開くだけで利用可能です。  
2. 月の左右の矢印ボタンで表示月を切り替えます。  
3. 日付セルをクリックすると予定の追加・表示ができます。  
4. 予定には時間とタグを設定できます。  
5. 歯車ボタンからタグの色を変更可能です。  
6. 「今日へ戻る」ボタンで現在の月へ戻れます。  
7. 「保存」ボタンでJSONファイルに予定をエクスポートできます。  
8. 「読み込み」ボタンで以前保存した予定をインポートできます。  

---

1. Open `index.html` in your browser to start.  
2. Use the left/right arrows to change the displayed month.  
3. Click on a date cell to add or view events.  
4. Events can include time and tags.  
5. Use the gear icon to customize tag colors.  
6. Click "Back to Today" to return to the current month.  
7. Use the "Save" button to export your data as a JSON file.  
8. Use the "Load" button to import previously saved data.  

---

## 👤 開発・管理 / Development & Management

このプロジェクトは**個人の趣味開発**として作成されています。  
ご意見・バグ報告などございましたら、お気軽にご連絡ください。

---

This project is developed as a **personal hobby**.  
Feel free to reach out for any feedback or bug reports.
