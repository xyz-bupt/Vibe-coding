// ── Content Script ────────────────────────────────────────────
// Listens for SCRAPE_HEADINGS messages from the SidePanel,
// extracts all <h1> and <h2> elements from the current page,
// and sends the results back via SCRAPE_RESULT.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SCRAPE_HEADINGS") {
    const headings: string[] = [];

    document.querySelectorAll("h1, h2").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim();
      if (text) {
        headings.push(`<${tag}> ${text}`);
      }
    });

    // Send results back to background → sidepanel
    chrome.runtime.sendMessage({
      type: "SCRAPE_RESULT",
      data: headings,
    });

    sendResponse({ ok: true, count: headings.length });
  }

  return true;
});

export {};
