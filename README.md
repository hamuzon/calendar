# カレンダー / Calendar

## 概要

このカレンダーアプリケーションは、シンプルで使いやすいウェブベースのカレンダーです。
月ごとの表示で、各日に複数の予定を追加・管理できます。
予定には開始時間・終了時間を設定でき、タグによる分類や色分けが可能です。

ユーザーの設定や予定はブラウザの `localStorage` に保存され、再訪問時にも状態が保持されます。
また、予定データはJSON形式で保存・読み込みができるため、バックアップや他の環境での利用が容易です。

## 主な機能

* 月単位のカレンダー表示（日本語の月名対応）

* 日曜日・土曜日のセルに色を付けて視認性向上

* 今日の日付を強調表示

* 各日に複数予定追加可能、開始・終了時間設定対応

* 予定にタグを付けて分類、タグごとに色を設定可能

* タグの追加・削除・色変更が設定画面からできる

* キーボード操作にも対応しアクセシビリティを考慮

* 予定は最大3件までカレンダーセルにプレビュー表示、超過分は「＋件数」で示す

* 予定の編集・削除がモーダル内で簡単操作可能

* 「今日に戻る」ボタンで即座に現在の月にジャンプ

* 予定データおよびタグ設定のJSON保存・読み込み機能

* ダークモード対応（OSのカラースキームに自動対応）

* スマホ・PC両対応のレスポンシブデザイン

## オンライン版について

本カレンダーは以下のURLでオンライン公開されています。
<https://hamuzon.github.io/calendar/>

アクセスすると、バージョン「v1.0」と「v2.0」を選択できるトップページが表示されます。
それぞれのバージョンの機能やUIの違いを確認しながら利用可能です。

## ファイル構成

* `index.html` : カレンダーのHTMLファイル

* `style.css` : カレンダーのスタイルシート

* `script.js` : カレンダーの動作ロジックを記述したJavaScriptファイル

* `icon-light.svg` : ライトモード用のアイコン画像

* `icon-dark.svg` : ダークモード用のアイコン画像

## 利用方法

1. `index.html` をブラウザで開くだけで利用可能です。

2. 月の左右の矢印ボタンで表示月を切り替えます。

3. 日付セルをクリックすると、その日の予定を追加・閲覧できます。

4. 予定には開始・終了時間やタグをつけられます。

5. 右上の歯車ボタンからタグの色設定を編集できます。

6. 「今日へ戻る」ボタンで現在の日付の月に戻ります。

7. 「予定を保存」ボタンでJSONファイルとして予定と設定をダウンロード。

8. 「予定を読み込む」ボタンで保存済みJSONファイルを読み込めます。

## 開発・管理

このプロジェクトは個人開発の趣味用に作成されています。
フィードバックやバグ報告などあれば気軽にお問い合わせください。

# Calendar

## Overview

This calendar application is a simple and user-friendly web-based calendar.
It displays months and allows you to add and manage multiple events per day.
Events can have start and end times, and can be categorized with tags that have customizable colors.

User settings and events are saved in the browser's `localStorage`, preserving state on revisit.
Events data can also be saved and loaded in JSON format, making backup and transfer easy.

## Main Features

* Monthly calendar display with Japanese month names

* Sunday and Saturday cells colored for better visibility

* Highlighting of today's date

* Multiple events per day with start/end time support

* Event categorization with tags and customizable tag colors

* Tag add/delete/color change via settings panel

* Accessibility support including keyboard navigation

* Up to 3 event previews shown in each calendar cell; excess shown as "+N"

* Easy event editing and deletion in modal dialog

* "Back to Today" button to jump to current month instantly

* JSON save/load for events and tag settings

* Dark mode support following OS color scheme

* Responsive design for both mobile and desktop

## Online Version

This calendar is publicly available online at:
<https://hamuzon.github.io/calendar/>

Upon visiting, a top page allows you to choose between version "v1.0" and "v2.0".
You can compare features and UI of each version before use.

## File Structure

* `index.html` : The HTML file for the calendar

* `style.css` : Stylesheet for the calendar

* `script.js` : JavaScript file containing calendar logic

* `icon-light.svg` : Icon image for light mode

* `icon-dark.svg` : Icon image for dark mode

## How to Use

1. Open `index.html` in a web browser to use the calendar.

2. Use the left/right arrow buttons to switch the displayed month.

3. Click a date cell to view and add events for that day.

4. Events can include start/end times and tags.

5. Use the gear button at the top right to edit tag colors.

6. Click the "Back to Today" button to return to the current month.

7. Use the "Save" button to download events and settings as a JSON file.

8. Use the "Load" button to load a previously saved JSON file.

## Development & Management

This project is developed as a personal hobby.
Please feel free to contact me for feedback or bug reports
