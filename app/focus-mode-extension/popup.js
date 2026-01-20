// 专注模式 - 弹出页面脚本
// Focus Mode - Popup Script

(function() {
  'use strict';

  // DOM 元素
  const statusIndicator = document.getElementById('statusIndicator');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const toggleButton = document.getElementById('toggleButton');
  const buttonIcon = document.getElementById('buttonIcon');
  const buttonText = document.getElementById('buttonText');
  const autoEnableCheckbox = document.getElementById('autoEnable');
  const eyeCareModeCheckbox = document.getElementById('eyeCareMode');
  const settingsButton = document.getElementById('settingsButton');

  // 当前状态
  let currentStatus = null;
  let currentSettings = {
    autoEnable: false,
    eyeCareMode: false
  };

  // 初始化
  function init() {
    loadSettings();
    checkStatus();
    setupEventListeners();
  }

  // 加载设置
  function loadSettings() {
    chrome.storage.sync.get(['autoEnable', 'eyeCareMode', 'focusModeSettings'], (result) => {
      currentSettings.autoEnable = result.autoEnable || false;
      currentSettings.eyeCareMode = result.eyeCareMode || false;

      if (result.focusModeSettings) {
        currentSettings.eyeCareMode = result.focusModeSettings.eyeCareMode || false;
      }

      // 更新复选框状态
      autoEnableCheckbox.checked = currentSettings.autoEnable;
      eyeCareModeCheckbox.checked = currentSettings.eyeCareMode;
    });
  }

  // 检查当前状态
  function checkStatus() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
          if (response) {
            updateUI(response.enabled);
          } else {
            // 内容脚本可能未加载
            updateUI(false);
          }
        });
      }
    });
  }

  // 更新 UI
  function updateUI(enabled) {
    currentStatus = enabled;

    if (enabled) {
      // 已启用状态
      statusIndicator.className = 'status-indicator enabled';
      statusIcon.textContent = '●';
      statusText.textContent = '专注模式已启用';

      toggleButton.className = 'toggle-button active';
      buttonIcon.textContent = '◼';
      buttonText.textContent = '禁用专注模式';
    } else {
      // 未启用状态
      statusIndicator.className = 'status-indicator disabled';
      statusIcon.textContent = '○';
      statusText.textContent = '专注模式未启用';

      toggleButton.className = 'toggle-button';
      buttonIcon.textContent = '▶';
      buttonText.textContent = '启用专注模式';
    }
  }

  // 设置事件监听器
  function setupEventListeners() {
    // 切换按钮
    toggleButton.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const action = currentStatus ? 'disableFocus' : 'enableFocus';
          chrome.tabs.sendMessage(tabs[0].id, { action: action }, (response) => {
            if (response && response.success) {
              updateUI(!currentStatus);
            }
          });
        }
      });
    });

    // 自动启用复选框
    autoEnableCheckbox.addEventListener('change', (e) => {
      const value = e.target.checked;
      chrome.storage.sync.set({ autoEnable: value }, () => {
        currentSettings.autoEnable = value;
        showNotification(value ? '已启用自动开启' : '已禁用自动开启');
      });
    });

    // 护眼模式复选框
    eyeCareModeCheckbox.addEventListener('change', (e) => {
      const value = e.target.checked;
      chrome.storage.sync.get(['focusModeSettings'], (result) => {
        const settings = result.focusModeSettings || {};
        settings.eyeCareMode = value;

        chrome.storage.sync.set({ focusModeSettings: settings, eyeCareMode: value }, () => {
          currentSettings.eyeCareMode = value;

          // 如果专注模式已启用，通知内容脚本更新
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'updateSettings',
                settings: { eyeCareMode: value }
              });
            }
          });

          showNotification(value ? '已启用护眼模式' : '已禁用护眼模式');
        });
      });
    });

    // 设置按钮
    settingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }

  // 监听来自后台脚本的消息（验证来源）
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 验证消息来源
    if (sender.id !== chrome.runtime.id) {
      return false;
    }

    if (request.action === 'statusUpdated') {
      updateUI(request.enabled);
    }
    return false;
  });

  // 初始化
  init();

})();
