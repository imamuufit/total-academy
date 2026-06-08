(() => {
  "use strict";

  const DB_NAME = "platform-buddy-video-db";
  const DB_VERSION = 2;
  const STORE_NAME = "videos";
  const VBT_STORE_NAME = "vbtRecords";
  const MAX_FILE_BYTES = 350 * 1024 * 1024;
  const DEFAULT_PLATE_DIAMETER_CM = 45;

  const checkItems = {
    SQ: ["深さ", "膝の軌道", "上体角度", "ボトムの安定", "切り返し", "バー軌道"],
    BP: ["降ろし位置", "胸での静止", "前腕角度", "肘の開き", "ブリッジ/肩甲骨", "押し出し", "バー軌道"],
    DL: ["初動", "背中の固定", "膝通過", "ロックアウト", "バーの近さ", "重心"],
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
      const note = els.panel.querySelector(".screen-note");
      if (note) note.textContent = "このブラウザでは動画保存を利用できません。";
      if (els.toggle) els.toggle.disabled = true;
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

  function createId(prefix = "video") {
    return globalThis.crypto?.randomUUID?.() || `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
        if (!db.objectStoreNames.contains(VBT_STORE_NAME)) {
          const vbtStore = db.createObjectStore(VBT_STORE_NAME, { keyPath: "id" });
          vbtStore.createIndex("date", "date");
          vbtStore.createIndex("lift", "lift");
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveRecord(storeName, record) {
    const db = await openVideoDb();
    const transaction = db.transaction(storeName, "readwrite");
    transaction.objectStore(storeName).put(record);
    await transactionDone(transaction);
    db.close();
  }

  async function loadRecords(storeName) {
    const db = await openVideoDb();
    const transaction = db.transaction(storeName, "readonly");
    const done = transactionDone(transaction);
    const records = await requestToPromise(transaction.objectStore(storeName).getAll());
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

  const saveVideoRecord = (record) => saveRecord(STORE_NAME, record);
  const saveVbtRecord = (record) => saveRecord(VBT_STORE_NAME, record);
  const loadVideoRecords = () => loadRecords(STORE_NAME);
  const loadVbtRecords = () => loadRecords(VBT_STORE_NAME);

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
    const reps = record.reps ? ` x ${formatNumber(record.reps)}` : "";
    const rpe = record.rpe ? ` @${formatNumber(record.rpe)}` : "";
    return `${liftLabel(record.lift)} ${weight}${reps}${rpe}`;
  }

  function formatSeconds(value) {
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toFixed(2)}s` : "-";
  }

  function pixelDistance(a, b) {
    if (!a || !b) return null;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function vbtVelocityComment(lift, velocity) {
    if (!Number.isFinite(velocity)) return "速度を計算するとBuddyコメントが出ます。";
    const code = lift || "SQ";
    if (code === "BP") {
      if (velocity >= 0.35) return "かなり速めです。予定より余力がある可能性があります。";
      if (velocity >= 0.20) return "良好です。実用ゾーンで動いています。";
      if (velocity >= 0.15) return "重めです。RPE8.5〜9.5寄りの可能性があります。";
      return "かなり限界寄りです。次セットは無理せず確認しましょう。";
    }
    if (code === "DL") {
      if (velocity >= 0.45) return "速めです。床離れに余裕がありそうです。";
      if (velocity >= 0.30) return "良好です。高重量の実用ゾーンです。";
      if (velocity >= 0.20) return "重めです。RPE8.5〜9.5寄りの可能性があります。";
      return "かなり限界寄りです。次回重量は慎重に見ましょう。";
    }
    if (velocity >= 0.50) return "かなり速めです。予定RPEより軽い可能性があります。";
    if (velocity >= 0.35) return "良好です。RPE7〜8程度の実用ゾーンです。";
    if (velocity >= 0.25) return "重めです。RPE8〜9寄りの可能性があります。";
    return "かなり限界寄りです。次セットや次回重量は慎重に。";
  }

  function vbtRpeComment(lift, velocity, rpe) {
    const reported = Number(rpe);
    if (!Number.isFinite(reported) || !Number.isFinite(velocity)) return "RPEも入れると、主観とのズレを見やすくなります。";
    const fast = lift === "BP" ? 0.35 : lift === "DL" ? 0.45 : 0.50;
    const slow = lift === "BP" ? 0.15 : lift === "DL" ? 0.20 : 0.25;
    if (reported >= 8.5 && velocity >= fast) return "申告RPEより速めです。RPE感覚が厳しめに出ているかもしれません。";
    if (reported <= 7.5 && velocity < slow) return "申告RPEより遅めです。実際は重く出ている可能性があります。";
    return "申告RPEと速度のズレは大きくなさそうです。";
  }

  function vbtResultMarkup(data) {
    if (!data || !Number.isFinite(Number(data.meanVelocity))) {
      return `<p>プレート径を合わせ、開始点と終了点を指定すると平均挙上速度を計算できます。</p>`;
    }
    return `
      <div class="motion-result-chips">
        <span>速度 ${escapeHtml(Number(data.meanVelocity).toFixed(2))} m/s</span>
        <span>距離 ${escapeHtml(formatNumber(data.distanceMeters))}m</span>
        <span>時間 ${escapeHtml(formatSeconds(data.durationSeconds))}</span>
      </div>
      <strong>${escapeHtml(vbtVelocityComment(data.lift, Number(data.meanVelocity)))}</strong>
      <p>${escapeHtml(vbtRpeComment(data.lift, Number(data.meanVelocity), data.rpe))}</p>
    `;
  }

  function vbtCardMarkup(record) {
    const velocityData = record.analysis?.velocityData || {};
    const calibration = velocityData.calibration || {};
    const measurement = velocityData.measurement || velocityData;
    const plateDiameterCm = Number.isFinite(Number(calibration.plateDiameterCm)) ? Number(calibration.plateDiameterCm) : DEFAULT_PLATE_DIAMETER_CM;
    return `
      <section class="manual-vbt-card" data-vbt-card>
        <div class="video-check-head">
          <strong>BIG3 Velocity Check β</strong>
          <small>プレート径とバー移動から平均速度を出す</small>
        </div>
        <p class="video-storage-note">AI骨格解析ではありません。プレート径でキャリブレーションし、開始点と終了点から平均挙上速度を計算します。</p>
        <div class="vbt-controls">
          <label>プレート径 cm<input data-vbt-plate-cm type="number" inputmode="decimal" min="10" max="60" step="0.1" value="${escapeHtml(plateDiameterCm)}"></label>
          <button class="text-button" type="button" data-vbt-pick="plateA">プレート端 1</button>
          <button class="text-button" type="button" data-vbt-pick="plateB">プレート端 2</button>
          <button class="text-button" type="button" data-vbt-pick="start">開始点</button>
          <button class="text-button" type="button" data-vbt-pick="end">終了点</button>
          <button class="text-button" type="button" data-vbt-reset>リセット</button>
          <button class="primary-button inline" type="button" data-vbt-save="${escapeHtml(record.id)}">速度を計算</button>
          <button class="text-button" type="button" data-vbt-copy>結果をコピー</button>
        </div>
        <div class="vbt-markers">
          <span data-vbt-pick-status>動画上をタップして点を指定</span>
          <span data-vbt-start>開始 ${escapeHtml(formatSeconds(measurement.startTime))}</span>
          <span data-vbt-end>終了 ${escapeHtml(formatSeconds(measurement.endTime))}</span>
        </div>
        <div class="motion-result vbt-result" data-vbt-result>${vbtResultMarkup({ ...measurement, lift: record.lift, rpe: record.rpe })}</div>
      </section>
    `;
  }

  function initialVbtState(record) {
    const velocityData = record.analysis?.velocityData || {};
    const calibration = velocityData.calibration || {};
    const measurement = velocityData.measurement || velocityData;
    return {
      pickMode: null,
      plateA: calibration.plateA || null,
      plateB: calibration.plateB || null,
      startPoint: measurement.startPoint || null,
      endPoint: measurement.endPoint || null,
      startTime: Number.isFinite(Number(measurement.startTime)) ? Number(measurement.startTime) : null,
      endTime: Number.isFinite(Number(measurement.endTime)) ? Number(measurement.endTime) : null
    };
  }

  function vbtState(dialog) {
    return dialog?._vbtState || initialVbtState({});
  }

  function setVbtState(dialog, nextState) {
    dialog._vbtState = { ...vbtState(dialog), ...nextState };
  }

  function syncVbtCanvas(dialog) {
    const video = dialog?.querySelector("video");
    const canvas = dialog?.querySelector("[data-vbt-canvas]");
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return false;
    if (canvas.width !== video.videoWidth) canvas.width = video.videoWidth;
    if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
    return true;
  }

  function canvasPointFromEvent(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function drawPoint(ctx, point, label, color) {
    if (!point) return;
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255, 250, 242, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.font = "700 18px system-ui";
    ctx.fillText(label, point.x + 12, point.y - 12);
  }

  function drawVbtOverlay(dialog) {
    const canvas = dialog?.querySelector("[data-vbt-canvas]");
    if (!canvas || !syncVbtCanvas(dialog)) return;
    const ctx = canvas.getContext("2d");
    const state = vbtState(dialog);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    if (state.plateA && state.plateB) {
      ctx.strokeStyle = "rgba(37, 99, 235, 0.95)";
      ctx.beginPath();
      ctx.moveTo(state.plateA.x, state.plateA.y);
      ctx.lineTo(state.plateB.x, state.plateB.y);
      ctx.stroke();
    }
    if (state.startPoint && state.endPoint) {
      ctx.strokeStyle = "rgba(180, 35, 24, 0.95)";
      ctx.beginPath();
      ctx.moveTo(state.startPoint.x, state.startPoint.y);
      ctx.lineTo(state.endPoint.x, state.endPoint.y);
      ctx.stroke();
    }
    drawPoint(ctx, state.plateA, "P1", "#2563eb");
    drawPoint(ctx, state.plateB, "P2", "#2563eb");
    drawPoint(ctx, state.startPoint, "START", "#171717");
    drawPoint(ctx, state.endPoint, "END", "#b42318");
  }

  function setVbtPickMode(button) {
    const dialog = button.closest("dialog");
    const mode = button.dataset.vbtPick;
    setVbtState(dialog, { pickMode: mode });
    dialog.querySelector("[data-vbt-canvas]")?.classList.add("active");
    dialog.querySelectorAll("[data-vbt-pick]").forEach((item) => item.classList.toggle("selected", item === button));
    const status = dialog.querySelector("[data-vbt-pick-status]");
    const label = { plateA: "プレート端1", plateB: "プレート端2", start: "開始点", end: "終了点" }[mode] || "点";
    if (status) status.textContent = `${label}を動画上でタップ`;
  }

  function handleVbtCanvasPointer(event) {
    const dialog = event.target.closest("dialog");
    const canvas = event.target.closest("[data-vbt-canvas]");
    if (!dialog || !canvas || !syncVbtCanvas(dialog)) return;
    const state = vbtState(dialog);
    if (!state.pickMode) return;
    const point = canvasPointFromEvent(canvas, event);
    const video = dialog.querySelector("video");
    const time = Number(video?.currentTime);
    const key = state.pickMode === "plateA" ? "plateA" : state.pickMode === "plateB" ? "plateB" : state.pickMode === "start" ? "startPoint" : "endPoint";
    const update = { [key]: point };
    if (state.pickMode === "start" && Number.isFinite(time)) update.startTime = time;
    if (state.pickMode === "end" && Number.isFinite(time)) update.endTime = time;
    setVbtState(dialog, update);
    const marker = dialog.querySelector(state.pickMode === "start" ? "[data-vbt-start]" : state.pickMode === "end" ? "[data-vbt-end]" : "[data-vbt-pick-status]");
    if (marker) marker.textContent = state.pickMode === "start" ? `開始 ${formatSeconds(time)}` : state.pickMode === "end" ? `終了 ${formatSeconds(time)}` : "キャリブレーション点を保存";
    setVbtState(dialog, { pickMode: null });
    canvas.classList.remove("active");
    dialog.querySelectorAll("[data-vbt-pick]").forEach((item) => item.classList.remove("selected"));
    drawVbtOverlay(dialog);
  }

  function resetVbt(button) {
    const dialog = button.closest("dialog");
    setVbtState(dialog, { pickMode: null, plateA: null, plateB: null, startPoint: null, endPoint: null, startTime: null, endTime: null });
    const resultBox = dialog.querySelector("[data-vbt-result]");
    if (resultBox) resultBox.innerHTML = vbtResultMarkup(null);
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = "動画上をタップして点を指定";
    const start = dialog.querySelector("[data-vbt-start]");
    const end = dialog.querySelector("[data-vbt-end]");
    if (start) start.textContent = "開始 -";
    if (end) end.textContent = "終了 -";
    dialog.querySelectorAll("[data-vbt-pick]").forEach((item) => item.classList.remove("selected"));
    dialog.querySelector("[data-vbt-canvas]")?.classList.remove("active");
    drawVbtOverlay(dialog);
  }

  function calculateVbt(dialog, record) {
    const state = vbtState(dialog);
    const plateDiameterCm = Number(dialog.querySelector("[data-vbt-plate-cm]")?.value || DEFAULT_PLATE_DIAMETER_CM);
    const plateDiameterPixels = pixelDistance(state.plateA, state.plateB);
    const travelPixels = pixelDistance(state.startPoint, state.endPoint);
    const durationSeconds = Number(state.endTime) - Number(state.startTime);
    if (!Number.isFinite(plateDiameterCm) || plateDiameterCm <= 0) throw new Error("プレート径を入力してください。");
    if (!Number.isFinite(plateDiameterPixels) || plateDiameterPixels <= 0) throw new Error("プレート端を2点指定してください。");
    if (!Number.isFinite(travelPixels) || travelPixels <= 0) throw new Error("開始点と終了点を指定してください。");
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error("終了点は開始点より後のフレームで指定してください。");
    const metersPerPixel = (plateDiameterCm / 100) / plateDiameterPixels;
    const distanceMeters = travelPixels * metersPerPixel;
    const meanVelocity = distanceMeters / durationSeconds;
    return {
      mode: "plate-calibrated-manual",
      lift: record.lift,
      weight: Number(record.weight) || null,
      reps: Number(record.reps) || null,
      rpe: Number(record.rpe) || null,
      calibration: { plateDiameterCm, plateDiameterPixels, metersPerPixel, plateA: state.plateA, plateB: state.plateB },
      measurement: { startTime: Number(state.startTime), endTime: Number(state.endTime), durationSeconds, startPoint: state.startPoint, endPoint: state.endPoint, distanceMeters, meanVelocity },
      meanVelocity,
      buddyComment: vbtVelocityComment(record.lift, meanVelocity),
      rpeComment: vbtRpeComment(record.lift, meanVelocity, record.rpe),
      updatedAt: new Date().toISOString()
    };
  }

  async function saveVbtVelocity(button) {
    const dialog = button.closest("dialog");
    const record = await getVideoRecord(button.dataset.vbtSave);
    const resultBox = dialog?.querySelector("[data-vbt-result]");
    if (!record || !dialog || !resultBox) return;
    try {
      const velocityData = calculateVbt(dialog, record);
      record.analysis = { ...(record.analysis || {}), velocityData };
      record.updatedAt = new Date().toISOString();
      await saveVideoRecord(record);
      await saveVbtRecord({
        id: createId("vbt"),
        videoId: record.id,
        createdAt: new Date().toISOString(),
        date: record.date || today(),
        lift: record.lift,
        weight: Number(record.weight) || null,
        reps: Number(record.reps) || null,
        rpe: Number(record.rpe) || null,
        videoName: record.videoName || "",
        cameraAngle: record.angle || "",
        ...velocityData
      });
      resultBox.innerHTML = vbtResultMarkup({ ...velocityData.measurement, lift: record.lift, rpe: record.rpe });
      button.textContent = "保存しました";
      setTimeout(() => { button.textContent = "速度を計算"; }, 1200);
      renderLibrary();
      renderVbtHistory();
    } catch (error) {
      resultBox.innerHTML = `<p>${escapeHtml(error.message || "速度を計算できませんでした。")}</p>`;
    }
  }

  function vbtCopyText(record, velocityData) {
    const measurement = velocityData?.measurement || velocityData || {};
    const velocity = Number(measurement.meanVelocity);
    return `${liftLabel(record.lift)} ${record.weight ? `${formatNumber(record.weight)}kg` : ""}${record.reps ? ` x ${formatNumber(record.reps)}` : ""}${record.rpe ? ` @${formatNumber(record.rpe)}` : ""}\nMean Velocity ${Number.isFinite(velocity) ? velocity.toFixed(2) : "-"} m/s\nBuddy: ${vbtVelocityComment(record.lift, velocity)}`;
  }

  async function copyVbtResult(button) {
    const dialog = button.closest("dialog");
    const record = await getVideoRecord(dialog?.querySelector("[data-vbt-save]")?.dataset.vbtSave);
    if (!record?.analysis?.velocityData) return;
    const text = vbtCopyText(record, record.analysis.velocityData);
    await navigator.clipboard?.writeText(text);
    button.textContent = "コピーしました";
    setTimeout(() => { button.textContent = "結果をコピー"; }, 1200);
  }

  function ensureVbtHistorySection() {
    let section = document.querySelector("#vbtHistoryPanel");
    if (section || !els.body) return section;
    section = document.createElement("section");
    section.id = "vbtHistoryPanel";
    section.className = "vbt-history-panel";
    section.innerHTML = `
      <div class="video-check-head"><strong>VBT履歴</strong><small>BIG3の速度メモ</small></div>
      <div class="vbt-history-filter">
        <button class="text-button selected" type="button" data-vbt-filter="ALL">すべて</button>
        <button class="text-button" type="button" data-vbt-filter="SQ">SQ</button>
        <button class="text-button" type="button" data-vbt-filter="BP">BP</button>
        <button class="text-button" type="button" data-vbt-filter="DL">DL</button>
      </div>
      <div class="vbt-history-list" id="vbtHistoryList"></div>
    `;
    els.body.append(section);
    return section;
  }

  function vbtHistoryMarkup(record) {
    const measurement = record.measurement || {};
    const velocity = Number(measurement.meanVelocity);
    return `
      <article class="vbt-history-card">
        <strong>${escapeHtml(liftLabel(record.lift))} ${record.weight ? `${escapeHtml(formatNumber(record.weight))}kg` : ""}${record.reps ? ` x ${escapeHtml(formatNumber(record.reps))}` : ""}${record.rpe ? ` @${escapeHtml(formatNumber(record.rpe))}` : ""}</strong>
        <span>平均速度 ${Number.isFinite(velocity) ? escapeHtml(velocity.toFixed(2)) : "-"} m/s</span>
        <small>${escapeHtml(formatDate(record.date))}</small>
        <p>${escapeHtml(record.buddyComment || vbtVelocityComment(record.lift, velocity))}</p>
      </article>
    `;
  }

  async function renderVbtHistory(filter = "ALL") {
    const section = ensureVbtHistorySection();
    const list = section?.querySelector("#vbtHistoryList");
    if (!list) return;
    let records = await loadVbtRecords();
    if (filter !== "ALL") records = records.filter((record) => record.lift === filter);
    records.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    list.innerHTML = records.length ? records.slice(0, 20).map(vbtHistoryMarkup).join("") : `<p class="video-empty">まだVBT記録はありません。</p>`;
  }

  function libraryCardMarkup(record) {
    const checked = selectedForCompare.has(record.id);
    const memo = record.buddyMemo || record.memo || "メモなし";
    const velocity = Number(record.analysis?.velocityData?.measurement?.meanVelocity ?? record.analysis?.velocityData?.meanVelocity);
    return `
      <article class="video-library-card">
        <div class="video-card-head">
          <span>${escapeHtml(record.setType || "自由")}</span>
          <small>${escapeHtml(formatDate(record.date))}</small>
        </div>
        <strong>${escapeHtml(videoTitle(record))}</strong>
        <p class="motion-status ${Number.isFinite(velocity) ? "done" : ""}">VBT: ${Number.isFinite(velocity) ? `${escapeHtml(velocity.toFixed(2))} m/s` : "未計測"}</p>
        <p>撮影: ${escapeHtml(record.angle || "-")}</p>
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
    dialog._vbtState = initialVbtState(record);
    dialog.innerHTML = `
      <form method="dialog" class="video-viewer-card">
        <div class="section-title">
          <div><p class="eyebrow">Video Form Note</p><h2>${escapeHtml(videoTitle(record))}</h2></div>
          <button class="text-button" value="close" type="submit">閉じる</button>
        </div>
        <div class="vbt-video-frame">
          <video controls playsinline preload="metadata" src="${escapeHtml(url)}"></video>
          <canvas class="vbt-overlay" data-vbt-canvas></canvas>
        </div>
        <div class="video-viewer-meta">
          <span>${escapeHtml(formatDate(record.date))}</span>
          <span>${escapeHtml(record.setType || "自由")}</span>
          <span>撮影: ${escapeHtml(record.angle || "-")}</span>
        </div>
        <section class="video-check-editor">
          <div class="video-check-head"><strong>フォームチェック</strong><small>見返して更新できます</small></div>
          <div class="video-check-grid">${checkGridMarkup(record.lift, record.check || {})}</div>
        </section>
        <label>メモ<textarea data-video-view-memo rows="3">${escapeHtml(record.memo || "")}</textarea></label>
        <label>Buddyメモ<textarea data-video-view-buddy rows="3">${escapeHtml(record.buddyMemo || "")}</textarea></label>
        ${vbtCardMarkup(record)}
        <button class="primary-button" type="button" data-video-review-save="${escapeHtml(record.id)}">フォーム確認を保存</button>
      </form>
    `;
    dialog.showModal();
    const video = dialog.querySelector("video");
    video?.addEventListener("loadedmetadata", () => drawVbtOverlay(dialog), { once: true });
    if (video?.readyState >= 1) drawVbtOverlay(dialog);
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
        <small>${escapeHtml(formatDate(record.date))} / 撮影: ${escapeHtml(record.angle || "-")}</small>
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
      analysis: { velocityData: null }
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
    if (open) {
      updateStorageStatus();
      renderVbtHistory();
    }
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
    const vbtPick = event.target.closest("[data-vbt-pick]");
    if (vbtPick) return setVbtPickMode(vbtPick);
    const vbtReset = event.target.closest("[data-vbt-reset]");
    if (vbtReset) return resetVbt(vbtReset);
    const vbtSave = event.target.closest("[data-vbt-save]");
    if (vbtSave) return saveVbtVelocity(vbtSave);
    const vbtCopy = event.target.closest("[data-vbt-copy]");
    if (vbtCopy) return copyVbtResult(vbtCopy);
    const vbtFilter = event.target.closest("[data-vbt-filter]");
    if (vbtFilter) {
      document.querySelectorAll("[data-vbt-filter]").forEach((item) => item.classList.toggle("selected", item === vbtFilter));
      return renderVbtHistory(vbtFilter.dataset.vbtFilter);
    }
    const saveReview = event.target.closest("[data-video-review-save]");
    if (saveReview) saveViewerReview(saveReview);
  });
  document.addEventListener("pointerup", (event) => {
    if (event.target.matches("[data-vbt-canvas]")) handleVbtCanvasPointer(event);
  });
  window.addEventListener("beforeunload", clearObjectUrls);

  els.date.value = today();
  renderCheckGrid();
  updateStorageStatus();
  renderVbtHistory();
})();
