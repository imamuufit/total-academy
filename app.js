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

const defaultState = {
  currentAthleteId: "me",
  athletes: [
    {
      id: "me",
      name: "自分",
      sex: "male",
      bodyweight: "",
      weightClass: "83",
      meetDate: "",
      cycle: defaultCycle(),
      logs: [
        sampleLog(-14, "power", "squat", 140, 5, 3, 8, "余裕あり"),
        sampleLog(-10, "power", "bench", 95, 5, 4, 8.5, ""),
        sampleLog(-7, "power", "deadlift", 180, 3, 3, 8, ""),
        sampleLog(-4, "back", "lat_pulldown", 65, 10, 3, 8, "広背筋狙い"),
        sampleLog(-3, "power", "squat", 145, 4, 3, 8.5, "")
      ],
      rpeFeedback: {}
    }
  ]
};

let state = loadState();

const els = {
  athleteStrip: document.querySelector("#athleteStrip"),
  currentAthleteName: document.querySelector("#currentAthleteName"),
  sexInput: document.querySelector("#sexInput"),
  bodyweightInput: document.querySelector("#bodyweightInput"),
  weightClassInput: document.querySelector("#weightClassInput"),
  meetDateInput: document.querySelector("#meetDateInput"),
  logForm: document.querySelector("#logForm"),
  dateInput: document.querySelector("#dateInput"),
  categorySelect: document.querySelector("#categorySelect"),
  exerciseSelect: document.querySelector("#exerciseSelect"),
  customExerciseLabel: document.querySelector("#customExerciseLabel"),
  customExerciseInput: document.querySelector("#customExerciseInput"),
  alternativePanel: document.querySelector("#alternativePanel"),
  weightInput: document.querySelector("#weightInput"),
  repsInput: document.querySelector("#repsInput"),
  setsInput: document.querySelector("#setsInput"),
  rpeInput: document.querySelector("#rpeInput"),
  noteInput: document.querySelector("#noteInput"),
  quickStats: document.querySelector("#quickStats"),
  metricGrid: document.querySelector("#metricGrid"),
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
  cycleMethodNote: document.querySelector("#cycleMethodNote"),
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
    accessoryVolume: "normal",
    priorityLift: "total",
    week: 1,
    availableFacilityExercises: [],
    maxes: { squat: "", bench: "", deadlift: "" }
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
  migrated.athletes = (migrated.athletes || []).map((athlete) => ({
    ...athlete,
    sex: ["male", "female"].includes(athlete.sex) ? athlete.sex : "male",
    weightClass: validWeightClass(athlete.sex || "male", athlete.weightClass)
      ? athlete.weightClass
      : inferWeightClass(athlete.sex || "male", athlete.bodyweight),
    cycle: {
      ...defaultCycle(),
      ...(athlete.cycle || {}),
      planTarget: ["big3", "bench_only"].includes((athlete.cycle || {}).planTarget)
        ? athlete.cycle.planTarget
        : "big3",
      programMethod: ["platform", "hps", "531", "smolov_jr"].includes((athlete.cycle || {}).programMethod)
        ? athlete.cycle.programMethod
        : "platform",
      priorityLift: ["total", "squat", "bench", "deadlift"].includes((athlete.cycle || {}).priorityLift)
        ? athlete.cycle.priorityLift
        : "total",
      availableFacilityExercises: Array.isArray((athlete.cycle || {}).availableFacilityExercises)
        ? athlete.cycle.availableFacilityExercises
        : [],
      maxes: { ...defaultCycle().maxes, ...((athlete.cycle || {}).maxes || {}) }
    },
    rpeFeedback: athlete.rpeFeedback || {},
    logs: (athlete.logs || []).map((log) => {
      if (log.exerciseId) {
        const meta = exerciseMeta(log.exerciseId);
        return {
          ...log,
          exerciseName: log.exerciseName || log.exercise || meta.name,
          badge: log.badge || meta.badge
        };
      }
      const exerciseId = log.lift === "accessory" ? "custom" : log.lift;
      const meta = exerciseMeta(exerciseId);
      return {
        ...log,
        category: log.lift === "accessory" ? "custom" : "power",
        exerciseId,
        exerciseName: log.exercise || meta.name,
        badge: meta.badge
      };
    })
  }));
  return migrated;
}

