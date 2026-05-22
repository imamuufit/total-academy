# Platform Buddy

Platform Buddyは、BIG3の現在地と目標を見える化し、PRサイクル、記録、分析、大会準備までつなげて管理できるパワーリフティング向けPWAです。

## v97の更新内容

このv97では、画像表示の重さと文字の読みにくさを優先して修正しました。

- 背景画像とキャラクター画像を軽量JPEG版へ切り替え
- 白いカードレイヤーで画像が見えにくい箇所を調整
- タブ、カード、入力欄、ボタンの文字色を全体的に見直し
- スマホ右下の「今日の体調」と「ガイドモード」が重なりにくい配置へ調整
- PWAキャッシュを `platform-buddy-v97` に更新

## アップロード方法

GitHub Pagesへ更新するときは、このZIPの中身をすべてリポジトリのトップ階層へ上書きアップロードしてください。

`assets`フォルダは不要です。画像ファイルは、`index.html`や`styles.css`と同じ一番上の階層に並べてください。

## 必要なファイル

- index.html
- styles.css
- app.js
- sw.js
- manifest.webmanifest
- README.md
- reset.html
- icon.svg
- apple-touch-icon.png
- home-bg-lite.jpg
- plan-bg-lite.jpg
- meet-bg-lite.jpg
- log-bg-lite.jpg
- data-bg-lite.jpg
- goal-bg-lite.jpg
- meet-prep-bg-lite.jpg
- quiz-bg-lite.jpg
- wellness-bg-lite.jpg
- icon-sheet-lite.jpg
- buddy-character-lite.jpg
- buddy-team-normal-lite.jpg
- buddy-team-cheer-lite.jpg
- buddy-team-caution-lite.jpg
- buddy-team-pr-lite.jpg
- buddy-team-focus-lite.jpg
- buddy-team-meet-lite.jpg

## 古いPNG画像について

v97では、アプリ本体は `*-lite.jpg` の軽量画像を読み込みます。

以前アップロードした大きなPNG画像がGitHub上に残っていても動作には影響しませんが、容量を減らしたい場合は、上記の軽量JPEGが正しくアップロードされていることを確認してから古いPNGを削除して構いません。

## キャッシュが残る場合

アップロード後に古い画面や大きなロゴだけが表示される場合は、以下を開いてキャッシュを削除してください。

```text
https://imamuufit.github.io/total-academy/reset.html
```

その後、最新版を開いてください。
