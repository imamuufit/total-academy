# Platform Buddy UI/UX Reference

Last reviewed: 2026-06-15

## 1. Product Definition

Platform Buddy is a powerlifting companion for beginner and intermediate lifters.

It connects:

- today's training
- BIG3 progress
- PR-cycle planning
- RPE learning
- video-based VBT review
- competition preparation

The product is not a generic fitness tracker and is not a replacement for a qualified coach, referee, or dedicated measurement device.

Core promise:

> MAX更新から大会挑戦まで、1人で始めたリフターを支える相棒。

## 2. Global Design Principles

### The user should always know the next action

Every screen must answer one primary question.

| Screen | Primary question |
| --- | --- |
| HOME | What should I do next? |
| PLAN | What should I train today? |
| LOG | How quickly can I record this set? |
| VBT | Can I review this set's speed and movement? |
| DATA | What does the recent trend suggest? |
| MEET | What should I prepare before competition? |

### One screen, one purpose

- Show the main action first.
- Keep results large and immediately readable.
- Put detailed explanations, advanced settings, and disclaimers inside accordions.
- Do not make every card visually dominant.
- Prefer short Buddy guidance over long instruction paragraphs.

### Expert without being intimidating

- Use powerlifting language where it improves clarity.
- Explain terms at the point of use.
- Do not require users to study the whole app before training.
- Use supportive language, but do not hide uncertainty.

### Mobile first

- Assume most users operate the app during training on a phone.
- Important actions must work with one hand.
- Avoid horizontal scrolling unless the content is inherently tabular.
- Never rely on hover.
- Fixed controls must not cover inputs or results.

## 3. Reference Apps by Purpose

| Platform Buddy area | Primary reference | Secondary references | What to learn |
| --- | --- | --- | --- |
| VBT measurement flow | Qwik VBT | Metric | Short guided flow, clear target selection, low-friction failure recovery |
| VBT results | Metric | Vitruve, Perch | Large primary metric, bar path, rep detail, confidence and fatigue context |
| LOG input | Strong | Hevy | Fast set entry, minimal explanation, clear completion feedback |
| PLAN and coaching | JuggernautAI | TrainHeroic | Today's task, feedback-to-next-step connection, coaching tone |
| DATA | Metric | Vitruve | Turn numbers into today's training decision |
| MEET | JuggernautAI | Platform Buddy's own competition workflow | Attempts, checklists, rules, and meet-day decisions |

Reference apps are used for product principles, not visual copying.

## 4. VBT Product Contract

### Positioning

Platform Buddy VBT is a supplementary review tool.

Recommended product wording:

> 動画からバー速度の目安を確認し、RPE・体感・重量選択を振り返るための補助ツールです。専用VBT機器の測定値とは一致しない場合があります。

Do not describe it as a guaranteed replacement for dedicated VBT hardware.

### Primary references

#### Qwik VBT

Use as the first UX reference for:

- number of steps from video selection to result
- target-position selection
- obvious progress through measurement
- understandable recovery after failed detection
- shareable result presentation

Qwik VBT is a design reference based on product observation. Verify its current behavior before implementing a specific interaction.

#### Metric

Metric officially presents phone-camera measurement of bar speed, ROM, bar path, and rep count, then connects warm-up velocity to estimated 1RM and training decisions.

Use as the first information-design reference for:

- green path overlay
- result hierarchy
- rep count and velocity display
- load-velocity profile
- today's readiness and e1RM connection

### Required VBT flow

1. Select or record video.
2. Select lift.
3. Trim unnecessary footage.
4. Confirm the plate or tracking target.
5. Analyze.
6. Show a clear result or a clear failure reason.
7. Save or retry.

Advanced settings must not interrupt this main flow.

### Manual-first measurement principle

The first goal of VBT is not complete automation. The goal is to help the user reach a repeatable measurement with as few decisions as possible.

- Automatic detection is an assistive feature, not the sole measurement method.
- Manual correction must remain available when automatic tracking is uncertain.
- A failed automatic result must lead to a clear retry or correction path.
- Prefer a stable manual-assisted result over a confident-looking but unreliable automatic result.
- Do not add automation that makes failure recovery harder.

### VBT result hierarchy

Show in this order:

1. final-rep concentric mean velocity
2. detected reps and confidence
3. velocity loss
4. rep-by-rep velocity
5. ROM and bar path
6. Buddy interpretation
7. advanced diagnostics

### VBT trust rules

- Always show measurement confidence.
- Distinguish detected reps from user-entered reps.
- Never present failed detection as zero reps without explanation.
- If confidence is low, do not recommend a load increase.
- Keep manual correction available.
- Explain why measurement failed and give one next action.
- Do not make Person AI the sole detection criterion.

### Fixed VBT confidence levels