function saveState() {
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
  return Number(log.weight) * Number(log.reps) * Number(log.sets);
}

function sortedLogs(athlete = currentAthlete()) {
  return [...athlete.logs].sort((a, b) => b.date.localeCompare(a.date));
}

function render() {
  const athlete = currentAthlete();
  els.currentAthleteName.textContent = athlete.name;
  athlete.sex = ["male", "female"].includes(athlete.sex) ? athlete.sex : "male";
  athlete.weightClass = validWeightClass(athlete.sex, athlete.weightClass) ? athlete.weightClass : inferWeightClass(athlete.sex, athlete.bodyweight);
  els.sexInput.value = athlete.sex;
  renderWeightClassOptions(athlete);
  els.bodyweightInput.value = athlete.bodyweight || "";
  els.weightClassInput.value = athlete.weightClass;
  els.meetDateInput.value = athlete.meetDate || "";
  renderCycleInputs();
  renderAthletes();
  renderStats();
  renderMetrics();
  renderChartOptions();
  renderHistory();
  renderPlan();
  drawChart();
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
    metric("階級", `${athlete.sex === "female" ? "女性" : "男性"} ${classLabel}`),
    metric("試合まで", meetDays === null ? "-" : `${meetDays}日`)
  ].join("");
}

function metric(label, value) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`;
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
  const logs = sortedLogs().slice(0, 60);
  if (!logs.length) {
    els.historyList.innerHTML = `<p class="history-meta">まだ記録がありません。</p>`;
    return;
  }
  els.historyList.innerHTML = logs.map((log) => {
    const name = log.exerciseName || exerciseMeta(log.exerciseId).name;
    const badge = log.badge || exerciseMeta(log.exerciseId).badge;
    const rpe = log.rpe ? ` RPE ${log.rpe}` : "";
    return `
      <article class="history-item">
        <div>
          <span class="lift-badge">${badge}</span>
          <h2>${escapeHtml(name)} ${log.weight}kg x ${log.reps} x ${log.sets}</h2>
          <p class="history-meta">${log.date}${rpe} / e1RM ${e1rm(log.weight, log.reps)}kg</p>
          ${log.note ? `<p class="history-meta">${escapeHtml(log.note)}</p>` : ""}
        </div>
        <button class="delete-entry" type="button" data-delete="${log.id}" aria-label="記録を削除">×</button>
      </article>
    `;
  }).join("");
}

function renderPlan() {
  const cycle = normalizedCycle();
  const phase = cyclePhase(cycle.week, cycle.length);
  els.cyclePhaseTitle.textContent = `${cycle.length}週中 ${cycle.week}週目 / ${phase.name}`;
  els.cyclePhaseNote.textContent = `${phase.note} ${programMethodInfo(cycle).note}`;
  renderRpeCoach(cycle, phase);
  renderProjections(cycle);

  const missing = activePlanLiftIds(cycle).filter((liftId) => !Number(cycle.maxes[liftId] || bestE1rm(liftId)));
  if (missing.length) {
    els.planList.innerHTML = `<article class="plan-card"><h2>現在1RMを設定</h2><p>${missing.map((id) => mainLiftNames[id]).join(" / ")} の現在1RMを入れると、${programMethodInfo(cycle).label}のメニューが出ます。記録済みe1RMがある種目は自動で補完します。</p></article>`;
    return;
  }

  const insight = planInsight(cycle);
  els.planList.innerHTML = `${insight}${weeklyTemplate(cycle).map((day, index) => `
    <article class="day-card">
      <div class="day-title">
        <span class="lift-badge">Day ${index + 1}</span>
        <h2>${day.title}</h2>
      </div>
      <div class="exercise-list">
        ${day.items.map((item, itemIndex) => exerciseLine(item, cycle, index, itemIndex)).join("")}
      </div>
    </article>
  `).join("")}`;
}

function renderRpeCoach(cycle, phase) {
  const isAccumulation = phase.name === "蓄積期";
  const guide = isAccumulation
    ? "蓄積期はRPEを覚える練習期間です。RPEは限界への近さ、RIRは残り回数です。表示重量は提案なので、予定RPEより重いなら -2.5〜5kg、軽すぎるなら +2.5〜5kgで調整してください。"
    : "表示重量は提案です。予定RPEを超えそうなら重量を下げ、余裕がありすぎる時だけ小さく上げます。RIR目安はRPE理解の補助として使います。";
  els.rpeCoachCard.innerHTML = `
    <div>
      <p class="eyebrow">RPE Coach</p>
      <h3>RPEはきつさ、RIRは残り回数</h3>
    </div>
    <p>${guide}</p>
    <div class="rpe-scale">
      <span><strong>RPE 6</strong> RIR 4目安</span>
      <span><strong>RPE 7</strong> RIR 3目安</span>
      <span><strong>RPE 8</strong> RIR 2目安</span>
      <span><strong>RPE 9</strong> RIR 1目安</span>
    </div>
  `;
}

function activePlanLiftIds(cycle = normalizedCycle()) {
  if (cycle.planTarget === "bench_only") return ["bench"];
  if (cycle.programMethod === "smolov_jr") return [cycle.priorityLift === "squat" ? "squat" : "bench"];
  return mainLiftIds;
}

function programMethodInfo(cycle = normalizedCycle()) {
  const target = cycle.planTarget === "bench_only" ? "ベンチプレスのみ" : "BIG3";
  const info = {
    platform: ["トータルアカデミー式（おすすめ）", "迷ったらこれ。性別、階級、重点種目、設備環境に合わせつつ、忙しさに応じて週3〜5回と補助量を調整できます。RPEを練習しながらPRを狙う、このアプリの標準プランです。"],
    hps: ["HPS（BP向き）", "Hypertrophy → Power → Strength のDUP型。特にベンチ強化との相性が良い方式です。"],
    "531": ["5/3/1（長期型）", "Training Maxを使って堅実に積む長期型。AMRAPは余力を残して止めます。"],
    smolov_jr: ["Smolov Jr.（SQ/BP高負荷）", "3週・週4固定の短期集中高ボリューム方式。SQ/BP向けで、DLには適用しません。補助種目は最小限にします。"]
  }[cycle.programMethod] || ["トータルアカデミー", ""];
  return { label: `${info[0]} / ${target}`, note: info[1] };
}

function methodDefaults(programMethod, planTarget = "big3") {
  const defaults = {
    platform: { length: 12, daysPerWeek: 4, accessoryVolume: "normal", locked: [] },
    hps: { length: 6, daysPerWeek: 3, accessoryVolume: "normal", locked: ["length", "daysPerWeek"] },
    "531": { length: 12, daysPerWeek: planTarget === "bench_only" ? 2 : 4, accessoryVolume: "normal", locked: [] },
    smolov_jr: { length: 3, daysPerWeek: 4, accessoryVolume: "low", locked: ["length", "daysPerWeek", "accessoryVolume"] }
  };
  return defaults[programMethod] || defaults.platform;
}

function allowedCycleLengths(cycle) {
  if (cycle.programMethod === "platform") return [10, 12];
  if (cycle.programMethod === "hps") return [6];
  if (cycle.programMethod === "531") return [4, 8, 12];
  if (cycle.programMethod === "smolov_jr") return [3];
  return [10, 12];
}

function allowedDaysPerWeek(cycle) {
  if (cycle.programMethod === "platform") return [3, 4, 5];
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
  return cycle;
}

function planInsight(cycle) {
  const athlete = currentAthlete();
  const method = programMethodInfo(cycle);
  const balance = liftBalance(cycle, athlete);
  if (!balance && cycle.planTarget === "bench_only") {
    const recommended = cycle.programMethod === "platform" ? `<span class="recommended-badge">迷ったらこれ</span>` : "";
    return `<article class="plan-card ${cycle.programMethod === "platform" ? "recommended-plan" : ""}">${recommended}<h2>${method.label}</h2><p>${method.note}</p></article>`;
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
    <article class="plan-card ${cycle.programMethod === "platform" ? "recommended-plan" : ""}">
      ${cycle.programMethod === "platform" ? `<span class="recommended-badge">迷ったらこれ</span>` : ""}
      <h2>${method.label} / ${athlete.sex === "female" ? "女性" : "男性"} ${classLabel} / 現在トータル ${balance.total}kg</h2>
      <p>${method.note} ${note}</p>
    </article>
  `;
}

