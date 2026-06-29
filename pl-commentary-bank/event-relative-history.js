// PL Commentary Bank: conservative event-relative history helper
// This module is intentionally UI-agnostic so the v5.9.6_LOCK A4 print layout stays untouched.

const HISTORY_SHORTAGE_LABEL = "履歴不足";

function normalizeDate(value) {
  if (!value) return "";
  const text = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  return text;
}

function resolveEventBaseDate(event) {
  if (!event || typeof event !== "object") return "";
  return normalizeDate(event.dateFrom) || normalizeDate(event.dateTo) || normalizeDate(event.date);
}

function hasNonEmptySourceId(history) {
  return Array.isArray(history?.sourceIds) && history.sourceIds.some((sourceId) => String(sourceId || "").trim().length > 0);
}

function hasCompetitionName(history) {
  return String(history?.competitionName || "").trim().length > 0;
}

function isConfirmedPriorHistory(history, baseDate) {
  const historyDate = normalizeDate(history?.date);
  return Boolean(
    baseDate &&
    history &&
    history.confirmed === true &&
    hasNonEmptySourceId(history) &&
    hasCompetitionName(history) &&
    historyDate &&
    historyDate < baseDate
  );
}

function sortConfirmedHistories(histories) {
  return [...histories].sort((a, b) => {
    const dateCompare = normalizeDate(a.date).localeCompare(normalizeDate(b.date));
    if (dateCompare !== 0) return dateCompare;

    const nameCompare = String(a.competitionName || "").localeCompare(String(b.competitionName || ""), "ja");
    if (nameCompare !== 0) return nameCompare;

    const aFirstSource = String(a.sourceIds?.[0] || "");
    const bFirstSource = String(b.sourceIds?.[0] || "");
    return aFirstSource.localeCompare(bFirstSource, "ja");
  });
}

function selectPreviousTwoHistories(athlete, event) {
  const baseDate = resolveEventBaseDate(event);
  const histories = Array.isArray(athlete?.histories) ? athlete.histories : [];
  const confirmedPriorHistories = sortConfirmedHistories(histories.filter((history) => isConfirmedPriorHistory(history, baseDate)));

  if (confirmedPriorHistories.length < 2) {
    return {
      status: "shortage",
      label: HISTORY_SHORTAGE_LABEL,
      baseDate,
      previousTwo: []
    };
  }

  return {
    status: "ready",
    label: "前々回→前回",
    baseDate,
    previousTwo: confirmedPriorHistories.slice(-2)
  };
}

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildMechanicalProgressDiff(previousTwo) {
  if (!Array.isArray(previousTwo) || previousTwo.length !== 2) return [];
  const [older, newer] = previousTwo;
  const lifts = [
    ["SQ", "squat"],
    ["BP", "bench"],
    ["DL", "deadlift"],
    ["Total", "total"]
  ];

  return lifts.flatMap(([label, key]) => {
    const olderValue = toFiniteNumber(older?.results?.[key]);
    const newerValue = toFiniteNumber(newer?.results?.[key]);
    if (olderValue === null || newerValue === null) return [];

    const diff = newerValue - olderValue;
    const percent = olderValue > 0 ? (diff / olderValue) * 100 : null;

    return [{
      label,
      diffKg: diff,
      percent,
      note: "確認済み2大会の数値差分です。評価コメントではありません。"
    }];
  });
}

export {
  HISTORY_SHORTAGE_LABEL,
  buildMechanicalProgressDiff,
  hasNonEmptySourceId,
  isConfirmedPriorHistory,
  resolveEventBaseDate,
  selectPreviousTwoHistories,
  sortConfirmedHistories
};
