// 专注模式 - 设置页面脚本
// Focus Mode - Options Page Script

(function() {
  'use strict';

  // DOM 元素
  const autoEnableCheckbox = document.getElementById('autoEnable');
  const eyeCareModeCheckbox = document.getElementById('eyeCareMode');
  const fontSizeSlider = document.getElementById('fontSize');
  const fontSizeValue = document.getElementById('fontSizeValue');
  const lineHeightSlider = document.getElementById('lineHeight');
  const lineHeightValue = document.getElementById('lineHeightValue');
  const whitelistInput = document.getElementById('whitelistInput');
  const addWhitelistButton = document.getElementById('addWhitelist');
  const whitelistList = document.getElementById('whitelistList');
  const blacklistInput = document.getElementById('blacklistInput');
  const addBlacklistButton = document.getElementById('addBlacklist');
  const blacklistList = document.getElementById('blacklistList');
  const selectorInput = document.getElementById('selectorInput');
  const addSelectorButton = document.getElementById('addSelector');
  const selectorList = document.getElementById('selectorList');
  const saveButton = document.getElementById('saveButton');
  const resetButton = document.getElementById('resetButton');
  const notification = document.getElementById('notification');

  // 当前设置
  let currentSettings = {
    autoEnable: false,
    eyeCareMode: false,
    fontSize: 18,
    lineHeight: 1.8,
    whitelist: [],
    blacklist: [],
    customSelectors: []
  };

  // 默认设置
  const DEFAULT_SETTINGS = {
    autoEnable: false,
    eyeCareMode: false,
    fontSize: 18,
    lineHeight: 1.8,
    whitelist: [],
    blacklist: [],
    customSelectors: []
  };

  // 初始化
  function init() {
    loadSettings();
    setupEventListeners();
  }

  // 加载设置
  function loadSettings() {
    chrome.storage.sync.get(
      ['autoEnable', 'eyeCareMode', 'focusModeSettings'],
      (result) => {
        currentSettings.autoEnable = result.autoEnable || false;
        currentSettings.eyeCareMode = result.eyeCareMode || false;

        if (result.focusModeSettings) {
          currentSettings = {
            ...currentSettings,
            ...result.focusModeSettings
          };
        }

        // 更新 UI
        updateUI();
      }
    );
  }

  // 更新 UI
  function updateUI() {
    // 更新复选框
    autoEnableCheckbox.checked = currentSettings.autoEnable;
    eyeCareModeCheckbox.checked = currentSettings.eyeCareMode;

    // 更新滑块
    fontSizeSlider.value = currentSettings.fontSize;
    fontSizeValue.textContent = currentSettings.fontSize + 'px';

    lineHeightSlider.value = currentSettings.lineHeight;
    lineHeightValue.textContent = currentSettings.lineHeight;

    // 更新列表
    renderWhitelist();
    renderBlacklist();
    renderSelectors();
  }

  // 设置事件监听器
  function setupEventListeners() {
    // 复选框
    autoEnableCheckbox.addEventListener('change', (e) => {
      currentSettings.autoEnable = e.target.checked;
    });

    eyeCareModeCheckbox.addEventListener('change', (e) => {
      currentSettings.eyeCareMode = e.target.checked;
    });

    // 滑块
    fontSizeSlider.addEventListener('input', (e) => {
      currentSettings.fontSize = parseInt(e.target.value);
      fontSizeValue.textContent = e.target.value + 'px';
    });

    lineHeightSlider.addEventListener('input', (e) => {
      currentSettings.lineHeight = parseFloat(e.target.value);
      lineHeightValue.textContent = e.target.value;
    });

    // 白名单
    addWhitelistButton.addEventListener('click', addWhitelist);
    whitelistInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addWhitelist();
      }
    });

    // 黑名单
    addBlacklistButton.addEventListener('click', addBlacklist);
    blacklistInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addBlacklist();
      }
    });

    // 自定义选择器
    addSelectorButton.addEventListener('click', addSelector);
    selectorInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addSelector();
      }
    });

    // 保存和重置
    saveButton.addEventListener('click', saveSettings);
    resetButton.addEventListener('click', resetSettings);
  }

  // 添加白名单
  function addWhitelist() {
    const pattern = whitelistInput.value.trim();
    if (!pattern) {
      showNotification('请输入网址模式', 'error');
      return;
    }

    if (currentSettings.whitelist.includes(pattern)) {
      showNotification('该模式已存在', 'error');
      return;
    }

    // 基本的 URL 验证
    try {
      // 验证是否包含有效的 URL 字符
      if (!/^[a-zA-Z0-9*._\-:/[\]?]+$/.test(pattern)) {
        showNotification('网址模式包含无效字符', 'error');
        return;
      }
    } catch (e) {
      showNotification('无效的网址模式', 'error');
      return;
    }

    // 限制长度
    if (pattern.length > 200) {
      showNotification('网址模式过长（最多200字符）', 'error');
      return;
    }

    // 限制白名单数量
    if (currentSettings.whitelist.length >= 50) {
      showNotification('白名单数量已达上限（50条）', 'error');
      return;
    }

    currentSettings.whitelist.push(pattern);
    whitelistInput.value = '';
    renderWhitelist();
    showNotification('已添加到白名单');
  }

  // 移除白名单
  function removeWhitelist(pattern) {
    const index = currentSettings.whitelist.indexOf(pattern);
    if (index > -1) {
      currentSettings.whitelist.splice(index, 1);
      renderWhitelist();
      showNotification('已从白名单移除');
    }
  }

  // 渲染白名单
  function renderWhitelist() {
    while (whitelistList.firstChild) {
      whitelistList.removeChild(whitelistList.firstChild);
    }

    if (currentSettings.whitelist.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = '暂无白名单规则';
      whitelistList.appendChild(emptyMessage);
      return;
    }

    currentSettings.whitelist.forEach(pattern => {
      const item = createListItem(pattern, () => removeWhitelist(pattern));
      whitelistList.appendChild(item);
    });
  }

  // 添加黑名单
  function addBlacklist() {
    const pattern = blacklistInput.value.trim();
    if (!pattern) {
      showNotification('请输入网址模式', 'error');
      return;
    }

    if (currentSettings.blacklist.includes(pattern)) {
      showNotification('该模式已存在', 'error');
      return;
    }

    // 基本的 URL 验证
    try {
      // 验证是否包含有效的 URL 字符
      if (!/^[a-zA-Z0-9*._\-:/[\]?]+$/.test(pattern)) {
        showNotification('网址模式包含无效字符', 'error');
        return;
      }
    } catch (e) {
      showNotification('无效的网址模式', 'error');
      return;
    }

    // 限制长度
    if (pattern.length > 200) {
      showNotification('网址模式过长（最多200字符）', 'error');
      return;
    }

    // 限制黑名单数量
    if (currentSettings.blacklist.length >= 50) {
      showNotification('黑名单数量已达上限（50条）', 'error');
      return;
    }

    currentSettings.blacklist.push(pattern);
    blacklistInput.value = '';
    renderBlacklist();
    showNotification('已添加到黑名单');
  }

  // 移除黑名单
  function removeBlacklist(pattern) {
    const index = currentSettings.blacklist.indexOf(pattern);
    if (index > -1) {
      currentSettings.blacklist.splice(index, 1);
      renderBlacklist();
      showNotification('已从黑名单移除');
    }
  }

  // 渲染黑名单
  function renderBlacklist() {
    while (blacklistList.firstChild) {
      blacklistList.removeChild(blacklistList.firstChild);
    }

    if (currentSettings.blacklist.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = '暂无黑名单规则';
      blacklistList.appendChild(emptyMessage);
      return;
    }

    currentSettings.blacklist.forEach(pattern => {
      const item = createListItem(pattern, () => removeBlacklist(pattern));
      blacklistList.appendChild(item);
    });
  }

  // 添加自定义选择器
  function addSelector() {
    const selector = selectorInput.value.trim();
    if (!selector) {
      showNotification('请输入 CSS 选择器', 'error');
      return;
    }

    if (currentSettings.customSelectors.includes(selector)) {
      showNotification('该选择器已存在', 'error');
      return;
    }

    // 验证 CSS 选择器的有效性
    try {
      document.querySelector(selector);
    } catch (e) {
      showNotification('无效的 CSS 选择器', 'error');
      return;
    }

    // 限制选择器长度
    if (selector.length > 200) {
      showNotification('选择器过长（最多200字符）', 'error');
      return;
    }

    currentSettings.customSelectors.push(selector);
    selectorInput.value = '';
    renderSelectors();
    showNotification('已添加选择器');
  }

  // 移除自定义选择器
  function removeSelector(selector) {
    const index = currentSettings.customSelectors.indexOf(selector);
    if (index > -1) {
      currentSettings.customSelectors.splice(index, 1);
      renderSelectors();
      showNotification('已移除选择器');
    }
  }

  // 渲染自定义选择器
  function renderSelectors() {
    while (selectorList.firstChild) {
      selectorList.removeChild(selectorList.firstChild);
    }

    if (currentSettings.customSelectors.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = '暂无自定义选择器';
      selectorList.appendChild(emptyMessage);
      return;
    }

    currentSettings.customSelectors.forEach(selector => {
      const item = createListItem(selector, () => removeSelector(selector));
      selectorList.appendChild(item);
    });
  }

  // 创建列表项
  function createListItem(text, onRemove) {
    const item = document.createElement('div');
    item.className = 'list-entry';

    const span = document.createElement('span');
    span.className = 'list-entry-text';
    span.textContent = text;
    span.title = text;

    const button = document.createElement('button');
    button.className = 'list-entry-remove';
    button.textContent = '×';
    button.title = '移除';
    button.addEventListener('click', onRemove);

    item.appendChild(span);
    item.appendChild(button);

    return item;
  }

  // 保存设置
  function saveSettings() {
    const settings = {
      whitelist: currentSettings.whitelist,
      blacklist: currentSettings.blacklist,
      fontSize: currentSettings.fontSize,
      lineHeight: currentSettings.lineHeight,
      eyeCareMode: currentSettings.eyeCareMode,
      customSelectors: currentSettings.customSelectors
    };

    chrome.storage.sync.set({
      autoEnable: currentSettings.autoEnable,
      eyeCareMode: currentSettings.eyeCareMode,
      focusModeSettings: settings
    }, () => {
      showNotification('设置已保存', 'success');

      // 通知所有标签页更新设置
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateSettings',
            settings: settings
          }).catch(() => {
            // 忽略无法发送消息的标签页
          });
        });
      });
    });
  }

  // 重置设置
  function resetSettings() {
    if (confirm('确定要重置所有设置吗？')) {
      currentSettings = { ...DEFAULT_SETTINGS };
      updateUI();
      showNotification('设置已重置');
    }
  }

  // 显示通知
  function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // 初始化
  init();

})();