function renderCycleInputs() {
  const cycle = normalizedCycle();
  els.planTargetInput.value = cycle.planTarget;
  els.programMethodInput.value = cycle.programMethod;
  updateCycleOptionControls(cycle);
  els.cycleLengthInput.value = String(cycle.length);
  els.daysPerWeekInput.value = String(cycle.daysPerWeek);
  els.accessoryVolumeInput.value = cycle.accessoryVolume;
  els.priorityLiftInput.value = cycle.priorityLift;
  els.cycleMethodNote.textContent = methodControlNote(cycle);
  els.programDisclaimer.textContent = programDisclaimerText(cycle);
  els.programDisclaimer.classList.toggle("hidden", cycle.programMethod === "platform");
  els.cycleWeekInput.max = String(cycle.length);
  els.cycleWeekInput.value = String(cycle.week);
  els.squatMaxInput.value = cycle.maxes.squat || "";
  els.benchMaxInput.value = cycle.maxes.bench || "";
  els.deadliftMaxInput.value = cycle.maxes.deadlift || "";
  renderFacilityOptions(cycle);
}

function updateCycleOptionControls(cycle) {
  const lengthLabels = { 3: "3週", 4: "4週", 6: "6週", 8: "8週", 10: "10週", 12: "12週" };
  const dayLabels = { 1: "週1回", 2: "週2回", 3: "週3回", 4: "週4回", 5: "週5回" };
  els.cycleLengthInput.innerHTML = allowedCycleLengths(cycle).map((value) => `<option value="${value}">${lengthLabels[value]}</option>`).join("");
  els.daysPerWeekInput.innerHTML = allowedDaysPerWeek(cycle).map((value) => `<option value="${value}">${dayLabels[value]}</option>`).join("");
  const defaults = methodDefaults(cycle.programMethod, cycle.planTarget);
  els.cycleLengthInput.disabled = defaults.locked.includes("length");
  els.daysPerWeekInput.disabled = defaults.locked.includes("daysPerWeek");
  els.accessoryVolumeInput.disabled = defaults.locked.includes("accessoryVolume");
}

