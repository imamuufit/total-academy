# HPA Event Watch: 2026 Numata result link recheck

Date checked: 2026-07-02

## Scope

Official HPA / 北海道パワーリフティング協会 sources were rechecked for PL Commentary Bank event-index candidate use only.

Priority event:

- 2026-06-21 第36回北海道ベンチプレス選手権大会 / 第30回北海道クラシックベンチプレス選手権大会
- Venue: 沼田町民会館

## Official source findings

### HPA top page

Source title: 北海道パワーリフティング協会HP
Source URL: https://h-power.sakura.ne.jp/

The HPA top page currently lists the 2026 Numata bench meet with:

- Date/location: `2026年6月21日(日) 沼田町民会館`
- Meet names:
  - `第３６回 北海道ベンチプレス選手権大会（フルギア）`
  - `第３０回 北海道クラシックベンチプレス選手権大会（ノーギア）`
- `速 報` links for ABC / DE / FG result PDFs
- Program / 開催要項 / entry / schedule links
- A visible `大会結果` label in the Numata block, but no separate final-result PDF link was confirmed in the parsed official page during this run.

### Official program PDF

Source title: 2026 Numata bench program / 開催要項一式（大会プログラム）
Source URL: https://h-power.sakura.ne.jp/2026hokkaido_natu.pdf

Candidate fields:

```json
{
  "eventYear": 2026,
  "eventName": "第36回北海道ベンチプレス選手権大会 / 第30回北海道クラシックベンチプレス選手権大会",
  "date": "2026-06-21",
  "location": "沼田町民会館",
  "sourceUrl": "https://h-power.sakura.ne.jp/2026hokkaido_natu.pdf",
  "sourceTitle": "2026 Numata bench program / 開催要項一式（大会プログラム）",
  "containsEntryRoster": true,
  "containsResultPdf": false,
  "containsSokuhou": false,
  "containsProgram": true,
  "containsYoutubeLive": false,
  "promotionStatus": "candidate-only"
}
```

### Official 開催要項 PDF

Source title: 2026 Numata bench 開催要項
Source URL: https://h-power.sakura.ne.jp/2026_natuyoukouz.pdf

Candidate fields:

```json
{
  "eventYear": 2026,
  "eventName": "第36回北海道ベンチプレス選手権大会 / 第30回北海道クラシックベンチプレス選手権大会",
  "date": "2026-06-21",
  "location": "沼田町民会館",
  "sourceUrl": "https://h-power.sakura.ne.jp/2026_natuyoukouz.pdf",
  "sourceTitle": "2026 Numata bench 開催要項",
  "containsEntryRoster": false,
  "containsResultPdf": false,
  "containsSokuhou": false,
  "containsProgram": false,
  "containsYoutubeLive": false,
  "promotionStatus": "candidate-only"
}
```

### Official entry PDF

Source title: 2026 Numata bench エントリー
Source URL: https://h-power.sakura.ne.jp/2026natu_entry.pdf

Candidate fields:

```json
{
  "eventYear": 2026,
  "eventName": "第36回北海道ベンチプレス選手権大会 / 第30回北海道クラシックベンチプレス選手権大会",
  "date": "2026-06-21",
  "location": "沼田町民会館",
  "sourceUrl": "https://h-power.sakura.ne.jp/2026natu_entry.pdf",
  "sourceTitle": "2026 Numata bench エントリー",
  "containsEntryRoster": true,
  "containsResultPdf": false,
  "containsSokuhou": false,
  "containsProgram": false,
  "containsYoutubeLive": false,
  "promotionStatus": "candidate-only"
}
```

### Official schedule PDF

Source title: 2026 Numata bench スケジュール
Source URL: https://h-power.sakura.ne.jp/2026natu_sche.pdf

Candidate fields:

```json
{
  "eventYear": 2026,
  "eventName": "第36回北海道ベンチプレス選手権大会 / 第30回北海道クラシックベンチプレス選手権大会",
  "date": "2026-06-21",
  "location": "沼田町民会館",
  "sourceUrl": "https://h-power.sakura.ne.jp/2026natu_sche.pdf",
  "sourceTitle": "2026 Numata bench スケジュール",
  "containsEntryRoster": false,
  "containsResultPdf": false,
  "containsSokuhou": false,
  "containsProgram": true,
  "containsYoutubeLive": false,
  "promotionStatus": "candidate-only"
}
```

### Official sokuhou result PDFs

Source title: 2026 Numata bench 速報 ABC
Source URL: https://h-power.sakura.ne.jp/20260621result_sokuhou_ABC.pdf

Source title: 2026 Numata bench 速報 DE
Source URL: https://h-power.sakura.ne.jp/20260621result_sokuhou_DE.pdf

Source title: 2026 Numata bench 速報 FG
Source URL: https://h-power.sakura.ne.jp/20260621result_sokuhou_FG.pdf

Candidate fields:

```json
{
  "eventYear": 2026,
  "eventName": "第36回北海道ベンチプレス選手権大会 / 第30回北海道クラシックベンチプレス選手権大会",
  "date": "2026-06-21",
  "location": "沼田町民会館",
  "sourceUrls": [
    "https://h-power.sakura.ne.jp/20260621result_sokuhou_ABC.pdf",
    "https://h-power.sakura.ne.jp/20260621result_sokuhou_DE.pdf",
    "https://h-power.sakura.ne.jp/20260621result_sokuhou_FG.pdf"
  ],
  "sourceTitle": "2026 Numata bench 速報 PDFs ABC / DE / FG",
  "containsEntryRoster": false,
  "containsResultPdf": false,
  "containsSokuhou": true,
  "containsProgram": false,
  "containsYoutubeLive": false,
  "promotionStatus": "candidate-only"
}
```

## Separation rules

- No athlete master data was edited.
- No event entries were edited.
- No confirmed histories were edited.
- No research candidates were promoted.
- `v5.9.6_LOCK` layout and output constraints were not changed.

## Next safe normalization candidate

If a dedicated `event-index-2026-official-candidates.json` exists in the active branch, the Numata event can be normalized to keep:

- `hasSokuhou: true`
- `hasResultPdf: false` until HPA publishes or clearly labels a final result PDF separate from the速報 files
- `hasProgram: true`
- `hasEntryRoster: true`
- `hasYoutubeLive: true` only if the HPA official YouTube streams source is represented as a separate source locator

Do not promote individual athlete results from the速報 PDFs into confirmed histories without explicit source-linking and the existing confirmed-history safety contract.
