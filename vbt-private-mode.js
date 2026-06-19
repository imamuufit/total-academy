(() => {
  const HIDDEN_SELECTORS = [
    '[data-view="vbt"]',
    '[data-view-target="vbt"]',
    'a[href="#vbt"]',
    'a[href="#vbtView"]',
    '#vbtView',
    '#homeVbtCard',
    '#vbtDataSummary',
    '.home-vbt-card',
    '.vbt-dashboard-section',
    '.vbt-main-layout',
    '.vbt-quick-section',
    '.video-note-panel',
    '.vbt-profile-summary',
    '.vbt-detail-section',
    '.vbt-caution-card',
    '.vbt-data-summary'
  ];

  let queued = false;

  function ensurePrivateStyle() {
    if (document.getElementById("vbt-private-mode-style")) return;
    const style = document.createElement("style");
    style.id = "vbt-private-mode-style";
    style.textContent = `
      ${HIDDEN_SELECTORS.join(",\n      ")} {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function isVbtElement(element) {
    if (!element || element.nodeType !== 1) return false;
    if (HIDDEN_SELECTORS.some((selector) => element.matches?.(selector))) return true;
    const label = element.textContent || "";
    return /\bVBT\b|動画フォーム\/VBTノート|動画と測定|速度プロフィール/.test(label);
  }

  function hideVbtCards() {
    HIDDEN_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        element.hidden = true;
        element.setAttribute("aria-hidden", "true");
        element.dataset.vbtPrivateHidden = "true";
      });
    });

    document.querySelectorAll(".panel, .compact-panel, .pb-section, .home-action-grid button, .home-shortcut-grid button, .dashboard-card, .analysis-card, .data-card").forEach((element) => {
      if (isVbtElement(element)) {
        element.hidden = true;
        element.setAttribute("aria-hidden", "true");
        element.dataset.vbtPrivateHidden = "true";
      }
    });
  }

  function leaveVbtViewIfNeeded() {
    const activeVbtTab = document.querySelector('.tab.active[data-view="vbt"], [aria-selected="true"][data-view="vbt"]');
    const vbtView = document.getElementById("vbtView");
    const vbtVisible = vbtView && !vbtView.classList.contains("hidden") && getComputedStyle(vbtView).display !== "none";
    const bodyActiveVbt = document.body?.dataset?.activeView === "vbt";
    if (!activeVbtTab && !vbtVisible && !bodyActiveVbt) return;

    const fallback = document.querySelector('[data-view="plan"]') || document.querySelector('[data-view="log"]') || document.querySelector('[data-view="home"]');
    if (fallback) fallback.click();
  }

  function applyPrivateMode() {
    ensurePrivateStyle();
    hideVbtCards();
    leaveVbtViewIfNeeded();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyPrivateMode();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "hidden", "data-active-view", "aria-selected"]
  });
})();