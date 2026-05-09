const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const titleScreen = document.getElementById("titleScreen");
const gameScreen = document.getElementById("gameScreen");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const retryButton = document.getElementById("retryButton");
const scoreEl = document.getElementById("score");
const onikuNameEl = document.getElementById("onikuName");
const onikuIconEl = document.getElementById("onikuIcon");
const coachCommentEl = document.getElementById("coachComment");
const nextIconEl = document.getElementById("nextIcon");
const nextNameEl = document.getElementById("nextName");
const gameOverPanel = document.getElementById("gameOverPanel");
const comboText = document.getElementById("comboText");
const stageTrackEl = document.getElementById("stageTrack");
const boardWrapEl = document.querySelector(".board-wrap");
const coachFaceEl = document.querySelector(".coach-face");
const gameLogoEl = document.querySelector(".game-logo");
const titleLogoImageEl = document.getElementById("titleLogoImage");

const BASE_WIDTH = 420;
const BASE_HEIGHT = 620;
const DROP_Y = 42;
const GAME_OVER_LINE = 88;
const GRAVITY = 0.22;
const FRICTION = 0.992;
const BOUNCE = 0.18;
const SPECIAL_CHANCE = 0.11;
const ASSET_VERSION = "20260509-04";
const imageCache = new Map();
const failedAssets = new Set();
let loadedAssetCount = 0;

const normalIcons = [
  { id: "water", name: "水ボトル", shortName: "水", imageKey: "icon-water", assetPath: "assets/icons/icon_water.png", emoji: "💧", radius: 22, color: "#79d9ff", outline: "#257aa8", score: 10 },
  { id: "towel", name: "タオル", shortName: "タオル", imageKey: "icon-towel", assetPath: "assets/icons/icon_towel.png", emoji: "🧻", radius: 26, color: "#ffffff", outline: "#ff8fa8", score: 24 },
  { id: "shaker", name: "プロテインシェイカー", shortName: "シェイカー", imageKey: "icon-shaker", assetPath: "assets/icons/icon_shaker.png", emoji: "🥤", radius: 30, color: "#ffd166", outline: "#d98600", score: 52 },
  { id: "dumbbell", name: "ダンベル", shortName: "DB", imageKey: "icon-dumbbell", assetPath: "assets/icons/icon_dumbbell.png", emoji: "🏋️", radius: 35, color: "#a7e8bd", outline: "#2f8f60", score: 110 },
  { id: "kettlebell", name: "ケトルベル", shortName: "KB", imageKey: "icon-kettlebell", assetPath: "assets/icons/icon_kettlebell.png", emoji: "🔔", radius: 40, color: "#c8b6ff", outline: "#6847b8", score: 230 },
  { id: "plate", name: "プレート", shortName: "皿", imageKey: "icon-plate", assetPath: "assets/icons/icon_plate.png", emoji: "⚙️", radius: 46, color: "#d7dce5", outline: "#5f6876", score: 480 },
  { id: "barbell", name: "バーベル", shortName: "バー", imageKey: "icon-barbell", assetPath: "assets/icons/icon_barbell.png", emoji: "🏋️‍♂️", radius: 52, color: "#ffb36c", outline: "#b14e1e", score: 990 },
  { id: "rack", name: "パワーラック", shortName: "ラック", imageKey: "icon-rack", assetPath: "assets/icons/icon_rack.png", emoji: "▣", radius: 60, color: "#f15d5d", outline: "#263154", score: 2100 },
];

const specialIcons = [
  { id: "shiba", name: "柴犬アイコン", shortName: "おにく", imageKey: "icon-shiba", assetPath: "assets/icons/icon_shiba.png", emoji: "🐕", radius: 30, color: "#f7943d", outline: "#b84e22", score: 120, kind: "special", effect: "upgradeNearby" },
  { id: "macho", name: "マッチョマンアイコン", shortName: "マッチョ", imageKey: "icon-macho", assetPath: "assets/icons/icon_macho.png", emoji: "💪", radius: 34, color: "#d9a1ff", outline: "#9a3fc7", score: 150, kind: "special", effect: "bumpNearby" },
  { id: "lifter", name: "パワーリフターアイコン", shortName: "リフター", imageKey: "icon-lifter", assetPath: "assets/icons/icon_lifter.png", emoji: "🏆", radius: 34, color: "#2d2f38", outline: "#e94d46", score: 180, kind: "special", effect: "pressDown" },
  { id: "coach", name: "ごすじんアイコン", shortName: "ごすじん", imageKey: "icon-coach", assetPath: "assets/icons/icon_coach.png", emoji: "🏃‍♀️", radius: 30, color: "#ffb6d0", outline: "#263154", score: 130, kind: "special", effect: "rerollOrTidy" },
];

