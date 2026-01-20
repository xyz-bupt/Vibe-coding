// 专注模式 - 后台脚本
// Focus Mode - Background Service Worker

(function() {
  'use strict';

  // 默认设置
  const DEFAULT_SETTINGS = {
    whitelist: [],
    blacklist: [],
    fontSize: 18,
    lineHeight: 1.8,
    eyeCareMode: false,
    customSelectors: []
  };

  // 初始化
  function init() {
    setupInstallListener();
    setupCommandListener();
    setupMessageListener();
    setupContextMenu();
  }

  // 设置安装监听器
  function setupInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        // 首次安装
        onInstall();
      } else if (details.reason === 'update') {
        // 更新
        onUpdate(details.previousVersion);
      }
    });
  }

  // 首次安装
  function onInstall() {
    // 设置默认值
    chrome.storage.sync.set({
      autoEnable: false,
      eyeCareMode: false,
      focusModeSettings: DEFAULT_SETTINGS
    }, () => {
      console.log('专注模式已安装，默认设置已保存');
    });

    // 打开欢迎页面
    chrome.tabs.create({
      url: chrome.runtime.getURL('options.html')
    });
  }

  // 更新
  function onUpdate(previousVersion) {
    console.log(`专注模式已更新，从版本 ${previousVersion} 更新`);
    // 可以在这里添加数据迁移逻辑
  }

  // 设置命令监听器
  function setupCommandListener() {
    chrome.commands.onCommand.addListener((command) => {
      if (command === 'toggle-focus') {
        toggleFocusMode();
      }
    });
  }

  // 切换专注模式
  function toggleFocusMode() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleFocus' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('切换专注模式失败:', chrome.runtime.lastError);
            showNotification('请刷新页面后重试');
          }
        });
      }
    });
  }

  // 设置消息监听器
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // 验证消息来源
      if (sender.id && sender.id !== chrome.runtime.id) {
        return false;
      }

      switch (request.action) {
        case 'focusStatusChanged':
          // 状态变化时更新图标
          updateIcon(request.enabled);
          // 通知弹出页面
          notifyPopup(request.enabled);
          return false;

        case 'getSettings':
          // 获取设置
          chrome.storage.sync.get(['focusModeSettings'], (result) => {
            sendResponse(result.focusModeSettings || DEFAULT_SETTINGS);
          });
          return true; // 异步响应

        case 'saveSettings':
          // 保存设置
          chrome.storage.sync.set({
            focusModeSettings: request.settings
          }, () => {
            sendResponse({ success: true });
          });
          return true; // 异步响应

        case 'openOptions':
          // 打开选项页面
          chrome.runtime.openOptionsPage();
          sendResponse({ success: true });
          return false;

        default:
          return false;
      }
    });
  }

  // 更新图标
  function updateIcon(enabled) {
    const iconPath = enabled ? 'icons/icon-active' : 'icons/icon';
    // 注意：这里需要准备两套图标
    // chrome.action.setIcon({
    //   path: {
    //     '16': `${iconPath}16.png`,
    //     '32': `${iconPath}32.png`,
    //     '48': `${iconPath}48.png`,
    //     '128': `${iconPath}128.png`
    //   }
    // });

    // 设置徽章
    if (enabled) {
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
      chrome.action.setTitle({ title: '专注模式已启用 - 点击禁用' });
    } else {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: '专注模式 - 点击启用' });
    }
  }

  // 通知弹出页面
  function notifyPopup(enabled) {
    chrome.runtime.sendMessage({
      action: 'statusUpdated',
      enabled: enabled
    }).catch(() => {
      // 忽略错误，弹出页面可能未打开
    });
  }

  // 设置右键菜单
  function setupContextMenu() {
    chrome.runtime.onInstalled.addListener(() => {
      try {
        // 先移除可能存在的旧菜单
        chrome.contextMenus.removeAll(() => {
          chrome.contextMenus.create({
            id: 'toggleFocus',
            title: '切换专注模式',
            contexts: ['page', 'selection']
          });
        });
      } catch (e) {
        console.warn('Context menu setup warning:', e);
      }
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'toggleFocus' && tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'toggleFocus' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('切换专注模式失败:', chrome.runtime.lastError);
          }
        });
      }
    });
  }

  // 显示通知
  function showNotification(message) {
    // Chrome 不再支持原生通知，使用其他方式
    // 可以创建一个临时标签页或使用弹出页面
    console.log('通知:', message);
  }

  // 监听标签页更新
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      // 页面加载完成
      // 可以在这里执行一些初始化操作
    }
  });

  // 监听标签页激活
  chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      // 检查该标签页的状态
      chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, (response) => {
        if (response) {
          updateIcon(response.enabled);
        }
      }).catch(() => {
        // 忽略错误
      });
    });
  });

  // 初始化
  init();

})();
