const STORAGE_KEY = "platform-pr-v3";
const OLD_STORAGE_KEYS = ["platform-pr-v2", "platform-pr-v1"];

const exerciseCatalog = {
  power: {
    label: "BIG3 / 競技",
    exercises: [
      ["squat", "スクワット", "SQ"],
      ["bench", "ベンチプレス", "BP"],
      ["deadlift", "デッドリフト", "DL"],
      ["pause_squat", "ポーズスクワット", "SQ"],
      ["tempo_squat_400", "テンポスクワット 4-0-0", "SQ"],
      ["pin_squat", "ピンスクワット", "SQ"],
      ["high_bar_squat", "ハイバースクワット", "SQ"],
      ["front_squat", "フロントスクワット", "SQ"],
      ["ssb_squat", "セーフティバースクワット", "SQ"],
      ["box_squat", "ボックススクワット", "SQ"],
      ["belt_squat", "ベルトスクワット", "SQ"],
      ["goblet_squat", "ゴブレットスクワット", "SQ"],
      ["close_grip_bench", "ナローグリップベンチ", "BP"],
      ["wide_grip_bench", "ワイドグリップベンチ", "BP"],
      ["pause_bench", "ポーズベンチ", "BP"],
      ["long_pause_bench_020", "ロングポーズベンチ 0-2-0", "BP"],
      ["tempo_bench", "テンポベンチ", "BP"],
      ["larsen_bench", "ラーセンプレス", "BP"],
      ["spoto_press", "スポトプレス", "BP"],
      ["pin_press", "ピンベンチプレス", "BP"],
      ["floor_press", "フロアプレス", "BP"],
      ["slingshot_bench", "スリングショットベンチ", "BP"],
      ["deficit_deadlift", "デフィシットデッドリフト", "DL"],
      ["pause_deadlift_020", "ポーズデッドリフト 0-2-0", "DL"],
      ["tempo_deadlift_400", "テンポデッドリフト 4-0-0", "DL"],
      ["rack_pull", "ラックプル", "DL"],
      ["block_pull", "ブロックプル", "DL"],
      ["rdl", "ルーマニアンデッドリフト", "DL"],
      ["stiff_leg_deadlift", "スティッフレッグデッドリフト", "DL"],
      ["snatch_grip_deadlift", "スナッチグリップデッドリフト", "DL"],
      ["sumo_block_pull", "相撲ブロックプル", "DL"]
    ]
  },
  legs: {
    label: "脚",
    exercises: [
      ["leg_press", "レッグプレス", "脚"],
      ["leg_extension", "レッグエクステンション", "脚"],
      ["leg_curl", "レッグカール", "脚"],
      ["split_squat", "ブルガリアンスクワット", "脚"],
      ["lunge", "ランジ", "脚"],
      ["walking_lunge", "ウォーキングランジ", "脚"],
      ["step_up", "ステップアップ", "脚"],
      ["hack_squat", "ハックスクワット", "脚"],
      ["hip_thrust", "ヒップスラスト", "脚"],
      ["glute_bridge", "グルートブリッジ", "脚"],
      ["good_morning", "グッドモーニング", "脚"],
      ["adductor_machine", "アダクター", "脚"],
      ["abductor_machine", "アブダクター", "脚"],
      ["calf_raise", "カーフレイズ", "脚"]
    ]
  },
  back: {
    label: "背中",
    exercises: [
      ["barbell_row", "バーベルロー", "背中"],
      ["dumbbell_row", "ダンベルロー", "背中"],
      ["lat_pulldown", "ラットプルダウン", "背中"],
      ["pull_up", "懸垂", "背中"],
      ["chin_up", "チンニング", "背中"],
      ["seated_row", "シーテッドロー", "背中"],
      ["chest_supported_row", "チェストサポートロー", "背中"],
      ["seal_row", "シールロー", "背中"],
      ["t_bar_row", "Tバーロー", "背中"],
      ["straight_arm_pulldown", "ストレートアームプルダウン", "背中"],
      ["back_extension", "バックエクステンション", "背中"]
    ]
  },
  chest_shoulders: {
    label: "胸 / 肩",
    exercises: [
      ["incline_bench", "インクラインベンチ", "胸"],
      ["dumbbell_press", "ダンベルプレス", "胸"],
      ["dumbbell_bench_press", "ダンベルベンチプレス", "胸"],
      ["machine_chest_press", "マシンチェストプレス", "胸"],
      ["push_up", "プッシュアップ", "胸"],
      ["pec_fly", "ペックフライ", "胸"],
      ["overhead_press", "オーバーヘッドプレス", "肩"],
      ["seated_dumbbell_press", "シーテッドダンベルプレス", "肩"],
      ["lateral_raise", "サイドレイズ", "肩"],
      ["rear_delt_raise", "リアレイズ", "肩"],
      ["face_pull", "フェイスプル", "肩"]
    ]
  },
  arms_core: {
    label: "腕 / 体幹",
    exercises: [
      ["curl", "アームカール", "腕"],
      ["hammer_curl", "ハンマーカール", "腕"],
      ["triceps_extension", "トライセプスエクステンション", "腕"],
      ["pushdown", "プッシュダウン", "腕"],
      ["skull_crusher", "スカルクラッシャー", "腕"],
      ["jm_press", "JMプレス", "腕"],
      ["dip", "ディップス", "腕"],
      ["plank", "プランク", "体幹"],
      ["side_plank", "サイドプランク", "体幹"],
      ["ab_rollout", "アブローラー", "体幹"],
      ["hanging_leg_raise", "ハンギングレッグレイズ", "体幹"],
      ["pallof_press", "パロフプレス", "体幹"],
      ["weighted_crunch", "加重クランチ", "体幹"],
      ["dead_bug", "デッドバグ", "体幹"]
    ]
  },
  conditioning: {
    label: "コンディショニング",
    exercises: [
      ["sled_push", "スレッドプッシュ", "調整"],
      ["bike", "バイク", "調整"],
      ["walk", "ウォーキング", "調整"],
      ["mobility", "モビリティ", "調整"]
    ]
  },
  custom: {
    label: "カスタム",
    exercises: [["custom", "自由入力", "自由"]]
  }
};

const mainLiftIds = ["squat", "bench", "deadlift"];
const mainLiftNames = { squat: "SQ", bench: "BP", deadlift: "DL" };
const meetReviewLifts = [
  { id: "squat", label: "スクワット", short: "SQ" },
  { id: "bench", label: "ベンチプレス", short: "BP" },
  { id: "deadlift", label: "デッドリフト", short: "DL" }
];
const meetAttemptResults = {
  success: "成功",
  fail: "失敗",
  pass: "未実施"
};
const meetJudgeOptions = {
  pass: "未実施",
  white: "白",
  red1: "赤① 深さ/胸接触/ロックアウト",
  red2: "赤② 下がり/姿勢/支持",
  red3: "赤③ コール/ラック/足"
};
const meetPrepChecklistItems = [
  ["guideline", "大会要項確認"],
  ["weighin", "検量時間確認"],
  ["rules", "最新ルール確認"],
  ["singlet", "シングレット"],
  ["belt", "ベルト"],
  ["wristwraps", "リストラップ"],
  ["kneesleeves", "ニースリーブ"],
  ["socks", "ハイソックス"],
  ["shoes", "シューズ"],
  ["openers", "オープナー候補"],
  ["notebook", "大会ノート準備"]
];
const meetPrepChecklistGroups = [
  { title: "大会情報", ids: ["guideline", "weighin", "rules"] },
  { title: "ギア・服装", ids: ["singlet", "belt", "wristwraps", "kneesleeves", "socks", "shoes"] },
  { title: "試技準備", ids: ["openers", "notebook"] }
];

const wellnessFields = [
  {
    id: "sleep",
    label: "睡眠",
    weight: 20,
    defaultValue: "normal",
    choices: [
      { value: "good", label: "良い", factor: 1 },
      { value: "normal", label: "普通", factor: 0.7 },
      { value: "bad", label: "悪い", factor: 0 }
    ]
  },
  {
    id: "nutrition",
    label: "食事・水分",
    weight: 10,
    defaultValue: "normal",
    choices: [
      { value: "good", label: "十分", factor: 1 },
      { value: "normal", label: "普通", factor: 0.7 },
      { value: "bad", label: "不足", factor: 0.2 }
    ]
  },
  {
    id: "fatigue",
    label: "疲労・筋肉痛",
    weight: 25,
    defaultValue: "normal",
    choices: [
      { value: "good", label: "軽い", factor: 1 },
      { value: "normal", label: "普通", factor: 0.7 },
      { value: "bad", label: "重い", factor: 0.15 }
    ]
  },
  {
    id: "pain",
    label: "関節・痛み",
    weight: 30,
    defaultValue: "good",
    choices: [
      { value: "good", label: "なし", factor: 1 },
      { value: "normal", label: "少し", factor: 0.45 },
      { value: "bad", label: "強い", factor: 0 }
    ]
  },
  {
    id: "mental",
    label: "集中・気持ち",
    weight: 15,
    defaultValue: "normal",
    choices: [
      { value: "good", label: "高い", factor: 1 },
      { value: "normal", label: "普通", factor: 0.7 },
      { value: "bad", label: "低い", factor: 0.25 }
    ]
  }
];
const meetRedReasons = {
  none: "赤なし",
  depth: "深さ",
  command: "コール",
  pause: "胸止め",
  butt: "尻上がり",
  foot: "足のズレ",
  downward: "下がり",
  hitch: "引っかけ",
  lockout: "ロックアウト",
  balance: "バランス",
  setup: "セットアップ",
  other: "その他"
};
const meetRedReasonOptions = {
  squat: {
    none: "赤なし",
    red1: "赤① 深さ不足",
    red2: "赤② 姿勢・膝ロック・切り返し・下がり",
    red3: "赤③ 足の動き・コール・ラック動作"
  },
  bench: {
    none: "赤なし",
    red1: "赤① 胸/腹部に触れない・ベルト接触・肘の深さ",
    red2: "赤② 挙上中の下がり・肘ロック不足",
    red3: "赤③ コール・沈み・尻/足/頭/グリップ"
  },
  deadlift: {
    none: "赤なし",
    red1: "赤① 膝ロック不足・肩が返らない",
    red2: "赤② 下がり・大腿部で支持",
    red3: "赤③ コール前に下ろす・コントロール不足・足の動き"
  }
};
const meetStickingPoints = {
  none: "特になし",
  setup: "セットアップ",
  descent: "下ろし",
  bottom: "ボトム",
  offChest: "胸から離れる瞬間",
  middle: "中間",
  top: "トップ",
  lockout: "ロックアウト",
  grip: "グリップ",
  mental: "メンタル"
};

const weightClasses = {
  male: [
    ["59", "59kg級", 59],
    ["66", "66kg級", 66],
    ["74", "74kg級", 74],
    ["83", "83kg級", 83],
    ["93", "93kg級", 93],
    ["105", "105kg級", 105],
    ["120", "120kg級", 120],
    ["120+", "120kg超級", Infinity]
  ],
  female: [
    ["47", "47kg級", 47],
    ["52", "52kg級", 52],
    ["57", "57kg級", 57],
    ["63", "63kg級", 63],
    ["69", "69kg級", 69],
    ["76", "76kg級", 76],
    ["84", "84kg級", 84],
    ["84+", "84kg超級", Infinity]
  ]
};

const exerciseAlternatives = {
  ssb_squat: {
    groups: [
      {
        title: "競技に近い",
        items: [
          ["high_bar_squat", "スクワット姿勢と上背部の維持"],
          ["front_squat", "体幹と上背部を強く使う"],
          ["pause_squat", "ボトム姿勢を安定させる"],
          ["tempo_squat_400", "フォームを崩さず丁寧に積む"]
        ]
      },
      {
        title: "脚を鍛える代替",
        items: [
          ["leg_press", "腰背部の負担を抑えて脚に寄せる"],
          ["split_squat", "片脚で脚のボリュームを確保"]
        ]
      }
    ]
  },
  belt_squat: {
    groups: [
      {
        title: "設備が少なくても",
        items: [
          ["split_squat", "脚を狙いやすく負荷も調整しやすい"],
          ["goblet_squat", "軽めの日やフォーム練習に使いやすい"],
          ["front_squat", "体幹を使いながら四頭筋へ寄せる"]
        ]
      },
      {
        title: "マシンがあれば",
        items: [
          ["leg_press", "腰背部を抑えながら高めのボリューム"],
          ["hack_squat", "四頭筋に寄せたスクワット代替"]
        ]
      }
    ]
  },
  seal_row: {
    groups: [
      {
        title: "反動を抑える",
        items: [
          ["chest_supported_row", "腰を使わず背中で引く"],
          ["dumbbell_row", "片側ずつ可動域を取りやすい"],
          ["seated_row", "軌道が安定して扱いやすい"]
        ]
      }
    ]
  },
  chest_supported_row: {
    groups: [
      {
        title: "腰の負担を抑える",
        items: [
          ["seated_row", "姿勢を固定しやすい"],
          ["dumbbell_row", "ベンチがあれば近い狙いで実施可能"],
          ["lat_pulldown", "背中のボリュームを安全に足す"]
        ]
      }
    ]
  },
  t_bar_row: {
    groups: [
      {
        title: "水平プルを置き換える",
        items: [
          ["barbell_row", "高重量の水平プルとして近い"],
          ["dumbbell_row", "左右差を見ながら積める"],
          ["seated_row", "ケーブルで安定して引ける"]
        ]
      }
    ]
  },
  rack_pull: {
    groups: [
      {
        title: "デッドリフトに近い",
        items: [
          ["block_pull", "高さを作れる環境なら最も近い"],
          ["rdl", "ヒンジと背面の補強に使いやすい"],
          ["pause_deadlift_020", "床引きの精度を保ったまま弱点補強"]
        ]
      }
    ]
  },
  block_pull: {
    groups: [
      {
        title: "高さが作れない場合",
        items: [
          ["rack_pull", "ラックが使えるなら近い"],
          ["rdl", "背面と股関節主導の補強"],
          ["pause_deadlift_020", "通常デッドリフトに近いまま調整"]
        ]
      }
    ]
  },
  pin_press: {
    groups: [
      {
        title: "ベンチの弱点補強",
        items: [
          ["pause_bench", "胸で止める精度を高める"],
          ["spoto_press", "切り返し付近を丁寧に鍛える"],
          ["floor_press", "可動域を絞って押し切りを補強"]
        ]
      }
    ]
  }
};

const facilityExerciseOptions = [
  "ssb_squat",
  "belt_squat",
  "seal_row",
  "chest_supported_row",
  "t_bar_row",
  "rack_pull",
  "block_pull",
  "pin_press"
];

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "山梨県",
  "新潟県", "長野県", "富山県", "石川県", "福井県",
  "静岡県", "愛知県", "三重県", "岐阜県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "香川県", "徳島県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const ruleSource = {
  label: "IPF Technical Rules / JPA公式ルール",
  jpaUrl: "https://www.jpa-powerlifting.or.jp/rules-members.php",
  ipfUrl: "https://www.powerlifting.sport/rules/codes/info/technical-rules",
  lastChecked: "2026-05-04"
};

const quizCategories = {
  squat: { label: "スクワット", short: "SQ", description: "深さ、コール、動作中の失敗を確認。" },
  bench: { label: "ベンチプレス", short: "BP", description: "静止、コール、足や尻のルールを確認。" },
  deadlift: { label: "デッドリフト", short: "DL", description: "ロックアウト、下ろし方、反則動作を確認。" },
  meet: { label: "試技申請・大会進行", short: "進行", description: "試技順、重量変更、コールの流れを確認。" },
  gear: { label: "検量・服装・ギア", short: "ギア", description: "検量、装備、当日の持ち物を確認。" },
  manners: { label: "初出場者向けマナー", short: "初出場", description: "会場で迷わないための振る舞いを確認。" }
};

const ruleQuestions = [
  {
    id: "sq_depth_001",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットで白判定になりやすい深さとして正しいものはどれ？",
    choices: ["太ももが床と平行になればよい", "股関節側の大腿上面が膝上面より低くなる", "お尻が膝と同じ高さならよい"],
    answerIndex: 1,
    explanation: "スクワットは十分な深さが必要です。初心者は「平行っぽい」ではなく、股関節側が膝より低いかを動画で確認すると赤判定を減らしやすくなります。",
    sourceSection: "スクワット / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "sq_start_002",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットでしゃがみ始めるタイミングとして正しいものは？",
    choices: ["ラックアウトしたらすぐしゃがむ", "主審のSquatの合図を待ってからしゃがむ", "横の審判がうなずいたらしゃがむ"],
    answerIndex: 1,
    explanation: "ラックアウト後に静止し、主審の合図を待ちます。合図前に動くと、重量が軽くても赤判定の原因になります。",
    sourceSection: "スクワット / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "sq_rack_003",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットを立ち上がった後、ラックへ戻す正しい流れは？",
    choices: ["立てたら自分の判断ですぐ戻す", "主審のRackの合図を待ってから戻す", "補助員が触れたら戻す"],
    answerIndex: 1,
    explanation: "立ち上がった後も試技は終わっていません。主審のRackの合図を待ってからラックへ戻します。",
    sourceSection: "スクワット / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "sq_downward_004",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットの立ち上がり中に赤判定になりやすい動きはどれ？",
    choices: ["少しゆっくり立つ", "立ち上がり中にバーが明確に下がる", "顔を上げる"],
    answerIndex: 1,
    explanation: "立ち上がり中にバーが下がると失敗判定の原因になります。粘る練習でも、下がってから立て直す癖は大会では危険です。",
    sourceSection: "スクワット / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "sq_feet_005",
    category: "squat",
    difficulty: "beginner",
    question: "スクワット試技中の足の扱いで避けたいものは？",
    choices: ["足幅を事前に決める", "試技中に足を踏み替える", "つま先の向きを整えてから合図を待つ"],
    answerIndex: 1,
    explanation: "試技中に足を動かす、踏み替える行為は赤判定につながります。ラックアウト後に足位置を決めたら、静止して合図を待ちましょう。",
    sourceSection: "スクワット / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_start_001",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスでバーを胸へ下ろし始める前に必要なことは？",
    choices: ["自分のタイミングで下ろす", "主審のStartの合図を待つ", "補助員が離れた瞬間に下ろす"],
    answerIndex: 1,
    explanation: "ベンチプレスは開始姿勢を作り、主審のStartの合図を待ちます。合図前の動作は白判定を逃す代表例です。",
    sourceSection: "ベンチプレス / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "bp_press_002",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスで胸に下ろした後、押し始めるタイミングは？",
    choices: ["胸に触れた瞬間", "主審のPressの合図の後", "自分が止まったと思った瞬間"],
    answerIndex: 1,
    explanation: "胸または腹部でバーを静止させ、主審のPressの合図を待ちます。普段の練習から止める癖を作ると本番で安定します。",
    sourceSection: "ベンチプレス / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "bp_rack_003",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスで押し切った後の正しい流れは？",
    choices: ["肘が伸びたらすぐラックに戻す", "主審のRackの合図を待つ", "セコンドの声で戻す"],
    answerIndex: 1,
    explanation: "押し切った後もRackの合図を待ちます。最後まで静止してコントロールする意識が白判定につながります。",
    sourceSection: "ベンチプレス / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "bp_butt_004",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレス中に赤判定になりやすいものは？",
    choices: ["肩甲骨を寄せる", "尻がベンチから浮く", "足を床につけて踏ん張る"],
    answerIndex: 1,
    explanation: "試技中に尻がベンチから浮くと失敗判定の原因になります。ブリッジを強くするほど、尻の接地確認が大切です。",
    sourceSection: "ベンチプレス / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_downward_005",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスの押し上げ中に避けたい動きは？",
    choices: ["左右差なく押す", "バーが明確に下がる", "肘を最後まで伸ばす"],
    answerIndex: 1,
    explanation: "押し上げ中にバーが下がると赤判定の原因になります。粘る練習でも、下がったら失敗になりやすいことを覚えておきましょう。",
    sourceSection: "ベンチプレス / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "dl_start_001",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトの引き始めで正しいものは？",
    choices: ["主審のStartを待つ", "自分のタイミングで引き始める", "セコンドの合図だけで引く"],
    answerIndex: 1,
    explanation: "デッドリフトに開始合図はありません。準備ができたら制限時間内に自分のタイミングで引き始めます。",
    sourceSection: "デッドリフト / 試技動作",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "dl_down_002",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトで下ろし始めるタイミングとして正しいものは？",
    choices: ["立てたらすぐ落とす", "主審のDownの合図を待つ", "観客が拍手したら下ろす"],
    answerIndex: 1,
    explanation: "膝と股関節を伸ばして静止し、主審のDownの合図を待ってから下ろします。引き切った後の焦りに注意です。",
    sourceSection: "デッドリフト / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "dl_hitch_003",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトで赤判定になりやすいものは？",
    choices: ["最後に胸を張る", "太ももにバーを乗せて引き上げる", "バーを体に近づける"],
    answerIndex: 1,
    explanation: "太ももにバーを乗せて支えるような引き上げは反則動作になりやすいです。ロックアウトまで一連の動作で引き切りましょう。",
    sourceSection: "デッドリフト / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "dl_knees_004",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトのフィニッシュで大切な姿勢は？",
    choices: ["膝と股関節が伸びて直立している", "肩が少し前でもバーが止まればよい", "膝が曲がっていても握れていればよい"],
    answerIndex: 0,
    explanation: "フィニッシュでは膝と股関節を伸ばし、直立した姿勢で静止する必要があります。最後のロックアウト練習は白判定に直結します。",
    sourceSection: "デッドリフト / 試技動作",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "dl_drop_005",
    category: "deadlift",
    difficulty: "beginner",
    question: "Downの合図後、バーの下ろし方として避けたいものは？",
    choices: ["両手でコントロールして下ろす", "手を離して落とす", "最後までバーを保持する"],
    answerIndex: 1,
    explanation: "合図後もバーをコントロールして下ろします。床に落とす癖は大会では危険なので、練習から最後まで持つ意識を作りましょう。",
    sourceSection: "デッドリフト / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_minute_001",
    category: "meet",
    difficulty: "beginner",
    question: "試技で名前が呼ばれた後、一般的に意識すべきことは？",
    choices: ["制限時間内に試技を開始する", "好きなタイミングで何分でも準備する", "次の選手が準備できるまで待つ"],
    answerIndex: 0,
    explanation: "大会では進行時間があります。呼び出し後に焦らないよう、ラック高さ、ベルト、ニースリーブなどを事前に整えておきましょう。",
    sourceSection: "大会進行 / 制限時間",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_attempt_002",
    category: "meet",
    difficulty: "beginner",
    question: "次の試技重量を出すときに大切なことは？",
    choices: ["締切を過ぎても自由に変えられる", "定められた時間内に申請する", "第三試技だけ申請すればよい"],
    answerIndex: 1,
    explanation: "試技重量の申請には時間制限があります。初心者はセコンドや記録係と、次の重量を事前に決めておくと安心です。",
    sourceSection: "大会進行 / 試技申請",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_order_003",
    category: "meet",
    difficulty: "beginner",
    question: "パワーリフティング大会の基本的な種目順として一般的なものは？",
    choices: ["デッドリフト、ベンチ、スクワット", "スクワット、ベンチプレス、デッドリフト", "ベンチ、スクワット、デッドリフト"],
    answerIndex: 1,
    explanation: "基本はスクワット、ベンチプレス、デッドリフトの順です。アップの時間配分もこの順番を前提に考えます。",
    sourceSection: "大会進行 / 種目順",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "meet_first_004",
    category: "meet",
    difficulty: "beginner",
    question: "第一試技の考え方として安全なのはどれ？",
    choices: ["当日初めて触る重量にする", "練習で安定して成功している重量にする", "必ず自己ベストより重くする"],
    answerIndex: 1,
    explanation: "第一試技は大会の流れを作る重量です。白判定を取れる重量から入り、第二・第三へつなげる考え方が堅実です。",
    sourceSection: "大会進行 / 試技選択",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_judge_005",
    category: "meet",
    difficulty: "beginner",
    question: "大会当日の判断で最優先すべきものは？",
    choices: ["SNSで見た解釈", "審判・大会運営の指示と大会要項", "普段のジムのローカルルール"],
    answerIndex: 1,
    explanation: "大会では主催団体の要項、最新ルール、審判・運営の指示が優先です。アプリは学習補助として使いましょう。",
    sourceSection: "大会進行 / 公式判断",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_weigh_001",
    category: "gear",
    difficulty: "beginner",
    question: "検量について正しい考え方はどれ？",
    choices: ["大会要項にある時間を確認して受ける", "試技開始後でも自由に受けられる", "体重階級は当日いつでも変えられる"],
    answerIndex: 0,
    explanation: "検量時間や手順は大会要項で確認します。階級や受付の扱いは大会ごとに案内があるため、事前確認が大切です。",
    sourceSection: "検量 / 大会要項",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_costume_002",
    category: "gear",
    difficulty: "beginner",
    question: "大会で使う服装・ギアについて安全な準備は？",
    choices: ["当日会場で何とかする", "大会要項と公式ルールで使用可否を確認する", "有名選手が使っていれば必ず使える"],
    answerIndex: 1,
    explanation: "シングレット、ベルト、リストラップ、ニースリーブなどは規定があります。大会前に必ず要項とルールを確認しましょう。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_socks_003",
    category: "gear",
    difficulty: "beginner",
    question: "デッドリフトで靴下に関して確認したいことは？",
    choices: ["どんな長さでも絶対に問題ない", "デッドリフト用の規定や大会要項を確認する", "裸足なら確認不要"],
    answerIndex: 1,
    explanation: "デッドリフトではすねを守る装備に規定があります。靴やソックスも含め、当日使うものは早めに確認しておきましょう。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_approved_004",
    category: "gear",
    difficulty: "beginner",
    question: "装備品で迷ったときに一番よい対応は？",
    choices: ["大会当日に初めて審判へ聞く", "事前に大会要項・公式情報を確認し、不明点は主催者へ確認する", "同じジムの人が使えたなら確認しない"],
    answerIndex: 1,
    explanation: "装備トラブルは試技前の不安になります。事前に公式情報と大会要項を見て、不明点は主催者へ確認するのが安全です。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_rack_005",
    category: "gear",
    difficulty: "beginner",
    question: "ラック高さ・セーフティ設定について正しい準備は？",
    choices: ["当日の係に完全に任せる", "事前に自分の高さを把握して申告・確認する", "毎試技ランダムでよい"],
    answerIndex: 1,
    explanation: "ラック高さの迷いは試技時間と集中力を削ります。普段から自分の高さを記録し、大会当日は早めに確認しましょう。",
    sourceSection: "大会進行 / ラック設定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_platform_001",
    category: "manners",
    difficulty: "beginner",
    question: "初出場でプラットフォームへ向かう前に大切なことは？",
    choices: ["呼ばれてから慌てて準備する", "ベルトやリストラップを含め、すぐ試技できる状態にする", "スマホ撮影を優先する"],
    answerIndex: 1,
    explanation: "呼び出し後は時間が限られます。装備、チョーク、心拍を整え、試技に集中できる状態で待ちましょう。",
    sourceSection: "大会進行 / 選手の準備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_warmup_002",
    category: "manners",
    difficulty: "beginner",
    question: "アップ場での振る舞いとしてよいものは？",
    choices: ["周囲とラックやプレートを譲り合う", "一人で長時間ラックを占有する", "使ったプレートをそのままにする"],
    answerIndex: 0,
    explanation: "アップ場は共有スペースです。譲り合いと片付けができると、自分も周囲も落ち着いて試合に入れます。",
    sourceSection: "大会マナー / アップ場",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_calls_003",
    category: "manners",
    difficulty: "beginner",
    question: "コールを聞き逃さないために有効な準備は？",
    choices: ["音楽を大音量で流し続ける", "試技前は主審の声と動作に集中する", "観客席だけを見る"],
    answerIndex: 1,
    explanation: "大会ではコールが試技の一部です。特にスクワットとベンチは、普段から合図練習をしておくと落ち着けます。",
    sourceSection: "主審の合図 / 選手準備",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "manners_question_004",
    category: "manners",
    difficulty: "beginner",
    question: "ルールや進行で不安があるときの対応として安全なのは？",
    choices: ["自己判断で進める", "大会スタッフや審判に丁寧に確認する", "他選手の邪魔になる場所で議論する"],
    answerIndex: 1,
    explanation: "不明点は早めに丁寧に確認しましょう。初出場こそ、聞けることを聞いておくのが白判定への近道です。",
    sourceSection: "大会進行 / 公式判断",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_after_005",
    category: "manners",
    difficulty: "beginner",
    question: "試技後の行動として望ましいものは？",
    choices: ["すぐ次の試技申請や準備を確認する", "結果を見ずに会場を離れる", "バー周辺で長く立ち止まる"],
    answerIndex: 0,
    explanation: "試技後は判定を確認し、次の重量申請やアップの流れへ移ります。喜ぶ時間も大切ですが、次の準備も白判定を支えます。",
    sourceSection: "大会進行 / 試技申請",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "sq_command_006",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットでラックアウト後、主審の合図が出にくい状態はどれ？",
    choices: ["膝を伸ばして静止している", "足元が動き続けている", "バーを担いで正面を向いている"],
    answerIndex: 1,
    explanation: "主審は開始できる姿勢を確認してから合図します。足元が決まらず動き続けると、合図が遅れて焦りにつながります。",
    sourceSection: "スクワット / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "sq_double_bounce_007",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットの切り返しで注意したいものは？",
    choices: ["深さを確認してから立つ", "ボトムで反動を使いすぎて姿勢が崩れる", "同じ軌道で立ち上がる"],
    answerIndex: 1,
    explanation: "反動そのものよりも、深さ不足やバーの下がり、足のズレにつながる崩れが危険です。白判定には深さとコントロールが必要です。",
    sourceSection: "スクワット / 試技動作",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "sq_spotter_008",
    category: "squat",
    difficulty: "beginner",
    question: "スクワット中に補助員がバーへ触れた場合の考え方として近いものは？",
    choices: ["選手の助けになれば赤判定の原因になる", "触れられても必ず白判定", "補助員が触れたら必ず再試技"],
    answerIndex: 0,
    explanation: "安全確保は最優先ですが、試技中に補助を受ける形になると失敗判定の原因になります。危ない時は記録より安全を優先します。",
    sourceSection: "スクワット / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "sq_finish_balance_009",
    category: "squat",
    difficulty: "beginner",
    question: "スクワットの立ち上がり後、Rackの合図前に避けたい行動は？",
    choices: ["静止して合図を待つ", "バランスを崩して大きく足を動かす", "バーをコントロールする"],
    answerIndex: 1,
    explanation: "立ち上がった後も合図前に足を動かすと赤判定につながります。最後まで静止する練習をしておきましょう。",
    sourceSection: "スクワット / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "sq_opener_010",
    category: "squat",
    difficulty: "beginner",
    question: "初出場のスクワット第一試技として安全なのはどれ？",
    choices: ["練習で毎回深く成功している重量", "一度だけ浅めに挙がった自己ベスト", "当日の気合いで初挑戦する重量"],
    answerIndex: 0,
    explanation: "第一試技は白判定で試合に入るための重量です。深さまで含めて安定している重量を選ぶと流れを作りやすくなります。",
    sourceSection: "試技選択 / 第一試技",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_grip_006",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスのグリップで安全に確認したいことは？",
    choices: ["大会ルール上の握り幅や手の位置を確認する", "広ければ広いほど必ず有利", "片手だけ極端に広くても問題ない"],
    answerIndex: 0,
    explanation: "ベンチの握り幅や手の位置には規定があります。大会で使うグリップは、事前に公式ルールと大会要項で確認しましょう。",
    sourceSection: "ベンチプレス / グリップ",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_feet_007",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレス中の足について注意したいものは？",
    choices: ["足で床を押して体を安定させる", "試技中に足を大きく動かす", "開始前に足位置を決める"],
    answerIndex: 1,
    explanation: "試技中の大きな足の動きは赤判定の原因になります。開始前に足位置を決め、コールを待てる姿勢を作りましょう。",
    sourceSection: "ベンチプレス / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_heave_008",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスで赤判定につながりやすい押し方は？",
    choices: ["胸で静止してから押す", "胸や腹でバーを沈ませて反動を使う", "合図後に肘を伸ばす"],
    answerIndex: 1,
    explanation: "胸や腹でバーを沈ませるような反動は失敗判定の原因になります。止める、待つ、押すの順番を練習しましょう。",
    sourceSection: "ベンチプレス / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_uneven_009",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスの押し上げで気をつけたいものは？",
    choices: ["左右をコントロールして押し切る", "片側だけ極端に沈んだまま押す", "Rackの合図まで待つ"],
    answerIndex: 1,
    explanation: "左右差が大きく、コントロールできない押し上げは失敗につながります。普段から最後まで安定して押す意識が大切です。",
    sourceSection: "ベンチプレス / 試技動作",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "bp_liftoff_010",
    category: "bench",
    difficulty: "beginner",
    question: "ベンチプレスで補助者からハンドオフを受けるときに大切なのは？",
    choices: ["開始姿勢を崩さず、合図を待てる状態を作る", "受けた瞬間にすぐ下ろす", "補助者に押し上げを手伝ってもらう"],
    answerIndex: 0,
    explanation: "ハンドオフ後も、主審のStart合図を待つ必要があります。受け方で肩や尻が崩れないように練習しておくと安心です。",
    sourceSection: "ベンチプレス / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "dl_ramp_006",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトで赤判定につながりやすい引き方は？",
    choices: ["バーを体に近づけて引く", "太ももに沿わせて支えるように引き上げる", "ロックアウトで静止する"],
    answerIndex: 1,
    explanation: "太ももにバーを支えさせるような動きは反則動作に見られやすいです。体に近い軌道でも、支えずに引き切ることが大切です。",
    sourceSection: "デッドリフト / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "dl_knee_rebend_007",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトの途中で注意したい動作は？",
    choices: ["膝を伸ばしながら立つ", "一度伸びた膝を再び曲げてバーを支える", "肩を後ろへ引いて静止する"],
    answerIndex: 1,
    explanation: "膝の再曲げやバーを支える動きは赤判定につながりやすいポイントです。最後まで一連の動作で立ち切りましょう。",
    sourceSection: "デッドリフト / 失敗判定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "dl_soft_lock_008",
    category: "deadlift",
    difficulty: "beginner",
    question: "デッドリフトでDownの合図が出にくい状態はどれ？",
    choices: ["膝と股関節が伸びて静止している", "膝が曲がったまま止まっている", "バーを両手で保持している"],
    answerIndex: 1,
    explanation: "ロックアウトが不十分だと、主審のDown合図が出にくくなります。膝と股関節を伸ばして静止する練習が必要です。",
    sourceSection: "デッドリフト / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "dl_straps_009",
    category: "deadlift",
    difficulty: "beginner",
    question: "大会のデッドリフトでストラップについて正しい考え方は？",
    choices: ["一般的なパワーリフティング大会では使えない前提で確認する", "握力が不安なら自由に使える", "第三試技だけ使える"],
    answerIndex: 0,
    explanation: "大会では使用できる装備が決まっています。普段ストラップを使う人も、試合に向けて素手や許可された補助具で練習しましょう。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "dl_warmup_drop_010",
    category: "deadlift",
    difficulty: "beginner",
    question: "アップ場でのデッドリフトの下ろし方として望ましいものは？",
    choices: ["本番同様にコントロールして下ろす", "毎回手を離して落とす", "周囲を見ずに急いで下ろす"],
    answerIndex: 0,
    explanation: "JPAはアップ場での下ろし方についても注意喚起しています。周囲の安全と大会での白判定のため、普段からコントロールしましょう。",
    sourceSection: "技術委員会通達 / アップ場",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_clock_006",
    category: "meet",
    difficulty: "beginner",
    question: "自分の試技順が近づいたときに大切なのは？",
    choices: ["呼ばれてからベルトを探す", "準備を早めに整え、呼び出しに対応できる状態にする", "他の選手の試技中に平台へ出る"],
    answerIndex: 1,
    explanation: "大会進行は待ってくれません。装備やチョーク、ラック高を早めに確認しておくと、制限時間内に落ち着いて入れます。",
    sourceSection: "大会進行 / 制限時間",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_rack_height_007",
    category: "meet",
    difficulty: "beginner",
    question: "ラック高の準備として良いものはどれ？",
    choices: ["普段から自分の高さを記録する", "当日なんとなく決める", "前の選手と同じ高さにする"],
    answerIndex: 0,
    explanation: "ラック高は試技の集中を左右します。普段の練習から高さを記録し、大会では事前確認するのが安全です。",
    sourceSection: "大会進行 / ラック設定",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_change_008",
    category: "meet",
    difficulty: "beginner",
    question: "第三試技の重量を考えるとき、もっとも堅実なのは？",
    choices: ["第一・第二の成功内容と当日の体感を見て決める", "試合前に決めた最高目標から絶対に変えない", "周りの選手につられて決める"],
    answerIndex: 0,
    explanation: "第三試技は攻める場面ですが、第二までの内容と当日の体感が重要です。事前候補を持ちつつ、現場で冷静に選びます。",
    sourceSection: "大会進行 / 試技選択",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "meet_platform_009",
    category: "meet",
    difficulty: "beginner",
    question: "プラットフォーム上で試技前に意識したいことは？",
    choices: ["主審の位置と合図を確認する", "観客席だけを見る", "急いでコールを無視する"],
    answerIndex: 0,
    explanation: "白判定には合図を聞く準備が必要です。平台に入ったら、主審の位置とコールに意識を向けましょう。",
    sourceSection: "大会進行 / 主審の合図",
    sourceUrl: ruleSource.ipfUrl
  },
  {
    id: "meet_record_010",
    category: "meet",
    difficulty: "beginner",
    question: "大会後、次回のために残しておきたい記録は？",
    choices: ["成功・失敗、重量、失敗理由、当日の体感", "成功した重量だけ", "気分が良かったことだけ"],
    answerIndex: 0,
    explanation: "半年後には細部を忘れやすいものです。成功だけでなく、赤判定の理由や当日の流れを残すと次回の準備に活きます。",
    sourceSection: "大会振り返り / 記録",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_singlet_006",
    category: "gear",
    difficulty: "beginner",
    question: "シングレットなど服装の準備として安全なのは？",
    choices: ["大会要項とルールで使用可否を確認する", "ジムで着られれば必ず使える", "当日に借りれば必ず間に合う"],
    answerIndex: 0,
    explanation: "大会で使う服装には規定があります。初出場では早めに大会要項と公式ルールを確認し、不明点は主催者へ確認しましょう。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_belt_007",
    category: "gear",
    difficulty: "beginner",
    question: "ベルトについて正しい準備は？",
    choices: ["大会で使える規定を確認し、普段から同じベルトで練習する", "当日初めて使う", "幅や厚さは一切関係ない"],
    answerIndex: 0,
    explanation: "ベルトには規定があります。使えるかどうかだけでなく、本番で慣れた締め具合にできるよう練習しておくことも大切です。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_wraps_008",
    category: "gear",
    difficulty: "beginner",
    question: "リストラップやニースリーブで大切なことは？",
    choices: ["大会規定と装着ルールを確認する", "強そうに見えれば何でもよい", "試技中に自由に付け替えればよい"],
    answerIndex: 0,
    explanation: "装備は種類だけでなく、装着方法や使用可否の確認が必要です。大会で焦らないよう、普段から本番装備で練習しましょう。",
    sourceSection: "服装・個人装備",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_chalk_009",
    category: "gear",
    difficulty: "beginner",
    question: "チョーク類について安全な考え方は？",
    choices: ["大会要項や通達で使用可否を確認する", "どんな液体チョークでも必ず使える", "アップ場だけなら何でもよい"],
    answerIndex: 0,
    explanation: "チョーク類は通達や大会要項で扱いが変わることがあります。使う予定がある場合は、最新の案内を確認しましょう。",
    sourceSection: "技術委員会通達 / チョーク類",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "gear_checklist_010",
    category: "gear",
    difficulty: "beginner",
    question: "大会前日の持ち物確認として良いものはどれ？",
    choices: ["装備、身分証、食事、飲み物、大会要項をまとめて確認する", "当日の朝に全部探す", "ベルトだけあれば十分"],
    answerIndex: 0,
    explanation: "忘れ物は試技の不安につながります。装備だけでなく、検量や補給に必要なものも前日までに確認しましょう。",
    sourceSection: "大会準備 / 持ち物",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_video_006",
    category: "manners",
    difficulty: "beginner",
    question: "他選手の試技を撮影するときに大切なことは？",
    choices: ["本人や大会ルールに配慮する", "無断で近距離撮影する", "平台の邪魔になる位置で撮る"],
    answerIndex: 0,
    explanation: "撮影ルールやマナーは大会ごとに異なります。本人と運営に配慮し、競技進行や安全の邪魔にならない位置で行いましょう。",
    sourceSection: "大会マナー / 撮影",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_judge_007",
    category: "manners",
    difficulty: "beginner",
    question: "判定に納得できないとき、避けたい行動は？",
    choices: ["その場で審判を強く批判する", "まず結果を受け止め、必要なら適切な手順で確認する", "次回の練習課題として記録する"],
    answerIndex: 0,
    explanation: "判定は有資格者の審判団によってその場で確定します。悔しさは次回の準備へ変え、マナーを守ることも競技力の一部です。",
    sourceSection: "技術委員会通達 / 判定マナー",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_shared_bar_008",
    category: "manners",
    difficulty: "beginner",
    question: "アップ場で同じバーを複数人で使うときに良い行動は？",
    choices: ["重量変更を声かけしながら譲り合う", "自分の重量を組んだまま長く離れる", "他人のプレートを無言で外す"],
    answerIndex: 0,
    explanation: "アップ場は共有です。声かけ、譲り合い、片付けができると、自分も周囲も落ち着いて試技に向かえます。",
    sourceSection: "大会マナー / アップ場",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_second_009",
    category: "manners",
    difficulty: "beginner",
    question: "セコンドや仲間と事前に決めておくと良いことは？",
    choices: ["試技重量の候補と失敗時の対応", "当日の気分だけ", "第三試技だけ"],
    answerIndex: 0,
    explanation: "候補重量や失敗時の判断を事前に共有しておくと、試合中に焦りにくくなります。個人参加でもメモで準備できます。",
    sourceSection: "大会準備 / セコンド",
    sourceUrl: ruleSource.jpaUrl
  },
  {
    id: "manners_leave_010",
    category: "manners",
    difficulty: "beginner",
    question: "自分の試技が終わった後の会場で望ましい行動は？",
    choices: ["使った場所を整え、他選手の進行を妨げない", "アップ場に荷物を広げたままにする", "平台近くで大声で長く話す"],
    answerIndex: 0,
    explanation: "大会は全員で進行します。自分の試技後も、アップ場や通路、平台周辺で周囲に配慮しましょう。",
    sourceSection: "大会マナー / 会場利用",
    sourceUrl: ruleSource.jpaUrl
  }
].map((question) => ({
  ...question,
  sourceLabel: ruleSource.label,
  lastChecked: ruleSource.lastChecked
}));

const defaultState = {
  currentAthleteId: "me",
  guideMode: true,
  wellnessExpanded: false,
  startAction: "plan",
  onboarding: { done: false, step: "intro", goal: "big3", dailyLastShown: "" },
  collapsed: { welcome: true, profile: true, cycle: false, facilities: true, meetNote: true, quiz: false },
  quiz: {
    view: "top",
    category: "",
    queue: [],
    index: 0,
    selectedIndex: null,
    answered: false,
    correct: 0,
    reviewMode: false,
    stats: {}
  },
  athletes: [
    {
      id: "me",
      name: "自分",
      sex: "male",
      bodyweight: "",
      weightClass: "83",
      prefecture: "",
      meetDate: "",
      goals: defaultGoals(),
      wellness: {},
      meetChecklist: {},
      cycle: defaultCycle(),
      meetNotes: [],
      logs: [
        sampleLog(-14, "power", "squat", 140, 5, 3, 8, "余裕あり"),
        sampleLog(-10, "power", "bench", 95, 5, 4, 8.5, ""),
        sampleLog(-7, "power", "deadlift", 180, 3, 3, 8, ""),
        sampleLog(-4, "back", "lat_pulldown", 65, 10, 3, 8, "広背筋狙い"),
        sampleLog(-3, "power", "squat", 145, 4, 3, 8.5, "")
      ],
      rpeFeedback: {},
      rpeCalibration: {}
    }
  ]
};

let state = loadState();
let homeDashboardOpenCard = "";

const els = {
  athleteStrip: document.querySelector("#athleteStrip"),
  welcomePanel: document.querySelector("#welcomePanel"),
  welcomeCollapseBtn: document.querySelector("#welcomeCollapseBtn"),
  welcomePanelContent: document.querySelector("#welcomePanelContent"),
  welcomeSummary: document.querySelector("#welcomeSummary"),
  startGuide: document.querySelector("#startGuide"),
  homeDashboard: document.querySelector("#homeDashboard"),
  onboardingScreen: document.querySelector("#onboardingScreen"),
  onboardingExperience: document.querySelector("#onboardingExperience"),
  onboardingDays: document.querySelector("#onboardingDays"),
  onboardingSex: document.querySelector("#onboardingSex"),
  onboardingBodyweight: document.querySelector("#onboardingBodyweight"),
  onboardingRpeExperience: document.querySelector("#onboardingRpeExperience"),
  onboardingSquatMax: document.querySelector("#onboardingSquatMax"),
  onboardingBenchMax: document.querySelector("#onboardingBenchMax"),
  onboardingDeadliftMax: document.querySelector("#onboardingDeadliftMax"),
  restartOnboardingBtn: document.querySelector("#restartOnboardingBtn"),
  currentAthleteName: document.querySelector("#currentAthleteName"),
  profileCollapseBtn: document.querySelector("#profileCollapseBtn"),
  profilePanelContent: document.querySelector("#profilePanelContent"),
  profileSummary: document.querySelector("#profileSummary"),
  sexInput: document.querySelector("#sexInput"),
  bodyweightInput: document.querySelector("#bodyweightInput"),
  weightClassInput: document.querySelector("#weightClassInput"),
  prefectureInput: document.querySelector("#prefectureInput"),
  associationGuide: document.querySelector("#associationGuide"),
  meetDateInput: document.querySelector("#meetDateInput"),
  athleteDashboard: document.querySelector("#athleteDashboard"),
  goalSquatInput: document.querySelector("#goalSquatInput"),
  goalBenchInput: document.querySelector("#goalBenchInput"),
  goalDeadliftInput: document.querySelector("#goalDeadliftInput"),
  goalTotalInput: document.querySelector("#goalTotalInput"),
  meetPrepAnnouncement: document.querySelector("#meetPrepAnnouncement"),
  meetCommandPanel: document.querySelector("#meetCommandPanel"),
  wellnessFloating: document.querySelector("#wellnessFloating"),
  dailyWellnessResult: document.querySelector("#dailyWellnessResult"),
  meetPrepChecklist: document.querySelector("#meetPrepChecklist"),
  logForm: document.querySelector("#logForm"),
  dateInput: document.querySelector("#dateInput"),
  categorySelect: document.querySelector("#categorySelect"),
  exerciseSelect: document.querySelector("#exerciseSelect"),
  customExerciseLabel: document.querySelector("#customExerciseLabel"),
  customExerciseInput: document.querySelector("#customExerciseInput"),
  alternativePanel: document.querySelector("#alternativePanel"),
  setsInput: document.querySelector("#setsInput"),
  setDetailPanel: document.querySelector("#setDetailPanel"),
  setRows: document.querySelector("#setRows"),
  fillSetRowsBtn: document.querySelector("#fillSetRowsBtn"),
  noteInput: document.querySelector("#noteInput"),
  logCommandPanel: document.querySelector("#logCommandPanel"),
  quickStats: document.querySelector("#quickStats"),
  metricGrid: document.querySelector("#metricGrid"),
  weeklyDataSummary: document.querySelector("#weeklyDataSummary"),
  weeklyDataChart: document.querySelector("#weeklyDataChart"),
  academyEvaluation: document.querySelector("#academyEvaluation"),
  historyList: document.querySelector("#historyList"),
  planList: document.querySelector("#planList"),
  trendChart: document.querySelector("#trendChart"),
  chartLiftSelect: document.querySelector("#chartLiftSelect"),
  planTargetInput: document.querySelector("#planTargetInput"),
  programMethodInput: document.querySelector("#programMethodInput"),
  cycleLengthInput: document.querySelector("#cycleLengthInput"),
  daysPerWeekInput: document.querySelector("#daysPerWeekInput"),
  accessoryVolumeInput: document.querySelector("#accessoryVolumeInput"),
  priorityLiftInput: document.querySelector("#priorityLiftInput"),
  experienceLevelInput: document.querySelector("#experienceLevelInput"),
  cycleMethodNote: document.querySelector("#cycleMethodNote"),
  cycleSetupPanel: document.querySelector("#cycleSetupPanel"),
  programMethodGuide: document.querySelector("#programMethodGuide"),
  programDisclaimer: document.querySelector("#programDisclaimer"),
  facilityGrid: document.querySelector("#facilityGrid"),
  cycleWeekInput: document.querySelector("#cycleWeekInput"),
  squatMaxInput: document.querySelector("#squatMaxInput"),
  benchMaxInput: document.querySelector("#benchMaxInput"),
  deadliftMaxInput: document.querySelector("#deadliftMaxInput"),
  projectionGrid: document.querySelector("#projectionGrid"),
  cyclePhaseTitle: document.querySelector("#cyclePhaseTitle"),
  cyclePhaseNote: document.querySelector("#cyclePhaseNote"),
  rpeCoachCard: document.querySelector("#rpeCoachCard"),
  backupExportBtn: document.querySelector("#backupExportBtn"),
  backupImportBtn: document.querySelector("#backupImportBtn"),
  backupFileInput: document.querySelector("#backupFileInput"),
  dataStatus: document.querySelector("#dataStatus"),
  guideModeBtn: document.querySelector("#guideModeBtn"),
  guideModeDescription: document.querySelector("#guideModeDescription"),
  buddyMethodCollapseBtn: document.querySelector("#buddyMethodCollapseBtn"),
  buddyMethodPanelContent: document.querySelector("#buddyMethodPanelContent"),
  buddyMethodSummary: document.querySelector("#buddyMethodSummary"),
  cycleCollapseBtn: document.querySelector("#cycleCollapseBtn"),
  cyclePanelContent: document.querySelector("#cyclePanelContent"),
  cycleSummary: document.querySelector("#cycleSummary"),
  facilityCollapseBtn: document.querySelector("#facilityCollapseBtn"),
  facilitySummary: document.querySelector("#facilitySummary"),
  quizCollapseBtn: document.querySelector("#quizCollapseBtn"),
  quizPanelContent: document.querySelector("#quizPanelContent"),
  quizSummary: document.querySelector("#quizSummary"),
  quizApp: document.querySelector("#quizApp"),
  meetNoteCollapseBtn: document.querySelector("#meetNoteCollapseBtn"),
  meetNotePanelContent: document.querySelector("#meetNotePanelContent"),
  meetNoteSummary: document.querySelector("#meetNoteSummary"),
  meetNoteForm: document.querySelector("#meetNoteForm"),
  meetNameInput: document.querySelector("#meetNameInput"),
  meetReviewDateInput: document.querySelector("#meetReviewDateInput"),
  meetReviewWeightClassInput: document.querySelector("#meetReviewWeightClassInput"),
  meetReviewBodyweightInput: document.querySelector("#meetReviewBodyweightInput"),
  meetReviewTotalInput: document.querySelector("#meetReviewTotalInput"),
  meetAttemptGrid: document.querySelector("#meetAttemptGrid"),
  meetSelfInput: document.querySelector("#meetSelfInput"),
  meetGoodInput: document.querySelector("#meetGoodInput"),
  meetIssueInput: document.querySelector("#meetIssueInput"),
  meetReviewPreview: document.querySelector("#meetReviewPreview"),
  meetNoteList: document.querySelector("#meetNoteList"),
  deleteAthleteBtn: document.querySelector("#deleteAthleteBtn"),
  athleteDialog: document.querySelector("#athleteDialog"),
  athleteForm: document.querySelector("#athleteForm"),
  athleteNameInput: document.querySelector("#athleteNameInput")
};

function defaultCycle() {
  return {
    length: 12,
    daysPerWeek: 4,
    planTarget: "big3",
    programMethod: "platform",
    buddyLevel: "level1",
    accessoryVolume: "normal",
    priorityLift: "total",
    experienceLevel: "beginner",
    week: 1,
    recoveryMode: false,
    recoveryForWeek: null,
    recoveryFromWeek: null,
    pendingRecoveryAlert: null,
    availableFacilityExercises: [],
    maxes: { squat: "", bench: "", deadlift: "" }
  };
}

function defaultGoals() {
  return { squat: "", bench: "", deadlift: "", total: "" };
}

function normalizeGoals(goals = {}) {
  return {
    ...defaultGoals(),
    ...(goals && typeof goals === "object" ? goals : {})
  };
}

function defaultWellnessEntry() {
  return Object.fromEntries(wellnessFields.map((field) => [field.id, field.defaultValue]));
}

function normalizeWellnessEntry(entry = {}) {
  const normalized = { ...defaultWellnessEntry(), ...(entry && typeof entry === "object" ? entry : {}) };
  wellnessFields.forEach((field) => {
    const validValues = field.choices.map((choice) => choice.value);
    if (!validValues.includes(normalized[field.id])) normalized[field.id] = field.defaultValue;
  });
  normalized.completed = entry?.completed === true;
  normalized.date = entry?.date || today();
  normalized.updatedAt = entry?.updatedAt || "";
  return normalized;
}

function normalizeWellnessEntries(entries = {}) {
  if (!entries || typeof entries !== "object" || Array.isArray(entries)) return {};
  return Object.fromEntries(Object.entries(entries).map(([date, entry]) => [date, normalizeWellnessEntry({ date, ...entry })]));
}

function wellnessChoice(fieldId, value) {
  const field = wellnessFields.find((item) => item.id === fieldId);
  if (!field) return null;
  return field.choices.find((choice) => choice.value === value) || field.choices[1] || field.choices[0];
}

function wellnessChoiceLabel(fieldId, value) {
  return wellnessChoice(fieldId, value)?.label || "-";
}

function todayWellnessEntry(athlete = currentAthlete()) {
  athlete.wellness = normalizeWellnessEntries(athlete.wellness);
  return normalizeWellnessEntry({ date: today(), ...(athlete.wellness[today()] || {}) });
}

function wellnessEvaluation(entry = todayWellnessEntry()) {
  if (!entry.completed) {
    return {
      score: null,
      status: "unset",
      label: "未入力",
      short: "体調チェック",
      recommendation: "今日の状態を入力すると、提案重量レンジのどこから始めるかを表示します。"
    };
  }
  let score = wellnessFields.reduce((sum, field) => {
    const choice = wellnessChoice(field.id, entry[field.id]);
    return sum + field.weight * Number(choice?.factor ?? 0);
  }, 0);
  if (entry.sleep === "bad" && entry.fatigue === "bad") score = Math.min(score, 65);
  if (entry.pain === "normal" && entry.fatigue === "bad") score = Math.min(score, 55);
  if (entry.pain === "bad") score = Math.min(score, 39);
  score = Math.max(0, Math.min(100, Math.round(score)));
  if (entry.pain === "bad" || score <= 39) {
    return {
      score,
      status: "alert",
      label: "アラート",
      short: "高重量なし",
      recommendation: "強い痛みや低コンディションの日です。高重量挑戦は避け、休養・代替種目・フォーム確認を優先しましょう。"
    };
  }
  if (score <= 54) {
    return {
      score,
      status: "fatigue",
      label: "疲労強め",
      short: "下限以下も候補",
      recommendation: "提案重量レンジの下限、または下限より-2.5kgから開始。バックオフや補助種目は1セット減らす候補があります。"
    };
  }
  if (score <= 69) {
    return {
      score,
      status: "caution",
      label: "注意",
      short: "下限寄り推奨",
      recommendation: "提案重量レンジの下限寄りから開始。ウォームアップで重く感じる日は無理に上げず、予定RPEを優先しましょう。"
    };
  }
  if (score <= 84) {
    return {
      score,
      status: "normal",
      label: "通常",
      short: "中央寄り",
      recommendation: "提案重量レンジの中央付近から開始。予定RPEに合えばそのまま進め、軽ければ少しだけ上限寄りを試せます。"
    };
  }
  return {
    score,
    status: "good",
    label: "良好",
    short: "中央〜上限寄り",
    recommendation: "状態は良好です。フォーム再現性が保てる範囲で、提案重量レンジの中央〜上限寄りも候補になります。"
  };
}

function sampleLog(offset, category, exerciseId, weight, reps, sets, rpe, note) {
  const meta = exerciseMeta(exerciseId);
  return {
    id: crypto.randomUUID(),
    date: today(offset),
    category,
    exerciseId,
    exerciseName: meta.name,
    badge: meta.badge,
    weight,
    reps,
    sets,
    rpe,
    note
  };
}

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY) || OLD_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
  if (!saved) return structuredClone(defaultState);
  try {
    return migrateState(JSON.parse(saved));
  } catch {
    return structuredClone(defaultState);
  }
}

function migrateState(rawState) {
  const migrated = rawState;
  migrated.guideMode = typeof migrated.guideMode === "boolean" ? migrated.guideMode : true;
  migrated.wellnessExpanded = migrated.wellnessExpanded === true;
  migrated.startAction = ["log", "plan", "meet"].includes(migrated.startAction) ? migrated.startAction : "plan";
  migrated.onboarding = migrated.onboarding && typeof migrated.onboarding === "object"
    ? { ...defaultState.onboarding, ...migrated.onboarding }
    : { ...defaultState.onboarding, done: true };
  migrated.collapsed = {
    ...defaultState.collapsed,
    ...(migrated.collapsed || {})
  };
  migrated.quiz = normalizeQuizState(migrated.quiz);
  migrated.athletes = (migrated.athletes || []).map((athlete) => ({
    ...athlete,
    sex: ["male", "female", ""].includes(athlete.sex) ? athlete.sex : "male",
    prefecture: prefectures.includes(athlete.prefecture) ? athlete.prefecture : "",
    weightClass: validWeightClass(athlete.sex || "male", athlete.weightClass)
      ? athlete.weightClass
      : inferWeightClass(athlete.sex || "male", athlete.bodyweight),
    cycle: {
      ...defaultCycle(),
      ...(athlete.cycle || {}),
      planTarget: ["big3", "bench_only"].includes((athlete.cycle || {}).planTarget)
        ? athlete.cycle.planTarget
        : "big3",
      programMethod: ["platform", "rebuild16", "hps", "531", "smolov_jr"].includes((athlete.cycle || {}).programMethod)
        ? athlete.cycle.programMethod
        : "platform",
      buddyLevel: ["level1", "level2"].includes((athlete.cycle || {}).buddyLevel)
        ? athlete.cycle.buddyLevel
        : "level1",
      priorityLift: ["total", "squat", "bench", "deadlift"].includes((athlete.cycle || {}).priorityLift)
        ? athlete.cycle.priorityLift
        : "total",
      experienceLevel: ["beginner", "intermediate", "advanced"].includes((athlete.cycle || {}).experienceLevel)
        ? athlete.cycle.experienceLevel
        : "beginner",
      availableFacilityExercises: Array.isArray((athlete.cycle || {}).availableFacilityExercises)
        ? athlete.cycle.availableFacilityExercises
        : [],
      maxes: { ...defaultCycle().maxes, ...((athlete.cycle || {}).maxes || {}) }
    },
    rpeFeedback: athlete.rpeFeedback || {},
    rpeCalibration: athlete.rpeCalibration || {},
    goals: normalizeGoals(athlete.goals),
    wellness: normalizeWellnessEntries(athlete.wellness),
    meetChecklist: athlete.meetChecklist && typeof athlete.meetChecklist === "object" ? athlete.meetChecklist : {},
    meetNotes: Array.isArray(athlete.meetNotes) ? athlete.meetNotes : [],
    logs: (athlete.logs || []).map((log) => {
      if (log.exerciseId) {
        const meta = exerciseMeta(log.exerciseId);
        return {
          ...log,
          source: log.source || (String(log.note || "").startsWith("予定RPE") ? "plan" : "log"),
          exerciseName: log.exerciseName || log.exercise || meta.name,
          badge: log.badge || meta.badge
        };
      }
      const exerciseId = log.lift === "accessory" ? "custom" : log.lift;
      const meta = exerciseMeta(exerciseId);
      return {
        ...log,
        source: log.source || (String(log.note || "").startsWith("予定RPE") ? "plan" : "log"),
        category: log.lift === "accessory" ? "custom" : "power",
        exerciseId,
        exerciseName: log.exercise || meta.name,
        badge: meta.badge
      };
    })
  }));
  return migrated;
}

function normalizeQuizState(quiz = {}) {
  const validIds = new Set(ruleQuestions.map((question) => question.id));
  const stats = Object.fromEntries(
    Object.entries(quiz.stats || {})
      .filter(([id]) => validIds.has(id))
      .map(([id, value]) => [
        id,
        {
          attempts: Math.max(0, Number(value.attempts || 0)),
          correct: Math.max(0, Number(value.correct || 0)),
          wrong: Math.max(0, Number(value.wrong || 0)),
          lastCorrect: value.lastCorrect === true
        }
      ])
  );
  const queue = Array.isArray(quiz.queue) ? quiz.queue.filter((id) => validIds.has(id)) : [];
  return {
    ...structuredClone(defaultState.quiz),
    ...quiz,
    view: ["top", "categories", "question", "result"].includes(quiz.view) ? quiz.view : "top",
    category: quizCategories[quiz.category] ? quiz.category : "",
    queue,
    index: Math.max(0, Math.min(Number(quiz.index || 0), Math.max(0, queue.length - 1))),
    selectedIndex: Number.isInteger(quiz.selectedIndex) ? quiz.selectedIndex : null,
    answered: quiz.answered === true,
    correct: Math.max(0, Number(quiz.correct || 0)),
    reviewMode: quiz.reviewMode === true,
    stats
  };
}

function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currentAthlete() {
  return state.athletes.find((athlete) => athlete.id === state.currentAthleteId) || state.athletes[0];
}

function exerciseMeta(exerciseId) {
  for (const category of Object.values(exerciseCatalog)) {
    const found = category.exercises.find(([id]) => id === exerciseId);
    if (found) return { id: found[0], name: found[1], badge: found[2] };
  }
  return { id: "custom", name: "自由入力", badge: "自由" };
}

function exerciseCategoryId(exerciseId) {
  for (const [categoryId, category] of Object.entries(exerciseCatalog)) {
    if (category.exercises.some(([id]) => id === exerciseId)) return categoryId;
  }
  return "";
}

function validWeightClass(sex, weightClass) {
  return weightClasses[sex]?.some(([id]) => id === weightClass);
}

function inferWeightClass(sex, bodyweight) {
  const weight = Number(bodyweight);
  const classes = weightClasses[sex] || weightClasses.male;
  if (!weight) return classes[Math.min(3, classes.length - 1)][0];
  return (classes.find(([, , upper]) => weight <= upper) || classes.at(-1))[0];
}

function weightClassMeta(sex, weightClass) {
  return (weightClasses[sex] || weightClasses.male).find(([id]) => id === weightClass) || weightClasses[sex || "male"][0];
}

function equipmentLabel(exerciseId) {
  return exerciseAlternatives[exerciseId] ? "設備" : "";
}

function isFacilityExerciseAvailable(exerciseId, cycle = normalizedCycle()) {
  return !exerciseAlternatives[exerciseId] || cycle.availableFacilityExercises.includes(exerciseId);
}

function e1rm(weight, reps) {
  const value = Number(weight) * (1 + Number(reps) / 30);
  return Math.round(value * 10) / 10;
}

function volume(log) {
  if (Array.isArray(log.setDetails) && log.setDetails.length) {
    return log.setDetails.reduce((sum, set) => sum + Number(set.weight || 0) * Number(set.reps || 0), 0);
  }
  return Number(log.weight) * Number(log.reps) * Number(log.sets);
}

function sortedLogs(athlete = currentAthlete()) {
  return [...athlete.logs].sort((a, b) => b.date.localeCompare(a.date));
}

function guideEnabled() {
  return state.guideMode !== false;
}

function renderGuideMode() {
  const enabled = guideEnabled();
  document.body.classList.toggle("guide-off", !enabled);
  if (els.guideModeBtn) {
    els.guideModeBtn.textContent = enabled ? "ガイドON" : "ガイドOFF";
    els.guideModeBtn.setAttribute("aria-pressed", String(enabled));
    els.guideModeBtn.title = enabled ? "説明を表示するモード" : "説明を減らすモード";
  }
  if (els.guideModeDescription) {
    els.guideModeDescription.textContent = enabled ? "説明を表示して使う" : "入力と記録を優先する";
  }
}

function renderWellnessUI() {
  const athlete = currentAthlete();
  const entry = todayWellnessEntry(athlete);
  const evaluation = wellnessEvaluation(entry);
  document.querySelectorAll("[data-wellness-option]").forEach((button) => {
    const field = button.dataset.wellnessField;
    button.classList.toggle("active", entry[field] === button.dataset.wellnessValue);
  });
  if (els.dailyWellnessResult) {
    els.dailyWellnessResult.className = `wellness-result ${evaluation.status}`;
    els.dailyWellnessResult.innerHTML = `
      <span>${entry.completed ? `スコア ${evaluation.score}/100` : "未保存"}</span>
      <strong>${escapeHtml(evaluation.label)}：${escapeHtml(evaluation.short)}</strong>
      <p>${escapeHtml(evaluation.recommendation)}</p>
    `;
  }
  if (!els.wellnessFloating) return;
  const expanded = state.wellnessExpanded === true && entry.completed;
  els.wellnessFloating.className = `wellness-floating ${evaluation.status}${expanded ? " expanded" : ""}`;
  els.wellnessFloating.dataset.wellnessFloating = "true";
  els.wellnessFloating.setAttribute("role", "button");
  els.wellnessFloating.setAttribute("tabindex", "0");
  els.wellnessFloating.setAttribute("aria-label", entry.completed ? "今日のBuddy方針" : "今日のウェルネスチェックを開く");
  if (!entry.completed) {
    els.wellnessFloating.innerHTML = `
      <div>
        <span>体調チェック</span>
        <strong>未入力</strong>
        <small>入力</small>
      </div>
    `;
    return;
  }
  const details = expanded
    ? `
      <div class="wellness-floating-detail">
        <strong>${escapeHtml(evaluation.short)} / ${evaluation.score}点</strong>
        ${wellnessFields.map((field) => `<span>${escapeHtml(field.label)}：${escapeHtml(wellnessChoiceLabel(field.id, entry[field.id]))}</span>`).join("")}
        <p>${escapeHtml(evaluation.recommendation)}</p>
        <div>
          <button class="text-button compact" type="button" data-wellness-recheck>再チェック</button>
          <button class="text-button compact" type="button" data-wellness-close>閉じる</button>
        </div>
      </div>
    `
    : "";
  els.wellnessFloating.innerHTML = `
    <div>
      <span>今日の体調</span>
      <strong>${escapeHtml(evaluation.label)}</strong>
      <small>詳細</small>
    </div>
    ${details}
  `;
}

function saveTodayWellness(values = {}) {
  const athlete = currentAthlete();
  athlete.wellness = normalizeWellnessEntries(athlete.wellness);
  const entry = normalizeWellnessEntry({ date: today(), ...(athlete.wellness[today()] || {}), ...values });
  entry.completed = true;
  entry.updatedAt = new Date().toISOString();
  athlete.wellness[today()] = entry;
  saveState();
  renderWellnessUI();
}

function saveWellnessFromButtons() {
  const values = defaultWellnessEntry();
  wellnessFields.forEach((field) => {
    const active = document.querySelector(`[data-wellness-option][data-wellness-field="${field.id}"].active`);
    values[field.id] = active?.dataset.wellnessValue || values[field.id];
  });
  saveTodayWellness(values);
  closeDailyEntry();
}

function openDailyWellness() {
  if (!els.onboardingScreen) return;
  state.onboarding = { ...defaultState.onboarding, ...(state.onboarding || {}), done: true };
  els.onboardingScreen.querySelectorAll("[data-onboarding-step]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.onboardingStep !== "daily");
  });
  els.onboardingScreen.classList.remove("hidden");
  document.body.classList.add("onboarding-active");
}

function renderCollapseState(athlete = currentAthlete(), cycle = normalizedCycle()) {
  const hadBuddyMethodPreference = Object.prototype.hasOwnProperty.call(state.collapsed || {}, "buddyMethod");
  state.collapsed = { ...defaultState.collapsed, ...(state.collapsed || {}) };
  applyCollapse("profile", els.profilePanelContent, els.profileCollapseBtn, "プロフィール");
  applyCollapse("welcome", els.welcomePanelContent, els.welcomeCollapseBtn, "はじめてガイド");
  const forceOpenBuddyMethod = cycle.experienceLevel === "beginner" && !hadBuddyMethodPreference;
  if (forceOpenBuddyMethod) {
    els.buddyMethodPanelContent?.classList.remove("collapsed");
    if (els.buddyMethodCollapseBtn) {
      els.buddyMethodCollapseBtn.textContent = "⌃";
      els.buddyMethodCollapseBtn.dataset.collapseKey = "buddyMethod";
      els.buddyMethodCollapseBtn.setAttribute("aria-expanded", "true");
      els.buddyMethodCollapseBtn.setAttribute("aria-label", "Buddyメソッドとは？を閉じる");
    }
  } else {
    if (!hadBuddyMethodPreference && cycle.experienceLevel !== "beginner") state.collapsed.buddyMethod = true;
    applyCollapse("buddyMethod", els.buddyMethodPanelContent, els.buddyMethodCollapseBtn, "Buddyメソッドとは？");
  }
  applyCollapse("cycle", els.cyclePanelContent, els.cycleCollapseBtn, "PRサイクル設計");
  applyCollapse("facilities", els.facilityGrid, els.facilityCollapseBtn, "設備依存種目");
  applyCollapse("meetNote", els.meetNotePanelContent, els.meetNoteCollapseBtn, "大会ノート");
  applyCollapse("quiz", els.quizPanelContent, els.quizCollapseBtn, "白判定クイズ");
  applyCollapse(
    "planContext",
    document.querySelector("#planContextContent"),
    document.querySelector("#planContextCollapseBtn"),
    "今週の文脈"
  );
  renderCollapseSummaries(athlete, cycle);
}

function applyCollapse(key, content, button, label) {
  const collapsed = Boolean(state.collapsed?.[key]);
  content?.classList.toggle("collapsed", collapsed);
  if (button) {
    button.textContent = collapsed ? "⌄" : "⌃";
    button.dataset.collapseKey = key;
    button.setAttribute("aria-expanded", String(!collapsed));
    button.setAttribute("aria-label", `${label}を${collapsed ? "開く" : "閉じる"}`);
    const header = button.closest(".section-title, .facility-head");
    if (header) {
      header.classList.add("accordion-header");
      header.dataset.collapseKey = key;
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      header.setAttribute("aria-expanded", String(!collapsed));
      header.setAttribute("aria-label", `${label}を${collapsed ? "開く" : "閉じる"}`);
    }
  }
}

function renderCollapseSummaries(athlete, cycle) {
  const classLabel = weightClassMeta(athlete.sex, athlete.weightClass)[1];
  const sexLabel = athlete.sex === "female" ? "女性" : athlete.sex === "male" ? "男性" : "性別未設定";
  const bodyweight = athlete.bodyweight ? `${athlete.bodyweight}kg` : "体重未設定";
  const prefecture = athlete.prefecture || "エリア未設定";
  const meet = athlete.meetDate ? `試合 ${athlete.meetDate}` : "試合未設定";
  els.profileSummary.textContent = `${sexLabel} / ${bodyweight} / ${classLabel} / ${prefecture} / ${meet}`;

  const method = programMethodInfo(cycle).label.replace(" / BIG3", "").replace(" / ベンチプレスのみ", "");
  const target = cycle.planTarget === "bench_only" ? "BPのみ" : "BIG3";
  const priority = cycle.priorityLift === "total" ? "トータル重視" : `${mainLiftNames[cycle.priorityLift]}重視`;
  els.cycleSummary.textContent = `${method} / ${target} / ${cycle.length}週 / 週${cycle.daysPerWeek}回 / ${priority}`;

  const count = cycle.availableFacilityExercises.length;
  els.facilitySummary.textContent = count ? `使用可能: ${count}種目` : "使用可能設備の追加なし";
  if (els.meetNoteSummary) {
    const notes = [...(athlete.meetNotes || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    const latest = notes[0];
    els.meetNoteSummary.textContent = latest
      ? `${notes.length}件保存 / 最新: ${latest.date || "-"} ${latest.name || "大会ノート"}`
      : "大会後の9本、赤判定、次回課題を保存";
  }
  if (els.quizSummary) {
    const attempted = Object.values(state.quiz?.stats || {}).filter((stat) => Number(stat.attempts || 0) > 0).length;
    const wrong = quizWrongQuestions().length;
    const correct = Object.values(state.quiz?.stats || {}).reduce((sum, stat) => sum + Number(stat.correct || 0), 0);
    const total = Object.values(state.quiz?.stats || {}).reduce((sum, stat) => sum + Number(stat.attempts || 0), 0);
    const rate = total ? Math.round((correct / total) * 100) : 0;
    els.quizSummary.textContent = `進捗 ${attempted}/${ruleQuestions.length}問 / 正解率 ${rate}% / 復習 ${wrong}問`;
  }
  if (els.welcomeSummary) {
    const guideLabels = { plan: "MAX更新へのPRサイクル", log: "今日のトレーニング記録", meet: "大会準備と白判定" };
    const hint = guideEnabled() ? " / ⌄を押すと詳細が開きます" : "";
    els.welcomeSummary.textContent = `目的別ヘルプ: ${guideLabels[state.startAction] || guideLabels.plan}${hint}`;
  }
  if (els.buddyMethodSummary) {
    const level = cycle.buddyLevel === "level2" ? "Lv2 実戦寄り" : "Lv1 標準";
    els.buddyMethodSummary.textContent = `現在の設定: ${level} / 現在地・RPE・疲労管理を学びながらPRへ進む`;
  }
}

function render() {
  const athlete = currentAthlete();
  updateActiveViewClass();
  renderGuideMode();
  renderOnboarding();
  renderWellnessUI();
  renderStartGuide();
  renderHomeDashboard(athlete, normalizedCycle());
  placeAthleteDashboardInHome();
  els.currentAthleteName.textContent = athlete.name;
  els.deleteAthleteBtn.disabled = state.athletes.length <= 1;
  els.deleteAthleteBtn.title = state.athletes.length <= 1 ? "選手が1名のみのため削除できません" : `${athlete.name}を削除`;
  athlete.sex = ["male", "female", ""].includes(athlete.sex) ? athlete.sex : "male";
  athlete.prefecture = prefectures.includes(athlete.prefecture) ? athlete.prefecture : "";
  athlete.weightClass = validWeightClass(athlete.sex, athlete.weightClass) ? athlete.weightClass : inferWeightClass(athlete.sex, athlete.bodyweight);
  els.sexInput.value = athlete.sex;
  renderWeightClassOptions(athlete);
  renderPrefectureOptions(athlete);
  els.bodyweightInput.value = athlete.bodyweight || "";
  els.weightClassInput.value = athlete.weightClass;
  els.prefectureInput.value = athlete.prefecture;
  els.meetDateInput.value = athlete.meetDate || "";
  athlete.goals = normalizeGoals(athlete.goals);
  renderGoalInputs(athlete);
  renderAssociationGuide(athlete);
  renderAthleteDashboard(athlete, normalizedCycle());
  renderMeetPrepAnnouncement(athlete);
  renderMeetCommand(athlete);
  renderMeetPrepChecklist(athlete);
  renderCycleInputs();
  renderCycleSetupCard(athlete, normalizedCycle());
  renderCollapseState(athlete, normalizedCycle());
  renderAthletes();
  renderStats();
  renderLogCommand(athlete, normalizedCycle());
  renderMetrics();
  renderWeeklyDataSummary(athlete, normalizedCycle());
  renderAcademyEvaluation();
  renderChartOptions();
  renderDataStatus();
  renderHistory();
  renderPlan();
  renderPlanContext();
  renderMeetNotebook(athlete);
  renderQuiz();
  drawWeeklyDataChart(athlete);
  drawChart();
}

function placeAthleteDashboardInHome() {
  if (!els.athleteDashboard || !els.homeDashboard) return;
  const hero = els.homeDashboard.querySelector(".home-hero-card");
  const athletePanel = document.querySelector(".athlete-panel");
  if (athletePanel) athletePanel.classList.add("athlete-panel-shell-hidden");
  els.athleteDashboard.classList.add("home-athlete-dashboard");
  if (hero) {
    hero.insertAdjacentElement("afterend", els.athleteDashboard);
    return;
  }
  if (els.athleteDashboard.parentElement !== els.homeDashboard) {
    els.homeDashboard.prepend(els.athleteDashboard);
  }
}

function renderOnboarding() {
  if (!els.onboardingScreen) return;
  state.onboarding = { ...defaultState.onboarding, ...(state.onboarding || {}) };
  document.body.classList.toggle("onboarding-complete", Boolean(state.onboarding.done));
  const daily = shouldShowDailyEntry();
  const show = !state.onboarding.done || daily;
  els.onboardingScreen.classList.toggle("hidden", !show);
  document.body.classList.toggle("onboarding-active", show);
  if (!show) return;
  const step = state.onboarding.done ? "daily" : ["intro", "goal", "profile", "complete"].includes(state.onboarding.step) ? state.onboarding.step : "intro";
  els.onboardingScreen.querySelectorAll("[data-onboarding-step]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.onboardingStep !== step);
  });
  els.onboardingScreen.querySelectorAll("[data-onboarding-goal]").forEach((button) => {
    button.classList.toggle("active", button.dataset.onboardingGoal === state.onboarding.goal);
  });
}

function shouldShowDailyEntry() {
  return false;
}

function closeDailyEntry(viewName = "") {
  state.onboarding = { ...defaultState.onboarding, ...(state.onboarding || {}), done: true, dailyLastShown: today() };
  saveState();
  render();
  if (viewName) switchView(viewName);
}

function renderExerciseControls() {
  els.categorySelect.innerHTML = Object.entries(exerciseCatalog).map(([id, category]) => (
    `<option value="${id}">${category.label}</option>`
  )).join("");
  renderExerciseOptions();
}

function renderExerciseOptions() {
  const category = exerciseCatalog[els.categorySelect.value];
  els.exerciseSelect.innerHTML = category.exercises.map(([id, name]) => (
    `<option value="${id}">${name}</option>`
  )).join("");
  updateCustomExerciseVisibility();
}

function renderWeightClassOptions(athlete = currentAthlete()) {
  els.weightClassInput.innerHTML = (weightClasses[athlete.sex] || weightClasses.male).map(([id, label]) => (
    `<option value="${id}">${label}</option>`
  )).join("");
}

function renderPrefectureOptions(athlete = currentAthlete()) {
  els.prefectureInput.innerHTML = [
    `<option value="">未設定</option>`,
    ...prefectures.map((prefecture) => `<option value="${prefecture}">${prefecture}</option>`)
  ].join("");
  els.prefectureInput.value = prefectures.includes(athlete.prefecture) ? athlete.prefecture : "";
}

function renderAssociationGuide(athlete = currentAthlete()) {
  const area = athlete.prefecture || "未設定";
  const target = athlete.prefecture ? `${athlete.prefecture}協会` : "所属エリアの協会";
  els.associationGuide.innerHTML = `
    <div>
      <span>所属エリア: ${escapeHtml(area)}</span>
      <p>大会情報はJPA加盟都道府県協会リンクから、${escapeHtml(target)}を確認してください。</p>
    </div>
    <a href="https://www.jpa-powerlifting.or.jp/overview.php" target="_blank" rel="noopener">JPA加盟都道府県協会リンクを見る</a>
  `;
}

function daysUntilMeet(athlete = currentAthlete()) {
  if (!athlete.meetDate) return null;
  const diff = new Date(`${athlete.meetDate}T00:00:00`) - new Date(`${today()}T00:00:00`);
  return Math.ceil(diff / 86400000);
}

function renderGoalInputs(athlete = currentAthlete()) {
  athlete.goals = normalizeGoals(athlete.goals);
  if (els.goalSquatInput) els.goalSquatInput.value = athlete.goals.squat || "";
  if (els.goalBenchInput) els.goalBenchInput.value = athlete.goals.bench || "";
  if (els.goalDeadliftInput) els.goalDeadliftInput.value = athlete.goals.deadlift || "";
  if (els.goalTotalInput) els.goalTotalInput.value = athlete.goals.total || "";
}

function dashboardCurrentMax(liftId, cycle = normalizedCycle()) {
  return Number(cycle.maxes?.[liftId] || bestE1rm(liftId) || 0);
}

function dashboardGoalValue(liftId, athlete = currentAthlete()) {
  athlete.goals = normalizeGoals(athlete.goals);
  return Number(athlete.goals[liftId] || 0);
}

function dashboardGoalTotal(athlete = currentAthlete()) {
  athlete.goals = normalizeGoals(athlete.goals);
  const explicit = Number(athlete.goals.total || 0);
  const liftTotal = mainLiftIds.reduce((sum, liftId) => sum + dashboardGoalValue(liftId, athlete), 0);
  return explicit || liftTotal;
}

function calculatedGoalTotal(athlete = currentAthlete()) {
  athlete.goals = normalizeGoals(athlete.goals);
  return mainLiftIds.reduce((sum, liftId) => sum + dashboardGoalValue(liftId, athlete), 0);
}

function achievementPercent(current, goal) {
  if (!goal) return null;
  return Math.max(0, Math.round((Number(current || 0) / Number(goal)) * 100));
}

function achievementText(current, goal) {
  if (!goal) return "目標未設定";
  const gap = Number(goal) - Number(current || 0);
  if (gap <= 0) return "目標達成圏内";
  return `あと ${formatNumber(gap)}kg`;
}

function meetCountdownText(athlete = currentAthlete()) {
  const days = daysUntilMeet(athlete);
  if (days === null) return { label: "未設定", message: "大会日を入れると、残り日数と準備の入口が表示されます。" };
  if (days > 60) return { label: `D-${days}`, message: "大会要項とプラン全体の流れを確認しておきましょう。" };
  if (days >= 31) return { label: `D-${days}`, message: "プラン進行と大会要項の確認を進める時期です。" };
  if (days >= 15) return { label: `D-${days}`, message: "ギア、検量、ルール、オープナー候補を確認しましょう。" };
  if (days >= 7) return { label: `D-${days}`, message: "疲労管理、ピーキング、持ち物準備を優先しましょう。" };
  if (days >= 1) return { label: `D-${days}`, message: "忘れ物、移動、検量、試技順を最終確認しましょう。" };
  if (days === 0) return { label: "D-Day", message: "今日は大会当日。第一試技は白を取りに行きましょう。" };
  return { label: `D+${Math.abs(days)}`, message: "大会ノートに結果と次回課題を残しましょう。" };
}

function meetPreparationFocus(days) {
  if (days === null) {
    return {
      label: "大会日未設定",
      title: "大会日を入れると準備が動きます",
      body: "大会日を入力すると、D-day表示と今日見るべき準備が分かりやすくなります。"
    };
  }
  if (days > 30) {
    return {
      label: "D-60〜D-31",
      title: "要項と全体像を確認",
      body: "大会要項、出場区分、ルール、プラン全体の流れを早めに確認しましょう。"
    };
  }
  if (days >= 15) {
    return {
      label: "D-30〜D-15",
      title: "ギアと検量を固める",
      body: "大会要項、検量時間、コスチューム、ベルト、リストラップなどを確認する時期です。"
    };
  }
  if (days >= 7) {
    return {
      label: "D-14〜D-7",
      title: "オープナーと疲労管理",
      body: "オープナー候補、疲労管理、移動、持ち物を確認して、本番に向けて迷いを減らしましょう。"
    };
  }
  if (days >= 1) {
    return {
      label: "D-6〜D-1",
      title: "忘れ物と当日動線の最終確認",
      body: "移動、食事、検量、試技順、持ち物を最終確認。第一試技は白を取りにいきましょう。"
    };
  }
  if (days === 0) {
    return {
      label: "D-Day",
      title: "今日は大会当日",
      body: "第一試技は白を取りにいきましょう。成功試技を積み上げることも競技力です。"
    };
  }
  return {
    label: `D+${Math.abs(days)}`,
    title: "大会ノートで次につなげる",
    body: "試技結果、赤判定の理由、当日の気づきを残して、次のサイクルへつなげましょう。"
  };
}

function renderMeetCommand(athlete = currentAthlete()) {
  if (!els.meetCommandPanel) return;
  const days = daysUntilMeet(athlete);
  const countdown = meetCountdownText(athlete);
  const focus = meetPreparationFocus(days);
  const dateText = athlete.meetDate ? athlete.meetDate.replaceAll("-", ".") : "大会日未設定";
  const ddayClass = days === null ? "unset" : days < 0 ? "done" : days <= 14 ? "urgent" : "";
  const ddayTitle = days === null ? "大会日がまだ設定されていません" : "次の大会まで";
  const ddayLead = days === null
    ? "大会日を入力すると、D-dayカウントダウンと準備リストが使いやすくなります。"
    : days < 0
      ? `大会から${Math.abs(days)}日経過`
      : days === 0
        ? "大会当日"
        : `大会まで残り${days}日`;
  els.meetCommandPanel.innerHTML = `
    <section class="meet-hero-card">
      <div class="meet-hero-copy">
        <span>MEET</span>
        <h2>本番で白を取るために、準備を整えよう。</h2>
        <p>やるべきことを一つずつ、確実に仕上げていこう。</p>
      </div>
    </section>
    <section class="meet-command-grid">
      <article class="meet-dday-card ${ddayClass}">
        <span>${escapeHtml(ddayTitle)}</span>
        <strong>${escapeHtml(countdown.label)}</strong>
        <p>${escapeHtml(ddayLead)}</p>
        <small>${escapeHtml(dateText)}</small>
      </article>
      <article class="meet-today-card">
        <span>${escapeHtml(focus.label)}</span>
        <strong>${escapeHtml(focus.title)}</strong>
        <p>${escapeHtml(focus.body)}</p>
        <a href="#meetPrepChecklist">チェックリストへ</a>
      </article>
    </section>
    <div class="meet-command-actions">
      <a href="#meetPrepChecklist"><span>準備</span><strong>チェックリスト</strong></a>
      <button type="button" data-meet-action="quiz"><span>白判定</span><strong>クイズ</strong></button>
      <a href="#meetNoteTitle"><span>記録</span><strong>大会ノート</strong></a>
    </div>
  `;
}

function nextCycleMilestone(cycle = normalizedCycle()) {
  const week = Number(cycle.week || 1);
  const length = Number(cycle.length || 12);
  const milestones = cycle.programMethod === "rebuild16"
    ? [
      [5, "Reset現在地チェック"],
      [6, "移行週"],
      [11, "Lv2現在地チェック"],
      [16, "大会想定MAXチェック"]
    ]
    : cycle.programMethod === "platform"
      ? [
        [4, "ブリッジ週"],
        [5, "現在地チェック"],
        [length, "大会想定MAXチェック"]
      ]
      : [[length, "最終週"]];
  const next = milestones.find(([milestoneWeek]) => milestoneWeek >= week) || milestones.at(-1);
  return next ? `W${next[0]} ${next[1]}` : "未設定";
}

function renderAthleteDashboard(athlete = currentAthlete(), cycle = normalizedCycle()) {
  if (!els.athleteDashboard) return;
  els.athleteDashboard.innerHTML = `
    <div class="dashboard-head dashboard-head-compact">
      <div>
        <span>ATHLETE DASHBOARD</span>
        <strong>現在地・目標・競技情報</strong>
        <small>${escapeHtml(athlete.name || "自分")} / ${escapeHtml(athlete.prefecture || "エリア未設定")} / ${escapeHtml(athlete.meetDate || "大会未設定")}</small>
      </div>
    </div>
  `;
  return;
  athlete.goals = normalizeGoals(athlete.goals);
  const currentValues = Object.fromEntries(mainLiftIds.map((liftId) => [liftId, dashboardCurrentMax(liftId, cycle)]));
  const currentTotalValue = mainLiftIds.reduce((sum, liftId) => sum + currentValues[liftId], 0);
  const goalValues = Object.fromEntries(mainLiftIds.map((liftId) => [liftId, dashboardGoalValue(liftId, athlete)]));
  const autoGoalTotalValue = calculatedGoalTotal(athlete);
  const goalTotalValue = Number(athlete.goals.total || 0) || autoGoalTotalValue;
  const remaining = goalTotalValue ? goalTotalValue - currentTotalValue : null;
  const methodLabel = programMethodInfo(cycle).label.replace(" / BIG3", "").replace(" / ベンチプレスのみ", "");
  const totalPercent = achievementPercent(currentTotalValue, goalTotalValue);
  const sexLabel = athlete.sex === "female" ? "女性" : athlete.sex === "male" ? "男性" : "未設定";
  const bodyweightLabel = athlete.bodyweight ? `${formatNumber(athlete.bodyweight)}kg` : "未設定";
  const classLabel = weightClassMeta(athlete.sex, athlete.weightClass)[1] || "未設定";
  const areaLabel = athlete.prefecture || "未設定";
  const meetLabel = athlete.meetDate || "未設定";
  const meetDays = daysUntilMeet(athlete);
  const meetDdayLabel = meetDays === null ? "未設定" : meetDays === 0 ? "D-Day" : meetDays > 0 ? `D-${meetDays}` : `D+${Math.abs(meetDays)}`;
  const goalLine = goalTotalValue
    ? remaining > 0
      ? `目標TOTALまであと +${formatNumber(remaining)}kg`
      : "目標TOTALに到達済み、または更新圏内です"
    : "目標BIG3を入力すると距離が見えます";
  const sexOptions = [
    ["male", "男性"],
    ["female", "女性"],
    ["", "未設定"]
  ].map(([value, label]) => `<option value="${value}" ${athlete.sex === value ? "selected" : ""}>${label}</option>`).join("");
  const classOptions = (weightClasses[athlete.sex || "male"] || weightClasses.male).map(([id, label]) => (
    `<option value="${escapeHtml(id)}" ${athlete.weightClass === id ? "selected" : ""}>${escapeHtml(label)}</option>`
  )).join("");
  const prefectureOptions = [
    `<option value="" ${athlete.prefecture ? "" : "selected"}>未設定</option>`,
    ...prefectures.map((prefecture) => `<option value="${escapeHtml(prefecture)}" ${athlete.prefecture === prefecture ? "selected" : ""}>${escapeHtml(prefecture)}</option>`)
  ].join("");
  const deleteDisabled = state.athletes.length <= 1 ? "disabled" : "";
  const athleteSwitchButtons = state.athletes.map((item) => `
    <button class="athlete-chip dashboard-athlete-chip ${item.id === state.currentAthleteId ? "active" : ""}" type="button" data-dashboard-athlete="${escapeHtml(item.id)}">
      <strong>${escapeHtml(item.name)}</strong>
    </button>
  `).join("");
  const liftInputs = mainLiftIds.map((liftId) => `
    <label>
      <span>現在 ${mainLiftNames[liftId]} 1RM</span>
      <input data-current-max-input="${liftId}" inputmode="decimal" type="number" min="0" step="2.5" value="${escapeHtml(cycle.maxes[liftId] || "")}" placeholder="kg">
    </label>
    <label>
      <span>目標 ${mainLiftNames[liftId]}</span>
      <input data-goal-input="${liftId}" inputmode="decimal" type="number" min="0" step="2.5" value="${escapeHtml(athlete.goals[liftId] || "")}" placeholder="kg">
    </label>
  `).join("");
  const progressCards = [
    ...mainLiftIds.map((liftId) => ({
      label: mainLiftNames[liftId],
      current: currentValues[liftId],
      goal: goalValues[liftId]
    })),
    { label: "TOTAL", current: currentTotalValue, goal: goalTotalValue }
  ].map((item) => {
    const percent = achievementPercent(item.current, item.goal);
    return `
      <article class="achievement-card">
        <span>${escapeHtml(item.label)}</span>
        <strong>${percent === null ? "-" : `${percent}%`}</strong>
        <p>${escapeHtml(achievementText(item.current, item.goal))}</p>
      </article>
    `;
  }).join("");
  els.athleteDashboard.innerHTML = `
    <div class="dashboard-head">
      <div>
        <span>ATHLETE DASHBOARD</span>
        <strong>現在地・目標・競技情報</strong>
      </div>
      <div class="dashboard-actions">
        <button class="text-button compact" type="button" data-athlete-add>選手追加</button>
        <button class="text-button compact danger" type="button" data-athlete-delete ${deleteDisabled}>選手削除</button>
        <button class="text-button compact" type="button" data-view-target="plan">PLANへ</button>
      </div>
    </div>
    <div class="dashboard-athlete-switcher" aria-label="選手切り替え">
      ${athleteSwitchButtons}
    </div>
    <div class="dashboard-status-row">
      <article><span>現在TOTAL</span><strong>${formatNumber(currentTotalValue)}kg</strong><small>SQ ${formatNumber(currentValues.squat)} / BP ${formatNumber(currentValues.bench)} / DL ${formatNumber(currentValues.deadlift)}</small></article>
      <article><span>目標TOTAL</span><strong>${goalTotalValue ? `${formatNumber(goalTotalValue)}kg` : "未設定"}</strong><small>${goalLine}</small></article>
      <article><span>達成率</span><strong>${totalPercent === null ? "-" : `${totalPercent}%`}</strong><small>${remaining === null ? "目標を入れると表示" : remaining > 0 ? `あと ${formatNumber(remaining)}kg` : "更新圏内"}</small></article>
      <article><span>次の大会</span><strong>${escapeHtml(meetDdayLabel)}</strong><small>${escapeHtml(meetLabel)}</small></article>
    </div>
    <div class="dashboard-input-grid">
      ${liftInputs}
      <label class="goal-total-input">
        <span>目標TOTAL</span>
        <input data-goal-input="total" inputmode="decimal" type="number" min="0" step="2.5" value="${escapeHtml(goalTotalValue || "")}" placeholder="BIG3合計を自動表示">
      </label>
    </div>
    <div class="dashboard-profile-editor" aria-label="競技プロフィール入力">
      <label>
        <span>性別</span>
        <select data-profile-input="sex">${sexOptions}</select>
      </label>
      <label>
        <span>体重</span>
        <input data-profile-input="bodyweight" inputmode="decimal" type="number" min="0" step="0.1" value="${escapeHtml(athlete.bodyweight || "")}" placeholder="kg">
      </label>
      <label>
        <span>体重階級</span>
        <select data-profile-input="weightClass">${classOptions}</select>
      </label>
      <label>
        <span>都道府県</span>
        <select data-profile-input="prefecture">${prefectureOptions}</select>
      </label>
      <label>
        <span>試合予定</span>
        <input data-profile-input="meetDate" type="date" value="${escapeHtml(athlete.meetDate || "")}">
      </label>
    </div>
    <div class="dashboard-profile-strip">
      <article><span>性別</span><strong>${escapeHtml(sexLabel)}</strong></article>
      <article><span>体重</span><strong>${escapeHtml(bodyweightLabel)}</strong></article>
      <article><span>階級</span><strong>${escapeHtml(classLabel)}</strong></article>
      <article><span>エリア</span><strong>${escapeHtml(areaLabel)}</strong></article>
      <article><span>大会</span><strong>${escapeHtml(meetLabel)}</strong></article>
    </div>
    <section class="dashboard-association-guide">
      <div>
        <span>所属エリア: ${escapeHtml(areaLabel)}</span>
        <p>大会情報はJPA加盟都道府県協会リンクから、${escapeHtml(athlete.prefecture ? `${athlete.prefecture}協会` : "所属エリアの協会")}を確認してください。</p>
      </div>
      <a href="https://www.jpa-powerlifting.or.jp/overview.php" target="_blank" rel="noopener">JPA加盟都道府県協会リンクを見る</a>
    </section>
    <div class="dashboard-grid">
      <article class="dashboard-card">
        <span>現在地</span>
        <strong>${formatNumber(currentTotalValue)}kg</strong>
        <p>SQ ${formatNumber(currentValues.squat)} / BP ${formatNumber(currentValues.bench)} / DL ${formatNumber(currentValues.deadlift)}</p>
      </article>
      <article class="dashboard-card goal">
        <span>目標</span>
        <strong>${goalTotalValue ? `${formatNumber(goalTotalValue)}kg` : "未設定"}</strong>
        <p>${goalLine}${totalPercent === null ? "" : ` / 達成率 ${totalPercent}%`}</p>
      </article>
      <article class="dashboard-card">
        <span>進行中プラン</span>
        <strong>${escapeHtml(methodLabel)}</strong>
        <p>W${cycle.week} / 次の節目: ${escapeHtml(nextCycleMilestone(cycle))}</p>
      </article>
    </div>
    <div class="achievement-grid">
      ${progressCards}
    </div>
  `;
}

function renderMeetPrepAnnouncement(athlete = currentAthlete()) {
  if (!els.meetPrepAnnouncement) return;
  const days = daysUntilMeet(athlete);
  if (days === null) {
    els.meetPrepAnnouncement.classList.add("hidden");
    els.meetPrepAnnouncement.innerHTML = "";
    return;
  }
  const timing = days > 0 ? `大会まであと${days}日` : days === 0 ? "大会当日" : `大会から${Math.abs(days)}日経過`;
  const countdown = meetCountdownText(athlete);
  els.meetPrepAnnouncement.classList.remove("hidden");
  els.meetPrepAnnouncement.innerHTML = `
    <div>
      <span>大会準備アナウンス</span>
      <strong>${escapeHtml(timing)}</strong>
      <p>${escapeHtml(countdown.message)} タップするとMEETのチェックリストへ進みます。</p>
    </div>
    <button class="text-button compact" type="button" data-view-target="knowledge">MEETへ</button>
  `;
}

function renderMeetPrepChecklist(athlete = currentAthlete()) {
  if (!els.meetPrepChecklist) return;
  const grid = els.meetPrepChecklist.querySelector(".meet-checklist-grid");
  if (!grid) return;
  athlete.meetChecklist = athlete.meetChecklist && typeof athlete.meetChecklist === "object" ? athlete.meetChecklist : {};
  const itemMap = new Map(meetPrepChecklistItems);
  grid.innerHTML = meetPrepChecklistGroups.map((group) => `
    <section class="meet-check-group">
      <h4>${escapeHtml(group.title)}</h4>
      <div>
        ${group.ids.map((id) => {
          const label = itemMap.get(id) || id;
          return `
            <label class="meet-check-item">
              <input type="checkbox" data-meet-check="${escapeHtml(id)}" ${athlete.meetChecklist[id] ? "checked" : ""}>
              <span>${escapeHtml(label)}</span>
            </label>
          `;
        }).join("")}
      </div>
    </section>
  `).join("");
}

function renderHomeDashboard(athlete = currentAthlete(), cycle = normalizedCycle()) {
  if (!els.homeDashboard) return;
  const currentValues = Object.fromEntries(mainLiftIds.map((liftId) => [liftId, dashboardCurrentMax(liftId, cycle)]));
  const currentTotal = mainLiftIds.reduce((sum, liftId) => sum + currentValues[liftId], 0);
  const goalTotal = dashboardGoalTotal(athlete);
  const goalValues = Object.fromEntries(mainLiftIds.map((liftId) => [liftId, dashboardGoalValue(liftId, athlete)]));
  const remaining = goalTotal ? Math.max(0, goalTotal - currentTotal) : null;
  const totalPercent = achievementPercent(currentTotal, goalTotal);
  const phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod);
  const method = programMethodInfo(cycle).label.replace(" / BIG3", "").replace(" / ベンチプレスのみ", "");
  const homePlan = homePlanSummary(cycle, phase);
  const wellnessEntry = todayWellnessEntry(athlete);
  const wellness = wellnessEvaluation(wellnessEntry);
  const weekly = weeklyDataVerdict(weeklyDataSnapshot(athlete, cycle));
  const meetDays = daysUntilMeet(athlete);
  const meetLabel = meetDays === null ? "未設定" : meetDays === 0 ? "D-Day" : meetDays > 0 ? `D-${meetDays}` : `D+${Math.abs(meetDays)}`;
  const meetPriority = meetPriorityText(meetDays);
  const goalMain = goalTotal ? `目標TOTAL ${formatNumber(goalTotal)}kg` : "目標TOTAL 未設定";
  const goalGap = goalTotal ? (remaining > 0 ? `あと ${formatNumber(remaining)}kg` : "達成圏内") : "目標を入力";
  const percentLine = totalPercent === null ? "達成率 -" : `達成率 ${totalPercent}%`;
  const strategy = homeStrategySummary(wellness, wellnessEntry.completed);
  const detail = homeDashboardDetailMarkup(homeDashboardOpenCard, {
    athlete,
    cycle,
    currentValues,
    currentTotal,
    goalValues,
    goalTotal,
    remaining,
    totalPercent,
    method,
    phase,
    homePlan,
    meetLabel,
    meetPriority
  });

  els.homeDashboard.innerHTML = `
    <section class="home-hero-card">
      <div>
        <span>Platform Buddy</span>
        <h2>「強くなりたい」を<br>計画に変える。</h2>
        <p>Platform Buddyは、BIG3を楽しむあなたを、計画的に強くなるリフターへ導く相棒です。</p>
      </div>
      <div class="home-hero-visual" aria-hidden="true">
        <i></i><b></b><i></i>
      </div>
      <button class="home-guide-chip" type="button" data-view-target="plan">PLANへ</button>
    </section>
    <section class="home-card-grid home-command-grid">
      <button class="home-card primary visual-card visual-plan ${homeDashboardOpenCard === "plan" ? "active" : ""}" type="button" data-home-card="plan" aria-expanded="${homeDashboardOpenCard === "plan"}">
        <div class="home-card-top"><i class="home-icon plan" aria-hidden="true"></i><span>今日のプラン</span></div>
        <strong>${escapeHtml(method)} / W${cycle.week}</strong>
        <em class="home-phase-pill">${escapeHtml(phase.name)}</em>
        <div class="home-mini-lines">
          <b>狙い</b><span>${escapeHtml(homePlan.aim)}</span>
          <b>成功</b><span>${escapeHtml(homePlan.success)}</span>
        </div>
        <i class="home-card-caret" aria-hidden="true">${homeDashboardOpenCard === "plan" ? "⌃" : "⌄"}</i>
      </button>
      <button class="home-card current visual-card visual-current ${homeDashboardOpenCard === "current" ? "active" : ""}" type="button" data-home-card="current" aria-expanded="${homeDashboardOpenCard === "current"}">
        <div class="home-card-top"><i class="home-icon location" aria-hidden="true"></i><span>現在地</span></div>
        <strong class="home-total-number"><span>TOTAL</span>${formatNumber(currentTotal)}<small>kg</small></strong>
        <div class="home-lift-pills">
          <span>SQ <b>${formatNumber(currentValues.squat)}</b></span>
          <span>BP <b>${formatNumber(currentValues.bench)}</b></span>
          <span>DL <b>${formatNumber(currentValues.deadlift)}</b></span>
        </div>
        <i class="home-card-caret" aria-hidden="true">${homeDashboardOpenCard === "current" ? "⌃" : "⌄"}</i>
      </button>
      <button class="home-card goal visual-card visual-goal ${homeDashboardOpenCard === "goal" ? "active" : ""}" type="button" data-home-card="goal" aria-expanded="${homeDashboardOpenCard === "goal"}">
        <div class="home-card-top"><i class="home-icon target" aria-hidden="true"></i><span>目標</span></div>
        <strong>${escapeHtml(goalMain)}</strong>
        <p class="home-goal-gap">${escapeHtml(goalGap)}</p>
        <div class="home-progress"><i style="width:${Math.min(100, totalPercent || 0)}%"></i></div>
        <small class="home-card-note">${escapeHtml(percentLine)}</small>
        <div class="home-lift-pills home-lift-pills-compact">
          <span>SQ <b>${formatNumber(goalValues.squat || 0)}</b></span>
          <span>BP <b>${formatNumber(goalValues.bench || 0)}</b></span>
          <span>DL <b>${formatNumber(goalValues.deadlift || 0)}</b></span>
        </div>
        <i class="home-card-caret" aria-hidden="true">${homeDashboardOpenCard === "goal" ? "⌃" : "⌄"}</i>
      </button>
      <button class="home-card meet visual-card visual-meet ${homeDashboardOpenCard === "meet" ? "active" : ""}" type="button" data-home-card="meet" aria-expanded="${homeDashboardOpenCard === "meet"}">
        <div class="home-card-top"><i class="home-icon meet" aria-hidden="true"></i><span>次の大会</span></div>
        <strong class="home-metric">${escapeHtml(meetLabel)}</strong>
        <p>今週の優先</p>
        <small class="home-card-note">${escapeHtml(meetPriority)}</small>
        <i class="home-card-caret" aria-hidden="true">${homeDashboardOpenCard === "meet" ? "⌃" : "⌄"}</i>
      </button>
    </section>
    ${detail}
    <section class="home-strategy-card ${escapeHtml(wellness.status)}" data-wellness-floating role="button" tabindex="0">
      <div class="home-card-top"><i class="home-icon wellness" aria-hidden="true"></i><span>今日の作戦</span></div>
      <div class="home-strategy-content">
        <strong>${escapeHtml(strategy.title)}</strong>
        <div class="home-strategy-pills">
          <span>${escapeHtml(strategy.condition)}</span>
          <span>${escapeHtml(strategy.range)}</span>
        </div>
        <p>${escapeHtml(strategy.action)}</p>
      </div>
    </section>
    <section class="home-buddy-summary ${escapeHtml(weekly.status)}" data-view-target="analysis" role="button" tabindex="0">
      <div>
        <span>Buddyコメント</span>
        <strong>${escapeHtml(weekly.title)}</strong>
        <p>${escapeHtml(weekly.message)}</p>
      </div>
    </section>
    <section class="home-action-panel" aria-label="次の行動">
      <div class="home-action-head">
        <span>次の行動</span>
        <strong>迷ったらここから</strong>
      </div>
      <div class="home-shortcut-grid home-action-grid">
        <button class="home-action-plan" type="button" data-view-target="plan"><span>PLAN</span><strong>今日のプランへ</strong><small>メニュー確認</small></button>
        <button class="home-action-log" type="button" data-view-target="log"><span>LOG</span><strong>記録する</strong><small>自由トレもここ</small></button>
        <button class="home-action-data" type="button" data-view-target="analysis"><span>DATA</span><strong>分析を見る</strong><small>進捗と体調</small></button>
        <button class="home-action-meet" type="button" data-view-target="knowledge"><span>MEET</span><strong>大会準備へ</strong><small>ルールとノート</small></button>
      </div>
    </section>
  `;
}

function homeDashboardDetailMarkup(openCard, context) {
  if (!openCard) return "";
  const { athlete, cycle, currentValues, currentTotal, goalValues, goalTotal, remaining, totalPercent, method, phase, homePlan, meetLabel, meetPriority } = context;
  const currentInputs = mainLiftIds.map((liftId) => `
    <label>
      <span>現在 ${mainLiftNames[liftId]} 1RM</span>
      <input data-current-max-input="${liftId}" inputmode="decimal" type="number" min="0" step="2.5" value="${escapeHtml(cycle.maxes[liftId] || "")}" placeholder="kg">
    </label>
  `).join("");
  const goalInputs = mainLiftIds.map((liftId) => `
    <label>
      <span>目標 ${mainLiftNames[liftId]}</span>
      <input data-goal-input="${liftId}" inputmode="decimal" type="number" min="0" step="2.5" value="${escapeHtml(athlete.goals?.[liftId] || "")}" placeholder="kg">
    </label>
  `).join("");
  const sexOptions = [
    ["male", "男性"],
    ["female", "女性"],
    ["", "未設定"]
  ].map(([value, label]) => `<option value="${value}" ${athlete.sex === value ? "selected" : ""}>${label}</option>`).join("");
  const classOptions = (weightClasses[athlete.sex || "male"] || weightClasses.male).map(([id, label]) => (
    `<option value="${escapeHtml(id)}" ${athlete.weightClass === id ? "selected" : ""}>${escapeHtml(label)}</option>`
  )).join("");
  const prefectureOptions = [
    `<option value="" ${athlete.prefecture ? "" : "selected"}>未設定</option>`,
    ...prefectures.map((prefecture) => `<option value="${escapeHtml(prefecture)}" ${athlete.prefecture === prefecture ? "selected" : ""}>${escapeHtml(prefecture)}</option>`)
  ].join("");
  const area = athlete.prefecture || "未設定";
  const target = athlete.prefecture ? `${athlete.prefecture}協会` : "所属エリアの協会";
  const goalGap = goalTotal
    ? remaining > 0
      ? `目標TOTALまであと ${formatNumber(remaining)}kg`
      : "目標TOTALに到達済み、または更新圏内です"
    : "目標BIG3を入力すると距離が見えます";
  const goalPercent = totalPercent === null ? "達成率 -" : `達成率 ${totalPercent}%`;

  const panels = {
    plan: `
      <div class="home-detail-head">
        <span>今日のプラン</span>
        <strong>${escapeHtml(method)} / W${cycle.week} / ${escapeHtml(phase.name)}</strong>
        <p>狙い: ${escapeHtml(homePlan.aim)} / 成功: ${escapeHtml(homePlan.success)}</p>
      </div>
      <div class="home-detail-stats">
        <article><span>進行中プラン</span><strong>${escapeHtml(method)}</strong></article>
        <article><span>現在の週</span><strong>W${cycle.week}</strong></article>
        <article><span>次の節目</span><strong>${escapeHtml(nextCycleMilestone(cycle))}</strong></article>
      </div>
      <div class="home-detail-actions">
        <button class="primary-button inline" type="button" data-view-target="plan">PLANへ進む</button>
      </div>
    `,
    current: `
      <div class="home-detail-head">
        <span>現在地</span>
        <strong>現在TOTAL ${formatNumber(currentTotal)}kg</strong>
        <p>SQ / BP / DL を入力すると、現在TOTALが自動でまとまります。</p>
      </div>
      <div class="home-detail-grid">
        ${currentInputs}
        <article class="home-detail-total"><span>現在TOTAL</span><strong>${formatNumber(currentTotal)}kg</strong></article>
      </div>
    `,
    goal: `
      <div class="home-detail-head">
        <span>目標</span>
        <strong>${goalTotal ? `目標TOTAL ${formatNumber(goalTotal)}kg` : "目標TOTAL 未設定"}</strong>
        <p>${escapeHtml(goalGap)} / ${escapeHtml(goalPercent)}</p>
      </div>
      <div class="home-detail-grid">
        ${goalInputs}
        <label class="home-detail-total-input">
          <span>目標TOTAL</span>
          <input data-goal-input="total" inputmode="decimal" type="number" min="0" step="2.5" value="${escapeHtml(goalTotal || "")}" placeholder="BIG3合計を自動表示">
        </label>
      </div>
      <div class="home-detail-stats compact">
        <article><span>SQ</span><strong>${formatNumber(goalValues.squat || 0)}kg</strong></article>
        <article><span>BP</span><strong>${formatNumber(goalValues.bench || 0)}kg</strong></article>
        <article><span>DL</span><strong>${formatNumber(goalValues.deadlift || 0)}kg</strong></article>
      </div>
    `,
    meet: `
      <div class="home-detail-head">
        <span>次の大会</span>
        <strong>${escapeHtml(meetLabel)}</strong>
        <p>${escapeHtml(meetPriority)}</p>
      </div>
      <div class="home-detail-grid profile">
        <label>
          <span>試合予定日</span>
          <input data-profile-input="meetDate" type="date" value="${escapeHtml(athlete.meetDate || "")}">
        </label>
        <label>
          <span>性別</span>
          <select data-profile-input="sex">${sexOptions}</select>
        </label>
        <label>
          <span>体重</span>
          <input data-profile-input="bodyweight" inputmode="decimal" type="number" min="0" step="0.1" value="${escapeHtml(athlete.bodyweight || "")}" placeholder="kg">
        </label>
        <label>
          <span>体重階級</span>
          <select data-profile-input="weightClass">${classOptions}</select>
        </label>
        <label>
          <span>都道府県</span>
          <select data-profile-input="prefecture">${prefectureOptions}</select>
        </label>
      </div>
      <section class="home-association-mini">
        <div>
          <span>所属エリア: ${escapeHtml(area)}</span>
          <p>大会情報はJPA加盟都道府県協会リンクから、${escapeHtml(target)}を確認してください。</p>
        </div>
        <a href="https://www.jpa-powerlifting.or.jp/overview.php" target="_blank" rel="noopener">協会リンクを見る</a>
      </section>
    `
  };
  return `
    <section class="home-card-detail-panel ${escapeHtml(openCard)}">
      ${panels[openCard] || ""}
    </section>
  `;
}

function homeStrategySummary(wellness, completed) {
  if (!completed) {
    return {
      title: "体調チェックから開始",
      condition: "未入力",
      range: "レンジ未判定",
      action: "睡眠・食事・疲労・痛み・集中を確認しましょう。"
    };
  }
  const actions = {
    alert: "高重量なし。休養・代替・フォーム確認を優先。",
    fatigue: "下限以下も候補。バックオフは1セット減らす候補。",
    caution: "下限寄りから開始。予定RPEを最優先。",
    normal: "中央寄りから開始。軽ければ少し上限寄りへ。",
    good: "中央〜上限寄りも候補。フォーム再現性は崩さない。"
  };
  return {
    title: "今日の体調と重量方針",
    condition: wellness.label,
    range: wellness.short,
    action: actions[wellness.status] || wellness.recommendation
  };
}

function homePlanSummary(cycle = normalizedCycle(), phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod)) {
  const name = phase?.name || "";
  if (name.includes("蓄積")) return { aim: "軽さの再現", success: "余裕を残して完了" };
  if (name.includes("ブリッジ")) return { aim: "現在地チェックへ整える", success: "疲労を残さず完了" };
  if (name.includes("現在地")) return { aim: "今の実力を確認", success: "@8で止める" };
  if (name.includes("強化")) return { aim: "競技重量に慣れる", success: "フォームを崩さず完了" };
  if (name.includes("ピーキング")) return { aim: "強さを発揮する準備", success: "軽く鋭く終える" };
  if (name.includes("MAX") || name.includes("PR") || cycle.week === cycle.length) return { aim: "白判定の試技運び", success: "第一を確実に" };
  if (cycle.recoveryMode || name.includes("デロード") || name.includes("休養")) return { aim: "疲労を抜く", success: "上限を超えない" };
  return { aim: "予定RPEを守る", success: "次の週へつなげる" };
}

function meetPriorityText(days) {
  if (days === null) return "大会日を設定";
  if (days > 30) return "要項確認 / ルール確認 / 全体設計";
  if (days >= 15) return "ギア確認 / 検量確認 / 要項確認";
  if (days >= 7) return "疲労管理 / 持ち物確認 / 本番準備";
  if (days >= 1) return "忘れ物確認 / 移動 / 検量";
  if (days === 0) return "第一試技で白を取る";
  return "大会ノート / 次回課題";
}

function renderMeetNotebook(athlete = currentAthlete()) {
  if (!els.meetAttemptGrid || !els.meetNoteList) return;
  if (els.meetReviewDateInput && !els.meetReviewDateInput.value) els.meetReviewDateInput.value = today();
  if (els.meetReviewWeightClassInput && !els.meetReviewWeightClassInput.value) els.meetReviewWeightClassInput.value = weightClassMeta(athlete.sex, athlete.weightClass)[1];
  if (els.meetReviewBodyweightInput && !els.meetReviewBodyweightInput.value && athlete.bodyweight) els.meetReviewBodyweightInput.value = athlete.bodyweight;
  renderMeetAttemptGrid();
  renderMeetNoteList(athlete);
  renderMeetReviewPreview(null);
}

function renderMeetAttemptGrid() {
  els.meetAttemptGrid.innerHTML = meetReviewLifts.map((lift) => `
    <section class="meet-attempt-lift">
      <h4>${escapeHtml(lift.short)} ${escapeHtml(lift.label)}</h4>
      ${[1, 2, 3].map((attempt) => meetAttemptRowMarkup(lift, attempt)).join("")}
    </section>
  `).join("");
}

function meetAttemptRowMarkup(lift, attempt) {
  return `
    <div class="meet-attempt-row" data-lift="${escapeHtml(lift.id)}" data-attempt="${attempt}">
      <strong>${attempt}</strong>
      <input class="meet-attempt-weight" inputmode="decimal" type="number" min="0" step="2.5" placeholder="kg" aria-label="${escapeHtml(lift.label)} 第${attempt}試技 重量">
      <select class="meet-attempt-judge" data-judge="1" aria-label="${escapeHtml(lift.label)} 第${attempt}試技 審判1">
        ${optionMarkup(meetJudgeOptions, "pass")}
      </select>
      <select class="meet-attempt-judge" data-judge="2" aria-label="${escapeHtml(lift.label)} 第${attempt}試技 審判2">
        ${optionMarkup(meetJudgeOptions, "pass")}
      </select>
      <select class="meet-attempt-judge" data-judge="3" aria-label="${escapeHtml(lift.label)} 第${attempt}試技 審判3">
        ${optionMarkup(meetJudgeOptions, "pass")}
      </select>
      <select class="meet-attempt-sticking" aria-label="${escapeHtml(lift.label)} 第${attempt}試技 きつかった位置">
        ${optionMarkup(meetStickingPoints, "none")}
      </select>
    </div>
  `;
}

function optionMarkup(options, selectedValue = "") {
  return Object.entries(options).map(([value, label]) => (
    `<option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(label)}</option>`
  )).join("");
}

function meetRedReasonLabel(lift, reason) {
  return (meetRedReasonOptions[lift] || {})[reason] || meetRedReasons[reason] || reason || "";
}

function collectMeetAttempts() {
  return Array.from(els.meetAttemptGrid.querySelectorAll(".meet-attempt-row")).map((row) => {
    const weight = row.querySelector(".meet-attempt-weight").value ? Number(row.querySelector(".meet-attempt-weight").value) : "";
    const judges = Array.from(row.querySelectorAll(".meet-attempt-judge")).map((select) => select.value);
    const redReason = firstRedCard(judges);
    const result = meetResultFromJudges(judges, weight, redReason);
    return {
      lift: row.dataset.lift,
      attempt: Number(row.dataset.attempt),
      weight,
      result,
      judges,
      redReason,
      stickingPoint: row.querySelector(".meet-attempt-sticking").value
    };
  });
}

function meetResultFromJudges(judges = [], weight = "", redReason = "none") {
  const enteredJudges = judges.filter((value) => value && value !== "pass");
  if (!enteredJudges.length && !weight && redReason === "none") return "pass";
  const white = enteredJudges.filter((value) => value === "white").length;
  const red = enteredJudges.filter((value) => isRedCard(value)).length;
  if (white >= 2) return "success";
  if (red >= 2 || (!enteredJudges.length && redReason !== "none")) return "fail";
  return "pass";
}

function isRedCard(value) {
  return /^red[123]$/.test(String(value || ""));
}

function firstRedCard(judges = []) {
  return judges.find(isRedCard) || "none";
}

function hasJudgeInput(judges = []) {
  return judges.some((value) => value && value !== "pass");
}

function meetAttemptIsEntered(attempt) {
  return attempt.weight || attempt.result !== "pass" || attempt.redReason !== "none" || attempt.stickingPoint !== "none" || hasJudgeInput(attempt.judges || []);
}

function successfulMeetTotal(attempts = []) {
  return meetReviewLifts.reduce((sum, lift) => {
    const best = attempts
      .filter((attempt) => attempt.lift === lift.id && (hasJudgeInput(attempt.judges) ? meetResultFromJudges(attempt.judges, attempt.weight, attempt.redReason) : attempt.result) === "success")
      .reduce((max, attempt) => Math.max(max, Number(attempt.weight || 0)), 0);
    return sum + best;
  }, 0);
}

function meetSuccessCount(attempts = []) {
  return attempts.filter((attempt) => (hasJudgeInput(attempt.judges) ? meetResultFromJudges(attempt.judges, attempt.weight, attempt.redReason) : attempt.result) === "success").length;
}

function meetEnteredAttempts(attempts = []) {
  return attempts.filter(meetAttemptIsEntered);
}

function buildMeetNoteFromForm() {
  const attempts = collectMeetAttempts();
  const entered = meetEnteredAttempts(attempts);
  const computedTotal = successfulMeetTotal(attempts);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: els.meetNameInput.value.trim() || "大会ノート",
    date: els.meetReviewDateInput.value || today(),
    weightClass: els.meetReviewWeightClassInput.value.trim() || weightClassMeta(currentAthlete().sex, currentAthlete().weightClass)[1],
    bodyweight: els.meetReviewBodyweightInput.value ? Number(els.meetReviewBodyweightInput.value) : "",
    total: els.meetReviewTotalInput.value ? Number(els.meetReviewTotalInput.value) : computedTotal || "",
    attempts: attempts.map((attempt) => ({
      ...attempt,
      result: meetAttemptIsEntered(attempt) ? attempt.result : "pass"
    })),
    selfNote: els.meetSelfInput.value.trim(),
    goodNote: els.meetGoodInput.value.trim(),
    issueNote: els.meetIssueInput.value.trim(),
    successCount: meetSuccessCount(entered)
  };
}

function renderMeetReviewPreview(note) {
  if (!els.meetReviewPreview) return;
  if (!note) {
    els.meetReviewPreview.innerHTML = "";
    return;
  }
  const messages = meetBuddyReview(note);
  els.meetReviewPreview.innerHTML = `
    <article class="meet-review-card">
      <span>Buddy Review</span>
      <h4>${escapeHtml(note.name)}を保存しました</h4>
      <p>${escapeHtml(note.date)} / ${escapeHtml(note.weightClass)} / ${note.total || "-"}kg / ${meetSuccessCount(meetEnteredAttempts(note.attempts))}/9 成功</p>
      <ul>${messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
    </article>
  `;
}

function renderMeetNoteList(athlete = currentAthlete()) {
  const notes = [...(athlete.meetNotes || [])].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  if (!notes.length) {
    els.meetNoteList.innerHTML = `<p class="history-meta">まだ大会ノートはありません。大会後の記憶が新しいうちに、9本の結果と課題を残しましょう。</p>`;
    return;
  }
  els.meetNoteList.innerHTML = notes.map((note) => meetNoteCardMarkup(note)).join("");
}

function meetNoteCardMarkup(note) {
  const entered = meetEnteredAttempts(note.attempts || []);
  const success = meetSuccessCount(entered);
  const total = note.total || successfulMeetTotal(note.attempts || []) || "-";
  const review = meetBuddyReview(note);
  return `
    <details class="meet-note-card">
      <summary>
        <span>${escapeHtml(note.date || "-")}</span>
        <strong>${escapeHtml(note.name || "大会ノート")}</strong>
        <em>${total}kg / ${success}/9 成功</em>
      </summary>
      <div class="meet-note-detail">
        <div class="meet-note-meta">
          <span>階級: ${escapeHtml(note.weightClass || "-")}</span>
          <span>検量: ${note.bodyweight ? `${escapeHtml(note.bodyweight)}kg` : "-"}</span>
          <span>トータル: ${escapeHtml(total)}kg</span>
        </div>
        <div class="meet-attempt-summary">
          ${(note.attempts || []).map((attempt) => meetAttemptChipMarkup(attempt)).join("")}
        </div>
        ${note.selfNote ? `<p><strong>自己感想</strong><br>${escapeHtml(note.selfNote)}</p>` : ""}
        ${note.goodNote ? `<p><strong>良かった点</strong><br>${escapeHtml(note.goodNote)}</p>` : ""}
        ${note.issueNote ? `<p><strong>次回への課題</strong><br>${escapeHtml(note.issueNote)}</p>` : ""}
        <div class="meet-review-card compact">
          <span>次サイクルへの材料</span>
          <ul>${review.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
        </div>
        <button class="text-button danger" type="button" data-delete-meet-note="${escapeHtml(note.id)}">大会ノート削除</button>
      </div>
    </details>
  `;
}

function meetAttemptChipMarkup(attempt) {
  if (!meetAttemptIsEntered(attempt)) return "";
  const lift = meetReviewLifts.find((item) => item.id === attempt.lift);
  const result = hasJudgeInput(attempt.judges || []) ? meetResultFromJudges(attempt.judges, attempt.weight, attempt.redReason) : attempt.result;
  const resultClass = result === "success" ? "success" : result === "fail" ? "fail" : "pass";
  const reason = attempt.redReason && attempt.redReason !== "none" ? ` / ${meetRedReasonLabel(attempt.lift, attempt.redReason)}` : "";
  const sticking = attempt.stickingPoint && attempt.stickingPoint !== "none" ? ` / ${meetStickingPoints[attempt.stickingPoint] || attempt.stickingPoint}` : "";
  const judges = hasJudgeInput(attempt.judges || []) ? ` 判定:${meetJudgeSummary(attempt.judges)}` : "";
  return `<span class="meet-attempt-chip ${resultClass}">${escapeHtml(lift?.short || attempt.lift)}${attempt.attempt} ${attempt.weight || "-"}kg ${meetAttemptResultLabel(result)}${escapeHtml(judges)}${escapeHtml(reason)}${escapeHtml(sticking)}</span>`;
}

function meetJudgeSummary(judges = []) {
  return judges.map((value) => value === "white" ? "白" : isRedCard(value) ? meetRedCardShortLabel(value) : "未").join("/");
}

function meetRedCardShortLabel(value) {
  if (value === "red1") return "赤①";
  if (value === "red2") return "赤②";
  if (value === "red3") return "赤③";
  return "赤";
}

function meetAttemptResultLabel(result) {
  if (result === "success") return "判定結果:成功";
  if (result === "fail") return "判定結果:失敗";
  return "判定結果:未記録";
}

function meetBuddyReview(note) {
  const attempts = meetEnteredAttempts(note.attempts || []);
  if (!attempts.length) return ["まずは9本の重量と成功・失敗を残すと、次の練習課題が見えやすくなります。"];
  const messages = [];
  const success = meetSuccessCount(attempts);
  const firstFails = attempts.filter((attempt) => attempt.attempt === 1 && attempt.result === "fail").length;
  const thirdFails = attempts.filter((attempt) => attempt.attempt === 3 && attempt.result === "fail").length;
  if (success >= 8) messages.push("白を積み上げられています。次回も第一・第二を堅実に取り、第三で挑戦を残す流れが作れそうです。");
  if (success <= 5) messages.push("成功数が少なめです。次回は第一試技を練習で確実に通せる重量へ寄せ、白を取る設計を優先しましょう。");
  if (firstFails) messages.push("第一試技の失敗があります。オープナーは当日の緊張やコール込みでも成功できる重量に下げる候補です。");
  if (thirdFails >= 2) messages.push("第三試技の失敗が複数あります。第二を確実に通してから第三へ挑戦を残す重量運びを練習しましょう。");

  const reasons = attempts.map((attempt) => attempt.redReason).filter((reason) => reason && reason !== "none");
  const points = attempts.map((attempt) => attempt.stickingPoint).filter((point) => point && point !== "none");
  const hasRed = (lift, red) => attempts.some((attempt) => attempt.lift === lift && (attempt.redReason === red || (attempt.judges || []).includes(red)));
  if (hasRed("squat", "red1")) messages.push("スクワット赤①が出ています。次サイクルは深さの再現性を最優先にし、ポーズスクワットやテンポで毎回同じボトムを作りましょう。");
  if (hasRed("squat", "red2")) messages.push("スクワット赤②が出ています。スタート/フィニッシュ姿勢、膝ロック、切り返し後の下がりを動画で確認しましょう。");
  if (hasRed("squat", "red3")) messages.push("スクワット赤③が出ています。足の動き、主審コール、ラック動作を普段のセットから大会式に寄せましょう。");
  if (hasRed("bench", "red1")) messages.push("ベンチ赤①が出ています。胸/腹部への確実な接触、ベルト接触、肘の深さを練習動画で確認しましょう。");
  if (hasRed("bench", "red2")) messages.push("ベンチ赤②が出ています。挙上中の下がりや肘ロック不足が課題です。止めベンチとロックアウトまで押し切る練習を入れましょう。");
  if (hasRed("bench", "red3")) messages.push("ベンチ赤③が出ています。コール待ち、沈み、尻・足・頭・グリップの固定を大会式で練習しましょう。");
  if (hasRed("deadlift", "red1")) messages.push("デッドリフト赤①が出ています。膝ロックと肩を返したフィニッシュを、トップ保持込みで練習しましょう。");
  if (hasRed("deadlift", "red2")) messages.push("デッドリフト赤②が出ています。挙上中の下がりや大腿部での支持を避けるため、床からトップまで同じテンポで引き切る練習が必要です。");
  if (hasRed("deadlift", "red3")) messages.push("デッドリフト赤③が出ています。主審のダウンコールまで保持し、両手でコントロールして下ろす流れを毎回守りましょう。");
  if (reasons.includes("depth")) messages.push("スクワットの深さが課題です。軽中重量で深さを固定し、ポーズスクワットやテンポで再現性を作りましょう。");
  if (reasons.includes("pause") || reasons.includes("command")) messages.push("コールや胸止めで赤が出ています。競技式の合図待ちを普段のベンチ練習に入れましょう。");
  if (reasons.includes("butt") || reasons.includes("foot")) messages.push("ベンチの接地が課題です。足位置とブリッジを固定し、重くなっても尻・足が動かないセットアップを探しましょう。");
  if (reasons.includes("lockout") || reasons.includes("hitch") || reasons.includes("downward")) messages.push("デッドリフトのフィニッシュが課題です。トップ保持、ヒップスルー、最後まで押し切る練習を優先しましょう。");
  if (points.includes("bottom")) messages.push("ボトムで重く感じています。切り返し姿勢を崩さないため、ポーズ系やボトム付近のフォーム確認が有効です。");
  if (points.includes("offChest")) messages.push("ベンチの胸から離れる局面が課題です。静止ベンチ、足の踏み込み、胸上での軌道再現を次サイクルに入れましょう。");
  if (points.includes("top") || points.includes("lockout")) messages.push("トップ・ロックアウトで詰まっています。過重量よりもフォームを保てる範囲で最後まで押し切る練習を増やしましょう。");
  if (points.includes("mental")) messages.push("メンタル面の負荷が大きかった記録です。次回はウォームアップ、試技申請、待機時間の流れを事前にメモ化しましょう。");
  if (!messages.length) messages.push("大きな赤信号は少ない記録です。良かった点を次回も再現できるよう、ウォームアップと試技選択を残しておきましょう。");
  return [...new Set(messages)].slice(0, 5);
}

function updateCustomExerciseVisibility() {
  const isCustom = els.exerciseSelect.value === "custom";
  els.customExerciseLabel.classList.toggle("hidden", !isCustom);
  els.customExerciseInput.required = isCustom;
  renderAlternativePanel();
}

function renderAlternativePanel() {
  const exerciseId = els.exerciseSelect.value;
  const alternative = exerciseAlternatives[exerciseId];
  if (!alternative) {
    els.alternativePanel.classList.add("hidden");
    els.alternativePanel.innerHTML = "";
    return;
  }

  const meta = exerciseMeta(exerciseId);
  els.alternativePanel.classList.remove("hidden");
  els.alternativePanel.innerHTML = `
    <div class="alternative-head">
      <span class="alternative-badge">設備依存あり</span>
      <div>
        <h3>できない場合</h3>
        <p>${escapeHtml(meta.name)}が難しい環境向けの代替候補です。</p>
      </div>
    </div>
    <div class="alternative-groups">
      ${alternative.groups.map((group) => `
        <div class="alternative-group">
          <span>${escapeHtml(group.title)}</span>
          <div class="alternative-options">
            ${group.items.map(([id, reason]) => {
              const item = exerciseMeta(id);
              return `
                <button class="alternative-option" type="button" data-exercise-id="${escapeHtml(id)}">
                  <strong>${escapeHtml(item.name)}</strong>
                  <small>${escapeHtml(reason)}</small>
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAthletes() {
  els.athleteStrip.innerHTML = "";
  state.athletes.forEach((athlete) => {
    const button = document.createElement("button");
    button.className = `athlete-chip ${athlete.id === state.currentAthleteId ? "active" : ""}`;
    button.type = "button";
    button.textContent = athlete.name;
    button.addEventListener("click", () => {
      state.currentAthleteId = athlete.id;
      saveState();
      render();
    });
    els.athleteStrip.append(button);
  });
}

function deleteCurrentAthlete() {
  if (state.athletes.length <= 1) {
    alert("選手が1名のみのため削除できません。");
    return;
  }
  const athlete = currentAthlete();
  const logCount = (athlete.logs || []).length;
  const ok = window.confirm(`${athlete.name}を削除しますか？\nこの選手の記録 ${logCount}件とプラン設定も削除されます。`);
  if (!ok) return;
  const currentIndex = state.athletes.findIndex((item) => item.id === athlete.id);
  state.athletes = state.athletes.filter((item) => item.id !== athlete.id);
  const nextIndex = Math.max(0, Math.min(currentIndex, state.athletes.length - 1));
  state.currentAthleteId = state.athletes[nextIndex].id;
  saveState();
  render();
}

function bestByExercise(exerciseId) {
  const logs = currentAthlete().logs.filter((log) => log.exerciseId === exerciseId);
  if (!logs.length) return null;
  return logs.reduce((best, log) => (e1rm(log.weight, log.reps) > e1rm(best.weight, best.reps) ? log : best));
}

function bestE1rm(exerciseId) {
  const best = bestByExercise(exerciseId);
  return best ? e1rm(best.weight, best.reps) : "";
}

function renderStats() {
  els.quickStats.innerHTML = mainLiftIds.map((exerciseId) => {
    const best = bestByExercise(exerciseId);
    const value = best ? `${e1rm(best.weight, best.reps)}kg` : "-";
    return `<article class="stat-card"><span>${exerciseMeta(exerciseId).badge} e1RM</span><strong>${value}</strong></article>`;
  }).join("");
}

function renderLogCommand(athlete = currentAthlete(), cycle = normalizedCycle()) {
  if (!els.logCommandPanel) return;
  const logs = sortedLogs(athlete);
  const todayLogs = logs.filter((log) => log.date === today());
  const last7 = logs.filter((log) => daysAgo(log.date) <= 7);
  const trainingDays = new Set(last7.map((log) => log.date)).size;
  const weekTarget = Number(cycle.daysPerWeek || 0);
  const progressPct = weekTarget ? Math.min(100, Math.round((trainingDays / weekTarget) * 100)) : 0;
  const wellness = wellnessEvaluation(todayWellnessEntry(athlete));
  const latest = logs[0];
  const latestText = latest
    ? `${escapeHtml(latest.exerciseName || exerciseMeta(latest.exerciseId).name)} ${formatNumber(latest.weight)}kg x ${formatNumber(latest.reps)}`
    : "まだ記録がありません";
  els.logCommandPanel.innerHTML = `
    <article class="log-command-card wellness-${escapeHtml(wellness.status)}">
      <div>
        <p class="eyebrow">LOG</p>
        <h2>記録は、成長の証。</h2>
        <p>今日の積み重ねが、次の強さをつくります。</p>
      </div>
      <div class="log-command-grid">
        <article>
          <span>今週のトレーニング</span>
          <strong>${trainingDays}/${weekTarget || "-"}回</strong>
          <div class="home-progress"><i style="width:${progressPct}%"></i></div>
          <small>${weekTarget ? `残り ${Math.max(0, weekTarget - trainingDays)}回で目標達成` : "プラン頻度を設定すると進捗が出ます"}</small>
        </article>
        <article>
          <span>今日の記録</span>
          <strong>${todayLogs.length}件</strong>
          <small>${todayLogs.length ? "この下から追加入力できます" : "まず1種目だけでも残しましょう"}</small>
        </article>
        <article>
          <span>今日の体調</span>
          <strong>${escapeHtml(wellness.label)}</strong>
          <small>${escapeHtml(wellness.short)}${wellness.score !== null ? ` / ${wellness.score}点` : ""}</small>
        </article>
      </div>
      <button class="log-latest-card" type="button" data-view-target="history">
        <span>最近の記録</span>
        <strong>${latestText}</strong>
        <small>履歴を見る</small>
      </button>
    </article>
  `;
}

function renderMetrics() {
  const athlete = currentAthlete();
  const last7 = athlete.logs.filter((log) => daysAgo(log.date) <= 7);
  const weeklyVolume = Math.round(last7.reduce((sum, log) => sum + volume(log), 0));
  const rpeLogs = last7.filter((log) => log.rpe);
  const avgRpe = rpeLogs.reduce((sum, log) => sum + Number(log.rpe), 0) / (rpeLogs.length || 1);
  const meetDays = athlete.meetDate ? Math.ceil((new Date(athlete.meetDate) - new Date(today())) / 86400000) : null;
  const exerciseCount = new Set(athlete.logs.map((log) => log.exerciseName || exerciseMeta(log.exerciseId).name)).size;
  const classLabel = weightClassMeta(athlete.sex, athlete.weightClass)[1];
  els.metricGrid.innerHTML = [
    metric("直近7日ボリューム", `${weeklyVolume.toLocaleString()}kg`),
    metric("平均RPE", rpeLogs.length ? avgRpe.toFixed(1) : "-"),
    metric("記録種目数", `${exerciseCount}`),
    metric("階級", `${athlete.sex === "female" ? "女性" : athlete.sex === "male" ? "男性" : "未設定"} ${classLabel}`),
    metric("試合まで", meetDays === null ? "-" : `${meetDays}日`)
  ].join("");
}

function metric(label, value) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function plannedRpeFromLog(log = {}) {
  const fromPlanText = String(log.planText || "").match(/@([\d.]+)/);
  const fromNote = String(log.note || "").match(/RPE\s*([\d.]+)/i);
  return Number(log.plannedRpe || fromNote?.[1] || fromPlanText?.[1] || 0);
}

function weeklyDataSnapshot(athlete = currentAthlete(), cycle = normalizedCycle()) {
  const dates = Array.from({ length: 7 }, (_, index) => today(index - 6));
  athlete.wellness = normalizeWellnessEntries(athlete.wellness);
  const logs = (athlete.logs || []).filter((log) => daysAgo(log.date) >= 0 && daysAgo(log.date) <= 6);
  const planLogs = logs.filter((log) => log.source === "plan");
  const planDaysDone = new Set(planLogs.map((log) => log.date)).size;
  const planTargetDays = Math.max(1, Number(cycle.daysPerWeek || 4));
  const volumeTotal = Math.round(logs.reduce((sum, log) => sum + volume(log), 0));
  const rpePairs = planLogs
    .map((log) => {
      const planned = plannedRpeFromLog(log);
      return planned && log.rpe ? { planned, actual: Number(log.rpe), diff: Number(log.rpe) - planned, date: log.date } : null;
    })
    .filter(Boolean);
  const avgRpeDiff = rpePairs.length
    ? rpePairs.reduce((sum, item) => sum + item.diff, 0) / rpePairs.length
    : null;
  const highRpeDays = new Set(rpePairs.filter((item) => item.diff >= 1).map((item) => item.date));
  const wellnessScores = dates
    .map((date) => {
      const entry = normalizeWellnessEntry({ date, ...(athlete.wellness[date] || {}) });
      const evaluation = wellnessEvaluation(entry);
      return entry.completed ? { date, score: evaluation.score, status: evaluation.status } : null;
    })
    .filter(Boolean);
  const wellnessAverage = wellnessScores.length
    ? Math.round(wellnessScores.reduce((sum, item) => sum + item.score, 0) / wellnessScores.length)
    : null;
  const dailyRows = dates.map((date) => {
    const dayLogs = logs.filter((log) => log.date === date);
    const entry = normalizeWellnessEntry({ date, ...(athlete.wellness[date] || {}) });
    const evaluation = wellnessEvaluation(entry);
    return {
      date,
      volume: Math.round(dayLogs.reduce((sum, log) => sum + volume(log), 0)),
      wellness: entry.completed ? evaluation.score : null,
      wellnessStatus: entry.completed ? evaluation.status : "unset",
      highRpe: highRpeDays.has(date)
    };
  });
  const e1rmChanges = Object.fromEntries(mainLiftIds.map((liftId) => {
    const recent = bestE1rmByRange(athlete, liftId, 0, 6);
    const previous = bestE1rmByRange(athlete, liftId, 7, 13);
    return [liftId, recent && previous ? Math.round((recent - previous) * 10) / 10 : null];
  }));
  return {
    dates,
    logs,
    planLogs,
    planDaysDone,
    planTargetDays,
    volumeTotal,
    rpePairs,
    avgRpeDiff,
    wellnessScores,
    wellnessAverage,
    dailyRows,
    e1rmChanges
  };
}

function bestE1rmByRange(athlete, liftId, minDaysAgo, maxDaysAgo) {
  const values = (athlete.logs || [])
    .filter((log) => log.exerciseId === liftId && daysAgo(log.date) >= minDaysAgo && daysAgo(log.date) <= maxDaysAgo)
    .map((log) => e1rm(log.weight, log.reps));
  return values.length ? Math.max(...values) : null;
}

function weeklyDataVerdict(snapshot) {
  if (!snapshot.logs.length && !snapshot.wellnessScores.length) {
    return {
      status: "info",
      title: "今週のデータを集めましょう",
      message: "ウェルネスチェックとプラン実績が入ると、体調と練習内容の釣り合いを1週間単位で確認できます。"
    };
  }
  if ((snapshot.wellnessAverage !== null && snapshot.wellnessAverage <= 54) || (snapshot.avgRpeDiff !== null && snapshot.avgRpeDiff >= 1.5)) {
    return {
      status: "danger",
      title: "再調整候補",
      message: "体調または実績RPEが強く出ています。来週は提案重量レンジの下限寄り、バックオフ削減、必要なら回復週を候補にしましょう。"
    };
  }
  if ((snapshot.wellnessAverage !== null && snapshot.wellnessAverage <= 69) || (snapshot.avgRpeDiff !== null && snapshot.avgRpeDiff >= 0.75)) {
    return {
      status: "warn",
      title: "やや注意",
      message: "今週は少し疲労が見えます。重量更新より予定RPEとフォーム再現性を優先し、次回は中央〜下限寄りから入りましょう。"
    };
  }
  if (snapshot.avgRpeDiff !== null && snapshot.avgRpeDiff <= -0.75 && snapshot.planDaysDone >= Math.min(snapshot.planTargetDays, 3)) {
    return {
      status: "info",
      title: "余力あり",
      message: "予定RPEより軽く進んでいます。フォームが安定しているなら、次回は調整範囲の中央〜上限寄りを試す候補があります。"
    };
  }
  return {
    status: "ok",
    title: "順調",
    message: "体調とトレーニング負荷の釣り合いは大きく崩れていません。今の流れで、予定RPEを守りながら次の週へ進みましょう。"
  };
}

function renderWeeklyDataSummary(athlete = currentAthlete(), cycle = normalizedCycle()) {
  if (!els.weeklyDataSummary) return;
  const snapshot = weeklyDataSnapshot(athlete, cycle);
  const verdict = weeklyDataVerdict(snapshot);
  const planRate = Math.min(100, Math.round((snapshot.planDaysDone / snapshot.planTargetDays) * 100));
  const rpeDiffText = snapshot.avgRpeDiff === null
    ? "-"
    : `${snapshot.avgRpeDiff >= 0 ? "+" : ""}${snapshot.avgRpeDiff.toFixed(1)}`;
  const wellnessText = snapshot.wellnessAverage === null ? "-" : `${snapshot.wellnessAverage}点`;
  const e1rmText = mainLiftIds.map((liftId) => {
    const value = snapshot.e1rmChanges[liftId];
    return `${mainLiftNames[liftId]} ${value === null ? "-" : `${value >= 0 ? "+" : ""}${formatNumber(value)}kg`}`;
  }).join(" / ");
  els.weeklyDataSummary.innerHTML = `
    <article class="weekly-verdict ${verdict.status}">
      <span>Buddy判定</span>
      <strong>${escapeHtml(verdict.title)}</strong>
      <p>${escapeHtml(verdict.message)}</p>
    </article>
    <div class="weekly-data-grid">
      <article class="weekly-data-card">
        <span>ウェルネス平均</span>
        <strong>${escapeHtml(wellnessText)}</strong>
        <p>${snapshot.wellnessScores.length}/7日入力</p>
      </article>
      <article class="weekly-data-card">
        <span>プラン実施</span>
        <strong>${snapshot.planDaysDone}/${snapshot.planTargetDays}日</strong>
        <p>達成率 ${planRate}%</p>
      </article>
      <article class="weekly-data-card">
        <span>予定RPEとの差</span>
        <strong>${escapeHtml(rpeDiffText)}</strong>
        <p>+は重く、-は軽く出た週</p>
      </article>
      <article class="weekly-data-card">
        <span>週間ボリューム</span>
        <strong>${snapshot.volumeTotal.toLocaleString()}kg</strong>
        <p>LOGとPLANの合計</p>
      </article>
      <article class="weekly-data-card wide">
        <span>e1RM変化</span>
        <strong>${escapeHtml(e1rmText)}</strong>
        <p>直近7日とその前7日のベスト比較</p>
      </article>
    </div>
  `;
}

function renderAcademyEvaluation() {
  const cards = academyEvaluations(currentAthlete(), normalizedCycle()).slice(0, 3);
  els.academyEvaluation.innerHTML = cards.map((card) => `
    <article class="academy-evaluation-card ${card.status}">
      <span>${escapeHtml(card.label)}</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.message)}</p>
    </article>
  `).join("");
}

function academyEvaluations(athlete, cycle) {
  const logs = athlete.logs || [];
  if (!logs.length) {
    return [{
      status: "info",
      label: "記録",
      title: "まずは記録を増やしましょう",
      message: "分析の精度は記録量に左右されます。まずはBIG3と主要補助種目を、RPEつきで残していきましょう。"
    }];
  }

  const last7 = logs.filter((log) => daysAgo(log.date) >= 0 && daysAgo(log.date) <= 6);
  const prev7 = logs.filter((log) => daysAgo(log.date) >= 7 && daysAgo(log.date) <= 13);
  const rpeLogs = last7.filter((log) => log.rpe);
  const avgRpe = rpeLogs.reduce((sum, log) => sum + Number(log.rpe), 0) / (rpeLogs.length || 1);
  const recentRpeIssue = plannedRpeIssue(logs);
  const lastVolume = last7.reduce((sum, log) => sum + volume(log), 0);
  const prevVolume = prev7.reduce((sum, log) => sum + volume(log), 0);
  const balance = liftBalance(cycle, athlete);
  const cards = [];

  if (recentRpeIssue && recentRpeIssue.diff >= 1.5) {
    cards.push({
      status: "danger",
      label: "疲労注意",
      title: "予定RPEより高く出ています",
      message: `直近の${recentRpeIssue.name}で予定@${recentRpeIssue.planned}に対して実績@${recentRpeIssue.actual}でした。回復が追いついていない可能性があります。次回は提案重量より-2.5〜5kg下げ、予定RPEを優先しましょう。`
    });
  } else if (recentRpeIssue && recentRpeIssue.diff >= 0.75) {
    cards.push({
      status: "warn",
      label: "RPE管理",
      title: "やや重く感じています",
      message: `直近の${recentRpeIssue.name}で予定よりRPEが高めです。重量を追いすぎず、次回は-2.5kg程度の調整も選択肢に入れましょう。`
    });
  } else if (rpeLogs.length >= 2 && avgRpe >= 8.5) {
    cards.push({
      status: "warn",
      label: "疲労管理",
      title: "平均RPEが高めです",
      message: `直近7日の平均RPEは${avgRpe.toFixed(1)}です。高RPEが続く時は、トップセットよりバックオフの質とフォーム再現性を優先しましょう。`
    });
  } else if (rpeLogs.length >= 2 && avgRpe <= 6.5) {
    cards.push({
      status: "info",
      label: "強度",
      title: "余力が多めです",
      message: `直近7日の平均RPEは${avgRpe.toFixed(1)}です。フォームが安定しているなら、次回は+2.5kg程度の小さな上積みを検討できます。`
    });
  } else {
    cards.push({
      status: "ok",
      label: "RPE管理",
      title: "堅実に進められています",
      message: "直近のRPEは極端に高すぎず低すぎない範囲です。表示重量より予定RPEを守ることを優先して継続しましょう。"
    });
  }

  if (prevVolume > 0 && lastVolume > prevVolume * 1.35) {
    cards.push({
      status: "warn",
      label: "ボリューム",
      title: "練習量が急に増えています",
      message: "直近7日のボリュームが前週より大きく増えています。疲労が遅れて出ることがあるため、次回はRPEとフォームの乱れを優先して確認しましょう。"
    });
  } else if (prevVolume > 0 && lastVolume < prevVolume * 0.65) {
    cards.push({
      status: "info",
      label: "ボリューム",
      title: "練習量が少なめです",
      message: "直近7日のボリュームが前週より少なめです。忙しさや疲労が理由なら問題ありませんが、伸ばしたい種目は最低限の練習量を確保しましょう。"
    });
  }

  if (balance && balance.recommended && cycle.planTarget !== "bench_only") {
    cards.push({
      status: "info",
      label: "BIG3バランス",
      title: `${mainLiftNames[balance.recommended]}が重点候補です`,
      message: `現在のBIG3バランスでは${mainLiftNames[balance.recommended]}が相対的に低めです。次サイクルで重点種目に迷う場合の候補になります。`
    });
  }

  if (last7.length < 2) {
    cards.push({
      status: "info",
      label: "記録習慣",
      title: "直近の記録が少なめです",
      message: "分析は記録が増えるほど役に立ちます。完璧に残すより、まずは主要セットだけでも継続して記録しましょう。"
    });
  }

  return cards;
}

function plannedRpeIssue(logs) {
  return [...logs]
    .filter((log) => daysAgo(log.date) >= 0 && daysAgo(log.date) <= 14 && log.rpe && log.note)
    .map((log) => {
      const planned = Number((String(log.note).match(/予定RPE\s*([\d.]+)/) || [])[1] || "");
      return planned ? {
        name: log.exerciseName || exerciseMeta(log.exerciseId).name,
        planned,
        actual: Number(log.rpe),
        diff: Number(log.rpe) - planned,
        date: log.date
      } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date))
    .find((item) => item.diff >= 0.75);
}

function daysAgo(dateString) {
  return Math.floor((new Date(today()) - new Date(dateString)) / 86400000);
}

function renderChartOptions() {
  const logs = currentAthlete().logs;
  const previousValue = els.chartLiftSelect.value;
  const options = [...new Map(logs.map((log) => [chartKey(log), log.exerciseName || exerciseMeta(log.exerciseId).name])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "ja"));

  els.chartLiftSelect.innerHTML = options.length
    ? options.map(([key, name]) => `<option value="${escapeHtml(key)}">${escapeHtml(name)}</option>`).join("")
    : mainLiftIds.map((id) => `<option value="${id}">${exerciseMeta(id).name}</option>`).join("");
  els.chartLiftSelect.value = options.some(([key]) => key === previousValue) ? previousValue : els.chartLiftSelect.options[0]?.value;
}

function renderHistory() {
  const logs = sortedLogs();
  if (!logs.length) {
    els.historyList.innerHTML = `<p class="history-meta">まだ記録がありません。</p>`;
    return;
  }
  const groups = groupLogsByDate(logs).slice(0, 40);
  els.historyList.innerHTML = groups.map(({ date, logs: dayLogs }) => {
    const highlight = dayHighlightLog(dayLogs);
    const highlightName = highlight.exerciseName || exerciseMeta(highlight.exerciseId).name;
    const highlightBadge = highlight.badge || exerciseMeta(highlight.exerciseId).badge;
    const totalVolume = Math.round(dayLogs.reduce((sum, log) => sum + volume(log), 0));
    const open = date === groups[0].date ? "open" : "";
    return `
      <details class="history-day" ${open}>
        <summary>
          <div>
            <span class="history-date">${escapeHtml(date)}</span>
            <strong><span class="lift-badge">${escapeHtml(highlightBadge)}</span> ${escapeHtml(highlightName)} ${highlight.weight}kg x ${highlight.reps} x ${highlight.sets}</strong>
            <small>${dayLogs.length}種目 / 推定ボリューム ${totalVolume.toLocaleString("ja-JP")}kg</small>
          </div>
          <span class="history-open">▾</span>
        </summary>
        <div class="history-day-details">
          ${historySectionMarkup("PLAN実績", dayLogs.filter((log) => logSource(log) === "plan"))}
          ${historySectionMarkup("LOG記録", dayLogs.filter((log) => logSource(log) === "log"))}
        </div>
      </details>
    `;
  }).join("");
}

function groupLogsByDate(logs) {
  const grouped = new Map();
  logs.forEach((log) => {
    if (!grouped.has(log.date)) grouped.set(log.date, []);
    grouped.get(log.date).push(log);
  });
  return [...grouped.entries()].map(([date, dayLogs]) => ({
    date,
    logs: dayLogs.sort((a, b) => historyLogRank(b) - historyLogRank(a) || e1rm(b.weight, b.reps) - e1rm(a.weight, a.reps))
  }));
}

function logSource(log) {
  return log.source === "plan" || String(log.note || "").startsWith("予定RPE") ? "plan" : "log";
}

function historyLogRank(log) {
  const rank = { squat: 300, bench: 290, deadlift: 280 };
  return rank[log.exerciseId] || Number(log.weight || 0);
}

function dayHighlightLog(logs) {
  const mainLiftLogs = logs.filter((log) => mainLiftIds.includes(log.exerciseId));
  const candidates = mainLiftLogs.length ? mainLiftLogs : logs;
  return candidates.reduce((best, log) => {
    const logScore = mainLiftIds.includes(log.exerciseId) ? e1rm(log.weight, log.reps) : Number(log.weight || 0);
    const bestScore = mainLiftIds.includes(best.exerciseId) ? e1rm(best.weight, best.reps) : Number(best.weight || 0);
    return logScore > bestScore ? log : best;
  }, candidates[0]);
}

function historyLogMarkup(log) {
    const name = log.exerciseName || exerciseMeta(log.exerciseId).name;
    const badge = log.badge || exerciseMeta(log.exerciseId).badge;
    const rpe = log.rpe ? ` RPE ${log.rpe}` : "";
    const confidence = log.rpeConfidence ? ` / ${rpeConfidenceLabel(log.rpeConfidence)}` : "";
    const setDetails = setDetailsMarkup(log);
    return `
      <article class="history-item">
        <div>
          <span class="lift-badge ${logSource(log) === "plan" ? "plan-source" : ""}">${logSource(log) === "plan" ? "PLAN" : badge}</span>
          <h2>${escapeHtml(name)} ${log.weight}kg x ${log.reps} x ${log.sets}</h2>
          <p class="history-meta">${log.date}${rpe}${confidence} / e1RM ${e1rm(log.weight, log.reps)}kg</p>
          ${setDetails}
          <p class="history-meta history-note">${log.note ? escapeHtml(log.note) : "メモなし"}</p>
        </div>
        <div class="history-actions">
          <button class="text-button compact" type="button" data-edit-log="${log.id}">編集</button>
          <button class="delete-entry" type="button" data-delete="${log.id}" aria-label="記録を削除">×</button>
        </div>
      </article>
    `;
}

function historySectionMarkup(title, logs) {
  if (!logs.length) return "";
  return `
    <section class="history-source-section">
      <h3>${title}</h3>
      ${logs.map((log) => historyLogMarkup(log)).join("")}
    </section>
  `;
}

function setDetailsMarkup(log) {
  if (!Array.isArray(log.setDetails) || !log.setDetails.length) return "";
  const rows = log.setDetails.map((set, index) => {
    const rpe = set.rpe ? ` @${set.rpe}` : "";
    return `<span>S${index + 1} ${escapeHtml(set.weight)}kg x ${escapeHtml(set.reps)}${rpe}</span>`;
  }).join("");
  return `<div class="set-detail-list">${rows}</div>`;
}

function renderPlan() {
  const cycle = normalizedCycle();
  if (cycle.pendingRecoveryAlert) {
    renderRecoveryAlert(cycle);
    return;
  }
  if (cycle.recoveryMode) {
    renderRecoveryWeek(cycle);
    return;
  }
  const phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod);
  const levelLabel = cycle.programMethod === "platform" ? ` / ${cycle.buddyLevel === "level2" ? "Buddy Lv2" : "Buddy Lv1"}` : "";
  els.cyclePhaseTitle.textContent = `今週の短期目標 / ${cycle.length}週中 ${cycle.week}週目 / ${phase.name}${levelLabel}`;
  const purpose = phasePurpose(phase, cycle);
  const goal = phaseGoalText(cycle, phase);
  els.cyclePhaseNote.textContent = guideEnabled() ? `短期目標: ${goal} そのための目的: ${purpose} ${programMethodInfo(cycle).note}` : "";
  renderRpeCoach(cycle, phase);
  renderProjections(cycle);

  const missing = activePlanLiftIds(cycle).filter((liftId) => !Number(cycle.maxes[liftId] || bestE1rm(liftId)));
  if (missing.length) {
    els.planList.innerHTML = `<article class="plan-card"><h2>現在1RMを設定</h2><p>${missing.map((id) => mainLiftNames[id]).join(" / ")} の現在1RMを入れると、${programMethodInfo(cycle).label}のメニューが出ます。記録済みe1RMがある種目は自動で補完します。</p></article>`;
    return;
  }

  const insight = planInsight(cycle);
  const calibration = rpeCalibrationCard(cycle);
  const learningCard = weekLearningCard(cycle, phase);
  const checkCarryover = currentCheckCarryoverCard(cycle);
  const tenWeekBenchCare = tenWeekBenchCareCard(cycle);
  const weekDays = weeklyTemplate(cycle);
  const planCommand = planCommandCard(cycle, phase, weekDays);
  els.planList.innerHTML = `${planCommand}${calibration}${learningCard}${checkCarryover}${tenWeekBenchCare}${insight}${weekDays.map((day, index) => {
    const mainItems = day.items.filter((item) => item.lift || item.kind === "accessory").slice(0, 3).map((item) => item.name).join(" / ");
    return `
      <details class="day-card plan-day" ${index === 0 ? "open" : ""}>
        <summary class="day-summary">
          <div>
            <span class="lift-badge">Day ${index + 1}</span>
            <h2>${day.title}</h2>
            <p>${escapeHtml(mainItems || "メニューを確認")}</p>
          </div>
          <span class="history-open">▾</span>
        </summary>
        <div class="session-program">
          ${renderDaySessionTable(day, cycle, index)}
          <details class="day-notes-details">
            <summary>補足を見る</summary>
            ${renderDayNotes(day, cycle)}
          </details>
        </div>
      </details>
    `;
  }).join("")}`;
}

function renderDaySessionTable(day, cycle, dayIndex) {
  const blocks = day.items
    .filter((item) => shouldShowActualInput(item) || item.lift || item.kind === "accessory" || item.kind === "method")
    .map((item, itemIndex) => renderEditableExerciseSheet(item, cycle, dayIndex, itemIndex))
    .join("");
  if (!blocks.trim()) return `<p class="muted">この日のメニューを確認してください。</p>`;
  return `
    <div class="editable-session-sheet">
      ${blocks}
    </div>
  `;
}

function sessionRowsForItem(item, cycle, dayIndex, itemIndex) {
  if (item.kind === "accessory") {
    return [{
      name: item.name,
      label: "補助",
      type: "accessory",
      weight: "",
      reps: extractRepsFromWork(item.work),
      sets: extractSetsFromWork(item.work),
      rpe: extractRpeFromWork(item.work),
      sourceItem: item,
      itemIndex,
      rowIndex: 0,
      planText: item.work || "",
      detail: item.note || ""
    }];
  }

  if (item.kind === "method") {
    const blocks = parsePrescriptionBlocks(item.work);
    if (!blocks.length) {
      return [{
        name: item.name,
        label: "確認",
        type: "method",
        weight: "",
        reps: item.work || "",
        sets: "",
        rpe: "",
        sourceItem: item,
        itemIndex,
        rowIndex: 0,
        planText: item.work || "",
        detail: item.note || ""
      }];
    }
    return blocks.map((block, rowIndex) => ({
      name: item.name,
      label: block.type === "topset" ? "Top" : "Back",
      type: block.type,
      weight: `${block.weight}kg`,
      reps: block.reps,
      sets: block.sets || "1",
      rpe: block.rpe,
      sourceItem: item,
      itemIndex,
      rowIndex,
      planText: item.work || "",
      detail: item.note || ""
    }));
  }

  const max = Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
  const prescription = prescriptionForWeek(
    item.lift,
    max,
    cycle.week,
    cycle.length,
    cycle.daysPerWeek,
    item.variant,
    cycle.priorityLift,
    cycle.buddyLevel
  );
  const blocks = parsePrescriptionBlocks(prescription.title);
  return blocks.map((block, rowIndex) => ({
    name: item.name,
    label: block.type === "topset" ? "Top" : "Back",
    type: block.type,
    weight: `${block.weight}kg`,
    reps: block.reps,
    sets: block.sets || "1",
    rpe: block.rpe,
    sourceItem: item,
    itemIndex,
    rowIndex,
    planText: prescription.title,
    detail: prescription.detail
  }));
}

function renderEditableExerciseSheet(item, cycle, dayIndex, itemIndex) {
  const key = planFeedbackKey(cycle, dayIndex, itemIndex, item.lift || item.exerciseId || "custom", item.name);
  const saved = currentAthlete().rpeFeedback?.[key];
  const confidence = saved?.rpeConfidence || "learning";
  const prescribedRows = prescribedSetRows(item, cycle);
  const savedRows = Array.isArray(saved?.setDetails) ? saved.setDetails : [];
  const rowCount = Math.max(prescribedRows.length, savedRows.length);
  const inputRows = Array.from({ length: rowCount }, (_, index) => {
    const planned = prescribedRows[index] || {};
    const savedRow = savedRows[index] || {};
    return {
      ...planned,
      ...savedRow,
      kind: planned.kind || savedRow.kind || "",
      plannedWeight: planned.plannedWeight ?? savedRow.plannedWeight ?? planned.weight ?? "",
      plannedReps: planned.plannedReps ?? savedRow.plannedReps ?? planned.reps ?? "",
      plannedRpe: planned.plannedRpe ?? savedRow.plannedRpe ?? "",
      weight: savedRow.weight ?? planned.weight ?? planned.plannedWeight ?? "",
      reps: savedRow.reps ?? planned.reps ?? planned.plannedReps ?? "",
      rpe: savedRow.rpe ?? ""
    };
  });
  const planSummary = prescriptionSummaryLabel(item, cycle);
  const feedback = saved ? feedbackMarkup(saved) : "";
  const plannedRpe = prescribedRows.length ? (prescribedRows[0].plannedRpe || "") : "";
  const planText = planTextForActualItem(item, cycle);
  return `
    <section class="editable-exercise-sheet actual-box"
      data-plan-key="${escapeHtml(key)}"
      data-lift="${escapeHtml(item.lift || item.exerciseId || "custom")}"
      data-source="plan"
      data-exercise="${escapeHtml(item.name)}"
      data-planned-rpe="${escapeHtml(plannedRpe)}"
      data-plan-text="${escapeHtml(planText)}">
      <div class="editable-exercise-head">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          ${planSummary ? `<span class="exercise-rpe-hint">${escapeHtml(planSummary)}</span>` : ""}
        </div>
      </div>
      <div class="editable-set-sheet actual-set-list">
        ${inputRows.map((row, index) => editableActualSetRowMarkup(row, index)).join("")}
      </div>
      <div class="editable-exercise-footer">
        <select class="actual-rpe-confidence visually-hidden" aria-hidden="true" tabindex="-1">
          <option value="solid"${confidence === "solid" ? " selected" : ""}>自信あり</option>
          <option value="unsure"${confidence === "unsure" ? " selected" : ""}>少し迷う</option>
          <option value="learning"${confidence === "learning" ? " selected" : ""}>感覚練習中</option>
        </select>
        <button class="text-button compact actual-add-set" type="button">＋セット</button>
        <button class="primary-button inline actual-save" type="button">記録</button>
      </div>
      ${feedback}
    </section>
  `;
}

function prescribedSetRows(item, cycle) {
  if (item.kind === "accessory" || item.kind === "method") {
    const reps = extractRepsFromWork(item.work);
    return [{
      kind: item.kind === "accessory" ? "補助" : "確認",
      plannedWeight: "",
      plannedReps: reps,
      plannedRpe: "",
      weight: "",
      reps,
      rpe: ""
    }];
  }
  const blocks = parsePrescriptionBlocks(planTextForActualItem(item, cycle));
  const rows = [];
  blocks.forEach((block) => {
    const setCount = Math.max(1, Math.min(8, Number(block.sets) || 1));
    const rpeNum = String(block.rpe || "").replace(/@/g, "").replace(/RPE/g, "").trim();
    const kind = block.type === "topset" ? "Top" : "Back";
    for (let index = 0; index < setCount; index += 1) {
      rows.push({
        kind,
        plannedWeight: block.weight,
        plannedReps: block.reps,
        plannedRpe: rpeNum,
        weight: block.weight,
        reps: block.reps,
        rpe: "",
      });
    }
  });
  return rows.length ? rows : [{ kind: "", plannedWeight: "", plannedReps: "", plannedRpe: "", weight: "", reps: "", rpe: "" }];
}

function prescriptionSummaryLabel(item, cycle) {
  if (item.kind === "accessory" || item.kind === "method") return "";
  const blocks = parsePrescriptionBlocks(planTextForActualItem(item, cycle));
  const labels = blocks.map((block) => block.rpe).filter(Boolean);
  return labels.length ? `予定 ${labels.join(" / ")}` : "";
}

function planTextForActualItem(item, cycle) {
  if (item.kind === "method" || item.kind === "accessory") return item.work || "";
  const max = Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
  return prescriptionForWeek(
    item.lift,
    max,
    cycle.week,
    cycle.length,
    cycle.daysPerWeek,
    item.variant,
    cycle.priorityLift,
    cycle.buddyLevel
  ).title;
}

function renderDayActualBlock(item, cycle, dayIndex, itemIndex) {
  if (!shouldShowActualInput(item)) return "";
  if (item.kind === "method") return actualInputBlock(item, cycle, item.work, item.note, dayIndex, itemIndex);
  if (item.kind === "accessory") return actualInputBlock(item, cycle, item.work, item.note, dayIndex, itemIndex);
  const max = Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
  const prescription = prescriptionForWeek(item.lift, max, cycle.week, cycle.length, cycle.daysPerWeek, item.variant, cycle.priorityLift, cycle.buddyLevel);
  return actualInputBlock(item, cycle, prescription.title, prescription.detail, dayIndex, itemIndex);
}

function renderDayNotes(day, cycle) {
  const notes = [];
  day.items.forEach((item) => {
    if (item.note) notes.push(`<li><strong>${escapeHtml(item.name)}</strong>：${escapeHtml(item.note)}</li>`);
    if (item.lift) {
      const max = Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
      const prescription = prescriptionForWeek(item.lift, max, cycle.week, cycle.length, cycle.daysPerWeek, item.variant, cycle.priorityLift, cycle.buddyLevel);
      if (prescription.detail) notes.push(`<li><strong>${escapeHtml(item.name)}</strong>：${escapeHtml(prescription.detail)}</li>`);
    }
  });
  if (!notes.length) return `<p class="muted">補足はありません。</p>`;
  return `<ul class="day-notes-list">${notes.join("")}</ul>`;
}

function extractRepsFromWork(work = "") {
  const text = String(work);
  const match = text.match(/(?:x|×)\s*([\d+]+)/i) || text.match(/([\d+]+)\s*回/);
  return match ? match[1] : "";
}

function extractSetsFromWork(work = "") {
  const text = String(work);
  const match = text.match(/([\d+]+)\s*(?:セット|set)/i) || text.match(/(?:x|×)\s*[\d+]+\s*(?:x|×)\s*([\d+]+)/i);
  return match ? match[1] : "";
}

function extractRpeFromWork(work = "") {
  const match = String(work).match(/@?\s*RPE\s*([\d.]+(?:\s*[〜~-]\s*[\d.]+)?)/i) || String(work).match(/@([\d.]+(?:\s*[〜~-]\s*[\d.]+)?)/);
  return match ? `@RPE${match[1].replace(/\s+/g, "")}` : "";
}

function renderPlanContext() {
  const cycle = normalizedCycle();
  const phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod);
  const milestone = nextCycleMilestone(cycle);
  const purpose = phasePurpose(phase, cycle);

  const contextTitle = document.querySelector("#planContextTitle");
  const contextSummary = document.querySelector("#planContextSummary");
  const contextGrid = document.querySelector("#planContextGrid");

  if (!contextTitle || !contextGrid) return;

  contextTitle.textContent = `今週の文脈 / W${cycle.week} / ${cycle.length}週中`;
  if (contextSummary) {
    contextSummary.textContent = `${phase.name} / 次の節目: ${milestone}`;
  }

  contextGrid.innerHTML = `
    <article>
      <span>現在週</span>
      <strong>W${cycle.week} / ${cycle.length}週</strong>
      <p>${escapeHtml(phase.name)}</p>
    </article>
    <article>
      <span>今週のテーマ</span>
      <strong>${escapeHtml(phase.name)}</strong>
      <p>${escapeHtml(purpose || phase.note || "")}</p>
    </article>
    <article>
      <span>次の節目</span>
      <strong>${escapeHtml(milestone)}</strong>
      <p>このまま進めましょう。</p>
    </article>
  `;
}

function planCommandCard(cycle, phase, weekDays = weeklyTemplate(cycle)) {
  const athlete = currentAthlete();
  const wellness = wellnessEvaluation(todayWellnessEntry(athlete));
  const firstDay = weekDays[0] || { title: "Day 1", items: [] };
  const mainItems = firstDay.items.filter((item) => item.lift || item.kind === "accessory").slice(0, 3);
  const mainLine = mainItems.map((item) => item.name).join(" / ") || "今日のメニューを確認";
  const progress = planWeekCompletion(cycle, weekDays);
  const progressPct = progress.planned ? Math.min(100, Math.round((progress.completed / progress.planned) * 100)) : 0;
  const method = programMethodInfo(cycle).label
    .replace(" / BIG3", "")
    .replace(" / ベンチプレスのみ", "");
  const phaseName = phase?.name || "今週";
  return `
    <article class="plan-command-card wellness-${escapeHtml(wellness.status)}">
      <div class="plan-command-status">
        <span class="plan-command-face">${wellness.status === "good" ? "✓" : wellness.status === "unset" ? "?" : "!"}</span>
        <div>
          <p class="eyebrow">Today's Plan</p>
          <h2>${escapeHtml(method)} / W${cycle.week} Day1</h2>
          <p>${escapeHtml(phaseName)} / ${escapeHtml(mainLine)}</p>
        </div>
      </div>
      <div class="plan-command-grid">
        <div>
          <span>今日の体調</span>
          <strong>${escapeHtml(wellness.label)}</strong>
          <small>${wellness.score !== null ? `${wellness.score}点` : "未入力"}</small>
        </div>
        <div>
          <span>今日の方針</span>
          <strong>${escapeHtml(wellness.short)}</strong>
          <small>${escapeHtml(wellness.recommendation)}</small>
        </div>
        <div>
          <span>今週の進捗</span>
          <strong>${progress.completed}/${progress.planned || weekDays.length}</strong>
          <small>${progress.planned ? `${progressPct}% 完了` : "Dayを開いて確認"}</small>
        </div>
      </div>
      <div class="plan-command-progress" aria-label="今週の進捗">
        <span style="width:${progressPct}%"></span>
      </div>
    </article>
  `;
}

function planWeekCompletion(cycle, weekDays = weeklyTemplate(cycle)) {
  const feedback = currentAthlete().rpeFeedback || {};
  const prefix = [cycle.programMethod, cycle.buddyLevel || "level1", cycle.planTarget, `w${cycle.week}`].join("|");
  const completed = Object.keys(feedback).filter((key) => key.startsWith(prefix)).length;
  const planned = weekDays.reduce((sum, day) => {
    return sum + day.items.filter((item) => shouldShowActualInput(item)).length;
  }, 0);
  return { completed: Math.min(completed, planned), planned };
}

function rpeCalibrationCard(cycle) {
  if (cycle.programMethod !== "platform" || cycle.week !== 1) return "";
  const key = rpeCalibrationKey(cycle);
  const saved = currentAthlete().rpeCalibration?.[key] || {};
  const status = saved.status || "";
  const confidence = saved.rpeConfidence || "learning";
  const outcome = rpeCalibrationOutcome(saved);
  return `
    <details class="plan-card rpe-calibration-card" ${saved.status ? "" : ""}>
      <summary class="day-summary">
        <div>
          <span class="lift-badge">W0</span>
          <h2>プラン開始前チェック</h2>
          <p>${saved.status === "done" ? `RPEものさしセット記録済み${outcome ? ` / ${outcome}` : ""}` : saved.status === "skipped" ? "RPEものさしセットはスキップ記録済み" : "RPEものさしセットで余力予測の基準を作る"}</p>
        </div>
        <span class="history-open">▾</span>
      </summary>
      <div class="rpe-calibration-body" data-calibration-key="${escapeHtml(key)}">
        <p class="recommended-badge">任意ドリル</p>
        <h3>RPEものさしセット</h3>
        <p>安全な補助種目で、RIR0 / RPE10の感覚を確認する学習ドリルです。目的は追い込みではなく、PRサイクルで使うRPE/RIRの校正です。</p>
        <ul>
          <li>BIG3本体・高重量フリーウェイトでは行いません。</li>
          <li>マシン、ケーブル、安全性の高い補助種目で行います。</li>
          <li>「もう無理そう」で止めず、安全な実施フォームを保ったまま次の1回を完遂できないところまで確認します。</li>
          <li>最後の1回が途中で止まってもOK。痛み、反動、危険な姿勢崩れ、強い疲労がある日はスキップしてください。</li>
        </ul>
        <div class="calibration-status">
          <button class="text-button compact calibration-status-btn ${status === "done" ? "active" : ""}" type="button" data-calibration-status="done">実施した</button>
          <button class="text-button compact calibration-status-btn ${status === "skipped" ? "active" : ""}" type="button" data-calibration-status="skipped">スキップ</button>
        </div>
        <div class="calibration-grid">
          <label>使用種目<input class="calibration-exercise" type="text" value="${escapeHtml(saved.exercise || "")}" placeholder="例: レッグカール"></label>
          <label>重量<input class="calibration-weight" inputmode="decimal" type="number" min="0" step="0.5" value="${escapeHtml(saved.weight ?? "")}"></label>
          <label>回数<input class="calibration-reps" inputmode="numeric" type="number" min="0" step="1" value="${escapeHtml(saved.reps ?? "")}"></label>
          <label>予想RIR<input class="calibration-predicted-rir" inputmode="numeric" type="number" min="0" max="10" step="1" value="${escapeHtml(saved.predictedRir ?? "")}"></label>
          <label>実際の追加回数<input class="calibration-actual-extra" inputmode="numeric" type="number" min="0" max="30" step="1" value="${escapeHtml(saved.actualExtraReps ?? "")}"></label>
          <label>感じたRPE<input class="calibration-rpe" inputmode="decimal" type="number" min="5" max="10" step="0.5" value="${escapeHtml(saved.feltRpe ?? "")}"></label>
          <label class="calibration-confidence">RPE自信度<select class="calibration-rpe-confidence">
            <option value="solid"${confidence === "solid" ? " selected" : ""}>自信あり</option>
            <option value="unsure"${confidence === "unsure" ? " selected" : ""}>少し迷う</option>
            <option value="learning"${confidence === "learning" ? " selected" : ""}>感覚練習中</option>
          </select></label>
        </div>
        <label>メモ<textarea class="calibration-note" rows="2" placeholder="予想より何回多くできたか、どこで限界が来たか">${escapeHtml(saved.note || "")}</textarea></label>
        ${outcome ? `<p class="rpe-calibration-result">${escapeHtml(outcome)}</p>` : ""}
        <div class="actual-actions">
          <button class="text-button compact calibration-save" type="button">W0チェックを保存</button>
        </div>
      </div>
    </details>
  `;
}

function rpeCalibrationKey(cycle) {
  return [cycle.programMethod, cycle.buddyLevel || "level1", cycle.planTarget, cycle.length, cycle.daysPerWeek, cycle.priorityLift || "total"].join("|");
}

function rpeCalibrationOutcome(saved = {}) {
  if (saved.status === "skipped") return "スキップ。疲労や不安がある日の判断として問題ありません。";
  const predicted = Number(saved.predictedRir);
  const actual = Number(saved.actualExtraReps);
  if (Number.isNaN(predicted) || Number.isNaN(actual)) return "";
  const diff = actual - predicted;
  if (diff >= 2) return `予想より${diff}回多くできました。きつさを早めに限界と判断しやすい可能性があります。`;
  if (diff <= -2) return `予想より${Math.abs(diff)}回少なく限界でした。思ったより限界に近い状態だった可能性があります。`;
  return "予想RIRと実際の追加回数は近い範囲です。この感覚を@7〜@9判断の基準にしましょう。";
}

function saveRpeCalibration(body) {
  if (!body) return;
  const athlete = currentAthlete();
  const activeStatus = body.dataset.status || body.querySelector(".calibration-status-btn.active")?.dataset.calibrationStatus || "done";
  const record = {
    status: activeStatus,
    exercise: body.querySelector(".calibration-exercise")?.value.trim() || "",
    weight: body.querySelector(".calibration-weight")?.value ? Number(body.querySelector(".calibration-weight").value) : "",
    reps: body.querySelector(".calibration-reps")?.value ? Number(body.querySelector(".calibration-reps").value) : "",
    predictedRir: body.querySelector(".calibration-predicted-rir")?.value ? Number(body.querySelector(".calibration-predicted-rir").value) : "",
    actualExtraReps: body.querySelector(".calibration-actual-extra")?.value ? Number(body.querySelector(".calibration-actual-extra").value) : "",
    feltRpe: body.querySelector(".calibration-rpe")?.value ? Number(body.querySelector(".calibration-rpe").value) : "",
    rpeConfidence: body.querySelector(".calibration-rpe-confidence")?.value || "learning",
    note: body.querySelector(".calibration-note")?.value.trim() || "",
    updatedAt: new Date().toISOString()
  };
  athlete.rpeCalibration = athlete.rpeCalibration || {};
  athlete.rpeCalibration[body.dataset.calibrationKey] = record;
  saveState();
  render();
}

function renderRpeCoach(cycle, phase) {
  if (!guideEnabled()) {
    els.rpeCoachCard.innerHTML = "";
    return;
  }
  const isAccumulation = phase.name === "蓄積期";
  const isBridge = phase.name === "ブリッジ週";
  const guide = cycle.programMethod === "platform" && cycle.buddyLevel === "level2"
    ? "Lv2はRPEと%1RMを併用します。表示重量は刺激の下限と上限を守るための目安です。@8を超える日は重量を下げ、軽くても+2.5kg程度に留めて週全体の波を崩さないでください。"
    : isAccumulation || isBridge
    ? "蓄積期はMAX更新を狙う週ではありません。フォーム再現性・練習量・RPE感覚を作り、現在地チェックで確かめるための期間です。予定RPEより重いなら -2.5〜5kg、軽すぎる時だけ +2.5〜5kgで調整してください。"
    : "表示重量は提案です。予定RPEを超えそうなら重量を下げ、余裕がありすぎる時だけ小さく上げます。RIRはフォーム再現性を含めた余力として使います。";
  els.rpeCoachCard.innerHTML = `
    <details class="rpe-coach-details">
      <summary class="rpe-coach-summary">
        <span class="eyebrow">RPE Coach</span>
        <strong>${escapeHtml(rpeCoachHeadline(phase, cycle))}</strong>
      </summary>
      <p>${guide}</p>
      <p class="rpe-principle">RPEは最初から正確に当てる数字ではなく、自分の身体感覚を観察して育てるものです。RIRは「競技フォームを保ったまま、あと何回できそうか」で見ます。深さ、止め、ロックアウト、バー軌道が崩れる余力は、RIRに多く数えません。</p>
      <div class="rpe-scale">
        <span><strong>RPE 6</strong> RIR 4目安</span>
        <span><strong>RPE 7</strong> RIR 3目安</span>
        <span><strong>RPE 8</strong> RIR 2目安</span>
        <span><strong>RPE 9</strong> RIR 1目安</span>
      </div>
    </details>
  `;
}

function rpeCoachHeadline(phase, cycle) {
  if (cycle.buddyLevel === "level2") return "Lv2：RPEと%1RM併用";
  if ((phase.name || "").includes("蓄積") || (phase.name || "").includes("ブリッジ")) return "蓄積期：MAX更新週ではない";
  return "予定RPEを守ることを最優先に";
}

function phasePurpose(phase, cycle = normalizedCycle()) {
  const name = phase?.name || "";
  if (name.includes("Reset 蓄積")) return "大会後や高疲労後のフォーム再現性・練習量・RPE感覚を戻す。";
  if (name.includes("移行")) return "鍛え込まず、疲労を抜き、Lv2用Training Maxと次週の入り方を決める。";
  if (name.includes("蓄積")) return "フォーム再現性・練習量・RPE感覚を作る。";
  if (name.includes("ブリッジ")) return "蓄積期の土台を保ちながら、現在地チェック前に疲労を増やしすぎない。";
  if (name.includes("現在地")) return "限界MAXではなく、後半サイクルの設定材料を確認する。";
  if (name.includes("強化")) return "競技重量に近い練習を増やし、成功率を保ちながら重さへつなげる。";
  if (name.includes("ピーキング")) return "強さを作るより、強さを発揮する準備をする。";
  if (name.includes("MAX") || name.includes("PR") || cycle.week === cycle.length) return "大会形式で成功試技を積み上げる。";
  if (cycle.recoveryMode || name.includes("デロード") || name.includes("休養")) return "疲労を抜き、現在地チェックや次週の精度を上げる。";
  return "今週の練習目的を確認し、予定RPEを守って次週へつなげる。";
}

function liftTargetRangeText(cycle = normalizedCycle(), low = 0.75, high = 0.82) {
  return activePlanLiftIds(cycle).map((liftId) => {
    const max = Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0);
    if (!max) return `${mainLiftNames[liftId]} 未設定`;
    const lower = roundToIncrement(max * low, 2.5);
    const upper = roundToIncrement(max * high, 2.5);
    return `${mainLiftNames[liftId]} ${formatNumber(lower)}〜${formatNumber(upper)}kg`;
  }).join(" / ");
}

function finalTargetText(cycle = normalizedCycle()) {
  const athlete = currentAthlete();
  athlete.goals = normalizeGoals(athlete.goals);
  return activePlanLiftIds(cycle).map((liftId) => {
    const max = Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0);
    const goal = dashboardGoalValue(liftId, athlete);
    if (goal) return `${mainLiftNames[liftId]} ${formatNumber(goal)}kg`;
    if (!max) return `${mainLiftNames[liftId]} 目標未設定`;
    const range = projectedPrRange(liftId, max, cycle.length, cycle.daysPerWeek, cycle.priorityLift, athlete);
    return `${mainLiftNames[liftId]} ${formatNumber(range.low)}〜${formatNumber(range.high)}kg`;
  }).join(" / ");
}

function phaseGoalText(cycle = normalizedCycle(), phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod)) {
  const name = phase?.name || "";
  if (cycle.programMethod === "rebuild16") {
    if (cycle.week <= 4) return `W5 Reset現在地チェックで、${liftTargetRangeText(cycle, 0.72, 0.8)}をRPE8以内で再現できる状態を目指します。大会後や疲労後でも「また積める身体」に戻すことがゴールです。`;
    if (cycle.week === 5) return "限界MAXではなく、次のLv2に入るためのTraining Max候補を確認します。3〜5回@8で止め、強く見せるより正確に現在地を見ることが目標です。";
    if (cycle.week === 6) return "W7からLv2へ入れるように、疲労を抜きながらフォーム、RPE、Training Maxを整理します。鍛え込まず、次に進める状態を作ることが目標です。";
  }
  if (name.includes("蓄積") || name.includes("ブリッジ")) {
    const checkLabel = cycle.week < 4 ? "4週間後のW5現在地チェック" : cycle.week === 4 ? "来週のW5現在地チェック" : "W5現在地チェック";
    return `${checkLabel}で、${liftTargetRangeText(cycle, 0.75, 0.82)}を3〜5回@8以内で扱える状態を目指します。最初より同じ重量が軽く感じる、または1〜2回分の余裕が増えていれば成功です。`;
  }
  if (name.includes("現在地")) {
    return "3〜5回@8で今の実力を確認します。5回やり切ることより、RPE8で止めることが目標です。結果を後半ブロックの重量判断に使います。";
  }
  if (name.includes("強化")) {
    return `ピーキング前までに、${liftTargetRangeText(cycle, 0.82, 0.9)}付近をフォームを崩さず扱える状態を目指します。重さに慣れつつ、予定RPEを守ることが目標です。`;
  }
  if (name.includes("ピーキング")) {
    return "最終チェックで強さを発揮できるように、重さへの接触を残しながら疲労を抜きます。練習量を増やすより、成功率とバーの再現性を上げることが目標です。";
  }
  if (name.includes("MAX") || name.includes("PR") || cycle.week === cycle.length) {
    return `第一を確実に、第二でトータルを作り、第三で${finalTargetText(cycle)}付近へ挑戦できる状態を目指します。成功試技を積み上げることも競技力です。`;
  }
  if (cycle.recoveryMode || name.includes("デロード") || name.includes("休養")) {
    return "次の週に進める身体へ戻すことが目標です。表示上限を超えず、RPE6以下でフォーム確認に留めましょう。";
  }
  return "次の節目へ向けて、予定RPEを守りながら今日の練習を積み上げることが目標です。";
}

function weekLearningCard(cycle, phase) {
  if (!guideEnabled()) return "";
  const isPlatform = cycle.programMethod === "platform";
  const whiteNine = isPlatform && (cycle.week === cycle.length || (phase.name || "").includes("MAX"))
    ? `<p class="white-nine-note"><strong>白9本:</strong> 第一を確実に、第二でトータルを作り、第三で挑戦する。成功試技を積み上げることも競技力です。</p>`
    : "";
  const accumulationNote = isPlatform && ((phase.name || "").includes("蓄積") || (phase.name || "").includes("ブリッジ"))
    ? `<p class="guide-note">この時期はMAX更新を狙う週ではありません。フォーム再現性・練習量・RPE感覚を作り、後半で重さを発揮するための土台を整えます。</p>`
    : "";
  const purpose = phasePurpose(phase, cycle);
  const fullGoal = phaseGoalText(cycle, phase);
  return `
    <article class="plan-card week-learning-card">
      <span class="recommended-badge">短期目標</span>
      <h2>${escapeHtml(phase.name)}</h2>
      <p>${escapeHtml(purpose)}</p>
      <details>
        <summary>詳しく見る</summary>
        <p>${escapeHtml(fullGoal)}</p>
        ${accumulationNote}
        ${whiteNine}
      </details>
    </article>
  `;
}

function currentCheckCarryoverCard(cycle) {
  if (!guideEnabled()) return "";
  if (cycle.programMethod === "rebuild16") return rebuild16CarryoverCard(cycle);
  if (cycle.programMethod !== "platform" || cycle.week <= 5) return "";
  const entries = planFeedbackEntriesForWeek(cycle, 5);
  if (!entries.length && cycle.length !== 10) return "";
  const heavy = entries.filter((entry) => rpeDiff(entry) >= 1);
  const light = entries.filter((entry) => rpeDiff(entry) <= -1);
  let message = "現在地チェックの記録を後半ブロックの判断材料にします。W6以降は表示重量を盲信せず、予定RPEとフォーム再現性を優先してください。";
  if (cycle.length === 10) {
    message = cycle.buddyLevel === "level2"
      ? "10週版はW5チェック後すぐW6強化期に入ります。W5チェックが@8前後なら予定通り。@9近く出た場合は、W6のトップシングルまたはバックオフを-2.5〜5kgして入りましょう。"
      : "10週版はW5チェック後すぐW6強化期に入ります。W5現在地チェックで3回@8だった場合、W6は予定重量より-2.5〜5kgから入る候補があります。5回@8で余裕があった場合は予定通り進めましょう。";
  }
  if (heavy.length) {
    message = "現在地チェックで予定より重く出た種目があります。@9近くまで上がった場合は後半ブロックで強く攻めすぎず、該当種目は -2.5〜5kg やバックオフ減を候補にしてください。";
  } else if (light.length) {
    message = "現在地チェックは余裕を持って終えられています。後半ブロックで +2.5kg 程度の上積みは候補ですが、予定RPEを超えない範囲で進めましょう。";
  }
  return `
    <article class="plan-card week-learning-card">
      <span class="recommended-badge">現在地チェック反映</span>
      <h2>後半ブロックの入り方</h2>
      <p>${message}</p>
    </article>
  `;
}

function rebuild16CarryoverCard(cycle) {
  if (!guideEnabled()) return "";
  if (cycle.week >= 7 && cycle.week <= 10) {
    return `
      <article class="plan-card week-learning-card">
        <span class="recommended-badge">Reset結果の反映</span>
        <h2>Lv2へ入る前の判断</h2>
        <p>W5 Reset現在地チェックが@8前後なら予定通りLv2へ。@9近く出た種目は、W7のトップシングルまたはバックオフを-2.5〜5kg控えめに入る候補があります。</p>
      </article>
    `;
  }
  if (cycle.week >= 12 && cycle.week <= 15) {
    return `
      <article class="plan-card week-learning-card">
        <span class="recommended-badge">Lv2現在地チェック反映</span>
        <h2>後半ブロックの入り方</h2>
        <p>W11 Lv2現在地チェックが@8前後なら予定通り。@9近く出た場合は、W12以降のトップシングルまたはバックオフを-2.5〜5kgして入りましょう。</p>
      </article>
    `;
  }
  return "";
}

function tenWeekBenchCareCard(cycle) {
  if (!guideEnabled()) return "";
  const show = cycle.programMethod === "platform"
    && cycle.length === 10
    && cycle.buddyLevel === "level2"
    && cycle.daysPerWeek === 5
    && cycle.priorityLift === "bench"
    && [6, 7].includes(Number(cycle.week));
  if (!show) return "";
  return `
    <article class="plan-card week-learning-card">
      <span class="recommended-badge">ベンチ頻度の調整</span>
      <h2>押せる状態を保つ</h2>
      <p>肘・肩・前腕に違和感がある場合は、ナローBPまたは三頭補助を減らしてください。ベンチ頻度を守ることより、押せる状態を保つことを優先します。</p>
    </article>
  `;
}

function renderRecoveryAlert(cycle) {
  const alert = cycle.pendingRecoveryAlert;
  const nextWeek = alert.nextWeek || Math.min(cycle.week + 1, cycle.length);
  els.cyclePhaseTitle.textContent = `Buddy Alert / W${nextWeek}前の進行判断`;
  els.cyclePhaseNote.textContent = "";
  els.rpeCoachCard.innerHTML = "";
  renderProjections(cycle);
  els.planList.innerHTML = `
    <article class="plan-card recovery-alert-card">
      <span class="recommended-badge">進行を止める候補</span>
      <h2>このままW${nextWeek}へ進む前に、デロード週を挟む候補です。</h2>
      <p>前週のPLAN実績で、予定よりRPEが高い記録が続いています。進行を止める判断もトレーニングの一部です。</p>
      <div class="recovery-reasons">
        ${(alert.reasons || []).map((reason) => `<span>${escapeHtml(reason)}</span>`).join("")}
      </div>
      <div class="recovery-actions">
        <button class="primary-button inline" type="button" data-recovery-action="start">デロード週を実施する</button>
        <button class="text-button" type="button" data-recovery-action="skip">通常通りW${nextWeek}へ進む</button>
      </div>
    </article>
  `;
}

function renderRecoveryWeek(cycle) {
  const targetWeek = cycle.recoveryForWeek || Math.min(cycle.week + 1, cycle.length);
  els.cyclePhaseTitle.textContent = `W${targetWeek}前のデロード週`;
  els.cyclePhaseNote.textContent = guideEnabled()
    ? "この週は強くなるために追い込む週ではなく、次に進むために回復する週です。表示された上限重量を超えず、RPE6以下でフォーム確認を優先してください。"
    : "";
  els.rpeCoachCard.innerHTML = "";
  renderProjections(cycle);
  els.planList.innerHTML = `
    <article class="plan-card recovery-alert-card">
      <span class="recommended-badge">デロード中</span>
      <h2>今日は上限重量を超えないでください。</h2>
      <p>目的は疲労を抜く、フォームを確認する、痛みや違和感を見直すことです。補助種目は通常の半分、痛みがあれば中止してください。</p>
      <button class="primary-button inline" type="button" data-recovery-action="finish">デロードを終えてW${targetWeek}へ進む</button>
    </article>
    ${recoveryWeekTemplate(cycle).map((day, index) => `
      <details class="day-card plan-day" ${index === 0 ? "open" : ""}>
        <summary class="day-summary">
          <div>
            <span class="lift-badge">Day ${index + 1}</span>
            <h2>${day.title}</h2>
            <p>${day.summary}</p>
          </div>
          <span class="history-open">▾</span>
        </summary>
        <div class="exercise-list">
          ${day.items.map((item) => `
            <div class="exercise-row recovery-row">
              <strong>${escapeHtml(item.name)}</strong>
              <span>${escapeHtml(item.work)}</span>
              <p class="guide-note">${escapeHtml(item.note)}</p>
            </div>
          `).join("")}
        </div>
      </details>
    `).join("")}
  `;
}

function recoveryWeekTemplate(cycle) {
  const max = (lift, percent) => {
    const base = Number(cycle.maxes[lift] || bestE1rm(lift) || 0);
    return base ? `${roundToIncrement(base * percent, 2.5)}kg` : "1RM未設定";
  };
  if (cycle.planTarget === "bench_only") {
    return [
      {
        title: "BP フォーム確認",
        summary: "止め、コール、尻の接地を確認。RPE6以下。",
        items: [
          { name: "ベンチプレス", work: `上限 ${max("bench", 0.65)}まで / 3回 x 3セット`, note: "この重量を超えない。Start / Press / Rack を待つ練習。" },
          { name: "上背部補助", work: "通常の半分 / RPE6以下", note: "追い込まず、肩甲骨の動きだけ確認。" }
        ]
      },
      {
        title: "BP 軽めボリューム",
        summary: "速く、軽く、フォーム再現。",
        items: [
          { name: "ベンチプレス", work: `上限 ${max("bench", 0.6)}まで / 5回 x 2セット`, note: "軽く感じても上限を超えない。" },
          { name: "腕・肩補助", work: "通常の半分 / RPE6以下", note: "痛みや違和感があれば中止。" }
        ]
      }
    ];
  }
  return [
    {
      title: "SQ / BP フォーム確認",
      summary: "しゃがみ、止め、コールを確認。RPE6以下。",
      items: [
        { name: "スクワット", work: `上限 ${max("squat", 0.65)}まで / 3回 x 3セット`, note: "この重量を超えない。深さとラック動作を確認。" },
        { name: "ベンチプレス", work: `上限 ${max("bench", 0.65)}まで / 3回 x 3セット`, note: "Start / Press / Rack を待つ練習。尻浮きに注意。" }
      ]
    },
    {
      title: "DL / BP 軽め",
      summary: "引き切りと下ろし方を確認。デッドは低め上限。",
      items: [
        { name: "デッドリフト", work: `上限 ${max("deadlift", 0.6)}まで / 3回 x 2セット`, note: "Down合図後までコントロール。床に落とさない。" },
        { name: "ベンチプレス", work: `上限 ${max("bench", 0.6)}まで / 5回 x 2セット`, note: "軽く、速く、フォームだけ確認。" }
      ]
    },
    {
      title: "全身軽め / 可動域確認",
      summary: "通常の半分。追い込まない。",
      items: [
        { name: "BIG3 テクニック", work: "50〜60% / 3回 x 2セット", note: "痛みや違和感があれば中止。疲労を抜くことが目的。" },
        { name: "補助種目", work: "通常の半分 / RPE6以下", note: "パンプ狙いで追い込まない。動きの確認だけ。" }
      ]
    }
  ];
}

function activePlanLiftIds(cycle = normalizedCycle()) {
  if (cycle.planTarget === "bench_only") return ["bench"];
  if (cycle.programMethod === "smolov_jr") return [cycle.priorityLift === "squat" ? "squat" : "bench"];
  return mainLiftIds;
}

function programMethodInfo(cycle = normalizedCycle()) {
  const target = cycle.planTarget === "bench_only" ? "ベンチプレスのみ" : "BIG3";
  const platformLabel = cycle.buddyLevel === "level2" ? "Buddy式 Lv2（実戦寄り）" : "Buddy式 Lv1（標準）";
  const platformNote = cycle.buddyLevel === "level2"
    ? "中級者以上向け。SQ/DL週2回、BP週3〜4回を目安に、週内でRPEと%1RMに波を作り、重点種目へ高重量シングルを少量入れる実戦寄りプランです。"
    : "前半4週で現在のMAXを安定させ、休養後の現在地チェックで再現性を確認し、後半の強化・ピーキングから大会想定MAXチェックへ進む標準プランです。";
  const info = {
    platform: [platformLabel, platformNote],
    rebuild16: ["Buddy Rebuild 16（大会後リビルド）", "大会後・高疲労・停滞・ブランク明けに、すぐLv2へ入らず、Lv1 Resetでフォーム・RPE感覚・練習量・疲労状態を整えてから実戦寄りのLv2へ進むリビルド型プランです。"],
    hps: ["HPS（BP向き）", "Hypertrophy → Power → Strength のDUP型。特にベンチ強化との相性が良い方式です。"],
    "531": ["5/3/1（長期型）", "Training Maxを使って堅実に積む長期型。AMRAPは余力を残して止めます。"],
    smolov_jr: ["Smolov Jr.（SQ/BP高負荷）", "3週・週4固定の短期集中高ボリューム方式。SQ/BP向けで、DLには適用しません。補助種目は最小限にします。"]
  }[cycle.programMethod] || ["Platform Buddy", ""];
  return { label: `${info[0]} / ${target}`, note: info[1] };
}

function methodDefaults(programMethod, planTarget = "big3") {
  const defaults = {
    platform: { length: 12, daysPerWeek: 4, accessoryVolume: "normal", locked: [] },
    rebuild16: { length: 16, daysPerWeek: 4, accessoryVolume: "normal", locked: ["length"] },
    hps: { length: 6, daysPerWeek: 3, accessoryVolume: "normal", locked: ["length", "daysPerWeek"] },
    "531": { length: 12, daysPerWeek: planTarget === "bench_only" ? 2 : 4, accessoryVolume: "normal", locked: [] },
    smolov_jr: { length: 3, daysPerWeek: 4, accessoryVolume: "low", locked: ["length", "daysPerWeek", "accessoryVolume"] }
  };
  return defaults[programMethod] || defaults.platform;
}

function allowedCycleLengths(cycle) {
  if (cycle.programMethod === "platform") return [10, 12];
  if (cycle.programMethod === "rebuild16") return [16];
  if (cycle.programMethod === "hps") return [6];
  if (cycle.programMethod === "531") return [4, 8, 12];
  if (cycle.programMethod === "smolov_jr") return [3];
  return [10, 12];
}

function allowedDaysPerWeek(cycle) {
  if (cycle.programMethod === "platform") return [3, 4, 5];
  if (cycle.programMethod === "rebuild16") return [3, 4, 5];
  if (cycle.programMethod === "hps") return [3];
  if (cycle.programMethod === "531") return cycle.planTarget === "bench_only" ? [1, 2, 3] : [3, 4];
  if (cycle.programMethod === "smolov_jr") return [4];
  return [3, 4, 5];
}

function applyProgramRules(cycle, previousMethod = cycle.programMethod, previousTarget = cycle.planTarget) {
  const changed = previousMethod !== cycle.programMethod || previousTarget !== cycle.planTarget;
  const defaults = methodDefaults(cycle.programMethod, cycle.planTarget);
  if (changed) {
    cycle.length = defaults.length;
    cycle.daysPerWeek = defaults.daysPerWeek;
    cycle.accessoryVolume = defaults.accessoryVolume;
  }

  const lengths = allowedCycleLengths(cycle);
  const days = allowedDaysPerWeek(cycle);
  if (!lengths.includes(Number(cycle.length))) cycle.length = lengths.at(-1);
  if (!days.includes(Number(cycle.daysPerWeek))) cycle.daysPerWeek = days.at(-1);
  if (cycle.programMethod === "smolov_jr") cycle.accessoryVolume = "low";
  cycle.week = Math.min(Number(cycle.week || 1), Number(cycle.length));
  if (cycle.planTarget === "bench_only") cycle.priorityLift = "bench";
  if (cycle.programMethod === "smolov_jr" && !["squat", "bench"].includes(cycle.priorityLift)) cycle.priorityLift = "bench";
  if (!["platform", "rebuild16"].includes(cycle.programMethod)) cycle.buddyLevel = "level1";
  return cycle;
}

function planInsight(cycle) {
  const showGuide = guideEnabled();
  const athlete = currentAthlete();
  const method = programMethodInfo(cycle);
  const balance = liftBalance(cycle, athlete);
  const levelWarning = cycle.programMethod === "platform" && cycle.buddyLevel === "level2" && cycle.experienceLevel === "beginner"
    ? `<p class="safety-note"><strong>注意:</strong> Lv2は中級者向けです。RPEに慣れていない方や、まず1サイクル完走を優先したい方はLv1推奨です。</p>`
    : "";
  const rebuildNote = cycle.programMethod === "rebuild16"
    ? `<p class="safety-note"><strong>推奨:</strong> 大会後・高疲労・停滞・ブランク明け向け。初心者用に戻るプランではなく、次のLv2へ入るための再準備ブロックです。</p>`
    : "";
  const levelActiveNote = cycle.programMethod === "platform" && cycle.buddyLevel === "level2"
    ? `<p class="guide-note"><strong>Lv2適用中:</strong> 表示メニューは週内非線形です。SQ/DL週2回、BP週3〜4回を目安に、高強度日・ボリューム日・技術日を分けて表示します。</p>`
    : "";
  if (!showGuide && !levelWarning) return "";
  if (!balance && cycle.planTarget === "bench_only") {
    const recommended = cycle.programMethod === "platform" ? `<span class="recommended-badge">迷ったらこれ</span>` : "";
    return `<article class="plan-card ${["platform", "rebuild16"].includes(cycle.programMethod) ? "recommended-plan" : ""}">${recommended}<h2>${method.label}</h2>${showGuide ? `<p class="guide-note">${method.note}</p>${levelActiveNote}` : ""}${levelWarning}${rebuildNote}</article>`;
  }
  if (!balance) return "";
  const classLabel = weightClassMeta(athlete.sex, athlete.weightClass)[1];
  const recommendedName = mainLiftNames[balance.recommended];
  const selectedName = cycle.priorityLift === "total" ? "トータル" : mainLiftNames[cycle.priorityLift];
  const note = cycle.priorityLift === "total"
    ? `${recommendedName}が相対的に低めです。重点種目に迷う場合は${recommendedName}重視が候補です。`
    : cycle.priorityLift === balance.recommended
      ? `${selectedName}重視は現在のBIG3バランスとも合っています。`
      : `${recommendedName}が相対的に低めです。今の選択は${selectedName}重視なので、目的が明確ならそのままでOKです。`;

  return `
    <article class="plan-card ${["platform", "rebuild16"].includes(cycle.programMethod) ? "recommended-plan" : ""}">
      ${cycle.programMethod === "platform" ? `<span class="recommended-badge">迷ったらこれ</span>` : cycle.programMethod === "rebuild16" ? `<span class="recommended-badge">リビルド型</span>` : ""}
      <h2>${method.label} / ${athlete.sex === "female" ? "女性" : athlete.sex === "male" ? "男性" : "未設定"} ${classLabel} / 現在トータル ${balance.total}kg</h2>
      ${showGuide ? `<p class="guide-note">${method.note} ${note}</p>${levelActiveNote}` : ""}
      ${levelWarning}
      ${rebuildNote}
    </article>
  `;
}

function recommendedProgramLabel(athlete = currentAthlete(), cycle = normalizedCycle()) {
  if (cycle.programMethod === "rebuild16") return "Buddy Rebuild 16";
  if (cycle.programMethod !== "platform") return programMethodInfo(cycle).label.replace(" / BIG3", "").replace(" / ベンチプレスのみ", "");
  if (cycle.experienceLevel === "beginner") return "Buddyメソッド Lv1";
  return "Buddyメソッド Lv2";
}

function renderCycleSetupCard(athlete = currentAthlete(), cycle = normalizedCycle()) {
  if (!els.cycleSetupPanel) return;
  if (Number(cycle.week) >= 2) {
    els.cycleSetupPanel.innerHTML = "";
    els.cycleSetupPanel.classList.add("hidden");
    return;
  }
  els.cycleSetupPanel.classList.remove("hidden");
  const liftIds = activePlanLiftIds(cycle);
  const maxReady = liftIds.filter((liftId) => Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0));
  const currentTotalValue = liftIds.reduce((sum, liftId) => sum + Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0), 0);
  const goalTargetValue = cycle.planTarget === "bench_only" ? dashboardGoalValue("bench", athlete) : dashboardGoalTotal(athlete);
  const remaining = goalTargetValue ? goalTargetValue - currentTotalValue : null;
  const maxStatus = maxReady.length === liftIds.length
    ? "入力済み"
    : `${maxReady.length}/${liftIds.length} 種目`;
  const goalStatus = goalTargetValue ? `${formatNumber(goalTargetValue)}kg` : "未設定";
  const gapText = goalTargetValue
    ? remaining > 0
      ? `目標まであと ${formatNumber(remaining)}kg`
      : "目標到達圏内"
    : "目標を入れると距離が見えます";
  const selected = programMethodInfo(cycle).label.replace(" / BIG3", "").replace(" / ベンチプレスのみ", "");
  const ready = maxReady.length === liftIds.length;
  els.cycleSetupPanel.innerHTML = `
    <div class="section-title">
      <div>
        <p class="eyebrow">Cycle Setup</p>
        <h2>PRサイクル準備</h2>
      </div>
      <button class="primary-button inline" type="button" data-cycle-setup-action="open">${ready ? "PRサイクル設定へ進む" : "現在1RMを確認する"}</button>
    </div>
    <p class="screen-note">ダッシュボードで入力した現在1RMと目標をもとに、PRサイクル設計へ進みます。ここが「現在地を見る」から「計画を作る」への接続地点です。</p>
    <div class="cycle-setup-grid">
      <article>
        <span>現在1RM</span>
        <strong>${escapeHtml(maxStatus)}</strong>
        <p>${ready ? `${liftIds.map((liftId) => `${mainLiftNames[liftId]} ${formatNumber(Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0))}kg`).join(" / ")}` : "ダッシュボードで現在1RMを入力してください。"}</p>
      </article>
      <article>
        <span>目標</span>
        <strong>${escapeHtml(goalStatus)}</strong>
        <p>${escapeHtml(gapText)}</p>
      </article>
      <article>
        <span>推奨の入口</span>
        <strong>${escapeHtml(recommendedProgramLabel(athlete, cycle))}</strong>
        <p>現在の選択: ${escapeHtml(selected)}。迷ったら、まず完走できる強度から始めます。</p>
      </article>
    </div>
  `;
}

function renderCycleInputs() {
  const cycle = normalizedCycle();
  els.planTargetInput.value = cycle.planTarget;
  els.programMethodInput.value = programMethodSelectValue(cycle);
  updateCycleOptionControls(cycle);
  els.cycleLengthInput.value = String(cycle.length);
  els.daysPerWeekInput.value = String(cycle.daysPerWeek);
  els.accessoryVolumeInput.value = cycle.accessoryVolume;
  els.priorityLiftInput.value = cycle.priorityLift;
  els.experienceLevelInput.value = cycle.experienceLevel;
  els.cycleMethodNote.textContent = methodControlNote(cycle);
  renderProgramMethodGuide(cycle);
  els.programDisclaimer.textContent = programDisclaimerText(cycle);
  els.programDisclaimer.classList.toggle("hidden", ["platform", "rebuild16"].includes(cycle.programMethod));
  if (els.cycleWeekInput) {
    els.cycleWeekInput.max = String(cycle.length);
    els.cycleWeekInput.value = String(cycle.week);
  }
  els.squatMaxInput.value = cycle.maxes.squat || "";
  els.benchMaxInput.value = cycle.maxes.bench || "";
  els.deadliftMaxInput.value = cycle.maxes.deadlift || "";
  renderFacilityOptions(cycle);
}

function renderProgramMethodGuide(cycle = normalizedCycle()) {
  if (!els.programMethodGuide) return;
  const method = programMethodInfo(cycle);
  const current = method.label.replace(" / BIG3", "").replace(" / ベンチプレスのみ", "");
  const cards = [
    ["Buddy Lv1", "RPE感覚、フォーム再現性、1サイクル完走を重視。初中級者や迷った人の標準ルートです。"],
    ["Buddy Lv2", "RPEと%1RMを併用し、週内の強弱と高重量シングルを少し増やす中級者向けです。"],
    ["Rebuild 16", "大会後、高疲労、停滞、ブランク明けに一度整えてからLv2へ進む再準備プランです。"]
  ];
  const showBuddyCards = ["platform", "rebuild16"].includes(cycle.programMethod);
  els.programMethodGuide.innerHTML = `
    <div class="method-guide-head">
      <span>選択中プラン</span>
      <strong>${escapeHtml(current)}</strong>
      <p>${escapeHtml(method.note)}</p>
    </div>
    ${showBuddyCards ? `
      <div class="method-guide-grid">
        ${cards.map(([title, body]) => `
          <article>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(body)}</p>
          </article>
        `).join("")}
      </div>
    ` : `
      <p class="program-disclaimer inline">この方式は各メソッドの考え方を参考にした簡略テンプレートです。完全再現ではありません。</p>
    `}
  `;
}

function updateCycleOptionControls(cycle) {
  const lengthLabels = { 3: "3週", 4: "4週", 6: "6週", 8: "8週", 10: "10週", 12: "12週", 16: "16週" };
  const dayLabels = { 1: "週1回", 2: "週2回", 3: "週3回", 4: "週4回", 5: "週5回" };
  els.cycleLengthInput.innerHTML = allowedCycleLengths(cycle).map((value) => `<option value="${value}">${lengthLabels[value]}</option>`).join("");
  els.daysPerWeekInput.innerHTML = allowedDaysPerWeek(cycle).map((value) => `<option value="${value}">${dayLabels[value]}</option>`).join("");
  const defaults = methodDefaults(cycle.programMethod, cycle.planTarget);
  els.cycleLengthInput.disabled = defaults.locked.includes("length");
  els.daysPerWeekInput.disabled = defaults.locked.includes("daysPerWeek");
  els.accessoryVolumeInput.disabled = defaults.locked.includes("accessoryVolume");
}

function programMethodSelectValue(cycle) {
  if (cycle.programMethod === "platform") {
    return cycle.buddyLevel === "level2" ? "platform_level2" : "platform";
  }
  return cycle.programMethod;
}

function applyProgramMethodSelectValue(cycle, value) {
  if (value === "platform_level2") {
    cycle.programMethod = "platform";
    cycle.buddyLevel = "level2";
    return;
  }
  if (value === "platform_level1" || value === "platform") {
    cycle.programMethod = "platform";
    cycle.buddyLevel = "level1";
    return;
  }
  cycle.programMethod = value;
  cycle.buddyLevel = "level1";
}

function methodControlNote(cycle) {
  const locked = methodDefaults(cycle.programMethod, cycle.planTarget).locked;
  if (cycle.programMethod === "platform") {
    const levelNote = cycle.buddyLevel === "level2"
      ? "Lv2は中級者以上向け。週内でRPEと%1RMに波を作り、重点種目に高重量シングルを少量入れます。"
      : "Lv1はRPE習得とフォーム再現を優先する標準プランです。";
    return `トレーニング週数は${cycle.length}週。現在地チェック前の休養ブロックを含むため、想定完了期間は約${cycle.length + 1}週です。${levelNote}`;
  }
  if (cycle.programMethod === "rebuild16") return "Buddy Rebuild 16は16週固定。W1〜W5でLv1 Reset、W6で移行、W7〜W16でLv2 10週へ進む大会後・高疲労向けの再準備プランです。";
  if (!locked.length) return "この方式では週数・頻度を選択できます。";
  if (cycle.programMethod === "hps") return "HPSは6週・週3回固定です。Hypertrophy → Power → Strengthの順で回します。";
  if (cycle.programMethod === "smolov_jr") return "Smolov Jr.は3週・週4回・補助少なめ固定です。SQ/BP向けで、DLには適用しません。";
  return "この方式では一部の設定が固定されます。";
}

function programDisclaimerText(cycle) {
  if (["platform", "rebuild16"].includes(cycle.programMethod)) return "";
  return "注記: HPS、5/3/1、Smolov Jr.は各メソッドの考え方を参考にしたPlatform Buddy用の簡略テンプレートです。公式プログラムの完全再現、公式提携、公式承認を示すものではありません。";
}

function renderFacilityOptions(cycle) {
  els.facilityGrid.innerHTML = facilityExerciseOptions.map((exerciseId) => {
    const meta = exerciseMeta(exerciseId);
    const checked = cycle.availableFacilityExercises.includes(exerciseId) ? "checked" : "";
    return `
      <label class="facility-option">
        <input type="checkbox" value="${exerciseId}" ${checked}>
        <span>${escapeHtml(meta.name)}</span>
      </label>
    `;
  }).join("");
}

function normalizedCycle() {
  const athlete = currentAthlete();
  athlete.cycle = athlete.cycle || defaultCycle();
  athlete.cycle.length = Number(athlete.cycle.length || 12);
  athlete.cycle.daysPerWeek = Number(athlete.cycle.daysPerWeek || 4);
  athlete.cycle.planTarget = ["big3", "bench_only"].includes(athlete.cycle.planTarget) ? athlete.cycle.planTarget : "big3";
  athlete.cycle.programMethod = ["platform", "rebuild16", "hps", "531", "smolov_jr"].includes(athlete.cycle.programMethod) ? athlete.cycle.programMethod : "platform";
  athlete.cycle.buddyLevel = ["level1", "level2"].includes(athlete.cycle.buddyLevel) ? athlete.cycle.buddyLevel : "level1";
  athlete.cycle.accessoryVolume = athlete.cycle.accessoryVolume || "normal";
  athlete.cycle.priorityLift = ["total", "squat", "bench", "deadlift"].includes(athlete.cycle.priorityLift)
    ? athlete.cycle.priorityLift
    : "total";
  athlete.cycle.experienceLevel = ["beginner", "intermediate", "advanced"].includes(athlete.cycle.experienceLevel)
    ? athlete.cycle.experienceLevel
    : "beginner";
  athlete.cycle.week = Math.min(Number(athlete.cycle.week || 1), athlete.cycle.length);
  athlete.cycle.recoveryMode = athlete.cycle.recoveryMode === true;
  athlete.cycle.recoveryForWeek = athlete.cycle.recoveryForWeek ? Number(athlete.cycle.recoveryForWeek) : null;
  athlete.cycle.recoveryFromWeek = athlete.cycle.recoveryFromWeek ? Number(athlete.cycle.recoveryFromWeek) : null;
  athlete.cycle.pendingRecoveryAlert = athlete.cycle.pendingRecoveryAlert || null;
  athlete.cycle.availableFacilityExercises = Array.isArray(athlete.cycle.availableFacilityExercises)
    ? athlete.cycle.availableFacilityExercises.filter((id) => facilityExerciseOptions.includes(id))
    : [];
  athlete.cycle.maxes = { ...defaultCycle().maxes, ...(athlete.cycle.maxes || {}) };
  applyProgramRules(athlete.cycle);
  return athlete.cycle;
}

function updateCycleFromInputs() {
  const cycle = normalizedCycle();
  const previousMethod = cycle.programMethod;
  const previousTarget = cycle.planTarget;
  cycle.length = Number(els.cycleLengthInput.value);
  cycle.daysPerWeek = Number(els.daysPerWeekInput.value);
  cycle.planTarget = els.planTargetInput.value;
  applyProgramMethodSelectValue(cycle, els.programMethodInput.value);
  cycle.accessoryVolume = els.accessoryVolumeInput.value;
  cycle.priorityLift = els.priorityLiftInput.value;
  cycle.experienceLevel = els.experienceLevelInput.value;
  cycle.week = Math.min(Math.max(Number(cycle.week || 1), 1), cycle.length);
  cycle.availableFacilityExercises = [...els.facilityGrid.querySelectorAll("input:checked")].map((input) => input.value);
  cycle.maxes = {
    squat: els.squatMaxInput.value,
    bench: els.benchMaxInput.value,
    deadlift: els.deadliftMaxInput.value
  };
  if (previousMethod !== cycle.programMethod || previousTarget !== cycle.planTarget) {
    cycle.recoveryMode = false;
    cycle.recoveryForWeek = null;
    cycle.recoveryFromWeek = null;
    cycle.pendingRecoveryAlert = null;
  }
  applyProgramRules(cycle, previousMethod, previousTarget);
  saveState();
  render();
}

function cyclePhase(week, length, programMethod = "platform") {
  if (programMethod === "rebuild16") return rebuild16Phase(week);
  if (programMethod === "platform" && length >= 10 && week === 5) {
    return {
      name: "現在地チェック",
      note: "3日程度の休養で疲労を抜き、前半4週で作ったフォーム再現性とRPE感覚を確認する週。限界MAXは必須ではありません。"
    };
  }
  if (programMethod === "platform" && [10, 12].includes(Number(length)) && week === 4) {
    return {
      name: "ブリッジ週",
      note: "この週は強化期ではなく、現在地チェックへつなぐブリッジ週です。フォーム再現性とRPE感覚を保ちながら、少しだけ競技重量へ近づけます。疲労を溜めすぎず、W5の現在地チェックに備えましょう。"
    };
  }
  if (programMethod === "platform" && week === length) {
    return {
      name: "大会想定MAXチェック",
      note: "通常練習ではなく、SQ→BP→DLを1日にまとめて試技形式で確認する週。第一・第二は成功率、第三だけMAX更新候補。"
    };
  }
  const ratio = week / length;
  if (ratio <= 0.34) {
    return {
      name: "蓄積期",
      note: "フォーム再現性と練習量を積みながら、提案重量を自分のRPE感覚へ合わせる週。"
    };
  }
  if (ratio <= 0.67) {
    return {
      name: "強化期",
      note: "高重量へ移行する週。トップセットで強さを確認し、バックオフで必要な反復を確保する。"
    };
  }
  if (week < length) {
    return {
      name: "ピーキング期",
      note: "1RMに近い重量へ慣らす週。ボリュームを落とし、重さの精度と成功率を上げる。"
    };
  }
  return { name: "大会想定MAXチェック", note: "SQ→BP→DLの順で確認する週。" };
}

function rebuild16Phase(week) {
  if (week <= 4) {
    return {
      name: "Lv1 Reset 蓄積期",
      note: "大会後や高疲労時に、フォーム再現性・RPE感覚・練習量を戻す週。高重量を急いで狙わない。"
    };
  }
  if (week === 5) {
    return {
      name: "Reset 現在地チェック",
      note: "限界MAXではなく、次のLv2に入るための現在地を確認する週。"
    };
  }
  if (week === 6) {
    return {
      name: "移行週",
      note: "鍛える週ではなく、W5の結果を整理し、疲労を抜き、Lv2用Training Maxを決める準備週。"
    };
  }
  const lv2Week = week - 6;
  const lv2Phase = cyclePhase(lv2Week, 10, "platform");
  const label = lv2Phase.name === "大会想定MAXチェック" ? "大会想定MAXチェック" : `Lv2 ${lv2Phase.name}`;
  return {
    name: label,
    note: lv2Phase.note
  };
}

function renderProjections(cycle) {
  const athlete = currentAthlete();
  els.projectionGrid.innerHTML = activePlanLiftIds(cycle).map((liftId) => {
    const max = Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0);
    if (!max) {
      return `<article class="projection-card"><span>${mainLiftNames[liftId]}</span><strong>-</strong><p>現在1RMを入力</p></article>`;
    }
    const range = projectedPrRange(liftId, max, cycle.length, cycle.daysPerWeek, cycle.priorityLift, athlete);
    return `<article class="projection-card"><span>${mainLiftNames[liftId]} 予測PR</span><strong>${range.low}〜${range.high}kg</strong><p>現在1RM ${max}kgから</p></article>`;
  }).join("");
}

function projectedPrRange(liftId, max, length, daysPerWeek, priorityLift = "total", athlete = currentAthlete()) {
  const presets = {
    squat: { ten: [0.025, 0.055], twelve: [0.035, 0.07], cap: 22.5 },
    bench: { ten: [0.035, 0.075], twelve: [0.05, 0.09], cap: 12.5 },
    deadlift: { ten: [0.025, 0.055], twelve: [0.035, 0.07], cap: 25 }
  };
  const preset = presets[liftId];
  const base = length === 10 ? preset.ten : preset.twelve;
  const priorityScore = priorityLift === liftId ? 1.08 : priorityLift === "total" ? 1 : 0.96;
  const volumeScore = ({ 3: 1.02, 4: 1.06, 5: 1.08 }[daysPerWeek] || 1.06) * priorityScore * contextProgressMultiplier(athlete);
  const fatigueDiscount = { 3: 0, 4: 0.005, 5: 0.0125 }[daysPerWeek] || 0.005;
  const lowGain = Math.min(max * base[0] * volumeScore, preset.cap);
  const highGain = Math.min(max * Math.max(base[1] * volumeScore - fatigueDiscount, base[0]), preset.cap);
  return {
    low: roundToIncrement(max + lowGain, 2.5),
    high: roundToIncrement(max + highGain, 2.5)
  };
}

function currentTotal(cycle = normalizedCycle()) {
  return mainLiftIds.reduce((sum, liftId) => sum + Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0), 0);
}

function contextProgressMultiplier(athlete = currentAthlete()) {
  const total = currentTotal();
  const bodyweight = Number(athlete.bodyweight);
  if (!total || !bodyweight) return 1;

  const ratio = total / bodyweight;
  const thresholds = athlete.sex === "female"
    ? { intermediate: 3.2, advanced: 4.6, high: 5.8 }
    : { intermediate: 4.0, advanced: 5.5, high: 7.0 };
  const levelMultiplier = ratio < thresholds.intermediate ? 1.08
    : ratio < thresholds.advanced ? 1
    : ratio < thresholds.high ? 0.86
    : 0.72;
  const classUpper = weightClassMeta(athlete.sex, athlete.weightClass)[2];
  const classMultiplier = !Number.isFinite(classUpper) ? 0.92
    : classUpper <= (athlete.sex === "female" ? 57 : 66) ? 1.03
    : classUpper >= (athlete.sex === "female" ? 84 : 105) ? 0.96
    : 1;

  return levelMultiplier * classMultiplier;
}

function liftBalance(cycle = normalizedCycle(), athlete = currentAthlete()) {
  const lifts = Object.fromEntries(mainLiftIds.map((liftId) => [liftId, Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0)]));
  const total = lifts.squat + lifts.bench + lifts.deadlift;
  if (!total) return null;

  const expected = athlete.sex === "female"
    ? { squat: 0.35, bench: 0.2, deadlift: 0.45 }
    : { squat: 0.36, bench: 0.24, deadlift: 0.4 };
  const gaps = mainLiftIds.map((liftId) => ({
    liftId,
    value: lifts[liftId],
    gap: lifts[liftId] / total - expected[liftId]
  })).sort((a, b) => a.gap - b.gap);

  return { lifts, total, recommended: gaps[0].liftId, gap: gaps[0].gap };
}

function exerciseLine(item, cycle, dayIndex = 0, itemIndex = 0) {
  if (item.kind === "method") {
    const note = guideEnabled() && item.note ? `<p class="guide-note">${escapeHtml(item.note)}</p>` : "";
    const actual = shouldShowActualInput(item) ? actualInputBlock(item, cycle, item.work, item.note, dayIndex, itemIndex) : "";
    return `<div class="exercise-row method-row"><strong>${escapeHtml(item.name)}</strong>${planPrescriptionMarkup(item.work)}${note}${actual}</div>`;
  }
  if (item.kind === "accessory") {
    const badge = item.exerciseId && equipmentLabel(item.exerciseId)
      ? `<em class="equipment-tag">${equipmentLabel(item.exerciseId)}</em>`
      : "";
    const note = guideEnabled() && item.note ? `<p class="guide-note">${escapeHtml(item.note)}</p>` : "";
    const actual = shouldShowActualInput(item) ? actualInputBlock(item, cycle, item.work, item.note, dayIndex, itemIndex) : "";
    return `<div class="exercise-row accessory-row"><strong>${escapeHtml(item.name)}${badge}</strong><span>${escapeHtml(item.work)}</span>${note}${actual}</div>`;
  }
  const max = Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
  const prescription = prescriptionForWeek(item.lift, max, cycle.week, cycle.length, cycle.daysPerWeek, item.variant, cycle.priorityLift, cycle.buddyLevel);
  const phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod);
  const detailMarkup = guideEnabled() && prescription.detail
    ? `<details class="set-detail-note">
        <summary>${escapeHtml(rpeCoachHeadline(phase, cycle))}</summary>
        <p>${escapeHtml(prescription.detail)}</p>
      </details>`
    : "";
  return `
    <div class="exercise-row main-row">
      <div class="exercise-row-header">
        <strong>${escapeHtml(item.name)}</strong>
        ${detailMarkup}
      </div>
      ${planPrescriptionMarkup(prescription.title)}
      ${actualInputBlock(item, cycle, prescription.title, prescription.detail, dayIndex, itemIndex)}
    </div>
  `;
}

function planPrescriptionMarkup(title = "") {
  const blocks = parsePrescriptionBlocks(title);
  if (!blocks.length) return `<span>${escapeHtml(title)}</span>`;
  return `
    <table class="plan-set-table" aria-label="セット予定">
      <thead>
        <tr>
          <th></th>
          <th>重量</th>
          <th>回数</th>
          <th>セット</th>
          <th>RPE目標</th>
        </tr>
      </thead>
      <tbody>
        ${blocks.map((block) => `
          <tr class="plan-set-row ${escapeHtml(block.type)}">
            <td class="set-label">${block.type === "topset" ? "Top" : "Back"}</td>
            <td class="set-weight"><strong>${escapeHtml(block.weight)}<small>kg</small></strong></td>
            <td class="set-reps">${escapeHtml(block.reps)}</td>
            <td class="set-sets">${block.sets ? `×${escapeHtml(block.sets)}` : "—"}</td>
            <td class="set-rpe">${escapeHtml(block.rpe)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function parsePrescriptionBlocks(title = "") {
  const matches = [...String(title).matchAll(/([\d.]+)kg\s*x\s*([\d+]+)(?:\s*x\s*([\d+]+))?\s*@([^\s/]+)/g)];
  return matches.map((match, index) => {
    const weight = Number(match[1]);
    const reps = match[2];
    const sets = match[3];
    const rpe = match[4];
    return {
      label: index === 0 ? "トップセット" : "バックオフセット",
      type: index === 0 ? "topset" : "backoff",
      weight: formatNumber(weight),
      range: recommendationRange(weight),
      reps: reps,
      sets: sets || "",
      rpe: `@RPE${rpe}`,
      goal: `${reps}回${sets ? ` ×${sets}セット` : ""} @${rpe}`
    };
  });
}

function recommendationRange(weight) {
  const step = weight >= 100 ? 5 : 2.5;
  return `${formatNumber(roundToIncrement(Math.max(0, weight - step), 2.5))}〜${formatNumber(roundToIncrement(weight + step, 2.5))}`;
}

function formatNumber(value) {
  return Number(value).toFixed(1).replace(/\.0$/, "");
}

function shouldShowActualInput(item) {
  const text = `${item.name || ""} ${item.work || ""} ${item.note || ""}`;
  return !/(完全休養|休む|散歩|ストレッチ|コンディショニング)/.test(text);
}

function actualInputBlock(item, cycle, planText, detail, dayIndex, itemIndex) {
  const target = plannedTopSet(planText, detail);
  const key = planFeedbackKey(cycle, dayIndex, itemIndex, item.lift || item.exerciseId || "custom", item.name);
  const saved = currentAthlete().rpeFeedback?.[key];
  const previous = previousFeedbackMarkup(cycle, item);
  const feedback = saved ? feedbackMarkup(saved) : "";
  const confidence = saved?.rpeConfidence || "learning";
  const rows = saved?.setDetails?.length ? saved.setDetails : [{ weight: saved?.weight ?? target.weight ?? "", reps: saved?.reps ?? target.reps ?? "", rpe: saved?.rpe ?? "" }];
  return `
    <div class="actual-box" data-plan-key="${escapeHtml(key)}" data-lift="${escapeHtml(item.lift || item.exerciseId || "custom")}" data-source="plan" data-exercise="${escapeHtml(item.name)}" data-planned-rpe="${target.rpe || ""}" data-plan-text="${escapeHtml(planText)}">
      <div class="actual-title">
        <strong>実績入力</strong>
        <span>${target.rpe ? `予定 @${target.rpe}` : "RPE判定"}</span>
      </div>
      ${previous}
      <div class="actual-set-list">
        ${rows.map((row, index) => actualSetRowMarkup(row, index)).join("")}
      </div>
      <label class="rpe-confidence">
        <span>RPE自信度</span>
        <select class="actual-rpe-confidence">
          <option value="solid"${confidence === "solid" ? " selected" : ""}>自信あり</option>
          <option value="unsure"${confidence === "unsure" ? " selected" : ""}>少し迷う</option>
          <option value="learning"${confidence === "learning" ? " selected" : ""}>感覚練習中</option>
        </select>
      </label>
      <div class="actual-actions">
        <button class="text-button compact actual-add-set" type="button">セット追加</button>
        <button class="text-button compact actual-save" type="button">記録</button>
      </div>
      ${feedback}
    </div>
  `;
}

function actualSetRowMarkup(row = {}, index = 0) {
  return editableActualSetRowMarkup(row, index);
}

function editableActualSetRowMarkup(row = {}, index = 0) {
  const plannedKg = String(row.plannedWeight ?? row.weight ?? "");
  const plannedReps = String(row.plannedReps ?? row.reps ?? "");
  const rpeText = String(row.plannedRpe ?? "").replace(/@/g, "").replace(/RPE/g, "").trim();
  const plannedRpe = rpeText ? `@${rpeText}` : "";
  const kind = row.kind || row.label || "";
  const actualKg = String(row.weight ?? plannedKg ?? "");
  const actualReps = String(row.reps ?? plannedReps ?? "");
  const actualRpe = String(row.rpe ?? "");
  return `
    <div class="editable-set-row actual-set-row">
      <div class="set-meta">
        <strong>S${index + 1}</strong>
        ${kind ? `<small>${escapeHtml(kind)}</small>` : ""}
      </div>
      <div class="planned-summary">予定 ${escapeHtml(plannedKg || "—")}kg × ${escapeHtml(plannedReps || "—")} ${escapeHtml(plannedRpe)}</div>
      <div class="actual-inputs">
        <label>
          <span>kg</span>
          <input class="actual-weight" inputmode="decimal" type="number" min="0" step="0.5" value="${escapeHtml(actualKg)}">
        </label>
        <label>
          <span>回</span>
          <input class="actual-reps" inputmode="numeric" type="number" min="1" step="1" value="${escapeHtml(actualReps)}">
        </label>
        <label>
          <span>RPE</span>
          <input class="actual-rpe" inputmode="decimal" type="number" min="5" max="10" step="0.5" value="${escapeHtml(actualRpe)}">
        </label>
      </div>
      <button class="delete-entry actual-remove-set" type="button" aria-label="セットを削除">×</button>
    </div>
  `;
}

function plannedTopSet(planText, detail = "") {
  const combined = `${planText} ${detail}`;
  const weight = Number((planText.match(/([\d.]+)kg/) || [])[1] || "");
  const repsText = (planText.match(/kg\s*x\s*([\d+]+)/) || [])[1] || "";
  const reps = Number(String(repsText).replace("+", "")) || "";
  const rpe = Number((combined.match(/@([\d.]+)/) || combined.match(/RPE\s*([\d.]+)/i) || [])[1] || "");
  return { weight: weight || "", reps, rpe: rpe || "" };
}

function planFeedbackKey(cycle, dayIndex, itemIndex, lift, name) {
  return [cycle.programMethod, cycle.buddyLevel || "level1", cycle.planTarget, `w${cycle.week}`, `d${dayIndex + 1}`, itemIndex + 1, lift || "custom", name].join("|");
}

function feedbackMarkup(feedback) {
  if (!guideEnabled() && ["ok", "light"].includes(feedback.status)) return "";
  const confidence = feedback.rpeConfidence ? `<span>${escapeHtml(rpeConfidenceLabel(feedback.rpeConfidence))}</span>` : "";
  return `<p class="rpe-feedback ${feedback.status}">${confidence}${escapeHtml(feedback.message)}</p>`;
}

function rpeConfidenceLabel(value) {
  if (value === "solid") return "RPE自信あり";
  if (value === "unsure") return "RPE少し迷う";
  return "RPE感覚練習中";
}

function previousFeedbackMarkup(cycle, item) {
  if (cycle.week <= 1 || !item.lift) return "";
  const previous = findPreviousFeedback(cycle, item);
  if (!previous) return "";
  if (!guideEnabled() && ["ok", "light"].includes(previous.status)) return "";
  const planned = previous.plannedRpe ? `@${previous.plannedRpe}` : "RPE未設定";
  const actual = previous.rpe ? `@${previous.rpe}` : "RPE未入力";
  const confidence = previous.rpeConfidence ? ` / ${rpeConfidenceLabel(previous.rpeConfidence)}` : "";
  const adjustment = previousAdjustmentMessage(previous);
  return `
    <div class="previous-rpe ${previous.status}">
      <strong>前回メモ</strong>
      <span>前回は ${planned} 予定が ${actual}${confidence} でした。${adjustment}</span>
    </div>
  `;
}

function findPreviousFeedback(cycle, item) {
  const feedback = currentAthlete().rpeFeedback || {};
  const prefix = [cycle.programMethod, cycle.buddyLevel || "level1", cycle.planTarget, `w${cycle.week - 1}`].join("|");
  return Object.entries(feedback)
    .filter(([key, value]) => key.startsWith(prefix) && value.lift === item.lift)
    .map(([, value]) => value)
    .at(-1);
}

function previousAdjustmentMessage(feedback) {
  if (feedback.status === "deload") return "デロード候補です。次週へ進む前に重量上限を守る回復週を挟む判断も検討してください。";
  if (feedback.status === "heavy") return "今週は -2.5〜5kg やバックオフ減を検討し、予定RPEを守ることを優先してください。";
  if (feedback.status === "warn") return "今週は -2.5kg を検討してください。重量を下げる判断もプログラム成功の一部です。";
  if (feedback.status === "light") return "軽く感じていたので +2.5kg、最大でも +5kg までなら検討できます。追いすぎず予定RPE内で止めましょう。";
  return "今週も提案重量を基準に、予定RPEを守る感覚を育てましょう。";
}

function recoverySignalForNextWeek(cycle) {
  if (cycle.week >= cycle.length || cycle.recoveryMode || cycle.pendingRecoveryAlert) return null;
  const currentWeek = cycle.week;
  const nextWeek = Math.min(cycle.week + 1, cycle.length);
  const currentEntries = planFeedbackEntriesForWeek(cycle, currentWeek);
  const heavyEntries = currentEntries.filter((entry) => rpeDiff(entry) >= 2);
  const warningEntries = currentEntries.filter((entry) => rpeDiff(entry) >= 1.5);
  const heavyLifts = [...new Set(heavyEntries.map((entry) => entry.lift || entry.exerciseName).filter(Boolean))];
  const reasons = [];
  if (heavyLifts.length >= 1 || heavyEntries.length >= 1) {
    reasons.push(`W${currentWeek}で予定よりRPE +2.0以上の実績があります。`);
  } else if (warningEntries.length >= 2) {
    reasons.push(`W${currentWeek}で予定よりRPE +1.5以上の実績が${warningEntries.length}件あります。`);
  }
  const previousEntries = planFeedbackEntriesForWeek(cycle, currentWeek - 1);
  const consecutive = heavyTrendLifts(currentEntries, previousEntries);
  if (consecutive.length) {
    reasons.push(`2週連続で重く出ている種目: ${consecutive.map((lift) => mainLiftNames[lift] || lift).join(" / ")}`);
  }
  if (!reasons.length) return null;
  return {
    fromWeek: currentWeek,
    nextWeek,
    reasons,
    createdAt: new Date().toISOString()
  };
}

function planFeedbackEntriesForWeek(cycle, week) {
  if (week < 1) return [];
  const prefix = [cycle.programMethod, cycle.buddyLevel || "level1", cycle.planTarget, `w${week}`].join("|");
  return Object.entries(currentAthlete().rpeFeedback || {})
    .filter(([key, value]) => key.startsWith(prefix) && value.plannedRpe && value.rpe)
    .map(([key, value]) => ({ key, ...value }));
}

function rpeDiff(entry) {
  return Number(entry.rpe || 0) - Number(entry.plannedRpe || 0);
}

function heavyTrendLifts(currentEntries, previousEntries) {
  const currentHeavy = new Set(currentEntries.filter((entry) => rpeDiff(entry) >= 1).map((entry) => entry.lift).filter(Boolean));
  const previousHeavy = new Set(previousEntries.filter((entry) => rpeDiff(entry) >= 1).map((entry) => entry.lift).filter(Boolean));
  return [...currentHeavy].filter((lift) => previousHeavy.has(lift));
}

function prescriptionForWeek(liftId, max, week, length, daysPerWeek, variant = "main", priorityLift = "total", buddyLevel = "level1") {
  const phase = cyclePhase(week, length, "platform").name;
  if (buddyLevel === "level2" && !["大会想定MAXチェック", "現在地チェック"].includes(phase)) {
    return level2PrescriptionForWeek(liftId, max, week, length, daysPerWeek, variant, priorityLift, phase);
  }
  const intensity = phase === "ブリッジ週" ? bridgeIntensity() : intensityForWeek(week, length);
  const variantScale = { main: 1, volume: 0.92, technique: 0.85, light: 0.78 }[variant] || 1;
  const topWeight = roundToIncrement(max * intensity.top * variantScale, 2.5);
  const backoffWeight = roundToIncrement(topWeight * intensity.backoff, 2.5);
  const prRange = projectedPrRange(liftId, max, length, daysPerWeek, priorityLift);

  if (phase === "PRテスト") {
    return {
      title: `第一 @7〜8 / 第二 @8〜9 / 第三 ${prRange.low}〜${prRange.high}kg @9〜10`,
      detail: "白9本を優先。第一は確実に成功している重量、第二はトータルを作る重量、第三だけPR候補から選ぶ。"
    };
  }

  if (phase === "ピーキング期") {
    return {
      title: `トップ ${topWeight}kg x ${intensity.reps} @${intensity.topRpe} / バックオフ ${backoffWeight}kg x 2 x 2 @${intensity.backoffRpe}`,
      detail: "成功率とスピードを優先。予定RPEを超えそうなら重量を落としてよい。"
    };
  }

  return {
    title: `トップ ${topWeight}kg x ${intensity.reps} @${intensity.topRpe} / バックオフ ${backoffWeight}kg x ${intensity.backoffReps} x ${intensity.backoffSets} @${intensity.backoffRpe}`,
    detail: phase === "蓄積期" || phase === "ブリッジ週"
      ? "MAX更新を狙う週ではなく、RPE練習とフォーム再現性を作る週。重く感じたら-2.5〜5kg、軽すぎる時だけ+2.5〜5kg。"
      : "次週につながる良い反復を優先。上振れ狙いではなく予定RPEで止める。"
  };
}

function level2PrescriptionForWeek(liftId, max, week, length, daysPerWeek, variant = "main", priorityLift = "total", phase = cyclePhase(week, length, "platform").name) {
  const progress = (week - 1) / Math.max(1, length - 1);
  const isPriority = priorityLift === liftId;
  const liftFatigue = liftId === "deadlift" ? 0.975 : 1;
  const variants = {
    main: { single: 0.78, backoff: 0.715, reps: 4, sets: isPriority ? 4 : 3, topRpe: "7〜7.5", backoffRpe: "7〜7.5", label: "高強度日" },
    volume: { single: 0, backoff: 0.68, reps: 5, sets: isPriority ? 5 : 4, topRpe: "", backoffRpe: "6.5〜7.5", label: "ボリューム日" },
    technique: { single: 0, backoff: 0.62, reps: 3, sets: 4, topRpe: "", backoffRpe: "6〜6.5", label: "技術日" },
    light: { single: 0, backoff: 0.58, reps: 3, sets: 3, topRpe: "", backoffRpe: "6", label: "軽めの日" }
  };
  const base = variants[variant] || variants.main;
  if (phase === "ブリッジ週") {
    const bridge = level2BridgePrescription(liftId, max, variant, isPriority, liftFatigue, base);
    return bridge;
  }
  const phaseBump = phase === "蓄積期" || phase === "ブリッジ週" ? progress * 0.08 : phase === "強化期" ? 0.05 + progress * 0.1 : 0.08 + progress * 0.08;
  const priorityBump = isPriority ? 0.02 : 0;
  const singlePercent = Math.min(0.9, (base.single + phaseBump + priorityBump) * liftFatigue);
  let backoffPercent = Math.min(0.82, (base.backoff + phaseBump * 0.65 + priorityBump * 0.5) * liftFatigue);
  if (variant === "volume") backoffPercent = level2VolumePercentCap(liftId, backoffPercent);
  const backoffWeight = roundToIncrement(max * backoffPercent, 2.5);

  if (phase === "ピーキング期") {
    const weeksOut = Math.max(1, length - week);
    if (variant !== "main") {
      const volumePlan = level2PeakingVolumePlan(weeksOut, variant, liftId, base);
      const peakingAccessoryPercent = variant === "volume"
        ? level2VolumePercentCap(liftId, Math.min(backoffPercent, 0.74))
        : variant === "technique"
          ? Math.min(backoffPercent, 0.68)
          : Math.min(backoffPercent, 0.62);
      const peakingReps = volumePlan.reps;
      const peakingSets = volumePlan.sets;
      return {
        title: `${roundToIncrement(max * peakingAccessoryPercent, 2.5)}kg x ${peakingReps} x ${peakingSets} @${base.backoffRpe}`,
        detail: `Lv2ピーキングの${base.label}。W${week}は通常量の約${volumePlan.label}まで減らし、メイン日の競技重量接触を邪魔しない範囲に抑えます。`
      };
    }
    const peakingBase = weeksOut >= 3 ? 0.86 : weeksOut === 2 ? 0.885 : 0.91;
    const peakingPercent = Math.min(0.92, (peakingBase + (isPriority ? 0.01 : 0)) * liftFatigue);
    const peakingRpe = weeksOut >= 3 ? "7〜7.5" : weeksOut === 2 ? "7.5〜8" : "8前後";
    const backoffReps = weeksOut <= 1 ? 1 : 2;
    const backoffSets = weeksOut >= 3 ? 2 : 1;
    const single = roundToIncrement(max * peakingPercent, 2.5);
    return {
      title: `トップ ${single}kg x 1 @${peakingRpe} / バックオフ ${roundToIncrement(single * 0.84, 2.5)}kg x ${backoffReps} x ${backoffSets} @7`,
      detail: `Lv2ピーキング。強度は残し、ボリュームはW12へ向けて段階的に減らします。目安${Math.round(peakingPercent * 100)}%。第三試技候補は練習で追い切らない。`
    };
  }

  if (base.single) {
    const singleWeight = roundToIncrement(max * singlePercent, 2.5);
    return {
      title: `トップS ${singleWeight}kg x 1 @${isPriority ? "7〜8" : base.topRpe} / バックオフ ${backoffWeight}kg x ${base.reps} x ${base.sets} @${base.backoffRpe}`,
      detail: `Lv2 ${base.label}。目安 ${Math.round(singlePercent * 100)}%→${Math.round(backoffPercent * 100)}%。@8を超えたらバックオフを-5kg。`
    };
  }

  const reps = variant === "volume" && liftId === "deadlift" ? 4 : base.reps;
  const sets = variant === "volume" && liftId === "deadlift" ? Math.min(base.sets, 4) : base.sets;
  return {
    title: `${backoffWeight}kg x ${reps} x ${sets} @${base.backoffRpe}`,
    detail: `Lv2 ${base.label}。目安 ${Math.round(backoffPercent * 100)}%。高強度日のために良い反復だけを残す。`
  };
}

function level2VolumePercentCap(liftId, percent) {
  const caps = { squat: 0.78, bench: 0.82, deadlift: 0.75 };
  return Math.min(percent, caps[liftId] || 0.8);
}

function level2PeakingVolumePlan(weeksOut, variant, liftId, base) {
  const scale = weeksOut >= 3 ? 0.7 : weeksOut === 2 ? 0.5 : 0.3;
  const label = weeksOut >= 3 ? "60〜70%" : weeksOut === 2 ? "40〜50%" : "20〜30%";
  const cappedBaseSets = variant === "volume" && liftId === "deadlift" ? Math.min(base.sets, 3) : Math.min(base.sets, 4);
  const sets = Math.max(1, Math.round(cappedBaseSets * scale));
  const reps = variant === "volume"
    ? weeksOut >= 3 ? (liftId === "deadlift" ? 4 : 4) : 3
    : variant === "technique"
      ? 2
      : 2;
  return { reps, sets, label };
}

function bridgeIntensity() {
  return {
    top: 0.73,
    backoff: 0.88,
    reps: 4,
    backoffReps: 4,
    backoffSets: 2,
    topRpe: "6.5〜7",
    backoffRpe: "6.5"
  };
}

function level2BridgePrescription(liftId, max, variant, isPriority, liftFatigue, base) {
  if (variant === "main") {
    const singlePercent = Math.min(0.82, (0.78 + (isPriority ? 0.01 : 0)) * liftFatigue);
    const backoffPercent = Math.min(0.74, (0.72 + (isPriority ? 0.005 : 0)) * liftFatigue);
    const single = roundToIncrement(max * singlePercent, 2.5);
    const backoff = roundToIncrement(max * backoffPercent, 2.5);
    return {
      title: `トップS ${single}kg x 1 @6.5〜7 / バックオフ ${backoff}kg x 4 x 2 @6.5`,
      detail: `Lv2ブリッジ週。強化期ではなく現在地チェックへの準備です。目安${Math.round(singlePercent * 100)}%→${Math.round(backoffPercent * 100)}%。疲労を残さず終えます。`
    };
  }
  const percentMap = {
    volume: { squat: 0.7, bench: 0.72, deadlift: 0.68 },
    technique: { squat: 0.62, bench: 0.62, deadlift: 0.6 },
    light: { squat: 0.52, bench: 0.52, deadlift: 0.5 }
  };
  const percent = (percentMap[variant]?.[liftId] || percentMap[variant]?.squat || 0.64) * liftFatigue;
  const reps = variant === "volume" ? 4 : variant === "technique" ? 2 : 2;
  const sets = variant === "volume" ? (isPriority ? 3 : 2) : variant === "technique" ? 2 : 1;
  return {
    title: `${roundToIncrement(max * percent, 2.5)}kg x ${reps} x ${sets} @${variant === "volume" ? "6.5〜7" : "6前後"}`,
    detail: `Lv2ブリッジ週の${base.label}。鍛え込む週ではなく、現在地チェック前の動作確認です。通常より1〜2セット少なく、疲労を残さず終えます。`
  };
}

function j(codes) {
  return String.fromCodePoint(...codes);
}

function intensityForWeek(week, length) {
  const progress = (week - 1) / Math.max(1, length - 1);
  if (progress <= 0.34) {
    return {
      top: 0.64 + progress * 0.2,
      backoff: 0.9,
      reps: 6,
      backoffReps: 6,
      backoffSets: 4,
      topRpe: progress < 0.18 ? "6" : "6.5",
      backoffRpe: progress < 0.18 ? "6.5" : "7"
    };
  }
  if (progress <= 0.67) {
    return {
      top: 0.74 + (progress - 0.34) * 0.31,
      backoff: 0.88,
      reps: 4,
      backoffReps: 4,
      backoffSets: 3,
      topRpe: progress < 0.52 ? "7" : "7.5",
      backoffRpe: "7"
    };
  }
  return {
    top: 0.84 + (progress - 0.67) * 0.2,
    backoff: 0.84,
    reps: progress > 0.84 ? 1 : 2,
    backoffReps: 2,
    backoffSets: 2,
    topRpe: progress > 0.84 ? "8" : "7.5",
    backoffRpe: "7"
  };
}

function weeklyTemplate(cycle) {
  if (cycle.programMethod === "rebuild16") return rebuild16Template(cycle);
  if (cycle.programMethod === "hps") return hpsTemplate(cycle);
  if (cycle.programMethod === "531") return fiveThreeOneTemplate(cycle);
  if (cycle.programMethod === "smolov_jr") return smolovJrTemplate(cycle);

  const phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod).name;
  if (phase === "現在地チェック") return currentCheckTemplate(cycle);
  if (phase === "大会想定MAXチェック") return finalMeetTemplate(cycle);
  if (cycle.buddyLevel === "level2") return buddyLevel2Template(cycle, phase);
  const accessoryLimit = accessoryLimitFor(cycle.daysPerWeek, cycle.accessoryVolume, phase);
  const squat = j([12473,12463,12527,12483,12488]);
  const bench = j([12505,12531,12481,12503,12524,12473]);
  const deadlift = j([12487,12483,12489,12522,12501,12488]);
  const tech = j([25216,34899]);
  const volume = j([12508,12522,12517,12540,12512]);
  const strengthen = j([24375,21270]);
  const mainDay = j([20027,26085]);
  const light = j([36605,12417]);
  const templates = {
    3: [
      { title: squat + mainDay, items: [{ kind: "main", lift: "squat", name: squat, variant: "main" }, { kind: "main", lift: "bench", name: j([12525,12531,12464,12509,12540,12474,12505,12531,12481]) + " 0-2-0", variant: "technique" }, { kind: "accessory", name: j([12501,12525,12531,12488,12473,12463,12527,12483,12488]), work: "4-6" + j([22238]) + " x 3", note: j([23039,21218,12392,12508,12488,12512,12398,24375,21270]) }, { kind: "accessory", name: j([12524,12483,12464,12459,12540,12523]), work: "10-15" + j([22238]) + " x 4", note: j([12495,12512,12473,12488,12522,12531,12464,12473,12434,35036,24375]) }, { kind: "accessory", name: j([12450,12502,12525,12540,12521,12540]), work: "8-12" + j([22238]) + " x 4", note: j([33145,22311,12392,20307,24185,22266,23450]) }] },
      { title: bench + mainDay, items: [{ kind: "main", lift: "bench", name: bench, variant: "main" }, { kind: "main", lift: "deadlift", name: j([12509,12540,12474,12487,12483,12489,12522,12501,12488]) + " 0-2-0", variant: "technique" }, { kind: "accessory", name: j([12521,12540,12475,12531,12503,12524,12473]), work: "6-8" + j([22238]) + " x 3", note: j([12502,12522,12483,12472,12395,38972,12425,12394,12356,25276,12377,21147]) }, { kind: "accessory", name: j([12521,12483,12488,12503,12523,12480,12454,12531]), work: "8-12" + j([22238]) + " x 4", note: j([32972,20013,12392,32937,30002,39592,12398,23433,23450]) }, { kind: "accessory", name: j([12488,12521,12452,12475,12503,12473,12456,12463,12473,12486,12531,12471,12519,12531]), work: "10-15" + j([22238]) + " x 4", note: j([12525,12483,12463,12450,12454,12488,35036,24375]) }] },
      { title: deadlift + mainDay, items: [{ kind: "main", lift: "deadlift", name: deadlift, variant: "main" }, { kind: "main", lift: "squat", name: j([12486,12531,12509,12473,12463,12527,12483,12488]) + " 4-0-0", variant: "volume" }, { kind: "accessory", name: "RDL", work: "6-8" + j([22238]) + " x 4", note: j([12498,12483,12503,12498,12531,12472,12392,32972,38754,24375,21270]) }, { kind: "accessory", name: j([12496,12540,12505,12523,12525,12540]), work: "8-10" + j([22238]) + " x 4", note: j([24341,12367,21147,12392,24195,32972,31563]) }, { kind: "accessory", name: j([12496,12483,12463,12456,12463,12473,12486,12531,12471,12519,12531]), work: "10-15" + j([22238]) + " x 3", note: j([33216,37096,12392,33034,26609,36215,31435,31563]) }] }
    ],
    4: [
      { title: "SQ " + strengthen, items: [{ kind: "main", lift: "squat", name: squat, variant: "main" }, { kind: "main", lift: "bench", name: j([12509,12540,12474,12505,12531,12481]) + " 0-2-0", variant: "technique" }, { kind: "accessory", name: j([12502,12523,12460,12522,12450,12531,12473,12463,12527,12483,12488]), work: "8-10" + j([22238]) + " x 3", note: j([24038,21491,24046,12392,33050,12398,23433,23450]) }, { kind: "accessory", name: j([12501,12455,12452,12473,12503,12523]), work: "12-15" + j([22238]) + " x 3", note: j([32937,12398,23433,23450]) }] },
      { title: "BP " + strengthen, items: [{ kind: "main", lift: "bench", name: bench, variant: "main" }, { kind: "accessory", name: j([12521,12540,12475,12531,12503,12524,12473]), work: "6-8" + j([22238]) + " x 3", note: j([25276,12377,21147,12392,36556,36947,12398,23433,23450]) }, { kind: "accessory", name: j([12521,12483,12488,12503,12523,12480,12454,12531]), work: "8-12" + j([22238]) + " x 3", note: j([32972,20013,12398,22303,21488,20316,12426]) }] },
      { title: "DL " + strengthen, items: [{ kind: "main", lift: "deadlift", name: deadlift, variant: "main" }, { kind: "main", lift: "squat", name: j([12486,12531,12509,12473,12463,12527,12483,12488]) + " 4-0-0", variant: "light" }, { kind: "accessory", name: "RDL", work: "6-8" + j([22238]) + " x 3", note: j([32972,38754,12392,12498,12483,12503,12498,12531,12472]) }, { kind: "accessory", name: j([12524,12483,12464,12459,12540,12523]), work: "10-12" + j([22238]) + " x 3", note: j([12495,12512,12473,12488,12522,12531,12464,12473]) }] },
      { title: "BP " + volume, items: [{ kind: "main", lift: "bench", name: j([12490,12525,12540,12464,12522,12483,12503,12505,12531,12481]), variant: "volume" }, { kind: "accessory", name: j([12480,12531,12505,12523,12525,12540]), work: "8-12" + j([22238]) + " x 3", note: j([32937,30002,39592,12398,23433,23450]) }, { kind: "accessory", name: j([12450,12502,12525,12540,12521,12540]), work: "8-12" + j([22238]) + " x 3", note: j([33145,22311,35036,24375]) }] }
    ],
    5: [
      { title: "SQ " + strengthen, items: [{ kind: "main", lift: "squat", name: squat, variant: "main" }, { kind: "accessory", name: j([12524,12483,12464,12459,12540,12523]), work: "10-12" + j([22238]) + " x 2", note: j([26368,20302,38480,12398,32972,38754,35036,24375]) }] },
      { title: "BP " + strengthen, items: [{ kind: "main", lift: "bench", name: bench, variant: "main" }, { kind: "accessory", name: j([12521,12483,12488,12503,12523,12480,12454,12531]), work: "8-12" + j([22238]) + " x 3", note: j([32972,20013,12398,22303,21488]) }] },
      { title: "DL " + strengthen, items: [{ kind: "main", lift: "deadlift", name: deadlift, variant: "main" }, { kind: "accessory", name: j([12496,12483,12463,12456,12463,12473,12486,12531,12471,12519,12531]), work: "10-15" + j([22238]) + " x 2", note: j([33216,37096,12392,32972,38754]) }] },
      { title: "SQ/BP " + tech, items: [{ kind: "main", lift: "squat", name: j([12509,12540,12474,12473,12463,12527,12483,12488]) + " 0-2-0", variant: "technique" }, { kind: "main", lift: "bench", name: j([12521,12540,12475,12531,12503,12524,12473]), variant: "volume" }, { kind: "accessory", name: j([12501,12455,12452,12473,12503,12523]), work: "12-15" + j([22238]) + " x 2", note: j([32937,12398,23433,23450]) }] },
      { title: j([36605,12417,12539,36895,24230]), items: [{ kind: "main", lift: "bench", name: j([12486,12531,12509,12505,12531,12481]) + " 4-0-0", variant: "technique" }, { kind: "main", lift: "deadlift", name: "RDL", variant: "light" }, { kind: "accessory", name: j([12450,12502,12525,12540,12521,12540]), work: "8-12" + j([22238]) + " x 2", note: j([33145,22311,35036,24375]) }, { kind: "accessory", name: j([12514,12499,12522,12486,12451]), work: "10" + j([20998]), note: j([30130,21172,12434,27531,12373,12394,12356,35519,25972]) }] }
    ]
  };
  return (templates[cycle.daysPerWeek] || templates[4]).map((day, index) => {
    const focusedDay = priorityDay(day, index, cycle.daysPerWeek, cycle.priorityLift);
    const bridgeDay = phase === "ブリッジ週" ? trimLevel2BridgeDay(focusedDay) : focusedDay;
    return {
      ...bridgeDay,
      items: adjustAccessories(bridgeDay, accessoryLimit, cycle)
    };
  });
}

function rebuild16Template(cycle) {
  if (cycle.week <= 5) {
    const resetCycle = {
      ...cycle,
      programMethod: "platform",
      buddyLevel: "level1",
      length: 16,
      week: cycle.week
    };
    return materializeTemplateDays(weeklyTemplate(resetCycle), resetCycle, "Reset");
  }
  if (cycle.week === 6) return rebuildTransitionTemplate(cycle);

  const lv2Cycle = {
    ...cycle,
    programMethod: "platform",
    buddyLevel: "level2",
    length: 10,
    week: cycle.week - 6
  };
  return materializeTemplateDays(weeklyTemplate(lv2Cycle), lv2Cycle, "Lv2");
}

function materializeTemplateDays(days, sourceCycle, prefix = "") {
  return days.map((day) => ({
    ...day,
    title: prefix ? `${prefix} ${day.title}` : day.title,
    items: day.items.map((item) => {
      if (item.kind !== "main") return item;
      const max = Number(sourceCycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
      const prescription = prescriptionForWeek(item.lift, max, sourceCycle.week, sourceCycle.length, sourceCycle.daysPerWeek, item.variant, sourceCycle.priorityLift, sourceCycle.buddyLevel);
      return methodItem(item.lift, item.name, prescription.title, prescription.detail);
    })
  }));
}

function rebuildTransitionTemplate(cycle) {
  const max = (lift, percent) => {
    const base = Number(cycle.maxes[lift] || bestE1rm(lift) || 0);
    return base ? `${roundToIncrement(base * percent, 2.5)}kg` : "1RM未設定";
  };
  return [
    {
      title: "移行週 Day1 フォーム確認",
      items: [
        methodItem("squat", "スクワット", `${max("squat", 0.6)} x 3 x 2 @6`, "W5の結果を整理する週。鍛え込まず、深さ・ラック・セットアップを確認。"),
        methodItem("bench", "ベンチプレス", `${max("bench", 0.6)} x 3 x 2 @6`, "止め、コール、肩甲骨の位置を確認。疲労を残さない。")
      ]
    },
    {
      title: "移行週 Day2 軽い引きと補助",
      items: [
        methodItem("deadlift", "デッドリフト", `${max("deadlift", 0.55)} x 3 x 2 @6`, "引き切りと下ろし方だけ確認。重さを足さない。"),
        { kind: "accessory", name: "軽い背中・体幹補助", work: "通常の半分 / RPE6以下", note: "パンプ狙いで追い込まない。疲労を抜いてLv2へ入る。" }
      ]
    },
    {
      title: "移行週 Day3 Lv2準備",
      items: [
        { kind: "accessory", name: "Training Max確認", work: "W5のRPEとフォーム動画を確認", note: "W5が@9近い場合、Lv2開始は-2.5〜5kg控えめに入る。" },
        { kind: "accessory", name: "完全休養または散歩", work: "20分まで", note: "次週からLv2 10週。疲労を持ち越さない。" }
      ]
    }
  ].slice(0, cycle.daysPerWeek);
}

function trimLevel2BridgeDay(day) {
  const mainItems = day.items.filter((item) => item.kind === "main" && item.variant !== "light");
  const accessoryItems = day.items.filter((item) => item.kind === "accessory").slice(0, 1).map((item) => ({
    ...item,
    work: bridgeAccessoryWork(item.work),
    note: `${item.note || ""} / ブリッジ週なので軽く確認`
  }));
  return { ...day, items: [...mainItems, ...accessoryItems] };
}

function bridgeAccessoryWork(work = "") {
  return String(work)
    .replace(/x\s*[2345]/g, "x 1")
    .replace(/10-15回/g, "10-12回")
    .replace(/12-15回/g, "10-12回")
    .replace(/8-12回/g, "8-10回");
}

function buddyLevel2Template(cycle, phase) {
  const accessoryLimit = accessoryLimitFor(cycle.daysPerWeek, cycle.accessoryVolume, phase, cycle);
  const squat = exerciseMeta("squat").name;
  const bench = exerciseMeta("bench").name;
  const deadlift = exerciseMeta("deadlift").name;
  const templates = {
    3: [
      { title: "SQ高強度 / BP中強度", items: [
        mainItem("squat", squat, "main"),
        mainItem("bench", bench, "volume"),
        accessory("leg_curl", "10-12回 x 3", "膝を守るハム補強"),
        accessory("ab_rollout", "8-12回 x 3", "ブレーシング補強")
      ] },
      { title: "BP高強度 / DL技術", items: [
        mainItem("bench", bench, "main"),
        mainItem("deadlift", "ポーズデッドリフト", "technique"),
        accessory("lat_pulldown", "8-12回 x 3", "広背筋と引き付け"),
        accessory("pushdown", "10-15回 x 3", "ベンチの押し切り")
      ] },
      { title: "DL高強度 / SQボリューム / BP技術", items: [
        mainItem("deadlift", deadlift, "main"),
        mainItem("squat", "テンポスクワット", "volume"),
        mainItem("bench", "ポーズベンチ", "technique"),
        accessory("back_extension", "10-15回 x 2", "腰背部の耐性")
      ] }
    ],
    4: [
      { title: "SQ高強度 / BP中強度", items: [
        mainItem("squat", squat, "main"),
        mainItem("bench", bench, "volume"),
        accessory("leg_curl", "10-12回 x 3", "膝を守るハム補強"),
        accessory("ab_rollout", "8-12回 x 3", "ブレーシング補強")
      ] },
      { title: "BP高強度 / DL技術", items: [
        mainItem("bench", bench, "main"),
        mainItem("deadlift", "ポーズデッドリフト", "technique"),
        accessory("lat_pulldown", "8-12回 x 3", "広背筋と引き付け"),
        accessory("pushdown", "10-15回 x 3", "ベンチの押し切り")
      ] },
      { title: "SQボリューム / BP技術", items: [
        mainItem("squat", "テンポスクワット", "volume"),
        mainItem("bench", "ポーズベンチ", "technique"),
        accessory("split_squat", "8-10回 x 2", "左右差とボトム補強"),
        accessory("face_pull", "12-15回 x 3", "肩の安定")
      ] },
      { title: "DL高強度 / BP補助", items: [
        mainItem("deadlift", deadlift, "main"),
        mainItem("bench", "ナローグリップベンチ", "light"),
        accessory("rdl", "6-8回 x 2", "ヒップヒンジ補強"),
        accessory("dumbbell_row", "8-12回 x 3", "背中の土台")
      ] }
    ],
    5: [
      { title: "SQ高強度", items: [
        mainItem("squat", squat, "main"),
        accessory("leg_curl", "10-12回 x 2", "膝を守るハム補強")
      ] },
      { title: "BP高強度", items: [
        mainItem("bench", bench, "main"),
        accessory("pushdown", "10-15回 x 3", "ベンチの押し切り")
      ] },
      { title: "DL技術 / BPボリューム", items: [
        mainItem("deadlift", "ポーズデッドリフト", "technique"),
        mainItem("bench", bench, "volume"),
        accessory("lat_pulldown", "8-12回 x 3", "広背筋と引き付け")
      ] },
      { title: "SQボリューム / BP技術", items: [
        mainItem("squat", "テンポスクワット", "volume"),
        mainItem("bench", "ポーズベンチ", "technique"),
        accessory("ab_rollout", "8-12回 x 2", "ブレーシング補強")
      ] },
      { title: "DL高強度 / BP軽め", items: [
        mainItem("deadlift", deadlift, "main"),
        mainItem("bench", "ナローグリップベンチ", "light"),
        accessory("dumbbell_row", "8-12回 x 2", "背中の土台")
      ] }
    ]
  };

  return (templates[cycle.daysPerWeek] || templates[4]).map((day, index) => {
    const focusedDay = priorityDay(day, index, cycle.daysPerWeek, cycle.priorityLift);
    return {
      ...focusedDay,
      items: adjustAccessories(focusedDay, accessoryLimit, cycle)
    };
  });
}

function currentCheckTemplate(cycle) {
  const lifts = activePlanLiftIds(cycle);
  return [
    {
      title: "休養ブロック",
      items: [
        { kind: "accessory", name: "3日間の休養", work: "完全休養 or 散歩・ストレッチ", note: "蓄積期の疲労を抜いてから現在地チェックへ。筋トレは足さない。" }
      ]
    },
    {
      title: "現在地チェック",
      items: lifts.map((lift) => methodItem(lift, exerciseMeta(lift).name, currentCheckWork(lift, cycle), currentCheckNote(cycle)))
    },
    {
      title: "軽い回復",
      items: [
        { kind: "accessory", name: "フォーム確認", work: "50〜60% x 3 x 2", note: "重さを足さず、可動域と試技動作だけ確認。" },
        { kind: "accessory", name: "コンディショニング", work: "10〜20分", note: "散歩、軽いバイク、ストレッチ程度。" }
      ]
    }
  ];
}

function currentCheckWork(lift, cycle) {
  const max = Number(cycle.maxes[lift] || bestE1rm(lift) || 0);
  if (!max) return "現在1RMを入力";
  if (cycle.experienceLevel === "advanced") return `${roundToIncrement(max * 0.92, 2.5)}kg x 1 @9`;
  if (cycle.experienceLevel === "intermediate") return `${roundToIncrement(max * 0.88, 2.5)}kg x 1 @8〜9`;
  return `${roundToIncrement(max * 0.82, 2.5)}kg x 3〜5 @8`;
}

function currentCheckNote(cycle) {
  if (cycle.buddyLevel === "level2") {
    if (cycle.experienceLevel === "advanced") return "Lv2現在地チェック。限界1RMではなく、重めシングルで高重量慣れと試技精度を確認。@8前後が基準、@9まで上がった場合は後半を攻めすぎない。";
    if (cycle.experienceLevel === "intermediate") return "Lv2現在地チェック。シングル@8前後を基準に蓄積期の成果と高重量への再導入を確認。@9近くなら後半ブロックは控えめに入る。";
    return "Lv2選択中でも初心者は3〜5回@8で確認。5回やり切るより、RPE8で止めることを優先。重すぎる場合はLv1への変更も検討。";
  }
  if (cycle.experienceLevel === "advanced") return "限界1RMではなく、試技形式に近い重めシングルで再現性を確認。@8前後が基準、@9なら後半は控えめに入る。";
  if (cycle.experienceLevel === "intermediate") return "重めシングルで1RM付近への慣れを確認。@8前後を基準にし、RPEが高すぎる場合は後半を控えめに調整。";
  return "初心者は1RMではなく3〜5回@8で確認。5回やり切ることより、RPE8で止めることとフォーム再現性を優先。";
}

function finalMeetTemplate(cycle) {
  const lifts = activePlanLiftIds(cycle);
  return [
    {
      title: "Day1 調整",
      items: lifts.map((lift) => methodItem(lift, exerciseMeta(lift).name, `${roundToIncrement(Number(cycle.maxes[lift] || bestE1rm(lift) || 0) * 0.65, 2.5)}kg x 3 x 2`, "60〜70%目安。軽く速く、フォームとコールだけ確認。"))
    },
    {
      title: "Day2 休養",
      items: [
        { kind: "accessory", name: "完全休養", work: "休む", note: "追加練習はしない。睡眠、食事、当日の準備を優先。" }
      ]
    },
    {
      title: "Day3 BIG3大会想定",
      items: lifts.map((lift) => finalAttemptItem(lift, cycle))
    }
  ];
}

function finalAttemptItem(lift, cycle) {
  const max = Number(cycle.maxes[lift] || bestE1rm(lift) || 0);
  const range = max ? projectedPrRange(lift, max, cycle.length, cycle.daysPerWeek, cycle.priorityLift) : { low: "-", high: "-" };
  const attemptPercents = {
    beginner: [0.88, 0.94],
    intermediate: [0.9, 0.96],
    advanced: [0.92, 0.98]
  }[cycle.experienceLevel] || [0.9, 0.96];
  const first = max ? roundToIncrement(max * attemptPercents[0], 2.5) : "-";
  const second = max ? roundToIncrement(max * attemptPercents[1], 2.5) : "-";
  return methodItem(
    lift,
    exerciseMeta(lift).name,
    `第一 ${first}kg @7〜8 / 第二 ${second}kg @8〜9 / 第三 ${range.low}〜${range.high}kg @9〜10`,
    "SQ→BP→DLの順で実施。第一は確実に成功している重量、第二はトータルを作る重量。第二が@8以下なら第三は上の候補、@9以上なら小幅PRまたは成功優先を選ぶ。"
  );
}

function mainItem(lift, name, variant) {
  return { kind: "main", lift, name, variant };
}

function methodItem(lift, name, work, note) {
  return { kind: "method", lift, name, work, note };
}

function hpsTemplate(cycle) {
  const lifts = cycle.planTarget === "bench_only" ? ["bench"] : mainLiftIds;
  const priority = cycle.planTarget === "bench_only" ? "bench" : cycle.priorityLift === "total" ? "bench" : cycle.priorityLift;
  const benchOnly = cycle.planTarget === "bench_only";
  const days = [
    {
      title: `${mainLiftNames[priority]} Hypertrophy`,
      items: [
        methodItem(priority, exerciseMeta(priority).name, `${hpsWeight(priority, cycle, 0.7)}kg x 8 x 4`, "筋量とフォーム再現性。RPE 7前後で止める。"),
        accessory("close_grip_bench", "8-10回 x 3", "押し切りと三頭筋") 
      ]
    },
    {
      title: `${mainLiftNames[priority]} Power`,
      items: [
        methodItem(priority, exerciseMeta(priority).name, `${hpsWeight(priority, cycle, 0.8)}kg x 1 x 5`, "全レップを速く。失速するなら重量を落とす。"),
        accessory("lat_pulldown", "8-12回 x 3", "背中でベンチの土台を作る")
      ]
    },
    {
      title: `${mainLiftNames[priority]} Strength`,
      items: [
        methodItem(priority, exerciseMeta(priority).name, `${hpsWeight(priority, cycle, 0.86)}kg x 3 x 3`, "強度日。予定重量で質を守る。"),
        accessory("spoto_press", "5-8回 x 3", "胸上の停止と押し出し")
      ]
    }
  ];
  if (!benchOnly && cycle.daysPerWeek >= 4) {
    const secondary = lifts.filter((lift) => lift !== priority);
    days.push({
      title: "BIG3 技術",
      items: secondary.map((lift) => methodItem(lift, exerciseMeta(lift).name, `${hpsWeight(lift, cycle, 0.65)}kg x 5 x 3`, "軽めに動作精度を積む。"))
    });
  }
  if (cycle.daysPerWeek >= 5) {
    days.push({
      title: benchOnly ? "BP 補助" : "補助 / 回復",
      items: [
        accessory("dumbbell_bench_press", "10-12回 x 3", "胸のボリューム"),
        accessory("seated_row", "10-12回 x 3", "肩甲骨の安定")
      ]
    });
  }
  return days.slice(0, cycle.daysPerWeek);
}

function hpsWeight(lift, cycle, percent) {
  const weekBump = 1 + Math.min(cycle.week - 1, cycle.length - 1) * 0.005;
  return roundToIncrement(Number(cycle.maxes[lift] || bestE1rm(lift) || 0) * percent * weekBump, 2.5);
}

function fiveThreeOneTemplate(cycle) {
  const lifts = activePlanLiftIds(cycle);
  const weekInCycle = ((cycle.week - 1) % 4) + 1;
  const schemes = {
    1: [[0.65, 5], [0.75, 5], [0.85, "5+"]],
    2: [[0.7, 3], [0.8, 3], [0.9, "3+"]],
    3: [[0.75, 5], [0.85, 3], [0.95, "1+"]],
    4: [[0.4, 5], [0.5, 5], [0.6, 5]]
  };
  const dayLifts = cycle.planTarget === "bench_only"
    ? Array.from({ length: Math.min(cycle.daysPerWeek, 5) }, () => "bench")
    : lifts.slice(0, cycle.daysPerWeek);
  const days = dayLifts.map((lift, index) => {
    const tm = Number(cycle.maxes[lift] || bestE1rm(lift) || 0) * 0.9;
    const work = schemes[weekInCycle].map(([percent, reps]) => `${roundToIncrement(tm * percent, 2.5)}kg x ${reps}`).join(" / ");
    return {
      title: `${mainLiftNames[lift]} 5/3/1`,
      items: [
        methodItem(lift, exerciseMeta(lift).name, work, weekInCycle === 4 ? "デロード週。軽く速く終える。" : "+セットはフォームが崩れる前に止める。"),
        index % 2 === 0 ? accessory("seated_row", "10-12回 x 3", "背中の土台") : accessory("pushdown", "12-15回 x 3", "三頭筋補助")
      ]
    };
  });
  while (days.length < cycle.daysPerWeek) {
    days.push({
      title: "補助 / コンディショニング",
      items: [
        accessory("face_pull", "12-20回 x 3", "肩の安定"),
        accessory("mobility", "10分", "疲労管理")
      ]
    });
  }
  return days;
}

function smolovJrTemplate(cycle) {
  const lift = cycle.planTarget === "bench_only" || cycle.priorityLift !== "squat" ? "bench" : "squat";
  const max = Number(cycle.maxes[lift] || bestE1rm(lift) || 0);
  const weekInBlock = ((cycle.week - 1) % 3) + 1;
  const add = weekInBlock === 1 ? 0 : weekInBlock === 2 ? 2.5 : 5;
  const days = [
    [0.7, "6 x 6"],
    [0.75, "7 x 5"],
    [0.8, "8 x 4"],
    [0.85, "10 x 3"]
  ].map(([percent, reps], index) => ({
    title: `${mainLiftNames[lift]} Smolov Jr. D${index + 1}`,
    items: [
      methodItem(lift, exerciseMeta(lift).name, `${roundToIncrement(max * percent + add, 2.5)}kg x ${reps}`, "短期集中ブロック。失敗や強い痛みが出るなら加重せず維持。")
    ]
  }));
  return days;
}

function priorityDay(day, index, daysPerWeek, priorityLift) {
  if (priorityLift === "total") return day;

  const priorityNames = {
    squat: "SQ",
    bench: "BP",
    deadlift: "DL"
  };
  const techNames = {
    squat: "ポーズスクワット 0-2-0",
    bench: "ポーズベンチ 0-2-0",
    deadlift: "ポーズデッドリフト 0-2-0"
  };
  const volumeNames = {
    squat: "テンポスクワット 4-0-0",
    bench: "ナローグリップベンチ",
    deadlift: "RDL"
  };

  const inserts = {
    3: { squat: 1, bench: 2, deadlift: 1 },
    4: { squat: 3, bench: 2, deadlift: 3 },
    5: { squat: 3, bench: 4, deadlift: 4 }
  };
  if (index !== inserts[daysPerWeek]?.[priorityLift]) return day;

  const focusItem = priorityLift === "deadlift"
    ? mainItem("deadlift", techNames.deadlift, "technique")
    : mainItem(priorityLift, volumeNames[priorityLift], "volume");
  const title = `${priorityNames[priorityLift]} 技術 / ${day.title}`;
  if (day.items.some((item) => item.kind === "main" && item.lift === focusItem.lift && item.variant === focusItem.variant)) {
    return { ...day, title };
  }
  const firstAccessoryIndex = day.items.findIndex((item) => item.kind === "accessory");
  const items = firstAccessoryIndex === -1
    ? [...day.items, focusItem]
    : [...day.items.slice(0, firstAccessoryIndex), focusItem, ...day.items.slice(firstAccessoryIndex)];

  return { ...day, title, items };
}

function accessoryLimitFor(daysPerWeek, accessoryVolume, phase, cycle = null) {
  if (phase === "PRテスト" || phase === "大会想定MAXチェック") return 0;
  const base = {
    3: { low: 2, normal: 3, high: 4 },
    4: { low: 1, normal: 2, high: 3 },
    5: { low: 1, normal: 1, high: 2 }
  }[daysPerWeek]?.[accessoryVolume] ?? 2;

  if (phase === "ピーキング期") {
    if (cycle?.buddyLevel === "level2") {
      const weeksOut = Math.max(1, Number(cycle.length || 0) - Number(cycle.week || 0));
      if (weeksOut >= 3) return Math.max(0, base - 1);
      if (weeksOut === 2) return Math.max(0, base - 2);
      return 0;
    }
    return Math.max(0, base - 1);
  }
  if (phase === "ブリッジ週" && cycle?.buddyLevel === "level2") return Math.min(1, base);
  if (phase === "強化期" && accessoryVolume === "high") return Math.max(1, base - 1);
  return base;
}

function adjustAccessories(day, accessoryLimit, cycle) {
  let accessoryCount = 0;
  const keptItems = [];
  day.items.forEach((item) => {
    if (item.kind !== "accessory") {
      keptItems.push(item);
      return;
    }
    if (accessoryCount >= accessoryLimit) return;
    const fatigueManagedItem = lowBackFriendlyAccessory(item, day, keptItems, cycle);
    const availableItem = availableAccessory(fatigueManagedItem, cycle);
    if (!availableItem) return;
    keptItems.push(availableItem);
    accessoryCount += 1;
  });
  while (accessoryCount < accessoryLimit) {
    const extra = extraAccessoryFor(day.title, accessoryCount, cycle, keptItems);
    if (!extra) break;
    keptItems.push(extra);
    accessoryCount += 1;
  }
  return keptItems;
}

function accessory(exerciseId, work, note) {
  return { kind: "accessory", exerciseId, name: exerciseMeta(exerciseId).name, work, note };
}

function lowBackFriendlyAccessory(item, day, currentItems = [], cycle = normalizedCycle()) {
  const isDeadliftDay = day.title.includes("DL") || day.title.includes("デッド") || day.items.some((entry) => entry.lift === "deadlift" && entry.variant === "main");
  if (!isDeadliftDay) return item;
  const name = String(item.name || "");
  const id = item.exerciseId || "";
  const lowBackHeavy = ["rdl", "back_extension", "stiff_leg_deadlift", "good_morning"].includes(id)
    || name.includes("RDL")
    || name.includes("ルーマニアン")
    || name.includes("バックエクステンション")
    || name.includes("バーベルロー");
  if (!lowBackHeavy) return item;

  const used = new Set(currentItems.map((entry) => entry.exerciseId).filter(Boolean));
  const replacements = [
    accessory("leg_curl", "10-12回 x 3", "デッドリフト日の腰背部疲労を増やしすぎないハム補強"),
    accessory("chest_supported_row", "8-12回 x 3", "腰を使わず背中で引く"),
    accessory("lat_pulldown", "8-12回 x 3", "腰背部を休めた広背筋補強"),
    accessory("ab_rollout", "8-12回 x 3", "ブレーシング補強")
  ];
  return replacements.find((candidate) => !used.has(candidate.exerciseId) && availableAccessory(candidate, cycle)) || item;
}

function availableAccessory(item, cycle) {
  return !item.exerciseId || isFacilityExerciseAvailable(item.exerciseId, cycle) ? item : null;
}

function extraAccessoryFor(dayTitle, index, cycle, currentItems = []) {
  const pools = {
    squat: [
      accessory("ssb_squat", "5-8回 x 3", "上体保持とボトム補強"),
      accessory("belt_squat", "8-12回 x 3", "腰背部の疲労を抑えた脚量"),
      accessory("hack_squat", "8-12回 x 3", "大腿四頭筋の補強"),
      accessory("adductor_machine", "12-20回 x 3", "股関節とボトムの安定"),
      accessory("walking_lunge", "10-12回 x 3", "片脚支持と臀部補強"),
      accessory("good_morning", "6-10回 x 3", "体幹保持と股関節伸展"),
      accessory("leg_press", "10-15回 x 3", "脚全体の補強"),
      accessory("calf_raise", "12-20回 x 3", "足部の安定")
    ],
    bench: [
      accessory("spoto_press", "5-8回 x 3", "胸上の停止と押し出し"),
      accessory("floor_press", "5-8回 x 3", "中盤からロックアウト"),
      accessory("pin_press", "4-6回 x 3", "スティッキングポイント対策"),
      accessory("jm_press", "6-10回 x 3", "三頭筋とロックアウト"),
      accessory("pec_fly", "10-15回 x 3", "胸の筋量確保"),
      accessory("seated_dumbbell_press", "8-12回 x 3", "肩と押す土台"),
      accessory("pushdown", "12-15回 x 3", "肘に優しい三頭補強"),
      accessory("rear_delt_raise", "12-20回 x 3", "肩後部と肩甲骨の安定")
    ],
    deadlift: [
      accessory("stiff_leg_deadlift", "5-8回 x 3", "ハムと背面の張力"),
      accessory("block_pull", "4-6回 x 3", "膝上からの引き切り"),
      accessory("rack_pull", "4-6回 x 3", "トップ側の引き切り"),
      accessory("snatch_grip_deadlift", "4-6回 x 3", "背中とポジション維持"),
      accessory("hip_thrust", "8-12回 x 3", "臀部とロックアウト"),
      accessory("chest_supported_row", "8-12回 x 3", "腰を休めた背中補強"),
      accessory("seal_row", "8-12回 x 3", "反動を抑えた背中補強"),
      accessory("t_bar_row", "8-12回 x 3", "高重量の水平プル"),
      accessory("seated_row", "8-12回 x 3", "安定した水平プル"),
      accessory("straight_arm_pulldown", "10-15回 x 3", "広背筋とバーの保持"),
      accessory("pallof_press", "10-12回 x 3", "体幹の抗回旋"),
      accessory("side_plank", "30-45秒 x 3", "側屈耐性と体幹固定")
    ]
  };
  const key = dayTitle.includes("BP") || dayTitle.includes(j([12505,12531,12481])) ? "bench"
    : dayTitle.includes("DL") || dayTitle.includes(j([12487,12483,12489])) ? "deadlift"
    : "squat";
  const usedExerciseIds = new Set(currentItems.map((item) => item.exerciseId).filter(Boolean));
  const pool = pools[key].filter((item) => availableAccessory(item, cycle) && !usedExerciseIds.has(item.exerciseId));
  return pool[index % pool.length] || null;
}

function roundToIncrement(value, increment) {
  return Math.round(Number(value) / increment) * increment;
}

function drawWeeklyDataChart(athlete = currentAthlete()) {
  if (!els.weeklyDataChart) return;
  const ctx = els.weeklyDataChart.getContext("2d");
  const width = els.weeklyDataChart.width;
  const height = els.weeklyDataChart.height;
  const snapshot = weeklyDataSnapshot(athlete, normalizedCycle());
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#ded8cf";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i += 1) {
    const y = 28 + ((height - 72) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(44, y);
    ctx.lineTo(width - 22, y);
    ctx.stroke();
  }
  if (!snapshot.logs.length && !snapshot.wellnessScores.length) {
    ctx.fillStyle = "#667085";
    ctx.font = "22px sans-serif";
    ctx.fillText("今週の体調とトレーニング記録が入ると表示されます", 52, height / 2);
    return;
  }

  const chartLeft = 52;
  const chartRight = width - 30;
  const chartTop = 32;
  const chartBottom = height - 44;
  const chartHeight = chartBottom - chartTop;
  const maxVolume = Math.max(1, ...snapshot.dailyRows.map((row) => row.volume));
  const step = (chartRight - chartLeft) / snapshot.dailyRows.length;

  snapshot.dailyRows.forEach((row, index) => {
    const barHeight = (row.volume / maxVolume) * chartHeight;
    const x = chartLeft + index * step + step * 0.18;
    const y = chartBottom - barHeight;
    ctx.fillStyle = row.highRpe ? "rgba(180, 35, 24, 0.68)" : "rgba(47, 111, 115, 0.45)";
    ctx.fillRect(x, y, step * 0.55, Math.max(2, barHeight));
    ctx.fillStyle = "#667085";
    ctx.font = "14px sans-serif";
    ctx.fillText(row.date.slice(5), x - 2, height - 18);
    if (row.highRpe) {
      ctx.fillStyle = "#b42318";
      ctx.beginPath();
      ctx.arc(x + step * 0.28, y - 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const wellnessPoints = snapshot.dailyRows
    .map((row, index) => row.wellness === null ? null : ({
      x: chartLeft + index * step + step * 0.45,
      y: chartBottom - (row.wellness / 100) * chartHeight,
      score: row.wellness
    }))
    .filter(Boolean);
  if (wellnessPoints.length) {
    ctx.strokeStyle = "#b42318";
    ctx.lineWidth = 3;
    ctx.beginPath();
    wellnessPoints.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
    wellnessPoints.forEach((point) => {
      ctx.fillStyle = "#15171a";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.fillStyle = "#15171a";
  ctx.font = "15px sans-serif";
  ctx.fillText("棒: 週間ボリューム / 線: ウェルネス / 赤点: 予定RPEより重い日", 52, 20);
}

function drawChart() {
  const ctx = els.trendChart.getContext("2d");
  const width = els.trendChart.width;
  const height = els.trendChart.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(0, 0, width, height);
  const selectedKey = els.chartLiftSelect.value;
  const points = currentAthlete().logs
    .filter((log) => chartKey(log) === selectedKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((log) => ({ date: log.date, value: e1rm(log.weight, log.reps) }));

  ctx.strokeStyle = "#ded8cf";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i += 1) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(width - 18, y);
    ctx.stroke();
  }

  if (!points.length) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "24px sans-serif";
    ctx.fillText("記録を追加するとグラフが出ます", 52, height / 2);
    return;
  }

  const min = Math.min(...points.map((point) => point.value)) - 5;
  const max = Math.max(...points.map((point) => point.value)) + 5;
  const xStep = points.length > 1 ? (width - 72) / (points.length - 1) : 0;
  const scaleY = (value) => height - 36 - ((value - min) / Math.max(1, max - min)) * (height - 72);

  ctx.strokeStyle = "#b42318";
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = 36 + index * xStep;
    const y = scaleY(point.value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    const x = 36 + index * xStep;
    const y = scaleY(point.value);
    ctx.fillStyle = "#151515";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "18px sans-serif";
    ctx.fillText(`${point.value}`, x + 8, y - 8);
  });
}

function chartKey(log) {
  return log.exerciseId === "custom" ? `custom:${log.exerciseName || "自由入力"}` : log.exerciseId;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function quizQuestionById(id) {
  return ruleQuestions.find((question) => question.id === id);
}

function quizQuestionsForCategory(category) {
  return ruleQuestions.filter((question) => question.category === category).map((question) => question.id);
}

function quizWrongQuestions() {
  return ruleQuestions.filter((question) => state.quiz?.stats?.[question.id]?.lastCorrect === false);
}

function quizScoreLabel(correct, total) {
  const ratio = total ? correct / total : 0;
  if (total && correct === total) return "白3つ";
  if (ratio >= 0.8) return "白2つ";
  if (ratio >= 0.5) return "白1つ";
  return "大会前アップ中";
}

function quizProgressByCategory(category) {
  const ids = quizQuestionsForCategory(category);
  const answered = ids.filter((id) => Number(state.quiz?.stats?.[id]?.attempts || 0) > 0).length;
  const correct = ids.filter((id) => state.quiz?.stats?.[id]?.lastCorrect === true).length;
  return { answered, correct, total: ids.length };
}

function resetQuizSession(view = "top") {
  state.quiz = {
    ...normalizeQuizState(state.quiz),
    view,
    category: "",
    queue: [],
    index: 0,
    selectedIndex: null,
    answered: false,
    correct: 0,
    reviewMode: false
  };
}

function startQuiz(category) {
  const queue = quizQuestionsForCategory(category);
  state.quiz = {
    ...normalizeQuizState(state.quiz),
    view: "question",
    category,
    queue,
    index: 0,
    selectedIndex: null,
    answered: false,
    correct: 0,
    reviewMode: false
  };
  saveState();
  render();
}

function startWrongReview() {
  const queue = quizWrongQuestions().map((question) => question.id);
  if (!queue.length) return;
  state.quiz = {
    ...normalizeQuizState(state.quiz),
    view: "question",
    category: "",
    queue,
    index: 0,
    selectedIndex: null,
    answered: false,
    correct: 0,
    reviewMode: true
  };
  saveState();
  render();
}

function answerQuiz(choiceIndex) {
  const quiz = normalizeQuizState(state.quiz);
  if (quiz.answered) return;
  const question = quizQuestionById(quiz.queue[quiz.index]);
  if (!question) return;
  const isCorrect = choiceIndex === question.answerIndex;
  const previous = quiz.stats[question.id] || { attempts: 0, correct: 0, wrong: 0, lastCorrect: false };
  quiz.stats[question.id] = {
    attempts: Number(previous.attempts || 0) + 1,
    correct: Number(previous.correct || 0) + (isCorrect ? 1 : 0),
    wrong: Number(previous.wrong || 0) + (isCorrect ? 0 : 1),
    lastCorrect: isCorrect
  };
  state.quiz = {
    ...quiz,
    selectedIndex: choiceIndex,
    answered: true,
    correct: quiz.correct + (isCorrect ? 1 : 0)
  };
  saveState();
  render();
}

function nextQuizQuestion() {
  const quiz = normalizeQuizState(state.quiz);
  if (quiz.index + 1 >= quiz.queue.length) {
    state.quiz = { ...quiz, view: "result", selectedIndex: null, answered: false };
  } else {
    state.quiz = { ...quiz, index: quiz.index + 1, selectedIndex: null, answered: false };
  }
  saveState();
  render();
}

function renderQuiz() {
  if (!els.quizApp) return;
  state.quiz = normalizeQuizState(state.quiz);
  if (state.quiz.view === "categories") {
    renderQuizCategories();
  } else if (state.quiz.view === "question") {
    renderQuizQuestion();
  } else if (state.quiz.view === "result") {
    renderQuizResult();
  } else {
    renderQuizTop();
  }
}

function renderQuizTop() {
  const stats = Object.values(state.quiz.stats || {});
  const attempted = stats.filter((stat) => Number(stat.attempts || 0) > 0).length;
  const totalAttempts = stats.reduce((sum, stat) => sum + Number(stat.attempts || 0), 0);
  const correct = stats.reduce((sum, stat) => sum + Number(stat.correct || 0), 0);
  const rate = totalAttempts ? Math.round((correct / totalAttempts) * 100) : 0;
  const wrong = quizWrongQuestions().length;
  els.quizApp.innerHTML = `
    <div class="quiz-top">
      <div class="quiz-score-strip">
        <div><span>進捗</span><strong>${attempted}/${ruleQuestions.length}</strong></div>
        <div><span>正解率</span><strong>${rate}%</strong></div>
        <div><span>復習</span><strong>${wrong}問</strong></div>
      </div>
      <p class="quiz-guide">大会直前だけでなく、普段の練習から「何が白判定で、何が赤判定になりやすいか」を3択で確認できます。</p>
      <p class="quiz-disclaimer quiz-guide">本クイズは、パワーリフティング競技ルールの理解を補助するための学習機能です。実際の大会では、主催団体の大会要項、最新ルールブック、審判・大会運営の指示を必ず優先してください。</p>
      <div class="quiz-actions">
        <button class="primary-button inline" type="button" data-quiz-action="categories">カテゴリから選ぶ</button>
        <button class="text-button" type="button" data-quiz-action="review" ${wrong ? "" : "disabled"}>間違えた問題を復習</button>
      </div>
    </div>
  `;
}

function renderQuizCategories() {
  els.quizApp.innerHTML = `
    <div class="quiz-subhead">
      <button class="text-button compact" type="button" data-quiz-action="top">戻る</button>
      <p>カテゴリを選択</p>
    </div>
    <div class="quiz-category-grid">
      ${Object.entries(quizCategories).map(([id, category]) => {
        const progress = quizProgressByCategory(id);
        return `
          <button class="quiz-category-card" type="button" data-quiz-action="start" data-category="${escapeHtml(id)}">
            <span>${escapeHtml(category.short)}</span>
            <strong>${escapeHtml(category.label)}</strong>
            <small>${escapeHtml(category.description)}</small>
            <em>${progress.answered}/${progress.total}問 / 最新正解 ${progress.correct}問</em>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderQuizQuestion() {
  const quiz = normalizeQuizState(state.quiz);
  const question = quizQuestionById(quiz.queue[quiz.index]);
  if (!question) {
    resetQuizSession("top");
    renderQuizTop();
    return;
  }
  const category = quizCategories[question.category];
  const isCorrect = quiz.selectedIndex === question.answerIndex;
  els.quizApp.innerHTML = `
    <div class="quiz-question-card">
      <div class="quiz-subhead">
        <button class="text-button compact" type="button" data-quiz-action="${quiz.reviewMode ? "top" : "categories"}">戻る</button>
        <p>${quiz.reviewMode ? "復習" : escapeHtml(category.label)} ${quiz.index + 1}/${quiz.queue.length}</p>
      </div>
      <div class="quiz-question-title">
        <span class="quiz-badge">${escapeHtml(category.short)}</span>
        <h3>${escapeHtml(question.question)}</h3>
      </div>
      <div class="quiz-choice-list">
        ${question.choices.map((choice, index) => {
          const selected = quiz.selectedIndex === index;
          const correct = quiz.answered && index === question.answerIndex;
          const wrong = quiz.answered && selected && index !== question.answerIndex;
          const className = ["quiz-choice", correct ? "correct" : "", wrong ? "wrong" : ""].filter(Boolean).join(" ");
          return `
            <button class="${className}" type="button" data-choice="${index}" ${quiz.answered ? "disabled" : ""}>
              <span>${index + 1}</span>
              <strong>${escapeHtml(choice)}</strong>
            </button>
          `;
        }).join("")}
      </div>
      ${quiz.answered ? `
        <div class="quiz-feedback ${isCorrect ? "correct" : "wrong"}">
          <strong>${isCorrect ? "白判定です。" : "惜しい！本番前に知れて白判定です。"}</strong>
          <p>${escapeHtml(question.explanation)}</p>
          <div class="quiz-source">
            <span>${escapeHtml(question.sourceLabel)} / ${escapeHtml(question.sourceSection)} / 最終確認 ${escapeHtml(question.lastChecked)}</span>
            <a href="${escapeHtml(question.sourceUrl)}" target="_blank" rel="noopener">公式情報を確認</a>
          </div>
        </div>
        <button class="primary-button" type="button" data-quiz-action="next">${quiz.index + 1 >= quiz.queue.length ? "結果を見る" : "次の問題へ"}</button>
      ` : ""}
    </div>
  `;
}

function renderQuizResult() {
  const quiz = normalizeQuizState(state.quiz);
  const total = quiz.queue.length;
  const label = quizScoreLabel(quiz.correct, total);
  els.quizApp.innerHTML = `
    <div class="quiz-result">
      <span>${escapeHtml(label)}</span>
      <h3>${quiz.correct}/${total} 正解</h3>
      <p>${quiz.correct === total ? "白3つ。かなり落ち着いて試合に入れそうです。" : "ここで確認できた分だけ、本番の赤判定を減らせます。"}</p>
      <div class="quiz-actions">
        <button class="primary-button inline" type="button" data-quiz-action="categories">別カテゴリへ</button>
        <button class="text-button" type="button" data-quiz-action="review" ${quizWrongQuestions().length ? "" : "disabled"}>間違えた問題を復習</button>
        <button class="text-button" type="button" data-quiz-action="top">トップへ</button>
      </div>
    </div>
  `;
}

function renderSetRows(copyFirst = false) {
  const count = Math.max(1, Math.min(20, Number(els.setsInput.value || 1)));
  const existing = Array.from(els.setRows.querySelectorAll(".set-row")).map((row) => ({
    weight: row.querySelector(".set-weight").value,
    reps: row.querySelector(".set-reps").value,
    rpe: row.querySelector(".set-rpe").value
  }));
  const first = existing[0] || {};
  els.setRows.innerHTML = Array.from({ length: count }, (_, index) => {
    const previous = existing[index] || {};
    const source = copyFirst && index > 0 ? first : previous;
    const weight = source.weight || "";
    const reps = source.reps || "";
    const rpe = source.rpe || "";
    return `
      <div class="set-row">
        <strong>Set ${index + 1}</strong>
        <label>kg<input class="set-weight" inputmode="decimal" type="number" min="0" step="0.5" value="${escapeHtml(weight)}"></label>
        <label>回数<input class="set-reps" inputmode="numeric" type="number" min="1" step="1" value="${escapeHtml(reps)}"></label>
        <label>RPE<input class="set-rpe" inputmode="decimal" type="number" min="5" max="10" step="0.5" value="${escapeHtml(rpe)}"></label>
      </div>
    `;
  }).join("");
}

function collectSetDetails() {
  return Array.from(els.setRows.querySelectorAll(".set-row"))
    .map((row, index) => ({
      set: index + 1,
      weight: Number(row.querySelector(".set-weight").value),
      reps: Number(row.querySelector(".set-reps").value),
      rpe: row.querySelector(".set-rpe").value ? Number(row.querySelector(".set-rpe").value) : ""
    }))
    .filter((set) => set.weight && set.reps);
}

function setDetailsText(log) {
  if (!Array.isArray(log.setDetails) || !log.setDetails.length) return "";
  return log.setDetails.map((set, index) => {
    const rpe = set.rpe ? ` @${set.rpe}` : "";
    return `S${index + 1} ${set.weight}kg x ${set.reps}${rpe}`;
  }).join(" / ");
}

function editLogWithPrompts(log) {
  const name = prompt("種目名を編集します。", log.exerciseName || exerciseMeta(log.exerciseId).name);
  if (name === null) return;
  const weight = prompt("代表重量 kg を編集します。", log.weight ?? "");
  if (weight === null) return;
  const reps = prompt("代表回数を編集します。", log.reps ?? "");
  if (reps === null) return;
  const rpe = prompt("代表RPEを編集します。空欄でもOKです。", log.rpe ?? "");
  if (rpe === null) return;
  const note = prompt("メモを編集します。", log.note || "");
  if (note === null) return;

  const nextWeight = Number(weight);
  const nextReps = Number(reps);
  const nextRpe = rpe === "" ? "" : Number(rpe);
  if (!nextWeight || !nextReps || (rpe !== "" && !nextRpe)) {
    alert("重量・回数・RPEの入力を確認してください。");
    return;
  }
  log.exerciseName = name.trim() || log.exerciseName;
  log.weight = nextWeight;
  log.reps = nextReps;
  log.rpe = nextRpe;
  log.note = note.trim();
  if (Array.isArray(log.setDetails) && log.setDetails.length) {
    log.setDetails[0] = { ...log.setDetails[0], weight: nextWeight, reps: nextReps, rpe: nextRpe };
  } else {
    log.setDetails = [{ set: 1, weight: nextWeight, reps: nextReps, rpe: nextRpe }];
  }
}

function backupPayload() {
  return {
    app: "Platform Buddy",
    type: "platform-buddy-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    state
  };
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(backupPayload(), null, 2)], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, `platform-buddy-backup-${today()}.json`);
}

function normalizeBackupPayload(payload) {
  if (!payload || typeof payload !== "object") throw new Error("バックアップファイルを読み込めませんでした。");
  const rawState = ["platform-buddy-backup", "total-academy-backup"].includes(payload.type) ? payload.state : payload;
  if (!rawState || !Array.isArray(rawState.athletes)) throw new Error("Platform Buddyのバックアップではない可能性があります。");
  const migrated = migrateState(rawState);
  if (!Array.isArray(migrated.athletes) || !migrated.athletes.length) throw new Error("選手データが見つかりませんでした。");
  if (!migrated.currentAthleteId || !migrated.athletes.some((athlete) => athlete.id === migrated.currentAthleteId)) {
    migrated.currentAthleteId = migrated.athletes[0].id;
  }
  return migrated;
}

function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const importedState = normalizeBackupPayload(JSON.parse(reader.result));
      const logCount = importedState.athletes.reduce((sum, athlete) => sum + (athlete.logs || []).length, 0);
      const ok = window.confirm(`バックアップを読み込みますか？\n現在の端末内データは、バックアップ内の ${importedState.athletes.length}名 / ${logCount}件の記録で上書きされます。`);
      if (!ok) return;
      state = importedState;
      saveState();
      renderExerciseControls();
      render();
      alert("バックアップを読み込みました。");
    } catch (error) {
      alert(error.message || "バックアップの読み込みに失敗しました。");
    } finally {
      els.backupFileInput.value = "";
    }
  });
  reader.addEventListener("error", () => {
    alert("ファイルの読み込みに失敗しました。");
    els.backupFileInput.value = "";
  });
  reader.readAsText(file);
}

function renderDataStatus() {
  if (!els.dataStatus) return;
  const athleteCount = state.athletes.length;
  const logCount = state.athletes.reduce((sum, athlete) => sum + (athlete.logs || []).length, 0);
  const meetNoteCount = state.athletes.reduce((sum, athlete) => sum + (athlete.meetNotes || []).length, 0);
  const updated = state.updatedAt ? new Date(state.updatedAt).toLocaleString("ja-JP") : "未記録";
  els.dataStatus.innerHTML = `
    <span>保存状態</span>
    <strong>この端末に ${athleteCount}名 / ${logCount}件の記録 / ${meetNoteCount}件の大会ノートを保存中</strong>
    <span>最終更新: ${escapeHtml(updated)}</span>
  `;
}

function renderStartGuide() {
  if (!els.startGuide) return;
  const guides = {
    log: {
      title: "自由記録へ進む",
      view: "log",
      button: "LOGを開く",
      note: "プラン外の練習や補助種目を残します。"
    },
    plan: {
      title: "PRサイクルを作る",
      view: "plan",
      button: "PLANを開く",
      note: "現在1RMと目標から、MAX更新までの計画を作ります。"
    },
    meet: {
      title: "大会準備へ進む",
      view: "knowledge",
      button: "MEETを開く",
      note: "白判定、公式ルール、持ち物、大会ノートを確認します。"
    }
  };
  const active = guides[state.startAction] || guides.plan;
  document.querySelectorAll(".start-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.startAction === state.startAction);
  });
  els.startGuide.innerHTML = `
    <div>
      <strong>${escapeHtml(active.title)}</strong>
      <p>${escapeHtml(active.note)}</p>
    </div>
    <button class="primary-button inline" type="button" data-view-target="${escapeHtml(active.view)}">${escapeHtml(active.button)}</button>
  `;
}

function onboardingDefaults(goal) {
  const base = {
    planTarget: "big3",
    programMethod: "platform",
    buddyLevel: "level1",
    length: 12,
    daysPerWeek: 4,
    accessoryVolume: "normal",
    priorityLift: "total",
    experienceLevel: "beginner"
  };
  if (goal === "bench") {
    return { ...base, planTarget: "bench_only", priorityLift: "bench", daysPerWeek: 4 };
  }
  if (goal === "meet") {
    return { ...base, length: 12, daysPerWeek: 4, priorityLift: "total" };
  }
  if (goal === "learn") {
    return { ...base, length: 10, daysPerWeek: 3, accessoryVolume: "low" };
  }
  return base;
}

function applyOnboardingPlan() {
  const athlete = currentAthlete();
  const goal = state.onboarding?.goal || "big3";
  const defaults = onboardingDefaults(goal);
  const cycle = normalizedCycle();
  Object.assign(cycle, defaults, {
    week: 1,
    recoveryMode: false,
    recoveryForWeek: null,
    recoveryFromWeek: null,
    pendingRecoveryAlert: null,
    maxes: {
      squat: els.onboardingSquatMax?.value || cycle.maxes.squat || "",
      bench: els.onboardingBenchMax?.value || cycle.maxes.bench || "",
      deadlift: els.onboardingDeadliftMax?.value || cycle.maxes.deadlift || ""
    }
  });
  cycle.daysPerWeek = Number(els.onboardingDays?.value || defaults.daysPerWeek);
  cycle.experienceLevel = els.onboardingExperience?.value || defaults.experienceLevel;
  if (els.onboardingSex) athlete.sex = els.onboardingSex.value;
  athlete.bodyweight = els.onboardingBodyweight?.value || athlete.bodyweight || "";
  athlete.weightClass = inferWeightClass(athlete.sex || "male", athlete.bodyweight);
  athlete.rpeExperience = els.onboardingRpeExperience?.value || "learning";
  state.startAction = goal === "meet" ? "meet" : "plan";
  state.collapsed = { ...defaultState.collapsed, ...(state.collapsed || {}), cycle: false, welcome: true };
  state.onboarding.step = "complete";
  saveState();
  render();
}

function switchView(viewName) {
  const target = document.querySelector(`#${viewName}View`);
  if (!target) return;
  document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  target.classList.add("active");
  updateActiveViewClass(viewName);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  drawWeeklyDataChart(currentAthlete());
  drawChart();
}

function updateActiveViewClass(viewName = document.querySelector(".tab.active")?.dataset.view || "home") {
  document.body.dataset.activeView = viewName;
  document.body.classList.toggle("home-mode", viewName === "home");
}

function updateDashboardGoalTotalPreview(sourceInput) {
  if (!sourceInput || sourceInput.dataset.goalInput === "total") return;
  const dashboard = sourceInput.closest(".athlete-dashboard, .home-card-detail-panel");
  if (!dashboard) return;
  const totalInput = dashboard.querySelector('[data-goal-input="total"]');
  if (!totalInput) return;
  const total = mainLiftIds.reduce((sum, liftId) => {
    const input = dashboard.querySelector(`[data-goal-input="${liftId}"]`);
    return sum + Number(input?.value || 0);
  }, 0);
  totalInput.value = total ? String(total) : "";
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    switchView(tab.dataset.view);
  });
});

document.querySelectorAll("[data-start-action]").forEach((button) => {
  button.addEventListener("click", () => {
    state.startAction = button.dataset.startAction;
    saveState();
    renderStartGuide();
  });
});

document.addEventListener("keydown", (event) => {
  const accordionHeader = event.target.closest?.(".accordion-header");
  if (!accordionHeader || !["Enter", " "].includes(event.key)) return;
  if (event.target.closest("button, a, input, select, textarea, label")) return;
  event.preventDefault();
  toggleCollapsed(accordionHeader.dataset.collapseKey);
});

document.addEventListener("click", (event) => {
  const accordionHeader = event.target.closest(".accordion-header");
  if (accordionHeader && !event.target.closest("button, a, input, select, textarea, label")) {
    toggleCollapsed(accordionHeader.dataset.collapseKey);
    return;
  }
  const homeCard = event.target.closest("[data-home-card]");
  if (homeCard) {
    const key = homeCard.dataset.homeCard;
    homeDashboardOpenCard = homeDashboardOpenCard === key ? "" : key;
    renderHomeDashboard(currentAthlete(), normalizedCycle());
    placeAthleteDashboardInHome();
    return;
  }
  const wellnessOption = event.target.closest("[data-wellness-option]");
  if (wellnessOption) {
    saveTodayWellness({ [wellnessOption.dataset.wellnessField]: wellnessOption.dataset.wellnessValue });
    return;
  }
  if (event.target.closest("[data-wellness-save]")) {
    saveWellnessFromButtons();
    return;
  }
  if (event.target.closest("[data-wellness-recheck]")) {
    openDailyWellness();
    return;
  }
  if (event.target.closest("[data-wellness-close]")) {
    state.wellnessExpanded = false;
    saveState();
    renderWellnessUI();
    return;
  }
  const wellnessFloating = event.target.closest("[data-wellness-floating]");
  if (wellnessFloating) {
    const entry = todayWellnessEntry();
    if (!entry.completed) {
      openDailyWellness();
      return;
    }
    state.wellnessExpanded = !state.wellnessExpanded;
    saveState();
    renderWellnessUI();
    return;
  }
  const onboardingAction = event.target.closest("[data-onboarding-action]");
  if (onboardingAction) {
    const action = onboardingAction.dataset.onboardingAction;
    state.onboarding = { ...defaultState.onboarding, ...(state.onboarding || {}) };
    if (action === "start") {
      state.onboarding.step = "goal";
    } else if (action === "back") {
      state.onboarding.step = "goal";
    } else if (action === "create") {
      applyOnboardingPlan();
      return;
    } else if (action === "finish") {
      state.onboarding.done = true;
      state.onboarding.step = "intro";
      state.onboarding.dailyLastShown = today();
      saveState();
      render();
      switchView("plan");
      return;
    } else if (action === "daily-plan") {
      closeDailyEntry("plan");
      return;
    } else if (action === "daily-log") {
      closeDailyEntry("log");
      return;
    } else if (action === "daily-max") {
      closeDailyEntry("analysis");
      return;
    } else if (action === "daily-meet") {
      closeDailyEntry("knowledge");
      return;
    } else if (action === "daily-close") {
      closeDailyEntry();
      return;
    } else if (action === "restart-first") {
      state.onboarding = { ...defaultState.onboarding, done: false, step: "intro", goal: "big3", dailyLastShown: today() };
    }
    saveState();
    render();
    return;
  }
  const onboardingGoal = event.target.closest("[data-onboarding-goal]");
  if (onboardingGoal) {
    state.onboarding = { ...defaultState.onboarding, ...(state.onboarding || {}) };
    state.onboarding.goal = onboardingGoal.dataset.onboardingGoal;
    const defaults = onboardingDefaults(state.onboarding.goal);
    if (els.onboardingDays) els.onboardingDays.value = String(defaults.daysPerWeek);
    if (els.onboardingExperience) els.onboardingExperience.value = defaults.experienceLevel;
    if (els.onboardingSex) els.onboardingSex.value = currentAthlete().sex || "";
    state.onboarding.step = "profile";
    saveState();
    render();
    return;
  }
  const dashboardAthlete = event.target.closest("[data-dashboard-athlete]");
  if (dashboardAthlete) {
    state.currentAthleteId = dashboardAthlete.dataset.dashboardAthlete;
    saveState();
    render();
    return;
  }
  if (event.target.closest("[data-athlete-add]")) {
    els.athleteNameInput.value = "";
    els.athleteDialog.showModal();
    return;
  }
  if (event.target.closest("[data-athlete-delete]")) {
    deleteCurrentAthlete();
    return;
  }
  const viewTarget = event.target.closest("[data-view-target]");
  if (viewTarget) {
    switchView(viewTarget.dataset.viewTarget);
    return;
  }
  const setupAction = event.target.closest("[data-cycle-setup-action]");
  if (setupAction) {
    state.collapsed = { ...defaultState.collapsed, ...(state.collapsed || {}), cycle: false };
    saveState();
    render();
    els.cyclePanelContent?.closest(".cycle-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const meetAction = event.target.closest("[data-meet-action]");
  if (meetAction?.dataset.meetAction === "quiz") {
    resetQuizSession("categories");
    state.collapsed = { ...defaultState.collapsed, ...(state.collapsed || {}), quiz: false };
    saveState();
    render();
    els.quizPanelContent?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const meetCheck = event.target.closest("[data-meet-check]");
  if (meetCheck) {
    const athlete = currentAthlete();
    athlete.meetChecklist = athlete.meetChecklist && typeof athlete.meetChecklist === "object" ? athlete.meetChecklist : {};
    athlete.meetChecklist[meetCheck.dataset.meetCheck] = meetCheck.checked;
    saveState();
    return;
  }
  const deleteMeetNote = event.target.closest("[data-delete-meet-note]");
  if (deleteMeetNote) {
    if (!confirm("この大会ノートを削除しますか？")) return;
    const athlete = currentAthlete();
    athlete.meetNotes = (athlete.meetNotes || []).filter((note) => note.id !== deleteMeetNote.dataset.deleteMeetNote);
    saveState();
    renderMeetNoteList(athlete);
    renderMeetReviewPreview(null);
    renderCollapseSummaries(athlete, normalizedCycle());
  }
});

els.meetNoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const note = buildMeetNoteFromForm();
  const entered = meetEnteredAttempts(note.attempts);
  if (!entered.length && !note.selfNote && !note.goodNote && !note.issueNote) {
    alert("試技結果か感想を1つ以上入力してください。");
    return;
  }
  const athlete = currentAthlete();
  athlete.meetNotes = [note, ...(athlete.meetNotes || [])];
  saveState();
  els.meetNoteForm.reset();
  els.meetReviewDateInput.value = today();
  renderMeetAttemptGrid();
  renderMeetNoteList(athlete);
  renderMeetReviewPreview(note);
  renderCollapseSummaries(athlete, normalizedCycle());
});

els.categorySelect.addEventListener("change", renderExerciseOptions);
els.exerciseSelect.addEventListener("change", updateCustomExerciseVisibility);
els.setsInput.addEventListener("change", () => {
  renderSetRows();
});
els.fillSetRowsBtn.addEventListener("click", () => renderSetRows(true));
els.alternativePanel.addEventListener("click", (event) => {
  const button = event.target.closest(".alternative-option");
  if (!button) return;
  const exerciseId = button.dataset.exerciseId;
  const categoryId = exerciseCategoryId(exerciseId);
  if (!categoryId) return;
  els.categorySelect.value = categoryId;
  renderExerciseOptions();
  els.exerciseSelect.value = exerciseId;
  updateCustomExerciseVisibility();
  els.exerciseSelect.focus();
});

els.planList.addEventListener("click", (event) => {
  const recoveryButton = event.target.closest("[data-recovery-action]");
  if (recoveryButton) {
    handleRecoveryAction(recoveryButton.dataset.recoveryAction);
    return;
  }
  const statusButton = event.target.closest("[data-calibration-status]");
  if (statusButton) {
    const body = statusButton.closest(".rpe-calibration-body");
    body.querySelectorAll(".calibration-status-btn").forEach((button) => button.classList.remove("active"));
    statusButton.classList.add("active");
    body.dataset.status = statusButton.dataset.calibrationStatus;
    return;
  }
  const calibrationButton = event.target.closest(".calibration-save");
  if (calibrationButton) {
    saveRpeCalibration(calibrationButton.closest(".rpe-calibration-body"));
    return;
  }
  const removeButton = event.target.closest(".actual-remove-set");
  if (removeButton) {
    const list = removeButton.closest(".actual-set-list");
    if (list.querySelectorAll(".actual-set-row").length <= 1) return;
    removeButton.closest(".actual-set-row").remove();
    Array.from(list.querySelectorAll(".actual-set-row strong")).forEach((label, index) => {
      label.textContent = `S${index + 1}`;
    });
    return;
  }
  const addButton = event.target.closest(".actual-add-set");
  if (addButton) {
    const list = addButton.closest(".actual-box").querySelector(".actual-set-list");
    list.insertAdjacentHTML("beforeend", actualSetRowMarkup({}, list.querySelectorAll(".actual-set-row").length));
    return;
  }
  const button = event.target.closest(".actual-save");
  if (!button) return;
  const box = button.closest(".actual-box");
  const setDetails = Array.from(box.querySelectorAll(".actual-set-row"))
    .map((row, index) => ({
      set: index + 1,
      weight: Number(row.querySelector(".actual-weight").value),
      reps: Number(row.querySelector(".actual-reps").value),
      rpe: row.querySelector(".actual-rpe").value ? Number(row.querySelector(".actual-rpe").value) : ""
    }))
    .filter((set) => set.weight && set.reps);
  if (!setDetails.length) return;
  const topSet = setDetails.reduce((best, set) => e1rm(set.weight, set.reps) > e1rm(best.weight, best.reps) ? set : best, setDetails[0]);
  const rpeSet = [...setDetails].reverse().find((set) => set.rpe) || topSet;
  const weight = topSet.weight;
  const reps = topSet.reps;
  const rpe = rpeSet.rpe ? Number(rpeSet.rpe) : "";

  const athlete = currentAthlete();
  const lift = box.dataset.lift;
  const exerciseName = box.dataset.exercise;
  const plannedRpe = Number(box.dataset.plannedRpe || 0);
  const rpeConfidence = box.querySelector(".actual-rpe-confidence")?.value || "learning";
  const feedback = plannedRpe && rpe ? rpeAdjustmentFeedback(plannedRpe, rpe, rpeConfidence) : { status: "ok", message: "実績を保存しました。次回の重量判断に使えます。" };
  athlete.rpeFeedback = athlete.rpeFeedback || {};
  athlete.rpeFeedback[box.dataset.planKey] = {
    weight,
    reps,
    rpe,
    setDetails,
    plannedRpe,
    rpeConfidence,
    lift,
    exerciseName,
    status: feedback.status,
    message: feedback.message
  };
  const meta = exerciseMeta(lift);
  athlete.logs = athlete.logs.filter((log) => log.planKey !== box.dataset.planKey);
  athlete.logs.push({
    id: crypto.randomUUID(),
    date: today(),
    category: exerciseCategoryId(lift) || "custom",
    exerciseId: lift,
    exerciseName,
    badge: meta.badge,
    weight,
    reps,
    sets: setDetails.length,
    rpe,
    setDetails,
    source: "plan",
    planKey: box.dataset.planKey,
    planText: box.dataset.planText || "",
    rpeConfidence,
    note: plannedRpe ? `予定RPE ${plannedRpe} / ${feedback.message}` : feedback.message
  });
  saveState();
  render();
});

function rpeAdjustmentFeedback(plannedRpe, actualRpe, confidence = "learning") {
  if (!plannedRpe) {
    return { status: "ok", message: "記録しました。次回もフォームと余力をメモしてRPE感覚を育てましょう。" };
  }
  const diff = actualRpe - plannedRpe;
  const learningNote = confidence === "solid"
    ? ""
    : confidence === "unsure"
    ? " ただしRPEに迷いがあるため、動画やフォーム再現性も合わせて確認しましょう。"
    : " RPE感覚は練習中です。重量変更を強く決めつけず、深さ・止め・ロックアウト・バー速度も観察しましょう。";
  if (diff >= 2) return { status: "deload", rpeConfidence: confidence, message: `デロード候補: 予定よりRPE +${diff.toFixed(1)}。次週へ進む前に回復週や上限重量の設定を検討してください。${learningNote}` };
  if (diff >= 1.5) return { status: "heavy", rpeConfidence: confidence, message: `警告: 予定よりRPE +${diff.toFixed(1)}。今日は重量を下げて予定RPEを守る方がプログラムとして成功です。次回は -2.5〜5kg、バックオフ減を検討してください。${learningNote}` };
  if (diff >= 1) return { status: "warn", rpeConfidence: confidence, message: `注意: 予定よりRPE +${diff.toFixed(1)}。次回は -2.5kg を検討し、重量より予定RPEを守る感覚を優先しましょう。${learningNote}` };
  if (diff <= -1.5) return { status: "light", rpeConfidence: confidence, message: `予定よりRPE ${diff.toFixed(1)}。余力がありますが追いすぎず、次セットやバックオフを +2.5〜5kg まで。予定RPEを超えない範囲で止めましょう。${learningNote}` };
  if (diff <= -0.75) return { status: "light", rpeConfidence: confidence, message: `予定よりRPE ${diff.toFixed(1)}。少し軽めです。次回は +2.5kg までを候補にし、フォーム精度を優先しましょう。${learningNote}` };
  return { status: "ok", rpeConfidence: confidence, message: `予定通り。RPE差 ${diff >= 0 ? "+" : ""}${diff.toFixed(1)}。この感覚を次回の基準にしましょう。${learningNote}` };
}

els.logForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const athlete = currentAthlete();
  const exerciseId = els.exerciseSelect.value;
  const meta = exerciseMeta(exerciseId);
  const exerciseName = exerciseId === "custom" ? els.customExerciseInput.value.trim() : meta.name;
  const setDetails = collectSetDetails();
  if (!setDetails.length) {
    alert("少なくとも1セット分の重量と回数を入力してください。");
    return;
  }
  const topSet = setDetails.reduce((best, set) => e1rm(set.weight, set.reps) > e1rm(best.weight, best.reps) ? set : best, setDetails[0]);
  const lastRpe = [...setDetails].reverse().find((set) => set.rpe)?.rpe || "";
  athlete.logs.push({
    id: crypto.randomUUID(),
    date: els.dateInput.value,
    category: els.categorySelect.value,
    exerciseId,
    exerciseName,
    badge: exerciseId === "custom" ? "自由" : meta.badge,
    weight: topSet.weight,
    reps: topSet.reps,
    sets: setDetails.length,
    rpe: lastRpe,
    setDetails,
    source: "log",
    note: els.noteInput.value.trim()
  });
  saveState();
  els.logForm.reset();
  els.dateInput.value = today();
  els.setsInput.value = "1";
  renderSetRows();
  renderExerciseOptions();
  render();
});

els.sexInput.addEventListener("change", () => {
  const athlete = currentAthlete();
  athlete.sex = els.sexInput.value;
  athlete.weightClass = inferWeightClass(athlete.sex, athlete.bodyweight);
  saveState();
  render();
});

els.bodyweightInput.addEventListener("change", () => {
  const athlete = currentAthlete();
  athlete.bodyweight = els.bodyweightInput.value;
  athlete.weightClass = inferWeightClass(athlete.sex, athlete.bodyweight);
  saveState();
  render();
});

els.weightClassInput.addEventListener("change", () => {
  currentAthlete().weightClass = els.weightClassInput.value;
  saveState();
  render();
});

els.prefectureInput.addEventListener("change", () => {
  currentAthlete().prefecture = els.prefectureInput.value;
  saveState();
  render();
});

els.meetDateInput.addEventListener("change", () => {
  currentAthlete().meetDate = els.meetDateInput.value;
  saveState();
  render();
});

document.addEventListener("change", (event) => {
  const profileInput = event.target.closest?.("[data-profile-input]");
  if (profileInput) {
    const athlete = currentAthlete();
    const field = profileInput.dataset.profileInput;
    if (field === "sex") {
      athlete.sex = profileInput.value;
      athlete.weightClass = inferWeightClass(athlete.sex || "male", athlete.bodyweight);
    } else if (field === "bodyweight") {
      athlete.bodyweight = profileInput.value;
      athlete.weightClass = inferWeightClass(athlete.sex || "male", athlete.bodyweight);
    } else if (field === "weightClass") {
      athlete.weightClass = profileInput.value;
    } else if (field === "prefecture") {
      athlete.prefecture = profileInput.value;
    } else if (field === "meetDate") {
      athlete.meetDate = profileInput.value;
    }
    saveState();
    render();
    return;
  }
  const currentMaxInput = event.target.closest?.("[data-current-max-input]");
  if (currentMaxInput) {
    const liftId = currentMaxInput.dataset.currentMaxInput;
    if (mainLiftIds.includes(liftId)) {
      const cycle = normalizedCycle();
      cycle.maxes[liftId] = currentMaxInput.value;
      saveState();
      render();
    }
    return;
  }
  const goalInput = event.target.closest?.("[data-goal-input]");
  if (goalInput) {
    const athlete = currentAthlete();
    athlete.goals = normalizeGoals(athlete.goals);
    athlete.goals[goalInput.dataset.goalInput] = goalInput.value;
    if (mainLiftIds.includes(goalInput.dataset.goalInput)) {
      const total = calculatedGoalTotal(athlete);
      athlete.goals.total = total ? String(total) : "";
    }
    saveState();
    render();
  }
});

document.addEventListener("input", (event) => {
  const goalInput = event.target.closest?.("[data-goal-input]");
  if (goalInput) updateDashboardGoalTotalPreview(goalInput);
});

document.querySelector("#addAthleteBtn").addEventListener("click", () => {
  els.athleteNameInput.value = "";
  els.athleteDialog.showModal();
});

els.deleteAthleteBtn.addEventListener("click", deleteCurrentAthlete);

document.querySelector("#cancelAthleteBtn").addEventListener("click", () => {
  els.athleteDialog.close();
});

els.athleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = els.athleteNameInput.value.trim();
  if (!name) return;
  const athlete = { id: crypto.randomUUID(), name, sex: "male", bodyweight: "", weightClass: "83", prefecture: "", meetDate: "", goals: defaultGoals(), wellness: {}, meetChecklist: {}, cycle: defaultCycle(), meetNotes: [], logs: [] };
  state.athletes.push(athlete);
  state.currentAthleteId = athlete.id;
  saveState();
  els.athleteDialog.close();
  render();
});

els.historyList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-log]");
  if (editButton) {
    const athlete = currentAthlete();
    const log = athlete.logs.find((item) => item.id === editButton.dataset.editLog);
    if (!log) return;
    editLogWithPrompts(log);
    saveState();
    render();
    return;
  }
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  const athlete = currentAthlete();
  athlete.logs = athlete.logs.filter((log) => log.id !== button.dataset.delete);
  saveState();
  render();
});

document.querySelector("#clearBtn").addEventListener("click", () => {
  if (!confirm("現在の選手の記録をすべて削除しますか？")) return;
  currentAthlete().logs = [];
  saveState();
  render();
});

document.querySelector("#saveCycleBtn").addEventListener("click", updateCycleFromInputs);
els.guideModeBtn.addEventListener("click", () => {
  state.guideMode = !guideEnabled();
  saveState();
  render();
});

els.restartOnboardingBtn?.addEventListener("click", () => {
  state.onboarding = { ...defaultState.onboarding, done: false, step: "intro", goal: "big3" };
  saveState();
  render();
});

function toggleCollapsed(key) {
  state.collapsed = { ...defaultState.collapsed, ...(state.collapsed || {}) };
  state.collapsed[key] = !state.collapsed[key];
  saveState();
  render();
}

function handleRecoveryAction(action) {
  const cycle = normalizedCycle();
  if (action === "start") {
    const alert = cycle.pendingRecoveryAlert || {};
    cycle.recoveryMode = true;
    cycle.recoveryFromWeek = alert.fromWeek || cycle.week;
    cycle.recoveryForWeek = alert.nextWeek || Math.min(cycle.week + 1, cycle.length);
    cycle.pendingRecoveryAlert = null;
  } else if (action === "skip") {
    const alert = cycle.pendingRecoveryAlert || {};
    cycle.week = Math.min(alert.nextWeek || cycle.week + 1, cycle.length);
    cycle.pendingRecoveryAlert = null;
    cycle.recoveryMode = false;
  } else if (action === "finish") {
    cycle.week = Math.min(cycle.recoveryForWeek || cycle.week + 1, cycle.length);
    cycle.recoveryMode = false;
    cycle.recoveryForWeek = null;
    cycle.recoveryFromWeek = null;
    cycle.pendingRecoveryAlert = null;
  }
  saveState();
  render();
}

els.profileCollapseBtn.addEventListener("click", () => toggleCollapsed("profile"));
els.welcomeCollapseBtn?.addEventListener("click", () => toggleCollapsed("welcome"));
els.buddyMethodCollapseBtn?.addEventListener("click", () => toggleCollapsed("buddyMethod"));
els.cycleCollapseBtn.addEventListener("click", () => toggleCollapsed("cycle"));
els.facilityCollapseBtn.addEventListener("click", () => toggleCollapsed("facilities"));
els.meetNoteCollapseBtn?.addEventListener("click", () => toggleCollapsed("meetNote"));
els.quizCollapseBtn?.addEventListener("click", () => toggleCollapsed("quiz"));

els.quizApp?.addEventListener("click", (event) => {
  const choice = event.target.closest("[data-choice]");
  if (choice) {
    answerQuiz(Number(choice.dataset.choice));
    return;
  }
  const actionButton = event.target.closest("[data-quiz-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.quizAction;
  if (action === "top") {
    resetQuizSession("top");
    saveState();
    render();
  } else if (action === "categories") {
    resetQuizSession("categories");
    saveState();
    render();
  } else if (action === "start") {
    startQuiz(actionButton.dataset.category);
  } else if (action === "review") {
    startWrongReview();
  } else if (action === "next") {
    nextQuizQuestion();
  }
});

els.facilityGrid.addEventListener("change", updateCycleFromInputs);
document.querySelector("#prevWeekBtn").addEventListener("click", () => {
  const cycle = normalizedCycle();
  if (cycle.recoveryMode) {
    cycle.recoveryMode = false;
    cycle.recoveryForWeek = null;
    cycle.recoveryFromWeek = null;
  }
  cycle.pendingRecoveryAlert = null;
  cycle.week = Math.max(cycle.week - 1, 1);
  saveState();
  render();
});
document.querySelector("#nextWeekBtn").addEventListener("click", () => {
  const cycle = normalizedCycle();
  if (cycle.pendingRecoveryAlert) {
    render();
    return;
  }
  if (cycle.recoveryMode) {
    cycle.week = Math.min(cycle.recoveryForWeek || cycle.week + 1, cycle.length);
    cycle.recoveryMode = false;
    cycle.recoveryForWeek = null;
    cycle.recoveryFromWeek = null;
    saveState();
    render();
    return;
  }
  const signal = recoverySignalForNextWeek(cycle);
  if (signal) {
    cycle.pendingRecoveryAlert = signal;
    saveState();
    render();
    return;
  }
  cycle.week = Math.min(cycle.week + 1, cycle.length);
  saveState();
  render();
});

[
  els.planTargetInput,
  els.programMethodInput,
  els.cycleLengthInput,
  els.daysPerWeekInput,
  els.accessoryVolumeInput,
  els.priorityLiftInput,
  els.experienceLevelInput,
  els.cycleWeekInput,
  els.squatMaxInput,
  els.benchMaxInput,
  els.deadliftMaxInput
].forEach((input) => {
  input?.addEventListener("change", updateCycleFromInputs);
});

els.chartLiftSelect.addEventListener("change", drawChart);

function logRows(athlete = currentAthlete()) {
  return [
    ["選手", "性別", "階級", "日付", "カテゴリ", "種目", "重量", "回数", "セット", "RPE", "RPE自信度", "セット詳細", "e1RM", "メモ"],
    ...athlete.logs.map((log) => [
      athlete.name,
      athlete.sex === "female" ? "女性" : athlete.sex === "male" ? "男性" : "未設定",
      weightClassMeta(athlete.sex || "male", athlete.weightClass || inferWeightClass(athlete.sex || "male", athlete.bodyweight))[1],
      log.date,
      exerciseCatalog[log.category]?.label || log.category,
      log.exerciseName || exerciseMeta(log.exerciseId).name,
      log.weight,
      log.reps,
      log.sets,
      log.rpe,
      log.rpeConfidence ? rpeConfidenceLabel(log.rpeConfidence) : "",
      setDetailsText(log),
      e1rm(log.weight, log.reps),
      log.note
    ])
  ];
}

function planRowsForWeek(cycle, week) {
  const weekCycle = { ...cycle, week };
  return weeklyTemplate(weekCycle).flatMap((day, dayIndex) => (
    day.items.map((item, itemIndex) => {
      const prescription = item.kind === "accessory" || item.kind === "method"
        ? { title: item.work, detail: item.note }
        : prescriptionForWeek(item.lift, Number(weekCycle.maxes[item.lift] || bestE1rm(item.lift) || 0), week, weekCycle.length, weekCycle.daysPerWeek, item.variant, weekCycle.priorityLift, weekCycle.buddyLevel);
      return [
        `W${week}`,
        `D${dayIndex + 1}`,
        itemIndex === 0 ? day.title : "",
        item.kind === "accessory" ? "補助" : "メイン",
        item.name,
        prescription.title,
        prescription.detail
      ];
    })
  ));
}

function workbookSheets() {
  const athlete = currentAthlete();
  const cycle = normalizedCycle();
  const phase = cyclePhase(cycle.week, cycle.length, cycle.programMethod);
  const balance = liftBalance(cycle, athlete);
  const classLabel = weightClassMeta(athlete.sex, athlete.weightClass)[1];
  const maxRows = activePlanLiftIds(cycle).map((liftId) => {
    const max = Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0);
    const range = max ? projectedPrRange(liftId, max, cycle.length, cycle.daysPerWeek, cycle.priorityLift, athlete) : { low: "-", high: "-" };
    return [mainLiftNames[liftId], max || "-", `${range.low}〜${range.high}`];
  });
  const summary = [
    [cell("Platform Buddy プラン概要", 1), "", "", ""],
    [cell("選手", 7), cell(athlete.name, 8), cell("現在週", 7), cell(`${cycle.week}週目 / ${phase.name}`, 8)],
    [cell("性別", 7), cell(athlete.sex === "female" ? "女性" : athlete.sex === "male" ? "男性" : "未設定", 8), cell("階級", 7), cell(classLabel, 8)],
    [cell("体重", 7), cell(athlete.bodyweight ? `${athlete.bodyweight}kg` : "-", 8), cell("対象", 7), cell(cycle.planTarget === "bench_only" ? "ベンチプレスのみ" : "BIG3", 8)],
    [cell("プラン方式", 7), cell(programMethodInfo(cycle).label, 8), cell("重点種目", 7), cell(cycle.priorityLift === "total" ? "トータル重視" : `${mainLiftNames[cycle.priorityLift]}重視`, 8)],
    [cell("週数", 7), cell(`${cycle.length}週`, 8), cell("想定完了", 7), cell(cycle.programMethod === "platform" ? `約${cycle.length + 1}週` : `${cycle.length}週`, 8)],
    [cell("週頻度", 7), cell(`週${cycle.daysPerWeek}回`, 8), cell("経験レベル", 7), cell({ beginner: "初心者", intermediate: "中級者", advanced: "上級者" }[cycle.experienceLevel] || "-", 8)],
    [cell("Buddy式レベル", 7), cell(cycle.buddyLevel === "level2" ? "Lv2 実戦寄り" : "Lv1 標準", 8), cell("強度管理", 7), cell(cycle.buddyLevel === "level2" ? "RPE + %1RM / 週内非線形" : "RPE習得 / 安全重視", 8)],
    [cell("補助種目量", 7), cell({ low: "少なめ", normal: "普通", high: "多め" }[cycle.accessoryVolume] || cycle.accessoryVolume, 8), cell("おすすめ", 7), cell(balance ? `${mainLiftNames[balance.recommended]}が相対的に低め` : "-", 9)],
    [],
    [cell("種目", 3), cell("現在1RM", 3), cell("予測PRレンジ", 3)],
    ...maxRows.map((row) => row.map((value) => cell(value, 8)))
  ];
  const plan = [
    ["Week", "Day", "目的", "種類", "種目", "処方", "メモ"].map((value) => cell(value, 3)),
    ...Array.from({ length: cycle.length }, (_, index) => planRowsForWeek(cycle, index + 1)).flat().map((row) => stylePlanRow(row))
  ];
  const weekSheets = Array.from({ length: cycle.length }, (_, index) => {
    const week = index + 1;
    return {
      name: `W${week}`,
      rows: weekSheetRows(cycle, week),
      widths: [10, 24, 12, 24, 42, 48],
      freeze: 4
    };
  });
  return [
    { name: "Summary", rows: summary, widths: [18, 24, 18, 34] },
    { name: "Plan", rows: plan, widths: [9, 8, 22, 12, 24, 46, 54], freeze: 1, filter: "A1:G1" },
    ...weekSheets,
    { name: "Log", rows: styledLogRows(athlete), widths: [16, 10, 12, 13, 18, 28, 10, 10, 10, 10, 10, 42], freeze: 1, filter: "A1:L1" }
  ];
}

function cell(value, style = 0) {
  return { value, style };
}

function stylePlanRow(row) {
  const style = row[3] === "メイン" ? 4 : 5;
  return row.map((value, index) => cell(value, index === 6 ? 6 : style));
}

function styledLogRows(athlete = currentAthlete()) {
  const [header, ...rows] = logRows(athlete);
  return [
    header.map((value) => cell(value, 3)),
    ...rows.map((row) => row.map((value) => cell(value, 8)))
  ];
}

function weekSheetRows(cycle, week) {
  const phase = cyclePhase(week, cycle.length, cycle.programMethod);
  const rows = [
    [cell(`W${week} プラン`, 1), "", "", "", "", ""],
    [cell("目的", 7), cell(phase.name, 8), cell("メモ", 7), cell(phase.note, 8), "", ""],
    []
  ];
  weeklyTemplate({ ...cycle, week }).forEach((day, dayIndex) => {
    rows.push([cell(`D${dayIndex + 1} ${day.title}`, 2), "", "", "", "", ""]);
    rows.push(["Day", "種類", "種目", "処方", "メモ"].map((value) => cell(value, 3)));
    day.items.forEach((item) => {
      const prescription = item.kind === "accessory" || item.kind === "method"
        ? { title: item.work, detail: item.note }
        : prescriptionForWeek(item.lift, Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0), week, cycle.length, cycle.daysPerWeek, item.variant, cycle.priorityLift, cycle.buddyLevel);
      const style = item.kind === "accessory" ? 5 : item.variant === "technique" ? 10 : 4;
      rows.push([
        cell(`D${dayIndex + 1}`, style),
        cell(item.kind === "accessory" ? "補助" : "メイン", style),
        cell(item.name, style),
        cell(prescription.title, style),
        cell(prescription.detail, 6)
      ]);
    });
    rows.push([]);
  });
  return rows;
}

function exportPlanWorkbook() {
  const sheets = workbookSheets();
  const blob = createXlsxBlob(sheets);
  downloadBlob(blob, `platform-buddy-plan-${today()}.xlsx`);
}

function exportLogWorkbook() {
  const athlete = currentAthlete();
  const blob = createXlsxBlob([
    { name: "Log", rows: styledLogRows(athlete), widths: [16, 10, 12, 13, 18, 28, 10, 10, 10, 10, 10, 42], freeze: 1, filter: "A1:L1" }
  ]);
  downloadBlob(blob, `platform-buddy-log-${today()}.xlsx`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function createXlsxBlob(sheets) {
  const files = {
    "[Content_Types].xml": contentTypesXml(sheets.length),
    "_rels/.rels": rootRelsXml(),
    "xl/workbook.xml": workbookXml(sheets),
    "xl/_rels/workbook.xml.rels": workbookRelsXml(sheets.length),
    "xl/styles.xml": stylesXml()
  };
  sheets.forEach((sheet, index) => {
    files[`xl/worksheets/sheet${index + 1}.xml`] = worksheetXml(sheet.rows, sheet);
  });
  return new Blob([zipFiles(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

function contentTypesXml(sheetCount) {
  const sheets = Array.from({ length: sheetCount }, (_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets}</Types>`;
}

function rootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
}

function workbookXml(sheets) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map((sheet, index) => `<sheet name="${xmlEscape(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets></workbook>`;
}

function workbookRelsXml(sheetCount) {
  const rels = Array.from({ length: sheetCount }, (_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}<Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="16"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font><font><b/><sz val="11"/><name val="Arial"/></font></fonts><fills count="8"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF151515"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2F6F73"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFEAF3FF"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFF5E6"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF4F4F5"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7F6EE"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FFD8D8D8"/></left><right style="thin"><color rgb="FFD8D8D8"/></right><top style="thin"><color rgb="FFD8D8D8"/></top><bottom style="thin"><color rgb="FFD8D8D8"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="11"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="5" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs></styleSheet>`;
}

function worksheetXml(rows, sheet = {}) {
  const maxCols = Math.max(...rows.map((row) => row.length), 1);
  const lastRef = `${columnName(maxCols - 1)}${Math.max(rows.length, 1)}`;
  const cols = sheet.widths?.length
    ? `<cols>${sheet.widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("")}</cols>`
    : "";
  const freeze = sheet.freeze
    ? `<sheetViews><sheetView workbookViewId="0"><pane ySplit="${sheet.freeze}" topLeftCell="A${sheet.freeze + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
    : "";
  const body = rows.map((row, rowIndex) => (
    `<row r="${rowIndex + 1}">${row.map((cell, colIndex) => cellXml(cell, colIndex, rowIndex)).join("")}</row>`
  )).join("");
  const filter = sheet.filter ? `<autoFilter ref="${sheet.filter}"/>` : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:${lastRef}"/>${freeze}${cols}<sheetData>${body}</sheetData>${filter}</worksheet>`;
}

function cellXml(value, colIndex, rowIndex) {
  const ref = `${columnName(colIndex)}${rowIndex + 1}`;
  const rawValue = typeof value === "object" && value !== null && "value" in value ? value.value : value;
  const style = typeof value === "object" && value !== null && "style" in value ? ` s="${value.style}"` : "";
  if (rawValue === null || rawValue === undefined || rawValue === "") return `<c r="${ref}"${style}/>`;
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) return `<c r="${ref}"${style}><v>${rawValue}</v></c>`;
  return `<c r="${ref}"${style} t="inlineStr"><is><t>${xmlEscape(rawValue)}</t></is></c>`;
}

function columnName(index) {
  let name = "";
  let n = index + 1;
  while (n > 0) {
    const remainder = (n - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

function xmlEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  }[char]));
}

function zipFiles(files) {
  const encoder = new TextEncoder();
  const fileEntries = Object.entries(files).map(([name, content]) => ({ name, bytes: encoder.encode(content) }));
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  fileEntries.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.bytes);
    const localHeader = zipHeader(0x04034b50, file.bytes.length, file.bytes.length, crc, nameBytes.length, 0);
    localParts.push(localHeader, nameBytes, file.bytes);
    const centralHeader = zipCentralHeader(file.bytes.length, file.bytes.length, crc, nameBytes.length, offset);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + file.bytes.length;
  });
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = zipEnd(fileEntries.length, centralSize, offset);
  return concatUint8([...localParts, ...centralParts, end]);
}

function zipHeader(signature, compressedSize, uncompressedSize, crc, nameLength, extraLength) {
  const bytes = new Uint8Array(30);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, signature, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, compressedSize, true);
  view.setUint32(22, uncompressedSize, true);
  view.setUint16(26, nameLength, true);
  view.setUint16(28, extraLength, true);
  return bytes;
}

function zipCentralHeader(compressedSize, uncompressedSize, crc, nameLength, localOffset) {
  const bytes = new Uint8Array(46);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, compressedSize, true);
  view.setUint32(24, uncompressedSize, true);
  view.setUint16(28, nameLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, localOffset, true);
  return bytes;
}

function zipEnd(entryCount, centralSize, centralOffset) {
  const bytes = new Uint8Array(22);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);
  return bytes;
}

function concatUint8(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  return crc >>> 0;
});

document.querySelector("#exportBtn").addEventListener("click", () => {
  exportLogWorkbook();
});

document.querySelector("#exportPlanBtn").addEventListener("click", exportPlanWorkbook);

els.backupExportBtn.addEventListener("click", exportBackup);

els.backupImportBtn.addEventListener("click", () => {
  els.backupFileInput.click();
});

els.backupFileInput.addEventListener("change", () => {
  importBackupFile(els.backupFileInput.files[0]);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

renderExerciseControls();
els.dateInput.value = today();
renderSetRows();
render();
