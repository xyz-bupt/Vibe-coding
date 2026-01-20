// 专注模式 - 内容脚本
// Focus Mode - Content Script

(function() {
  'use strict';

  // 状态管理
  let isFocusModeEnabled = false;
  let originalElements = [];
  let focusContainer = null;
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
    // HTML5 语义标签
    'article',
    'main',
    '[role="main"]',

    // 常见 ID
    '#content',
    '#main',
    '#article',
    '#post',
    '#story',
    '#entry',

    // 文章内容类名
    '.article-content',
    '.article-body',
    '.post-content',
    '.post-body',
    '.entry-content',
    '.entry-body',
    '.content',
    '.main-content',
    '.text-content',
    '.story-body',
    '.post-detail',

    // Markdown 文档
    '.markdown-body',
    '.prose',
    '.markdown',

    // 技术文档
    '.docs-content',
    '.documentation',
    '.tech-content',
    '.md-content',

    // 结构化数据
    '[itemprop="articleBody"]',
    '[itemprop="text"]',

    // 新闻博客
    '.news-content',
    '.blog-content',
    '.article-text',

    // 通用模式匹配
    '[class*="article"]',
    '[class*="post-"]',
    '[class*="entry-"]',
    '[class*="content-body"]',
    '[class*="story-content"]'
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
      // 保存当前状态
      saveOriginalState();

      // 移除干扰元素
      removeDistractions();

      // 创建专注容器（只包含控制栏）
      createFocusContainer();

      // 直接操作原始DOM，不克隆
      prepareOriginalContent();

      // 应用样式
      applyFocusStyles();

      // 添加护眼模式
      if (settings.eyeCareMode) {
        enableEyeCareMode();
      }

      isFocusModeEnabled = true;

      // 发送状态更新
      notifyStatusChange();

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

      // 恢复被隐藏的元素
      restoreHiddenElements();

      // 恢复原始元素
      restoreOriginalState();

      // 移除护眼模式
      disableEyeCareMode();

      // 关键修复：移除body和html的类名，防止黑屏
      document.body.classList.remove('focus-mode-enabled');
      document.documentElement.classList.remove('focus-mode-enabled');

      isFocusModeEnabled = false;

      // 发送状态更新
      notifyStatusChange();

    } catch (error) {
      console.error('禁用专注模式失败:', error);
    }
  }

  // 恢复被隐藏的元素
  function restoreHiddenElements() {
    const hiddenElements = document.querySelectorAll('[data-focus-hidden="true"]');
    hiddenElements.forEach(el => {
      if (el && el.style) {
        // 恢复原始 display 值
        const originalDisplay = el.dataset.focusOriginalDisplay;
        if (originalDisplay) {
          el.style.display = originalDisplay;
        } else {
          el.style.display = '';
        }
        // 清理 dataset
        delete el.dataset.focusHidden;
        delete el.dataset.focusOriginalDisplay;
      }
    });
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
            // 保存原始 display 值
            if (!el.dataset.focusOriginalDisplay) {
              el.dataset.focusOriginalDisplay = el.style.display || '';
            }
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

    // 只添加控制栏，不创建内容容器
    const controlBar = createControlBar();
    focusContainer.appendChild(controlBar);

    // 插入到页面（作为覆盖层）
    document.body.appendChild(focusContainer);
    document.body.classList.add('focus-mode-enabled');
    document.documentElement.classList.add('focus-mode-enabled');
  }

  // 创建控制栏
  function createControlBar() {
    const controlBar = document.createElement('div');
    controlBar.id = 'focus-control-bar';

    const title = document.createElement('span');
    title.className = 'focus-title';
    title.textContent = '专注模式已启用';

    const closeButton = document.createElement('button');
    closeButton.className = 'focus-close-button';
    closeButton.textContent = '✕';
    closeButton.title = '退出专注模式';
    closeButton.style.pointerEvents = 'auto';
    closeButton.style.position = 'relative';
    closeButton.style.zIndex = '9991000';
    closeButton.addEventListener('click', () => disableFocusMode());

    const settingsButton = document.createElement('button');
    settingsButton.className = 'focus-settings-button';
    settingsButton.textContent = '⚙';
    settingsButton.title = '打开设置';
    settingsButton.style.pointerEvents = 'auto';
    settingsButton.style.position = 'relative';
    settingsButton.style.zIndex = '9991000';
    settingsButton.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    controlBar.appendChild(title);
    controlBar.appendChild(settingsButton);
    controlBar.appendChild(closeButton);

    return controlBar;
  }

  // 准备原始内容（不克隆，直接操作DOM）
  function prepareOriginalContent() {
    let mainElement = null;

    // 尝试找到主要内容元素
    for (const selector of CONTENT_SELECTORS) {
      try {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim().length > 100) {
          mainElement = element;
          break;
        }
      } catch (e) {
        // 跳过无效选择器
      }
    }

    // 如果没有找到，使用智能提取
    if (!mainElement) {
      mainElement = intelligentlyFindMainContent();
    }

    if (mainElement) {
      // 保存主要内容元素的引用
      focusContainer.dataset.mainContentId = mainElement.id || '';
      focusContainer.dataset.mainContentClass = mainElement.className || '';

      // 隐藏body的直接子元素，但保留主要内容的祖先链
      const bodyChildren = Array.from(document.body.children);
      bodyChildren.forEach(child => {
        // 跳过focusContainer本身
        if (child.id === 'focus-mode-container') return;

        // 检查这个子元素是否是主要内容的祖先
        const isAncestor = child.contains(mainElement);

        if (isAncestor) {
          // 这是主要内容的祖先，保留它（但可能需要清理其内部的其他子元素）
          child.dataset.focusOriginalDisplay = child.style.display || '';
          child.style.display = '';

          // 如果这个元素包含其他不是主要内容祖先的子元素，隐藏它们
          const grandChildren = Array.from(child.children);
          grandChildren.forEach(gc => {
            // 跳过主要内容本身
            if (gc === mainElement) return;

            // 如果不是主要内容的祖先，隐藏它
            if (!gc.contains(mainElement)) {
              gc.dataset.focusOriginalDisplay = gc.style.display || '';
              gc.style.display = 'none';
              gc.dataset.focusHidden = 'true';
            }
          });
        } else {
          // 不是主要内容的祖先，隐藏它
          child.dataset.focusOriginalDisplay = child.style.display || '';
          child.style.display = 'none';
          child.dataset.focusHidden = 'true';
        }
      });

      // 确保主要内容及其祖先都可见
      let current = mainElement;
      while (current && current !== document.body) {
        current.style.display = '';
        current = current.parentElement;
      }

    } else {
      // 未找到主要内容，显示提示
      showNoContentMessage();
    }
  }

  // 智能查找主要内容（不克隆）
  function intelligentlyFindMainContent() {
    let bestElement = null;
    let maxScore = 0;

    const EXCLUDE_SELECTORS = [
      'nav', 'footer', 'header', 'aside',
      '[class*="sidebar"]', '[class*="comment"]',
      '[class*="navigation"]', '[class*="menu"]',
      '[class*="related"]', '[class*="recommend"]'
    ];

    const elements = document.querySelectorAll('div, section, article, main');

    elements.forEach(el => {
      // 检查是否应该排除
      let shouldExclude = false;
      for (const selector of EXCLUDE_SELECTORS) {
        try {
          if (el.matches(selector) || el.closest(selector)) {
            shouldExclude = true;
            break;
          }
        } catch (e) {}
      }
      if (shouldExclude) return;

      let score = 0;
      const pCount = el.querySelectorAll('p').length;
      score += pCount * 10;

      const textLength = el.textContent.trim().length;
      if (textLength > 200 && textLength < 100000) {
        score += Math.min(20, Math.floor(textLength / 1000));
      }

      const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      score += headings * 5;

      const lists = el.querySelectorAll('ul, ol').length;
      score += lists * 3;

      if (score > maxScore) {
        maxScore = score;
        bestElement = el;
      }
    });

    return bestElement;
  }

  // 显示无内容提示
  function showNoContentMessage() {
    const message = document.createElement('div');
    message.id = 'focus-no-content-message';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 2147483647;
      text-align: center;
    `;

    message.innerHTML = `
      <h2>未找到主要内容</h2>
      <p>专注模式无法识别此页面的主要内容区域。</p>
      <ul style="text-align: left; display: inline-block;">
        <li>尝试刷新页面后重新启用专注模式</li>
        <li>在设置中添加自定义内容选择器</li>
        <li>反馈此页面给开发者</li>
      </ul>
      <button id="focus-close-no-content" style="
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        background: #667eea;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
      ">关闭专注模式</button>
    `;

    document.body.appendChild(message);

    document.getElementById('focus-close-no-content').addEventListener('click', () => {
      message.remove();
      disableFocusMode();
    });
  }

  // 保留表单状态
  function preserveFormStates(source, target) {
    const sourceForms = source.querySelectorAll('input, textarea, select');

    sourceForms.forEach((sourceEl) => {
      // 使用选择器精确匹配目标元素
      let selector;
      if (sourceEl.id) {
        // 使用CSS.escape防止ID注入
        const escapedId = sourceEl.id.replace(/([:.])/g, '\\$1');
        selector = `#${escapedId}`;
      } else if (sourceEl.name) {
        const escapedName = sourceEl.name.replace(/([:.])/g, '\\$1');
        // 结合标签类型和name属性
        const tagType = sourceEl.type ? `[type="${sourceEl.type}"]` : '';
        selector = `${sourceEl.tagName.toLowerCase()}[name="${escapedName}"]${tagType}`;
      } else {
        return; // 无法唯一识别，跳过
      }

      const targetEl = target.querySelector(selector);
      if (!targetEl) return;

      // 类型匹配验证
      if (sourceEl.type !== targetEl.type) return;

      try {
        if (sourceEl.type === 'checkbox' || sourceEl.type === 'radio') {
          targetEl.checked = sourceEl.checked;
        } else if (sourceEl.tagName === 'SELECT') {
          targetEl.selectedIndex = sourceEl.selectedIndex;
          // 同步选中的option
          if (sourceEl.selectedIndex >= 0 && sourceEl.options[sourceEl.selectedIndex]) {
            const value = sourceEl.options[sourceEl.selectedIndex].value;
            // 尝试通过value或text匹配
            for (let i = 0; i < targetEl.options.length; i++) {
              if (targetEl.options[i].value === value ||
                  targetEl.options[i].text === sourceEl.options[sourceEl.selectedIndex].text) {
                targetEl.selectedIndex = i;
                break;
              }
            }
          }
        } else if (sourceEl.type !== 'file') {
          // 跳过file input（无法通过JS设置）
          targetEl.value = sourceEl.value;
        }
      } catch (e) {
        // 某些表单元素可能只读或受限制
        console.warn('Failed to preserve form state for', sourceEl, e);
      }
    });
  }

  // 重新附加表单事件监听器
  function reattachFormEvents(source, target) {
    // 为克隆的表单元素添加基本的交互能力
    const formElements = target.querySelectorAll('input, textarea, select, button');
    formElements.forEach(el => {
      // 确保元素可以交互
      el.style.pointerEvents = 'auto';
      el.style.position = 'relative';
      el.style.zIndex = '5';

      // 对于checkbox和radio，确保它们可以被点击
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.style.cursor = 'pointer';
        // 确保点击标签也能触发
        const label = el.closest('label');
        if (label) {
          label.style.pointerEvents = 'auto';
          label.style.cursor = 'pointer';
        }
      }

      // 对于按钮，确保可以点击
      if (el.tagName === 'BUTTON') {
        el.style.cursor = 'pointer';
      }
    });
  }

  // 增强表单元素的交互性
  function enhanceFormInteractivity(container) {
    // 查找所有表单元素并确保它们可以交互
    const interactiveElements = container.querySelectorAll(
      'input, textarea, select, button, [type="checkbox"], [type="radio"], label'
    );

    interactiveElements.forEach(el => {
      // 强制启用交互
      el.style.pointerEvents = 'auto';
      el.style.position = 'relative';
      el.style.zIndex = '5';

      // 移除可能的disabled属性（如果原本不是disabled）
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.tagName === 'BUTTON') {
        if (!el.hasAttribute('disabled') && el.disabled) {
          el.disabled = false;
        }
      }

      // 对于checkbox和radio，添加额外的点击处理
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.style.cursor = 'pointer';
        el.style.appearance = 'auto';
        el.style.webkitAppearance = 'auto';

        // 确保点击能触发状态改变
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          // 让默认行为发生
        }, { capture: true });
      }

      // 对于标签元素
      if (el.tagName === 'LABEL') {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
      }

      // 对于select元素
      if (el.tagName === 'SELECT') {
        el.style.cursor = 'pointer';
        el.style.appearance = 'auto';
        el.style.webkitAppearance = 'auto';
      }
    });
  }

  // 智能提取内容
  function intelligentlyExtractContent() {
    let bestElement = null;
    let maxScore = 0;

    // 排除选择器
    const EXCLUDE_SELECTORS = [
      'nav', 'footer', 'header', 'aside',
      '[class*="sidebar"]', '[class*="comment"]',
      '[class*="navigation"]', '[class*="menu"]',
      '[class*="related"]', '[class*="recommend"]'
    ];

    // 评分系统
    const elements = document.querySelectorAll('div, section, article, main');
    elements.forEach(el => {
      // 检查是否应该排除
      let shouldExclude = false;
      for (const selector of EXCLUDE_SELECTORS) {
        try {
          if (el.matches(selector) || el.closest(selector)) {
            shouldExclude = true;
            break;
          }
        } catch (e) {
          // 跳过无效选择器
        }
      }
      if (shouldExclude) return;

      let score = 0;

      // 检查段落数量(提高权重)
      const pCount = el.querySelectorAll('p').length;
      score += pCount * 10;

      // 检查文本长度(更合理的范围)
      const textLength = el.textContent.trim().length;
      if (textLength > 200 && textLength < 100000) {
        score += Math.min(20, Math.floor(textLength / 1000));
      }

      // 检查标题
      const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      score += headings * 5;

      // 检查列表
      const lists = el.querySelectorAll('ul, ol').length;
      score += lists * 3;

      // 计算链接密度并惩罚（优化性能）
      if (textLength > 100) {
        const links = el.getElementsByTagName('a');
        const linkCount = links.length;

        // 限制处理的链接数量以提升性能
        const maxLinksToCheck = Math.min(linkCount, 50);
        let linkTextLength = 0;

        for (let i = 0; i < maxLinksToCheck; i++) {
          linkTextLength += (links[i].textContent || '').trim().length;
        }

        // 计算链接密度
        const linkDensity = linkTextLength / textLength;

        // 更精细的惩罚策略
        if (linkDensity > 0.7) {
          score *= 0.1; // 高度链接密集，可能是导航
        } else if (linkDensity > 0.5) {
          score *= 0.3; // 中等链接密集
        } else if (linkDensity > 0.3) {
          score *= 0.6; // 轻微链接密集
        }

        // 补偿：如果段落很多，可能是文章列表
        const pCount = el.querySelectorAll('p').length;
        if (pCount > 5 && linkDensity > 0.3) {
          score += pCount * 5; // 补偿段落分数
        }
      }

      // 检查是否包含文章相关的类名或ID
      const className = (el.className || '').toLowerCase();
      const elementId = (el.id || '').toLowerCase();

      const positiveKeywords = ['content', 'article', 'post', 'entry', 'main', 'body', 'text'];
      const negativeKeywords = ['sidebar', 'nav', 'menu', 'comment', 'footer', 'header', 'ad'];

      for (const keyword of positiveKeywords) {
        if (className.includes(keyword) || elementId.includes(keyword)) {
          score += 30;
        }
      }

      for (const keyword of negativeKeywords) {
        if (className.includes(keyword) || elementId.includes(keyword)) {
          score -= 50;
        }
      }

      // 标签名称加分
      const tagName = el.tagName.toLowerCase();
      if (tagName === 'article') score += 50;
      if (tagName === 'main') score += 40;

      if (score > maxScore) {
        maxScore = score;
        bestElement = el;
      }
    });

    if (!bestElement) return null;

    const clonedElement = bestElement.cloneNode(true);

    // 保留表单状态
    preserveFormStates(bestElement, clonedElement);
    // 重建交互能力
    reattachFormEvents(bestElement, clonedElement);

    return clonedElement;
  }

  // 清理内容
  function cleanContent(element) {
    if (!element) return;

    // 移除隐藏的元素（更全面的选择器）
    const hiddenElements = element.querySelectorAll(
      '[style*="display: none"], [style*="display:none"], ' +
      '[style*="visibility: hidden"], [style*="visibility:hidden"], ' +
      '[hidden]'
    );
    hiddenElements.forEach(el => el.remove());

    // 移除脚本和样式（防止 XSS 攻击）
    const scriptsAndStyles = element.querySelectorAll('script, style, noscript');
    scriptsAndStyles.forEach(el => el.remove());

    // 添加iframe白名单并移除其他iframe（更安全的域名匹配）
    const IFRAME_WHITELIST = [
      'youtube.com', 'youtu.be', 'vimeo.com',
      'bilibili.com', 'dailymotion.com',
      'google.com/maps', 'maps.google.com', 'openstreetmap.org',
      'soundcloud.com', 'spotify.com',
      'codepen.io', 'jsfiddle.net',
      'docs.google.com'
    ];

    // 安全的域名匹配函数
    function isWhitelistedDomain(src) {
      if (!src || src === 'about:blank') return false;

      try {
        // 处理相对 URL
        if (src.startsWith('/') || src.startsWith('./')) {
          return false;
        }

        const url = new URL(src, window.location.href);
        const hostname = url.hostname.toLowerCase();

        return IFRAME_WHITELIST.some(whitelist => {
          // 精确匹配或子域名匹配
          const whitelistDomain = whitelist.toLowerCase();
          return hostname === whitelistDomain ||
                 hostname.endsWith('.' + whitelistDomain);
        });
      } catch (e) {
        return false;
      }
    }

    const iframes = element.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      // 检查多个可能的属性
      const src = iframe.src ||
                  iframe.getAttribute('data-src') ||
                  iframe.getAttribute('data-lazy-src') ||
                  iframe.getAttribute('src');

      if (!isWhitelistedDomain(src)) {
        iframe.remove();
      } else {
        // 添加沙盒属性以提高安全性
        iframe.setAttribute('sandbox',
          'allow-scripts allow-same-origin allow-presentation allow-forms');
      }
    });

    const objectsAndEmbeds = element.querySelectorAll('object, embed');
    objectsAndEmbeds.forEach(el => el.remove());

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
        // 移除javascript:伪协议
        if (attrName === 'href' && attributes[i].value?.startsWith('javascript:')) {
          el.removeAttribute(attrName);
        }
      }
    });

    // 保留空表格单元格（使用textContent更安全）
    const emptyCells = element.querySelectorAll('td:empty, th:empty');
    emptyCells.forEach(cell => {
      cell.textContent = '\u00A0'; // 使用不间断空格
    });

    // 移除空元素（更精确的判断）
    const emptyElements = element.querySelectorAll(':empty');
    const emptyArray = Array.from(emptyElements).slice(0, 500);
    const validEmptyTags = new Set([
      'BR', 'WBR', 'AREA', 'PARAM', 'SOURCE', 'TRACK', 'COL', 'HR',
      'INPUT', 'IMG', 'KEYGEN', 'OBJECT', 'EMBED', 'IFRAME', 'COLGROUP'
    ]);

    emptyArray.forEach(el => {
      const tagName = el.tagName;

      // 保留有效的空元素
      if (validEmptyTags.has(tagName)) return;
      if (tagName === 'TD' || tagName === 'TH') return;

      // 保留带有特定类的元素
      if (el.classList.contains('placeholder') ||
          el.classList.contains('spacer') ||
          el.classList.contains('clear')) return;

      if (!el.textContent.trim() &&
          !el.querySelector('img, video, canvas, svg, iframe, audio')) {
        el.remove();
      }
    });

    // 更精确的广告选择器
    const adSelectors = [
      '[class*="-ad-"]', '[class*="-ads"]',
      '[class*="_ad"]', '[class*="_ads"]',
      '[id*="-ad-"]', '[id*="-ads"]',
      '[class="ad"]', '[class="ads"]',
      '[class="advertisement"]', '[class*="advertisement"]',
      '[class*="sponsored"]', '[class*="sponsor"]',
      '[class*="banner"]:not([class*="banner-content"]):not([class*="breadcrumb"])'
    ];

    adSelectors.forEach(selector => {
      try {
        const ads = element.querySelectorAll(selector);
        ads.forEach(el => el.remove());
      } catch (e) {
        // 跳过无效选择器
      }
    });
  }

  // 应用专注样式
  function applyFocusStyles() {
    const body = document.body;

    // 设置字体大小和行高
    body.style.setProperty('--focus-font-size', settings.fontSize + 'px');
    body.style.setProperty('--focus-line-height', settings.lineHeight);
  }

  // 启用护眼模式
  function enableEyeCareMode() {
    const overlay = document.createElement('div');
    overlay.id = 'focus-eye-care-overlay';
    overlay.className = 'focus-eye-care-active';
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
  });

  // 初始化
  init();

})();
