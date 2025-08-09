# バージョンの違い / Differences between Versions

## 📊 v2.0 と v3.0 の違い / Differences between v2.0 and v3.0

### 日本語

- 🗂 **データ構造の違い**  
  v2.0 では、イベントは日付ごとにオブジェクトの配列で管理されます。例えば、 `"2025-07-10": [ { start, end, text }, ... ]` の形式です。  
  v3.0 では、すべてのイベントが配列として一元管理され、各イベントに `date` プロパティが付与されます。例：`[ { date, start, end, text }, ... ]`。  
  この変更により、イベントの扱いやフィルタリングが柔軟になりました。

- 🏷️ **タグ表記と管理**  
  両バージョンともタグはイベントテキスト内に `#タグ名` のハッシュ付きで記述されます。  
  タグカラーは `tagColors` オブジェクトのキーにハッシュ付きタグ名を使用しています。  
  ハッシュの有無で不整合が起きないよう、タグ抽出と色判定はハッシュ付きのまま統一されています。

- 🛠 **編集機能の追加**  
  v2.0 ではイベントの編集機能がありません。  
  v3.0 では、各イベントに編集ボタンが追加され、開始・終了時間や内容の変更が可能になりました。

- 🔄 **UI 表示名の変更**  
  v3.0 では、ボタン名やラベルなどの表示名がより分かりやすく改善され、ユーザー体験が向上しています。

- 🔧 **互換性について**  
  v3.0 は v2.0 形式のデータも読み込めるよう自動判別と変換機能を備えています。  
  したがって、過去のデータをそのまま利用可能で後方互換性があります。

---

### English

- 🗂 **Difference in Data Structure**  
  In version 2.0, events are managed grouped by date as an object, e.g., `"2025-07-10": [ { start, end, text }, ... ]`.  
  In version 3.0, all events are stored in a single flat array with each event including a `date` property, e.g., `[ { date, start, end, text }, ... ]`.  
  This change allows more flexible handling and filtering of events.

- 🏷️ **Tag Syntax and Management**  
  Both versions use tags inside event text with a hash prefix, like `#tagname`.  
  Tag colors are managed using the `tagColors` object with keys including the hash.  
  To avoid inconsistencies, tag extraction and color mapping are consistently done with the hash included.

- 🛠 **Addition of Edit Feature**  
  Version 2.0 does not have event editing capabilities.  
  Version 3.0 adds edit buttons on each event to allow modifying start/end times and contents.

- 🔄 **UI Label Changes**  
  Version 3.0 improved button and label names for better user experience.

- 🔧 **Compatibility**  
  Version 3.0 can automatically detect and convert version 2.0 data on load.  
  Therefore, backward compatibility is maintained, allowing continued use of older data.

---

### ⚠️ 注意点 / Notes

- 説明は現時点の仕様に基づいています。もしアプリの実装や仕様が変わっている場合があります。  
- タグのハッシュ付き管理は現状の推奨仕様ですが、将来的に変更する場合はデータの互換性に注意が必要です。  
- 編集機能やUIは今後さらに拡張される可能性があります。

---