const onikuStages = [
  { name: "ふつうのおにく君", shortName: "ふつう", imageKey: "oniku-stage-01", assetPath: "assets/characters/oniku/oniku_stage_01_normal.png", icon: "🐕", score: 0 },
  { name: "やる気おにく君", shortName: "やる気", imageKey: "oniku-stage-02", assetPath: "assets/characters/oniku/oniku_stage_02_motivated.png", icon: "🐕‍🦺", score: 180 },
  { name: "フィットネスおにく君", shortName: "フィットネス", imageKey: "oniku-stage-03", assetPath: "assets/characters/oniku/oniku_stage_03_fitness.png", icon: "🎽", score: 480 },
  { name: "マッスルおにく君", shortName: "マッスル", imageKey: "oniku-stage-04", assetPath: "assets/characters/oniku/oniku_stage_04_muscle.png", icon: "💪", score: 980 },
  { name: "パワーしば", shortName: "パワー", imageKey: "oniku-stage-05", assetPath: "assets/characters/oniku/oniku_stage_05_power_shiba.png", icon: "🔥", score: 1700 },
  { name: "マッチョしば", shortName: "マッチョ", imageKey: "oniku-stage-06", assetPath: "assets/characters/oniku/oniku_stage_06_macho_shiba.png", icon: "🏋️", score: 2800 },
  { name: "リフターしば", shortName: "リフター", imageKey: "oniku-stage-07", assetPath: "assets/characters/oniku/oniku_stage_07_lifter_shiba.png", icon: "🏆", score: 4300 },
  { name: "わんモア・ビースト", shortName: "ビースト", imageKey: "oniku-stage-08", assetPath: "assets/characters/oniku/oniku_stage_08_one_more_beast.png", icon: "⚡", score: 6200 },
];

const CHARACTER_ASSETS = {
  coach: {
    idle: "assets/characters/coach/char_coach_idle.png",
    cheer: "assets/characters/coach/char_coach_cheer.png",
    surprise: "assets/characters/coach/char_coach_surprise.png",
    worry: "assets/characters/coach/char_coach_worry.png",
    happy: "assets/characters/coach/char_coach_happy.png",
  },
  macho: {
    flex: "assets/characters/macho/char_macho_flex.png",
    excited: "assets/characters/macho/char_macho_excited.png",
  },
  lifter: {
    focus: "assets/characters/lifter/char_lifter_focus.png",
    approve: "assets/characters/lifter/char_lifter_approve.png",
  },
};

const UI_ASSETS = {
  logo: "assets/ui/logo_wanwan_one_more_rep.png",
};

const BACKGROUND_ASSETS = {
  title: "assets/backgrounds/bg_title_gym_outside.png",
  game: "assets/backgrounds/bg_game_mystery_gym.png",
  evolution: "assets/backgrounds/bg_evolution_burst.png",
};

const comments = {
  normal: ["いい感じだよ、おにく！", "まだいけるよ！", "あともうわんレップ！", "その調子！", "しっぽ上がってるよ！"],
  merge: ["ナイス合体！", "今のいいリズム！", "おにく、成長してる！", "ワンモアレップ！"],
  pinch: ["あわてなくて大丈夫！", "まだ巻き返せるよ！", "落ち着いていこう！", "おにくならできる！"],
  evolve: ["えっ！？おにく、たくましくなってない！？", "すごいよ、おにく！", "どんどん変わっていくね！", "でも顔はいつものおにくだね！"],
};

const audioHooks = {
  drop: () => {},
  merge: () => {},
  special: () => {},
  gameOver: () => {},
};

let pieces = [];
let currentDrop = null;
let nextIcon = null;
let dropX = BASE_WIDTH / 2;
let canDrop = true;
let isGameOver = false;
let score = 0;
let currentStageIndex = 0;
let comboCount = 0;
let pieceId = 0;
let animationId = null;
let normalCommentTimer = null;
let lastTime = 0;

function setupCanvasDpr() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = BASE_WIDTH * dpr;
  canvas.height = BASE_HEIGHT * dpr;
  canvas.style.aspectRatio = `${BASE_WIDTH} / ${BASE_HEIGHT}`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function versionAssetPath(src) {
  if (!src) return null;
  return `${src}${src.includes("?") ? "&" : "?"}v=${ASSET_VERSION}`;
}

function preloadImage(key, src) {
  if (!key || !src || imageCache.has(key) || failedAssets.has(key)) return;
  const image = new Image();
  image.onload = () => {
    imageCache.set(key, image);
    loadedAssetCount += 1;
    console.info("Asset loaded:", src);
    updateAssetDrivenUI();
  };
  image.onerror = () => {
    failedAssets.add(key);
    console.warn("Asset failed to load:", src);
  };
  image.src = versionAssetPath(src);
}

