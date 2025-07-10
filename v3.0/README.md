## v2.0 と v3.0 の違い / Differences between v2.0 and v3.0

両バージョンとも内部の JSON 構造はほぼ同じです。  
Both versions share almost the same internal JSON structure.

| 項目 / Item            | v2.0                                                  | v3.0                                                  |
|------------------------|-------------------------------------------------------|-------------------------------------------------------|
| データ形式 / Data format | events = { "YYYY-MM-DD": [ { start, end, text } ] }   | events = [ { date, start, end, text } ]              |
| タグ記述 / Tag syntax   | text 内に #タグ名 を記述                                | タグ名のみ記述（ハッシュなし）                       |
| 色設定 / Tag colors    | settings.tagColors を使用                              | settings.tagColors を使用（同じ）                    |
| 保存先 / Save options   | ローカルストレージ と JSONファイル                    | ローカルストレージ と JSONファイル                  |
| 編集機能 / Edit feature | なし                                                  | あり：ボタンから編集可能                             |
| 表示名 / Label changes  | 一部旧形式の表示名                                     | わかりやすく調整されたラベル名                       |

補足 / Note:  
両バージョンは互換性があり、v2.0 形式のファイルも自動的に v3.0 として読み込まれます。  
Both versions are compatible. v2.0 files are automatically interpreted as v3.0 at runtime.
