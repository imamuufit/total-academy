# Event-relative history safety contract

This contract protects the PL Commentary Bank `前々回→前回` feature while event data is incomplete.

## 기준日

Use the selected event date as the athlete-specific base date. Prefer `dateFrom`, then `dateTo`, then `date`.

## Eligible histories

A history entry is eligible only when all of the following are true:

- `confirmed === true`
- `date` is a valid `YYYY-MM-DD` real calendar date
- `date` is strictly before the selected event base date
- `competitionName` is not blank
- `sourceIds` contains at least one non-empty value

Do not use unconfirmed candidate data.

## Selection rule

Sort eligible histories by:

1. date
2. competition name
3. first non-empty source id

Select only the latest two eligible histories for `前々回→前回`.

## Incomplete data

When fewer than two eligible prior histories exist, show `履歴不足`.

## Progress text

Only mechanical kg and percentage differences may be generated from the two confirmed histories. Do not generate assertive progress/evaluation comments from candidates or incomplete data.

## Print layout

This helper is UI-agnostic and must not change the v5.9.6_LOCK A4 print layout, CSS, page structure, or player card geometry.
