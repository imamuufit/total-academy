(() => {
  "use strict";

  const DB_NAME = "platform-buddy-video-db";
  const DB_VERSION = 1;
  const STORE_NAME = "videos";
  const MAX_FILE_BYTES = 350 * 1024 * 1024;
  const VISION_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.js";
  const VISION_MODULE_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm";
  const VISION_WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
  const POSE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
  const poseConnections = [
    [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [11, 23], [12, 24], [23, 24],
    [23, 25], [25, 27], [24, 26], [26, 28]
  ];
  let poseLandmarkerPromise = null;

  const checkItems = {
    SQ: ["深さ", "膝の軌道", "上体角度", "ボトムの安定", "切り返し", "バー軌道"],
    BP: ["降ろし位置", "胸での静止", "前腕角度", "肘の開き", "ブリッジ・肩甲骨", "押し出し", "バー軌道"],
    DL: ["初速", "背中の固定", "膝通過", "ロックアウト", "バーの近さ", "重心"],
    OTHER: ["動作の安定", "左右差", "テンポ", "再現性"]
  };
  const checkOptions = ["未確認", "良い", "普通", "課題あり"];
  const selectedForCompare = new Set();
  const activeObjectUrls = new Set();

  const els = {
    panel: document.querySelector("#videoNotePanel"),
    toggle: document.querySelector("#videoNoteToggleBtn"),
    body: document.querySelector("#videoNoteBody"),
    addMode: document.querySelector("#videoAddModeBtn"),
    libraryMode: document.querySelector("#videoLibraryModeBtn"),
    form: document.querySelector("#videoNoteForm"),
    file: document.querySelector("#videoFileInput"),
    preview: document.querySelector("#videoNotePreview"),
    lift: document.querySelector("#videoLiftInput"),
    date: document.querySelector("#videoDateInput"),
    weight: document.querySelector("#videoWeightInput"),
    reps: document.querySelector("#videoRepsInput"),
    rpe: document.querySelector("#videoRpeInput"),
    setType: document.querySelector("#videoSetTypeInput"),
    angle: document.querySelector("#videoAngleInput"),
    memo: document.querySelector("#videoMemoInput"),
    buddyMemo: document.querySelector("#videoBuddyMemoInput"),
    checkGrid: document.querySelector("#videoCheckGrid"),
    storageStatus: document.querySelector("#videoStorageStatus"),
    library: document.querySelector("#videoLibrary"),
    libraryGrid: document.querySelector("#videoLibraryGrid"),
    filterLift: document.querySelector("#videoFilterLift"),
    sortOrder: document.querySelector("#videoSortOrder"),
    compareBtn: document.querySelector("#videoCompareBtn"),
    compareView: document.querySelector("#videoCompareView")
  };

  if (!els.panel || !("indexedDB" in window)) {
    if (els.panel) {
      els.panel.querySelector(".screen-note").textContent = "このブラウザでは動画保存を利用できません。";
      els.toggle.disabled = true;
    }
    return;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function today() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  function formatDate(value) {
    return value ? String(value).replaceAll("-", "/") : "-";
  }

  function formatNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "-";
    return Number.isInteger(number) ? String(number) : String(number.toFixed(1)).replace(/\.0$/, "");
  }

  function liftLabel(lift) {
    return { SQ: "SQ", BP: "BP", DL: "DL", OTHER: "その他" }[lift] || "その他";
  }

  function createId() {
    return globalThis.crypto?.randomUUID?.() || `video_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function createObjectUrl(blob) {
    const url = URL.createObjectURL(blob);
    activeObjectUrls.add(url);
    return url;
  }

  function revokeObjectUrl(url) {
    if (!url) return;
    URL.revokeObjectURL(url);
    activeObjectUrls.delete(url);
  }

  function clearObjectUrls() {
    activeObjectUrls.forEach((url) => URL.revokeObjectURL(url));
    activeObjectUrls.clear();
  }

  function cleanupContainerVideos(container) {
    if (!container) return;
    container.querySelectorAll("video").forEach((video) => {
      if (video.src) revokeObjectUrl(video.src);
      video.removeAttribute("src");
    });
  }

  function loadScriptOnce(src) {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      return existing.dataset.loaded === "true"
        ? Promise.resolve()
        : new Promise((resolve, reject) => {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        script.dataset.loaded = "true";
        resolve();
      };
      script.onerror = () => reject(new Error("MediaPipeの読み込みに失敗しました。"));
      document.head.append(script);
    });
  }

  function visionExport(name) {
    return window[name] || window.vision?.[name] || window.tasksVision?.[name];
  }

  async function getPoseLandmarker() {
    if (!poseLandmarkerPromise) {
      poseLandmarkerPromise = (async () => {
        await loadScriptOnce(VISION_SCRIPT_URL);
        let FilesetResolver = visionExport("FilesetResolver");
        let PoseLandmarker = visionExport("PoseLandmarker");
        if (!FilesetResolver || !PoseLandmarker) {
          const module = await import(VISION_MODULE_URL);
          FilesetResolver = module.FilesetResolver;
          PoseLandmarker = module.PoseLandmarker;
        }
        if (!FilesetResolver || !PoseLandmarker) {
          throw new Error("MediaPipe Pose Landmarkerを初期化できませんでした。");
        }
        const resolver = await FilesetResolver.forVisionTasks(VISION_WASM_ROOT);
        return PoseLandmarker.createFromOptions(resolver, {
          baseOptions: {
            modelAssetPath: POSE_MODEL_URL,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
      })();
    }
    return poseLandmarkerPromise;
  }

  function point(landmarks, index) {
    const value = landmarks?.[index];
    return value && Number.isFinite(value.x) && Number.isFinite(value.y) ? value : null;
  }

  function angleBetween(a, b, c) {
    if (!a || !b || !c) return null;
    const ab = { x: a.x - b.x, y: a.y - b.y };
    const cb = { x: c.x - b.x, y: c.y - b.y };
    const dot = ab.x * cb.x + ab.y * cb.y;
    const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
    if (!mag) return null;
    return Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180 / Math.PI);
  }

  function averageNumber(values) {
    const numbers = values.filter((value) => Number.isFinite(value));
    return numbers.length ? Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length) : null;
  }

  function torsoLeanDeg(landmarks) {
    const leftShoulder = point(landmarks, 11);
    const rightShoulder = point(landmarks, 12);
    const leftHip = point(landmarks, 23);
    const rightHip = point(landmarks, 24);
    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;
    const shoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const hip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const dx = shoulder.x - hip.x;
    const dy = shoulder.y - hip.y;
    return Math.round(Math.atan2(Math.abs(dx), Math.abs(dy || 0.0001)) * 180 / Math.PI);
  }

  function asymmetryScore(landmarks) {
    const pairs = [[11, 12], [23, 24], [25, 26], [27, 28]];
    const diffs = pairs.map(([left, right]) => {
      const a = point(landmarks, left);
      const b = point(landmarks, right);
      return a && b ? Math.abs(a.y - b.y) * 100 : null;
    }).filter((value) => Number.isFinite(value));
    return diffs.length ? Math.round(diffs.reduce((sum, value) => sum + value, 0) / diffs.length) : null;
  }

  function compactLandmarks(landmarks) {
    return landmarks.map((item) => ({
      x: Number(item.x.toFixed(4)),
      y: Number(item.y.toFixed(4)),
      z: Number((item.z || 0).toFixed(4)),
      visibility: Number((item.visibility || 0).toFixed(3))
    }));
  }

  function metricsFromLandmarks(landmarks) {
    const leftHip = angleBetween(point(landmarks, 11), point(landmarks, 23), point(landmarks, 25));
    const rightHip = angleBetween(point(landmarks, 12), point(landmarks, 24), point(landmarks, 26));
    const leftKnee = angleBetween(point(landmarks, 23), point(landmarks, 25), point(landmarks, 27));
    const rightKnee = angleBetween(point(landmarks, 24), point(landmarks, 26), point(landmarks, 28));
    const leftElbow = angleBetween(point(landmarks, 11), point(landmarks, 13), point(landmarks, 15));
    const rightElbow = angleBetween(point(landmarks, 12), point(landmarks, 14), point(landmarks, 16));
    return {
      hipAngle: averageNumber([leftHip, rightHip]),
      kneeAngle: averageNumber([leftKnee, rightKnee]),
      elbowAngle: averageNumber([leftElbow, rightElbow]),
      torsoLean: torsoLeanDeg(landmarks),
      asymmetryScore: asymmetryScore(landmarks)
    };
  }

  function flag(label, condition, flags) {
    if (condition) flags.push(label);
  }

  function buildMotionSummary(lift, metrics) {
    const flags = [];
    if (lift === "SQ") {
      flag("torso_forward", metrics.torsoLean !== null && metrics.torsoLean >= 32, flags);
      flag("depth_candidate", metrics.hipAngle !== null && metrics.kneeAngle !== null && metrics.hipAngle <= 75 && metrics.kneeAngle <= 90, flags);
      flag("minor_asymmetry", metrics.asymmetryScore !== null && metrics.asymmetryScore >= 8, flags);
      return {
        flags,
        title: "スクワット傾向",
        lines: [
          metrics.hipAngle !== null ? `股関節角度の目安: ${metrics.hipAngle}°` : "股関節角度: 確認不足",
          metrics.kneeAngle !== null ? `膝角度の目安: ${metrics.kneeAngle}°` : "膝角度: 確認不足",
          metrics.torsoLean !== null ? `体幹前傾: ${metrics.torsoLean}°` : "体幹前傾: 確認不足"
        ],
        buddyComment: flags.includes("torso_forward")
          ? "ボトム周辺で体幹前傾が強めに見える可能性があります。次回は足裏全体に圧を残す意識で確認しましょう。"
          : "大きな崩れは少なめに見えます。次回も同じ角度から撮ると比較しやすくなります。"
      };
    }
    if (lift === "BP") {
      flag("elbow_asymmetry", metrics.asymmetryScore !== null && metrics.asymmetryScore >= 7, flags);
      flag("elbow_lockout_check", metrics.elbowAngle !== null && metrics.elbowAngle < 145, flags);
      return {
        flags,
        title: "ベンチプレス傾向",
        lines: [
          metrics.elbowAngle !== null ? `肘角度の目安: ${metrics.elbowAngle}°` : "肘角度: 確認不足",
          metrics.asymmetryScore !== null ? `左右差の目安: ${metrics.asymmetryScore}` : "左右差: 確認不足",
          "胸での静止やバー軌道は動画本体で確認してください。"
        ],
        buddyComment: flags.includes("elbow_asymmetry")
          ? "押し出しで左右差が出ている可能性があります。胸で止めた後、両手で同時に押す意識を確認しましょう。"
          : "左右差は大きくなさそうです。次回は真横か斜め前から撮ると前腕角度を見やすくなります。"
      };
    }
    if (lift === "DL") {
      flag("torso_forward", metrics.torsoLean !== null && metrics.torsoLean >= 38, flags);
      flag("minor_asymmetry", metrics.asymmetryScore !== null && metrics.asymmetryScore >= 8, flags);
      return {
        flags,
        title: "デッドリフト傾向",
        lines: [
          metrics.hipAngle !== null ? `股関節角度の目安: ${metrics.hipAngle}°` : "股関節角度: 確認不足",
          metrics.torsoLean !== null ? `背中の傾き目安: ${metrics.torsoLean}°` : "背中の傾き: 確認不足",
          metrics.asymmetryScore !== null ? `左右差の目安: ${metrics.asymmetryScore}` : "左右差: 確認不足"
        ],
        buddyComment: flags.includes("torso_forward")
          ? "引き始めで上体が強く倒れている可能性があります。広背筋でバーを近く保つ意識を確認しましょう。"
          : "スタート姿勢は大きく崩れていないように見えます。膝通過付近も次回比較していきましょう。"
      };
    }
    return {
      flags,
      title: "フォーム傾向",
      lines: [
        metrics.torsoLean !== null ? `体幹角度の目安: ${metrics.torsoLean}°` : "体幹角度: 確認不足",
        metrics.asymmetryScore !== null ? `左右差の目安: ${metrics.asymmetryScore}` : "左右差: 確認不足"
      ],
      buddyComment: "全体の傾向を保存しました。次回も同じ角度で撮ると変化を見やすくなります。"
    };
  }

  function drawPose(canvas, video, landmarks) {
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 360;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = Math.max(3, width * 0.004);
    ctx.strokeStyle = "rgba(180, 35, 24, 0.92)";
    ctx.fillStyle = "rgba(47, 111, 115, 0.95)";
    poseConnections.forEach(([start, end]) => {
      const a = point(landmarks, start);
      const b = point(landmarks, end);
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x * width, a.y * height);
      ctx.lineTo(b.x * width, b.y * height);
      ctx.stroke();
    });
    landmarks.forEach((landmark) => {
      if ((landmark.visibility || 0) < 0.25) return;
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, Math.max(4, width * 0.006), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function motionResultMarkup(analysis) {
    if (!analysis || analysis.status !== "completed") {
      return `<p>解析結果はまだありません。動画を止めて「現在フレームを解析」を押してください。</p>`;
    }
    const lines = Array.isArray(analysis.lines) ? analysis.lines : [];
    return `
      <div class="motion-result-chips">
        <span>信頼度: ${escapeHtml(analysis.confidence || "medium")}</span>
        <span>${escapeHtml(analysis.keyFrames?.currentTime || "0.0")}秒付近</span>
      </div>
      <strong>${escapeHtml(analysis.title || "フォーム傾向")}</strong>
      <ul>${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      <p>${escapeHtml(analysis.buddyComment || "")}</p>
      <details class="compact-guide">
        <summary>解析値を見る</summary>
        <pre>${escapeHtml(JSON.stringify(analysis.metrics || {}, null, 2))}</pre>
      </details>
    `;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("IndexedDB transaction aborted"));
    });
  }

  function openVideoDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("date", "date");
          store.createIndex("lift", "lift");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveVideoRecord(record) {
    const db = await openVideoDb();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    await transactionDone(transaction);
    db.close();
  }

  async function loadVideoRecords() {
    const db = await openVideoDb();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const done = transactionDone(transaction);
    const records = await requestToPromise(transaction.objectStore(STORE_NAME).getAll());
    await done;
    db.close();
    return records;
  }

  async function getVideoRecord(id) {
    const db = await openVideoDb();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const done = transactionDone(transaction);
    const record = await requestToPromise(transaction.objectStore(STORE_NAME).get(id));
    await done;
    db.close();
    return record;
  }

  async function deleteVideoRecord(id) {
    const db = await openVideoDb();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    await transactionDone(transaction);
    db.close();
  }

  function checkGridMarkup(lift, values = {}) {
    return (checkItems[lift] || checkItems.OTHER).map((item) => `
      <label>
        ${escapeHtml(item)}
        <select data-video-check="${escapeHtml(item)}">
          ${checkOptions.map((option) => `<option value="${escapeHtml(option)}" ${values[item] === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
      </label>
    `).join("");
  }

  function renderCheckGrid(values = {}) {
    els.checkGrid.innerHTML = checkGridMarkup(els.lift.value, values);
  }

  function readCheckValues(container) {
    return Object.fromEntries([...container.querySelectorAll("[data-video-check]")].map((select) => [select.dataset.videoCheck, select.value]));
  }

  async function updateStorageStatus(message = "") {
    if (message) {
      els.storageStatus.textContent = message;
      return;
    }
    if (!navigator.storage?.estimate) {
      els.storageStatus.textContent = "端末内保存";
      return;
    }
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage ? Math.round(estimate.usage / 1024 / 1024) : 0;
    const quota = estimate.quota ? Math.round(estimate.quota / 1024 / 1024) : 0;
    els.storageStatus.textContent = quota ? `使用量 約${used}MB / 上限目安 ${quota}MB` : `使用量 約${used}MB`;
  }

  function showMode(mode) {
    const adding = mode === "add";
    els.form.classList.toggle("hidden", !adding);
    els.library.classList.toggle("hidden", adding);
    els.addMode.classList.toggle("primary-button", adding);
    els.addMode.classList.toggle("text-button", !adding);
    els.libraryMode.classList.toggle("primary-button", !adding);
    els.libraryMode.classList.toggle("text-button", adding);
    if (!adding) renderLibrary();
  }

  function videoTitle(record) {
    const weight = record.weight ? `${formatNumber(record.weight)}kg` : "重量未入力";
    const reps = record.reps ? ` ×${formatNumber(record.reps)}` : "";
    const rpe = record.rpe ? ` @${formatNumber(record.rpe)}` : "";
    return `${liftLabel(record.lift)} ${weight}${reps}${rpe}`;
  }

  function libraryCardMarkup(record) {
    const checked = selectedForCompare.has(record.id);
    const memo = record.buddyMemo || record.memo || "メモなし";
    return `
      <article class="video-library-card">
        <div class="video-card-head">
          <span>${escapeHtml(record.setType || "自由")}</span>
          <small>${escapeHtml(formatDate(record.date))}</small>
        </div>
        <strong>${escapeHtml(videoTitle(record))}</strong>
        <p class="motion-status ${record.analysis?.status === "completed" ? "done" : ""}">解析：${record.analysis?.status === "completed" ? "完了" : "未解析"}</p>
        <p>撮影：${escapeHtml(record.angle || "-")}</p>
        <p>${escapeHtml(memo)}</p>
        <div class="video-card-actions">
          <button class="primary-button inline" type="button" data-video-view="${escapeHtml(record.id)}">見る</button>
          <button class="text-button ${checked ? "selected" : ""}" type="button" data-video-compare="${escapeHtml(record.id)}">${checked ? "比較から外す" : "比較に追加"}</button>
          <button class="text-button danger" type="button" data-video-delete="${escapeHtml(record.id)}">削除</button>
        </div>
      </article>
    `;
  }

  async function renderLibrary() {
    let records = await loadVideoRecords();
    if (els.filterLift.value !== "ALL") records = records.filter((record) => record.lift === els.filterLift.value);
    records.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) * (els.sortOrder.value === "old" ? 1 : -1));
    els.libraryGrid.innerHTML = records.length
      ? records.map(libraryCardMarkup).join("")
      : `<p class="video-empty">まだ動画はありません。今日のセットを1本残してみよう。</p>`;
    els.compareBtn.disabled = selectedForCompare.size !== 2;
    await updateStorageStatus();
  }

  function ensureViewerDialog() {
    let dialog = document.querySelector("#videoViewerDialog");
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.id = "videoViewerDialog";
    dialog.className = "video-viewer-dialog";
    document.body.append(dialog);
    dialog.addEventListener("close", () => {
      const video = dialog.querySelector("video");
      if (video?.src) revokeObjectUrl(video.src);
      dialog.innerHTML = "";
    });
    return dialog;
  }

  async function openViewer(id) {
    const record = await getVideoRecord(id);
    if (!record) return;
    const dialog = ensureViewerDialog();
    const url = createObjectUrl(record.videoBlob);
    dialog.innerHTML = `
      <form method="dialog" class="video-viewer-card">
        <div class="section-title">
          <div><p class="eyebrow">Video Form Note</p><h2>${escapeHtml(videoTitle(record))}</h2></div>
          <button class="text-button" value="close" type="submit">閉じる</button>
        </div>
        <div class="motion-video-frame">
          <video controls playsinline preload="metadata" src="${escapeHtml(url)}"></video>
          <canvas class="motion-overlay" data-motion-canvas></canvas>
        </div>
        <div class="video-viewer-meta">
          <span>${escapeHtml(formatDate(record.date))}</span>
          <span>${escapeHtml(record.setType || "自由")}</span>
          <span>撮影：${escapeHtml(record.angle || "-")}</span>
        </div>
        <section class="video-check-editor">
          <div class="video-check-head"><strong>フォームチェック</strong><small>見返して更新できます</small></div>
          <div class="video-check-grid">${checkGridMarkup(record.lift, record.check || {})}</div>
        </section>
        <label>メモ<textarea data-video-view-memo rows="3">${escapeHtml(record.memo || "")}</textarea></label>
        <label>Buddyメモ<textarea data-video-view-buddy rows="3">${escapeHtml(record.buddyMemo || "")}</textarea></label>
        <section class="motion-analyzer-card" data-motion-card>
          <div class="video-check-head">
            <strong>Buddy Motion Analyzer β</strong>
            <small>動画は外部送信せず、現在フレームだけを端末内で解析します。</small>
          </div>
          <p class="video-storage-note">AIフォーム解析は補助機能です。撮影角度、照明、服装、動画品質によって結果が変わります。最終判断は動画本体とコーチの確認を優先してください。</p>
          <div class="motion-actions">
            <button class="primary-button inline" type="button" data-motion-analyze="${escapeHtml(record.id)}">現在フレームを解析</button>
            <label class="motion-toggle"><input type="checkbox" data-motion-overlay-toggle checked>骨格表示</label>
          </div>
          <div class="motion-result" data-motion-result>${motionResultMarkup(record.analysis)}</div>
          <details class="compact-guide">
            <summary>撮影ガイド</summary>
            <p>SQは真横または斜め後ろ、BPは真横または斜め前、DLは真横または斜め前がおすすめです。全身とバーベルを画面に入れてください。</p>
          </details>
        </section>
        <button class="primary-button" type="button" data-video-review-save="${escapeHtml(record.id)}">フォーム確認を保存</button>
      </form>
    `;
    dialog.showModal();
  }

  async function analyzeMotion(button) {
    const dialog = button.closest("dialog");
    const record = await getVideoRecord(button.dataset.motionAnalyze);
    const video = dialog?.querySelector("video");
    const canvas = dialog?.querySelector("[data-motion-canvas]");
    const resultBox = dialog?.querySelector("[data-motion-result]");
    if (!record || !video || !canvas || !resultBox) return;
    if (!video.videoWidth || !video.videoHeight) {
      resultBox.innerHTML = `<p>動画の読み込み後に解析してください。</p>`;
      return;
    }
    button.disabled = true;
    button.textContent = "解析中...";
    resultBox.innerHTML = `<p>MediaPipeを読み込んでいます。初回は少し時間がかかります。</p>`;
    try {
      const pose = await getPoseLandmarker();
      const result = pose.detectForVideo(video, performance.now());
      const landmarks = result.landmarks?.[0];
      if (!landmarks?.length) {
        resultBox.innerHTML = `<p>関節点を確認できませんでした。全身が映るフレームで再解析してください。</p>`;
        return;
      }
      drawPose(canvas, video, landmarks);
      const metrics = metricsFromLandmarks(landmarks);
      const summary = buildMotionSummary(record.lift, metrics);
      const analysis = {
        status: "completed",
        confidence: landmarks.filter((item) => (item.visibility || 0) >= 0.5).length >= 18 ? "high" : "medium",
        keyFrames: {
          currentTime: video.currentTime.toFixed(1),
          start: null,
          bottom: null,
          finish: null
        },
        metrics,
        flags: summary.flags,
        title: summary.title,
        lines: summary.lines,
        buddyComment: summary.buddyComment,
        poseKeypoints: compactLandmarks(landmarks),
        barPathPoints: null,
        velocityData: null,
        updatedAt: new Date().toISOString()
      };
      record.analysis = analysis;
      record.updatedAt = new Date().toISOString();
      if (!record.buddyMemo) record.buddyMemo = summary.buddyComment;
      await saveVideoRecord(record);
      resultBox.innerHTML = motionResultMarkup(analysis);
      renderLibrary();
    } catch (error) {
      console.error("Motion analysis failed", error);
      resultBox.innerHTML = `<p>解析に失敗しました。オンライン接続、動画の明るさ、全身が映っているかを確認してください。</p>`;
    } finally {
      button.disabled = false;
      button.textContent = "現在フレームを解析";
    }
  }

  async function saveViewerReview(button) {
    const dialog = button.closest("dialog");
    const record = await getVideoRecord(button.dataset.videoReviewSave);
    if (!record) return;
    record.check = readCheckValues(dialog);
    record.memo = dialog.querySelector("[data-video-view-memo]").value.trim();
    record.buddyMemo = dialog.querySelector("[data-video-view-buddy]").value.trim();
    record.updatedAt = new Date().toISOString();
    await saveVideoRecord(record);
    button.textContent = "保存しました";
    setTimeout(() => { button.textContent = "フォーム確認を保存"; }, 1200);
    renderLibrary();
  }

  function compareColumnMarkup(record, url) {
    return `
      <article class="video-compare-column">
        <strong>${escapeHtml(videoTitle(record))}</strong>
        <small>${escapeHtml(formatDate(record.date))} / 撮影：${escapeHtml(record.angle || "-")}</small>
        <video controls playsinline preload="metadata" src="${escapeHtml(url)}"></video>
        <p>${escapeHtml(record.buddyMemo || record.memo || "メモなし")}</p>
      </article>
    `;
  }

  async function renderComparison() {
    cleanupContainerVideos(els.compareView);
    const ids = [...selectedForCompare];
    if (ids.length !== 2) return;
    const records = await Promise.all(ids.map(getVideoRecord));
    if (records.some((record) => !record)) return;
    const urls = records.map((record) => createObjectUrl(record.videoBlob));
    els.compareView.innerHTML = `
      <div class="video-compare-head">
        <strong>動画比較</strong>
        <button class="text-button compact" type="button" data-video-compare-close>比較を閉じる</button>
      </div>
      <div class="video-compare-grid">
        ${compareColumnMarkup(records[0], urls[0])}
        ${compareColumnMarkup(records[1], urls[1])}
      </div>
    `;
    els.compareView.classList.remove("hidden");
    els.compareView.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSave(event) {
    event.preventDefault();
    const file = els.file.files?.[0];
    if (!file) return updateStorageStatus("動画ファイルを選んでください。");
    if (!file.type.startsWith("video/")) return updateStorageStatus("動画ファイルを選んでください。");
    if (file.size > MAX_FILE_BYTES) return updateStorageStatus("動画が大きすぎます。350MB以下を目安にしてください。");

    const record = {
      id: createId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: els.date.value || today(),
      lift: els.lift.value,
      weight: Number(els.weight.value || 0),
      reps: Number(els.reps.value || 0),
      rpe: Number(els.rpe.value || 0),
      setType: els.setType.value,
      angle: els.angle.value,
      memo: els.memo.value.trim(),
      buddyMemo: els.buddyMemo.value.trim(),
      videoName: file.name,
      videoType: file.type,
      videoSize: file.size,
      videoBlob: file,
      check: readCheckValues(els.checkGrid),
      analysis: {
        status: "not_analyzed",
        poseKeypoints: null,
        barPathPoints: null,
        velocityData: null
      }
    };

    try {
      await saveVideoRecord(record);
      resetForm();
      updateStorageStatus("保存しました。");
      showMode("library");
    } catch (error) {
      console.error("Video save failed", error);
      updateStorageStatus("保存できませんでした。端末容量を確認してください。");
    }
  }

  function resetForm() {
    if (els.preview.src) revokeObjectUrl(els.preview.src);
    els.form.reset();
    els.date.value = today();
    els.preview.removeAttribute("src");
    els.preview.classList.add("hidden");
    renderCheckGrid();
  }

  async function handleLibraryClick(event) {
    const view = event.target.closest("[data-video-view]");
    if (view) return openViewer(view.dataset.videoView);

    const compare = event.target.closest("[data-video-compare]");
    if (compare) {
      const id = compare.dataset.videoCompare;
      if (selectedForCompare.has(id)) selectedForCompare.delete(id);
      else if (selectedForCompare.size < 2) selectedForCompare.add(id);
      else return updateStorageStatus("比較できる動画は2本までです。");
      return renderLibrary();
    }

    const remove = event.target.closest("[data-video-delete]");
    if (remove) {
      if (!confirm("この動画記録を削除しますか？")) return;
      await deleteVideoRecord(remove.dataset.videoDelete);
      selectedForCompare.delete(remove.dataset.videoDelete);
      els.compareView.classList.add("hidden");
      return renderLibrary();
    }

    if (event.target.closest("[data-video-compare-close]")) {
      cleanupContainerVideos(els.compareView);
      els.compareView.innerHTML = "";
      els.compareView.classList.add("hidden");
    }
  }

  els.toggle.addEventListener("click", () => {
    const open = els.body.classList.toggle("hidden") === false;
    els.toggle.textContent = open ? "閉じる" : "開く";
    els.toggle.setAttribute("aria-expanded", String(open));
    if (open) updateStorageStatus();
  });
  els.addMode.addEventListener("click", () => showMode("add"));
  els.libraryMode.addEventListener("click", () => showMode("library"));
  els.lift.addEventListener("change", () => renderCheckGrid());
  els.file.addEventListener("change", () => {
    if (els.preview.src) revokeObjectUrl(els.preview.src);
    const file = els.file.files?.[0];
    if (!file) {
      els.preview.classList.add("hidden");
      return;
    }
    els.preview.src = createObjectUrl(file);
    els.preview.classList.remove("hidden");
  });
  els.form.addEventListener("submit", handleSave);
  els.filterLift.addEventListener("change", renderLibrary);
  els.sortOrder.addEventListener("change", renderLibrary);
  els.compareBtn.addEventListener("click", renderComparison);
  els.library.addEventListener("click", handleLibraryClick);
  document.addEventListener("click", (event) => {
    const saveReview = event.target.closest("[data-video-review-save]");
    if (saveReview) saveViewerReview(saveReview);
    const analyze = event.target.closest("[data-motion-analyze]");
    if (analyze) analyzeMotion(analyze);
  });
  document.addEventListener("change", (event) => {
    if (!event.target.matches("[data-motion-overlay-toggle]")) return;
    const canvas = event.target.closest("dialog")?.querySelector("[data-motion-canvas]");
    if (canvas) canvas.classList.toggle("hidden", !event.target.checked);
  });
  window.addEventListener("beforeunload", clearObjectUrls);

  els.date.value = today();
  renderCheckGrid();
  updateStorageStatus();
})();
