# Platform Buddy VBT Specification

Status: Draft product contract  
Last reviewed: 2026-06-15

## 1. Purpose

Platform Buddy VBT helps a lifter review bar movement and estimated velocity alongside RPE, load, reps, and recent training.

It is a supplementary training-review tool. It is not a guaranteed replacement for dedicated VBT hardware, a coach, or a safety decision.

Recommended user-facing wording:

> 動画からバー速度の目安を確認し、RPE・体感・重量選択を振り返るための補助ツールです。専用VBT機器の測定値とは一致しない場合があります。

## 2. Product Principles

### Manual first, automation assisted

- The goal is repeatable measurement, not complete automation.
- Automatic detection may reduce work but must not be the only path.
- Manual correction must remain available.
- A failed analysis must explain why and provide one clear next action.
- Low-confidence measurements must not trigger load-increase advice.

### One guided path

The standard flow is:

1. Select or record a video.
2. Select the lift.
3. Trim footage to the set.
4. Confirm the plate or tracking target.
5. Analyze.
6. Review result and confidence.
7. Save, correct, or retry.

Advanced diagnostics must not interrupt this path.

## 3. Lift Start Guides

| Lift | Initial target | Movement pattern |
| --- | --- | --- |
| SQ | Plate at standing top position | top -> bottom -> top |
| BP | Plate after unrack at top position | top -> chest/bottom -> top |
| DL | Plate on the floor | floor/bottom -> lockout/top -> return |
| Other | User-selected starting target | detected or manually confirmed |

The user must not be told to start every lift at the bottom position.

## 4. Confidence Contract

| Internal value | Display | Permitted use | Buddy behavior |
| --- | --- | --- | --- |
| `high` | 測定安定 | RPE and cautious load-decision reference | May provide a cautious next-set suggestion |
| `middle` | 参考値 | Trend and previous-set comparison | Do not strongly recommend a load change |
| `low` | 不安定 | Review only | Do not use for load decisions; suggest correction/retry |
| `failed` or no valid result | 解析不可 | No measurement interpretation | Explain failure and show one recovery action |

Confidence display must be consistent in the result hero, VBT history, DATA VBT Profile, Buddy comments, and comparison views.

## 5. Empty, Success, and Failure States

### Empty

- Title: `最初の1本を測定`
- Primary action: `新しい動画`
- Do not use `測定やり直し`.

### Success

Show in this order:

1. final-rep concentric mean velocity
2. confidence
3. detected reps versus entered reps
4. velocity loss
5. rep-by-rep metrics
6. ROM and path
7. Buddy interpretation
8. diagnostics/details

### Failure

Show `解析できませんでした`, one specific likely reason, one primary recovery action, and optional manual correction.

Do not present a failed detection as `0 reps` without explanation.

## 6. Manual Correction

Manual correction must be available when the plate target is incorrect, tracking leaves the plate, detected reps do not match the visible set, confidence is low, or automatic detection fails.

Manual correction should be contextual. Do not show every correction control before it is needed.

Preferred recovery choices:

- `プレート位置を直す`
- `動画範囲を直す`
- `手動で確認`
- `別の動画で再試行`

## 7. Result Metrics

Primary:

- final-rep concentric mean velocity
- detected reps
- tracking confidence
- velocity loss

Secondary:

- best-rep concentric mean velocity
- set-average concentric velocity
- rep-by-rep concentric velocity
- eccentric velocity where reliable
- ROM
- path

Do not make a training recommendation from a metric that is unavailable or low-confidence.

## 8. Buddy Decision Rules

- Prefer final-rep concentric mean velocity over set-average velocity for RPE interpretation.
- Compare with the same lift and similar conditions where possible.
- If confidence is `middle`, describe a trend but avoid a firm load change.
- If confidence is `low` or analysis failed, never recommend adding weight.
- Explain the action, not only the number.

Examples:

- `最終Repまで安定。次セットも同じ重量で進めよう。`
- `速度が落ちています。次セットは据え置きでOK。`
- `測定が不安定です。プレート位置を直して確認しよう。`

## 9. Data Storage

Video and VBT records currently use IndexedDB. UI-only changes must preserve existing records.

Store when available: record and video IDs, lift, date, load, entered reps, RPE, set type, trim range, measurement mode, detected reps, confidence, rep metrics, primary VBT metrics, warnings, and failure reason.

Do not silently treat entered reps as detected reps.

Do not store unnecessary debug or biometric data in normal user records. Development feedback/debug data must remain clearly separated from normal training history.

## 10. Performance

- Prioritize phone stability over maximum sample count.
- Analysis must time out and recover instead of remaining indefinitely busy.
- Show progress during long analysis.
- Release video object URLs and temporary canvases when no longer needed.
- Keep the first VBT screen lightweight.

## 11. Real-Device Test Checklist

Test on phone and desktop:

- Empty state says `最初の1本を測定`, not retry.
- New video flow reaches trimming without confusion.
- SQ starts from standing top plate.
- BP starts from unracked top plate.
- DL starts from floor plate.
- Plate target can be corrected manually.
- Failed detection gives a reason and one recovery action.
- High/Medium/Low/Failed labels match the contract.
- Low confidence never recommends adding weight.
- Detected reps and entered reps are shown separately.
- Result hero shows final-rep velocity first.
- Existing VBT records remain available.
- Fixed UI does not cover measurement controls or results at 360px width.

## 12. Known Boundaries

- Camera angle, frame rate, lighting, occlusion, and calibration affect estimates.
- Dedicated hardware may produce different measurements.
- A clean-looking result is not automatically a high-confidence result.
- Velocity should supplement, not replace, RPE and technical review.