function methodControlNote(cycle) {
  const locked = methodDefaults(cycle.programMethod, cycle.planTarget).locked;
  if (!locked.length) return "この方式では週数・頻度を選択できます。";
  if (cycle.programMethod === "hps") return "HPSは6週・週3回固定です。Hypertrophy → Power → Strengthの順で回します。";
  if (cycle.programMethod === "smolov_jr") return "Smolov Jr.は3週・週4回・補助少なめ固定です。SQ/BP向けで、DLには適用しません。";
  return "この方式では一部の設定が固定されます。";
}

function programDisclaimerText(cycle) {
  if (cycle.programMethod === "platform") return "";
  return "注記: HPS、5/3/1、Smolov Jr.は各メソッドの考え方を参考にしたトータルアカデミー用の簡略テンプレートです。公式プログラムの完全再現、公式提携、公式承認を示すものではありません。";
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
  athlete.cycle.programMethod = ["platform", "hps", "531", "smolov_jr"].includes(athlete.cycle.programMethod) ? athlete.cycle.programMethod : "platform";
  athlete.cycle.accessoryVolume = athlete.cycle.accessoryVolume || "normal";
  athlete.cycle.priorityLift = ["total", "squat", "bench", "deadlift"].includes(athlete.cycle.priorityLift)
    ? athlete.cycle.priorityLift
    : "total";
  athlete.cycle.week = Math.min(Number(athlete.cycle.week || 1), athlete.cycle.length);
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
  cycle.programMethod = els.programMethodInput.value;
  cycle.accessoryVolume = els.accessoryVolumeInput.value;
  cycle.priorityLift = els.priorityLiftInput.value;
  cycle.week = Math.min(Math.max(Number(els.cycleWeekInput.value || 1), 1), cycle.length);
  cycle.availableFacilityExercises = [...els.facilityGrid.querySelectorAll("input:checked")].map((input) => input.value);
  cycle.maxes = {
    squat: els.squatMaxInput.value,
    bench: els.benchMaxInput.value,
    deadlift: els.deadliftMaxInput.value
  };
  applyProgramRules(cycle, previousMethod, previousTarget);
  saveState();
  render();
}

