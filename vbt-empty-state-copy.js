(() => {
  const replacements = [
    {
      from: "測定やり直し",
      to: "最初の1本を測定"
    },
    {
      from: "まだVBT記録はありません。",
      to: "まだVBT記録はありません。まずは最初の1本を測定しましょう。"
    }
  ];

  const selector = [
    "#vbtView",
    "#videoPanel",
    "#videoStudioPanel",
    "#vbtStudioPanel",
    ".video-panel",
    ".video-library",
    ".vbt-studio",
    ".vbt-history",
    ".video-empty",
    "dialog"
  ].join(",");

  let queued = false;

  function ensureStyle() {
    if (document.getElementById("vbt-empty-state-copy-style")) return;
    const style = document.createElement("style");
    style.id = "vbt-empty-state-copy-style";
    style.textContent = `
      .vbt-first-measure-card {
        border: 1px dashed var(--line-strong, #cbbda8);
        border-radius: 14px;
        padding: 18px;
        background:
          linear-gradient(90deg, rgba(180, 35, 24, 0.06), transparent 52%),
          var(--surface, #fffaf2);
        color: var(--text-main, #171717);
        display: grid;
        gap: 10px;
      }

      .vbt-first-measure-card strong {
        font-size: 1.05rem;
        color: var(--text-main, #171717);
      }

      .vbt-first-measure-card p {
        margin: 0;
        color: var(--text-sub, #526179);
        line-height: 1.45;
      }

      .vbt-first-measure-card .primary-button {
        width: min(100%, 280px);
      }
    `;
    document.head.appendChild(style);
  }

  function replaceTextNode(node) {
    let next = node.nodeValue;
    replacements.forEach(({ from, to }) => {
      next = next.split(from).join(to);
    });
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function replaceText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const text = node.nodeValue || "";
        return replacements.some(({ from }) => text.includes(from))
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(replaceTextNode);
  }

  function openVideoMeasureFlow() {
    const addButton = document.getElementById("videoAddModeBtn");
    if (addButton) {
      addButton.click();
      addButton.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const fileInput = document.getElementById("videoFileInput");
    if (fileInput) {
      fileInput.scrollIntoView({ behavior: "smooth", block: "center" });
      fileInput.focus();
    }
  }

  function enhanceEmptyState() {
    document.querySelectorAll(".video-empty").forEach((empty) => {
      if (empty.closest(".vbt-first-measure-card")) return;
      if (empty.dataset.vbtFirstMeasureReady === "true") return;

      empty.dataset.vbtFirstMeasureReady = "true";
      const card = document.createElement("div");
      card.className = "vbt-first-measure-card";
      card.innerHTML = `
        <strong>最初の1本を測定しよう</strong>
        <p>動画を選ぶと、プレート軌道と速度を残せます。まずは1セットだけでOK。</p>
        <button class="primary-button" type="button" data-vbt-first-measure>新しい動画を測定</button>
      `;
      empty.replaceWith(card);
    });
  }

  function tuneButtons() {
    const addButton = document.getElementById("videoAddModeBtn");
    if (addButton && addButton.textContent.trim() === "新しい動画") {
      addButton.textContent = "新しい動画を測定";
    }

    document.querySelectorAll("button, a").forEach((element) => {
      const text = element.textContent.trim();
      if (text === "測定やり直し") {
        element.textContent = "最初の1本を測定";
      }
    });
  }

  function applyCopyFix() {
    ensureStyle();
    document.querySelectorAll(selector).forEach(replaceText);
    tuneButtons();
    enhanceEmptyState();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyCopyFix();
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-vbt-first-measure]")) {
      openVideoMeasureFlow();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();