function getCachedImage(key) {
  return imageCache.get(key) || null;
}

function preloadGameAssets() {
  [...normalIcons, ...specialIcons].forEach((icon) => preloadImage(icon.imageKey, icon.assetPath));
  onikuStages.forEach((stage) => preloadImage(stage.imageKey, stage.assetPath));
  Object.entries(CHARACTER_ASSETS.coach).forEach(([state, src]) => preloadImage(`coach-${state}`, src));
  Object.entries(CHARACTER_ASSETS.macho).forEach(([state, src]) => preloadImage(`macho-${state}`, src));
  Object.entries(CHARACTER_ASSETS.lifter).forEach(([state, src]) => preloadImage(`lifter-${state}`, src));
  Object.entries(UI_ASSETS).forEach(([key, src]) => preloadImage(`ui-${key}`, src));
  Object.entries(BACKGROUND_ASSETS).forEach(([key, src]) => preloadImage(`bg-${key}`, src));
}

function updateAssetDrivenUI() {
  updateNextUI();
  updateOnikuStageVisual();
  updateCoachVisual();
  updateStageTrack();
  updateTitleLogo();
  updateBackgroundAssets();
  console.info(`Assets ready: ${loadedAssetCount} loaded, ${failedAssets.size} failed`);
}

function getCoachAssetState(type = "normal") {
  const stateByType = {
    normal: "idle",
    merge: "cheer",
    cheer: "cheer",
    evolve: "surprise",
    pinch: "worry",
    danger: "worry",
    success: "happy",
  };
  return stateByType[type] || "idle";
}

function updateCoachVisual(type = "normal") {
  if (!coachFaceEl) return;
  const state = getCoachAssetState(type);
  const image = getCachedImage(`coach-${state}`);
  coachFaceEl.innerHTML = image ? `<img src="${image.src}" alt="ごすじん">` : "🏃‍♀️";
}

function updateTitleLogo() {
  if (!titleLogoImageEl || !gameLogoEl) return;
  const image = getCachedImage("ui-logo");
  titleLogoImageEl.classList.toggle("is-loaded", Boolean(image));
  gameLogoEl.classList.toggle("is-replaced", Boolean(image));
  if (image && titleLogoImageEl.src !== image.src) {
    titleLogoImageEl.src = image.src;
  }
}

function applyAssetBackground(element, key) {
  if (!element) return;
  const image = getCachedImage(`bg-${key}`);
  element.classList.toggle("has-asset-bg", Boolean(image));
  if (image) {
    element.style.setProperty("--asset-bg", `url("${image.src}")`);
  } else {
    element.style.removeProperty("--asset-bg");
  }
}

function updateBackgroundAssets() {
  applyAssetBackground(titleScreen, "title");
  applyAssetBackground(gameScreen, "game");
  const evolutionImage = getCachedImage("bg-evolution");
  boardWrapEl.classList.toggle("has-evolution-bg", Boolean(evolutionImage));
  if (evolutionImage) {
    boardWrapEl.style.setProperty("--evolution-bg", `url("${evolutionImage.src}")`);
  } else {
    boardWrapEl.style.removeProperty("--evolution-bg");
  }
}

function pickNextIcon() {
  if (Math.random() < SPECIAL_CHANCE) return { ...pickRandom(specialIcons) };
  const poolSize = Math.min(5, 2 + Math.floor(score / 800));
  return { ...pickRandom(normalIcons.slice(0, poolSize)) };
}

function createPiece(icon, x, y, held = false) {
  return {
    id: pieceId++,
    icon,
    x,
    y,
    vx: 0,
    vy: held ? 0 : 1,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.03,
    held,
    merging: false,
    usedSpecial: false,
    bornAt: performance.now(),
  };
}

function setCoachComment(type) {
  coachCommentEl.textContent = pickRandom(comments[type] || comments.normal);
  updateCoachVisual(type);
}

function updateNextUI() {
  if (!nextIcon) return;
  const image = getCachedImage(nextIcon.imageKey);
  nextIconEl.classList.toggle("has-image", Boolean(image));
  nextIconEl.innerHTML = image
    ? `<img class="next-art" src="${image.src}" alt=""><span class="next-short">${nextIcon.shortName}</span>`
    : `<span class="next-short">${nextIcon.shortName}</span>`;
  nextIconEl.style.borderColor = nextIcon.outline;
  nextIconEl.style.background = nextIcon.color;
  nextNameEl.textContent = nextIcon.name;
}

function updateScore(points) {
  score += points;
  scoreEl.textContent = score.toLocaleString("ja-JP");
  updateOnikuStage();
}