function cyclePhase(week, length) {
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
  return {
    name: "PRテスト",
    note: "疲労を抜いてPRを試す週。第1試技、第2試技、PR挑戦の流れで安全に更新を狙う。"
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
    return `<div class="exercise-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.work)}</span><p>${escapeHtml(item.note)}</p>${actualInputBlock(item, cycle, item.work, item.note, dayIndex, itemIndex)}</div>`;
  }
  if (item.kind === "accessory") {
    const badge = item.exerciseId && equipmentLabel(item.exerciseId)
      ? `<em class="equipment-tag">${equipmentLabel(item.exerciseId)}</em>`
      : "";
    return `<div class="exercise-row"><strong>${escapeHtml(item.name)}${badge}</strong><span>${item.work}</span><p>${item.note}</p></div>`;
  }
  const max = Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0);
  const prescription = prescriptionForWeek(item.lift, max, cycle.week, cycle.length, cycle.daysPerWeek, item.variant, cycle.priorityLift);
  return `<div class="exercise-row"><strong>${item.name}</strong><span>${prescription.title}</span><p>${prescription.detail}</p>${actualInputBlock(item, cycle, prescription.title, prescription.detail, dayIndex, itemIndex)}</div>`;
}

function actualInputBlock(item, cycle, planText, detail, dayIndex, itemIndex) {
  const target = plannedTopSet(planText, detail);
  const key = planFeedbackKey(cycle, dayIndex, itemIndex, item.lift, item.name);
  const saved = currentAthlete().rpeFeedback?.[key];
  const previous = previousFeedbackMarkup(cycle, item);
  const feedback = saved ? feedbackMarkup(saved) : "";
  return `
    <div class="actual-box" data-plan-key="${escapeHtml(key)}" data-lift="${escapeHtml(item.lift || "custom")}" data-exercise="${escapeHtml(item.name)}" data-planned-rpe="${target.rpe || ""}">
      <div class="actual-title">
        <strong>実績入力</strong>
        <span>${target.rpe ? `予定 @${target.rpe}` : "RPE判定"}</span>
      </div>
      ${previous}
      <div class="actual-grid">
        <label>kg<input class="actual-weight" inputmode="decimal" type="number" min="0" step="0.5" value="${saved?.weight ?? target.weight ?? ""}"></label>
        <label>回数<input class="actual-reps" inputmode="numeric" type="number" min="1" step="1" value="${saved?.reps ?? target.reps ?? ""}"></label>
        <label>RPE<input class="actual-rpe" inputmode="decimal" type="number" min="5" max="10" step="0.5" value="${saved?.rpe ?? ""}"></label>
        <button class="text-button compact actual-save" type="button">記録</button>
      </div>
      ${feedback}
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
  return [cycle.programMethod, cycle.planTarget, `w${cycle.week}`, `d${dayIndex + 1}`, itemIndex + 1, lift || "custom", name].join("|");
}

function feedbackMarkup(feedback) {
  return `<p class="rpe-feedback ${feedback.status}">${escapeHtml(feedback.message)}</p>`;
}

function previousFeedbackMarkup(cycle, item) {
  if (cycle.week <= 1 || !item.lift) return "";
  const previous = findPreviousFeedback(cycle, item);
  if (!previous) return "";
  const planned = previous.plannedRpe ? `@${previous.plannedRpe}` : "RPE未設定";
  const actual = previous.rpe ? `@${previous.rpe}` : "RPE未入力";
  const adjustment = previousAdjustmentMessage(previous);
  return `
    <div class="previous-rpe ${previous.status}">
      <strong>前回メモ</strong>
      <span>前回は ${planned} 予定が ${actual} でした。${adjustment}</span>
    </div>
  `;
}

function findPreviousFeedback(cycle, item) {
  const feedback = currentAthlete().rpeFeedback || {};
  const prefix = [cycle.programMethod, cycle.planTarget, `w${cycle.week - 1}`].join("|");
  return Object.entries(feedback)
    .filter(([key, value]) => key.startsWith(prefix) && value.lift === item.lift)
    .map(([, value]) => value)
    .at(-1);
}

function previousAdjustmentMessage(feedback) {
  if (feedback.status === "heavy") return "今週は提案重量から -2.5〜5kg を推奨します。";
  if (feedback.status === "warn") return "今週は提案重量から -2.5kg を検討してください。";
  if (feedback.status === "light") return "軽く感じていたので +2.5kg、最大でも +5kg までなら検討できます。";
  return "今週も提案重量を基準に、予定RPEを守りましょう。";
}

function prescriptionForWeek(liftId, max, week, length, daysPerWeek, variant = "main", priorityLift = "total") {
  const phase = cyclePhase(week, length).name;
  const intensity = intensityForWeek(week, length);
  const variantScale = { main: 1, volume: 0.92, technique: 0.85, light: 0.78 }[variant] || 1;
  const topWeight = roundToIncrement(max * intensity.top * variantScale, 2.5);
  const backoffWeight = roundToIncrement(topWeight * intensity.backoff, 2.5);
  const prRange = projectedPrRange(liftId, max, length, daysPerWeek, priorityLift);

  if (phase === "PRテスト") {
    return {
      title: `第一 @6 / 第二 @7.5 / 第三 ${prRange.low}〜${prRange.high}kg`,
      detail: "白9本を優先。第一と第二は当日の感覚で確実に通し、第三だけPR候補から選ぶ。"
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
    detail: phase === "蓄積期"
      ? "RPE練習週。重く感じたら-2.5〜5kg、軽すぎる時だけ+2.5〜5kg。"
      : "次週につながる良い反復を優先。上振れ狙いではなく予定RPEで止める。"
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
  if (cycle.programMethod === "hps") return hpsTemplate(cycle);
  if (cycle.programMethod === "531") return fiveThreeOneTemplate(cycle);
  if (cycle.programMethod === "smolov_jr") return smolovJrTemplate(cycle);

  const phase = cyclePhase(cycle.week, cycle.length).name;
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
    return {
      ...focusedDay,
      items: adjustAccessories(focusedDay, accessoryLimit, cycle)
    };
  });
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

function accessoryLimitFor(daysPerWeek, accessoryVolume, phase) {
  if (phase === "PRテスト") return 0;
  const base = {
    3: { low: 2, normal: 3, high: 4 },
    4: { low: 1, normal: 2, high: 3 },
    5: { low: 1, normal: 1, high: 2 }
  }[daysPerWeek]?.[accessoryVolume] ?? 2;

  if (phase === "ピーキング期") return Math.max(0, base - 1);
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
    const availableItem = availableAccessory(item, cycle);
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

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button === tab));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    document.querySelector(`#${tab.dataset.view}View`).classList.add("active");
    drawChart();
  });
});

