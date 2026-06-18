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

  function applyCopyFix() {
    document.querySelectorAll(selector).forEach(replaceText);
    document.querySelectorAll("button, a").forEach((element) => {
      if (element.textContent.trim() === "測定やり直し") {
        element.textContent = "最初の1本を測定";
      }
    });
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyCopyFix();
    });
  }

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