function updateOnikuStage() {
  let newIndex = currentStageIndex;
  for (let i = onikuStages.length - 1; i >= 0; i -= 1) {
    if (score >= onikuStages[i].score) {
      newIndex = i;
      break;
    }
  }

  if (newIndex !== currentStageIndex) {
    currentStageIndex = newIndex;
    setCoachComment("evolve");
    showEvolutionEffect(onikuStages[currentStageIndex].name);
    onikuNameEl.classList.remove("stage-pop");
    void onikuNameEl.offsetWidth;
    onikuNameEl.classList.add("stage-pop");
  }

  onikuNameEl.textContent = onikuStages[currentStageIndex].name;
  updateOnikuStageVisual();
  updateStageTrack();
}

function updateOnikuStageVisual() {
  const stage = onikuStages[currentStageIndex];
  if (!stage) return;
  const image = getCachedImage(stage.imageKey);
  onikuIconEl.innerHTML = image ? `<img src="${image.src}" alt="">` : stage.icon;
}

function initializeStageTrack() {
  stageTrackEl.innerHTML = onikuStages
    .map(
      (stage, index) => `
        <div class="stage-node" data-stage="${index}">
          <img class="stage-thumb" alt="">
          <b>${stage.icon}</b>
          <small>${stage.shortName}</small>
        </div>
      `,
    )
    .join("");
  updateStageTrack();
}

function updateStageTrack() {
  if (!stageTrackEl) return;
  stageTrackEl.querySelectorAll(".stage-node").forEach((node, index) => {
    const stage = onikuStages[index];
    const image = getCachedImage(stage.imageKey);
    const thumb = node.querySelector(".stage-thumb");
    if (image && thumb) thumb.src = image.src;
    node.classList.toggle("has-image", Boolean(image));
    node.classList.toggle("is-current", index === currentStageIndex);
    node.classList.toggle("is-cleared", index < currentStageIndex);
  });
}

function prepareDrop() {
  currentDrop = createPiece(nextIcon, dropX, DROP_Y, true);
  pieces.push(currentDrop);
  nextIcon = pickNextIcon();
  updateNextUI();
}

function dropCurrentIcon() {
  if (!canDrop || isGameOver || !currentDrop) return;
  currentDrop.held = false;
  currentDrop.vy = 1.4;
  currentDrop = null;
  canDrop = false;
  audioHooks.drop();
  setTimeout(() => {
    if (!isGameOver) {
      canDrop = true;
      prepareDrop();
    }
  }, 520);
}

