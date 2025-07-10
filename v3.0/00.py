filenames = ["index.html", "script.js", "style.css"]

for filename in filenames:
    with open(filename, "w", encoding="utf-8") as f:
        pass  # 空ファイルを作る（中身なし）

print("空の3ファイルを作成しました。")
