# Platform Buddy

Platform Buddyは、BIG3の現在地と目標を見える化し、PRサイクル、記録、分析、大会準備までつなげて管理できるパワーリフティング向けPWAです。

## この更新について

このv96は、GitHub Pagesでのアップロードを簡単にするため、`assets`フォルダを使わない構成に変更しています。

画像ファイルはすべて、`index.html`や`styles.css`と同じ一番上の階層に置いてください。

## アップロードするファイル

GitHub Pagesへ更新するときは、このZIPの中身をすべてリポジトリのトップ階層へ上書きアップロードしてください。

必要なファイル:

- index.html
- styles.css
- app.js
- sw.js
- manifest.webmanifest
- README.md
- reset.html
- icon.svg
- apple-touch-icon.png
- home-bg.png
- plan-bg.png
- meet-bg.png
- log-bg.png
- data-bg.png
- goal-bg.png
- meet-prep-bg.png
- quiz-bg.png
- wellness-bg.png
- icon-sheet.png
- buddy-character.png
- buddy-team-normal.png
- buddy-team-cheer.png
- buddy-team-caution.png
- buddy-team-pr.png
- buddy-team-focus.png
- buddy-team-meet.png

## assetsフォルダについて

このv96では、`assets`フォルダは不要です。

GitHub上に`assets`という名前のファイルやフォルダが残っていても、アプリの動作には使いません。

画像は以下のようにトップ階層に並んでいればOKです。

```text
total-academy
├─ index.html
├─ styles.css
├─ app.js
├─ sw.js
├─ manifest.webmanifest
├─ README.md
├─ reset.html
├─ home-bg.png
├─ plan-bg.png
├─ meet-bg.png
├─ icon-sheet.png
├─ buddy-team-normal.png
└─ ...
```

## 表示が古い、または大きなロゴだけで止まる場合

PWAは、サービスワーカーという仕組みで古いファイルを端末内に保持することがあります。

最新版をアップロードしても大きなロゴ表示で止まる場合は、次のURLを一度開いてキャッシュを解除してください。

```text
https://imamuufit.github.io/total-academy/reset.html
```

その後、表示された「最新版を開く」ボタンからアプリを開いてください。

## 主な機能

- HOME: 今日のプラン、現在地、目標、体調、Buddyコメントをカードで表示
- PLAN: Buddyメソッド Lv1 / Lv2 / Rebuild 16、5/3/1、HPS、Smolov Jr.風テンプレート
- LOG: 自由トレーニング記録、複数セット入力、メモ、履歴管理
- DATA: e1RM、ボリューム、RPE、ウェルネス、週ごとの進捗確認
- MEET: 大会準備チェックリスト、大会ノート、白判定クイズ、ルール確認導線
- RPE自信度、RPEものさしセット、Buddy Alert、デロード候補表示
- Excel出力、JSONバックアップ、PWAインストール対応

## 注意

本アプリはJPA/IPF公式アプリではありません。
ルール確認や大会当日の判断は、必ず最新の公式ルールブック、大会要項、当日の審判・大会運営の指示を優先してください。