function moveDrop(clientX) {
  if (!currentDrop || isGameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * BASE_WIDTH;
  dropX = Math.max(30, Math.min(BASE_WIDTH - 30, x));
  currentDrop.x = dropX;
}

function physicsStep() {
  for (const piece of pieces) {
    if (piece.held || piece.merging) continue;
    piece.vy += GRAVITY;
    piece.vx *= FRICTION;
    piece.vy *= FRICTION;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.angle += piece.spin + piece.vx * 0.001;
    resolveWalls(piece);
  }

  for (let pass = 0; pass < 5; pass += 1) {
    for (let i = 0; i < pieces.length; i += 1) {
      for (let j = i + 1; j < pieces.length; j += 1) {
        resolvePieceCollision(pieces[i], pieces[j]);
      }
    }
  }
}

function resolveWalls(piece) {
  const r = piece.icon.radius;
  if (piece.x - r < 0) {
    piece.x = r;
    piece.vx = Math.abs(piece.vx) * BOUNCE;
  }
  if (piece.x + r > BASE_WIDTH) {
    piece.x = BASE_WIDTH - r;
    piece.vx = -Math.abs(piece.vx) * BOUNCE;
  }
  if (piece.y + r > BASE_HEIGHT) {
    piece.y = BASE_HEIGHT - r;
    piece.vy = -Math.abs(piece.vy) * BOUNCE;
    piece.vx *= 0.94;
    piece.spin *= 0.86;
  }
}

function resolvePieceCollision(a, b) {
  if (a.merging || b.merging) return;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 0.001;
  const minDistance = a.icon.radius + b.icon.radius;
  if (distance >= minDistance) return;

  if (!a.held && !b.held && canMerge(a, b)) {
    mergePieces(a, b);
    return;
  }

  if (!a.held && !b.held && (a.icon.kind === "special" || b.icon.kind === "special")) {
    triggerSpecial(a.icon.kind === "special" ? a : b);
    return;
  }

  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minDistance - distance;
  const aMove = a.held ? 0 : 0.5;
  const bMove = b.held ? 0 : 0.5;
  a.x -= nx * overlap * aMove;
  a.y -= ny * overlap * aMove;
  b.x += nx * overlap * bMove;
  b.y += ny * overlap * bMove;

  const relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  const impulse = Math.min(1.6, Math.max(-1.6, relativeVelocity * -0.45));
  if (!a.held) {
    a.vx -= nx * impulse;
    a.vy -= ny * impulse;
  }
  if (!b.held) {
    b.vx += nx * impulse;
    b.vy += ny * impulse;
  }
}

function canMerge(a, b) {
  return a.icon.kind !== "special" && b.icon.kind !== "special" && a.icon.id === b.icon.id;
}

function mergePieces(a, b) {
  a.merging = true;
  b.merging = true;
  const level = normalIcons.findIndex((icon) => icon.id === a.icon.id);
  const nextLevel = Math.min(level + 1, normalIcons.length - 1);
  const icon = normalIcons[nextLevel];
  const merged = createPiece(icon, (a.x + b.x) / 2, (a.y + b.y) / 2);
  merged.vx = (a.vx + b.vx) * 0.25;
  merged.vy = -3.2;

  pieces = pieces.filter((piece) => piece !== a && piece !== b);
  pieces.push(merged);
  comboCount += 1;
  updateScore(icon.score);
  showCombo(comboCount > 1 ? `${comboCount} COMBO!` : "合体！");
  setCoachComment("merge");
  audioHooks.merge();
  setTimeout(() => {
    comboCount = Math.max(0, comboCount - 1);
  }, 1000);
}

function triggerSpecial(piece) {
  if (piece.usedSpecial) return;
  piece.usedSpecial = true;
  updateScore(piece.icon.score);
  showCombo(getSpecialMessage(piece.icon));
  setCoachComment("merge");
  audioHooks.special();

  if (piece.icon.effect === "bumpNearby") {
    affectNearby(piece, 125, (target, distance) => {
      const dx = target.x - piece.x;
      const dy = target.y - piece.y;
      const len = Math.hypot(dx, dy) || 1;
      const power = 8 * (1 - distance / 125);
      target.vx += (dx / len) * power;
      target.vy += (dy / len) * power - 1.5;
    });
  }

  if (piece.icon.effect === "pressDown") {
    affectNearby(piece, 145, (target) => {
      target.vy += 5.5;
      target.vx *= 0.45;
    });
  }

  if (piece.icon.effect === "upgradeNearby") {
    upgradeNearby(piece);
  }

  if (piece.icon.effect === "rerollOrTidy") {
    nextIcon = pickNextIcon();
    updateNextUI();
    affectNearby(piece, 110, (target) => {
      target.vx *= 0.25;
      target.vy *= 0.25;
    });
  }

  pieces = pieces.filter((target) => target !== piece);
}

function getSpecialMessage(icon) {
  const messages = {
    shiba: "おにくパワー！近くのアイコンが成長！",
    macho: "マッチョブースト！盤面を押し出す！",
    lifter: "リフタープレス！盤面を安定！",
    coach: "ごすじん応援！NEXT更新！",
  };
  return messages[icon.id] || "SPECIAL!";
}

function affectNearby(source, radius, callback) {
  for (const target of pieces) {
    if (target === source || target.held || target.icon.kind === "special") continue;
    const distance = Math.hypot(target.x - source.x, target.y - source.y);
    if (distance <= radius) callback(target, distance);
  }
}

function upgradeNearby(source) {
  const targets = pieces
    .filter((piece) => piece !== source && !piece.held && piece.icon.kind !== "special")
    .sort((a, b) => Math.hypot(a.x - source.x, a.y - source.y) - Math.hypot(b.x - source.x, b.y - source.y))
    .slice(0, 3);

  for (const target of targets) {
    const level = normalIcons.findIndex((icon) => icon.id === target.icon.id);
    if (level < 0 || level >= normalIcons.length - 1) continue;
    target.icon = normalIcons[level + 1];
    target.vy = -2;
    updateScore(Math.floor(target.icon.score * 0.5));
  }
}

function showCombo(text) {
  comboText.textContent = text;
  comboText.classList.remove("is-active");
  void comboText.offsetWidth;
  comboText.classList.add("is-active");
}

function getEvolutionMessage(stageName) {
  const previewMessages = {
    "やる気おにく君": "進化！\nやる気おにく君へ！",
  };
  return previewMessages[stageName] || `進化！\n${stageName}へ！`;
}

function showEvolutionEffect(stageName) {
  showCombo(getEvolutionMessage(stageName));
  boardWrapEl.classList.remove("is-evolving");
  void boardWrapEl.offsetWidth;
  boardWrapEl.classList.add("is-evolving");
}

function checkGameOver() {
  if (isGameOver) return;
  const now = performance.now();
  const danger = pieces.some((piece) => {
    if (piece.held || piece.merging) return false;
    return now - piece.bornAt > 2400 && piece.y - piece.icon.radius < GAME_OVER_LINE && Math.abs(piece.vy) < 0.45;
  });
  if (danger) {
    setCoachComment("pinch");
    endGame();
  }
}

function endGame() {
  isGameOver = true;
  canDrop = false;
  gameOverPanel.classList.remove("is-hidden");
  audioHooks.gameOver();
}

function draw() {
  ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
  drawDropGuide();
  for (const piece of pieces) drawIcon(piece);
}

function drawDropGuide() {
  if (!currentDrop || isGameOver) return;
  ctx.save();
  ctx.beginPath();
  ctx.setLineDash([6, 8]);
  ctx.moveTo(currentDrop.x, DROP_Y + 28);
  ctx.lineTo(currentDrop.x, BASE_HEIGHT - 10);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(38, 49, 84, 0.22)";
  ctx.stroke();
  ctx.restore();
}

function drawIcon(piece) {
  const { icon } = piece;
  const r = icon.radius;
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.angle);

  drawIconBase(ctx, icon, r);
  if (!drawIconImage(ctx, icon, r)) {
    drawIconSymbol(ctx, icon, r);
  }

  if (r >= 38) {
    ctx.rotate(-piece.angle);
    ctx.font = "900 10px Hiragino Sans, Yu Gothic, Meiryo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(32, 34, 56, 0.82)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
    ctx.lineWidth = 3;
    ctx.strokeText(icon.shortName, 0, r * 0.58);
    ctx.fillText(icon.shortName, 0, r * 0.58);
  }
  ctx.restore();
}