els.categorySelect.addEventListener("change", renderExerciseOptions);
els.exerciseSelect.addEventListener("change", updateCustomExerciseVisibility);
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
  const button = event.target.closest(".actual-save");
  if (!button) return;
  const box = button.closest(".actual-box");
  const weight = Number(box.querySelector(".actual-weight").value);
  const reps = Number(box.querySelector(".actual-reps").value);
  const rpe = Number(box.querySelector(".actual-rpe").value);
  if (!weight || !reps || !rpe) return;

  const athlete = currentAthlete();
  const lift = box.dataset.lift;
  const exerciseName = box.dataset.exercise;
  const plannedRpe = Number(box.dataset.plannedRpe || 0);
  const feedback = rpeAdjustmentFeedback(plannedRpe, rpe);
  athlete.rpeFeedback = athlete.rpeFeedback || {};
  athlete.rpeFeedback[box.dataset.planKey] = {
    weight,
    reps,
    rpe,
    plannedRpe,
    lift,
    exerciseName,
    status: feedback.status,
    message: feedback.message
  };
  const meta = exerciseMeta(lift);
  athlete.logs.push({
    id: crypto.randomUUID(),
    date: today(),
    category: exerciseCategoryId(lift) || "custom",
    exerciseId: lift,
    exerciseName,
    badge: meta.badge,
    weight,
    reps,
    sets: 1,
    rpe,
    note: plannedRpe ? `予定RPE ${plannedRpe} / ${feedback.message}` : feedback.message
  });
  saveState();
  render();
});

