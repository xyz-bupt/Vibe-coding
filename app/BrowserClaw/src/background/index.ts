// ── Background Service Worker ─────────────────────────────────
// Handles:
//   1. Opening side panel on extension icon click
//   2. Setting sidePanel behavior on install
//   3. Relaying messages between SidePanel ↔ Content Script

// Open side panel when extension action icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});

// On install, configure side panel to open on action click
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// Message relay: forward SCRAPE_RESULT from content script to sidepanel
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === "SCRAPE_RESULT") {
    chrome.runtime.sendMessage(message).catch(() => {
      // Sidepanel might not be open yet; ignore
    });
  }
  return false;
});

export {};
