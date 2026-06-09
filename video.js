(() => {
  "use strict";

  const DB_NAME = "platform-buddy-video-db";
  const DB_VERSION = 2;
  const STORE_NAME = "videos";
  const VBT_STORE_NAME = "vbtRecords";
  const MAX_FILE_BYTES = 350 * 1024 * 1024;
  const DEFAULT_PLATE_DIAMETER_CM = 45;

  const selectedForCompare = new Set();
  const activeObjectUrls = new Set();
  let libraryShowAll = false;

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
    storageStatus: document.querySelector("#videoStorageStatus"),
    library: document.querySelector("#videoLibrary"),
    libraryGrid: document.querySelector("#videoLibraryGrid"),
    filterLift: document.querySelector("#videoFilterLift"),
    sortOrder: document.querySelector("#videoSortOrder"),
    compareBtn: document.querySelector("#videoCompareBtn"),
    compareView: document.querySelector("#videoCompareView"),
    libraryTools: document.querySelector("#videoLibraryTools"),
    libraryAll: document.querySelector("#videoLibraryAllBtn"),
    quickMeasure: document.querySelector("#vbtQuickMeasureBtn"),
    quickCompare: document.querySelector("#vbtQuickCompareBtn"),
    dashboard: document.querySelector("#vbtDashboard"),
    profileSummary: document.querySelector("#vbtProfileSummary"),
    profileDetails: document.querySelector("#vbtProfileDetails"),
    dataSummary: document.querySelector("#vbtDataSummary"),
    homeCard: document.querySelector("#homeVbtCard")
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

  function hasFiniteNumber(value) {
    return value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value));
  }

  function mediaStatusMessage(type, detail = "") {
    const messages = {
      loading: "動画を読み込み中です。",
      ready: "動画を読み込みました。まず運動中だけに範囲を絞ります。",
      error: "この端末で動画を表示できない形式の可能性があります。MP4/H.264で撮影した動画を試してください。",
      trimStart: "解析開始を設定しました。",
      trimEnd: "解析終了を設定しました。",
      pick: "動画上のプレート中心をタップしてください。",
      tracking: "参考軌跡を追跡しています。"
    };
    return `${messages[type] || ""}${detail ? ` ${detail}` : ""}`;
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
    els.panel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function videoTitle(record) {
    const weight = record.weight ? `${formatNumber(record.weight)}kg` : "重量未入力";
    const reps = record.reps ? ` x ${formatNumber(record.reps)}` : "";
    const rpe = record.rpe ? ` @${formatNumber(record.rpe)}` : "";
    return `${liftLabel(record.lift)} ${weight}${reps}${rpe}`;
  }

  function validVelocity(record) {
    const measurement = record?.measurement || record?.analysis?.velocityData?.measurement || record?.analysis?.velocityData || record || {};
    const velocity = Number(measurement.meanVelocity);
    const duration = Number(measurement.durationSeconds);
    const distance = Number(measurement.distanceMeters);
    return Number.isFinite(velocity) && velocity >= 0.1 && Number.isFinite(duration) && duration > 0 && duration <= 12 && Number.isFinite(distance) && distance >= 0.05;
  }

  function velocityValue(record) {
    const measurement = record?.measurement || record?.analysis?.velocityData?.measurement || record?.analysis?.velocityData || record || {};
    return Number(measurement.meanVelocity);
  }

  function compactBuddyCopy(record) {
    if (!record || !validVelocity(record)) return "測定範囲を確認して、もう一度測ろう。";
    const velocity = velocityValue(record);
    const rpe = Number(record.rpe);
    if (Number.isFinite(rpe) && rpe <= 7.5 && velocity < 0.25) return "主観より少し重め。次セットはフォーム優先。";
    if (velocity >= 0.45) return "よく動いています。同じ条件で積み上げよう。";
    if (velocity >= 0.25) return "安定した速度です。同重量維持がおすすめ。";
    return "今日はやや重め。無理せず同重量か少し下げよう。";
  }

  function nextActionCopy(record) {
    if (!record || !validVelocity(record)) return "測定やり直し";
    const velocity = velocityValue(record);
    if (velocity >= 0.45) return "+2.5kg または同重量";
    if (velocity >= 0.25) return "同重量維持";
    return "-2.5kg / フォーム確認";
  }

  function latestRecord(records) {
    return [...records].sort((a, b) => String(b.createdAt || b.date || "").localeCompare(String(a.createdAt || a.date || "")))[0] || null;
  }

  function dashboardCard(label, value, copy, action = "") {
    return `
      <article class="pb-card vbt-dashboard-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <p class="pb-line-clamp-2">${escapeHtml(copy)}</p>
        ${action}
      </article>
    `;
  }

  async function renderVbtDashboard() {
    const [vbtRecords, videos] = await Promise.all([loadVbtRecords(), loadVideoRecords()]);
    const latestVbt = latestRecord(vbtRecords);
    const latestVideo = latestRecord(videos);
    const measured = latestVbt && validVelocity(latestVbt);
    const status = !latestVbt ? "未測定" : measured ? (velocityValue(latestVbt) >= 0.25 ? "良好" : "やや重い") : "再測定推奨";
    const latestTitle = latestVbt ? `${liftLabel(latestVbt.lift)} ${formatNumber(latestVbt.weight)}kg x ${formatNumber(latestVbt.reps)}` : (latestVideo ? videoTitle(latestVideo) : "記録なし");
    const latestSpeed = measured ? `${velocityValue(latestVbt).toFixed(2)} m/s` : "未測定";
    if (els.dashboard) {
      els.dashboard.innerHTML = [
        dashboardCard("今日のVBT状態", status, compactBuddyCopy(latestVbt), `<button class="text-button compact" type="button" data-vbt-dashboard-action="measure">測定する</button>`),
        dashboardCard("最新記録", latestTitle, `${latestSpeed} / ${formatDate(latestVbt?.date || latestVideo?.date)}`),
        dashboardCard("Buddy判定", measured ? `信頼度：${confidenceLabel(latestVbt.trackingConfidence || latestVbt.measurement?.trackingConfidence || "unknown")}` : "判定保留", compactBuddyCopy(latestVbt)),
        dashboardCard("次の行動", nextActionCopy(latestVbt), "1つ選んで、次のセットへ。")
      ].join("");
    }
    if (els.homeCard) {
      els.homeCard.innerHTML = `
        <div><span>VBT状態</span><strong>${escapeHtml(status)} / ${escapeHtml(latestSpeed)}</strong><p class="pb-line-clamp-2">${escapeHtml(compactBuddyCopy(latestVbt))}</p></div>
        <button class="text-button compact" type="button" data-view-target="vbt">VBTへ</button>
      `;
    }
    if (els.profileSummary) {
      const cards = ["SQ", "BP", "DL"].map((lift) => {
        const liftRecords = vbtRecords.filter((record) => record.lift === lift && validVelocity(record));
        const latest = latestRecord(liftRecords);
        return `<article class="pb-compact-card"><span>${lift}</span><strong>${latest ? `${velocityValue(latest).toFixed(2)} m/s` : "未測定"}</strong><small>${liftRecords.length}件</small></article>`;
      }).join("");
      els.profileSummary.innerHTML = `<div class="video-check-head"><strong>個人速度プロフィール</strong><small>BIG3簡易表示</small></div><div class="vbt-profile-grid">${cards}</div>`;
    }
    if (els.profileDetails) {
      els.profileDetails.innerHTML = ["SQ", "BP", "DL"].map((lift) => {
        const liftRecords = vbtRecords.filter((record) => record.lift === lift && validVelocity(record));
        const speeds = liftRecords.map(velocityValue);
        const average = speeds.length ? speeds.reduce((sum, value) => sum + value, 0) / speeds.length : null;
        const fastest = speeds.length ? Math.max(...speeds) : null;
        const rpeCount = liftRecords.filter((record) => Number(record.rpe) > 0).length;
        return `<article class="pb-compact-card"><strong>${lift}</strong><p>平均 ${average === null ? "-" : average.toFixed(2)} / 最速 ${fastest === null ? "-" : fastest.toFixed(2)} m/s</p><small>RPE入力 ${rpeCount}件</small></article>`;
      }).join("");
    }
    if (els.dataSummary) {
      const cards = ["SQ", "BP", "DL"].map((lift) => {
        const liftRecords = vbtRecords.filter((record) => record.lift === lift && validVelocity(record));
        const latest = latestRecord(liftRecords);
        const speeds = liftRecords.map(velocityValue);
        const average = speeds.length ? speeds.reduce((sum, value) => sum + value, 0) / speeds.length : null;
        return `<article><span>${lift}</span><strong>${latest ? `${velocityValue(latest).toFixed(2)} m/s` : "未測定"}</strong><small>${liftRecords.length}件 / 平均 ${average === null ? "-" : average.toFixed(2)}</small></article>`;
      }).join("");
      els.dataSummary.innerHTML = `<div class="video-check-head"><strong>VBTサマリー</strong><small>速度の現在地</small></div><div class="vbt-data-grid">${cards}</div>`;
    }
  }

  function formatSeconds(value) {
    const number = Number(value);
    return Number.isFinite(number) ? `${number.toFixed(2)}s` : "-";
  }

  function pixelDistance(a, b) {
    if (!a || !b) return null;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function median(values) {
    const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!sorted.length) return null;
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function smoothTrackingPath(path, plateDiameterPixels) {
    if (!Array.isArray(path) || path.length < 3) return path || [];
    const jumpLimit = Math.max(18, Number(plateDiameterPixels || 0) * 0.45);
    const filtered = path.map((point, index) => {
      if (index === 0 || index === path.length - 1) return point;
      const previous = path[index - 1];
      const next = path[index + 1];
      const localMedian = {
        x: median([previous.x, point.x, next.x]),
        y: median([previous.y, point.y, next.y])
      };
      return pixelDistance(previous, point) > jumpLimit
        ? { ...point, ...localMedian, corrected: true }
        : { ...point, x: localMedian.x, y: localMedian.y };
    });
    return filtered;
  }

  function measurementWarning({ durationSeconds, distanceMeters, meanVelocity, reps }) {
    const warnings = [];
    if (durationSeconds > 8 && Number(reps || 0) <= 1) warnings.push("開始と終了が広すぎる可能性があります。");
    if (Number(reps || 0) > 1 && durationSeconds > Number(reps) * 6) warnings.push("複数レップ全体を測定しています。1レップずつ測ると安定します。");
    if (distanceMeters < 0.05) warnings.push("移動距離が短すぎます。開始点と終了点を確認してください。");
    if (meanVelocity < 0.10 || meanVelocity > 1.20) warnings.push("速度が一般的な範囲外です。測定点を確認してください。");
    return warnings.join(" ");
  }

  function autoTrackingConfidence({ path, plateDiameterPixels, verticalTravelPixels, pathTravelPixels, scores }) {
    const jumps = path.slice(1).filter((point, index) => pixelDistance(path[index], point) > Math.max(18, plateDiameterPixels * 0.4)).length;
    const scoreMedian = median(scores) ?? Infinity;
    const driftRatio = verticalTravelPixels > 0 ? pathTravelPixels / verticalTravelPixels : Infinity;
    const low = jumps > Math.max(2, path.length * 0.18)
      || scoreMedian > 2400
      || driftRatio > 3.2
      || verticalTravelPixels < plateDiameterPixels * 0.12;
    const high = jumps === 0
      && scoreMedian < 1100
      && driftRatio < 1.8
      && verticalTravelPixels >= plateDiameterPixels * 0.25;
    return low ? "low" : high ? "high" : "middle";
  }

  function confidenceLabel(value) {
    return { high: "高", middle: "中", low: "低", unknown: "不明" }[value] || "不明";
  }

  function frameCanvas(video, width = 320) {
    const scale = video.videoWidth ? width / video.videoWidth : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return { canvas, ctx, scale };
  }

  function getGrayPatch(ctx, x, y, size) {
    const half = Math.floor(size / 2);
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    if (x - half < 0 || y - half < 0 || x + half >= width || y + half >= height) return null;
    const image = ctx.getImageData(x - half, y - half, size, size).data;
    const values = new Uint8Array(size * size);
    for (let i = 0, j = 0; i < image.length; i += 4, j += 1) {
      values[j] = Math.round(image[i] * 0.299 + image[i + 1] * 0.587 + image[i + 2] * 0.114);
    }
    return values;
  }

  function patchScore(a, b) {
    if (!a || !b || a.length !== b.length) return Infinity;
    let score = 0;
    for (let i = 0; i < a.length; i += 1) {
      const diff = a[i] - b[i];
      score += diff * diff;
    }
    return score / a.length;
  }

  function estimatePlateDiameterPixels(video, point) {
    if (!video || !point || !video.videoWidth || !video.videoHeight) return null;
    const { ctx, scale } = frameCanvas(video, 360);
    const x = point.x * scale;
    const y = point.y * scale;
    const maxRadius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.22;
    const minRadius = 12;
    const image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    const grayAt = (px, py) => {
      const ix = clamp(Math.round(px), 0, ctx.canvas.width - 1);
      const iy = clamp(Math.round(py), 0, ctx.canvas.height - 1);
      const index = (iy * ctx.canvas.width + ix) * 4;
      return image[index] * 0.299 + image[index + 1] * 0.587 + image[index + 2] * 0.114;
    };
    const radii = [];
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      let bestRadius = null;
      let bestGradient = 0;
      let previous = grayAt(x, y);
      for (let radius = minRadius; radius <= maxRadius; radius += 2) {
        const value = grayAt(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
        const gradient = Math.abs(value - previous);
        if (gradient > bestGradient) {
          bestGradient = gradient;
          bestRadius = radius;
        }
        previous = value;
      }
      if (bestRadius && bestGradient > 10) radii.push(bestRadius / scale);
    }
    if (radii.length < 4) return null;
    radii.sort((a, b) => a - b);
    const middle = radii.slice(Math.floor(radii.length * 0.25), Math.ceil(radii.length * 0.75));
    const radius = middle.reduce((sum, value) => sum + value, 0) / middle.length;
    return radius * 2;
  }

  function seekVideo(video, time) {
    return new Promise((resolve, reject) => {
      if (!video) return reject(new Error("動画を読み込めませんでした。"));
      const target = clamp(Number(time) || 0, 0, Number(video.duration) || 0);
      const done = () => {
        video.removeEventListener("seeked", done);
        resolve();
      };
      video.addEventListener("seeked", done, { once: true });
      video.currentTime = target;
      if (Math.abs(video.currentTime - target) < 0.03) setTimeout(done, 0);
    });
  }

  async function trackPlatePath(dialog, record) {
    const video = dialog.querySelector("video");
    const state = vbtState(dialog);
    if (!video?.videoWidth || !video?.videoHeight) throw new Error("動画を読み込んでから計測してください。");
    const targetPoint = state.targetPoint || state.startPoint;
    if (!targetPoint) throw new Error("開始位置のプレート中心を選んでください。");
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const savedEnd = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(video.duration);
    const end = savedEnd > start + 0.2 ? savedEnd : Number(video.duration);
    if (!Number.isFinite(end) || end <= start + 0.2) throw new Error("動画を読み込んでから、運動中が入るよう範囲を調整してください。");
    const plateDiameterCm = Number(dialog.querySelector("[data-vbt-plate-cm]")?.value || DEFAULT_PLATE_DIAMETER_CM);
    if (!Number.isFinite(plateDiameterCm) || plateDiameterCm <= 0) throw new Error("プレート径を確認してください。");

    await seekVideo(video, start);
    const first = frameCanvas(video, 320);
    const scale = first.scale;
    let current = { x: targetPoint.x * scale, y: targetPoint.y * scale };
    const estimatedPlatePixels = estimatePlateDiameterPixels(video, targetPoint);
    const fallbackPlatePixels = Math.max(60, Math.min(video.videoWidth, video.videoHeight) * 0.18);
    const trackingPlatePixels = Number.isFinite(estimatedPlatePixels) && estimatedPlatePixels > 20 ? estimatedPlatePixels : fallbackPlatePixels;
    const trackingPlatePixelsAtScale = trackingPlatePixels * scale;
    let patchSize = clamp(Math.round(trackingPlatePixelsAtScale * 1.12), 31, 51);
    if (patchSize % 2 === 0) patchSize += 1;
    const referenceTemplate = getGrayPatch(first.ctx, Math.round(current.x), Math.round(current.y), patchSize);
    if (!referenceTemplate) throw new Error("プレート中心が画面端に近すぎます。少し中央寄りをタップしてください。");

    const sampleCount = clamp(Math.round((end - start) * 10), 8, 60);
    const rawPath = [];
    for (let i = 0; i <= sampleCount; i += 1) {
      const time = start + ((end - start) * i) / sampleCount;
      await seekVideo(video, time);
      const frame = frameCanvas(video, 320);
      let best = current;
      let bestScore = Infinity;
      const radius = clamp(Math.round(patchSize * 1.2), 36, 62);
      for (let dy = -radius; dy <= radius; dy += 5) {
        for (let dx = -radius; dx <= radius; dx += 5) {
          const candidate = getGrayPatch(frame.ctx, Math.round(current.x + dx), Math.round(current.y + dy), patchSize);
          const score = patchScore(referenceTemplate, candidate);
          if (score < bestScore) {
            bestScore = score;
            best = { x: current.x + dx, y: current.y + dy };
          }
        }
      }
      current = best;
      rawPath.push({ time, x: best.x / frame.scale, y: best.y / frame.scale, score: Math.round(bestScore) });
    }
    const plateDiameterPixels = Number.isFinite(estimatedPlatePixels) && estimatedPlatePixels > 20 ? estimatedPlatePixels : fallbackPlatePixels;
    const path = smoothTrackingPath(rawPath, plateDiameterPixels);
    const verticalTravelPixels = Math.max(...path.map((p) => p.y)) - Math.min(...path.map((p) => p.y));
    const pathTravelPixels = path.slice(1).reduce((sum, point, index) => sum + pixelDistance(path[index], point), 0);
    if (verticalTravelPixels < 2 && pathTravelPixels < 4) {
      throw new Error("プレートを追跡できませんでした。解析開始位置でプレート中心を選び直してください。");
    }
    const metersPerPixel = (plateDiameterCm / 100) / plateDiameterPixels;
    const distanceMeters = verticalTravelPixels * metersPerPixel;
    const durationSeconds = end - start;
    const meanVelocity = distanceMeters / durationSeconds;
    const trackingConfidence = autoTrackingConfidence({
      path,
      plateDiameterPixels,
      verticalTravelPixels,
      pathTravelPixels,
      scores: rawPath.map((point) => point.score)
    });
    const warning = measurementWarning({ durationSeconds, distanceMeters, meanVelocity, reps: record.reps });
    const trackingWarning = trackingConfidence === "low"
      ? "自動追跡βの信頼度が低いです。標準2点測定で確認してください。"
      : warning || null;
    return {
      mode: "auto-track-beta",
      trackingMode: "auto-track-beta",
      trackingConfidence,
      trackingWarning,
      lift: record.lift,
      weight: Number(record.weight) || null,
      reps: Number(record.reps) || null,
      rpe: Number(record.rpe) || null,
      calibration: { plateDiameterCm, plateDiameterPixels, metersPerPixel, targetPoint, estimatedPlatePixels: estimatedPlatePixels || null },
      measurement: {
        mode: "auto-track-beta",
        startTime: start,
        endTime: end,
        durationSeconds,
        distanceMeters,
        meanVelocity,
        path,
        trim: { start, end },
        trackingConfidence,
        warning: trackingWarning,
        repVelocities: [{ rep: 1, meanVelocity, distanceMeters, durationSeconds }]
      },
      meanVelocity,
      buddyComment: vbtVelocityComment(record.lift, meanVelocity),
      rpeComment: vbtRpeComment(record.lift, meanVelocity, record.rpe),
      updatedAt: new Date().toISOString()
    };
  }

  async function measureManualTwoPoint(dialog, record) {
    const video = dialog.querySelector("video");
    const state = vbtState(dialog);
    if (!video?.videoWidth || !video?.videoHeight) throw new Error("動画を読み込んでから測定してください。");
    if (!state.startPoint || !state.endPoint) throw new Error("開始点と終了点を動画上で選んでください。");
    const startTime = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const endTime = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(video.duration);
    if (!Number.isFinite(endTime) || endTime <= startTime + 0.1) throw new Error("開始と終了の間隔を少し広げてください。");
    const plateDiameterCm = Number(dialog.querySelector("[data-vbt-plate-cm]")?.value || DEFAULT_PLATE_DIAMETER_CM);
    if (!Number.isFinite(plateDiameterCm) || plateDiameterCm <= 0) throw new Error("プレート径を確認してください。");

    await seekVideo(video, startTime);
    const estimatedPlatePixels = estimatePlateDiameterPixels(video, state.startPoint);
    const fallbackPlatePixels = Math.max(60, Math.min(video.videoWidth, video.videoHeight) * 0.18);
    const plateDiameterPixels = Number.isFinite(estimatedPlatePixels) && estimatedPlatePixels > 20 ? estimatedPlatePixels : fallbackPlatePixels;
    const metersPerPixel = (plateDiameterCm / 100) / plateDiameterPixels;
    const verticalPixels = Math.abs(state.endPoint.y - state.startPoint.y);
    const distanceMeters = verticalPixels * metersPerPixel;
    const durationSeconds = endTime - startTime;
    const meanVelocity = distanceMeters / durationSeconds;
    const warning = measurementWarning({ durationSeconds, distanceMeters, meanVelocity, reps: record.reps });
    const path = [
      { time: startTime, ...state.startPoint },
      { time: endTime, ...state.endPoint }
    ];
    return {
      mode: "manual-2point",
      trackingMode: "manual-2point",
      trackingConfidence: "high",
      trackingWarning: warning || null,
      lift: record.lift,
      weight: Number(record.weight) || null,
      reps: Number(record.reps) || null,
      rpe: Number(record.rpe) || null,
      calibration: {
        plateDiameterCm,
        plateDiameterPixels,
        metersPerPixel,
        targetPoint: state.startPoint,
        estimatedPlatePixels: estimatedPlatePixels || null
      },
      measurement: {
        mode: "manual-2point",
        startTime,
        endTime,
        durationSeconds,
        distanceMeters,
        meanVelocity,
        startPoint: state.startPoint,
        endPoint: state.endPoint,
        path,
        trim: { start: startTime, end: endTime },
        trackingConfidence: "high",
        warning,
        plateDiameterCm,
        plateDiameterPixels,
        metersPerPixel,
        repVelocities: [{ rep: 1, meanVelocity, distanceMeters, durationSeconds }]
      },
      meanVelocity,
      buddyComment: vbtVelocityComment(record.lift, meanVelocity),
      rpeComment: vbtRpeComment(record.lift, meanVelocity, record.rpe),
      updatedAt: new Date().toISOString()
    };
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
    if (!data || !hasFiniteNumber(data.meanVelocity)) {
      return `<p>範囲を決め、開始点と終了点を選ぶと標準2点測定できます。</p>`;
    }
    const mode = data.mode || data.trackingMode || data.measurement?.mode || "auto-track-beta";
    const confidence = data.trackingConfidence || data.measurement?.trackingConfidence || "unknown";
    const warning = data.warning || data.trackingWarning || data.measurement?.warning || "";
    const modeLabel = mode === "manual-2point" ? "標準2点" : "自動追跡β";
    if (!validVelocity(data)) {
      return `
        <div class="motion-result-chips">
          <span>${escapeHtml(modeLabel)}</span>
          <span>速度 ${escapeHtml(Number(data.meanVelocity || 0).toFixed(2))} m/s</span>
          <span>測定範囲を確認</span>
        </div>
        <strong>再測定推奨</strong>
        <p>${escapeHtml(warning || "開始・終了位置、プレート中心、撮影条件を確認してください。")}</p>
      `;
    }
    const reps = data.repVelocities || data.measurement?.repVelocities || [];
    return `
      <div class="motion-result-chips">
        <span>${escapeHtml(modeLabel)}</span>
        <span>速度 ${escapeHtml(Number(data.meanVelocity).toFixed(2))} m/s</span>
        <span>距離 ${escapeHtml(formatNumber(data.distanceMeters))}m</span>
        <span>時間 ${escapeHtml(formatSeconds(data.durationSeconds))}</span>
        <span>信頼度 ${escapeHtml(confidenceLabel(confidence))}</span>
      </div>
      <strong>${escapeHtml(vbtVelocityComment(data.lift, Number(data.meanVelocity)))}</strong>
      <p>${escapeHtml(vbtRpeComment(data.lift, Number(data.meanVelocity), data.rpe))}</p>
      ${warning ? `<p class="vbt-result-warning">${escapeHtml(warning)}</p>` : ""}
      ${reps.length ? `<div class="vbt-rep-list">${reps.map((rep) => `<span>Rep ${escapeHtml(rep.rep)} ${escapeHtml(Number(rep.meanVelocity).toFixed(2))} m/s</span>`).join("")}</div>` : ""}
    `;
  }

  function vbtCardMarkup(record) {
    const velocityData = record.analysis?.velocityData || {};
    const calibration = velocityData.calibration || {};
    const measurement = velocityData.measurement || velocityData;
    const plateDiameterCm = hasFiniteNumber(calibration.plateDiameterCm) ? Number(calibration.plateDiameterCm) : DEFAULT_PLATE_DIAMETER_CM;
    return `
      <section class="manual-vbt-card" data-vbt-card>
        <div class="video-check-head">
          <strong>VBT Studio</strong>
          <small>標準2点測定を優先</small>
        </div>
        <section class="vbt-trim-panel">
          <div class="video-check-head">
            <strong>1. 動画をトリミング</strong>
            <small>運動中だけに絞る</small>
          </div>
          <p class="video-storage-note">ラックアップ前とセット終了後を、開始・終了スライダーで外してください。</p>
          <div class="vbt-trim-sliders">
            <label><span>開始</span><input data-vbt-trim-range="start" type="range" min="0" max="1" step="0.01" value="0"></label>
            <label><span>終了</span><input data-vbt-trim-range="end" type="range" min="0" max="1" step="0.01" value="1"></label>
          </div>
          <div class="vbt-trim-summary">
            <span data-vbt-trim-start>開始 ${escapeHtml(formatSeconds(measurement.trim?.start))}</span>
            <span data-vbt-trim-end>終了 ${escapeHtml(formatSeconds(measurement.trim?.end))}</span>
            <button class="text-button compact" type="button" data-vbt-preview-range>範囲を再生</button>
          </div>
        </section>
        <div class="vbt-controls">
          <label>プレート径 cm<input data-vbt-plate-cm type="number" inputmode="decimal" min="10" max="60" step="0.1" value="${escapeHtml(plateDiameterCm)}"></label>
          <button class="text-button" type="button" data-vbt-pick="start">2. 開始点を選ぶ</button>
          <button class="text-button" type="button" data-vbt-pick="end">3. 終了点を選ぶ</button>
          <button class="primary-button inline" type="button" data-vbt-manual="${escapeHtml(record.id)}">4. 標準2点測定</button>
          <button class="text-button" type="button" data-vbt-reset>やり直す</button>
        </div>
        <div class="vbt-markers">
          <span data-vbt-pick-status>開始点・終了点は未選択</span>
        </div>
        <details class="compact-guide vbt-auto-details">
          <summary>自動追跡βを試す</summary>
          <p>赤い参考線は背景や影でずれることがあります。速度判断は標準2点測定を優先してください。</p>
          <button class="text-button" type="button" data-vbt-pick="target">開始位置の中心を選ぶ</button>
          <button class="text-button" type="button" data-vbt-auto="${escapeHtml(record.id)}">自動追跡β</button>
        </details>
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
      targetPoint: calibration.targetPoint || calibration.plateA || null,
      startPoint: measurement.startPoint || null,
      endPoint: measurement.endPoint || null,
      path: measurement.path || [],
      trackingConfidence: measurement.trackingConfidence || velocityData.trackingConfidence || "unknown",
      trackingMode: measurement.mode || velocityData.mode || "manual-2point",
      startTime: hasFiniteNumber(measurement.startTime) ? Number(measurement.startTime) : null,
      endTime: hasFiniteNumber(measurement.endTime) ? Number(measurement.endTime) : null,
      trimStart: hasFiniteNumber(measurement.trim?.start) ? Number(measurement.trim.start) : null,
      trimEnd: hasFiniteNumber(measurement.trim?.end) ? Number(measurement.trim.end) : null
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
    const videoBox = video.getBoundingClientRect();
    const frameBox = video.parentElement?.getBoundingClientRect();
    if (videoBox.width && videoBox.height && frameBox) {
      const scale = Math.min(videoBox.width / video.videoWidth, videoBox.height / video.videoHeight);
      const contentWidth = video.videoWidth * scale;
      const contentHeight = video.videoHeight * scale;
      canvas.style.width = `${contentWidth}px`;
      canvas.style.height = `${contentHeight}px`;
      canvas.style.left = `${videoBox.left - frameBox.left + (videoBox.width - contentWidth) / 2}px`;
      canvas.style.top = `${videoBox.top - frameBox.top + (videoBox.height - contentHeight) / 2}px`;
      canvas.style.right = "auto";
      canvas.style.bottom = "auto";
    }
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

  function getCanvasVisualScale(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: rect.width ? canvas.width / rect.width : 1,
      y: rect.height ? canvas.height / rect.height : 1
    };
  }

  function drawPoint(ctx, point, label, color) {
    if (!point) return;
    const scale = getCanvasVisualScale(ctx.canvas);
    const radius = Math.max(14 * scale.x, 12);
    const outer = Math.max(24 * scale.x, radius + 8);
    const line = Math.max(3 * scale.x, 2);
    const fontSize = Math.max(13 * scale.x, 16);
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255, 250, 242, 0.95)";
    ctx.lineWidth = line;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(point.x, point.y, outer, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(point.x - outer, point.y);
    ctx.lineTo(point.x + outer, point.y);
    ctx.moveTo(point.x, point.y - outer);
    ctx.lineTo(point.x, point.y + outer);
    ctx.stroke();
    ctx.font = `900 ${fontSize}px system-ui`;
    ctx.strokeStyle = "rgba(23, 23, 23, 0.82)";
    ctx.lineWidth = Math.max(4 * scale.x, 3);
    ctx.strokeText(label, point.x + outer + 6 * scale.x, point.y - outer);
    ctx.fillStyle = "rgba(255, 250, 242, 0.98)";
    ctx.fillText(label, point.x + outer + 6 * scale.x, point.y - outer);
    ctx.restore();
  }

  function drawVbtOverlay(dialog) {
    const canvas = dialog?.querySelector("[data-vbt-canvas]");
    if (!canvas || !syncVbtCanvas(dialog)) return;
    const ctx = canvas.getContext("2d");
    const state = vbtState(dialog);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = getCanvasVisualScale(canvas);
    ctx.lineWidth = Math.max(4 * scale.x, 4);
    ctx.lineCap = "round";
    if (state.path?.length > 1) {
      const autoPath = state.trackingMode === "auto-track-beta";
      ctx.strokeStyle = autoPath
        ? state.trackingConfidence === "low" ? "rgba(180, 35, 24, 0.35)" : "rgba(180, 35, 24, 0.72)"
        : "rgba(245, 158, 11, 0.94)";
      ctx.setLineDash(autoPath ? [12 * scale.x, 9 * scale.x] : []);
      ctx.beginPath();
      state.path.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      if (autoPath) {
        const anchor = state.path[0];
        ctx.font = `900 ${Math.max(13 * scale.x, 16)}px system-ui`;
        ctx.strokeStyle = "rgba(23, 23, 23, 0.82)";
        ctx.lineWidth = Math.max(4 * scale.x, 3);
        ctx.strokeText("自動追跡β 参考線", anchor.x + 12 * scale.x, anchor.y - 16 * scale.x);
        ctx.fillStyle = "rgba(255, 250, 242, 0.98)";
        ctx.fillText("自動追跡β 参考線", anchor.x + 12 * scale.x, anchor.y - 16 * scale.x);
      }
    } else if (state.startPoint && state.endPoint) {
      ctx.strokeStyle = "rgba(245, 158, 11, 0.94)";
      ctx.beginPath();
      ctx.moveTo(state.startPoint.x, state.startPoint.y);
      ctx.lineTo(state.endPoint.x, state.endPoint.y);
      ctx.stroke();
    }
    drawPoint(ctx, state.startPoint, "開始", "#2563eb");
    drawPoint(ctx, state.endPoint, "終了", "#157f3b");
    if (!state.startPoint && !state.endPoint) drawPoint(ctx, state.targetPoint, "中心", "#b42318");
  }

  function setVbtPickMode(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    const state = vbtState(dialog);
    const mode = button.dataset.vbtPick || "target";
    setVbtState(dialog, { pickMode: mode });
    const seekTime = mode === "end" ? state.trimEnd : state.trimStart;
    if (video && hasFiniteNumber(seekTime)) video.currentTime = Number(seekTime);
    video?.pause();
    dialog.querySelector("[data-vbt-canvas]")?.classList.add("active");
    dialog.querySelectorAll("[data-vbt-pick]").forEach((item) => item.classList.toggle("selected", item === button));
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = `${mode === "end" ? "終了" : "開始"}位置のプレート中心をタップ`;
    const guide = dialog.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = mode === "end" ? "3. 終了位置のプレート中心をタップ" : "2. 開始位置のプレート中心をタップ";
    const videoStatus = dialog.querySelector("[data-vbt-video-status]");
    if (videoStatus) videoStatus.textContent = mediaStatusMessage("pick");
  }

  function handleVbtCanvasPointer(event) {
    const dialog = event.target.closest("dialog");
    const canvas = event.target.closest("[data-vbt-canvas]");
    if (!dialog || !canvas || !syncVbtCanvas(dialog)) return;
    const state = vbtState(dialog);
    if (!state.pickMode) return;
    const point = canvasPointFromEvent(canvas, event);
    const next = {
      path: [],
      trackingConfidence: state.pickMode === "target" ? state.trackingConfidence : "unknown",
      trackingMode: state.pickMode === "target" ? "auto-track-beta" : "manual-2point"
    };
    if (state.pickMode === "start") next.startPoint = point;
    else if (state.pickMode === "end") next.endPoint = point;
    else next.targetPoint = point;
    setVbtState(dialog, next);
    const marker = dialog.querySelector("[data-vbt-pick-status]");
    const updated = vbtState(dialog);
    if (marker) marker.textContent = `開始 ${updated.startPoint ? "選択済み" : "未選択"} / 終了 ${updated.endPoint ? "選択済み" : "未選択"}`;
    const guide = dialog.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = updated.startPoint && updated.endPoint ? "4. 標準2点測定を押す" : "次の点を選んでください";
    setVbtState(dialog, { pickMode: null });
    canvas.classList.remove("active");
    dialog.querySelectorAll("[data-vbt-pick]").forEach((item) => item.classList.remove("selected"));
    drawVbtOverlay(dialog);
  }

  function resetVbt(button) {
    const dialog = button.closest("dialog");
    setVbtState(dialog, {
      pickMode: null,
      targetPoint: null,
      startPoint: null,
      endPoint: null,
      path: [],
      trackingConfidence: "unknown",
      trackingMode: "manual-2point",
      startTime: null,
      endTime: null,
      trimStart: null,
      trimEnd: null
    });
    const resultBox = dialog.querySelector("[data-vbt-result]");
    if (resultBox) resultBox.innerHTML = vbtResultMarkup(null);
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = "開始点・終了点は未選択";
    const trimStart = dialog.querySelector("[data-vbt-trim-start]");
    const trimEnd = dialog.querySelector("[data-vbt-trim-end]");
    if (trimStart) trimStart.textContent = "解析開始 -";
    if (trimEnd) trimEnd.textContent = "解析終了 -";
    dialog.querySelectorAll("[data-vbt-pick]").forEach((item) => item.classList.remove("selected"));
    dialog.querySelector("[data-vbt-canvas]")?.classList.remove("active");
    syncTrimControls(dialog);
    drawVbtOverlay(dialog);
  }

  function syncTrimControls(dialog) {
    const video = dialog?.querySelector("video");
    const state = vbtState(dialog);
    const duration = Number(video?.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const startValue = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const savedEnd = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : duration;
    const endValue = savedEnd > startValue + 0.2 ? savedEnd : duration;
    const start = dialog.querySelector("[data-vbt-trim-start]");
    const end = dialog.querySelector("[data-vbt-trim-end]");
    if (start) start.textContent = `解析開始 ${formatSeconds(startValue)}`;
    if (end) end.textContent = `解析終了 ${formatSeconds(endValue)}`;
    dialog.querySelectorAll("[data-vbt-trim-range]").forEach((input) => {
      input.max = String(duration);
      input.value = input.dataset.vbtTrimRange === "start" ? String(startValue) : String(endValue);
    });
    setVbtState(dialog, { trimStart: startValue, trimEnd: endValue });
  }

  function handleTrimRange(input) {
    const dialog = input.closest("dialog");
    const video = dialog?.querySelector("video");
    const duration = Number(video?.duration);
    if (!dialog || !video || !Number.isFinite(duration) || duration <= 0) return;
    const state = vbtState(dialog);
    let start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    let end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : duration;
    if (input.dataset.vbtTrimRange === "start") start = Number(input.value);
    if (input.dataset.vbtTrimRange === "end") end = Number(input.value);
    const minimumRange = Math.min(0.5, duration * 0.15);
    if (start > end - minimumRange) {
      if (input.dataset.vbtTrimRange === "start") start = Math.max(0, end - minimumRange);
      else end = Math.min(duration, start + minimumRange);
    }
    setVbtState(dialog, {
      trimStart: start,
      trimEnd: end,
      targetPoint: null,
      startPoint: null,
      endPoint: null,
      path: [],
      trackingConfidence: "unknown",
      trackingMode: "manual-2point"
    });
    syncTrimControls(dialog);
    video.currentTime = input.dataset.vbtTrimRange === "start" ? start : end;
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = "トリミング後、開始点と終了点を選択";
    const guide = dialog.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = "1. 運動中だけになるよう範囲を調整";
    drawVbtOverlay(dialog);
  }

  function previewTrimRange(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    const state = vbtState(dialog);
    if (!video) return;
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(video.duration);
    video.currentTime = start;
    video.play();
    const stopAtEnd = () => {
      if (video.currentTime >= end || video.ended) {
        video.pause();
        video.removeEventListener("timeupdate", stopAtEnd);
      }
    };
    video.addEventListener("timeupdate", stopAtEnd);
  }

  async function saveVbtVelocity(button, mode = "auto-track-beta") {
    const dialog = button.closest("dialog");
    const record = await getVideoRecord(button.dataset.vbtAuto || button.dataset.vbtManual || button.dataset.vbtSave);
    const resultBox = dialog?.querySelector("[data-vbt-result]");
    if (!record || !dialog || !resultBox) return;
    try {
      button.disabled = true;
      button.textContent = "計測中...";
      const guide = dialog.querySelector("[data-vbt-video-guide]");
      if (guide) guide.textContent = mode === "manual-2point" ? "開始点と終了点から計算しています" : "参考軌跡を追跡しています";
      const videoStatus = dialog.querySelector("[data-vbt-video-status]");
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("tracking");
      const velocityData = mode === "manual-2point"
        ? await measureManualTwoPoint(dialog, record)
        : await trackPlatePath(dialog, record);
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
        ...velocityData
      });
      setVbtState(dialog, {
        startPoint: mode === "manual-2point" ? velocityData.measurement.startPoint || null : null,
        endPoint: mode === "manual-2point" ? velocityData.measurement.endPoint || null : null,
        targetPoint: velocityData.calibration?.targetPoint || null,
        path: velocityData.measurement.path || [],
        trackingConfidence: velocityData.trackingConfidence || "unknown",
        trackingMode: velocityData.mode || mode
      });
      drawVbtOverlay(dialog);
      if (guide) guide.textContent = `平均速度 ${velocityData.meanVelocity.toFixed(2)} m/s`;
      resultBox.innerHTML = vbtResultMarkup({ ...velocityData, ...velocityData.measurement, lift: record.lift, rpe: record.rpe });
      button.textContent = "保存しました";
      const idleLabel = mode === "manual-2point" ? "4. 標準2点測定" : "自動追跡β";
      setTimeout(() => { button.textContent = idleLabel; button.disabled = false; }, 1200);
      renderLibrary();
      renderVbtHistory();
    } catch (error) {
      resultBox.innerHTML = `<p>${escapeHtml(error.message || "速度を計算できませんでした。")}</p>`;
      const guide = dialog.querySelector("[data-vbt-video-guide]");
      if (guide) guide.textContent = error.message || "プレート中心を選び直してください";
      button.textContent = mode === "manual-2point" ? "4. 標準2点測定" : "自動追跡β";
      button.disabled = false;
    }
  }

  function saveManualVbt(button) {
    return saveVbtVelocity(button, "manual-2point");
  }

  function ensureVbtHistorySection() {
    let section = document.querySelector("#vbtHistoryPanel");
    if (section || !els.body) return section;
    section = document.createElement("details");
    section.id = "vbtHistoryPanel";
    section.className = "vbt-history-panel pb-accordion";
    section.innerHTML = `
      <summary>VBT履歴の詳細</summary>
      <div class="vbt-history-detail">
        <div class="vbt-history-filter">
          <button class="text-button selected" type="button" data-vbt-filter="ALL">すべて</button>
          <button class="text-button" type="button" data-vbt-filter="SQ">SQ</button>
          <button class="text-button" type="button" data-vbt-filter="BP">BP</button>
          <button class="text-button" type="button" data-vbt-filter="DL">DL</button>
        </div>
        <div class="vbt-history-list" id="vbtHistoryList"></div>
      </div>
    `;
    els.body.append(section);
    return section;
  }

  function vbtHistoryMarkup(record) {
    const measurement = record.measurement || {};
    const velocity = Number(measurement.meanVelocity);
    const isValid = validVelocity(record);
    return `
      <article class="vbt-history-card">
        <strong>${escapeHtml(liftLabel(record.lift))} ${record.weight ? `${escapeHtml(formatNumber(record.weight))}kg` : ""}${record.reps ? ` x ${escapeHtml(formatNumber(record.reps))}` : ""}${record.rpe ? ` @${escapeHtml(formatNumber(record.rpe))}` : ""}</strong>
        <span>${isValid ? `平均速度 ${escapeHtml(velocity.toFixed(2))} m/s` : "測定範囲を確認"}</span>
        <small>${escapeHtml(formatDate(record.date))} / ${escapeHtml((record.mode || record.measurement?.mode) === "manual-2point" ? "標準2点" : "旧自動追跡β")}</small>
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
    const velocity = Number(record.analysis?.velocityData?.measurement?.meanVelocity ?? record.analysis?.velocityData?.meanVelocity);
    const isValid = validVelocity(record);
    const measurementMode = record.analysis?.velocityData?.mode || record.analysis?.velocityData?.measurement?.mode;
    return `
      <article class="video-library-card">
        <div class="video-card-head">
          <span>${escapeHtml(record.setType || "自由")}</span>
          <small>${escapeHtml(formatDate(record.date))}</small>
        </div>
        <strong>${escapeHtml(videoTitle(record))}</strong>
        <p class="motion-status ${isValid ? "done" : ""}">VBT: ${isValid ? `${escapeHtml(velocity.toFixed(2))} m/s` : (Number.isFinite(velocity) ? "要確認" : "未計測")}</p>
        ${measurementMode ? `<small>${escapeHtml(measurementMode === "manual-2point" ? "標準2点測定" : "自動追跡β")}</small>` : ""}
        <p class="video-library-buddy pb-line-clamp-2">${escapeHtml(compactBuddyCopy(record))}</p>
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
    const visibleRecords = libraryShowAll ? records : records.slice(0, 3);
    els.libraryGrid.innerHTML = visibleRecords.length
      ? visibleRecords.map(libraryCardMarkup).join("")
      : `<p class="video-empty">まだ動画はありません。今日のセットを1本残してみよう。</p>`;
    els.libraryTools?.classList.toggle("hidden", !libraryShowAll);
    if (els.libraryAll) {
      els.libraryAll.classList.toggle("hidden", records.length <= 3 && !libraryShowAll);
      els.libraryAll.textContent = libraryShowAll ? "直近3件に戻す" : "すべて見る";
    }
    els.compareBtn.disabled = selectedForCompare.size !== 2;
    await updateStorageStatus();
    await renderVbtDashboard();
  }

  async function openLatestForMeasurement() {
    const records = await loadVideoRecords();
    const latest = latestRecord(records);
    if (latest) return openViewer(latest.id);
    showMode("add");
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
          <div class="vbt-video-guide" data-vbt-video-guide>1. 運動中だけに範囲を絞る</div>
        </div>
        <p class="vbt-video-status" data-vbt-video-status>${escapeHtml(mediaStatusMessage("loading"))}</p>
        <div class="video-viewer-meta">
          <span>${escapeHtml(formatDate(record.date))}</span>
          <span>${escapeHtml(record.setType || "自由")}</span>
        </div>
        ${vbtCardMarkup(record)}
      </form>
    `;
    dialog.showModal();
    const video = dialog.querySelector("video");
    const videoStatus = dialog.querySelector("[data-vbt-video-status]");
    video?.addEventListener("loadedmetadata", () => {
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("ready");
      syncTrimControls(dialog);
      drawVbtOverlay(dialog);
    }, { once: true });
    video?.addEventListener("error", () => {
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("error");
    }, { once: true });
    if (video?.readyState >= 1) {
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("ready");
      syncTrimControls(dialog);
      drawVbtOverlay(dialog);
    }
  }

  function compareColumnMarkup(record, url) {
    return `
      <article class="video-compare-column">
        <strong>${escapeHtml(videoTitle(record))}</strong>
        <small>${escapeHtml(formatDate(record.date))}</small>
        <video controls playsinline preload="metadata" src="${escapeHtml(url)}"></video>
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
      videoName: file.name,
      videoType: file.type,
      videoSize: file.size,
      videoBlob: file,
      analysis: { velocityData: null }
    };

    try {
      await saveVideoRecord(record);
      resetForm();
      updateStorageStatus("保存しました。VBT確認を開きます。");
      showMode("library");
      await renderLibrary();
      await renderVbtDashboard();
      await openViewer(record.id);
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

  els.toggle?.addEventListener("click", () => {
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
  els.quickMeasure?.addEventListener("click", openLatestForMeasurement);
  els.quickCompare?.addEventListener("click", () => {
    libraryShowAll = true;
    showMode("library");
    renderLibrary();
  });
  els.libraryAll?.addEventListener("click", () => {
    libraryShowAll = !libraryShowAll;
    renderLibrary();
  });
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
    const previewRange = event.target.closest("[data-vbt-preview-range]");
    if (previewRange) return previewTrimRange(previewRange);
    const vbtReset = event.target.closest("[data-vbt-reset]");
    if (vbtReset) return resetVbt(vbtReset);
    const vbtManual = event.target.closest("[data-vbt-manual]");
    if (vbtManual) return saveManualVbt(vbtManual);
    const vbtSave = event.target.closest("[data-vbt-auto]");
    if (vbtSave) return saveVbtVelocity(vbtSave, "auto-track-beta");
    const dashboardAction = event.target.closest("[data-vbt-dashboard-action]");
    if (dashboardAction?.dataset.vbtDashboardAction === "measure") return openLatestForMeasurement();
    const vbtFilter = event.target.closest("[data-vbt-filter]");
    if (vbtFilter) {
      document.querySelectorAll("[data-vbt-filter]").forEach((item) => item.classList.toggle("selected", item === vbtFilter));
      return renderVbtHistory(vbtFilter.dataset.vbtFilter);
    }
  });
  document.addEventListener("pointerup", (event) => {
    if (event.target.matches("[data-vbt-canvas]")) handleVbtCanvasPointer(event);
  });
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-vbt-trim-range]")) handleTrimRange(event.target);
  });
  window.addEventListener("beforeunload", clearObjectUrls);

  els.date.value = today();
  updateStorageStatus();
  renderVbtHistory();
  renderLibrary();
  renderVbtDashboard();
})();
