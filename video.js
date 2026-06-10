(() => {
  "use strict";

  const DB_NAME = "platform-buddy-video-db";
  const DB_VERSION = 2;
  const STORE_NAME = "videos";
  const VBT_STORE_NAME = "vbtRecords";
  const MAX_FILE_BYTES = 350 * 1024 * 1024;
  const DEFAULT_PLATE_DIAMETER_CM = 45;
  const GENERAL_RPE_VELOCITY = {
    SQ: { 7: "0.42〜0.52", 8: "0.32〜0.42", 9: "0.24〜0.32" },
    BP: { 7: "0.32〜0.42", 8: "0.22〜0.32", 9: "0.14〜0.22" },
    DL: { 7: "0.40〜0.52", 8: "0.30〜0.40", 9: "0.20〜0.30" }
  };

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

  function getVbtAnalysisStatus(data) {
    const velocityData = data?.analysis?.velocityData || data || {};
    const measurement = velocityData.measurement || data?.measurement || velocityData;
    const calibration = velocityData.calibration || data?.calibration || {};
    const repMetrics = measurement.repMetrics || velocityData.repMetrics || [];
    const primary = measurement.primaryVbtMetric || velocityData.primaryVbtMetric || data?.primaryVbtMetric || getPrimaryVbtMetric(repMetrics);
    const finiteOrNaN = (value) => value === null || value === undefined || value === "" ? NaN : Number(value);
    const lastRepVelocity = finiteOrNaN(primary.lastRepConcentricMeanVelocity ?? data?.lastRepVelocity);
    const meanVelocity = finiteOrNaN(measurement.meanVelocity ?? velocityData.meanVelocity ?? data?.averageVelocity);
    const distanceMeters = finiteOrNaN(measurement.distanceMeters ?? data?.distanceMeters);
    const durationSeconds = finiteOrNaN(measurement.durationSeconds ?? data?.durationSeconds);
    const detectedReps = Number(measurement.detectedReps ?? primary.repCountDetected ?? repMetrics.length);
    const expectedReps = Number(measurement.expectedReps ?? data?.reps ?? velocityData.reps);
    const trackingConfidence = velocityData.trackingConfidence || measurement.trackingConfidence || data?.trackingConfidence || "unknown";
    const plateDiameterCm = finiteOrNaN(calibration.plateDiameterCm ?? measurement.plateDiameterCm ?? data?.plateDiameterCm);
    const existingWarning = velocityData.trackingWarning || measurement.warning || velocityData.warning || data?.warningMessage || data?.warning;
    const displayableResult = repMetrics.length > 0 || Number.isFinite(lastRepVelocity) || Number.isFinite(meanVelocity);
    const warnings = [];

    if (!displayableResult) {
      return {
        analysisStatus: "invalid",
        displayableResult: false,
        profileEligible: false,
        warningType: "no-result",
        warningMessage: "解析結果を取得できませんでした。緑枠と動画範囲を確認してください。"
      };
    }
    if (trackingConfidence === "low") warnings.push("追跡信頼度が低めです。結果は参考値として扱ってください。");
    if (existingWarning) warnings.push(String(existingWarning));
    if (detectedReps <= 0 && !repMetrics.length) warnings.push("レップ検出ができていません。動画範囲または緑枠を確認してください。");
    if (expectedReps > 0 && detectedReps > 0 && detectedReps !== expectedReps) warnings.push(`検出レップ数は${detectedReps}/${expectedReps}です。`);
    if (Number.isFinite(lastRepVelocity) && lastRepVelocity < 0.08) warnings.push("最終レップ速度がかなり低く出ています。追跡ズレを確認してください。");
    else if (Number.isFinite(lastRepVelocity) && lastRepVelocity < 0.10) warnings.push("最終レップ速度が低めです。結果は保存し、要確認として扱います。");
    if (Number.isFinite(lastRepVelocity) && lastRepVelocity > 1.5) warnings.push("速度が高すぎます。プレート径または追跡ズレを確認してください。");
    if (Number.isFinite(distanceMeters) && (distanceMeters < 0.05 || distanceMeters > 1.2)) warnings.push("可動域を確認してください。");
    if (Number.isFinite(durationSeconds) && (durationSeconds <= 0 || durationSeconds > Math.max(12, (expectedReps || 1) * 6))) warnings.push("解析時間を確認してください。");
    if (Number.isFinite(plateDiameterCm) && (plateDiameterCm < 30 || plateDiameterCm > 60)) warnings.push("プレート径を確認してください。");

    const profileEligible = displayableResult
      && warnings.length === 0
      && trackingConfidence !== "low"
      && Number.isFinite(lastRepVelocity)
      && lastRepVelocity >= 0.08
      && lastRepVelocity <= 1.5;
    return {
      analysisStatus: warnings.length ? "warning" : "ok",
      displayableResult,
      profileEligible,
      warningType: warnings.length ? "warning" : null,
      warningMessage: warnings.join(" ")
    };
  }

  function isDisplayableVbtResult(data) {
    return getVbtAnalysisStatus(data).displayableResult;
  }

  function isProfileEligibleVbt(data) {
    return getVbtAnalysisStatus(data).profileEligible;
  }

  function getVbtWarningMessage(data) {
    return getVbtAnalysisStatus(data).warningMessage;
  }

  function adaptVbtRecord(record) {
    const velocityData = record?.analysis?.velocityData || record || {};
    const measurement = velocityData.measurement || record?.measurement || velocityData;
    const calibration = velocityData.calibration || record?.calibration || {};
    const primaryVbtMetric = measurement.primaryVbtMetric || velocityData.primaryVbtMetric || record?.primaryVbtMetric || {};
    const setAverageVelocity = Number(measurement.meanVelocity ?? velocityData.meanVelocity ?? record?.averageVelocity);
    const profileVelocity = Number(primaryVbtMetric.lastRepConcentricMeanVelocity ?? record?.lastRepVelocity ?? setAverageVelocity);
    const durationSeconds = Number(measurement.durationSeconds ?? record?.durationSeconds);
    const distanceMeters = Number(measurement.distanceMeters ?? record?.distanceMeters);
    const trackingConfidence = velocityData.trackingConfidence || measurement.trackingConfidence || record?.trackingConfidence || "unknown";
    const plateDiameterCm = Number(calibration.plateDiameterCm ?? measurement.plateDiameterCm ?? record?.plateDiameterCm);
    const status = getVbtAnalysisStatus(record);
    const repVelocities = measurement.repVelocities || [];
    return {
      ...record,
      videoId: record?.videoId || (record?.analysis?.velocityData ? record.id : null),
      lift: record?.lift || velocityData.lift || "OTHER",
      liftLabel: liftLabel(record?.lift || velocityData.lift),
      weightKg: Number(record?.weightKg ?? record?.weight ?? velocityData.weight) || 0,
      reps: Number(record?.reps ?? velocityData.reps) || 0,
      subjectiveRpe: hasFiniteNumber(record?.subjectiveRpe ?? record?.rpe ?? velocityData.rpe) ? Number(record?.subjectiveRpe ?? record?.rpe ?? velocityData.rpe) : null,
      tag: record?.tag || record?.setType || null,
      averageVelocity: Number.isFinite(profileVelocity) ? profileVelocity : null,
      setAverageVelocity: Number.isFinite(setAverageVelocity) ? setAverageVelocity : null,
      lastRepVelocity: Number(primaryVbtMetric.lastRepConcentricMeanVelocity ?? repVelocities.at(-1)?.meanVelocity) || null,
      peakVelocity: Number(primaryVbtMetric.bestRepConcentricMeanVelocity ?? record?.peakVelocity) || null,
      velocityLossPercent: Number(primaryVbtMetric.velocityLossPercent ?? record?.velocityLossPercent) || null,
      measurementMode: velocityData.mode || measurement.mode || record?.measurementMode || "unknown",
      trackingConfidence,
      validVelocity: status.profileEligible,
      profileEligible: status.profileEligible,
      analysisStatus: status.analysisStatus,
      displayableResult: status.displayableResult,
      warningType: status.warningType,
      warningMessage: status.warningMessage,
      plateDiameterCm: Number.isFinite(plateDiameterCm) ? plateDiameterCm : null,
      distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : null,
      durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
      notes: record?.notes || ""
    };
  }

  function validVelocity(record) {
    return isProfileEligibleVbt(record);
  }

  function velocityValue(record) {
    return Number(adaptVbtRecord(record).averageVelocity);
  }

  function getValidVbtRecords(records) {
    return records.map(adaptVbtRecord).filter((record) => record.profileEligible);
  }

  function velocityStats(records) {
    const values = records.map((record) => record.averageVelocity).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) return null;
    return {
      count: values.length,
      meanVelocity: values.reduce((sum, value) => sum + value, 0) / values.length,
      medianVelocity: median(values),
      fastestVelocity: values.at(-1),
      slowestVelocity: values[0],
      latestVelocity: records[0]?.averageVelocity ?? values.at(-1),
      confidence: values.length >= 5 ? "high" : values.length >= 3 ? "middle" : "low",
      records
    };
  }

  function getExactVelocityProfile(records, targetRecord) {
    const target = adaptVbtRecord(targetRecord);
    if (!target.lift || !target.weightKg || !target.reps || target.subjectiveRpe === null) return null;
    return velocityStats(getValidVbtRecords(records).filter((record) =>
      record.id !== target.id
      && (!target.videoId || record.videoId !== target.videoId)
      && record.lift === target.lift
      && Math.abs(record.weightKg - target.weightKg) < 0.01
      && record.reps === target.reps
      && record.subjectiveRpe !== null
      && Math.abs(record.subjectiveRpe - target.subjectiveRpe) <= 0.5
    ));
  }

  function getSimilarVelocityProfile(records, targetRecord) {
    const target = adaptVbtRecord(targetRecord);
    if (!target.lift || !target.weightKg || !target.reps || target.subjectiveRpe === null) return null;
    return velocityStats(getValidVbtRecords(records).filter((record) =>
      record.id !== target.id
      && (!target.videoId || record.videoId !== target.videoId)
      && record.lift === target.lift
      && Math.abs(record.weightKg - target.weightKg) <= 5
      && Math.abs(record.reps - target.reps) <= 1
      && record.subjectiveRpe !== null
      && Math.abs(record.subjectiveRpe - target.subjectiveRpe) <= 0.5
    ));
  }

  function getLiftRpeVelocityProfile(records, lift) {
    const valid = getValidVbtRecords(records).filter((record) => record.lift === lift && record.subjectiveRpe !== null);
    return [7, 8, 9].map((rpe) => {
      const group = valid.filter((record) => Math.abs(record.subjectiveRpe - rpe) <= 0.5);
      return { rpe, ...velocityStats(group) };
    }).filter((profile) => profile.count);
  }

  function getVbtProfileStatus(records, lift) {
    const valid = getValidVbtRecords(records).filter((record) => record.lift === lift);
    return { lift, count: valid.length, ready: valid.length >= 5, personal: valid.length >= 10 };
  }

  function generalRpeProfileMarkup(lift) {
    const profile = GENERAL_RPE_VELOCITY[lift] || GENERAL_RPE_VELOCITY.SQ;
    return [7, 8, 9].map((rpe) => `<p>@${rpe}：${profile[rpe]}m/s 一般目安</p>`).join("");
  }

  function getVelocityComparison(records, targetRecord) {
    const target = adaptVbtRecord(targetRecord);
    if (!target.validVelocity) return { type: "invalid", target, profile: null, difference: null, judgment: "要確認" };
    const exact = getExactVelocityProfile(records, target);
    const similar = exact?.count >= 3 ? null : getSimilarVelocityProfile(records, target);
    const profile = exact?.count ? exact : similar;
    if (!profile?.count) return { type: "building", target, profile: null, difference: null, judgment: "作成中" };
    const difference = target.averageVelocity - profile.meanVelocity;
    const judgment = difference <= -0.05 ? "今日は重め" : difference >= 0.05 ? "出力は良好" : "いつも通り";
    return { type: exact?.count ? "exact" : "similar", target, profile, difference, judgment };
  }

  function getVelocityProfileComment(records, targetRecord) {
    const comparison = getVelocityComparison(records, targetRecord);
    if (comparison.type === "invalid") return "結果は表示・保存されています。プロフィール計算には含めず、要確認として扱います。";
    if (comparison.type === "building") return "個人速度プロフィール作成中です。同じ条件を3〜5件残すと比較精度が上がります。";
    const label = comparison.type === "exact" ? "同条件" : "類似セット";
    const difference = `${comparison.difference >= 0 ? "+" : ""}${comparison.difference.toFixed(2)}m/s`;
    return `${label}平均${comparison.profile.meanVelocity.toFixed(2)}m/sに対して今日は${comparison.target.averageVelocity.toFixed(2)}m/s。差は${difference}、${comparison.judgment}です。`;
  }

  function getRpeVelocityMismatch(records, targetRecord) {
    const comparison = getVelocityComparison(records, targetRecord);
    if (comparison.difference === null) return "unknown";
    if (comparison.difference <= -0.05) return "slower-than-usual";
    if (comparison.difference >= 0.05) return "faster-than-usual";
    return "matched";
  }

  function velocityComparisonMarkup(records, targetRecord) {
    const comparison = getVelocityComparison(records, targetRecord);
    if (comparison.type === "invalid" || comparison.type === "building") {
      return `<section class="vbt-personal-compare"><strong>過去の自分と比較</strong><p>${escapeHtml(getVelocityProfileComment(records, targetRecord))}</p></section>`;
    }
    return `
      <section class="vbt-personal-compare">
        <div class="video-check-head"><strong>過去の自分と比較</strong><small>${comparison.type === "exact" ? "同条件" : "類似セット"}</small></div>
        <div class="motion-result-chips">
          <span>平均 ${comparison.profile.meanVelocity.toFixed(2)}m/s</span>
          <span>今日 ${comparison.target.averageVelocity.toFixed(2)}m/s</span>
          <span>差 ${comparison.difference >= 0 ? "+" : ""}${comparison.difference.toFixed(2)}m/s</span>
          <span>${escapeHtml(comparison.judgment)}</span>
          <span>${comparison.profile.count}件</span>
        </div>
        <p>${escapeHtml(getVelocityProfileComment(records, targetRecord))}</p>
      </section>
    `;
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
    const adaptedRecords = vbtRecords.map(adaptVbtRecord);
    const validRecords = getValidVbtRecords(vbtRecords);
    const latestVbt = latestRecord(adaptedRecords);
    const latestVideo = latestRecord(videos);
    const measured = latestVbt && validVelocity(latestVbt);
    const status = !latestVbt ? "未測定" : measured ? (velocityValue(latestVbt) >= 0.25 ? "良好" : "やや重い") : "再測定推奨";
    const latestTitle = latestVbt ? `${liftLabel(latestVbt.lift)} ${formatNumber(latestVbt.weight)}kg x ${formatNumber(latestVbt.reps)}` : (latestVideo ? videoTitle(latestVideo) : "記録なし");
    const latestSpeed = measured ? `${velocityValue(latestVbt).toFixed(2)} m/s` : "未測定";
    const latestComparison = latestVbt ? getVelocityProfileComment(vbtRecords, latestVbt) : "同じ条件の記録を増やそう。";
    if (els.dashboard) {
      els.dashboard.innerHTML = [
        dashboardCard("今日の速度", status, latestComparison, `<button class="text-button compact" type="button" data-vbt-dashboard-action="measure">測定する</button>`),
        dashboardCard("最新記録", latestTitle, `${latestSpeed} / ${formatDate(latestVbt?.date || latestVideo?.date)}`),
        dashboardCard("プロフィール", `${validRecords.length}件`, validRecords.length >= 10 ? "個人基準を優先して比較します。" : "記録が増えるほどRPE判断が鋭くなります。"),
        dashboardCard("次の行動", nextActionCopy(latestVbt), "過去の自分と比べて判断しよう。")
      ].join("");
    }
    if (els.homeCard) {
      const profileText = ["SQ", "BP", "DL"].map((lift) => {
        const profile = getVbtProfileStatus(vbtRecords, lift);
        return `${lift}：${profile.ready ? `${profile.count}件` : `作成中 ${profile.count}/5件`}`;
      }).join(" / ");
      els.homeCard.innerHTML = `
        <div><span>VBT Profile</span><strong>${escapeHtml(profileText)}</strong><p class="pb-line-clamp-2">速度ログが増えるほど、RPE判断が鋭くなります。</p></div>
        <button class="text-button compact" type="button" data-view-target="vbt">VBTへ</button>
      `;
    }
    if (els.profileSummary) {
      const cards = ["SQ", "BP", "DL"].map((lift) => {
        const profile = getVbtProfileStatus(vbtRecords, lift);
        return `<article class="pb-compact-card"><span>${lift}</span><strong>${profile.ready ? "判定可能" : "作成中"}</strong><small>${profile.count}${profile.ready ? "件" : "/5件"}</small></article>`;
      }).join("");
      els.profileSummary.innerHTML = `<div class="video-check-head"><strong>個人速度プロフィール</strong><small>自分の@8を育てる</small></div><div class="vbt-profile-grid">${cards}</div>`;
    }
    if (els.profileDetails) {
      els.profileDetails.innerHTML = ["SQ", "BP", "DL"].map((lift) => {
        const profiles = getLiftRpeVelocityProfile(vbtRecords, lift);
        const validCount = validRecords.filter((record) => record.lift === lift).length;
        const rpeCount = validRecords.filter((record) => record.lift === lift && record.subjectiveRpe !== null).length;
        const personalReady = validCount >= 10;
        return `<article class="pb-compact-card vbt-rpe-profile"><strong>${lift} Profile</strong>${personalReady && profiles.length ? profiles.map((profile) => `<p>@${profile.rpe}：${profile.meanVelocity.toFixed(2)}m/s 平均 ${profile.count}件</p>`).join("") : generalRpeProfileMarkup(lift)}<small>${personalReady ? "個人データ優先" : "プロフィール作成中"} / 有効 ${validCount}件 / RPE入力 ${rpeCount}件</small></article>`;
      }).join("");
    }
    if (els.dataSummary) {
      const cards = ["SQ", "BP", "DL"].map((lift) => {
        const liftRecords = validRecords.filter((record) => record.lift === lift);
        const profile = getVbtProfileStatus(vbtRecords, lift);
        const latest = latestRecord(liftRecords);
        const rpeCount = liftRecords.filter((record) => record.subjectiveRpe !== null).length;
        return `<article><span>${lift}</span><strong>${profile.ready ? `${profile.count}件` : `作成中 ${profile.count}/5`}</strong><small>最新 ${latest ? `${latest.averageVelocity.toFixed(2)}m/s` : "-"} / RPE ${rpeCount}件</small></article>`;
      }).join("");
      const mismatchCount = adaptedRecords.filter((record) => {
        const comparison = getVelocityComparison(vbtRecords, record);
        return comparison.difference !== null && Math.abs(comparison.difference) >= 0.05;
      }).length;
      els.dataSummary.innerHTML = `<div class="video-check-head"><strong>VBT Profile</strong><small>RPE×速度ログ</small></div><div class="vbt-data-grid">${cards}</div><p class="vbt-profile-note">速度と過去平均のズレ：${mismatchCount}件</p>`;
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

  function getVbtStartGuide(lift) {
    switch (lift) {
      case "SQ":
        return {
          title: "立位スタートのプレートを囲む",
          shortGuide: "スクワットはトップから始まり、下降→挙上を解析します。",
          detailGuide: "ボトムを最初に指定する必要はありません。立位スタート時のプレートを緑枠で囲んでください。",
          movementPattern: "top-bottom-top"
        };
      case "BP":
        return {
          title: "ラックアップ後トップのプレートを囲む",
          shortGuide: "ベンチはトップから始まり、下降→胸上→挙上を解析します。",
          detailGuide: "ラックアップ後トップのプレートを囲んでください。胸からロックアウトまでを挙上として解析します。",
          movementPattern: "top-bottom-top"
        };
      case "DL":
        return {
          title: "床位置のプレートを囲む",
          shortGuide: "デッドリフトは床から始まり、挙上→下降を解析します。",
          detailGuide: "床にあるプレートを緑枠で囲んでください。床からロックアウトまでを挙上として解析します。",
          movementPattern: "bottom-top-bottom"
        };
      default:
        return {
          title: "開始位置の対象を囲む",
          shortGuide: "対象物の移動から速度を解析します。",
          detailGuide: "測定したい動作の開始位置で対象物を囲んでください。",
          movementPattern: "auto"
        };
    }
  }

  function smoothTrackPath(path) {
    if (!Array.isArray(path) || path.length < 5) return path || [];
    const medianPass = path.map((point, index) => {
      const from = Math.max(0, index - 2);
      const to = Math.min(path.length, index + 3);
      const window = path.slice(from, to);
      return {
        ...point,
        x: median(window.map((item) => item.x)),
        y: median(window.map((item) => item.y))
      };
    });
    return medianPass.map((point, index) => {
      const from = Math.max(0, index - 1);
      const to = Math.min(medianPass.length, index + 2);
      const window = medianPass.slice(from, to);
      return {
        ...point,
        x: window.reduce((sum, item) => sum + item.x, 0) / window.length,
        y: window.reduce((sum, item) => sum + item.y, 0) / window.length
      };
    });
  }

  function pathTurningPoints(path) {
    if (!Array.isArray(path) || path.length < 3) return [];
    const yRange = Math.max(...path.map((point) => point.y)) - Math.min(...path.map((point) => point.y));
    const epsilon = Math.max(0.75, yRange * 0.015);
    const turns = [{ index: 0, type: "start", point: path[0] }];
    let direction = 0;
    for (let index = 1; index < path.length; index += 1) {
      const delta = path[index].y - path[index - 1].y;
      const nextDirection = Math.abs(delta) <= epsilon ? direction : Math.sign(delta);
      if (direction && nextDirection && nextDirection !== direction) {
        turns.push({
          index: index - 1,
          type: direction > 0 ? "max" : "min",
          point: path[index - 1]
        });
      }
      direction = nextDirection || direction;
    }
    turns.push({ index: path.length - 1, type: "end", point: path.at(-1) });
    return turns;
  }

  function detectRepPhases(path, lift, expectedReps) {
    const smoothed = smoothTrackPath(path);
    if (smoothed.length < 5) return [];
    const guide = getVbtStartGuide(lift);
    const pattern = guide.movementPattern === "auto" ? "top-bottom-top" : guide.movementPattern;
    const turns = pathTurningPoints(smoothed);
    const yRange = Math.max(...smoothed.map((point) => point.y)) - Math.min(...smoothed.map((point) => point.y));
    const minimumTravel = Math.max(3, yRange * 0.16);
    const phases = [];
    const middleType = pattern === "bottom-top-bottom" ? "min" : "max";
    const endType = pattern === "bottom-top-bottom" ? "max" : "min";
    let startIndex = 0;

    for (let turnIndex = 1; turnIndex < turns.length - 1; turnIndex += 1) {
      const middle = turns[turnIndex];
      if (middle.type !== middleType) continue;
      const end = turns.slice(turnIndex + 1).find((turn) => turn.type === endType || turn.type === "end");
      if (!end) continue;
      const firstTravel = Math.abs(smoothed[middle.index].y - smoothed[startIndex].y);
      const secondTravel = Math.abs(smoothed[end.index].y - smoothed[middle.index].y);
      if (firstTravel < minimumTravel || secondTravel < minimumTravel) continue;
      phases.push(pattern === "bottom-top-bottom"
        ? {
            repIndex: phases.length + 1,
            concentric: { startIndex, endIndex: middle.index },
            eccentric: { startIndex: middle.index, endIndex: end.index }
          }
        : {
            repIndex: phases.length + 1,
            eccentric: { startIndex, endIndex: middle.index },
            concentric: { startIndex: middle.index, endIndex: end.index }
          });
      startIndex = end.index;
      turnIndex = turns.findIndex((turn) => turn.index === end.index) - 1;
      if (Number(expectedReps) > 0 && phases.length >= Number(expectedReps) + 2) break;
    }
    return phases;
  }

  function getTrimLengthWarning(lift, reps, durationSeconds) {
    const expected = Math.max(1, Number(reps) || 1);
    const max = expected * 7 + 4;
    if (Number(durationSeconds) > max) {
      return "解析範囲が長めです。セット前後の歩きや待機を除くと精度が上がります。";
    }
    return null;
  }

  function getRepQuality(metric) {
    const conMV = Number(metric.concentric?.meanVelocity);
    const conPV = Number(metric.concentric?.peakVelocity);
    const conDuration = Number(metric.concentric?.duration);
    const rom = Number(metric.totalRomMeters);
    const warnings = [];
    const mvPvRatio = Number.isFinite(conMV) && Number.isFinite(conPV) && conPV > 0 ? conMV / conPV : null;
    if (Number.isFinite(mvPvRatio) && mvPvRatio < 0.18) warnings.push("挙上MVとPVの差が大きく、区間検出がズレている可能性があります。");
    if (Number.isFinite(conDuration) && conDuration > 6) warnings.push("挙上時間が長すぎます。不要な時間が混ざっている可能性があります。");
    if (Number.isFinite(rom) && rom < 0.10) warnings.push("ROMが短く、プレート追跡が外れている可能性があります。");
    if (Number.isFinite(rom) && rom > 1.20) warnings.push("ROMが大きすぎます。プレート径またはスケールを確認してください。");
    return {
      mvPvRatio,
      durationOk: !Number.isFinite(conDuration) || conDuration <= 6,
      romOk: !Number.isFinite(rom) || (rom >= 0.10 && rom <= 1.20),
      directionOk: Boolean(metric.concentric && metric.eccentric),
      confidence: warnings.length ? "low" : "high",
      warning: warnings.join(" ") || null
    };
  }

  function phaseVelocityMetric(path, phase, metersPerPixel) {
    if (!phase || phase.endIndex <= phase.startIndex) return null;
    const segment = path.slice(phase.startIndex, phase.endIndex + 1);
    const duration = segment.at(-1).time - segment[0].time;
    const distanceMeters = Math.abs(segment.at(-1).y - segment[0].y) * metersPerPixel;
    const velocities = segment.slice(1).map((point, index) => {
      const deltaTime = point.time - segment[index].time;
      return deltaTime > 0 ? Math.abs(point.y - segment[index].y) * metersPerPixel / deltaTime : null;
    }).filter(Number.isFinite);
    return {
      startTime: segment[0].time,
      endTime: segment.at(-1).time,
      duration,
      distanceMeters,
      meanVelocity: duration > 0 ? distanceMeters / duration : null,
      peakVelocity: velocities.length ? Math.max(...velocities) : null
    };
  }

  function calculateRepVelocityMetrics(repPhases, calibration) {
    const path = calibration.path || [];
    const metersPerPixel = Number(calibration.metersPerPixel);
    return repPhases.map((phase) => {
      const eccentric = phaseVelocityMetric(path, phase.eccentric, metersPerPixel);
      const concentric = phaseVelocityMetric(path, phase.concentric, metersPerPixel);
      const totalRomMeters = Math.max(eccentric?.distanceMeters || 0, concentric?.distanceMeters || 0);
      const metric = {
        repIndex: phase.repIndex,
        eccentric,
        concentric,
        totalRomMeters,
        pauseDuration: Math.max(0, (concentric?.startTime || 0) - (eccentric?.endTime || 0)) || null,
        confidence: "high",
        warning: null
      };
      const repQuality = getRepQuality(metric);
      return { ...metric, confidence: repQuality.confidence, warning: repQuality.warning, repQuality };
    });
  }

  function getPrimaryVbtMetric(metrics) {
    const velocities = (metrics || []).map((metric) => metric.concentric?.meanVelocity).filter(Number.isFinite);
    const best = velocities.length ? Math.max(...velocities) : null;
    const last = velocities.at(-1) ?? null;
    return {
      lastRepConcentricMeanVelocity: last,
      bestRepConcentricMeanVelocity: best,
      firstRepConcentricMeanVelocity: velocities[0] ?? null,
      velocityLossPercent: best > 0 && last !== null ? ((best - last) / best) * 100 : null,
      repCountDetected: velocities.length
    };
  }

  function validateRepDetection(metrics, expectedReps) {
    const detected = metrics?.length || 0;
    if (!detected) return "レップ検出が不安定です。緑枠がプレートから外れていないか確認してください。";
    if (Number(expectedReps) > 0 && detected !== Number(expectedReps)) {
      return `検出レップ数は${detected}/${Number(expectedReps)}です。トリミング範囲と緑枠を確認してください。`;
    }
    const warning = metrics.find((metric) => metric.warning)?.warning;
    return warning || null;
  }

  function renderRepVelocityTable(metrics) {
    if (!metrics?.length) return "";
    return `
      <div class="vbt-rep-table-wrap">
        <table class="vbt-rep-table">
          <thead><tr><th>Rep</th><th>下降MV</th><th>挙上MV</th><th>挙上PV</th><th>ROM</th><th>判定</th></tr></thead>
          <tbody>${metrics.map((metric) => `
            <tr>
              <td>${metric.repIndex}</td>
              <td>${Number.isFinite(metric.eccentric?.meanVelocity) ? metric.eccentric.meanVelocity.toFixed(2) : "-"}</td>
              <td>${Number.isFinite(metric.concentric?.meanVelocity) ? metric.concentric.meanVelocity.toFixed(2) : "-"}</td>
              <td>${Number.isFinite(metric.concentric?.peakVelocity) ? metric.concentric.peakVelocity.toFixed(2) : "-"}</td>
              <td>${Number.isFinite(metric.totalRomMeters) ? `${Math.round(metric.totalRomMeters * 100)}cm` : "-"}</td>
              <td>${escapeHtml(metric.warning || (metric.repIndex === metrics.length ? "Last" : "OK"))}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function measurementWarning({ durationSeconds, distanceMeters, meanVelocity, reps }) {
    const warnings = [];
    if (durationSeconds > 8 && Number(reps || 0) <= 1) warnings.push("開始と終了が広すぎる可能性があります。");
    if (Number(reps || 0) > 1 && durationSeconds > Number(reps) * 6) warnings.push("複数レップ全体を測定しています。1レップずつ測ると安定します。");
    if (distanceMeters < 0.05) warnings.push("移動距離が短すぎます。開始点と終了点を確認してください。");
    if (meanVelocity < 0.10 || meanVelocity > 1.20) warnings.push("速度が一般的な範囲外です。測定点を確認してください。");
    return warnings.join(" ");
  }

  function autoTrackingConfidence({ path, plateDiameterPixels, verticalTravelPixels, pathTravelPixels, scores, expectedReps = 1 }) {
    const jumps = path.slice(1).filter((point, index) => pixelDistance(path[index], point) > Math.max(18, plateDiameterPixels * 0.4)).length;
    const scoreMedian = median(scores) ?? Infinity;
    const driftRatio = verticalTravelPixels > 0 ? pathTravelPixels / verticalTravelPixels : Infinity;
    const expectedTravelRatio = Math.max(1, Number(expectedReps) || 1) * 2;
    const lowDriftLimit = Math.max(3.2, expectedTravelRatio * 1.8);
    const highDriftLimit = Math.max(1.8, expectedTravelRatio * 1.25);
    const low = jumps > Math.max(2, path.length * 0.18)
      || scoreMedian > 2400
      || driftRatio > lowDriftLimit
      || verticalTravelPixels < plateDiameterPixels * 0.12;
    const high = jumps === 0
      && scoreMedian < 1100
      && driftRatio < highDriftLimit
      && verticalTravelPixels >= plateDiameterPixels * 0.25;
    return low ? "low" : high ? "high" : "middle";
  }

  function confidenceLabel(value) {
    return { high: "高", middle: "中", low: "低", unknown: "未判定" }[value] || "未判定";
  }

  function measurementModeLabel(mode) {
    if (mode === "plate-roi-timeseries") return "プレート追跡";
    if (mode === "plate-roi-track") return "プレートROI追跡";
    if (mode === "manual-2point") return "手動2点";
    return "中心点追跡β";
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

  function clampPlateRoi(roi, videoWidth, videoHeight) {
    const minSize = Math.max(36, Math.min(videoWidth, videoHeight) * 0.06);
    const width = clamp(Number(roi?.width) || minSize, minSize, videoWidth);
    const height = clamp(Number(roi?.height) || minSize, minSize, videoHeight);
    return {
      x: clamp(Number(roi?.x) || 0, 0, Math.max(0, videoWidth - width)),
      y: clamp(Number(roi?.y) || 0, 0, Math.max(0, videoHeight - height)),
      width,
      height
    };
  }

  function defaultPlateRoi(video) {
    const size = Math.max(72, Math.min(video.videoWidth, video.videoHeight) * 0.24);
    return clampPlateRoi({
      x: (video.videoWidth - size) / 2,
      y: (video.videoHeight - size) / 2,
      width: size,
      height: size
    }, video.videoWidth, video.videoHeight);
  }

  function roiCenter(roi) {
    return roi ? { x: roi.x + roi.width / 2, y: roi.y + roi.height / 2 } : null;
  }

  function roiAspectWarning(roi) {
    if (!roi?.width || !roi?.height) return null;
    const ratio = roi.width / roi.height;
    return ratio < 0.65 || ratio > 1.55
      ? "緑枠が大きく歪んでいます。できるだけプレート外周に合わせてください。"
      : null;
  }

  function readPlateDiameterCm(dialog) {
    const value = Number(dialog.querySelector("[data-vbt-plate-cm]")?.value || DEFAULT_PLATE_DIAMETER_CM);
    if (value >= 300 && value <= 600) {
      throw new Error("mmではなくcmで入力します。通常のプレートは45.0cmです。");
    }
    if (!Number.isFinite(value) || value <= 0 || value >= 100) {
      throw new Error("プレート径はcmで入力してください。通常は45.0cmです。");
    }
    if (value >= 30 && value <= 60) return value;
    throw new Error("プレート径を確認してください。30〜60cmを目安に入力します。");
  }

  function grayFrame(ctx) {
    const image = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
    const gray = new Uint8Array(ctx.canvas.width * ctx.canvas.height);
    for (let i = 0, j = 0; i < image.length; i += 4, j += 1) {
      gray[j] = Math.round(image[i] * 0.299 + image[i + 1] * 0.587 + image[i + 2] * 0.114);
    }
    return { gray, width: ctx.canvas.width, height: ctx.canvas.height };
  }

  function sampleGrayRoi(frame, roi, sampleSize = 18) {
    if (!frame?.gray || !roi) return null;
    if (roi.x < 0 || roi.y < 0 || roi.x + roi.width >= frame.width || roi.y + roi.height >= frame.height) return null;
    const values = new Uint8Array(sampleSize * sampleSize);
    for (let sy = 0; sy < sampleSize; sy += 1) {
      for (let sx = 0; sx < sampleSize; sx += 1) {
        const x = clamp(Math.round(roi.x + ((sx + 0.5) / sampleSize) * roi.width), 0, frame.width - 1);
        const y = clamp(Math.round(roi.y + ((sy + 0.5) / sampleSize) * roi.height), 0, frame.height - 1);
        values[sy * sampleSize + sx] = frame.gray[y * frame.width + x];
      }
    }
    return values;
  }

  async function trackPlateRoiPath(dialog, record) {
    const video = dialog.querySelector("video");
    const state = vbtState(dialog);
    if (!video?.videoWidth || !video?.videoHeight) throw new Error("動画を読み込んでから追跡してください。");
    if (!state.plateRoi) throw new Error("緑枠をプレート外周に合わせてください。");
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const savedEnd = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(video.duration);
    const end = savedEnd > start + 0.2 ? savedEnd : Number(video.duration);
    if (!Number.isFinite(end) || end <= start + 0.2) throw new Error("測定範囲を少し広げてください。");
    const plateDiameterCm = readPlateDiameterCm(dialog);
    const plateRoi = clampPlateRoi(state.plateRoi, video.videoWidth, video.videoHeight);
    const aspectWarning = roiAspectWarning(plateRoi);

    await seekVideo(video, start);
    const first = frameCanvas(video, 320);
    const scale = first.scale;
    const scaledRoi = {
      x: plateRoi.x * scale,
      y: plateRoi.y * scale,
      width: plateRoi.width * scale,
      height: plateRoi.height * scale
    };
    const referenceTemplate = sampleGrayRoi(grayFrame(first.ctx), scaledRoi);
    if (!referenceTemplate) throw new Error("緑枠が動画端に近すぎます。少し内側へ移動してください。");

    const sampleCount = clamp(Math.round((end - start) * 15), 18, 240);
    const rawPath = [];
    let currentRoi = { ...scaledRoi };
    const searchRadiusX = Math.max(12, scaledRoi.width * 0.75);
    const searchRadiusY = Math.max(18, scaledRoi.height * 1.25);
    const step = clamp(Math.round(Math.min(scaledRoi.width, scaledRoi.height) * 0.12), 3, 8);

    for (let i = 0; i <= sampleCount; i += 1) {
      const time = start + ((end - start) * i) / sampleCount;
      await seekVideo(video, time);
      const frame = frameCanvas(video, 320);
      const gray = grayFrame(frame.ctx);
      let bestRoi = currentRoi;
      let bestScore = Infinity;
      for (let dy = -searchRadiusY; dy <= searchRadiusY; dy += step) {
        for (let dx = -searchRadiusX; dx <= searchRadiusX; dx += step) {
          const candidateRoi = {
            x: currentRoi.x + dx,
            y: currentRoi.y + dy,
            width: currentRoi.width,
            height: currentRoi.height
          };
          const candidate = sampleGrayRoi(gray, candidateRoi);
          const score = patchScore(referenceTemplate, candidate);
          if (score < bestScore) {
            bestScore = score;
            bestRoi = candidateRoi;
          }
        }
      }
      currentRoi = bestRoi;
      const center = roiCenter(bestRoi);
      rawPath.push({
        time,
        x: center.x / frame.scale,
        y: center.y / frame.scale,
        score: Math.round(bestScore),
        confidence: Number.isFinite(bestScore) ? 1 / (1 + bestScore / 1000) : null
      });
    }

    const plateDiameterPixels = Math.max(plateRoi.width, plateRoi.height);
    const path = smoothTrackPath(smoothTrackingPath(rawPath, plateDiameterPixels));
    const verticalTravelPixels = Math.max(...path.map((point) => point.y)) - Math.min(...path.map((point) => point.y));
    const pathTravelPixels = path.slice(1).reduce((sum, point, index) => sum + pixelDistance(path[index], point), 0);
    if (verticalTravelPixels < Math.max(3, plateDiameterPixels * 0.035)) {
      throw new Error("プレートの上下移動を捉えられませんでした。緑枠と測定範囲を確認してください。");
    }
    const metersPerPixel = (plateDiameterCm / 100) / plateDiameterPixels;
    const repPhases = detectRepPhases(path, record.lift, record.reps);
    const repMetrics = calculateRepVelocityMetrics(repPhases, { path, metersPerPixel });
    const primaryVbtMetric = getPrimaryVbtMetric(repMetrics);
    const repWarning = validateRepDetection(repMetrics, record.reps);
    const concentricVelocities = repMetrics.map((metric) => metric.concentric?.meanVelocity).filter(Number.isFinite);
    const distanceMeters = repMetrics.length
      ? repMetrics.reduce((sum, metric) => sum + metric.totalRomMeters, 0) / repMetrics.length
      : verticalTravelPixels * metersPerPixel;
    const durationSeconds = end - start;
    const meanVelocity = concentricVelocities.length
      ? concentricVelocities.reduce((sum, velocity) => sum + velocity, 0) / concentricVelocities.length
      : distanceMeters / durationSeconds;
    const trackingConfidence = autoTrackingConfidence({
      path,
      plateDiameterPixels,
      verticalTravelPixels,
      pathTravelPixels,
      scores: rawPath.map((point) => point.score),
      expectedReps: record.reps
    });
    const trackingWarning = [
      aspectWarning,
      trackingConfidence === "low" ? "追跡の信頼度が低めです。手動2点測定でも確認してください。" : null,
      repWarning || null,
      getTrimLengthWarning(record.lift, record.reps, durationSeconds)
    ].filter(Boolean).join(" ");

    return {
      mode: "plate-roi-timeseries",
      trackingMode: "plate-roi-timeseries",
      trackingConfidence,
      trackingWarning: trackingWarning || null,
      lift: record.lift,
      weight: Number(record.weight) || null,
      reps: Number(record.reps) || null,
      rpe: Number(record.rpe) || null,
      calibration: {
        plateDiameterCm,
        plateDiameterPixels,
        metersPerPixel,
        plateRoi,
        roiWidthPixels: plateRoi.width,
        roiHeightPixels: plateRoi.height,
        roiAspectRatio: plateRoi.width / plateRoi.height
      },
      measurement: {
        mode: "plate-roi-timeseries",
        lift: record.lift,
        expectedReps: Number(record.reps) || null,
        detectedReps: repMetrics.length,
        startRoi: plateRoi,
        startTime: start,
        endTime: end,
        durationSeconds,
        distanceMeters,
        meanVelocity,
        path,
        trim: { start, end },
        trackingConfidence,
        warning: trackingWarning || null,
        plateDiameterCm,
        plateDiameterPixels,
        metersPerPixel,
        trackPath: path,
        repMetrics,
        primaryVbtMetric,
        repVelocities: repMetrics.map((metric) => ({
          rep: metric.repIndex,
          meanVelocity: metric.concentric?.meanVelocity,
          peakVelocity: metric.concentric?.peakVelocity,
          eccentricMeanVelocity: metric.eccentric?.meanVelocity,
          distanceMeters: metric.totalRomMeters,
          durationSeconds: metric.concentric?.duration
        }))
      },
      primaryVbtMetric,
      meanVelocity,
      buddyComment: vbtVelocityComment(record.lift, meanVelocity),
      rpeComment: vbtRpeComment(record.lift, meanVelocity, record.rpe),
      updatedAt: new Date().toISOString()
    };
  }

  function trackPlateTimeSeries(dialog, record) {
    return trackPlateRoiPath(dialog, record);
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
    const plateDiameterCm = readPlateDiameterCm(dialog);

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
      ? "追跡の信頼度が低いです。緑枠を見直すか、手動2点で確認してください。"
      : warning || null;
    return {
      mode: "center-point-beta",
      trackingMode: "center-point-beta",
      trackingConfidence,
      trackingWarning,
      lift: record.lift,
      weight: Number(record.weight) || null,
      reps: Number(record.reps) || null,
      rpe: Number(record.rpe) || null,
      calibration: { plateDiameterCm, plateDiameterPixels, metersPerPixel, targetPoint, estimatedPlatePixels: estimatedPlatePixels || null },
      measurement: {
        mode: "center-point-beta",
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
    const plateDiameterCm = readPlateDiameterCm(dialog);

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
  function renderVbtErrorCard(status) {
    return `
      <section class="vbt-error-card">
        <strong>解析できませんでした</strong>
        <p>${escapeHtml(status.warningMessage || "動画範囲と緑枠を確認して、もう一度解析してください。")}</p>
      </section>
    `;
  }

  function renderVbtResultHero(data, status) {
    const measurement = data.measurement || data;
    const repMetrics = measurement.repMetrics || data.repMetrics || [];
    const primary = measurement.primaryVbtMetric || data.primaryVbtMetric || getPrimaryVbtMetric(repMetrics);
    const lastVelocity = Number(primary.lastRepConcentricMeanVelocity);
    const setAverage = Number(measurement.meanVelocity ?? data.meanVelocity);
    const heroVelocity = Number.isFinite(lastVelocity) ? lastVelocity : setAverage;
    const bestVelocity = Number(primary.bestRepConcentricMeanVelocity);
    const velocityLoss = Number(primary.velocityLossPercent);
    const detectedReps = Number(measurement.detectedReps ?? primary.repCountDetected ?? repMetrics.length);
    const expectedReps = Number(measurement.expectedReps ?? data.reps);
    return `
      <section class="vbt-result-hero ${status.analysisStatus}">
        <div>
          <span class="vbt-result-kicker">${status.profileEligible ? "VBT RESULT" : "VBT RESULT / 要確認"}</span>
          <strong class="vbt-result-main">${Number.isFinite(heroVelocity) ? heroVelocity.toFixed(2) : "--"}<small>m/s</small></strong>
          <p>${Number.isFinite(lastVelocity) ? "最終レップ挙上平均速度" : "セット平均挙上速度"}</p>
        </div>
        <div class="vbt-result-summary-grid">
          <span><small>セット平均</small><strong>${Number.isFinite(setAverage) ? `${setAverage.toFixed(2)}m/s` : "--"}</strong></span>
          <span><small>最速レップ</small><strong>${Number.isFinite(bestVelocity) ? `${bestVelocity.toFixed(2)}m/s` : "--"}</strong></span>
          <span><small>速度低下</small><strong>${Number.isFinite(velocityLoss) ? `${velocityLoss.toFixed(0)}%` : "--"}</strong></span>
          <span><small>検出レップ</small><strong>${detectedReps || 0}${expectedReps > 0 ? `/${expectedReps}` : ""}</strong></span>
        </div>
        ${status.warningMessage ? `<p class="vbt-result-hero-warning">${escapeHtml(status.warningMessage)}</p>` : ""}
      </section>
    `;
  }

  function renderRepVelocityCards(metrics) {
    if (!metrics.length) return "";
    return `
      <div class="vbt-rep-cards">
        ${metrics.map((metric, index) => {
          const eccentric = metric.eccentric || {};
          const concentric = metric.concentric || {};
          const rom = Number(metric.totalRomMeters);
          const isLast = index === metrics.length - 1;
          return `
            <article class="vbt-rep-card ${isLast ? "last" : ""}">
              <div class="vbt-rep-card-head">
                <strong>Rep ${escapeHtml(metric.repIndex || index + 1)}</strong>
                <span class="${metric.warning ? "warning" : ""}">${metric.warning ? "区間確認" : isLast ? "LAST" : "OK"}</span>
              </div>
              <div class="vbt-rep-card-grid">
                <span><small>下降平均</small><strong>${Number.isFinite(Number(eccentric.meanVelocity)) ? `${Number(eccentric.meanVelocity).toFixed(2)}m/s` : "--"}</strong></span>
                <span><small>挙上平均</small><strong>${Number.isFinite(Number(concentric.meanVelocity)) ? `${Number(concentric.meanVelocity).toFixed(2)}m/s` : "--"}</strong></span>
                <span><small>挙上ピーク</small><strong>${Number.isFinite(Number(concentric.peakVelocity)) ? `${Number(concentric.peakVelocity).toFixed(2)}m/s` : "--"}</strong></span>
                <span><small>ROM</small><strong>${Number.isFinite(rom) ? `${Math.round(rom * 100)}cm` : "--"}</strong></span>
              </div>
              ${metric.warning ? `<p>${escapeHtml(metric.warning)}</p>` : ""}
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderRepVelocityDisplay(data) {
    const measurement = data.measurement || data;
    const repMetrics = measurement.repMetrics || data.repMetrics || [];
    if (!repMetrics.length) return `<p class="vbt-result-warning">レップ別の速度は検出できませんでした。セット結果は保存されています。</p>`;
    return `
      <section class="vbt-rep-section">
        <div class="video-check-head"><strong>レップ別の速度</strong><small>下降 / 挙上 / ROM</small></div>
        ${renderRepTimeline(repMetrics, measurement)}
        ${renderRepVelocityCards(repMetrics)}
        ${renderRepVelocityTable(repMetrics)}
      </section>
    `;
  }

  function renderRepTimeline(metrics, measurement) {
    const start = Number(measurement.startTime ?? measurement.trim?.start);
    const end = Number(measurement.endTime ?? measurement.trim?.end);
    const duration = end - start;
    if (!Number.isFinite(duration) || duration <= 0) return "";
    const blocks = metrics.flatMap((metric) => [
      metric.eccentric ? { type: "eccentric", rep: metric.repIndex, start: metric.eccentric.startTime, end: metric.eccentric.endTime } : null,
      metric.concentric ? { type: "concentric", rep: metric.repIndex, start: metric.concentric.startTime, end: metric.concentric.endTime } : null
    ]).filter(Boolean).map((block) => {
      const left = clamp(((block.start - start) / duration) * 100, 0, 100);
      const width = clamp(((block.end - block.start) / duration) * 100, 0.7, 100 - left);
      return `<span class="${block.type}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%" title="Rep ${escapeHtml(block.rep)} ${block.type === "eccentric" ? "下降" : "挙上"}"></span>`;
    }).join("");
    return `
      <div class="vbt-rep-timeline-wrap">
        <div class="vbt-rep-timeline">${blocks}</div>
        <div class="vbt-timeline-legend"><span>下降</span><span>挙上</span><span>空白は待機・判定外</span></div>
      </div>
    `;
  }

  function renderVbtMeasurementDetails(data) {
    const measurement = data.measurement || data;
    const calibration = data.calibration || {};
    const mode = data.mode || data.trackingMode || measurement.mode || "plate-roi-timeseries";
    const confidence = data.trackingConfidence || measurement.trackingConfidence || "unknown";
    const plateDiameterCm = Number(calibration.plateDiameterCm ?? measurement.plateDiameterCm ?? data.plateDiameterCm);
    return `
      <details class="compact-guide vbt-measurement-details">
        <summary>測定条件</summary>
        <div class="motion-result-chips">
          <span>${escapeHtml(measurementModeLabel(mode))}</span>
          ${Number.isFinite(plateDiameterCm) ? `<span>プレート ${plateDiameterCm.toFixed(1)}cm</span>` : ""}
          <span>信頼度 ${escapeHtml(confidenceLabel(confidence))}</span>
          ${Number.isFinite(Number(measurement.distanceMeters)) ? `<span>ROM ${formatNumber(measurement.distanceMeters)}m</span>` : ""}
          ${Number.isFinite(Number(measurement.durationSeconds)) ? `<span>${formatSeconds(measurement.durationSeconds)}</span>` : ""}
        </div>
      </details>
    `;
  }

  function vbtResultMarkup(data) {
    const status = getVbtAnalysisStatus(data);
    if (!status.displayableResult) return renderVbtErrorCard(status);
    const measurement = data.measurement || data;
    const meanVelocity = Number(measurement.meanVelocity ?? data.meanVelocity);
    return `
      ${renderVbtResultHero(data, status)}
      <section class="vbt-buddy-judgement">
        <span>Buddy判定</span>
        <strong>${escapeHtml(vbtVelocityComment(data.lift, meanVelocity))}</strong>
        <p>${escapeHtml(vbtRpeComment(data.lift, meanVelocity, data.rpe))}</p>
        ${!status.profileEligible ? `<p class="vbt-result-warning">結果は保存しました。個人速度プロフィールには含めず、要確認として扱います。</p>` : ""}
        ${!status.profileEligible ? `<p>数値だけで重量判断せず、動画の軌道と合わせて確認してください。</p>` : `<p>次セットもRPEとフォームを優先し、この速度を比較材料にしよう。</p>`}
      </section>
      ${renderRepVelocityDisplay(data)}
      ${renderVbtMeasurementDetails(data)}
      <p class="vbt-profile-note">下降速度はテンポ確認用。RPEプロフィールには最終レップの挙上平均速度を使います。</p>
    `;
  }

  function vbtCardMarkup(record) {
    const velocityData = record.analysis?.velocityData || {};
    const calibration = velocityData.calibration || {};
    const measurement = velocityData.measurement || velocityData;
    const plateDiameterCm = hasFiniteNumber(calibration.plateDiameterCm) ? Number(calibration.plateDiameterCm) : DEFAULT_PLATE_DIAMETER_CM;
    const startGuide = getVbtStartGuide(record.lift);
    return `
      <section class="manual-vbt-card" data-vbt-card>
        <div class="video-check-head">
          <strong>VBT Studio</strong>
          <small>プレート時系列追跡</small>
        </div>
        <section class="vbt-trim-panel">
          <div class="video-check-head">
            <strong>1. 動画をトリミング</strong>
            <small>運動中だけに絞る</small>
          </div>
          <p class="video-storage-note">1レップまたは複数レップの動作全体を残し、前後の不要部分だけを除きます。</p>
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
        <section class="vbt-roi-panel">
          <div class="video-check-head">
            <strong>2. ${escapeHtml(startGuide.title)}</strong>
            <small>プレート追跡</small>
          </div>
          <div class="vbt-plate-controls">
            <label>プレート径
              <select data-vbt-plate-preset>
                <option value="45" ${Math.abs(plateDiameterCm - 45) < 0.05 ? "selected" : ""}>45.0cm</option>
                <option value="43" ${Math.abs(plateDiameterCm - 43) < 0.05 ? "selected" : ""}>43.0cm</option>
                <option value="custom" ${Math.abs(plateDiameterCm - 45) >= 0.05 && Math.abs(plateDiameterCm - 43) >= 0.05 ? "selected" : ""}>カスタム</option>
              </select>
            </label>
            <label>直径 cm<input data-vbt-plate-cm type="number" inputmode="decimal" min="30" max="60" step="0.1" value="${escapeHtml(plateDiameterCm)}"></label>
          </div>
          <p class="video-storage-note">${escapeHtml(startGuide.shortGuide)} ${escapeHtml(startGuide.detailGuide)}</p>
          <p class="vbt-profile-note">最初に囲むのはボトムではなく、種目ごとのスタートポジションです。動画の最初をボトムに合わせる必要はありません。</p>
          <div class="vbt-roi-actions">
            <button class="text-button" type="button" data-vbt-roi-init>緑枠を表示</button>
            <button class="primary-button inline" type="button" data-vbt-roi-track="${escapeHtml(record.id)}">3. プレートを追跡して解析</button>
            <button class="text-button" type="button" data-vbt-reset>やり直す</button>
          </div>
          <details class="vbt-roi-nudge">
            <summary>緑枠を微調整</summary>
            <div class="vbt-nudge-grid">
              <button class="text-button" type="button" data-vbt-roi-nudge="up" aria-label="上へ">↑</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="smaller">小さく</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="larger">大きく</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="left" aria-label="左へ">←</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="down" aria-label="下へ">↓</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="right" aria-label="右へ">→</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="narrower">横幅−</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="wider">横幅＋</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="shorter">縦幅−</button>
              <button class="text-button" type="button" data-vbt-roi-nudge="taller">縦幅＋</button>
            </div>
            <p>1タップ2px。指で合わせた後の仕上げに使います。</p>
          </details>
          <div class="vbt-roi-preview">
            <canvas data-vbt-roi-preview-canvas></canvas>
            <span>ROI拡大プレビュー</span>
          </div>
        </section>
        <div class="vbt-markers">
          <span data-vbt-pick-status>${calibration.plateRoi ? "緑枠を保存済み" : "緑枠は未設定"}</span>
        </div>
        <details class="compact-guide vbt-auto-details">
          <summary>自動検出が難しいとき</summary>
          <p>緑枠とトリミングを見直し、難しい場合だけ手動2点で確認します。</p>
          <div class="vbt-controls">
            <button class="text-button" type="button" data-vbt-pick="start">開始点を選ぶ</button>
            <button class="text-button" type="button" data-vbt-pick="end">終了点を選ぶ</button>
            <button class="primary-button inline" type="button" data-vbt-manual="${escapeHtml(record.id)}">手動2点で確認</button>
          </div>
        </details>
        <div class="motion-result vbt-result" data-vbt-result>${vbtResultMarkup({ ...measurement, ...velocityData, lift: record.lift, rpe: record.rpe })}</div>
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
      plateRoi: calibration.plateRoi || null,
      roiMode: null,
      roiDrag: null,
      startPoint: measurement.startPoint || null,
      endPoint: measurement.endPoint || null,
      path: measurement.trackPath || measurement.path || [],
      trackingConfidence: measurement.trackingConfidence || velocityData.trackingConfidence || "unknown",
      trackingMode: measurement.mode || velocityData.mode || (calibration.plateRoi ? "plate-roi-track" : "manual-2point"),
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

  function getRoiVisualHandleRadius(canvas) {
    const scale = getCanvasVisualScale(canvas);
    return Math.max(7 * scale.x, 5);
  }

  function getRoiHitHandleRadius(canvas) {
    const scale = getCanvasVisualScale(canvas);
    return Math.max(26 * scale.x, 22);
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

  function roiHandles(roi) {
    if (!roi) return [];
    return [
      { name: "nw", x: roi.x, y: roi.y },
      { name: "ne", x: roi.x + roi.width, y: roi.y },
      { name: "sw", x: roi.x, y: roi.y + roi.height },
      { name: "se", x: roi.x + roi.width, y: roi.y + roi.height }
    ];
  }

  function drawPlateRoi(ctx, roi) {
    if (!roi) return;
    const scale = getCanvasVisualScale(ctx.canvas);
    const lineWidth = Math.max(2.5 * scale.x, 2);
    const handleRadius = getRoiVisualHandleRadius(ctx.canvas);
    const center = roiCenter(roi);
    ctx.save();
    ctx.fillStyle = "rgba(34, 197, 94, 0.06)";
    ctx.strokeStyle = "rgba(34, 197, 94, 0.96)";
    ctx.lineWidth = lineWidth;
    ctx.fillRect(roi.x, roi.y, roi.width, roi.height);
    ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
    ctx.beginPath();
    ctx.moveTo(center.x - roi.width * 0.10, center.y);
    ctx.lineTo(center.x + roi.width * 0.10, center.y);
    ctx.moveTo(center.x, center.y - roi.height * 0.10);
    ctx.lineTo(center.x, center.y + roi.height * 0.10);
    ctx.stroke();
    roiHandles(roi).forEach((handle) => {
      ctx.beginPath();
      ctx.fillStyle = "#fffaf2";
      ctx.strokeStyle = "rgba(34, 197, 94, 0.98)";
      ctx.lineWidth = Math.max(2 * scale.x, 1.5);
      ctx.arc(handle.x, handle.y, handleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.font = `900 ${Math.max(11 * scale.x, 12)}px system-ui`;
    ctx.strokeStyle = "rgba(23, 23, 23, 0.82)";
    ctx.lineWidth = Math.max(4 * scale.x, 3);
    ctx.strokeText("ROI", roi.x + 6 * scale.x, Math.max(20 * scale.x, roi.y - 8 * scale.x));
    ctx.fillStyle = "#fffaf2";
    ctx.fillText("ROI", roi.x + 6 * scale.x, Math.max(20 * scale.x, roi.y - 8 * scale.x));
    ctx.restore();
  }

  function roiHitTarget(canvas, roi, point) {
    if (!roi || !point) return null;
    const radius = getRoiHitHandleRadius(canvas);
    const handle = roiHandles(roi).find((item) => pixelDistance(item, point) <= radius);
    if (handle) return { type: "resize", handle: handle.name };
    if (point.x >= roi.x && point.x <= roi.x + roi.width && point.y >= roi.y && point.y <= roi.y + roi.height) {
      return { type: "move", handle: null };
    }
    return null;
  }

  function drawRoiPreview(dialog) {
    const video = dialog?.querySelector("video");
    const preview = dialog?.querySelector("[data-vbt-roi-preview-canvas]");
    const roi = vbtState(dialog).plateRoi;
    if (!video || !preview || !roi || !video.videoWidth || !video.videoHeight) return;
    const ctx = preview.getContext("2d");
    preview.width = 480;
    preview.height = 240;
    const padding = Math.max(roi.width, roi.height) * 0.45;
    const source = clampPlateRoi({
      x: roi.x - padding,
      y: roi.y - padding,
      width: roi.width + padding * 2,
      height: roi.height + padding * 2
    }, video.videoWidth, video.videoHeight);
    ctx.clearRect(0, 0, preview.width, preview.height);
    ctx.drawImage(video, source.x, source.y, source.width, source.height, 0, 0, preview.width, preview.height);
    const sx = preview.width / source.width;
    const sy = preview.height / source.height;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.98)";
    ctx.lineWidth = 3;
    ctx.strokeRect((roi.x - source.x) * sx, (roi.y - source.y) * sy, roi.width * sx, roi.height * sy);
  }

  function nudgePlateRoi(dialog, action, amount = 2) {
    const state = vbtState(dialog);
    const video = dialog?.querySelector("video");
    if (!state.plateRoi || !video?.videoWidth || !video?.videoHeight) return;
    const roi = { ...state.plateRoi };
    if (action === "up") roi.y -= amount;
    if (action === "down") roi.y += amount;
    if (action === "left") roi.x -= amount;
    if (action === "right") roi.x += amount;
    if (action === "smaller") { roi.x += amount; roi.y += amount; roi.width -= amount * 2; roi.height -= amount * 2; }
    if (action === "larger") { roi.x -= amount; roi.y -= amount; roi.width += amount * 2; roi.height += amount * 2; }
    if (action === "wider") { roi.x -= amount; roi.width += amount * 2; }
    if (action === "narrower") { roi.x += amount; roi.width -= amount * 2; }
    if (action === "taller") { roi.y -= amount; roi.height += amount * 2; }
    if (action === "shorter") { roi.y += amount; roi.height -= amount * 2; }
    const next = clampPlateRoi(roi, video.videoWidth, video.videoHeight);
    setVbtState(dialog, { plateRoi: next, path: [], trackingMode: "plate-roi-track" });
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = roiAspectWarning(next) || "緑枠を微調整しました。";
    drawVbtOverlay(dialog);
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
      const estimatedPath = state.trackingMode === "auto-track-beta" || state.trackingMode === "center-point-beta" || state.trackingMode === "plate-roi-track" || state.trackingMode === "plate-roi-timeseries";
      ctx.strokeStyle = estimatedPath
        ? state.trackingConfidence === "low" ? "rgba(180, 35, 24, 0.30)" : "rgba(180, 35, 24, 0.70)"
        : "rgba(245, 158, 11, 0.94)";
      ctx.setLineDash(estimatedPath ? [12 * scale.x, 9 * scale.x] : []);
      ctx.beginPath();
      state.path.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      if (estimatedPath) {
        const anchor = state.path[0];
        const label = state.trackingMode === "plate-roi-track" || state.trackingMode === "plate-roi-timeseries" ? "プレート軌跡" : "中心点追跡β 参考線";
        ctx.font = `900 ${Math.max(13 * scale.x, 16)}px system-ui`;
        ctx.strokeStyle = "rgba(23, 23, 23, 0.82)";
        ctx.lineWidth = Math.max(4 * scale.x, 3);
        ctx.strokeText(label, anchor.x + 12 * scale.x, anchor.y - 16 * scale.x);
        ctx.fillStyle = "rgba(255, 250, 242, 0.98)";
        ctx.fillText(label, anchor.x + 12 * scale.x, anchor.y - 16 * scale.x);
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
    drawPlateRoi(ctx, state.plateRoi);
    drawRoiPreview(dialog);
  }

  function initializePlateRoi(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    if (!dialog || !video?.videoWidth || !video?.videoHeight) return;
    const state = vbtState(dialog);
    const roi = state.plateRoi ? clampPlateRoi(state.plateRoi, video.videoWidth, video.videoHeight) : defaultPlateRoi(video);
    setVbtState(dialog, {
      plateRoi: roi,
      roiMode: null,
      roiDrag: null,
      pickMode: null,
      path: [],
      trackingConfidence: "unknown",
      trackingMode: "plate-roi-track"
    });
    if (hasFiniteNumber(state.trimStart)) video.currentTime = Number(state.trimStart);
    video.pause();
    dialog.querySelector("[data-vbt-canvas]")?.classList.add("active", "roi-active");
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = roiAspectWarning(roi) || "緑枠をドラッグし、四隅でサイズを合わせます。";
    const guide = dialog.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = "緑枠をプレート外周に合わせる";
    drawVbtOverlay(dialog);
  }

  function handleRoiPointerDown(event) {
    const dialog = event.target.closest("dialog");
    const canvas = event.target.closest("[data-vbt-canvas]");
    if (!dialog || !canvas || !syncVbtCanvas(dialog)) return false;
    const state = vbtState(dialog);
    if (!state.plateRoi || state.pickMode) return false;
    const point = canvasPointFromEvent(canvas, event);
    const target = roiHitTarget(canvas, state.plateRoi, point);
    if (!target) return false;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    setVbtState(dialog, {
      roiMode: target.type,
      roiDrag: { start: point, roi: { ...state.plateRoi }, handle: target.handle }
    });
    return true;
  }

  function handleRoiPointerMove(event) {
    const dialog = event.target.closest("dialog");
    const canvas = event.target.closest("[data-vbt-canvas]");
    const state = vbtState(dialog);
    if (!dialog || !canvas || !state.roiMode || !state.roiDrag) return false;
    event.preventDefault();
    const video = dialog.querySelector("video");
    const point = canvasPointFromEvent(canvas, event);
    const start = state.roiDrag.start;
    const original = state.roiDrag.roi;
    const dx = point.x - start.x;
    const dy = point.y - start.y;
    let next = { ...original };
    if (state.roiMode === "move") {
      next.x += dx;
      next.y += dy;
    } else {
      const handle = state.roiDrag.handle;
      const left = handle.includes("w") ? original.x + dx : original.x;
      const right = handle.includes("e") ? original.x + original.width + dx : original.x + original.width;
      const top = handle.includes("n") ? original.y + dy : original.y;
      const bottom = handle.includes("s") ? original.y + original.height + dy : original.y + original.height;
      next = { x: Math.min(left, right), y: Math.min(top, bottom), width: Math.abs(right - left), height: Math.abs(bottom - top) };
    }
    next = clampPlateRoi(next, video.videoWidth, video.videoHeight);
    setVbtState(dialog, { plateRoi: next, path: [], trackingMode: "plate-roi-track" });
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = roiAspectWarning(next) || "緑枠をプレート外周に合わせています。";
    drawVbtOverlay(dialog);
    return true;
  }

  function handleRoiPointerUp(event) {
    const dialog = event.target.closest("dialog");
    const canvas = event.target.closest("[data-vbt-canvas]");
    const state = vbtState(dialog);
    if (!dialog || !canvas || !state.roiMode) return false;
    event.preventDefault();
    canvas.releasePointerCapture?.(event.pointerId);
    setVbtState(dialog, { roiMode: null, roiDrag: null });
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = roiAspectWarning(vbtState(dialog).plateRoi) || "緑枠を設定しました。追跡できます。";
    drawVbtOverlay(dialog);
    return true;
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
      trackingMode: state.pickMode === "target" ? "center-point-beta" : "manual-2point"
    };
    if (state.pickMode === "start") next.startPoint = point;
    else if (state.pickMode === "end") next.endPoint = point;
    else next.targetPoint = point;
    setVbtState(dialog, next);
    const marker = dialog.querySelector("[data-vbt-pick-status]");
    const updated = vbtState(dialog);
    if (marker) marker.textContent = `開始 ${updated.startPoint ? "選択済み" : "未選択"} / 終了 ${updated.endPoint ? "選択済み" : "未選択"}`;
    const guide = dialog.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = updated.startPoint && updated.endPoint ? "手動2点で確認を押す" : "次の点を選んでください";
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
      plateRoi: null,
      roiMode: null,
      roiDrag: null,
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
    dialog.querySelector("[data-vbt-canvas]")?.classList.remove("active", "roi-active");
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
      trackingMode: state.plateRoi ? "plate-roi-track" : "manual-2point"
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
    const record = await getVideoRecord(button.dataset.vbtRoiTrack || button.dataset.vbtAuto || button.dataset.vbtManual || button.dataset.vbtSave);
    const resultBox = dialog?.querySelector("[data-vbt-result]");
    if (!record || !dialog || !resultBox) return;
    try {
      button.disabled = true;
      button.textContent = "計測中...";
      const guide = dialog.querySelector("[data-vbt-video-guide]");
      if (guide) guide.textContent = mode === "plate-roi-track" ? "緑枠のプレートを追跡しています" : mode === "manual-2point" ? "開始点と終了点から計算しています" : "中心点を追跡しています";
      const videoStatus = dialog.querySelector("[data-vbt-video-status]");
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("tracking");
      const velocityData = mode === "manual-2point"
        ? await measureManualTwoPoint(dialog, record)
        : mode === "plate-roi-track"
          ? await trackPlateTimeSeries(dialog, record)
          : await trackPlatePath(dialog, record);
      const status = getVbtAnalysisStatus(velocityData);
      Object.assign(velocityData, {
        analysisStatus: status.analysisStatus,
        displayableResult: status.displayableResult,
        profileEligible: status.profileEligible,
        warningType: status.warningType,
        warningMessage: status.warningMessage
      });
      if (velocityData.measurement) Object.assign(velocityData.measurement, {
        analysisStatus: status.analysisStatus,
        displayableResult: status.displayableResult,
        profileEligible: status.profileEligible,
        warningType: status.warningType,
        warningMessage: status.warningMessage
      });
      record.analysis = { ...(record.analysis || {}), velocityData };
      record.updatedAt = new Date().toISOString();
      await saveVideoRecord(record);
      const savedVbtRecord = {
        id: createId("vbt"),
        videoId: record.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: record.date || today(),
        lift: record.lift,
        liftLabel: liftLabel(record.lift),
        weight: Number(record.weight) || null,
        weightKg: Number(record.weight) || null,
        reps: Number(record.reps) || null,
        rpe: Number(record.rpe) || null,
        subjectiveRpe: Number(record.rpe) || null,
        tag: record.setType || null,
        videoName: record.videoName || "",
        averageVelocity: velocityData.meanVelocity,
        lastRepVelocity: velocityData.primaryVbtMetric?.lastRepConcentricMeanVelocity
          ?? velocityData.measurement?.repVelocities?.at(-1)?.meanVelocity
          ?? null,
        peakVelocity: Math.max(
          ...((velocityData.measurement?.repMetrics || [])
            .map((metric) => metric.concentric?.peakVelocity)
            .filter(Number.isFinite)),
          0
        ) || null,
        velocityLossPercent: velocityData.primaryVbtMetric?.velocityLossPercent ?? null,
        primaryVbtMetric: velocityData.primaryVbtMetric || null,
        measurementMode: velocityData.mode || mode,
        validVelocity: status.profileEligible,
        profileEligible: status.profileEligible,
        analysisStatus: status.analysisStatus,
        displayableResult: status.displayableResult,
        warningType: status.warningType,
        warningMessage: status.warningMessage,
        plateDiameterCm: velocityData.calibration?.plateDiameterCm || null,
        distanceMeters: velocityData.measurement?.distanceMeters || null,
        durationSeconds: velocityData.measurement?.durationSeconds || null,
        notes: "",
        ...velocityData
      };
      await saveVbtRecord(savedVbtRecord);
      setVbtState(dialog, {
        startPoint: mode === "manual-2point" ? velocityData.measurement.startPoint || null : null,
        endPoint: mode === "manual-2point" ? velocityData.measurement.endPoint || null : null,
        targetPoint: velocityData.calibration?.targetPoint || null,
        plateRoi: velocityData.calibration?.plateRoi || vbtState(dialog).plateRoi || null,
        path: velocityData.measurement.path || [],
        trackingConfidence: velocityData.trackingConfidence || "unknown",
        trackingMode: velocityData.mode || mode
      });
      drawVbtOverlay(dialog);
      if (guide) {
        const detected = velocityData.primaryVbtMetric?.repCountDetected;
        guide.textContent = detected
          ? `${detected}レップ解析 / 最終 ${velocityData.primaryVbtMetric.lastRepConcentricMeanVelocity.toFixed(2)} m/s`
          : `平均速度 ${velocityData.meanVelocity.toFixed(2)} m/s`;
      }
      const profileRecords = await loadVbtRecords();
      resultBox.innerHTML = vbtResultMarkup({ ...velocityData, ...velocityData.measurement, lift: record.lift, rpe: record.rpe })
        + velocityComparisonMarkup(profileRecords, savedVbtRecord);
      resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
      button.textContent = "保存しました";
      const idleLabel = mode === "manual-2point" ? "手動2点で確認" : mode === "plate-roi-track" ? "3. プレートを追跡して解析" : "中心点追跡β";
      setTimeout(() => { button.textContent = idleLabel; button.disabled = false; }, 1200);
      renderLibrary();
      renderVbtHistory();
    } catch (error) {
      resultBox.innerHTML = `<p>${escapeHtml(error.message || "速度を計算できませんでした。")}</p>`;
      const guide = dialog.querySelector("[data-vbt-video-guide]");
      if (guide) guide.textContent = error.message || "緑枠と測定範囲を確認してください";
      button.textContent = mode === "manual-2point" ? "手動2点で確認" : mode === "plate-roi-track" ? "3. プレートを追跡して解析" : "中心点追跡β";
      button.disabled = false;
    }
  }



  function saveManualVbt(button) {
    return saveVbtVelocity(button, "manual-2point");
  }

  function syncPlatePreset(select) {
    const dialog = select.closest("dialog");
    const input = dialog?.querySelector("[data-vbt-plate-cm]");
    if (!input || select.value === "custom") return;
    input.value = select.value;
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

  function vbtHistoryMarkup(record, records) {
    const adapted = adaptVbtRecord(record);
    const velocity = adapted.averageVelocity;
    const hasResult = adapted.displayableResult && Number.isFinite(velocity);
    return `
      <article class="vbt-history-card ${adapted.profileEligible ? "" : "warning"}">
        <strong>${escapeHtml(liftLabel(adapted.lift))} ${adapted.weightKg ? `${escapeHtml(formatNumber(adapted.weightKg))}kg` : ""}${adapted.reps ? ` x ${escapeHtml(formatNumber(adapted.reps))}` : ""}${adapted.subjectiveRpe ? ` @${escapeHtml(formatNumber(adapted.subjectiveRpe))}` : ""}</strong>
        <span>${hasResult ? `${adapted.profileEligible ? "プロフィール採用" : "要確認"} / ${escapeHtml(velocity.toFixed(2))} m/s` : "解析結果なし"}</span>
        <small>${escapeHtml(formatDate(adapted.date))} / ${escapeHtml(measurementModeLabel(adapted.measurementMode))}</small>
        ${adapted.warningMessage ? `<p>${escapeHtml(adapted.warningMessage)}</p>` : ""}
        <p>${escapeHtml(getVelocityProfileComment(records, adapted))}</p>
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
    list.innerHTML = records.length ? records.slice(0, 20).map((record) => vbtHistoryMarkup(record, records)).join("") : `<p class="video-empty">まだVBT記録はありません。</p>`;
  }

  function libraryCardMarkup(record) {
    const checked = selectedForCompare.has(record.id);
    const velocity = Number(record.analysis?.velocityData?.measurement?.meanVelocity ?? record.analysis?.velocityData?.meanVelocity);
    const status = getVbtAnalysisStatus(record);
    const measurementMode = record.analysis?.velocityData?.mode || record.analysis?.velocityData?.measurement?.mode;
    return `
      <article class="video-library-card">
        <div class="video-card-head">
          <span>${escapeHtml(record.setType || "自由")}</span>
          <small>${escapeHtml(formatDate(record.date))}</small>
        </div>
        <strong>${escapeHtml(videoTitle(record))}</strong>
        <p class="motion-status ${status.profileEligible ? "done" : status.displayableResult ? "warning" : ""}">VBT: ${Number.isFinite(velocity) ? `${status.profileEligible ? "" : "要確認 / "}${escapeHtml(velocity.toFixed(2))} m/s` : "未計測"}</p>
        ${measurementMode ? `<small>${escapeHtml(measurementModeLabel(measurementMode))}</small>` : ""}
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
    const profileRecords = await loadVbtRecords();
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
        ${record.analysis?.velocityData ? velocityComparisonMarkup(profileRecords, record) : ""}
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
    video?.addEventListener("seeked", () => drawRoiPreview(dialog));
    video?.addEventListener("pause", () => drawRoiPreview(dialog));
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
    const roiNudge = event.target.closest("[data-vbt-roi-nudge]");
    if (roiNudge) return nudgePlateRoi(roiNudge.closest("dialog"), roiNudge.dataset.vbtRoiNudge, 2);
    const roiInit = event.target.closest("[data-vbt-roi-init]");
    if (roiInit) return initializePlateRoi(roiInit);
    const roiTrack = event.target.closest("[data-vbt-roi-track]");
    if (roiTrack) return saveVbtVelocity(roiTrack, "plate-roi-track");
    const vbtPick = event.target.closest("[data-vbt-pick]");
    if (vbtPick) return setVbtPickMode(vbtPick);
    const previewRange = event.target.closest("[data-vbt-preview-range]");
    if (previewRange) return previewTrimRange(previewRange);
    const vbtReset = event.target.closest("[data-vbt-reset]");
    if (vbtReset) return resetVbt(vbtReset);
    const vbtManual = event.target.closest("[data-vbt-manual]");
    if (vbtManual) return saveManualVbt(vbtManual);
    const vbtSave = event.target.closest("[data-vbt-auto]");
    if (vbtSave) return saveVbtVelocity(vbtSave, "center-point-beta");
    const dashboardAction = event.target.closest("[data-vbt-dashboard-action]");
    if (dashboardAction?.dataset.vbtDashboardAction === "measure") return openLatestForMeasurement();
    const vbtFilter = event.target.closest("[data-vbt-filter]");
    if (vbtFilter) {
      document.querySelectorAll("[data-vbt-filter]").forEach((item) => item.classList.toggle("selected", item === vbtFilter));
      return renderVbtHistory(vbtFilter.dataset.vbtFilter);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (event.target.matches("[data-vbt-canvas]")) handleRoiPointerDown(event);
  });
  document.addEventListener("pointermove", (event) => {
    if (event.target.matches("[data-vbt-canvas]")) handleRoiPointerMove(event);
  });
  document.addEventListener("pointerup", (event) => {
    if (!event.target.matches("[data-vbt-canvas]")) return;
    if (!handleRoiPointerUp(event)) handleVbtCanvasPointer(event);
  });
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-vbt-trim-range]")) handleTrimRange(event.target);
    if (event.target.matches("[data-vbt-plate-preset]")) syncPlatePreset(event.target);
  });
  window.addEventListener("beforeunload", clearObjectUrls);

  els.date.value = today();
  updateStorageStatus();
  renderVbtHistory();
  renderLibrary();
  renderVbtDashboard();
})();