function drawIconBase(ctx, icon, r) {
  ctx.save();
  ctx.translate(4, 8);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(32, 34, 56, 0.2)";
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = icon.color;
  ctx.fill();
  ctx.lineWidth = Math.max(5, r * 0.14);
  ctx.strokeStyle = icon.outline;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, r - 7, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(-r * 0.26, -r * 0.32, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  ctx.fill();
}

function drawIconImage(ctx, icon, r) {
  const image = getCachedImage(icon.imageKey);
  if (!image) return false;

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.clip();
  const size = r * 1.5;
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}

function drawIconSymbol(ctx, icon, r) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  switch (icon.id) {
    case "water":
      drawWaterIcon(ctx, r);
      break;
    case "towel":
      drawTowelIcon(ctx, r);
      break;
    case "shaker":
      drawShakerIcon(ctx, r);
      break;
    case "dumbbell":
      drawDumbbellIcon(ctx, r);
      break;
    case "kettlebell":
      drawKettlebellIcon(ctx, r);
      break;
    case "plate":
      drawPlateIcon(ctx, r);
      break;
    case "barbell":
      drawBarbellIcon(ctx, r);
      break;
    case "rack":
      drawRackIcon(ctx, r);
      break;
    case "shiba":
      drawShibaIcon(ctx, r);
      break;
    case "macho":
      drawMachoIcon(ctx, r);
      break;
    case "lifter":
      drawLifterIcon(ctx, r);
      break;
    case "coach":
      drawCoachIcon(ctx, r);
      break;
    default:
      drawTextFallback(ctx, icon.shortName || icon.name, r);
      break;
  }
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, radius) {
  const rr = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
}

function drawWaterIcon(ctx, r) {
  const w = r * 0.52;
  const h = r * 1.08;
  roundedRect(ctx, -w / 2, -h / 2 + r * 0.06, w, h, r * 0.14);
  ctx.fillStyle = "#dff8ff";
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = "#116c9d";
  ctx.stroke();
  roundedRect(ctx, -w * 0.28, -h / 2 - r * 0.13, w * 0.56, r * 0.24, r * 0.06);
  ctx.fillStyle = "#2f9bd0";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#5ccdf4";
  ctx.fillRect(-w * 0.36, -r * 0.08, w * 0.72, r * 0.44);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.moveTo(-w * 0.18, -r * 0.34);
  ctx.lineTo(-w * 0.18, r * 0.34);
  ctx.stroke();
}

function drawTowelIcon(ctx, r) {
  const w = r * 1.18;
  const h = r * 0.72;
  roundedRect(ctx, -w / 2, -h / 2, w, h, r * 0.16);
  ctx.fillStyle = "#ffd0dc";
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = "#c94b72";
  ctx.stroke();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.07;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-w * 0.35, i * h * 0.18);
    ctx.lineTo(w * 0.35, i * h * 0.18);
    ctx.stroke();
  }
  ctx.fillStyle = "#ff8fa8";
  roundedRect(ctx, -w * 0.45, -h * 0.45, w * 0.18, h * 0.9, r * 0.08);
  ctx.fill();
}

