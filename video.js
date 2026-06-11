(() => {
  "use strict";

  const DB_NAME = "platform-buddy-video-db";
  const DB_VERSION = 2;
  const STORE_NAME = "videos";
  const VBT_STORE_NAME = "vbtRecords";
  const MAX_FILE_BYTES = 350 * 1024 * 1024;
  const DEFAULT_PLATE_DIAMETER_CM = 45;
  const VBT_PERSON_SEGMENTATION_ENABLED = true;
  const VBT_TFJS_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js";
  const VBT_BODYPIX_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/body-pix@2.2.1/dist/body-pix.min.js";
  const VBT_DEEP_DETECT_MIN_MS = 30000;
  const VBT_DEEP_RESULT_ANALYSIS_MIN_MS = 12000;
  const VBT_DEEP_DETECT_FRAME_SIZE = 720;
  const VBT_DEEP_DETECT_PERSON_SEGMENT_EVERY = 1;
  const VBT_MARKER_ROI_MIN_PX = 18;
  const VBT_MARKER_ROI_MAX_PX = 54;
  let bodyPixModelPromise = null;

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
    reps: document.querySelector("#videoRepsInput"), // optional: reps are now auto-detected from VBT analysis
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
    const lastRepVelocityRaw = primaryVbtMetric.lastRepConcentricMeanVelocity ?? repVelocities.at(-1)?.meanVelocity;
    const peakVelocityRaw = primaryVbtMetric.bestRepConcentricMeanVelocity ?? record?.peakVelocity;
    const velocityLossPercentRaw = primaryVbtMetric.velocityLossPercent ?? record?.velocityLossPercent;
    const detectedRepsRaw = measurement.detectedReps ?? primaryVbtMetric.repCountDetected;
    const expectedRepsRaw = measurement.expectedReps ?? record?.reps ?? velocityData.reps;
    const lastRepVelocity = hasFiniteNumber(lastRepVelocityRaw) ? Number(lastRepVelocityRaw) : null;
    const peakVelocity = hasFiniteNumber(peakVelocityRaw) ? Number(peakVelocityRaw) : null;
    const velocityLossPercent = hasFiniteNumber(velocityLossPercentRaw) ? Number(velocityLossPercentRaw) : null;
    const detectedReps = hasFiniteNumber(detectedRepsRaw) ? Number(detectedRepsRaw) : null;
    const expectedReps = hasFiniteNumber(expectedRepsRaw) ? Number(expectedRepsRaw) : null;
    return {
      ...record,
      videoId: record?.videoId || (record?.analysis?.velocityData ? record.id : null),
      lift: record?.lift || velocityData.lift || "OTHER",
      liftLabel: liftLabel(record?.lift || velocityData.lift),
      weightKg: Number(record?.weightKg ?? record?.weight ?? velocityData.weight) || 0,
      reps: Number(measurement.detectedReps ?? primaryVbtMetric.repCountDetected ?? record?.reps ?? velocityData.reps) || 0,
      subjectiveRpe: hasFiniteNumber(record?.subjectiveRpe ?? record?.rpe ?? velocityData.rpe) ? Number(record?.subjectiveRpe ?? record?.rpe ?? velocityData.rpe) : null,
      tag: record?.tag || record?.setType || null,
      averageVelocity: Number.isFinite(profileVelocity) ? profileVelocity : null,
      setAverageVelocity: Number.isFinite(setAverageVelocity) ? setAverageVelocity : null,
      lastRepVelocity,
      peakVelocity,
      velocityLossPercent,
      detectedReps: detectedReps !== null && detectedReps >= 0 ? detectedReps : null,
      expectedReps: expectedReps !== null && expectedReps > 0 ? expectedReps : null,
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

  function movementSegmentsFromPath(path) {
    if (!Array.isArray(path) || path.length < 4) return [];
    const yValues = path.map((point) => Number(point.y)).filter(Number.isFinite);
    const yRange = yValues.length ? Math.max(...yValues) - Math.min(...yValues) : 0;
    const jitter = Math.max(0.45, yRange * 0.006);
    const minTravel = Math.max(3, yRange * 0.10);
    const minDuration = 0.12;
    const maxStillGap = 2;
    const segments = [];
    let current = null;
    let stillCount = 0;

    const closeCurrent = (endIndex) => {
      if (!current) return;
      const safeEnd = Math.max(current.startIndex + 1, Math.min(endIndex, path.length - 1));
      const travel = Math.abs(Number(path[safeEnd].y) - Number(path[current.startIndex].y));
      const duration = Number(path[safeEnd].time) - Number(path[current.startIndex].time);
      if (travel >= minTravel && duration >= minDuration) {
        segments.push({
          ...current,
          endIndex: safeEnd,
          travel,
          duration,
          startTime: path[current.startIndex].time,
          endTime: path[safeEnd].time
        });
      }
      current = null;
      stillCount = 0;
    };

    for (let index = 1; index < path.length; index += 1) {
      const delta = Number(path[index].y) - Number(path[index - 1].y);
      const direction = Math.abs(delta) <= jitter ? 0 : Math.sign(delta);
      if (!direction) {
        if (current) {
          stillCount += 1;
          if (stillCount > maxStillGap) closeCurrent(index - stillCount);
        }
        continue;
      }
      if (!current) {
        current = { direction, startIndex: Math.max(0, index - 1) };
        stillCount = 0;
        continue;
      }
      if (direction !== current.direction) {
        closeCurrent(index - 1);
        current = { direction, startIndex: Math.max(0, index - 1) };
      }
      stillCount = 0;
    }
    closeCurrent(path.length - 1);
    return segments;
  }

  function detectRepPhasesByTurns(path, lift, expectedReps) {
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

  function detectRepPhases(path, lift, expectedReps) {
    const smoothed = smoothTrackPath(path);
    if (smoothed.length < 5) return [];
    const guide = getVbtStartGuide(lift);
    const pattern = guide.movementPattern === "auto" ? "top-bottom-top" : guide.movementPattern;
    const segments = movementSegmentsFromPath(smoothed);
    const phases = [];
    const limit = Number(expectedReps) > 0 ? Number(expectedReps) : Infinity;
    const yValues = smoothed.map((point) => Number(point.y)).filter(Number.isFinite);
    const yRange = yValues.length ? Math.max(...yValues) - Math.min(...yValues) : 0;
    const minPrimaryTravel = Math.max(8, yRange * 0.24);
    const minReturnTravel = Math.max(6, yRange * 0.18);
    const minRepDuration = lift === "DL" ? 0.22 : 0.18;
    const floorCooldownSeconds = lift === "DL" ? 0.75 : 0.35;

    const segmentTravel = (segment) => Number(segment?.travel) || Math.abs(Number(smoothed[segment?.endIndex]?.y) - Number(smoothed[segment?.startIndex]?.y));
    const segmentDuration = (segment) => Number(segment?.duration) || (Number(smoothed[segment?.endIndex]?.time) - Number(smoothed[segment?.startIndex]?.time));
    const segmentEndTime = (segment) => Number(segment?.endTime ?? smoothed[segment?.endIndex]?.time);
    const segmentStartTime = (segment) => Number(segment?.startTime ?? smoothed[segment?.startIndex]?.time);

    if (pattern === "bottom-top-bottom") {
      let lastFloorReturnTime = null;
      let lastConcentricTravel = null;
      for (let index = 0; index < segments.length && phases.length < limit; index += 1) {
        const concentric = segments[index];
        if (!concentric || concentric.direction !== -1) continue;
        const conTravel = segmentTravel(concentric);
        const conDuration = segmentDuration(concentric);
        const startsTooSoonAfterFloor = Number.isFinite(lastFloorReturnTime) && (segmentStartTime(concentric) - lastFloorReturnTime) < floorCooldownSeconds;
        const bounceLike = startsTooSoonAfterFloor && conTravel < Math.max(minPrimaryTravel * 1.15, (lastConcentricTravel || minPrimaryTravel) * 0.52);
        if (conTravel < minPrimaryTravel || conDuration < minRepDuration || bounceLike) continue;

        const eccentricIndex = segments.slice(index + 1).findIndex((segment) => segment.direction === 1 && segmentTravel(segment) >= minReturnTravel);
        const eccentric = eccentricIndex >= 0 ? segments[index + 1 + eccentricIndex] : null;
        phases.push({
          repIndex: phases.length + 1,
          concentric: { startIndex: concentric.startIndex, endIndex: concentric.endIndex },
          eccentric: eccentric ? { startIndex: eccentric.startIndex, endIndex: eccentric.endIndex } : null,
          restBeforeSeconds: phases.length ? Math.max(0, segmentStartTime(concentric) - Number(smoothed[phases.at(-1).eccentric?.endIndex ?? phases.at(-1).concentric.endIndex]?.time)) : null
        });
        lastConcentricTravel = conTravel;
        if (eccentric) {
          lastFloorReturnTime = segmentEndTime(eccentric);
          index = segments.findIndex((segment) => segment.startIndex === eccentric.startIndex);
        } else {
          lastFloorReturnTime = segmentEndTime(concentric);
        }
      }
    } else {
      for (let index = 0; index < segments.length && phases.length < limit; index += 1) {
        const eccentric = segments[index];
        if (!eccentric || eccentric.direction !== 1) continue;
        if (segmentTravel(eccentric) < minReturnTravel || segmentDuration(eccentric) < 0.18) continue;
        const concentric = segments.slice(index + 1).find((segment) => segment.direction === -1 && segmentTravel(segment) >= minPrimaryTravel && segmentDuration(segment) >= minRepDuration) || null;
        if (!concentric) continue;
        phases.push({
          repIndex: phases.length + 1,
          eccentric: { startIndex: eccentric.startIndex, endIndex: eccentric.endIndex },
          concentric: { startIndex: concentric.startIndex, endIndex: concentric.endIndex },
          restBeforeSeconds: phases.length ? Math.max(0, segmentStartTime(eccentric) - Number(smoothed[phases.at(-1).concentric.endIndex].time)) : null
        });
        index = segments.findIndex((segment) => segment.startIndex === concentric.startIndex);
      }
    }

    return phases.length ? phases : detectRepPhasesByTurns(path, lift, expectedReps);
  }

  function getTrimLengthWarning(lift, reps, durationSeconds) {
    const expected = Number(reps);
    const max = Number.isFinite(expected) && expected > 0 ? expected * 9 + 6 : 35;
    if (Number(durationSeconds) > max) {
      return "解析範囲が長めです。セット前後の歩きや待機を除くと精度が上がります。";
    }
    return null;
  }

  function getRepQuality(metric, context = {}) {
    const conMV = Number(metric.concentric?.meanVelocity);
    const conPV = Number(metric.concentric?.peakVelocity);
    const conDuration = Number(metric.concentric?.duration);
    const staticTrimmed = Number(metric.concentric?.trimmedStaticTime || 0);
    const rom = Number(metric.totalRomMeters);
    const expectedReps = Number(context.expectedReps);
    const detectedReps = Number(context.detectedReps);
    const trackingConfidence = context.trackingConfidence || "unknown";
    const warnings = [];
    const notes = [];
    const mvPvRatio = Number.isFinite(conMV) && Number.isFinite(conPV) && conPV > 0 ? conMV / conPV : null;
    const romTooShort = Number.isFinite(rom) && rom < 0.08;
    const romTooLong = Number.isFinite(rom) && rom > 1.20;
    const durationVeryLong = Number.isFinite(conDuration) && conDuration > 10;
    const durationLong = Number.isFinite(conDuration) && conDuration > 7.5;
    const pvGapExtreme = Number.isFinite(mvPvRatio) && mvPvRatio < 0.10;
    const pvGapLarge = Number.isFinite(mvPvRatio) && mvPvRatio < 0.15;
    const repMismatch = Number.isFinite(expectedReps) && Number.isFinite(detectedReps) && expectedReps > 0 && detectedReps !== expectedReps;

    if (romTooShort) warnings.push("ROMが短すぎます。プレート追跡が外れている可能性があります。");
    if (romTooLong) warnings.push("ROMが大きすぎます。プレート径またはスケールを確認してください。");
    if (pvGapExtreme && (durationVeryLong || repMismatch || trackingConfidence === "low")) {
      warnings.push("挙上区間の検出確認が必要です。");
    } else if (pvGapLarge && (durationLong || trackingConfidence === "middle")) {
      notes.push("挙上PVが高めです。参考値として確認してください。");
    }
    if (durationVeryLong && (pvGapLarge || repMismatch || trackingConfidence === "low")) {
      warnings.push("挙上時間が長すぎます。区間に待機が混ざった可能性があります。");
    } else if (durationLong) {
      notes.push("挙上時間が長めです。重いセットや粘りのあるレップでは正常なことがあります。");
    }
    if (staticTrimmed > 0.75) {
      notes.push(`トップ/ボトムの待機を${staticTrimmed.toFixed(1)}秒ほど除外して速度を計算しました。`);
    }

    const confidence = warnings.length ? "low" : notes.length ? "middle" : "high";
    return {
      mvPvRatio,
      durationOk: !durationVeryLong,
      romOk: !romTooShort && !romTooLong,
      directionOk: Boolean(metric.concentric && metric.eccentric),
      confidence,
      warning: warnings.join(" ") || null,
      note: notes.join(" ") || null
    };
  }

  function robustPeakVelocity(velocities) {
    const clean = (velocities || [])
      .map(Number)
      .filter(Number.isFinite)
      .filter((value) => value >= 0);
    if (!clean.length) return null;
    clean.sort((a, b) => a - b);
    const index = Math.min(clean.length - 1, Math.max(0, Math.floor(clean.length * 0.90)));
    return clean[index];
  }

  function trimPhaseToMotionWindow(segment, phaseKind = "concentric") {
    if (!Array.isArray(segment) || segment.length < 3) {
      return { segment: segment || [], trimmed: false, rawDuration: null };
    }
    const startY = Number(segment[0].y);
    const endY = Number(segment.at(-1).y);
    const totalDisplacement = Math.abs(endY - startY);
    const rawDuration = Number(segment.at(-1).time) - Number(segment[0].time);
    if (!Number.isFinite(totalDisplacement) || totalDisplacement < 1.5 || !Number.isFinite(rawDuration)) {
      return { segment, trimmed: false, rawDuration };
    }

    // The phase endpoints from top/bottom turn detection often include top breathing,
    // bottom pauses, or re-bracing time. Velocity should use only the movement window.
    const lowerFraction = phaseKind === "concentric" ? 0.06 : 0.04;
    const upperFraction = phaseKind === "concentric" ? 0.94 : 0.96;
    const minMotionPixels = Math.max(1.2, totalDisplacement * lowerFraction);
    const maxMotionPixels = Math.max(minMotionPixels, totalDisplacement * upperFraction);

    let startIndex = 0;
    let endIndex = segment.length - 1;

    for (let index = 0; index < segment.length; index += 1) {
      if (Math.abs(Number(segment[index].y) - startY) >= minMotionPixels) {
        startIndex = Math.max(0, index - 1);
        break;
      }
    }

    for (let index = startIndex + 1; index < segment.length; index += 1) {
      if (Math.abs(Number(segment[index].y) - startY) >= maxMotionPixels) {
        endIndex = index;
        break;
      }
    }

    if (endIndex <= startIndex) {
      return { segment, trimmed: false, rawDuration };
    }

    const trimmed = segment.slice(startIndex, endIndex + 1);
    return {
      segment: trimmed.length >= 2 ? trimmed : segment,
      trimmed: startIndex > 0 || endIndex < segment.length - 1,
      rawDuration,
      trimStartOffset: Number(segment[startIndex]?.time) - Number(segment[0].time),
      trimEndOffset: Number(segment.at(-1)?.time) - Number(segment[endIndex]?.time)
    };
  }

  function phaseVelocityMetric(path, phase, metersPerPixel, phaseKind = "concentric") {
    if (!phase || phase.endIndex <= phase.startIndex) return null;
    const rawSegment = path.slice(phase.startIndex, phase.endIndex + 1);
    const motionWindow = trimPhaseToMotionWindow(rawSegment, phaseKind);
    const segment = motionWindow.segment;
    if (!segment || segment.length < 2) return null;
    const duration = segment.at(-1).time - segment[0].time;
    const distanceMeters = Math.abs(segment.at(-1).y - segment[0].y) * metersPerPixel;
    const velocities = segment.slice(1).map((point, index) => {
      const deltaTime = point.time - segment[index].time;
      return deltaTime > 0 ? Math.abs(point.y - segment[index].y) * metersPerPixel / deltaTime : null;
    }).filter(Number.isFinite);
    return {
      startTime: segment[0].time,
      endTime: segment.at(-1).time,
      rawStartTime: rawSegment[0].time,
      rawEndTime: rawSegment.at(-1).time,
      duration,
      rawDuration: motionWindow.rawDuration,
      trimmedStaticTime: Math.max(0, Number(motionWindow.rawDuration || 0) - duration) || null,
      distanceMeters,
      meanVelocity: duration > 0 ? distanceMeters / duration : null,
      peakVelocity: robustPeakVelocity(velocities),
      motionWindowTrimmed: Boolean(motionWindow.trimmed)
    };
  }

  function calculateRepVelocityMetrics(repPhases, calibration = {}) {
    const path = calibration.path || [];
    const metersPerPixel = Number(calibration.metersPerPixel);
    return repPhases.map((phase) => {
      const eccentric = phaseVelocityMetric(path, phase.eccentric, metersPerPixel, "eccentric");
      const concentric = phaseVelocityMetric(path, phase.concentric, metersPerPixel, "concentric");
      const totalRomMeters = Math.max(eccentric?.distanceMeters || 0, concentric?.distanceMeters || 0);
      const metric = {
        repIndex: phase.repIndex,
        eccentric,
        concentric,
        totalRomMeters,
        pauseDuration: eccentric && concentric ? (Math.max(0, (concentric.startTime || 0) - (eccentric.endTime || 0)) || null) : null,
        restBeforeSeconds: phase.restBeforeSeconds || null,
        confidence: "high",
        warning: null
      };
      const repQuality = getRepQuality(metric, {
        lift: calibration.lift,
        expectedReps: calibration.expectedReps,
        detectedReps: repPhases.length,
        trackingConfidence: calibration.trackingConfidence
      });
      return {
        ...metric,
        confidence: repQuality.confidence,
        warning: repQuality.warning,
        qualityConfidence: repQuality.confidence,
        qualityWarning: repQuality.warning,
        qualityNote: repQuality.note,
        repQuality
      };
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
    const warning = metrics.find((metric) => metric.qualityWarning || metric.warning);
    return warning?.qualityWarning || warning?.warning || null;
  }

  function getRepQualityLabel(metric, isLast) {
    if (metric.qualityConfidence === "low" || metric.qualityWarning) return "区間確認";
    if (metric.qualityConfidence === "middle" || metric.qualityNote || metric.repQuality?.note) return "参考";
    if (isLast) return "Last";
    return "OK";
  }

  function renderRepQualityDetails(metrics) {
    const items = (metrics || []).filter((metric) => metric.qualityWarning || metric.qualityNote || metric.repQuality?.note);
    if (!items.length) return "";
    return `
      <details class="vbt-quality-details">
        <summary>区間検出メモ</summary>
        <ul>
          ${items.map((metric) => `
            <li>
              <strong>Rep ${escapeHtml(metric.repIndex)}</strong>
              ${metric.qualityWarning ? `<span>${escapeHtml(metric.qualityWarning)}</span>` : ""}
              ${metric.qualityNote || metric.repQuality?.note ? `<span>${escapeHtml(metric.qualityNote || metric.repQuality.note)}</span>` : ""}
            </li>
          `).join("")}
        </ul>
      </details>
    `;
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
              <td>${escapeHtml(getRepQualityLabel(metric, metric.repIndex === metrics.length))}</td>
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
    if (mode === "marker-assist-timeseries" || mode === "marker-assist") return "マーカー補助（非推奨）";
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
    if (!state.plateRoi && !(state.trackingMode === "marker-assist" && state.markerRoi)) throw new Error("緑枠をプレート外周に合わせてください。自動検出が不安定な場合は、プレート付近を1回タップして補助してください。");
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const savedEnd = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(video.duration);
    const end = savedEnd > start + 0.2 ? savedEnd : Number(video.duration);
    if (!Number.isFinite(end) || end <= start + 0.2) throw new Error("測定範囲を少し広げてください。");
    const plateDiameterCm = readPlateDiameterCm(dialog);
    const markerMode = (state.trackingMode === "marker-assist" || state.trackingMode === "marker-assist-timeseries") && state.markerRoi;
    const plateRoi = state.plateRoi
      ? clampPlateRoi(state.plateRoi, video.videoWidth, video.videoHeight)
      : roiFromAnchorPoint(video, state.markerPoint || roiCenter(state.markerRoi));
    const trackingRoi = markerMode
      ? clampPlateRoi(state.markerRoi, video.videoWidth, video.videoHeight)
      : plateRoi;
    const aspectWarning = markerMode ? null : roiAspectWarning(plateRoi);

    await seekVideo(video, start);
    const first = frameCanvas(video, 320);
    const scale = first.scale;
    const scaledRoi = {
      x: trackingRoi.x * scale,
      y: trackingRoi.y * scale,
      width: trackingRoi.width * scale,
      height: trackingRoi.height * scale
    };
    const referenceTemplate = sampleGrayRoi(grayFrame(first.ctx), scaledRoi);
    if (!referenceTemplate) throw new Error("緑枠が動画端に近すぎます。少し内側へ移動してください。");

    const sampleLimit = getVbtTrackingSampleLimit();
    const sampleCount = clamp(Math.round((end - start) * 24), 40, sampleLimit);
    const rawPath = [];
    let currentRoi = { ...scaledRoi };
    const searchRadiusX = markerMode ? Math.max(20, scaledRoi.width * 2.8) : Math.max(12, scaledRoi.width * 0.75);
    const searchRadiusY = markerMode ? Math.max(28, scaledRoi.height * 4.2) : Math.max(18, scaledRoi.height * 1.25);
    const step = markerMode ? clamp(Math.round(Math.min(scaledRoi.width, scaledRoi.height) * 0.18), 2, 6) : clamp(Math.round(Math.min(scaledRoi.width, scaledRoi.height) * 0.12), 3, 8);

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

    const markerDiameterEstimate = markerMode && state.markerPoint ? estimatePlateDiameterPixels(video, state.markerPoint) : null;
    const plateDiameterPixels = markerMode
      ? (hasFiniteNumber(markerDiameterEstimate) ? Number(markerDiameterEstimate) : Math.max(plateRoi.width, plateRoi.height))
      : Math.max(plateRoi.width, plateRoi.height);
    const path = smoothTrackPath(smoothTrackingPath(rawPath, plateDiameterPixels));
    const verticalTravelPixels = Math.max(...path.map((point) => point.y)) - Math.min(...path.map((point) => point.y));
    const pathTravelPixels = path.slice(1).reduce((sum, point, index) => sum + pixelDistance(path[index], point), 0);
    if (verticalTravelPixels < Math.max(3, plateDiameterPixels * 0.035)) {
      throw new Error("プレートの上下移動を捉えられませんでした。緑枠と測定範囲を確認してください。");
    }
    const metersPerPixel = (plateDiameterCm / 100) / plateDiameterPixels;
    const repPhases = detectRepPhases(path, record.lift, null);
    const repMetrics = calculateRepVelocityMetrics(repPhases, { path, metersPerPixel, lift: record.lift, expectedReps: null });
    const detectedRepCount = repMetrics.length;
    const primaryVbtMetric = getPrimaryVbtMetric(repMetrics);
    const repWarning = validateRepDetection(repMetrics, null);
    const concentricVelocities = repMetrics.map((metric) => metric.concentric?.meanVelocity).filter(Number.isFinite);
    const distanceMeters = repMetrics.length
      ? repMetrics.reduce((sum, metric) => sum + metric.totalRomMeters, 0) / repMetrics.length
      : verticalTravelPixels * metersPerPixel;
    const durationSeconds = end - start;
    const meanVelocity = concentricVelocities.length
      ? concentricVelocities.reduce((sum, velocity) => sum + velocity, 0) / concentricVelocities.length
      : distanceMeters / durationSeconds;
    const decisionVelocity = primaryVbtMetric.lastRepConcentricMeanVelocity;
    const buddyVelocity = hasFiniteNumber(decisionVelocity) ? Number(decisionVelocity) : meanVelocity;
    const trackingConfidence = autoTrackingConfidence({
      path,
      plateDiameterPixels,
      verticalTravelPixels,
      pathTravelPixels,
      scores: rawPath.map((point) => point.score),
      expectedReps: detectedRepCount || 1
    });
    const trackingWarning = [
      aspectWarning,
      trackingConfidence === "low" ? "追跡の信頼度が低めです。手動2点測定でも確認してください。" : null,
      repWarning || null,
      getTrimLengthWarning(record.lift, detectedRepCount || null, durationSeconds)
    ].filter(Boolean).join(" ");

    return {
      mode: markerMode ? "marker-assist-timeseries" : "plate-roi-timeseries",
      analysisMode: "deep-precision-standard",
      trackingMode: markerMode ? "marker-assist-timeseries" : "plate-roi-timeseries",
      trackingConfidence,
      trackingWarning: trackingWarning || null,
      lift: record.lift,
      weight: Number(record.weight) || null,
      reps: detectedRepCount || Number(record.reps) || null,
      rpe: Number(record.rpe) || null,
      calibration: {
        plateDiameterCm,
        plateDiameterPixels,
        metersPerPixel,
        plateRoi,
        markerRoi: markerMode ? trackingRoi : null,
        markerPoint: markerMode ? (state.markerPoint || roiCenter(trackingRoi)) : null,
        markerAssistUsed: Boolean(markerMode),
        roiWidthPixels: plateRoi.width,
        roiHeightPixels: plateRoi.height,
        roiAspectRatio: plateRoi.width / plateRoi.height
      },
      measurement: {
        mode: markerMode ? "marker-assist-timeseries" : "plate-roi-timeseries",
        analysisMode: "deep-precision-standard",
        lift: record.lift,
        expectedReps: null,
        detectedReps: detectedRepCount,
        startRoi: plateRoi,
        markerRoi: markerMode ? trackingRoi : null,
        markerAssistUsed: Boolean(markerMode),
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
      buddyComment: vbtVelocityComment(record.lift, buddyVelocity),
      rpeComment: vbtRpeComment(record.lift, buddyVelocity, record.rpe),
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

  function getVbtTrackingSampleLimit() {
    const narrowScreen = typeof window !== "undefined" && window.matchMedia?.("(max-width: 760px)")?.matches;
    const touchDevice = typeof navigator !== "undefined" && Number(navigator.maxTouchPoints) > 0;
    const compactTouchDevice = touchDevice && typeof window !== "undefined" && Number(window.innerWidth) <= 1024;
    return narrowScreen || compactTouchDevice ? 220 : 420;
  }

  function seekVideo(video, time, timeoutMs = 2500) {
    return new Promise((resolve, reject) => {
      if (!video) return reject(new Error("動画を読み込めませんでした。"));
      const target = clamp(Number(time) || 0, 0, Number(video.duration) || 0);
      let settled = false;
      let timer = null;
      const cleanup = () => {
        video.removeEventListener("seeked", done);
        video.removeEventListener("error", failed);
        if (timer) clearTimeout(timer);
      };
      const done = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const failed = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("動画フレームを読み込めませんでした。動画形式または測定範囲を確認してください。"));
      };
      video.addEventListener("seeked", done, { once: true });
      video.addEventListener("error", failed, { once: true });
      timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error("動画フレームの読み込みに時間がかかっています。測定範囲を短くして、もう一度試してください。"));
      }, timeoutMs);
      try {
        video.currentTime = target;
      } catch {
        failed();
        return;
      }
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
    const lastVelocityRaw = primary.lastRepConcentricMeanVelocity;
    const setAverageRaw = measurement.meanVelocity ?? data.meanVelocity;
    const bestVelocityRaw = primary.bestRepConcentricMeanVelocity;
    const velocityLossRaw = primary.velocityLossPercent;
    const detectedRepsRaw = measurement.detectedReps ?? primary.repCountDetected;
    const expectedRepsRaw = measurement.expectedReps ?? data.reps;
    const lastVelocity = hasFiniteNumber(lastVelocityRaw) ? Number(lastVelocityRaw) : null;
    const setAverage = hasFiniteNumber(setAverageRaw) ? Number(setAverageRaw) : null;
    const heroVelocity = lastVelocity !== null ? lastVelocity : setAverage;
    const bestVelocity = hasFiniteNumber(bestVelocityRaw) ? Number(bestVelocityRaw) : null;
    const velocityLoss = hasFiniteNumber(velocityLossRaw) ? Number(velocityLossRaw) : null;
    const detectedReps = hasFiniteNumber(detectedRepsRaw) ? Number(detectedRepsRaw) : null;
    const expectedReps = hasFiniteNumber(expectedRepsRaw) ? Number(expectedRepsRaw) : null;
    const repDisplay = detectedReps !== null
      ? `${detectedReps}${expectedReps !== null ? `/${expectedReps}` : ""}`
      : expectedReps !== null ? `--/${expectedReps}` : "--";
    return `
      <section class="vbt-result-hero ${status.analysisStatus}">
        <div>
          <span class="vbt-result-kicker">${status.profileEligible ? "VBT RESULT" : "VBT RESULT / 要確認"}</span>
          <strong class="vbt-result-main">${heroVelocity !== null ? heroVelocity.toFixed(2) : "--"}<small>m/s</small></strong>
          <p>${lastVelocity !== null ? "最終レップ挙上平均速度" : "セット平均挙上速度"}</p>
        </div>
        <div class="vbt-result-summary-grid">
          <span><small>セット平均</small><strong>${setAverage !== null ? `${setAverage.toFixed(2)}m/s` : "--"}</strong></span>
          <span><small>最速レップ</small><strong>${bestVelocity !== null ? `${bestVelocity.toFixed(2)}m/s` : "--"}</strong></span>
          <span><small>速度低下</small><strong>${velocityLoss !== null ? `${velocityLoss.toFixed(0)}%` : "--"}</strong></span>
          <span><small>検出/入力レップ</small><strong>${repDisplay}</strong></span>
        </div>
        ${status.warningMessage ? `<p class="vbt-result-hero-warning">要確認：区間検出を確認してください</p>` : ""}
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
          const qualityLabel = getRepQualityLabel(metric, isLast);
          return `
            <article class="vbt-rep-card ${isLast ? "last" : ""}">
              <div class="vbt-rep-card-head">
                <strong>Rep ${escapeHtml(metric.repIndex || index + 1)}</strong>
                <span class="${qualityLabel === "区間確認" ? "warning" : ""}">${escapeHtml(qualityLabel)}</span>
              </div>
              <div class="vbt-rep-card-grid">
                <span><small>下降平均</small><strong>${Number.isFinite(Number(eccentric.meanVelocity)) ? `${Number(eccentric.meanVelocity).toFixed(2)}m/s` : "--"}</strong></span>
                <span><small>挙上平均</small><strong>${Number.isFinite(Number(concentric.meanVelocity)) ? `${Number(concentric.meanVelocity).toFixed(2)}m/s` : "--"}</strong></span>
                <span><small>挙上ピーク</small><strong>${Number.isFinite(Number(concentric.peakVelocity)) ? `${Number(concentric.peakVelocity).toFixed(2)}m/s` : "--"}</strong></span>
                <span><small>ROM</small><strong>${Number.isFinite(rom) ? `${Math.round(rom * 100)}cm` : "--"}</strong></span>
              </div>
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
        ${renderRepQualityDetails(repMetrics)}
      </section>
    `;
  }

  function renderRepTimeline(metrics, measurement) {
    const start = Number(measurement.startTime ?? measurement.trim?.start);
    const end = Number(measurement.endTime ?? measurement.trim?.end);
    const duration = end - start;
    if (!Number.isFinite(duration) || duration <= 0) return "";
    const movementBlocks = metrics.flatMap((metric) => [
      metric.eccentric ? { type: "eccentric", rep: metric.repIndex, start: metric.eccentric.startTime, end: metric.eccentric.endTime } : null,
      metric.concentric ? { type: "concentric", rep: metric.repIndex, start: metric.concentric.startTime, end: metric.concentric.endTime } : null
    ]).filter(Boolean).sort((a, b) => a.start - b.start);

    const waitBlocks = [];
    let cursor = start;
    movementBlocks.forEach((block) => {
      if (block.start - cursor >= Math.max(0.35, duration * 0.015)) {
        waitBlocks.push({ type: "wait", start: cursor, end: block.start });
      }
      cursor = Math.max(cursor, block.end);
    });
    if (end - cursor >= Math.max(0.35, duration * 0.015)) waitBlocks.push({ type: "wait", start: cursor, end });

    const blocks = [...waitBlocks, ...movementBlocks].map((block) => {
      const left = clamp(((block.start - start) / duration) * 100, 0, 100);
      const width = clamp(((block.end - block.start) / duration) * 100, 0.7, 100 - left);
      if (block.type === "wait") return `<span class="wait" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%" title="待機・呼吸・判定外"></span>`;
      return `<span class="${block.type}" style="left:${left.toFixed(2)}%;width:${width.toFixed(2)}%" title="Rep ${escapeHtml(block.rep)} ${block.type === "eccentric" ? "下降" : "挙上"}">R${escapeHtml(block.rep)} ${block.type === "eccentric" ? "↓" : "↑"}</span>`;
    }).join("");
    return `
      <div class="vbt-rep-timeline-wrap">
        <div class="vbt-rep-timeline">${blocks}</div>
        <div class="vbt-timeline-legend"><span>下降</span><span>挙上</span><span>待機・呼吸</span></div>
      </div>
    `;
  }

  function renderVelocityLossPanel(data) {
    const measurement = data.measurement || data;
    const metrics = measurement.repMetrics || data.repMetrics || [];
    const primary = measurement.primaryVbtMetric || data.primaryVbtMetric || getPrimaryVbtMetric(metrics);
    const values = metrics.map((metric) => Number(metric.concentric?.meanVelocity)).filter(Number.isFinite);
    const best = values.length ? Math.max(...values) : null;
    if (!Number.isFinite(best) || best <= 0) return "";
    return `
      <section class="vbt-velocity-loss-panel">
        <div class="video-check-head">
          <strong>速度損失</strong>
          <small>${Number.isFinite(Number(primary.velocityLossPercent)) ? `${Number(primary.velocityLossPercent).toFixed(0)}%` : "算出中"}</small>
        </div>
        <div class="vbt-loss-bars">
          ${values.map((value, index) => {
            const percent = clamp((value / best) * 100, 4, 100);
            const loss = ((best - value) / best) * 100;
            return `<div><span>R${index + 1}</span><i><b style="width:${percent.toFixed(1)}%"></b></i><strong>${value.toFixed(2)}<small>m/s</small></strong><em>${loss > 0.5 ? `-${loss.toFixed(0)}%` : "BEST"}</em></div>`;
          }).join("")}
        </div>
        <p>最速レップからの低下を表示。数値だけでなくRPEと軌道も合わせて判断します。</p>
      </section>
    `;
  }

  function vbtCompetitionAdvice(data, status) {
    const measurement = data.measurement || data;
    const metrics = measurement.repMetrics || data.repMetrics || [];
    const primary = measurement.primaryVbtMetric || data.primaryVbtMetric || getPrimaryVbtMetric(metrics);
    const loss = Number(primary.velocityLossPercent);
    if (!status.profileEligible) return "区間検出を確認してから次セットを判断しよう。怪しい数値では重量を動かさない。";
    if (Number.isFinite(loss) && loss >= 30) {
      if (data.lift === "BP") return "後半で失速しています。次セットは同重量以下で、胸上からロックアウトの軌道を優先。";
      if (data.lift === "DL") return "床離れからの出力が落ちています。次セットは重量を上げず、セットアップを再現しよう。";
      return "最終レップの失速が大きめです。次セットは同重量維持か、フォーム再現を優先。";
    }
    if (Number.isFinite(loss) && loss >= 15) return "適度な速度低下です。次セットは予定RPEを守り、同重量を軸に判断しよう。";
    return "速度は安定しています。余裕があっても、次セットは予定RPEとフォームを優先しよう。";
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
    const primary = measurement.primaryVbtMetric || data.primaryVbtMetric || {};
    const lastRepVelocity = primary.lastRepConcentricMeanVelocity;
    const decisionVelocity = hasFiniteNumber(lastRepVelocity) ? Number(lastRepVelocity) : meanVelocity;
    return `
      ${renderVbtResultHero(data, status)}
      <section class="vbt-buddy-judgement">
        <span>Buddy判定</span>
        <strong>${escapeHtml(vbtVelocityComment(data.lift, decisionVelocity))}</strong>
        <p>${escapeHtml(vbtRpeComment(data.lift, decisionVelocity, data.rpe))}</p>
        ${!status.profileEligible ? `<p class="vbt-result-warning">結果は保存しました。個人速度プロフィールには含めず、要確認として扱います。</p>` : ""}
        <p class="vbt-next-set-advice">${escapeHtml(vbtCompetitionAdvice(data, status))}</p>
      </section>
      ${renderVelocityLossPanel(data)}
      ${renderRepVelocityDisplay(data)}
      ${renderVbtMeasurementDetails(data)}
      <p class="vbt-profile-note">下降速度はテンポ確認用。RPEプロフィールには最終レップの挙上平均速度を使います。</p>
    `;
  }


  function vbtWizardInitialStep(record) {
    const velocityData = record.analysis?.velocityData || {};
    const measurement = velocityData.measurement || velocityData;
    const hasResult = Boolean(velocityData.meanVelocity || velocityData.primaryVbtMetric || measurement.repMetrics?.length);
    return hasResult ? "result" : "trim";
  }

  function vbtWizardStepLabel(step) {
    return {
      trim: "動画をトリミング",
      "auto-detect-loading": "プレートを検出中",
      "anchor-assist": "プレート付近をタップ",
      "auto-detect-confirm": "プレートを確認",
      "manual-plate": "プレートを指定",
      "set-info": "セット情報",
      analyzing: "解析中",
      result: "VBT結果"
    }[step] || "VBT";
  }

  function updateVbtWizardChrome(dialog) {
    const state = vbtState(dialog);
    const step = state.wizardStep || "trim";
    dialog?.querySelectorAll("[data-vbt-step]").forEach((screen) => {
      screen.classList.toggle("active", screen.dataset.vbtStep === step);
    });
    dialog?.querySelectorAll("[data-vbt-step-dot]").forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.vbtStepDot === step);
      dot.classList.toggle("done", vbtWizardStepOrder(dot.dataset.vbtStepDot) < vbtWizardStepOrder(step));
    });
    const title = dialog?.querySelector("[data-vbt-wizard-title]");
    if (title) title.textContent = vbtWizardStepLabel(step);
    const guide = dialog?.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = vbtWizardStepLabel(step);
  }

  function vbtWizardStepOrder(step) {
    const order = ["trim", "auto-detect-loading", "anchor-assist", "auto-detect-confirm", "manual-plate", "set-info", "analyzing", "result"];
    const index = order.indexOf(step);
    return index >= 0 ? index : 0;
  }

  function setVbtWizardStep(dialog, step) {
    if (!dialog) return;
    setVbtState(dialog, { wizardStep: step });
    updateVbtWizardChrome(dialog);
    if (step === "manual-plate") {
      const video = dialog.querySelector("video");
      const state = vbtState(dialog);
      if (video?.videoWidth && video?.videoHeight && !state.plateRoi) {
        setVbtState(dialog, { plateRoi: defaultPlateRoi(video), trackingMode: "plate-roi-track" });
      }
      dialog.querySelector("[data-vbt-canvas]")?.classList.add("active", "roi-active");
      drawVbtOverlay(dialog);
      drawRoiPreview(dialog);
    }
    if (step === "anchor-assist") {
      setVbtState(dialog, { anchorAssistMode: true, anchorAssistType: "plate" });
      dialog.querySelector("[data-vbt-canvas]")?.classList.add("active", "roi-active", "anchor-active");
      drawVbtOverlay(dialog);
    }
    if (step === "auto-detect-confirm") {
      setVbtState(dialog, { anchorAssistMode: false, anchorAssistType: null });
      dialog.querySelector("[data-vbt-canvas]")?.classList.add("active", "roi-active");
      renderAutoCandidateList(dialog);
      drawVbtOverlay(dialog);
      drawRoiPreview(dialog);
    }
    const active = dialog.querySelector(`[data-vbt-step="${step}"]`);
    active?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getTrimDurationWarning(dialog, record) {
    const state = vbtState(dialog);
    const reps = Math.max(1, Number(record?.reps) || 1);
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(dialog?.querySelector("video")?.duration);
    const duration = end - start;
    const max = reps * 7 + 4;
    if (Number.isFinite(duration) && duration > max) {
      return "解析範囲が長めです。セット前後の歩きや待機が混ざると速度が低く出ます。動作部分だけに絞ると精度が上がります。";
    }
    return "";
  }

  function getPlateSearchRegion(lift, width, height) {
    switch (lift) {
      case "SQ":
        return {
          xMin: width * 0.04,
          xMax: width * 0.96,
          yMin: height * 0.10,
          yMax: height * 0.66,
          floorPenaltyY: height * 0.68,
          name: "squat"
        };
      case "BP":
        return {
          xMin: width * 0.04,
          xMax: width * 0.96,
          yMin: height * 0.08,
          yMax: height * 0.72,
          floorPenaltyY: height * 0.74,
          name: "bench"
        };
      case "DL":
        return {
          xMin: width * 0.03,
          xMax: width * 0.97,
          // DLは床上のプレートが主対象。上部ラック・照明・背景器具を拾いにくくする。
          yMin: height * 0.38,
          yMax: height * 0.96,
          floorPenaltyY: null,
          name: "deadlift"
        };
      default:
        return {
          xMin: width * 0.03,
          xMax: width * 0.97,
          yMin: height * 0.08,
          yMax: height * 0.90,
          floorPenaltyY: null,
          name: "general"
        };
    }
  }

  function getBarbellSearchRegion(lift, width, height) {
    switch (lift) {
      case "SQ":
        return { xMin: width * 0.05, xMax: width * 0.95, yMin: height * 0.12, yMax: height * 0.64 };
      case "BP":
        return { xMin: width * 0.05, xMax: width * 0.95, yMin: height * 0.10, yMax: height * 0.72 };
      case "DL":
        return { xMin: width * 0.04, xMax: width * 0.96, yMin: height * 0.42, yMax: height * 0.92 };
      default:
        return { xMin: width * 0.04, xMax: width * 0.96, yMin: height * 0.10, yMax: height * 0.90 };
    }
  }

  function detectBarbellLineCandidates(data, width, height, lift, luminanceAt) {
    const region = getBarbellSearchRegion(lift, width, height);
    const xStart = Math.round(region.xMin);
    const xEnd = Math.round(region.xMax);
    const xStep = Math.max(2, Math.round(width / 210));
    const yStep = Math.max(2, Math.round(height / 260));
    const candidates = [];

    for (let y = Math.round(region.yMin); y <= Math.round(region.yMax); y += yStep) {
      let samples = 0;
      let linePixels = 0;
      let scoreSum = 0;
      let run = 0;
      let maxRun = 0;
      for (let x = xStart; x <= xEnd; x += xStep) {
        const lum = luminanceAt(x, y);
        const above = luminanceAt(x, y - 3);
        const below = luminanceAt(x, y + 3);
        const left = luminanceAt(x - 3, y);
        const right = luminanceAt(x + 3, y);
        const verticalContrast = Math.abs(lum - above) + Math.abs(lum - below);
        const horizontalContinuity = Math.max(0, 60 - Math.abs(left - right));
        const darkBarLike = lum < 94 && verticalContrast > 14;
        const brightEdgeLike = verticalContrast > 55;
        const lineLike = darkBarLike || brightEdgeLike;
        samples += 1;
        if (lineLike) {
          linePixels += 1;
          run += 1;
          maxRun = Math.max(maxRun, run);
          scoreSum += verticalContrast * 0.58 + Math.max(0, 110 - lum) * 0.26 + horizontalContinuity * 0.10;
        } else {
          run = 0;
        }
      }
      const coverage = samples ? linePixels / samples : 0;
      const continuity = samples ? maxRun / samples : 0;
      const centerPenalty = Math.abs((y / height) - 0.5) < 0.015 ? 0 : 0;
      const floorPenalty = lift !== "DL" && y > height * 0.72 ? 22 : 0;
      const score = coverage * 95 + continuity * 90 + (samples ? scoreSum / samples : 0) - centerPenalty - floorPenalty;
      if (coverage >= 0.055 && continuity >= 0.028 && score > 14) {
        candidates.push({ y, score, coverage, continuity });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const merged = [];
    candidates.forEach((candidate) => {
      if (merged.some((item) => Math.abs(item.y - candidate.y) < height * 0.025)) return;
      merged.push(candidate);
    });
    return merged.slice(0, 8);
  }

  function barbellLineMatchScore(candidate, barLines, size) {
    if (!barLines?.length || !candidate) return { score: 0, line: null };
    const centerY = candidate.y + size / 2;
    let best = { score: 0, line: null };
    barLines.forEach((line) => {
      const diff = Math.abs(centerY - line.y);
      const tolerance = Math.max(10, size * 0.42);
      const proximity = clamp(1 - diff / tolerance, 0, 1);
      const score = proximity * clamp(line.score, 0, 120) * 0.45;
      if (score > best.score) best = { score, line };
    });
    return best;
  }

  function barbellCrossingEvidence(luminanceAt, width, height, candidate) {
    if (!candidate) return 0;
    const size = candidate.width;
    const centerX = candidate.x + size / 2;
    const centerY = candidate.y + size / 2;
    const direction = centerX > width / 2 ? -1 : 1;
    const innerEdge = direction < 0 ? candidate.x : candidate.x + size;
    const segmentStart = clamp(innerEdge, 0, width - 1);
    const segmentEnd = clamp(innerEdge + direction * Math.max(size * 1.65, width * 0.16), 0, width - 1);
    const xMin = Math.min(segmentStart, segmentEnd);
    const xMax = Math.max(segmentStart, segmentEnd);
    const step = Math.max(2, Math.round(size / 14));
    let samples = 0;
    let lineLike = 0;
    let contrastSum = 0;
    for (let yy = centerY - 3; yy <= centerY + 3; yy += 3) {
      for (let x = xMin; x <= xMax; x += step) {
        const lum = luminanceAt(x, yy);
        const above = luminanceAt(x, yy - 3);
        const below = luminanceAt(x, yy + 3);
        const contrast = Math.abs(lum - above) + Math.abs(lum - below);
        const candidateLine = (lum < 118 && contrast > 12) || contrast > 48;
        samples += 1;
        if (candidateLine) {
          lineLike += 1;
          contrastSum += contrast;
        }
      }
    }
    if (!samples) return 0;
    const coverage = lineLike / samples;
    const contrast = contrastSum / samples;
    return clamp(coverage * 58 + contrast * 0.34, 0, 55);
  }

  function platePairEvidence(luminanceAt, width, height, candidate) {
    if (!candidate) return 0;
    const size = candidate.width;
    const centerX = candidate.x + size / 2;
    const centerY = candidate.y + size / 2;
    const mirrorX = width - centerX;
    if (mirrorX < size * 0.4 || mirrorX > width - size * 0.4) return 0;
    const x = clamp(Math.round(mirrorX - size / 2), 0, width - size - 1);
    const y = clamp(Math.round(centerY - size / 2), 0, height - size - 1);
    let dark = 0;
    let edge = 0;
    let samples = 0;
    const sampleStep = Math.max(4, Math.round(size / 7));
    for (let yy = y; yy < y + size; yy += sampleStep) {
      for (let xx = x; xx < x + size; xx += sampleStep) {
        const lum = luminanceAt(xx, yy);
        const right = luminanceAt(xx + sampleStep, yy);
        const down = luminanceAt(xx, yy + sampleStep);
        if (lum < 105) dark += 1;
        edge += Math.abs(lum - right) + Math.abs(lum - down);
        samples += 1;
      }
    }
    if (!samples) return 0;
    const darkRatio = dark / samples;
    const edgeScore = edge / samples;
    if (darkRatio < 0.12 || edgeScore < 10) return 0;
    return clamp(darkRatio * 22 + edgeScore * 0.18, 0, 26);
  }



  function loadExternalScript(src, globalCheck, timeoutMs = 9000) {
    return new Promise((resolve, reject) => {
      if (typeof globalCheck === "function" && globalCheck()) {
        resolve(true);
        return;
      }
      const existing = Array.from(document.scripts || []).find((script) => script.src === src);
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(true);
      };
      const fail = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(new Error("人物AIモデルの読み込みに失敗しました。"));
      };
      const timer = setTimeout(fail, timeoutMs);
      if (existing) {
        existing.addEventListener("load", done, { once: true });
        existing.addEventListener("error", fail, { once: true });
        if (typeof globalCheck === "function" && globalCheck()) done();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.addEventListener("load", done, { once: true });
      script.addEventListener("error", fail, { once: true });
      document.head.appendChild(script);
    });
  }

  async function loadBodyPixModel(progress) {
    if (!VBT_PERSON_SEGMENTATION_ENABLED) return null;
    if (bodyPixModelPromise) return bodyPixModelPromise;
    bodyPixModelPromise = (async () => {
      if (!navigator.onLine) return null;
      try {
        if (typeof progress === "function") progress("人物AIモデルを読み込み中…", 4);
        await loadExternalScript(VBT_TFJS_URL, () => Boolean(window.tf), 11000);
        await loadExternalScript(VBT_BODYPIX_URL, () => Boolean(window.bodyPix), 11000);
        if (!window.bodyPix?.load) return null;
        if (typeof progress === "function") progress("人物AIモデルを初期化中…", 8);
        const model = await window.bodyPix.load({
          architecture: "MobileNetV1",
          outputStride: 16,
          multiplier: 0.50,
          quantBytes: 2
        });
        return model;
      } catch (error) {
        console.warn("BodyPix load failed", error);
        return null;
      }
    })();
    return bodyPixModelPromise;
  }

  function preloadVbtAiModel() {
    if (!VBT_PERSON_SEGMENTATION_ENABLED || bodyPixModelPromise) return;
    // VBTを開いた時点で人物AIを先読みし、解析時に「常駐」に近い状態へ寄せる。
    loadBodyPixModel().catch((error) => console.warn("VBT AI preload failed", error));
  }

  function personSegmentationBounds(segmentation, width, height) {
    if (!segmentation?.data) return null;
    const data = segmentation.data;
    const sw = segmentation.width || width;
    const sh = segmentation.height || height;
    let xMin = width;
    let yMin = height;
    let xMax = 0;
    let yMax = 0;
    let hits = 0;
    const step = 3;
    for (let y = 0; y < height; y += step) {
      const sy = clamp(Math.round(y * sh / height), 0, sh - 1);
      for (let x = 0; x < width; x += step) {
        const sx = clamp(Math.round(x * sw / width), 0, sw - 1);
        if (!data[sy * sw + sx]) continue;
        hits += 1;
        xMin = Math.min(xMin, x);
        yMin = Math.min(yMin, y);
        xMax = Math.max(xMax, x);
        yMax = Math.max(yMax, y);
      }
    }
    if (!hits || xMax <= xMin || yMax <= yMin) return null;
    return { xMin, yMin, xMax, yMax, hits, width: xMax - xMin, height: yMax - yMin };
  }

  function pickBestPersonSegmentation(segmentations, frame) {
    const list = Array.isArray(segmentations) ? segmentations : [segmentations].filter(Boolean);
    if (!list.length || !frame?.canvas) return null;
    const width = frame.canvas.width;
    const height = frame.canvas.height;
    let best = null;
    list.forEach((segmentation) => {
      const bounds = personSegmentationBounds(segmentation, width, height);
      if (!bounds) return;
      const centerX = (bounds.xMin + bounds.xMax) / 2;
      const centerY = (bounds.yMin + bounds.yMax) / 2;
      const areaRatio = (bounds.width * bounds.height) / Math.max(1, width * height);
      const centralScore = 1 - Math.min(1, Math.abs(centerX / width - 0.5) * 1.75);
      const lowerScore = clamp(centerY / height, 0, 1);
      const shapeScore = bounds.height > bounds.width * 0.75 ? 1 : 0.62;
      // 黒ウェアや暗い床に影響されないよう、色ではなく「人物マスクの大きさ・中央性・縦長性」で選ぶ。
      const score = areaRatio * 120 + centralScore * 34 + lowerScore * 18 + shapeScore * 16;
      if (!best || score > best.score) best = { segmentation, score, bounds };
    });
    return best?.segmentation || null;
  }

  async function segmentPersonFrame(model, frame) {
    if (!model || !frame?.canvas) return null;
    try {
      // まず複数人物検出を試す。背景の人物や鏡像があるジム環境では、最大人物/中央人物を選ぶ。
      if (typeof model.segmentMultiPerson === "function") {
        const people = await model.segmentMultiPerson(frame.canvas, {
          internalResolution: "high",
          segmentationThreshold: 0.48,
          maxDetections: 4,
          scoreThreshold: 0.12,
          nmsRadius: 18,
          minKeypointScore: 0.08,
          refineSteps: 5
        });
        const best = pickBestPersonSegmentation(people, frame);
        if (best) return best;
      }
      return await model.segmentPerson(frame.canvas, {
        internalResolution: "high",
        segmentationThreshold: 0.48,
        maxDetections: 1,
        scoreThreshold: 0.12,
        nmsRadius: 20
      });
    } catch (error) {
      console.warn("Person segmentation failed", error);
      return null;
    }
  }

  function personMaskAt(context, x, y) {
    if (!context?.personMask) return 0;
    const px = clamp(Math.round(x), 0, context.width - 1);
    const py = clamp(Math.round(y), 0, context.height - 1);
    return context.personMask[py * context.width + px] ? 1 : 0;
  }

  function personMaskScoreForRoi(context, roi) {
    if (!context?.personMask || !roi) return 0;
    const step = Math.max(3, Math.round(Math.min(roi.width, roi.height) / 7));
    let hits = 0;
    let samples = 0;
    for (let y = roi.y; y <= roi.y + roi.height; y += step) {
      for (let x = roi.x; x <= roi.x + roi.width; x += step) {
        samples += 1;
        hits += personMaskAt(context, x, y);
      }
    }
    return samples ? clamp(hits / samples, 0, 1) : 0;
  }

  function personProximityScore(context, candidate) {
    if (!context?.personRoi || !candidate) return 0;
    const cx = candidate.x + candidate.width / 2;
    const cy = candidate.y + candidate.height / 2;
    const roi = context.personRoi;
    const ex = Math.max(candidate.width * 1.9, context.width * 0.12);
    const ey = Math.max(candidate.height * 1.7, context.height * 0.10);
    const insideExpanded = cx >= roi.x - ex && cx <= roi.x + roi.width + ex && cy >= roi.y - ey && cy <= roi.y + roi.height + ey;
    const closestX = clamp(cx, roi.x, roi.x + roi.width);
    const closestY = clamp(cy, roi.y, roi.y + roi.height);
    const dx = Math.abs(cx - closestX) / Math.max(context.width * 0.30, 1);
    const dy = Math.abs(cy - closestY) / Math.max(context.height * 0.26, 1);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const base = clamp(1 - distance, 0, 1);
    return insideExpanded ? Math.max(base, 0.62) : base * 0.72;
  }

  function buildPersonSegmentationContext(segmentations, frames, lift) {
    const usable = (segmentations || []).filter((item) => item?.segmentation?.data && item?.frame?.canvas);
    if (!usable.length) return null;
    const width = usable[0].frame.canvas.width;
    const height = usable[0].frame.canvas.height;
    const personMask = new Uint8Array(width * height);
    let total = 0;
    let xWeighted = 0;
    let yWeighted = 0;
    let xMin = width;
    let yMin = height;
    let xMax = 0;
    let yMax = 0;
    usable.forEach(({ segmentation }) => {
      const data = segmentation.data || [];
      const sw = segmentation.width || width;
      const sh = segmentation.height || height;
      for (let y = 0; y < height; y += 2) {
        const sy = clamp(Math.round(y * sh / height), 0, sh - 1);
        for (let x = 0; x < width; x += 2) {
          const sx = clamp(Math.round(x * sw / width), 0, sw - 1);
          if (!data[sy * sw + sx]) continue;
          const index = y * width + x;
          personMask[index] = 1;
          personMask[index + 1] = 1;
          if (y + 1 < height) {
            personMask[index + width] = 1;
            personMask[index + width + 1] = 1;
          }
          total += 4;
          xWeighted += x * 4;
          yWeighted += y * 4;
          xMin = Math.min(xMin, x);
          yMin = Math.min(yMin, y);
          xMax = Math.max(xMax, x + 2);
          yMax = Math.max(yMax, y + 2);
        }
      }
    });
    const pixelRatio = total / Math.max(1, width * height * usable.length);
    if (!total || pixelRatio < 0.006 || xMax <= xMin || yMax <= yMin) return null;

    const padX = Math.max(width * 0.08, (xMax - xMin) * 0.28);
    const padY = Math.max(height * 0.06, (yMax - yMin) * 0.22);
    const personRoi = {
      x: clamp(xMin - padX, 0, width - 1),
      y: clamp(yMin - padY, 0, height - 1),
      width: clamp((xMax - xMin) + padX * 2, 1, width),
      height: clamp((yMax - yMin) + padY * 2, 1, height)
    };
    personRoi.width = Math.min(personRoi.width, width - personRoi.x);
    personRoi.height = Math.min(personRoi.height, height - personRoi.y);

    const motion = buildLifterMotionContext(frames, lift);
    const context = {
      ...(motion || {}),
      source: "bodypix",
      width,
      height,
      personMask,
      personRoi,
      personPixelRatio: pixelRatio,
      centerX: xWeighted / total,
      centerY: yWeighted / total,
      roi: personRoi,
      frameCount: usable.length,
      personFrameCount: usable.length,
      aiPersonDetected: true
    };
    if (motion?.heat) {
      context.heat = motion.heat;
      context.step = motion.step;
      context.cols = motion.cols;
      context.rows = motion.rows;
      context.maxValue = motion.maxValue;
      context.motionRoi = motion.roi;
    }
    return context;
  }

  function frameLuminanceGrid(frame, step) {
    if (!frame?.ctx || !frame?.canvas) return null;
    const { canvas, ctx } = frame;
    const width = canvas.width;
    const height = canvas.height;
    const data = ctx.getImageData(0, 0, width, height).data;
    const cols = Math.ceil(width / step);
    const rows = Math.ceil(height / step);
    const values = new Float32Array(cols * rows);
    for (let row = 0; row < rows; row += 1) {
      const y = clamp(row * step, 0, height - 1);
      for (let col = 0; col < cols; col += 1) {
        const x = clamp(col * step, 0, width - 1);
        const index = (y * width + x) * 4;
        values[row * cols + col] = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
      }
    }
    return { width, height, step, cols, rows, values };
  }

  function getLifterMotionSearchRegion(lift, width, height) {
    switch (lift) {
      case "SQ":
        return { xMin: width * 0.10, xMax: width * 0.90, yMin: height * 0.10, yMax: height * 0.90 };
      case "BP":
        return { xMin: width * 0.08, xMax: width * 0.92, yMin: height * 0.08, yMax: height * 0.82 };
      case "DL":
        return { xMin: width * 0.08, xMax: width * 0.92, yMin: height * 0.18, yMax: height * 0.96 };
      default:
        return { xMin: width * 0.06, xMax: width * 0.94, yMin: height * 0.08, yMax: height * 0.94 };
    }
  }

  function buildLifterMotionContext(frames, lift) {
    const usable = (frames || []).filter((item) => item?.frame?.ctx && item?.frame?.canvas);
    if (usable.length < 2) return null;
    const width = usable[0].frame.canvas.width;
    const height = usable[0].frame.canvas.height;
    const step = Math.max(5, Math.round(Math.min(width, height) / 72));
    const grids = usable.map((item) => ({ time: item.time, grid: frameLuminanceGrid(item.frame, step) })).filter((item) => item.grid);
    if (grids.length < 2) return null;
    const cols = grids[0].grid.cols;
    const rows = grids[0].grid.rows;
    const heat = new Float32Array(cols * rows);
    const region = getLifterMotionSearchRegion(lift, width, height);
    let total = 0;
    let xWeighted = 0;
    let yWeighted = 0;
    let maxValue = 0;

    for (let index = 1; index < grids.length; index += 1) {
      const prev = grids[index - 1].grid.values;
      const current = grids[index].grid.values;
      for (let row = 0; row < rows; row += 1) {
        const y = row * step;
        if (y < region.yMin || y > region.yMax) continue;
        for (let col = 0; col < cols; col += 1) {
          const x = col * step;
          if (x < region.xMin || x > region.xMax) continue;
          const cell = row * cols + col;
          const diff = Math.abs(current[cell] - prev[cell]);
          if (diff < 13) continue;
          const centerBias = 1 - Math.min(0.55, Math.abs((x / width) - 0.5) * 0.70);
          const weight = Math.pow(Math.min(90, diff) - 12, 1.08) * centerBias;
          heat[cell] += weight;
          maxValue = Math.max(maxValue, heat[cell]);
          total += weight;
          xWeighted += x * weight;
          yWeighted += y * weight;
        }
      }
    }
    if (!total || maxValue <= 0) return null;

    const threshold = Math.max(22, maxValue * 0.26);
    let xMin = width;
    let yMin = height;
    let xMax = 0;
    let yMax = 0;
    let selected = 0;
    let selectedWeight = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const value = heat[row * cols + col];
        if (value < threshold) continue;
        const x = col * step;
        const y = row * step;
        selected += 1;
        selectedWeight += value;
        xMin = Math.min(xMin, x);
        yMin = Math.min(yMin, y);
        xMax = Math.max(xMax, x + step);
        yMax = Math.max(yMax, y + step);
      }
    }
    if (!selected || xMax <= xMin || yMax <= yMin) {
      const cx = xWeighted / total;
      const cy = yWeighted / total;
      const radius = Math.min(width, height) * 0.24;
      xMin = clamp(cx - radius, 0, width - 1);
      xMax = clamp(cx + radius, 0, width - 1);
      yMin = clamp(cy - radius, 0, height - 1);
      yMax = clamp(cy + radius, 0, height - 1);
    }

    const padX = Math.max(width * 0.10, (xMax - xMin) * 0.44);
    const padY = Math.max(height * 0.08, (yMax - yMin) * 0.34);
    const roi = {
      x: clamp(xMin - padX, 0, width - 1),
      y: clamp(yMin - padY, 0, height - 1),
      width: clamp((xMax - xMin) + padX * 2, 1, width),
      height: clamp((yMax - yMin) + padY * 2, 1, height)
    };
    roi.width = Math.min(roi.width, width - roi.x);
    roi.height = Math.min(roi.height, height - roi.y);

    return {
      width,
      height,
      step,
      cols,
      rows,
      heat,
      maxValue,
      total,
      selectedWeight,
      centerX: xWeighted / total,
      centerY: yWeighted / total,
      roi,
      selectedCells: selected,
      frameCount: usable.length
    };
  }

  function motionHeatAt(context, x, y) {
    if (!context?.heat) return 0;
    const col = clamp(Math.round(x / context.step), 0, context.cols - 1);
    const row = clamp(Math.round(y / context.step), 0, context.rows - 1);
    const value = context.heat[row * context.cols + col] || 0;
    return context.maxValue ? clamp(value / context.maxValue, 0, 1) : 0;
  }

  function motionScoreForRoi(context, roi) {
    if (!context?.heat || !roi) return 0;
    const x0 = clamp(Math.floor(roi.x / context.step), 0, context.cols - 1);
    const x1 = clamp(Math.ceil((roi.x + roi.width) / context.step), 0, context.cols - 1);
    const y0 = clamp(Math.floor(roi.y / context.step), 0, context.rows - 1);
    const y1 = clamp(Math.ceil((roi.y + roi.height) / context.step), 0, context.rows - 1);
    let total = 0;
    let count = 0;
    let max = 0;
    for (let row = y0; row <= y1; row += 1) {
      for (let col = x0; col <= x1; col += 1) {
        const value = context.heat[row * context.cols + col] || 0;
        total += value;
        max = Math.max(max, value);
        count += 1;
      }
    }
    if (!count || !context.maxValue) return 0;
    const mean = total / count / context.maxValue;
    const peak = max / context.maxValue;
    return clamp(mean * 0.58 + peak * 0.42, 0, 1);
  }

  function lifterRegionScore(context, candidate) {
    if (!context?.roi || !candidate) return { score: 0, motionScore: 0, nearScore: 0, personScore: 0, personProximity: 0, outsidePenalty: 0, distanceRatio: null };
    const centerX = candidate.x + candidate.width / 2;
    const centerY = candidate.y + candidate.height / 2;
    const roi = context.roi;
    const marginX = Math.max(candidate.width * 1.6, context.width * 0.09);
    const marginY = Math.max(candidate.height * 1.5, context.height * 0.08);
    const inside = centerX >= roi.x - marginX && centerX <= roi.x + roi.width + marginX && centerY >= roi.y - marginY && centerY <= roi.y + roi.height + marginY;
    const dx = Math.abs(centerX - context.centerX) / Math.max(context.width * 0.42, 1);
    const dy = Math.abs(centerY - context.centerY) / Math.max(context.height * 0.38, 1);
    const distanceRatio = Math.sqrt(dx * dx + dy * dy);
    const nearScore = clamp(1 - distanceRatio, 0, 1);
    const motionScore = motionScoreForRoi(context, candidate);
    const personScore = personMaskScoreForRoi(context, candidate);
    const personProximity = personProximityScore(context, candidate);
    const hasAiPerson = Boolean(context.aiPersonDetected);
    const outsidePenalty = inside ? 0 : (hasAiPerson ? 130 : 88);
    const score = nearScore * 24
      + motionScore * 42
      + personScore * 46
      + personProximity * 76
      - outsidePenalty;
    return { score, motionScore, nearScore, personScore, personProximity, outsidePenalty, distanceRatio };
  }


  function plateShapeEvidence(luminanceAt, candidate) {
    if (!candidate) return { score: 0, ringScore: 0, hubScore: 0, roundnessScore: 0, fillScore: 0 };
    const size = candidate.width;
    const cx = candidate.x + size / 2;
    const cy = candidate.y + size / 2;
    const radius = size / 2;
    const angles = 32;
    let ringContrast = 0;
    let ringDark = 0;
    let ringSamples = 0;
    let innerDark = 0;
    let innerSamples = 0;
    let hubContrast = 0;
    let validEdgeDirections = 0;

    for (let i = 0; i < angles; i += 1) {
      const a = (Math.PI * 2 * i) / angles;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const rOuter = radius * 0.48;
      const rMid = radius * 0.34;
      const rInner = radius * 0.18;
      const outer = luminanceAt(cx + cos * rOuter, cy + sin * rOuter);
      const mid = luminanceAt(cx + cos * rMid, cy + sin * rMid);
      const inner = luminanceAt(cx + cos * rInner, cy + sin * rInner);
      const contrast = Math.abs(outer - mid) + Math.abs(mid - inner);
      ringContrast += contrast;
      if (outer < 118 || mid < 118) ringDark += 1;
      if (inner < 135) innerDark += 1;
      if (contrast > 26) validEdgeDirections += 1;
      ringSamples += 1;
      innerSamples += 1;
      hubContrast += Math.abs(luminanceAt(cx + cos * radius * 0.07, cy + sin * radius * 0.07) - inner);
    }

    const ringScore = clamp((ringContrast / Math.max(1, ringSamples)) * 0.72, 0, 34);
    const fillScore = clamp((ringDark / Math.max(1, ringSamples)) * 24, 0, 24);
    const hubScore = clamp((hubContrast / Math.max(1, ringSamples)) * 0.46 + (innerDark / Math.max(1, innerSamples)) * 8, 0, 20);
    const roundnessScore = clamp((validEdgeDirections / Math.max(1, ringSamples)) * 32, 0, 32);
    const score = clamp(ringScore + fillScore + hubScore + roundnessScore, 0, 92);
    return { score, ringScore, hubScore, roundnessScore, fillScore };
  }

  function detectPlateCandidateFromFrame(frame, options = {}) {
    if (!frame?.ctx || !frame?.canvas) return null;
    const { canvas, ctx, scale } = frame;
    const width = canvas.width;
    const height = canvas.height;
    const data = ctx.getImageData(0, 0, width, height).data;
    const minSide = Math.min(width, height);
    const sizeMin = Math.max(26, Math.round(minSide * 0.105));
    const sizeMax = Math.max(sizeMin + 4, Math.round(minSide * 0.34));
    const lift = options.lift || "SQ";
    const region = getPlateSearchRegion(lift, width, height);
    const preferSides = lift === "OTHER" ? 0.05 : 0.24;
    let best = null;
    const candidates = [];
    const luminanceAt = (x, y) => {
      const index = (clamp(Math.round(y), 0, height - 1) * width + clamp(Math.round(x), 0, width - 1)) * 4;
      return data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;
    };
    const barLines = detectBarbellLineCandidates(data, width, height, lift, luminanceAt);
    const hasBarLine = barLines.length > 0;
    const motionContext = options.motionContext || null;

    for (let size = sizeMin; size <= sizeMax; size += Math.max(5, Math.round(sizeMin * 0.15))) {
      const step = Math.max(6, Math.round(size * 0.22));
      const yEnd = Math.min(region.yMax, height - size - 2);
      const xEnd = Math.min(region.xMax, width - size - 2);
      for (let y = Math.round(region.yMin); y <= yEnd; y += step) {
        for (let x = Math.round(region.xMin); x <= xEnd; x += step) {
          const centerX = x + size / 2;
          const centerY = y + size / 2;
          const candidate = { x, y, width: size, height: size };
          const sideBias = Math.abs(centerX / width - 0.5) * preferSides * 100;
          let dark = 0;
          let edge = 0;
          let borderEdge = 0;
          let samples = 0;
          const sampleStep = Math.max(3, Math.round(size / 9));
          for (let yy = y; yy < y + size; yy += sampleStep) {
            for (let xx = x; xx < x + size; xx += sampleStep) {
              const lum = luminanceAt(xx, yy);
              const right = luminanceAt(xx + sampleStep, yy);
              const down = luminanceAt(xx, yy + sampleStep);
              if (lum < 100) dark += 1;
              edge += Math.abs(lum - right) + Math.abs(lum - down);
              const nearBorder = xx < x + sampleStep * 1.5 || yy < y + sampleStep * 1.5 || xx > x + size - sampleStep * 2 || yy > y + size - sampleStep * 2;
              if (nearBorder) borderEdge += Math.abs(lum - right) + Math.abs(lum - down);
              samples += 1;
            }
          }
          const darkRatio = samples ? dark / samples : 0;
          const edgeScore = samples ? edge / samples : 0;
          const borderScore = samples ? borderEdge / samples : 0;
          const barMatch = barbellLineMatchScore(candidate, barLines, size);
          const crossingScore = barbellCrossingEvidence(luminanceAt, width, height, candidate);
          const pairScore = platePairEvidence(luminanceAt, width, height, candidate);
          const shapeEvidence = plateShapeEvidence(luminanceAt, candidate);
          const lifterEvidence = lifterRegionScore(motionContext, candidate);
          const centerPenalty = Math.abs(centerX / width - 0.5) < 0.10 ? 16 : 0;
          const topPenalty = centerY < height * 0.08 ? 20 : 0;
          const floorPenalty = region.floorPenaltyY && centerY > region.floorPenaltyY ? 115 : 0;
          const bottomTouchPenalty = lift !== "DL" && y + size > height * 0.78 ? 105 : 0;
          // DLでは対象プレートは床〜膝下付近に出やすい。上部ラック・懸垂バー・照明反射を強く除外する。
          const deadliftTooHigh = lift === "DL" && centerY < height * 0.40;
          if (deadliftTooHigh && lifterEvidence.motionScore < 0.42 && crossingScore < 22) continue;
          const deadliftHighPenalty = lift === "DL" && centerY < height * 0.48 ? 135 : 0;
          const shadowLike = darkRatio > 0.74 && edgeScore < 20;
          const pillarLike = borderScore > 70 && darkRatio < 0.18 && crossingScore < 12;
          const plateLike = (darkRatio >= 0.14 && edgeScore >= 14 && borderScore >= 4) || shapeEvidence.score >= 38;
          if (!plateLike) continue;
          if (lift !== "DL" && hasBarLine && barMatch.score < 6 && crossingScore < 10 && lifterEvidence.motionScore < 0.28) continue;
          const barPenalty = hasBarLine && barMatch.score < 8 && crossingScore < 12 ? 34 : 0;
          const hasAiPerson = Boolean(motionContext?.aiPersonDetected);
          const farFromPerson = hasAiPerson && lifterEvidence.personProximity < 0.22 && lifterEvidence.personScore < 0.02;
          const staticBackgroundPenalty = motionContext && lifterEvidence.motionScore < 0.10 && lifterEvidence.nearScore < 0.26 ? 86 : 0;
          const lifterOutsidePenalty = motionContext && lifterEvidence.outsidePenalty ? lifterEvidence.outsidePenalty : 0;
          const personMismatchPenalty = farFromPerson ? 105 : 0;
          const score = darkRatio * 28
            + edgeScore * 0.18
            + borderScore * 0.10
            + shapeEvidence.score * 1.18
            + sideBias
            + barMatch.score * 1.08
            + crossingScore * 1.08
            + pairScore * 0.82
            + lifterEvidence.score
            + lifterEvidence.personProximity * 58
            - topPenalty
            - floorPenalty
            - bottomTouchPenalty
            - deadliftHighPenalty
            - centerPenalty
            - barPenalty
            - staticBackgroundPenalty
            - lifterOutsidePenalty * 0.28
            - personMismatchPenalty
            - (shadowLike ? 70 : 0)
            - (pillarLike ? 45 : 0);
          const scoredCandidate = {
            x,
            y,
            width: size,
            height: size,
            score,
            darkRatio,
            edgeScore,
            borderScore,
            centerY,
            barScore: barMatch.score,
            barY: barMatch.line?.y ?? null,
            crossingScore,
            pairScore,
            shapeScore: shapeEvidence.score,
            ringScore: shapeEvidence.ringScore,
            roundnessScore: shapeEvidence.roundnessScore,
            hubScore: shapeEvidence.hubScore,
            hasBarLine,
            lifterScore: lifterEvidence.score,
            lifterNearScore: lifterEvidence.nearScore,
            motionScore: lifterEvidence.motionScore,
            lifterDistanceRatio: lifterEvidence.distanceRatio
          };
          candidates.push(scoredCandidate);
          if (!best || score > best.score) best = scoredCandidate;
        }
      }
    }
    const minScore = hasBarLine ? 48 : 58;
    const toResult = (item) => {
      const roi = clampPlateRoi({
        x: item.x / scale,
        y: item.y / scale,
        width: item.width / scale,
        height: item.height / scale
      }, Math.round(width / scale), Math.round(height / scale));
      const confidence = item.score > 88 && item.barScore > 10 ? "high" : item.score > 64 ? "middle" : "low";
      return {
        roi,
        score: item.score,
        confidence,
        darkRatio: item.darkRatio,
        edgeScore: item.edgeScore,
        borderScore: item.borderScore,
        barScore: item.barScore,
        barY: item.barY,
        crossingScore: item.crossingScore,
        pairScore: item.pairScore,
        shapeScore: item.shapeScore,
        ringScore: item.ringScore,
        roundnessScore: item.roundnessScore,
        hubScore: item.hubScore,
        hasBarLine: item.hasBarLine,
        lifterScore: item.lifterScore,
        lifterNearScore: item.lifterNearScore,
        motionScore: item.motionScore,
        lifterDistanceRatio: item.lifterDistanceRatio,
        frameWidth: Math.round(width / scale),
        frameHeight: Math.round(height / scale)
      };
    };
    candidates.sort((a, b) => b.score - a.score);
    if (options.returnCandidates) {
      return candidates
        .filter((item) => item.score >= Math.max(28, minScore - 24))
        .slice(0, options.maxCandidates || 6)
        .map(toResult);
    }
    if (!best || best.score < minScore) return null;
    return toResult(best);
  }

  function updateAutoDetectProgress(dialog, step, text, percent) {
    const label = dialog?.querySelector("[data-vbt-detect-progress]");
    const bar = dialog?.querySelector("[data-vbt-detect-progress-bar]");
    if (label) label.textContent = text || step || "プレートを検出中…";
    if (bar) bar.style.width = `${clamp(Number(percent) || 0, 0, 100)}%`;
  }

  function makeAutoDetectSampleTimes(start, end) {
    const duration = Math.max(0.1, end - start);
    // Qwik VBTのように、少し待ってでも動画全体を丁寧に見る。
    // 1枚/数枚の静止画判定ではなく、セット全体の時間的一貫性を評価する。
    const count = clamp(Math.round(duration * 5.0), 48, 140);
    const times = [];
    for (let index = 0; index < count; index += 1) {
      const ratio = count === 1 ? 0 : index / (count - 1);
      times.push(clamp(start + duration * ratio, start, end));
    }
    // 開始直後・中央・終盤を必ず含め、動きが少ない/待機がある動画でも候補評価を安定させる。
    [0.03, 0.10, 0.20, 0.35, 0.50, 0.65, 0.80, 0.90, 0.97].forEach((ratio) => {
      times.push(clamp(start + duration * ratio, start, end));
    });
    return [...new Set(times.map((time) => Number(time.toFixed(3))))].sort((a, b) => a - b);
  }

  function deepDetectMinimumWaitMs(sampleCount, durationSeconds) {
    const deviceTouch = typeof navigator !== "undefined" && Number(navigator.maxTouchPoints) > 0;
    const base = VBT_DEEP_DETECT_MIN_MS;
    const sampleBonus = Math.min(5000, Math.max(0, sampleCount - 60) * 70);
    const durationBonus = Math.min(4000, Math.max(0, Number(durationSeconds) || 0) * 120);
    return clamp(base + sampleBonus + durationBonus, VBT_DEEP_DETECT_MIN_MS, VBT_DEEP_DETECT_MIN_MS + 9000);
  }

  async function waitForDeepDetectBudget(startedAt, targetMs, progress, message = "検出結果を確認中…") {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, Number(targetMs) - elapsed);
    if (!remaining) return;
    const steps = Math.max(4, Math.ceil(remaining / 450));
    for (let index = 0; index < steps; index += 1) {
      if (typeof progress === "function") {
        const percent = 88 + ((index + 1) / steps) * 9;
        progress(message, percent);
      }
      await new Promise((resolve) => setTimeout(resolve, Math.min(550, remaining / steps)));
    }
  }

  function chooseTemporalPlateCandidate(candidates, lift) {
    const clean = (candidates || []).filter((item) => item?.roi && hasFiniteNumber(item.score));
    if (!clean.length) return null;
    const groups = [];
    clean.forEach((candidate) => {
      const roi = candidate.roi;
      const centerX = roi.x + roi.width / 2;
      const centerY = roi.y + roi.height / 2;
      const size = Math.max(roi.width, roi.height);
      let group = groups.find((item) => {
        const dx = Math.abs(item.centerX - centerX) / Math.max(size, item.size, 1);
        const ds = Math.abs(item.size - size) / Math.max(size, item.size, 1);
        return dx < 0.55 && ds < 0.36;
      });
      if (!group) {
        group = { items: [], centerX, centerY, size };
        groups.push(group);
      }
      group.items.push(candidate);
      const n = group.items.length;
      group.centerX = (group.centerX * (n - 1) + centerX) / n;
      group.centerY = (group.centerY * (n - 1) + centerY) / n;
      group.size = (group.size * (n - 1) + size) / n;
    });

    let bestGroup = null;
    groups.forEach((group) => {
      const items = group.items.sort((a, b) => a.sampleTime - b.sampleTime);
      const scores = items.map((item) => Number(item.score)).filter(Number.isFinite);
      const meanScore = scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length);
      const ys = items.map((item) => item.roi.y + item.roi.height / 2);
      const xs = items.map((item) => item.roi.x + item.roi.width / 2);
      const yRange = Math.max(...ys) - Math.min(...ys);
      const xRange = Math.max(...xs) - Math.min(...xs);
      const size = Math.max(1, group.size);
      const motionRatio = yRange / size;
      const horizontalDrift = xRange / size;
      const countRatio = items.length / Math.max(1, clean.length);
      const barEvidence = items.reduce((sum, item) => sum + Number(item.barScore || 0) + Number(item.crossingScore || 0) * 0.35, 0) / Math.max(1, items.length);
      const pairEvidence = items.reduce((sum, item) => sum + Number(item.pairScore || 0), 0) / Math.max(1, items.length);
      const shapeEvidence = items.reduce((sum, item) => sum + Number(item.shapeScore || 0), 0) / Math.max(1, items.length);
      const lifterEvidence = items.reduce((sum, item) => sum + Number(item.lifterNearScore || 0), 0) / Math.max(1, items.length);
      const personEvidence = items.reduce((sum, item) => sum + Math.max(Number(item.personProximity || 0), Number(item.personScore || 0)), 0) / Math.max(1, items.length);
      const motionEvidence = items.reduce((sum, item) => sum + Number(item.motionScore || 0), 0) / Math.max(1, items.length);
      const movementBonus = motionRatio > 0.12 ? Math.min(34, motionRatio * 38) : (lift === "DL" ? 0 : -18);
      const stabilityBonus = Math.min(36, items.length * 5.5) + countRatio * 18;
      const driftPenalty = horizontalDrift > 1.05 ? 28 : horizontalDrift > 0.62 ? 12 : 0;
      const staticPenalty = motionEvidence < 0.10 && lifterEvidence < 0.22 && personEvidence < 0.24 ? 54 : 0;
      const temporalScore = meanScore + stabilityBonus + movementBonus + barEvidence * 0.28 + pairEvidence * 0.26 + shapeEvidence * 0.72 + lifterEvidence * 14 + personEvidence * 38 + motionEvidence * 44 - driftPenalty - staticPenalty;
      group.temporalScore = temporalScore;
      group.motionRatio = motionRatio;
      group.horizontalDrift = horizontalDrift;
      group.meanScore = meanScore;
      group.lifterEvidence = lifterEvidence;
      group.personEvidence = personEvidence;
      group.shapeEvidence = shapeEvidence;
      group.motionEvidence = motionEvidence;
      if (!bestGroup || temporalScore > bestGroup.temporalScore) bestGroup = group;
    });

    if (!bestGroup) return null;
    const first = bestGroup.items.sort((a, b) => a.sampleTime - b.sampleTime)[0];
    const bestItem = bestGroup.items.reduce((best, item) => item.score > best.score ? item : best, first);
    const confidence = bestGroup.temporalScore > 125 && bestGroup.motionRatio > 0.10
      ? "high"
      : bestGroup.temporalScore > 92
        ? "middle"
        : "low";
    return {
      ...first,
      roi: first.roi,
      confidence,
      score: Math.max(bestItem.score, bestGroup.temporalScore),
      temporalScore: bestGroup.temporalScore,
      motionRatio: bestGroup.motionRatio,
      horizontalDrift: bestGroup.horizontalDrift,
      lifterEvidence: bestGroup.lifterEvidence,
      personEvidence: bestGroup.personEvidence,
      shapeEvidence: bestGroup.shapeEvidence,
      motionEvidence: bestGroup.motionEvidence,
      sampleCount: bestGroup.items.length,
      bestFrameTime: bestItem.sampleTime
    };
  }

  function chooseTemporalPlateCandidates(candidates, lift, limit = 3) {
    const clean = (candidates || []).filter((item) => item?.roi && hasFiniteNumber(item.score));
    if (!clean.length) return [];
    const groups = [];
    clean.forEach((candidate) => {
      const roi = candidate.roi;
      const centerX = roi.x + roi.width / 2;
      const centerY = roi.y + roi.height / 2;
      const size = Math.max(roi.width, roi.height);
      let group = groups.find((item) => {
        const dx = Math.abs(item.centerX - centerX) / Math.max(size, item.size, 1);
        const ds = Math.abs(item.size - size) / Math.max(size, item.size, 1);
        return dx < 0.55 && ds < 0.36;
      });
      if (!group) {
        group = { items: [], centerX, centerY, size };
        groups.push(group);
      }
      group.items.push(candidate);
      const n = group.items.length;
      group.centerX = (group.centerX * (n - 1) + centerX) / n;
      group.centerY = (group.centerY * (n - 1) + centerY) / n;
      group.size = (group.size * (n - 1) + size) / n;
    });

    const ranked = groups.map((group) => {
      const items = group.items.sort((a, b) => a.sampleTime - b.sampleTime);
      const scores = items.map((item) => Number(item.score)).filter(Number.isFinite);
      const meanScore = scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length);
      const ys = items.map((item) => item.roi.y + item.roi.height / 2);
      const xs = items.map((item) => item.roi.x + item.roi.width / 2);
      const yRange = Math.max(...ys) - Math.min(...ys);
      const xRange = Math.max(...xs) - Math.min(...xs);
      const size = Math.max(1, group.size);
      const motionRatio = yRange / size;
      const horizontalDrift = xRange / size;
      const countRatio = items.length / Math.max(1, clean.length);
      const barEvidence = items.reduce((sum, item) => sum + Number(item.barScore || 0) + Number(item.crossingScore || 0) * 0.35, 0) / Math.max(1, items.length);
      const pairEvidence = items.reduce((sum, item) => sum + Number(item.pairScore || 0), 0) / Math.max(1, items.length);
      const shapeEvidence = items.reduce((sum, item) => sum + Number(item.shapeScore || 0), 0) / Math.max(1, items.length);
      const lifterEvidence = items.reduce((sum, item) => sum + Number(item.lifterNearScore || 0), 0) / Math.max(1, items.length);
      const personEvidence = items.reduce((sum, item) => sum + Math.max(Number(item.personProximity || 0), Number(item.personScore || 0)), 0) / Math.max(1, items.length);
      const motionEvidence = items.reduce((sum, item) => sum + Number(item.motionScore || 0), 0) / Math.max(1, items.length);
      const movementBonus = motionRatio > 0.12 ? Math.min(34, motionRatio * 38) : (lift === "DL" ? 0 : -18);
      const stabilityBonus = Math.min(36, items.length * 5.5) + countRatio * 18;
      const driftPenalty = horizontalDrift > 1.05 ? 28 : horizontalDrift > 0.62 ? 12 : 0;
      const staticPenalty = motionEvidence < 0.10 && lifterEvidence < 0.22 && personEvidence < 0.24 ? 54 : 0;
      const temporalScore = meanScore + stabilityBonus + movementBonus + barEvidence * 0.28 + pairEvidence * 0.26 + shapeEvidence * 0.72 + lifterEvidence * 14 + personEvidence * 38 + motionEvidence * 44 - driftPenalty - staticPenalty;
      const first = items[0];
      const bestItem = items.reduce((best, item) => item.score > best.score ? item : best, first);
      const confidence = temporalScore > 125 && motionRatio > 0.10
        ? "high"
        : temporalScore > 92
          ? "middle"
          : "low";
      return {
        ...first,
        roi: first.roi,
        confidence,
        score: Math.max(bestItem.score, temporalScore),
        temporalScore,
        motionRatio,
        horizontalDrift,
        lifterEvidence,
        personEvidence,
        shapeEvidence,
        motionEvidence,
        sampleCount: items.length,
        bestFrameTime: bestItem.sampleTime,
        groupItems: items.length
      };
    });

    return ranked
      .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
      .slice(0, Math.max(1, Number(limit) || 3));
  }

  function renderAutoCandidateList(dialog) {
    const list = dialog?.querySelector("[data-vbt-candidate-list]");
    if (!list) return;
    const state = vbtState(dialog);
    const candidates = Array.isArray(state.autoPlateCandidates) ? state.autoPlateCandidates : [];
    if (!candidates.length) {
      list.innerHTML = `<p class="video-storage-note compact">候補が少ないため、緑枠を確認してズレていれば手動で調整してください。</p>`;
      return;
    }
    list.innerHTML = `
      <div class="vbt-candidate-label">プレート候補を選ぶ</div>
      <div class="vbt-candidate-buttons">
        ${candidates.map((candidate, index) => {
          const selected = Number(state.selectedCandidateIndex || 0) === index;
          const confidence = candidate.confidence === "high" ? "高" : candidate.confidence === "middle" ? "中" : "低";
          const move = hasFiniteNumber(candidate.motionRatio) ? Number(candidate.motionRatio).toFixed(2) : "--";
          const shape = hasFiniteNumber(candidate.shapeEvidence ?? candidate.shapeScore) ? Number(candidate.shapeEvidence ?? candidate.shapeScore).toFixed(0) : "--";
          const bar = hasFiniteNumber(candidate.barScore) ? Number(candidate.barScore).toFixed(0) : "--";
          return `<button type="button" class="vbt-candidate-button ${selected ? "selected" : ""}" data-vbt-candidate-select="${index}">
            <strong>候補${index + 1}</strong><span>信頼${confidence} / 形状 ${shape} / 動き ${move} / バー ${bar}</span>
          </button>`;
        }).join("")}
      </div>
    `;
  }

  function selectAutoPlateCandidate(button) {
    const dialog = button?.closest("dialog");
    if (!dialog) return;
    const index = Number(button.dataset.vbtCandidateSelect);
    const candidates = vbtState(dialog).autoPlateCandidates || [];
    const candidate = candidates[index];
    if (!candidate?.roi) return;
    setVbtState(dialog, {
      selectedCandidateIndex: index,
      plateRoi: candidate.roi,
      autoPlateCandidate: candidate,
      autoDetectionConfidence: candidate.confidence || "low",
      autoDetectionMessage: candidate.confidence === "low"
        ? "選択した候補は信頼度が低めです。緑枠が最大プレートを囲んでいるか確認してください。"
        : "選択した候補を緑枠に反映しました。最大プレートを囲んでいれば進んでください。",
      trackingMode: "plate-roi-track",
      markerRoi: null,
      markerPoint: null,
      markerAssistUsed: false
    });
    const note = dialog.querySelector("[data-vbt-auto-note]");
    if (note) note.textContent = vbtState(dialog).autoDetectionMessage;
    renderAutoCandidateList(dialog);
    drawVbtOverlay(dialog);
    drawRoiPreview(dialog);
  }


  function weakAutoPlateCandidates(candidates) {
    const list = (candidates || []).filter((item) => item?.roi);
    if (!list.length) return true;
    const bestShape = Math.max(...list.map((item) => Number(item.shapeEvidence ?? item.shapeScore ?? 0) || 0));
    const bestMotion = Math.max(...list.map((item) => Number(item.motionRatio ?? item.motionScore ?? 0) || 0));
    const bestBar = Math.max(...list.map((item) => Number(item.barScore ?? 0) || 0));
    const bestPerson = Math.max(...list.map((item) => Number(item.personEvidence ?? item.lifterEvidence ?? 0) || 0));
    const highConfidence = list.some((item) => item.confidence === "high" && Number(item.shapeEvidence ?? item.shapeScore ?? 0) >= 42 && (Number(item.motionRatio ?? 0) > 0.28 || Number(item.barScore ?? 0) >= 38));
    if (highConfidence) return false;
    // 人物AIが0の動画では人物スコアを信用しない。プレート形状・バー接続・動きを主判定にする。
    if (bestShape < 36) return true;
    if (bestBar < 30 && bestMotion < 0.42) return true;
    // 候補が人物から遠く、かつプレート形状も弱いならタップ補助へ逃がす。
    if (bestPerson < 0.04 && bestShape < 48 && bestMotion < 0.50) return true;
    return false;
  }

  function showAnchorAssistStep(dialog, message) {
    if (!dialog) return;
    const video = dialog.querySelector("video");
    setVbtState(dialog, {
      anchorAssistMode: true,
      anchorAssistType: "plate",
      anchorPoint: null,
      userAnchorUsed: false,
      autoDetectionConfidence: "anchor-needed",
      autoDetectionMessage: message || "自動検出が不安定です。プレート付近を1回タップすると、その周辺から自動で緑枠を作ります。"
    });
    if (video) video.pause();
    const canvas = dialog.querySelector("[data-vbt-canvas]");
    canvas?.classList.add("active", "roi-active", "anchor-active");
    const note = dialog.querySelector("[data-vbt-anchor-note]");
    if (note) note.textContent = vbtState(dialog).autoDetectionMessage;
    setVbtWizardStep(dialog, "anchor-assist");
  }

  function estimateAnchorPlateSize(video, point) {
    const detected = estimatePlateDiameterPixels(video, point);
    const base = Math.min(video.videoWidth || 1, video.videoHeight || 1);
    if (hasFiniteNumber(detected)) return clamp(Number(detected), base * 0.10, base * 0.32);
    return clamp(base * 0.18, 52, base * 0.30);
  }

  function roiFromAnchorPoint(video, point) {
    const size = estimateAnchorPlateSize(video, point);
    return clampPlateRoi({
      x: point.x - size / 2,
      y: point.y - size / 2,
      width: size,
      height: size
    }, video.videoWidth, video.videoHeight);
  }

  function markerRoiFromPoint(video, point) {
    const base = Math.min(Number(video?.videoWidth) || 1, Number(video?.videoHeight) || 1);
    const size = clamp(Math.round(base * 0.045), VBT_MARKER_ROI_MIN_PX, VBT_MARKER_ROI_MAX_PX);
    return clampPlateRoi({
      x: point.x - size / 2,
      y: point.y - size / 2,
      width: size,
      height: size
    }, video.videoWidth, video.videoHeight);
  }

  function applyMarkerAssistPoint(dialog, point) {
    const video = dialog?.querySelector("video");
    if (!dialog || !video?.videoWidth || !video?.videoHeight || !point) return;
    const markerRoi = markerRoiFromPoint(video, point);
    const calibrationRoi = roiFromAnchorPoint(video, point);
    setVbtState(dialog, {
      plateRoi: calibrationRoi,
      markerRoi,
      markerPoint: point,
      anchorPoint: point,
      anchorAssistMode: false,
      anchorAssistType: null,
      userAnchorUsed: true,
      markerAssistUsed: true,
      trackingMode: "marker-assist",
      path: [],
      autoDetectionConfidence: "marker-anchor",
      autoDetectionMessage: "マーカー位置を登録しました。緑の大枠は距離換算用、黄色の小枠は追跡用です。ズレがなければ進んでください。",
      autoPlateCandidate: { roi: calibrationRoi, markerRoi, confidence: "marker-anchor", userAnchor: true, markerAssist: true },
      autoPlateCandidates: [{ roi: calibrationRoi, markerRoi, confidence: "marker-anchor", userAnchor: true, markerAssist: true, score: 120 }],
      selectedCandidateIndex: 0
    });
    const note = dialog.querySelector("[data-vbt-auto-note]");
    if (note) note.textContent = vbtState(dialog).autoDetectionMessage;
    setVbtWizardStep(dialog, "auto-detect-confirm");
    drawVbtOverlay(dialog);
    drawRoiPreview(dialog);
  }

  function startMarkerAssist(button) {
    const dialog = button?.closest("dialog");
    if (!dialog) return;
    setVbtState(dialog, {
      anchorAssistMode: true,
      anchorAssistType: "marker",
      autoDetectionMessage: "白テープ・蛍光テープなど、追跡したい高コントラストマーカーを1回タップしてください。"
    });
    const canvas = dialog.querySelector("[data-vbt-canvas]");
    canvas?.classList.add("active", "roi-active", "anchor-active", "marker-active");
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = "マーカーを1回タップしてください。";
    const guide = dialog.querySelector("[data-vbt-video-guide]");
    if (guide) guide.textContent = "マーカー補助：白/蛍光テープをタップ";
    drawVbtOverlay(dialog);
  }

  function applyAnchorAssistPoint(dialog, point) {
    const video = dialog?.querySelector("video");
    if (!dialog || !video?.videoWidth || !video?.videoHeight || !point) return;
    if (vbtState(dialog).anchorAssistType === "marker") {
      applyMarkerAssistPoint(dialog, point);
      return;
    }
    const roi = roiFromAnchorPoint(video, point);
    setVbtState(dialog, {
      plateRoi: roi,
      anchorPoint: point,
      anchorAssistMode: false,
      anchorAssistType: null,
      userAnchorUsed: true,
      trackingMode: "plate-roi-track",
      path: [],
      autoDetectionConfidence: "user-anchor",
      autoDetectionMessage: "タップ位置の周辺から緑枠を作りました。最大プレートを囲んでいれば進んでください。ズレていれば微調整してください。",
      autoPlateCandidate: { roi, confidence: "user-anchor", userAnchor: true },
      autoPlateCandidates: [{ roi, confidence: "user-anchor", userAnchor: true, score: 100 }],
      selectedCandidateIndex: 0
    });
    const note = dialog.querySelector("[data-vbt-auto-note]");
    if (note) note.textContent = vbtState(dialog).autoDetectionMessage;
    setVbtWizardStep(dialog, "auto-detect-confirm");
    drawVbtOverlay(dialog);
    drawRoiPreview(dialog);
  }

  async function runAutoPlateDetection(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    const record = await getVideoRecord(button.dataset.vbtAutoDetect);
    if (!dialog || !video || !record) return;
    const previousText = button.textContent;
    try {
      button.disabled = true;
      button.textContent = "精密解析中...";
      setVbtWizardStep(dialog, "auto-detect-loading");
      const state = vbtState(dialog);
      const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
      const end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : Number(video.duration || start + 1);
      const detectStartedAt = performance.now();
      const sampleTimes = makeAutoDetectSampleTimes(start, end);
      const deepBudgetMs = deepDetectMinimumWaitMs(sampleTimes.length, end - start);
      const sampledFrames = [];
      const segmentedFrames = [];
      const allCandidates = [];
      const personModel = await loadBodyPixModel((message, percent) => updateAutoDetectProgress(dialog, 1, message, percent));
      updateAutoDetectProgress(dialog, 1, personModel ? "1/8 人物AIでリフター領域を確認中…" : "1/8 人物AIが使えないため動き検出で確認中…", 8);
      for (let index = 0; index < sampleTimes.length; index += 1) {
        const time = sampleTimes[index];
        await seekVideo(video, time, 2500);
        const frame = frameCanvas(video, VBT_DEEP_DETECT_FRAME_SIZE);
        const item = { time, frame };
        sampledFrames.push(item);
        if (personModel && (index % VBT_DEEP_DETECT_PERSON_SEGMENT_EVERY === 0 || sampleTimes.length <= 24)) {
          const segmentation = await segmentPersonFrame(personModel, frame);
          if (segmentation) segmentedFrames.push({ ...item, segmentation });
        }
        const progress = 8 + ((index + 1) / sampleTimes.length) * 32;
        updateAutoDetectProgress(dialog, index + 1, personModel ? "1/8 人物AIでリフター領域を確認中…" : "1/8 動いているリフター領域を確認中…", progress);
        await new Promise((resolve) => setTimeout(resolve, 28));
      }
      const personContext = buildPersonSegmentationContext(segmentedFrames, sampledFrames, record.lift);
      const lifterMotionContext = personContext || buildLifterMotionContext(sampledFrames, record.lift);
      setVbtState(dialog, { autoDetectionMotionContext: lifterMotionContext });
      updateAutoDetectProgress(dialog, 2, lifterMotionContext?.aiPersonDetected ? "2/8 人物領域と動きの重なりを確認中…" : lifterMotionContext ? "2/8 リフター周辺の動き領域を確認中…" : "2/8 リフター領域が弱いため通常検出も併用中…", 42);
      for (let index = 0; index < sampledFrames.length; index += 1) {
        const { time, frame } = sampledFrames[index];
        const candidates = detectPlateCandidateFromFrame(frame, { lift: record.lift, returnCandidates: true, maxCandidates: 10, motionContext: lifterMotionContext }) || [];
        candidates.forEach((candidate) => allCandidates.push({ ...candidate, sampleTime: time, sampleIndex: index }));
        const progress = 42 + ((index + 1) / sampledFrames.length) * 40;
        const message = index < sampledFrames.length * 0.25
          ? "3/8 バーベル線と候補プレートを抽出中…"
          : index < sampledFrames.length * 0.50
            ? "4/8 候補がリフター周辺にあるか照合中…"
            : index < sampledFrames.length * 0.75
              ? "5/8 動画内で一緒に動く候補を検証中…"
              : "6/8 影・床・背景ラックを除外中…";
        updateAutoDetectProgress(dialog, index + 1, message, progress);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      updateAutoDetectProgress(dialog, 7, "7/8 候補を時間的一貫性で再評価中…", 84);
      await waitForDeepDetectBudget(detectStartedAt, deepBudgetMs, (message, percent) => updateAutoDetectProgress(dialog, 7, message, percent), "7/8 動画全体の候補スコアを再確認中…");
      const candidateList = chooseTemporalPlateCandidates(allCandidates, record.lift, 3);
      const bestCandidate = candidateList[0];
      updateAutoDetectProgress(dialog, 8, "8/8 検出結果を準備中…", 98);
      if (!bestCandidate) {
        showAnchorAssistStep(dialog, `自動検出だけではプレート候補を絞れませんでした。解析フレーム ${sampleTimes.length}件を確認しました。実際のプレート付近を1回タップしてください。`);
        return;
      }
      if (weakAutoPlateCandidates(candidateList)) {
        setVbtState(dialog, {
          autoPlateCandidates: candidateList,
          selectedCandidateIndex: null,
          autoPlateCandidate: null
        });
        showAnchorAssistStep(dialog, `プレート形状・バー接続・動きの確信度が低いため、自動候補を採用しませんでした。実際のプレート付近を1回タップしてください。解析フレーム ${sampleTimes.length}件 / 形状 ${(Number(bestCandidate.shapeEvidence ?? bestCandidate.shapeScore) || 0).toFixed(0)} / 動き ${(Number(bestCandidate.motionRatio) || 0).toFixed(2)}`);
        return;
      }
      const lowMessage = "自動検出の信頼度：低。候補を選び、緑枠が最大プレートを囲んでいるか確認してください。";
      const okMessage = `プレートの外周形状とバー接続から候補を${candidateList.length}件見つけました。正しい候補を選び、緑枠が最大プレートを囲んでいれば進んでください。確認フレーム ${sampleTimes.length}件 / 採用フレーム ${bestCandidate.sampleCount || 1}件 / 形状 ${(Number(bestCandidate.shapeEvidence ?? bestCandidate.shapeScore) || 0).toFixed(0)} / 動き ${(Number(bestCandidate.motionRatio) || 0).toFixed(2)}`;
      setVbtState(dialog, {
        plateRoi: bestCandidate.roi,
        autoPlateCandidate: bestCandidate,
        autoPlateCandidates: candidateList,
        selectedCandidateIndex: 0,
        autoDetectionConfidence: bestCandidate.confidence,
        autoDetectionMessage: bestCandidate.confidence === "low" ? lowMessage : okMessage,
        trackingMode: "plate-roi-track"
      });
      const note = dialog.querySelector("[data-vbt-auto-note]");
      if (note) note.textContent = vbtState(dialog).autoDetectionMessage;
      setVbtWizardStep(dialog, "auto-detect-confirm");
    } catch (error) {
      setVbtState(dialog, {
        autoDetectionConfidence: "failed",
        autoDetectionMessage: error.message || "人物AI・リフター周辺のバーベル線・プレート候補を検出できませんでした。プレート付近を1回タップしてください。"
      });
      showAnchorAssistStep(dialog, vbtState(dialog).autoDetectionMessage);
    } finally {
      button.disabled = false;
      button.textContent = previousText;
    }
  }

  function confirmAutoDetectedPlate(button) {
    const dialog = button.closest("dialog");
    if (!dialog) return;
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = "プレート候補を確定しました。";
    setVbtWizardStep(dialog, "set-info");
  }

  function showManualPlateSelection(button) {
    const dialog = button.closest("dialog");
    if (!dialog) return;
    setVbtWizardStep(dialog, "manual-plate");
  }

  function vbtCardMarkup(record) {
    const velocityData = record.analysis?.velocityData || {};
    const calibration = velocityData.calibration || {};
    const measurement = velocityData.measurement || velocityData;
    const plateDiameterCm = hasFiniteNumber(calibration.plateDiameterCm) ? Number(calibration.plateDiameterCm) : DEFAULT_PLATE_DIAMETER_CM;
    const startGuide = getVbtStartGuide(record.lift);
    const initialStep = vbtWizardInitialStep(record);
    const resultMarkup = vbtResultMarkup({ ...measurement, ...velocityData, lift: record.lift, rpe: record.rpe });
    const recordRepLabel = record.reps ? ` × ${formatNumber(record.reps)}` : " × AI判定";
    const setSummary = `${liftLabel(record.lift)} ${formatNumber(record.weight)}kg${recordRepLabel} @${formatNumber(record.rpe)}`;
    return `
      <section class="manual-vbt-card vbt-wizard" data-vbt-card data-vbt-wizard-root>
        <section class="vbt-wizard-screen ${initialStep === "trim" ? "active" : ""}" data-vbt-step="trim">
          <div class="vbt-trim-cursor-card">
            <div class="vbt-trim-direct-track" data-vbt-trim-track role="group" aria-label="動画トリミング範囲">
              <span class="vbt-trim-dim before"></span>
              <span class="vbt-trim-selection">
                <span class="vbt-trim-handle start" data-vbt-trim-handle="start" aria-label="前半を削る"></span>
                <span class="vbt-trim-handle end" data-vbt-trim-handle="end" aria-label="後半を削る"></span>
              </span>
              <span class="vbt-trim-dim after"></span>
              <span class="vbt-trim-playhead" data-vbt-trim-playhead aria-label="再生位置"></span>
            </div>
            <div class="vbt-trim-cursor-actions one">
              <button class="text-button compact" type="button" data-vbt-preview-range>範囲を再生</button>
            </div>
          </div>
          <div class="vbt-trim-summary">
            <span data-vbt-trim-start>開始 ${escapeHtml(formatSeconds(measurement.trim?.start))}</span>
            <span data-vbt-trim-end>終了 ${escapeHtml(formatSeconds(measurement.trim?.end))}</span>
            <span data-vbt-playhead-label>現在 ${escapeHtml(formatSeconds(0))}</span>
          </div>
          <div class="vbt-wizard-actions">
            <button class="primary-button inline vbt-wizard-primary" type="button" data-vbt-auto-detect="${escapeHtml(record.id)}">プレート検出へ</button>
          </div>
        </section>

        <section class="vbt-wizard-screen" data-vbt-step="auto-detect-loading">
          <div class="vbt-wizard-loading vbt-detect-loading">
            <span class="vbt-loader-orb" aria-hidden="true"></span>
            <strong>プレートを検出中</strong>
            <p data-vbt-detect-progress>1/8 リフター領域を確認中…</p>
            <div class="vbt-detect-progress-bar"><span data-vbt-detect-progress-bar style="width: 12%"></span></div>
            <small>速度より精度を優先し、動画全体からリフター・バーベル線・プレートの動きの一貫性を確認します。</small>
          </div>
        </section>

        <section class="vbt-wizard-screen" data-vbt-step="anchor-assist">
          <div class="video-check-head">
            <strong>プレート付近をタップ</strong>
            <small>半自動補助</small>
          </div>
          <p class="video-storage-note" data-vbt-anchor-note>自動検出が不安定です。動画上で実際のプレート付近を1回タップしてください。タップ周辺から緑枠を自動作成します。</p>
          <div class="vbt-anchor-guide">
            <strong>操作</strong>
            <span>動画上の最大プレートの中心付近を1回タップ</span>
            <small>細かい四角形調整ではなく、まず「ここがプレート」と教えるだけでOKです。</small>
          </div>
          <div class="vbt-wizard-actions three">
            <button class="text-button" type="button" data-vbt-wizard-step="trim">戻る</button>
            <button class="text-button" type="button" data-vbt-manual-plate>緑枠で手動調整</button>
            <button class="primary-button inline vbt-wizard-primary" type="button" data-vbt-anchor-enable>タップ待機中</button>
          </div>
        </section>

        <section class="vbt-wizard-screen" data-vbt-step="auto-detect-confirm">
          <div class="video-check-head">
            <strong>プレートを確認</strong>
            <small>自動検出β</small>
          </div>
          <p class="video-storage-note" data-vbt-auto-note>この緑枠が最大プレートを囲んでいれば「見えます」を押してください。</p>
          <div class="vbt-candidate-strip" data-vbt-candidate-list></div>
          <div class="vbt-roi-preview">
            <canvas data-vbt-roi-preview-canvas></canvas>
            <span>ROI拡大プレビュー</span>
          </div>
          <div class="vbt-wizard-actions three">
            <button class="text-button" type="button" data-vbt-wizard-step="trim">戻る</button>
            <button class="text-button" type="button" data-vbt-manual-plate>手動で調整</button>
            <button class="primary-button inline vbt-wizard-primary" type="button" data-vbt-confirm-plate>見えます</button>
          </div>
        </section>

        <section class="vbt-wizard-screen" data-vbt-step="manual-plate">
          <div class="video-check-head">
            <strong>${escapeHtml(startGuide.title)}</strong>
            <small>手動補正</small>
          </div>
          <p class="video-storage-note">${escapeHtml(startGuide.shortGuide)} ${escapeHtml(startGuide.detailGuide)}</p>
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
          <div class="vbt-roi-actions">
            <button class="text-button" type="button" data-vbt-roi-init>緑枠を表示</button>
            <button class="text-button" type="button" data-vbt-wizard-step="trim">戻る</button>
            <button class="primary-button inline" type="button" data-vbt-confirm-plate>このプレートで進む</button>
          </div>
          <details class="vbt-roi-nudge" open>
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
            <p>表示用の丸は小さく、タップ判定は広く残しています。指で合わせた後の仕上げに使います。</p>
          </details>
          <div class="vbt-roi-preview">
            <canvas data-vbt-roi-preview-canvas></canvas>
            <span>ROI拡大プレビュー</span>
          </div>
          <div class="vbt-markers"><span data-vbt-pick-status>${calibration.plateRoi ? "緑枠を保存済み" : "緑枠は未設定"}</span></div>
        </section>

        <section class="vbt-wizard-screen" data-vbt-step="set-info">
          <div class="video-check-head">
            <strong>セット情報</strong>
            <small>${escapeHtml(setSummary)}</small>
          </div>
          <div class="vbt-set-summary-card">
            <span>${escapeHtml(liftLabel(record.lift))}</span>
            <strong>${escapeHtml(formatNumber(record.weight))}kg ${record.reps ? `× ${escapeHtml(formatNumber(record.reps))}` : "× AI判定"}</strong>
            <em>@${escapeHtml(formatNumber(record.rpe))}</em>
            <p>レップ数は動画解析から自動判定します。重量・日付・RPEを確認して解析してください。</p>
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
          <div class="vbt-wizard-actions">
            <button class="text-button" type="button" data-vbt-manual-plate>プレートを調整</button>
            <button class="primary-button inline vbt-wizard-primary" type="button" data-vbt-roi-track="${escapeHtml(record.id)}">解析する</button>
          </div>
        </section>

        <section class="vbt-wizard-screen" data-vbt-step="analyzing">
          <div class="vbt-wizard-loading">
            <strong>解析中</strong>
            <p>プレート軌跡からレップを検出し、下降速度・挙上速度・速度低下を計算しています。</p>
          </div>
        </section>

        <section class="vbt-wizard-screen ${initialStep === "result" ? "active" : ""}" data-vbt-step="result">
          <div class="video-check-head">
            <strong>VBT結果</strong>
            <small>最終Rep・速度低下・次セット判断</small>
          </div>
          <div class="motion-result vbt-result" data-vbt-result>${resultMarkup}</div>
          <div class="vbt-wizard-actions">
            <button class="text-button" type="button" data-vbt-wizard-step="trim">やり直す</button>
          </div>
        </section>
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
      trimEnd: hasFiniteNumber(measurement.trim?.end) ? Number(measurement.trim.end) : null,
      wizardStep: record?.id ? vbtWizardInitialStep(record) : "trim",
      autoPlateCandidate: null,
      autoPlateCandidates: [],
      selectedCandidateIndex: null,
      autoDetectionConfidence: "unknown",
      autoDetectionMessage: null,
      anchorAssistMode: false,
      anchorAssistType: null,
      anchorPoint: null,
      userAnchorUsed: false
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
    return Math.max(3.2 * scale.x, 2.6);
  }

  function getRoiCornerMarkerLength(canvas) {
    const scale = getCanvasVisualScale(canvas);
    return Math.max(10 * scale.x, 7);
  }

  function getRoiHitHandleRadius(canvas) {
    const scale = getCanvasVisualScale(canvas);
    return Math.max(28 * scale.x, 24);
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

  function drawMarkerRoi(ctx, roi) {
    if (!roi) return;
    const scale = getCanvasVisualScale(ctx.canvas);
    const center = roiCenter(roi);
    ctx.save();
    ctx.strokeStyle = "rgba(250, 204, 21, 0.98)";
    ctx.fillStyle = "rgba(250, 204, 21, 0.10)";
    ctx.lineWidth = Math.max(2.2 * scale.x, 1.6);
    ctx.fillRect(roi.x, roi.y, roi.width, roi.height);
    ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
    ctx.beginPath();
    ctx.moveTo(center.x - roi.width * 0.28, center.y);
    ctx.lineTo(center.x + roi.width * 0.28, center.y);
    ctx.moveTo(center.x, center.y - roi.height * 0.28);
    ctx.lineTo(center.x, center.y + roi.height * 0.28);
    ctx.stroke();
    ctx.font = `900 ${Math.max(10 * scale.x, 11)}px system-ui`;
    ctx.strokeStyle = "rgba(23, 23, 23, 0.78)";
    ctx.lineWidth = Math.max(3 * scale.x, 2);
    ctx.strokeText("MARK", roi.x + 4 * scale.x, Math.max(16 * scale.x, roi.y - 6 * scale.x));
    ctx.fillStyle = "#fffaf2";
    ctx.fillText("MARK", roi.x + 4 * scale.x, Math.max(16 * scale.x, roi.y - 6 * scale.x));
    ctx.restore();
  }

  function drawPlateRoi(ctx, roi) {
    if (!roi) return;
    const scale = getCanvasVisualScale(ctx.canvas);
    const lineWidth = Math.max(2.2 * scale.x, 1.6);
    const handleRadius = getRoiVisualHandleRadius(ctx.canvas);
    const markerLength = getRoiCornerMarkerLength(ctx.canvas);
    const center = roiCenter(roi);
    ctx.save();
    ctx.fillStyle = "rgba(34, 197, 94, 0.035)";
    ctx.strokeStyle = "rgba(34, 197, 94, 0.96)";
    ctx.lineWidth = lineWidth;
    ctx.fillRect(roi.x, roi.y, roi.width, roi.height);
    ctx.strokeRect(roi.x, roi.y, roi.width, roi.height);
    ctx.beginPath();
    ctx.moveTo(center.x - roi.width * 0.08, center.y);
    ctx.lineTo(center.x + roi.width * 0.08, center.y);
    ctx.moveTo(center.x, center.y - roi.height * 0.08);
    ctx.lineTo(center.x, center.y + roi.height * 0.08);
    ctx.stroke();

    // 見た目の四隅は小さなL字＋小点にする。
    // タップ判定は roiHitTarget() 側で大きく残すため、スマホでも触りやすさは維持する。
    ctx.strokeStyle = "rgba(34, 197, 94, 0.98)";
    ctx.fillStyle = "rgba(255, 250, 242, 0.92)";
    ctx.lineWidth = Math.max(2.4 * scale.x, 1.8);
    const corners = [
      { x: roi.x, y: roi.y, sx: 1, sy: 1 },
      { x: roi.x + roi.width, y: roi.y, sx: -1, sy: 1 },
      { x: roi.x, y: roi.y + roi.height, sx: 1, sy: -1 },
      { x: roi.x + roi.width, y: roi.y + roi.height, sx: -1, sy: -1 }
    ];
    corners.forEach((corner) => {
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y);
      ctx.lineTo(corner.x + markerLength * corner.sx, corner.y);
      ctx.moveTo(corner.x, corner.y);
      ctx.lineTo(corner.x, corner.y + markerLength * corner.sy);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, handleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.font = `900 ${Math.max(10 * scale.x, 11)}px system-ui`;
    ctx.strokeStyle = "rgba(23, 23, 23, 0.74)";
    ctx.lineWidth = Math.max(3 * scale.x, 2);
    ctx.strokeText("ROI", roi.x + 5 * scale.x, Math.max(18 * scale.x, roi.y - 7 * scale.x));
    ctx.fillStyle = "#fffaf2";
    ctx.fillText("ROI", roi.x + 5 * scale.x, Math.max(18 * scale.x, roi.y - 7 * scale.x));
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
        const label = state.trackingMode === "marker-assist" || state.trackingMode === "marker-assist-timeseries" ? "マーカー軌跡" : (state.trackingMode === "plate-roi-track" || state.trackingMode === "plate-roi-timeseries" ? "プレート軌跡" : "中心点追跡β 参考線");
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
    drawMarkerRoi(ctx, state.markerRoi);
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
    if (state.anchorAssistMode) return false;
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
    const point = canvasPointFromEvent(canvas, event);
    if (state.anchorAssistMode) {
      event.preventDefault();
      applyAnchorAssistPoint(dialog, point);
      return;
    }
    if (!state.pickMode) return;
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
      trimEnd: null,
      wizardStep: "trim",
      autoPlateCandidate: null,
      autoPlateCandidates: [],
      selectedCandidateIndex: null,
      autoDetectionConfidence: "unknown",
      autoDetectionMessage: null,
      anchorAssistMode: false,
      anchorAssistType: null,
      anchorPoint: null,
      userAnchorUsed: false,
      markerAssistUsed: false,
      markerPoint: null,
      markerRoi: null
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


  function getTrimMinimumRange(duration) {
    if (!Number.isFinite(duration) || duration <= 0) return 0.5;
    return Math.min(0.5, Math.max(0.18, duration * 0.025));
  }

  function trimRatioFromPointer(event, track) {
    const rect = track.getBoundingClientRect();
    if (!rect.width) return 0;
    return clamp((event.clientX - rect.left) / rect.width, 0, 1);
  }

  function setTrimRange(dialog, start, end, options = {}) {
    const video = dialog?.querySelector("video");
    const duration = Number(video?.duration);
    if (!dialog || !video || !Number.isFinite(duration) || duration <= 0) return;
    const minimumRange = getTrimMinimumRange(duration);
    let nextStart = clamp(Number(start) || 0, 0, Math.max(0, duration - minimumRange));
    let nextEnd = clamp(Number(end) || duration, minimumRange, duration);
    if (nextEnd - nextStart < minimumRange) {
      if (options.lock === "start") nextEnd = clamp(nextStart + minimumRange, minimumRange, duration);
      else if (options.lock === "end") nextStart = clamp(nextEnd - minimumRange, 0, Math.max(0, duration - minimumRange));
      else nextEnd = clamp(nextStart + minimumRange, minimumRange, duration);
    }
    const state = vbtState(dialog);
    setVbtState(dialog, {
      trimStart: nextStart,
      trimEnd: nextEnd,
      targetPoint: null,
      startPoint: null,
      endPoint: null,
      path: [],
      trackingConfidence: "unknown",
      trackingMode: state.plateRoi ? "plate-roi-track" : "manual-2point",
      markerRoi: null,
      markerPoint: null,
      markerAssistUsed: false
    });
    if (options.seek === "start") video.currentTime = nextStart;
    if (options.seek === "end") video.currentTime = nextEnd;
    syncTrimControls(dialog);
    drawVbtOverlay(dialog);
  }

  function handleTrimTrackPointerDown(event) {
    const handle = event.target.closest("[data-vbt-trim-handle]");
    const track = event.target.closest("[data-vbt-trim-track]");
    if (!track) return false;
    const dialog = track.closest("dialog");
    const video = dialog?.querySelector("video");
    const duration = Number(video?.duration);
    if (!dialog || !video || !Number.isFinite(duration) || duration <= 0) return false;
    const mode = handle?.dataset.vbtTrimHandle || "playhead";
    dialog._vbtTrimDrag = { mode };
    track.setPointerCapture?.(event.pointerId);
    event.preventDefault();
    handleTrimTrackPointerMove(event);
    return true;
  }

  function handleTrimTrackPointerMove(event) {
    const dialog = event.target.closest("dialog") || document.querySelector("#videoViewerDialog");
    const drag = dialog?._vbtTrimDrag;
    if (!dialog || !drag) return false;
    const track = dialog.querySelector("[data-vbt-trim-track]");
    const video = dialog.querySelector("video");
    const duration = Number(video?.duration);
    if (!track || !video || !Number.isFinite(duration) || duration <= 0) return false;
    const ratio = trimRatioFromPointer(event, track);
    const time = clamp(ratio * duration, 0, duration);
    const state = vbtState(dialog);
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : duration;
    if (drag.mode === "start") {
      setTrimRange(dialog, time, end, { lock: "end", seek: "start" });
    } else if (drag.mode === "end") {
      setTrimRange(dialog, start, time, { lock: "start", seek: "end" });
    } else {
      video.currentTime = clamp(time, start, end);
      updateVbtPlaybackControls(dialog);
      drawVbtOverlay(dialog);
    }
    return true;
  }

  function handleTrimTrackPointerUp(event) {
    const dialog = event.target.closest("dialog") || document.querySelector("#videoViewerDialog");
    if (!dialog?._vbtTrimDrag) return false;
    dialog._vbtTrimDrag = null;
    updateVbtPlaybackControls(dialog);
    return true;
  }


  function updateVbtPlaybackControls(dialog) {
    const video = dialog?.querySelector("video");
    if (!video) return;
    const duration = Number(video.duration);
    const current = Number(video.currentTime) || 0;
    const playhead = dialog.querySelector("[data-vbt-playhead-range]");
    if (playhead && Number.isFinite(duration) && duration > 0) {
      playhead.max = String(duration);
      playhead.value = String(clamp(current, 0, duration));
    }
    const readout = dialog.querySelector("[data-vbt-time-readout]");
    if (readout) readout.textContent = `${formatSeconds(current)} / ${Number.isFinite(duration) ? formatSeconds(duration) : "0:00"}`;
    const label = dialog.querySelector("[data-vbt-playhead-label]");
    if (label) label.textContent = `現在 ${formatSeconds(current)}`;
    const toggle = dialog.querySelector("[data-vbt-play-toggle]");
    if (toggle) toggle.textContent = video.paused ? "再生" : "停止";
    updateTrimTrack(dialog);
  }

  function updateTrimTrack(dialog) {
    const video = dialog?.querySelector("video");
    const track = dialog?.querySelector("[data-vbt-trim-track]");
    if (!video || !track) return;
    const duration = Number(video.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const state = vbtState(dialog);
    const start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    const end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : duration;
    const current = Number(video.currentTime) || 0;
    track.style.setProperty("--trim-start", `${clamp((start / duration) * 100, 0, 100)}%`);
    track.style.setProperty("--trim-end", `${clamp((end / duration) * 100, 0, 100)}%`);
    track.style.setProperty("--playhead", `${clamp((current / duration) * 100, 0, 100)}%`);
  }

  function toggleVbtPlayback(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
    updateVbtPlaybackControls(dialog);
  }

  function handleVbtPlayheadInput(input) {
    const dialog = input.closest("dialog");
    const video = dialog?.querySelector("video");
    if (!video) return;
    const value = Number(input.value);
    if (Number.isFinite(value)) video.currentTime = clamp(value, 0, Number(video.duration) || value);
    updateVbtPlaybackControls(dialog);
    drawVbtOverlay(dialog);
  }

  function setTrimFromPlayhead(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    if (!dialog || !video) return;
    const duration = Number(video.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const state = vbtState(dialog);
    let start = hasFiniteNumber(state.trimStart) ? Number(state.trimStart) : 0;
    let end = hasFiniteNumber(state.trimEnd) ? Number(state.trimEnd) : duration;
    const current = clamp(Number(video.currentTime) || 0, 0, duration);
    const minimumRange = Math.min(0.5, duration * 0.15);
    if (button.dataset.vbtSetTrimFromPlayhead === "start") {
      start = Math.min(current, end - minimumRange);
      start = clamp(start, 0, Math.max(0, duration - minimumRange));
    } else {
      end = Math.max(current, start + minimumRange);
      end = clamp(end, Math.min(duration, start + minimumRange), duration);
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
    const status = dialog.querySelector("[data-vbt-pick-status]");
    if (status) status.textContent = button.dataset.vbtSetTrimFromPlayhead === "start" ? "現在位置を開始にしました。" : "現在位置を終了にしました。";
    drawVbtOverlay(dialog);
  }

  function jumpToTrimPoint(button) {
    const dialog = button.closest("dialog");
    const video = dialog?.querySelector("video");
    if (!video) return;
    const state = vbtState(dialog);
    const target = button.dataset.vbtJumpTrim === "end" ? state.trimEnd : state.trimStart;
    if (hasFiniteNumber(target)) video.currentTime = Number(target);
    video.pause();
    updateVbtPlaybackControls(dialog);
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
    updateVbtPlaybackControls(dialog);
    const warning = dialog.querySelector("[data-vbt-trim-warning]");
    if (warning) {
      const id = dialog.querySelector("[data-vbt-auto-detect]")?.dataset.vbtAutoDetect;
      getVideoRecord(id).then((record) => {
        warning.textContent = getTrimDurationWarning(dialog, record || {});
      }).catch(() => {});
    }
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
      setVbtWizardStep(dialog, "analyzing");
      const analysisStartedAt = performance.now();
      button.disabled = true;
      button.textContent = "計測中...";
      const guide = dialog.querySelector("[data-vbt-video-guide]");
      if (guide) guide.textContent = "1/8 プレート軌跡を高密度に解析しています";
      const videoStatus = dialog.querySelector("[data-vbt-video-status]");
      if (videoStatus) videoStatus.textContent = "精密解析中です。リフター、バー、プレート、軌跡、レップ区間を照合しています。";
      const velocityData = mode === "manual-2point"
        ? await measureManualTwoPoint(dialog, record)
        : mode === "plate-roi-track"
          ? await trackPlateTimeSeries(dialog, record)
          : await trackPlatePath(dialog, record);
      if (guide) guide.textContent = "6/8 レップ区間と待機時間を分離しています";
      if (videoStatus) videoStatus.textContent = "床バウンド、トップ待機、呼吸区間を除外して速度を整理しています。";
      await waitForDeepDetectBudget(analysisStartedAt, VBT_DEEP_RESULT_ANALYSIS_MIN_MS, (message, percent) => {
        if (guide) guide.textContent = message;
        if (videoStatus) videoStatus.textContent = `精密解析 ${Math.round(percent)}%`;
      }, "7/8 速度とレップ区間を再確認中…");
      if (guide) guide.textContent = "8/8 結果を整理しています";
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
      const detectedRepCount = velocityData.primaryVbtMetric?.repCountDetected
        ?? velocityData.measurement?.detectedReps
        ?? (velocityData.measurement?.repMetrics || []).length
        ?? null;
      if (Number.isFinite(Number(detectedRepCount)) && Number(detectedRepCount) > 0) {
        record.reps = Number(detectedRepCount);
      }
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
        markerRoi: velocityData.calibration?.markerRoi || vbtState(dialog).markerRoi || null,
        markerPoint: velocityData.calibration?.markerPoint || vbtState(dialog).markerPoint || null,
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
      setVbtWizardStep(dialog, "result");
      resultBox.scrollIntoView({ behavior: "smooth", block: "start" });
      button.textContent = "保存しました";
      const idleLabel = mode === "manual-2point" ? "手動2点で確認" : mode === "plate-roi-track" ? "3. プレートを追跡して解析" : "中心点追跡β";
      setTimeout(() => { button.textContent = idleLabel; button.disabled = false; }, 1200);
      renderLibrary();
      renderVbtHistory();
    } catch (error) {
      setVbtWizardStep(dialog, "result");
      resultBox.innerHTML = `<section class="vbt-error-card"><strong>解析できませんでした</strong><p>${escapeHtml(error.message || "速度を計算できませんでした。")}</p><button class="text-button" type="button" data-vbt-manual-plate>プレートを調整</button></section>`;
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

  function vbtSetMetricGridMarkup(record) {
    const adapted = adaptVbtRecord(record);
    const detected = hasFiniteNumber(adapted.detectedReps) ? Number(adapted.detectedReps) : null;
    const expected = hasFiniteNumber(adapted.expectedReps) ? Number(adapted.expectedReps) : null;
    const repStatus = detected !== null
      ? `${detected}${Number.isFinite(expected) ? `/${expected}` : ""}`
      : expected !== null ? `--/${expected}` : "--";
    return `
      <div class="vbt-set-metric-grid">
        <span><small>最終Rep</small><strong>${Number.isFinite(adapted.lastRepVelocity) ? `${adapted.lastRepVelocity.toFixed(2)}m/s` : "--"}</strong></span>
        <span><small>セット平均</small><strong>${Number.isFinite(adapted.setAverageVelocity) ? `${adapted.setAverageVelocity.toFixed(2)}m/s` : "--"}</strong></span>
        <span><small>速度低下</small><strong>${Number.isFinite(adapted.velocityLossPercent) ? `${adapted.velocityLossPercent.toFixed(0)}%` : "--"}</strong></span>
        <span><small>検出/入力Rep</small><strong>${repStatus}</strong></span>
      </div>
    `;
  }

  function vbtHistoryMarkup(record, records) {
    const adapted = adaptVbtRecord(record);
    const velocity = adapted.averageVelocity;
    const hasResult = adapted.displayableResult && Number.isFinite(velocity);
    return `
      <article class="vbt-history-card ${adapted.profileEligible ? "" : "warning"}">
        <strong>${escapeHtml(liftLabel(adapted.lift))} ${adapted.weightKg ? `${escapeHtml(formatNumber(adapted.weightKg))}kg` : ""}${adapted.reps ? ` x ${escapeHtml(formatNumber(adapted.reps))}` : ""}${adapted.subjectiveRpe ? ` @${escapeHtml(formatNumber(adapted.subjectiveRpe))}` : ""}</strong>
        <span>${hasResult ? `${adapted.profileEligible ? "プロフィール採用" : "要確認"} / ${escapeHtml(velocity.toFixed(2))} m/s` : "解析結果なし"}</span>
        ${hasResult ? vbtSetMetricGridMarkup(record) : ""}
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
    const adapted = adaptVbtRecord(record);
    const velocity = Number(adapted.setAverageVelocity);
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
        ${status.displayableResult ? vbtSetMetricGridMarkup(record) : ""}
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
          <video playsinline preload="metadata" src="${escapeHtml(url)}" data-vbt-video></video>
          <canvas class="vbt-overlay" data-vbt-canvas></canvas>
        </div>
        <p class="vbt-video-status hidden" data-vbt-video-status>${escapeHtml(mediaStatusMessage("loading"))}</p>
        ${vbtCardMarkup(record)}
        ${record.analysis?.velocityData ? velocityComparisonMarkup(profileRecords, record) : ""}
      </form>
    `;
    dialog.showModal();
    updateVbtWizardChrome(dialog);
    const video = dialog.querySelector("video");
    const videoStatus = dialog.querySelector("[data-vbt-video-status]");
    video?.addEventListener("loadedmetadata", () => {
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("ready");
      syncTrimControls(dialog);
      updateVbtPlaybackControls(dialog);
      drawVbtOverlay(dialog);
    }, { once: true });
    video?.addEventListener("error", () => {
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("error");
    }, { once: true });
    video?.addEventListener("timeupdate", () => updateVbtPlaybackControls(dialog));
    video?.addEventListener("durationchange", () => updateVbtPlaybackControls(dialog));
    video?.addEventListener("play", () => updateVbtPlaybackControls(dialog));
    video?.addEventListener("pause", () => { updateVbtPlaybackControls(dialog); drawRoiPreview(dialog); });
    video?.addEventListener("seeked", () => { updateVbtPlaybackControls(dialog); drawRoiPreview(dialog); });
    if (video?.readyState >= 1) {
      if (videoStatus) videoStatus.textContent = mediaStatusMessage("ready");
      syncTrimControls(dialog);
      updateVbtPlaybackControls(dialog);
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
      reps: els.reps ? Number(els.reps.value || 0) : null,
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
      preloadVbtAiModel();
    }
  });
  els.addMode.addEventListener("click", () => { showMode("add"); preloadVbtAiModel(); });
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
    const wizardStep = event.target.closest("[data-vbt-wizard-step]");
    if (wizardStep) return setVbtWizardStep(wizardStep.closest("dialog"), wizardStep.dataset.vbtWizardStep);
    const autoDetect = event.target.closest("[data-vbt-auto-detect]");
    if (autoDetect) return runAutoPlateDetection(autoDetect);
    const candidateSelect = event.target.closest("[data-vbt-candidate-select]");
    if (candidateSelect) return selectAutoPlateCandidate(candidateSelect);
    const confirmPlate = event.target.closest("[data-vbt-confirm-plate]");
    if (confirmPlate) return confirmAutoDetectedPlate(confirmPlate);
    const manualPlate = event.target.closest("[data-vbt-manual-plate]");
    if (manualPlate) return showManualPlateSelection(manualPlate);
    const markerAssist = event.target.closest("[data-vbt-marker-assist]");
    if (markerAssist) return startMarkerAssist(markerAssist);
    const anchorEnable = event.target.closest("[data-vbt-anchor-enable]");
    if (anchorEnable) {
      const dialog = anchorEnable.closest("dialog");
      if (dialog) showAnchorAssistStep(dialog, vbtState(dialog).autoDetectionMessage || "プレート付近を1回タップしてください。");
      return;
    }
    const playToggle = event.target.closest("[data-vbt-play-toggle]");
    if (playToggle) return toggleVbtPlayback(playToggle);
    const setTrim = event.target.closest("[data-vbt-set-trim-from-playhead]");
    if (setTrim) return setTrimFromPlayhead(setTrim);
    const jumpTrim = event.target.closest("[data-vbt-jump-trim]");
    if (jumpTrim) return jumpToTrimPoint(jumpTrim);
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
    if (event.target.closest("[data-vbt-trim-track]")) return handleTrimTrackPointerDown(event);
    if (event.target.matches("[data-vbt-canvas]")) handleRoiPointerDown(event);
  });
  document.addEventListener("pointermove", (event) => {
    if (document.querySelector("#videoViewerDialog")?._vbtTrimDrag) return handleTrimTrackPointerMove(event);
    if (event.target.matches("[data-vbt-canvas]")) handleRoiPointerMove(event);
  });
  document.addEventListener("pointerup", (event) => {
    if (document.querySelector("#videoViewerDialog")?._vbtTrimDrag) return handleTrimTrackPointerUp(event);
    if (!event.target.matches("[data-vbt-canvas]")) return;
    if (!handleRoiPointerUp(event)) handleVbtCanvasPointer(event);
  });
  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-vbt-playhead-range]")) handleVbtPlayheadInput(event.target);
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
