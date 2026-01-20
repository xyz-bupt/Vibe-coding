/**
 * Focus Mode Extension - Icon Switching Example
 * 此文件展示如何在扩展中动态切换图标状态
 */

// 图标路径配置
const ICONS = {
  default: {
    "16": "icons/icon-default-16.png",
    "48": "icons/icon-default-48.png",
    "128": "icons/icon-default-128.png"
  },
  active: {
    "16": "icons/icon-active-16.png",
    "48": "icons/icon-active-48.png",
    "128": "icons/icon-active-128.png"
  }
};

/**
 * 设置图标状态
 * @param {boolean} isActive - 是否激活专注模式
 */
function setIconState(isActive) {
  const iconPath = isActive ? ICONS.active : ICONS.default;

  chrome.action.setIcon({
    path: iconPath
  });

  chrome.action.setTitle({
    title: isActive ? "Focus Mode - ON" : "Focus Mode - OFF"
  });

  // 保存状态到存储
  chrome.storage.local.set({ focusModeActive: isActive });
}

/**
 * 初始化图标状态
 */
async function initializeIconState() {
  const result = await chrome.storage.local.get(['focusModeActive']);
  const isActive = result.focusModeActive || false;
  setIconState(isActive);
}

/**
 * 切换专注模式
 */
function toggleFocusMode() {
  chrome.storage.local.get(['focusModeActive'], (result) => {
    const currentState = result.focusModeActive || false;
    setIconState(!currentState);
  });
}

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  toggleFocusMode();
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFocusMode") {
    toggleFocusMode();
    sendResponse({ success: true });
  } else if (request.action === "getFocusModeState") {
    chrome.storage.local.get(['focusModeActive'], (result) => {
      sendResponse({ active: result.focusModeActive || false });
    });
    return true; // 保持消息通道开启以进行异步响应
  }
});

// 扩展安装或更新时初始化
chrome.runtime.onInstalled.addListener(() => {
  initializeIconState();
});

// 扩展启动时初始化
initializeIconState();

// 导出函数供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setIconState,
    toggleFocusMode,
    initializeIconState,
    ICONS
  };
}
