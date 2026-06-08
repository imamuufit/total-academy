(() => {
  "use strict";

  const DB_NAME = "platform-buddy-video-db";
  const DB_VERSION = 1;
  const STORE_NAME = "videos";
  const MAX_FILE_BYTES = 350 * 1024 * 1024;

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
        <video controls playsinline preload="metadata" src="${escapeHtml(url)}"></video>
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
        <details class="compact-guide">
          <summary>解析機能（準備中）</summary>
          <p>関節点、バー軌道、挙上速度、Buddyフォーム評価は今後追加予定です。まずは動画を残し、過去のフォームと比べよう。</p>
        </details>
        <button class="primary-button" type="button" data-video-review-save="${escapeHtml(record.id)}">フォーム確認を保存</button>
      </form>
    `;
    dialog.showModal();
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
  });
  window.addEventListener("beforeunload", clearObjectUrls);

  els.date.value = today();
  renderCheckGrid();
  updateStorageStatus();
})();
