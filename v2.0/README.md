# バージョンの違い / Differences between Versions

## 📊 v1.0 と v2.0 の違い / Differences between v1.0 and v2.0

### 日本語

- 🏷️ **タグ分類機能の追加**  
  v1.0 では単なる予定テキストでしたが、v2.0 では `#仕事` や `#プライベート` などのハッシュタグを含めることで分類できるようになりました。  
  予定テキストからハッシュタグが自動抽出され、視認性が向上します。

- 🎨 **タグの色設定画面**  
  設定画面（歯車マーク）からタグを追加し、好きな色（カラーピッカー使用）を設定できるようになりました。  
  タグの色はカレンダーグリッド上の予定バッジに自動で反映されます。

- 💾 **データ構造の拡張**  
  JSON形式のデータに `tagColors` やユーザー設定（settings）が含まれるようになりました。  
  これにより、設定も予定データと一緒に完全にバックアップ・移行可能です。

---

### English

- 🏷️ **Tagging and Classification**  
  In v1.0, events were raw text only. In v2.0, you can include hashtags like `#tagname` to classify events.  
  Hashtags are automatically extracted from the event text for better visibility.

- 🎨 **Tag Customization Panel**  
  A new settings panel (gear icon) allows adding tags and choosing custom colors using a color picker.  
  Applied tag colors are rendered instantly as pill backgrounds in the calendar grid.

- 💾 **Extended Data Structure**  
  Exported JSON files now include `tagColors` and user settings.  
  This allows fully restoring both events and custom configurations at once.
