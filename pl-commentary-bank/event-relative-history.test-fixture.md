# Event-relative history fixture notes

These cases define the expected conservative behavior for manual review until the PL Commentary Bank has a dedicated test runner.

## Case A: two confirmed histories before event

Event:

```json
{ "dateFrom": "2026-10-18" }
```

Histories:

```json
[
  { "date": "2025-06-21", "competitionName": "北見ベンチ", "confirmed": true, "sourceIds": ["hpa-2025-kita"], "results": { "bench": 140 } },
  { "date": "2025-10-18", "competitionName": "北海道クラシックPL", "confirmed": true, "sourceIds": ["hpa-2025-autumn"], "results": { "squat": 230, "bench": 130, "deadlift": 200, "total": 572.5 } }
]
```

Expected: `status: ready`; select both histories as `前々回→前回`.

## Case B: one confirmed history before event

Expected: `履歴不足`.

## Case C: confirmed but no source id

```json
{ "date": "2025-10-18", "competitionName": "北海道クラシックPL", "confirmed": true, "sourceIds": [""] }
```

Expected: excluded; do not treat blank source ids as confirmed source coverage.

## Case D: same-day or future history

History date equal to or after the selected event date is excluded.

## Case E: candidate/unconfirmed history

`confirmed !== true` is excluded even when the entry contains a plausible total.

## Case F: blank competition name

Confirmed history with a valid date and source id but blank `competitionName` is excluded to avoid displaying a date-only ambiguous competition.

## Case G: invalid calendar date

```json
{ "date": "2026-02-30", "competitionName": "存在しない日付の大会", "confirmed": true, "sourceIds": ["hpa-invalid-date"] }
```

Expected: excluded; dates must be real calendar dates, not only strings shaped like `YYYY-MM-DD`.

## Case H: first blank source id with later non-empty id

```json
{ "date": "2025-10-18", "competitionName": "北海道クラシックPL", "confirmed": true, "sourceIds": ["", "hpa-2025-autumn"] }
```

Expected: eligible; sort tie-breaker uses `hpa-2025-autumn`, the first non-empty source id, not the blank first array slot.

## Case I: competition name with surrounding whitespace

```json
{ "date": "2025-10-18", "competitionName": "  北海道クラシックPL  ", "confirmed": true, "sourceIds": ["hpa-2025-autumn"] }
```

Expected: eligible; blank checks and sort comparisons use the trimmed competition name.

## Case J: missing selected event base date

```json
{ "dateFrom": "", "dateTo": "", "date": "" }
```

Expected: `履歴不足`; do not select prior histories when no valid event base date exists.
