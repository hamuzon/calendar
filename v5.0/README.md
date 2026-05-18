# バージョンの違い / Differences between Versions

## 📊 v4.0 と v5.0 の違い / Differences between v4.0 and v5.0

### 日本語

- 🔍 **詳細検索モーダルとインクルーシブ（絞り込み）タグフィルタ**  
  検索用のモーダル（🔍ボタン）が追加され、キーワードでの部分一致検索に加え、「選択したタグのみを表示する（インクルーシブ）」高度なフィルタ機能が搭載されました。  
  複数のタグを選択してそれらを含む予定のみを絞り込むことができます。

- 🏷️ **インタラクティブな絞り込み状態バナー（個別解除可能）**  
  カレンダーの上部に現在適用中のフィルタ状態がバッジ（ピル）形式でリアルタイムに表示されます。  
  タグバッジの `[×]` をクリックして個別にフィルタを外したり、一括でクリアできます。

- 🌈 **スマートコントラスト機能**  
  タグの背景色に応じて、バッジ内の文字色が自動的に黒（明るい色）または白（暗い色）に自動調節されます。  
  これにより、どのような色のタグでも常に完璧な可視性を持ちます。

- 📱 **レスポンシブの再設計（スクロールフリー・自動トリミング）**  
  カレンダーテーブルの `min-width` を撤廃し、モバイル（320px〜）に完全追従しました。  
  スマホ表示の時はセルの高さを最適化し、予定のタグや場所を一時的に隠して `...` で綺麗に自動トリミング（ellipsis）することで、スクロールのないすっきりしたモバイル画面を実現しました。

- ⚙️ **クエリパラメータ同期 & ダイレクトリンク対応**  
  `?y=2026&m=6&d=18` などのパラメータによって、特定の年月日にダイレクトリンクすることが可能になりました。また、`?q=キーワード&tags=#仕事` のように、検索しているクエリや選択したタグもリアルタイムでURLと双方向同期されます。

---

### English

- 🔍 **Search Modal & Inclusive Tag Filtering**  
  Add advanced calendar search featuring keyword-based filtering and inclusive tag-matching.  
  Select multiple tags to display only those events on the calendar grid.

- 🏷️ **Interactive Filter Status Banner (Clear Individual / All)**  
  Live active-filter pills are displayed above the calendar.  
  Click `[×]` on any tag or search pill to clear it individually, or click `Clear ×` to reset all filters.

- 🌈 **Smart Contrast (Luminance) Detection**  
  Dynamically calculates the optimal text color (dark gray or white) based on the background color of each tag.  
  This ensures maximum readability regardless of your custom tag colors.

- 📱 **Fluid Mobile Responsiveness (Scroll-free & Ellipsis)**  
  Fluid layout with no horizontal scroll down to 320px.  
  On small screens, monthly cells automatically hide tags/locations and use `text-overflow: ellipsis` for a clean, professional grid.

- ⚙️ **URL Query Parameter Sync & Direct Linking**  
  Supports direct linking to any specific year, month, or day via URL query parameters like `?y=2026&m=6&d=18`. It also fully syncs the active search query `q` and selected tags `tags` with the browser URL.

