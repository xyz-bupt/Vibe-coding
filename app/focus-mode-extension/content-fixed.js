// 专注模式 - 内容脚本（修复版）
// Focus Mode - Content Script (Fixed)

(function() {
  'use strict';

  // 状态管理
  let isFocusModeEnabled = false;
  let originalElements = [];
  let focusContainer = null;
  let previousActiveElement = null;  // 保存焦点位置
  let settings = {
    whitelist: [],
    blacklist: [],
    fontSize: 18,
    lineHeight: 1.8,
    eyeCareMode: false,
    customSelectors: []
  };

  // 常见的干扰元素选择器
  const DISTRACTION_SELECTORS = [
    // 广告
    '[class*="ad"]', '[class*="ads"]', '[class*="advertisement"]',
    '[id*="ad"]', '[id*="ads"]', '[id*="advertisement"]',
    '[class*="banner"]', '[class*="sponsor"]',
    'iframe[src*="ads"]', 'iframe[src*="banner"]',

    // 侧边栏
    '[class*="sidebar"]', '[class*="side-bar"]', '[class*="aside"]',
    '[id*="sidebar"]', '[id*="side-bar"]', '[id*="aside"]',
    'aside', '.sidebar', '.side-bar',

    // 评论
    '[class*="comment"]', '[id*="comment"]',
    '[class*="discussion"]', '[class*="reply"]',
    '.comments', '.comment-section',

    // 推荐内容
    '[class*="recommend"]', '[class*="related"]',
    '[class*="suggestion"]', '[class*="trending"]',
    '.recommended', '.related-posts', '.suggestions',

    // 社交媒体
    '[class*="social"]', '[class*="share"]',
    '[class*="follow"]', '[class*="subscribe"]',
    '.social-media', '.share-buttons',

    // 导航和页脚（可选）
    'nav', 'footer', '.navigation', '.menu',

    // 弹窗和模态框
    '[class*="modal"]', '[class*="popup"]', '[class*="overlay"]',
    '[class*="dialog"]', '[class*="lightbox"]',

    // 其他干扰
    '[class*="newsletter"]', '[class*="widget"]',
    '[class*="promo"]', '[class*="promotion"]'
  ];

  // 主要内容选择器
  const CONTENT_SELECTORS = [
    'article',
    '[role="main"]',
    'main',
    '.content',
    '.post-content',
    '.article-content',
    '.entry-content',
    '#content',
    '#main',
    '.main-content',
    '[class*="article"]',
    '[class*="post-body"]'
  ];

  // 初始化
  function init() {
    loadSettings();
    setupMessageListener();
    checkAutoEnable();
  }

  // 加载设置
  function loadSettings() {
    chrome.storage.sync.get(['focusModeSettings'], (result) => {
      if (result.focusModeSettings) {
        settings = { ...settings, ...result.focusModeSettings };
      }
    });
  }

  // 检查是否自动启用
  function checkAutoEnable() {
    const currentUrl = window.location.href;

    // 检查白名单
    if (settings.whitelist.length > 0) {
      const inWhitelist = settings.whitelist.some(pattern => {
        return matchPattern(currentUrl, pattern);
      });
      if (!inWhitelist) return;
    }

    // 检查黑名单
    if (settings.blacklist.length > 0) {
      const inBlacklist = settings.blacklist.some(pattern => {
        return matchPattern(currentUrl, pattern);
      });
      if (inBlacklist) return;
    }

    // 检查自动启用设置
    chrome.storage.sync.get(['autoEnable'], (result) => {
      if (result.autoEnable) {
        enableFocusMode();
      }
    });
  }

  // URL 模式匹配（安全版本，防止 ReDoS 攻击）
  function matchPattern(url, pattern) {
    try {
      // 转义特殊字符，但保留通配符 *
      const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
      // 限制模式长度和复杂度
      if (escapedPattern.length > 1000) {
        console.warn('Pattern too long, skipping:', pattern);
        return false;
      }
      const regex = new RegExp(escapedPattern);
      return regex.test(url);
    } catch (e) {
      console.warn('Invalid pattern:', pattern, e);
      return false;
    }
  }

  // 设置消息监听器（异步响应支持）
  function setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      // 验证消息来源
      if (sender.id !== chrome.runtime.id) {
        return false;
      }

      switch (request.action) {
        case 'toggleFocus':
          toggleFocusMode();
          sendResponse({ success: true });
          return false;

        case 'enableFocus':
          enableFocusMode();
          sendResponse({ success: true });
          return false;

        case 'disableFocus':
          disableFocusMode();
          sendResponse({ success: true });
          return false;

        case 'getStatus':
          sendResponse({ enabled: isFocusModeEnabled });
          return false;

        case 'updateSettings':
          settings = { ...settings, ...request.settings };
          if (isFocusModeEnabled) {
            disableFocusMode();
            enableFocusMode();
          }
          sendResponse({ success: true });
          return false;

        default:
          return false;
      }
    });
  }

  // 切换专注模式
  function toggleFocusMode() {
    if (isFocusModeEnabled) {
      disableFocusMode();
    } else {
      enableFocusMode();
    }
  }

  // 启用专注模式
  function enableFocusMode() {
    if (isFocusModeEnabled) return;

    try {
      // 保存当前焦点位置
      previousActiveElement = document.activeElement;

      // 保存当前状态
      saveOriginalState();

      // 移除干扰元素
      removeDistractions();

      // 创建专注容器
      createFocusContainer();

      // 提取主要内容
      extractMainContent();

      // 应用样式
      applyFocusStyles();

      // 添加护眼模式
      if (settings.eyeCareMode) {
        enableEyeCareMode();
      }

      isFocusModeEnabled = true;

      // 发送状态更新
      notifyStatusChange();

      // 将焦点移动到关闭按钮
      setTimeout(() => {
        const closeButton = focusContainer.querySelector('.focus-close-button');
        if (closeButton && closeButton.focus) {
          closeButton.focus();
        }
      }, 100);

    } catch (error) {
      console.error('启用专注模式失败:', error);
    }
  }

  // 禁用专注模式
  function disableFocusMode() {
    if (!isFocusModeEnabled) return;

    try {
      // 移除专注容器
      if (focusContainer) {
        focusContainer.remove();
        focusContainer = null;
      }

      // 恢复原始元素
      restoreOriginalState();

      // 移除护眼模式
      disableEyeCareMode();

      isFocusModeEnabled = false;

      // 发送状态更新
      notifyStatusChange();

      // 恢复焦点位置
      setTimeout(() => {
        if (previousActiveElement && previousActiveElement.focus) {
          previousActiveElement.focus();
        }
      }, 100);

    } catch (error) {
      console.error('禁用专注模式失败:', error);
    }
  }

  // 保存原始状态
  function saveOriginalState() {
    originalElements = [];

    // 保存 body 的原始样式
    const body = document.body;
    originalElements.push({
      type: 'body-style',
      style: body.getAttribute('style')
    });

    // 保存 html 的原始类
    const html = document.documentElement;
    originalElements.push({
      type: 'html-class',
      className: html.className
    });
  }

  // 恢复原始状态
  function restoreOriginalState() {
    originalElements.forEach(item => {
      if (item.type === 'body-style') {
        const body = document.body;
        if (item.style) {
          body.setAttribute('style', item.style);
        } else {
          body.removeAttribute('style');
        }
      } else if (item.type === 'html-class') {
        const html = document.documentElement;
        html.className = item.className;
      }
    });

    originalElements = [];
  }

  // 移除干扰元素
  function removeDistractions() {
    const selectors = [...DISTRACTION_SELECTORS, ...settings.customSelectors];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // 只隐藏，不移除，以便恢复
          if (el && el.style) {
            el.style.display = 'none';
            el.dataset.focusHidden = 'true';
          }
        });
      } catch (e) {
        // 忽略无效选择器
      }
    });
  }

  // 创建专注容器
  function createFocusContainer() {
    focusContainer = document.createElement('div');
    focusContainer.id = 'focus-mode-container';
    focusContainer.className = 'focus-mode-active';

    // 添加 ARIA 属性
    focusContainer.setAttribute('role', 'dialog');
    focusContainer.setAttribute('aria-modal', 'true');
    focusContainer.setAttribute('aria-label', '专注模式视图');

    // 添加控制栏
    const controlBar = createControlBar();
    focusContainer.appendChild(controlBar);

    // 添加内容容器
    const contentContainer = document.createElement('div');
    contentContainer.id = 'focus-content';
    contentContainer.setAttribute('role', 'main');
    contentContainer.setAttribute('aria-live', 'polite');
    focusContainer.appendChild(contentContainer);

    // 插入到页面
    document.body.appendChild(focusContainer);
    document.body.classList.add('focus-mode-enabled');
    document.documentElement.classList.add('focus-mode-enabled');
  }

  // 创建控制栏
  function createControlBar() {
    const controlBar = document.createElement('div');
    controlBar.id = 'focus-control-bar';
    controlBar.setAttribute('role', 'banner');
    controlBar.setAttribute('aria-label', '专注模式控制栏');

    const title = document.createElement('span');
    title.className = 'focus-title';
    title.textContent = '专注模式已启用';
    title.setAttribute('role', 'status');
    title.setAttribute('aria-live', 'polite');

    const settingsButton = document.createElement('button');
    settingsButton.className = 'focus-settings-button';
    settingsButton.textContent = '⚙';
    settingsButton.title = '打开设置';
    settingsButton.setAttribute('aria-label', '打开设置');
    settingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    const closeButton = document.createElement('button');
    closeButton.className = 'focus-close-button';
    closeButton.textContent = '✕ 关闭';
    closeButton.title = '退出专注模式';
    closeButton.setAttribute('aria-label', '退出专注模式');
    closeButton.addEventListener('click', () => disableFocusMode());

    controlBar.appendChild(title);
    controlBar.appendChild(settingsButton);
    controlBar.appendChild(closeButton);

    return controlBar;
  }

  // 提取主要内容
  function extractMainContent() {
    const contentContainer = focusContainer.querySelector('#focus-content');
    if (!contentContainer) return;

    let mainContent = null;

    // 尝试找到主要内容
    for (const selector of CONTENT_SELECTORS) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 100) {
        mainContent = element.cloneNode(true);
        break;
      }
    }

    // 如果没有找到明确的主要内容，尝试智能提取
    if (!mainContent) {
      mainContent = intelligentlyExtractContent();
    }

    if (mainContent) {
      // 清理内容
      cleanContent(mainContent);
      contentContainer.appendChild(mainContent);
    } else {
      // 如果没有找到内容，显示提示
      const message = document.createElement('div');
      message.className = 'focus-no-content';
      message.setAttribute('role', 'alert');

      const heading = document.createElement('h2');
      heading.textContent = '未找到主要内容';

      const paragraph = document.createElement('p');
      paragraph.textContent = '此页面可能不适合专注模式';

      const closeButton = document.createElement('button');
      closeButton.textContent = '关闭专注模式';
      closeButton.setAttribute('aria-label', '关闭专注模式');
      closeButton.addEventListener('click', () => disableFocusMode());

      message.appendChild(heading);
      message.appendChild(paragraph);
      message.appendChild(closeButton);
      contentContainer.appendChild(message);
    }
  }

  // 智能提取内容
  function intelligentlyExtractContent() {
    const paragraphs = document.querySelectorAll('p');
    let bestElement = null;
    let maxScore = 0;

    // 评分系统
    const elements = document.querySelectorAll('div, section, article');
    elements.forEach(el => {
      let score = 0;

      // 检查段落数量
      const pCount = el.querySelectorAll('p').length;
      score += pCount * 2;

      // 检查文本长度
      const textLength = el.textContent.trim().length;
      if (textLength > 500 && textLength < 50000) {
        score += 10;
      }

      // 检查标题
      const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      score += headings * 3;

      // 检查是否包含文章相关的类名
      const className = el.className.toLowerCase();
      if (className.includes('content') || className.includes('article') ||
          className.includes('post') || className.includes('entry')) {
        score += 20;
      }

      if (score > maxScore) {
        maxScore = score;
        bestElement = el;
      }
    });

    return bestElement ? bestElement.cloneNode(true) : null;
  }

  // 清理内容
  function cleanContent(element) {
    if (!element) return;

    // 移除隐藏的元素
    const hiddenElements = element.querySelectorAll('[style*="display: none"], [style*="display:none"]');
    hiddenElements.forEach(el => el.remove());

    // 移除脚本和样式（防止 XSS 攻击）
    const scriptsAndStyles = element.querySelectorAll('script, style, noscript, iframe, object, embed');
    scriptsAndStyles.forEach(el => el.remove());

    // 移除事件处理器以防 XSS
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      // 移除内联事件处理器
      const attributes = el.attributes;
      for (let i = attributes.length - 1; i >= 0; i--) {
        const attrName = attributes[i].name.toLowerCase();
        if (attrName.startsWith('on')) {
          el.removeAttribute(attrName);
        }
      }
    });

    // 移除空元素（优化性能，限制查询数量）
    const emptyElements = element.querySelectorAll(':empty');
    const emptyArray = Array.from(emptyElements).slice(0, 500); // 限制处理数量
    emptyArray.forEach(el => {
      if (!el.textContent.trim() && !el.querySelector('img, video, canvas, svg')) {
        el.remove();
      }
    });

    // 移除广告和剩余干扰
    const ads = element.querySelectorAll('[class*="ad"], [id*="ad"], [class*="banner"]');
    ads.forEach(el => el.remove());

    // 为表格添加滚动容器
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-wrapper';

      // 在移动端添加 data-label 属性（需要表头）
      if (window.innerWidth <= 768) {
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
        table.querySelectorAll('tr').forEach(row => {
          row.querySelectorAll('td').forEach((cell, index) => {
            if (headers[index]) {
              cell.setAttribute('data-label', headers[index]);
            }
          });
        });
        table.classList.add('mobile-stack');
      }

      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // 清理表格中的空单元格
    const emptyCells = element.querySelectorAll('td:empty, th:empty');
    emptyCells.forEach(cell => {
      cell.innerHTML = '&nbsp;';
    });
  }

  // 应用专注样式
  function applyFocusStyles() {
    const container = document.getElementById('focus-mode-container');
    if (!container) return;

    // 验证并设置字体大小
    const fontSize = Math.max(12, Math.min(32, settings.fontSize));
    container.style.setProperty('--focus-font-size', `${fontSize}px`);

    // 验证并设置行高
    const lineHeight = Math.max(1.2, Math.min(2.5, settings.lineHeight));
    container.style.setProperty('--focus-line-height', lineHeight.toString());
  }

  // 启用护眼模式
  function enableEyeCareMode() {
    const overlay = document.createElement('div');
    overlay.id = 'focus-eye-care-overlay';
    overlay.className = 'focus-eye-care-active';
    overlay.setAttribute('aria-hidden', 'true');  // 对辅助技术隐藏
    document.body.appendChild(overlay);
  }

  // 禁用护眼模式
  function disableEyeCareMode() {
    const overlay = document.getElementById('focus-eye-care-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // 通知状态变化
  function notifyStatusChange() {
    chrome.runtime.sendMessage({
      action: 'focusStatusChanged',
      enabled: isFocusModeEnabled,
      url: window.location.href
    }).catch(() => {
      // 忽略错误
    });
  }

  // 监听键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + F
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault();
      toggleFocusMode();
    }

    // Escape 键退出专注模式
    if (e.key === 'Escape' && isFocusModeEnabled) {
      e.preventDefault();
      disableFocusMode();
    }
  });

  // 监听窗口大小变化，更新表格的 data-label
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isFocusModeEnabled) return;

      const tables = focusContainer.querySelectorAll('table');
      tables.forEach(table => {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
          const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);
          table.querySelectorAll('tr').forEach(row => {
            row.querySelectorAll('td').forEach((cell, index) => {
              if (headers[index]) {
                cell.setAttribute('data-label', headers[index]);
              }
            });
          });
          table.classList.add('mobile-stack');
        } else {
          table.classList.remove('mobile-stack');
          table.querySelectorAll('td').forEach(cell => {
            cell.removeAttribute('data-label');
          });
        }
      });
    }, 250);
  });

  // 初始化
  init();

})();