function drawShakerIcon(ctx, r) {
  const top = r * 0.68;
  const bottom = r * 0.48;
  const h = r * 1.12;
  ctx.beginPath();
  ctx.moveTo(-top / 2, -h / 2 + r * 0.1);
  ctx.lineTo(top / 2, -h / 2 + r * 0.1);
  ctx.lineTo(bottom / 2, h / 2);
  ctx.lineTo(-bottom / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = "#fff3b0";
  ctx.fill();
  ctx.lineWidth = r * 0.09;
  ctx.strokeStyle = "#9b6300";
  ctx.stroke();
  roundedRect(ctx, -top * 0.62, -h / 2 - r * 0.12, top * 1.24, r * 0.24, r * 0.08);
  ctx.fillStyle = "#f08e1d";
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${r * 0.36}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", 0, r * 0.1);
}

function drawDumbbellIcon(ctx, r) {
  ctx.strokeStyle = "#1d5f43";
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.moveTo(-r * 0.54, 0);
  ctx.lineTo(r * 0.54, 0);
  ctx.stroke();
  ctx.fillStyle = "#263154";
  for (const side of [-1, 1]) {
    roundedRect(ctx, side * r * 0.45 - side * r * 0.18, -r * 0.3, r * 0.26, r * 0.6, r * 0.08);
    ctx.fill();
    ctx.stroke();
    roundedRect(ctx, side * r * 0.68 - side * r * 0.18, -r * 0.36, r * 0.24, r * 0.72, r * 0.08);
    ctx.fill();
    ctx.stroke();
  }
}

function drawKettlebellIcon(ctx, r) {
  ctx.strokeStyle = "#442889";
  ctx.lineWidth = r * 0.1;
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.48, 0, Math.PI * 2);
  ctx.fillStyle = "#7352d6";
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -r * 0.26, r * 0.38, Math.PI, 0);
  ctx.strokeStyle = "#2f205e";
  ctx.lineWidth = r * 0.16;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -r * 0.24, r * 0.22, Math.PI, 0);
  ctx.strokeStyle = "#cbbcff";
  ctx.lineWidth = r * 0.06;
  ctx.stroke();
}