function rpeAdjustmentFeedback(plannedRpe, actualRpe) {
  if (!plannedRpe) {
    return { status: "ok", message: "記録しました。次回もフォームと余力をメモしてRPE感覚を育てましょう。" };
  }
  const diff = actualRpe - plannedRpe;
  if (diff >= 1.5) return { status: "heavy", message: `重すぎ。予定よりRPE +${diff.toFixed(1)}。次回は -5kg、バックオフも軽め推奨。` };
  if (diff >= 0.75) return { status: "warn", message: `やや重い。予定よりRPE +${diff.toFixed(1)}。次回は -2.5kg 推奨。` };
  if (diff <= -1.5) return { status: "light", message: `軽すぎ。予定よりRPE ${diff.toFixed(1)}。次回は +2.5〜5kg まで。` };
  if (diff <= -0.75) return { status: "light", message: `少し軽い。予定よりRPE ${diff.toFixed(1)}。次回は +2.5kg まで。` };
  return { status: "ok", message: `予定通り。RPE差 ${diff >= 0 ? "+" : ""}${diff.toFixed(1)}。この感覚を基準にしましょう。` };
}

els.logForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const athlete = currentAthlete();
  const exerciseId = els.exerciseSelect.value;
  const meta = exerciseMeta(exerciseId);
  const exerciseName = exerciseId === "custom" ? els.customExerciseInput.value.trim() : meta.name;
  athlete.logs.push({
    id: crypto.randomUUID(),
    date: els.dateInput.value,
    category: els.categorySelect.value,
    exerciseId,
    exerciseName,
    badge: exerciseId === "custom" ? "自由" : meta.badge,
    weight: Number(els.weightInput.value),
    reps: Number(els.repsInput.value),
    sets: Number(els.setsInput.value),
    rpe: els.rpeInput.value ? Number(els.rpeInput.value) : "",
    note: els.noteInput.value.trim()
  });
  saveState();
  els.logForm.reset();
  els.dateInput.value = today();
  els.setsInput.value = "1";
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

els.meetDateInput.addEventListener("change", () => {
  currentAthlete().meetDate = els.meetDateInput.value;
  saveState();
  renderMetrics();
});

document.querySelector("#addAthleteBtn").addEventListener("click", () => {
  els.athleteNameInput.value = "";
  els.athleteDialog.showModal();
});

document.querySelector("#cancelAthleteBtn").addEventListener("click", () => {
  els.athleteDialog.close();
});

els.athleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = els.athleteNameInput.value.trim();
  if (!name) return;
  const athlete = { id: crypto.randomUUID(), name, sex: "male", bodyweight: "", weightClass: "83", meetDate: "", cycle: defaultCycle(), logs: [] };
  state.athletes.push(athlete);
  state.currentAthleteId = athlete.id;
  saveState();
  els.athleteDialog.close();
  render();
});