| Internal level | User-facing label | Permitted interpretation | Buddy behavior |
| --- | --- | --- | --- |
| High | 測定安定 | May be used as a reference for RPE and load decisions | May provide a cautious training suggestion |
| Medium | 参考値 | Use for comparisons and trend review only | Do not make a strong load recommendation |
| Low | 不安定 | Do not use for load decisions | Explain the likely issue and suggest correction or retry |
| Failed | 解析不可 | No valid measurement | Show the failure reason and one next action |

Confidence labels must be consistent across results, history, DATA, and Buddy comments.

## 5. LOG Product Contract

Primary references: Strong and Hevy.

Platform Buddy LOG should:

- open directly to set entry
- keep weight, reps, and RPE close together
- make adding, copying, and deleting sets obvious
- keep explanations hidden unless Guide mode is enabled
- show a short completion result after saving
- make editing past records easy

LOG must feel faster than writing in a paper notebook.

## 6. PLAN Product Contract

Primary reference: JuggernautAI.

PLAN is Platform Buddy's main differentiator. It should feel like today's coaching sheet, not a settings screen.

Priority order:

1. today's session
2. today's intent and success condition
3. planned and actual sets
4. Buddy adjustment
5. weekly context
6. cycle settings

Rules:

- Cycle settings remain collapsed after setup.
- RPE guidance must be short and actionable.
- Detailed methodology and disclaimers belong in accordions.
- Planned sets must support the same quality of input as free LOG.
- The next-week recommendation must explain whether to continue, adjust, or pause.

## 7. DATA Product Contract

Primary references: Metric and Vitruve.

DATA should not be a collection of charts. It should help decide what to do next.

Priority order:

1. Buddy decision
2. recent e1RM and VBT direction
3. fatigue and adherence signals
4. supporting charts
5. detailed history

Every important chart should answer:

- What changed?
- Is it meaningful?
- What should I do next?

## 8. MEET Product Contract

Priority order:

1. countdown and today's preparation
2. attempt strategy
3. checklist
4. competition note
5. rules and white-light quiz
6. terminology library

Rules:

- Put actionable competition tools before educational content.
- Keep the terminology library collapsed by category.
- Official rules and event instructions always take priority.
- Encourage secure openers and white lights before aggressive third attempts.

## 9. HOME Product Contract

HOME is not a feature catalog. It is today's decision dashboard.

Priority order:

1. current position
2. goal distance
3. today's plan
4. next competition
5. wellness check
6. Buddy comment
7. next action

Do not add new HOME cards unless they change today's action.

## 10. Copy and Tone

Buddy voice:

- short
- calm
- encouraging
- specific
- honest about uncertainty

Good:

- 今日は少し重そう。下限寄りでOK。
- 最終Repが落ちています。次セットは重量を据え置こう。
- 測定が不安定です。プレート位置を確認しよう。

Avoid:

- long textbook explanations in the main flow
- absolute claims from uncertain data
- excessive warnings
- vague encouragement without an action

## 11. Copying Restrictions

Do not copy:

- logos
- brand colors
- proprietary illustrations
- exact screen layouts
- wording
- animations
- screenshots or assets

Adopt only:

- information hierarchy
- interaction principles
- error-recovery patterns
- clarity of result presentation
- reduction of unnecessary steps

## 12. Review Checklist for Every UI Change

Before approving a change, confirm:

- Does the screen still have one obvious primary action?
- Can a tired user understand it in three seconds?
- Is the main result larger than its explanation?
- Are advanced details collapsed?
- Does it work at 360px phone width?
- Does it avoid covering content with fixed UI?
- Does it state uncertainty where needed?
- Does it preserve `platform-pr-v3` and existing user data?
- Does it avoid copying another product's visual identity?

### Required delivery report for UI changes

Every UI or UX delivery must report:

- changed files
- reason for the change
- affected screens and behavior
- phone verification items
- confirmation that existing user data is preserved
- rollback method

When application files are changed, also report the PWA version and any modified JavaScript functions.

## 13. Current Development Priorities

1. Make VBT measurement reliable and easy to recover when detection fails.
2. Simplify VBT flow using Qwik VBT and Metric as interaction references.
3. Reduce LOG and PLAN entry friction using Strong and Hevy principles.
4. Make DATA lead to an actionable decision.
5. Keep MEET focused on competition preparation before education.
6. Improve performance before adding more large features.

## 14. Official Reference Sources

- Metric: https://metric.coach/
- Strong: https://www.strong.app/
- Hevy: https://www.hevyapp.com/
- JuggernautAI: https://www.juggernautai.app/
- TrainHeroic: https://www.trainheroic.com/
- Vitruve: https://vitruve.fit/
- Perch / Catapult: https://www.catapult.com/perch