function drawPlateIcon(ctx, r) {
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.fillStyle = "#87909d";
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = "#3f4754";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.24, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f7fb";
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#cfd4dc";
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBarbellIcon(ctx, r) {
  ctx.strokeStyle = "#263154";
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.moveTo(-r * 0.68, 0);
  ctx.lineTo(r * 0.68, 0);
  ctx.stroke();
  ctx.fillStyle = "#5f6876";
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      roundedRect(ctx, side * (r * (0.4 + i * 0.12)) - side * r * 0.08, -r * 0.34, r * 0.12, r * 0.68, r * 0.04);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function drawRackIcon(ctx, r) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.09;
  roundedRect(ctx, -r * 0.52, -r * 0.48, r * 1.04, r * 0.96, r * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.32, -r * 0.48);
  ctx.lineTo(-r * 0.32, r * 0.48);
  ctx.moveTo(r * 0.32, -r * 0.48);
  ctx.lineTo(r * 0.32, r * 0.48);
  ctx.moveTo(-r * 0.52, -r * 0.08);
  ctx.lineTo(r * 0.52, -r * 0.08);
  ctx.stroke();
  ctx.fillStyle = "#263154";
  ctx.fillRect(-r * 0.42, r * 0.25, r * 0.84, r * 0.12);
}

function drawShibaIcon(ctx, r) {
  ctx.fillStyle = "#fff3df";
  ctx.beginPath();
  ctx.arc(0, r * 0.05, r * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a3d1a";
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.fillStyle = "#f7943d";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * r * 0.18, -r * 0.32);
    ctx.lineTo(side * r * 0.48, -r * 0.62);
    ctx.lineTo(side * r * 0.42, -r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#202238";
  ctx.beginPath();
  ctx.arc(-r * 0.17, -r * 0.02, r * 0.05, 0, Math.PI * 2);
  ctx.arc(r * 0.17, -r * 0.02, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, r * 0.13, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#202238";
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.arc(0, r * 0.18, r * 0.18, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

function drawMachoIcon(ctx, r) {
  ctx.fillStyle = "#ffd2ad";
  ctx.beginPath();
  ctx.arc(-r * 0.2, r * 0.05, r * 0.28, 0, Math.PI * 2);
  ctx.arc(r * 0.24, -r * 0.05, r * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#7a3f1c";
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.strokeStyle = "#7a3f1c";
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  ctx.moveTo(-r * 0.52, r * 0.28);
  ctx.quadraticCurveTo(-r * 0.22, -r * 0.28, r * 0.1, r * 0.16);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(r * 0.12, -r * 0.08, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

function drawLifterIcon(ctx, r) {
  ctx.fillStyle = "#10131b";
  roundedRect(ctx, -r * 0.46, -r * 0.34, r * 0.92, r * 0.75, r * 0.12);
  ctx.fill();
  ctx.strokeStyle = "#e94d46";
  ctx.lineWidth = r * 0.08;
  ctx.stroke();
  ctx.fillStyle = "#e94d46";
  roundedRect(ctx, -r * 0.44, r * 0.08, r * 0.88, r * 0.2, r * 0.04);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = r * 0.04;
  ctx.beginPath();
  ctx.moveTo(-r * 0.18, -r * 0.08);
  ctx.lineTo(-r * 0.04, -r * 0.08);
  ctx.moveTo(r * 0.04, -r * 0.08);
  ctx.lineTo(r * 0.18, -r * 0.08);
  ctx.moveTo(-r * 0.16, -r * 0.22);
  ctx.lineTo(r * 0.16, -r * 0.22);
  ctx.stroke();
}

function drawCoachIcon(ctx, r) {
  ctx.fillStyle = "#ffe2d0";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#263154";
  ctx.lineWidth = r * 0.07;
  ctx.stroke();
  ctx.strokeStyle = "#6a3b2a";
  ctx.lineWidth = r * 0.14;
  ctx.beginPath();
  ctx.arc(0, -r * 0.1, r * 0.42, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.fillStyle = "#263154";
  ctx.beginPath();
  ctx.arc(-r * 0.14, 0, r * 0.045, 0, Math.PI * 2);
  ctx.arc(r * 0.14, 0, r * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e94d7d";
  ctx.lineWidth = r * 0.05;
  ctx.beginPath();
  ctx.arc(0, r * 0.1, r * 0.16, 0.12 * Math.PI, 0.88 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = "#ff7ba7";
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, r * 0.5);
  ctx.lineTo(0, r * 0.22);
  ctx.lineTo(r * 0.5, r * 0.5);
  ctx.closePath();
  ctx.fill();
}

function drawTextFallback(ctx, text, r) {
  ctx.font = `900 ${Math.max(10, r * 0.34)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#202238";
  ctx.fillText(text, 0, 0);
}

function loop(time) {
  const delta = Math.min(32, time - lastTime || 16);
  lastTime = time;
  if (!isGameOver) {
    const steps = Math.max(1, Math.round(delta / 16));
    for (let i = 0; i < steps; i += 1) physicsStep();
    checkGameOver();
  }
  draw();
  animationId = requestAnimationFrame(loop);
}

function resetGame() {
  if (animationId) cancelAnimationFrame(animationId);
  pieces = [];
  currentDrop = null;
  dropX = BASE_WIDTH / 2;
  canDrop = true;
  isGameOver = false;
  score = 0;
  comboCount = 0;
  currentStageIndex = 0;
  pieceId = 0;
  scoreEl.textContent = "0";
  gameOverPanel.classList.add("is-hidden");
  setCoachComment("normal");
  updateOnikuStage();
  nextIcon = pickNextIcon();
  prepareDrop();
  lastTime = performance.now();
  animationId = requestAnimationFrame(loop);
}

function startGame() {
  titleScreen.classList.add("is-hidden");
  gameScreen.classList.remove("is-hidden");
  resetGame();
  clearInterval(normalCommentTimer);
  normalCommentTimer = setInterval(() => {
    if (!isGameOver) setCoachComment("normal");
  }, 9000);
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);
retryButton.addEventListener("click", resetGame);

canvas.addEventListener("pointermove", (event) => moveDrop(event.clientX));
canvas.addEventListener("pointerdown", (event) => {
  moveDrop(event.clientX);
  dropCurrentIcon();
});

window.addEventListener("keydown", (event) => {
  if (gameScreen.classList.contains("is-hidden")) return;
  if (event.key === "ArrowLeft") {
    dropX = Math.max(30, dropX - 22);
    if (currentDrop) currentDrop.x = dropX;
  }
  if (event.key === "ArrowRight") {
    dropX = Math.min(BASE_WIDTH - 30, dropX + 22);
    if (currentDrop) currentDrop.x = dropX;
  }
  if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown") {
    event.preventDefault();
    dropCurrentIcon();
  }
});

window.addEventListener("resize", setupCanvasDpr);

setupCanvasDpr();
preloadGameAssets();
nextIcon = pickNextIcon();
updateNextUI();
updateOnikuStage();
initializeStageTrack();
setCoachComment("normal");
updateTitleLogo();
updateBackgroundAssets();