els.historyList.addEventListener("click", (event) => {
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
els.facilityGrid.addEventListener("change", updateCycleFromInputs);
document.querySelector("#prevWeekBtn").addEventListener("click", () => {
  const cycle = normalizedCycle();
  cycle.week = Math.max(cycle.week - 1, 1);
  saveState();
  render();
});
document.querySelector("#nextWeekBtn").addEventListener("click", () => {
  const cycle = normalizedCycle();
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
  els.cycleWeekInput,
  els.squatMaxInput,
  els.benchMaxInput,
  els.deadliftMaxInput
].forEach((input) => {
  input.addEventListener("change", updateCycleFromInputs);
});

els.chartLiftSelect.addEventListener("change", drawChart);

function logRows(athlete = currentAthlete()) {
  return [
    ["選手", "性別", "階級", "日付", "カテゴリ", "種目", "重量", "回数", "セット", "RPE", "e1RM", "メモ"],
    ...athlete.logs.map((log) => [
      athlete.name,
      athlete.sex === "female" ? "女性" : "男性",
      weightClassMeta(athlete.sex || "male", athlete.weightClass || inferWeightClass(athlete.sex || "male", athlete.bodyweight))[1],
      log.date,
      exerciseCatalog[log.category]?.label || log.category,
      log.exerciseName || exerciseMeta(log.exerciseId).name,
      log.weight,
      log.reps,
      log.sets,
      log.rpe,
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
        : prescriptionForWeek(item.lift, Number(weekCycle.maxes[item.lift] || bestE1rm(item.lift) || 0), week, weekCycle.length, weekCycle.daysPerWeek, item.variant, weekCycle.priorityLift);
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
  const phase = cyclePhase(cycle.week, cycle.length);
  const balance = liftBalance(cycle, athlete);
  const classLabel = weightClassMeta(athlete.sex, athlete.weightClass)[1];
  const maxRows = activePlanLiftIds(cycle).map((liftId) => {
    const max = Number(cycle.maxes[liftId] || bestE1rm(liftId) || 0);
    const range = max ? projectedPrRange(liftId, max, cycle.length, cycle.daysPerWeek, cycle.priorityLift, athlete) : { low: "-", high: "-" };
    return [mainLiftNames[liftId], max || "-", `${range.low}〜${range.high}`];
  });
  const summary = [
    [cell("トータルアカデミー プラン概要", 1), "", "", ""],
    [cell("選手", 7), cell(athlete.name, 8), cell("現在週", 7), cell(`${cycle.week}週目 / ${phase.name}`, 8)],
    [cell("性別", 7), cell(athlete.sex === "female" ? "女性" : "男性", 8), cell("階級", 7), cell(classLabel, 8)],
    [cell("体重", 7), cell(athlete.bodyweight ? `${athlete.bodyweight}kg` : "-", 8), cell("対象", 7), cell(cycle.planTarget === "bench_only" ? "ベンチプレスのみ" : "BIG3", 8)],
    [cell("プラン方式", 7), cell(programMethodInfo(cycle).label, 8), cell("重点種目", 7), cell(cycle.priorityLift === "total" ? "トータル重視" : `${mainLiftNames[cycle.priorityLift]}重視`, 8)],
    [cell("週数", 7), cell(`${cycle.length}週`, 8), cell("週頻度", 7), cell(`週${cycle.daysPerWeek}回`, 8)],
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
  const phase = cyclePhase(week, cycle.length);
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
        : prescriptionForWeek(item.lift, Number(cycle.maxes[item.lift] || bestE1rm(item.lift) || 0), week, cycle.length, cycle.daysPerWeek, item.variant, cycle.priorityLift);
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
  downloadBlob(blob, `total-academy-plan-${today()}.xlsx`);
}

function exportLogWorkbook() {
  const athlete = currentAthlete();
  const blob = createXlsxBlob([
    { name: "Log", rows: styledLogRows(athlete), widths: [16, 10, 12, 13, 18, 28, 10, 10, 10, 10, 10, 42], freeze: 1, filter: "A1:L1" }
  ]);
  downloadBlob(blob, `total-academy-log-${today()}.xlsx`);
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

renderExerciseControls();
els.dateInput.value = today();
render();
