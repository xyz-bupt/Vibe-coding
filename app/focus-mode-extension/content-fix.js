// 专注模式 - UI交互问题修复补丁
// Focus Mode - UI Interaction Issues Fix Patch
//
// 此文件包含针对已识别的UI交互问题的修复方案
// 使用方式：将此文件的内容合并到 content.js 中

(function() {
  'use strict';

  // ==========================================
  // 修复1: 扩展内容选择器（问题1.1）
  // ==========================================
  const IMPROVED_CONTENT_SELECTORS = [
    // 标准语义化标签
    'article', 'main', '[role="main"]',

    // 常见ID选择器
    '#content', '#main', '#article', '#post', '#story', '#entry',

    // 常见类名 - 优先级从高到低
    '.article-content', '.article-body', '.post-content', '.post-body',
    '.entry-content', '.entry-body', '.content', '.main-content',
    '.text-content', '.story-body', '.description', '.post-text',

    // 技术文档
    '.markdown-body', '.prose', '.docs-content', '.documentation',

    // 结构化数据
    '[itemprop="articleBody"]', '[itemprop="text"]',

    // 新闻和博客
    '.news-content', '.blog-content', '.post-detail',

    // 通用通配符匹配（放在最后以避免误判）
    '[class*="article"]', '[class*="post-"]', '[class*="entry-"]',
    '[class*="content-body"]', '[class*="story-content"]'
  ];

  // ==========================================
  // 修复2: 改进的智能提取算法（问题1.2）
  // ==========================================
  function improvedIntelligentlyExtractContent() {
    const elements = document.querySelectorAll('div, section, article, main');
    let bestElement = null;
    let maxScore = 0;

    elements.forEach(el => {
      let score = 0;

      // 检查段落数量
      const pCount = el.querySelectorAll('p').length;
      score += pCount * 3;

      // 检查文本长度（渐进式评分）
      const textLength = el.textContent.trim().length;
      if (textLength > 1000 && textLength < 50000) {
        score += Math.min(textLength / 500, 50);
      }

      // 检查标题
      const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
      score += headings * 2;

      // 检查结构化内容
      const lists = el.querySelectorAll('ul, ol').length;
      score += lists * 2;

      const tables = el.querySelectorAll('table').length;
      score += tables * 3;

      const blockquotes = el.querySelectorAll('blockquote').length;
      score += blockquotes * 2;

      const images = el.querySelectorAll('img').length;
      score += images;

      // 检查类名相关性
      const className = el.className.toLowerCase();
      const id = el.id.toLowerCase();
      if (className.includes('content') || className.includes('article') ||
          className.includes('post') || className.includes('entry') ||
          id.includes('content') || id.includes('article') || id.includes('post')) {
        score += 30;
      }

      // 惩罚高链接密度（可能是导航栏）
      const links = el.querySelectorAll('a').length;
      const linkText = Array.from(el.querySelectorAll('a'))
        .map(a => a.textContent.trim())
        .join(' ')
        .length;
      const totalText = el.textContent.trim().length;
      const linkDensity = totalText > 0 ? linkText / totalText : 0;

      if (linkDensity > 0.4) {
        score -= 60;
      }

      // 惩罚包含广告词的类名
      if (className.includes('ad-') || className.includes('ads-') ||
          className.includes('banner') || className.includes('sidebar') ||
          className.includes('comment')) {
        score -= 100;
      }

      // 优先选择更大的容器（避免选择子元素）
      const children = el.children.length;
      if (children > 3) {
        score += 5;
      }

      if (score > maxScore) {
        maxScore = score;
        bestElement = el;
      }
    });

    return bestElement ? bestElement.cloneNode(true) : null;
  }

  // ==========================================
  // 修复3: 改进的内容清理函数（问题1.3, 3.2, 3.3）
  // ==========================================
  function improvedCleanContent(element) {
    if (!element) return;

    // 1. 移除隐藏的元素
    const hiddenElements = element.querySelectorAll(
      '[style*="display: none"], [style*="display:none"], ' +
      '[style*="visibility: hidden"], [style*="visibility:hidden"], ' +
      '[hidden]'
    );
    hiddenElements.forEach(el => el.remove());

    // 2. 移除脚本和样式（但保留代码高亮样式）
    const scriptsAndStyles = element.querySelectorAll('script, style, noscript');
    scriptsAndStyles.forEach(el => {
      // 保留代码高亮相关的样式
      if (el.tagName.toLowerCase() === 'style') {
        const content = el.textContent;
        if (content.includes('.token') ||
            content.includes('.hljs') ||
            content.includes('.highlight') ||
            content.includes('.code')) {
          return; // 保留代码高亮样式
        }
      }
      el.remove();
    });

    // 3. 移除事件处理器（防止XSS）
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const attributes = el.attributes;
      for (let i = attributes.length - 1; i >= 0; i--) {
        const attrName = attributes[i].name.toLowerCase();
        if (attrName.startsWith('on')) {
          el.removeAttribute(attrName);
        }
      }
    });

    // 4. 移除空元素（但保留有意义的空元素）
    const emptyElements = element.querySelectorAll(':empty');
    const emptyArray = Array.from(emptyElements).slice(0, 500);
    emptyArray.forEach(el => {
      const tagName = el.tagName.toLowerCase();
      const hasClass = el.className && el.className.trim().length > 0;
      const isLayoutElement = ['td', 'th', 'br', 'hr', 'iframe'].includes(tagName);

      if (!el.textContent.trim() &&
          !el.querySelector('img, video, canvas, svg') &&
          !isLayoutElement &&
          !hasClass) {
        el.remove();
      }
    });

    // 5. 移除广告（使用更精确的选择器）
    const ads = element.querySelectorAll(
      '[class*="ad-"], [class*="ads-"], [class*="ads_"], ' +
      '[id*="ad-"], [id*="ads-"], [id*="ads_"], ' +
      '[class*="advertisement"], [class*="banner"], ' +
      '.ad-container, .ad-wrapper, .advertisement'
    );
    ads.forEach(el => el.remove());

    // 6. 移除非嵌入式的iframe（保留白名单）
    const iframes = element.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src || iframe.getAttribute('data-src');

      // 安全的嵌入服务白名单
      const safeSources = [
        'youtube.com', 'youtu.be', 'vimeo.com',
        'google.com/maps', 'maps.google.com',
        'codepen.io', 'jsfiddle.net', 'slideshare.net',
        'speakerdeck.com', 'embed.ly'
      ];

      const isSafe = safeSources.some(safeSrc =>
        src && (src.includes(safeSrc) || src.includes('cdn.embedly.com'))
      );

      if (!isSafe) {
        iframe.remove();
      } else {
        // 为安全的iframe添加沙盒属性
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
        // 确保可以交互
        iframe.style.pointerEvents = 'auto';
      }
    });

    // 7. 移除object和embed（但保留白名单）
    const objects = element.querySelectorAll('object, embed');
    objects.forEach(obj => {
      const src = obj.getAttribute('data') || obj.src;
      // 保留PDF查看器
      if (src && (src.includes('.pdf') || src.includes('application/pdf'))) {
        obj.style.pointerEvents = 'auto';
        return;
      }
      obj.remove();
    });
  }

  // ==========================================
  // 修复4: 优化的干扰元素选择器（问题3.1）
  // ==========================================
  const OPTIMIZED_DISTRACTION_SELECTORS = [
    // 广告：使用更精确的选择器
    '[class*="ad-"]', '[class*="ads-"]', '[class*="ads_"]',
    '[id*="ad-"]', '[id*="ads-"]', '[id*="ads_"]',
    '[class*="advertisement"]', '[class*="sponsorship"]',
    'iframe[src*="ads"]', 'iframe[src*="banner"]',

    // 侧边栏：更保守
    '.sidebar-secondary', '.sidebar-ads', '.sidebar-widgets',
    '.aside-ads', '.aside-widgets',

    // 评论：可选删除
    '.comments-section', '.comment-area', '.discussion-area',

    // 推荐
    '.recommended-reading', '.related-posts', '.suggestions',
    '[class*="trending"]', '[class*="sponsored"]',

    // 社交媒体：只删除浮动按钮
    '.social-share-floating', '.social-sidebar',
    '.follow-us', '.subscribe-popup',

    // 导航：保留面包屑
    'nav.main-nav', 'nav.primary-nav', '.main-menu',
    '.navigation-bar', '.top-menu',

    // 页脚：保守
    '.footer-widgets', '.footer-secondary',

    // 弹窗：只删除广告类
    '[class*="popup-ads"]', '[class*="modal-ads"]',
    '[class*="overlay-ads"]', '[class*="newsletter-popup"]',

    // 其他
    '[class*="newsletter-widget"]', '[class*="promo-banner"]'
  ];

  // 内容白名单
  const CONTENT_WHITELIST = [
    '.breadcrumb', '.breadcrumbs', '.post-meta',
    '.author-info', '.publish-info', '.category',
    '.tags', '.tag-list', '.table-of-contents',
    '.related-content', '.footer-copyright',
    'nav.breadcrumb', 'article footer',
    '.meta-info', '.post-meta-info'
  ];

  function improvedRemoveDistractions() {
    const selectors = [...OPTIMIZED_DISTRACTION_SELECTORS];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // 检查是否在白名单中
          const isWhitelisted = CONTENT_WHITELIST.some(whitelist =>
            el.matches(whitelist) || el.closest(whitelist)
          );

          if (isWhitelisted) {
            return;
          }

          // 检查是否包含重要内容
          const hasImportantContent =
            el.querySelector('.author-info, .publish-info, .breadcrumb') ||
            el.matches('[role="contentinfo"]');

          if (hasImportantContent) {
            return;
          }

          // 只隐藏，不移除
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

  // ==========================================
  // 修复5: 保留表单状态（问题2.3）
  // ==========================================
  function preserveFormStates(element) {
    // 存储所有表单元素的当前值
    const formStates = new Map();

    const inputs = element.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const id = input.id || input.name || Math.random().toString(36).substr(2, 9);
      input.setAttribute('data-focus-id', id);

      const state = {
        value: input.value,
        checked: input.checked,
        selectedIndex: input.selectedIndex
      };
      formStates.set(id, state);
    });

    // 克隆元素
    const clone = element.cloneNode(true);

    // 恢复表单状态
    const clonedInputs = clone.querySelectorAll('input, textarea, select');
    clonedInputs.forEach(input => {
      const id = input.getAttribute('data-focus-id');
      const state = formStates.get(id);

      if (state) {
        input.value = state.value;
        input.checked = state.checked;
        if (input.selectedIndex !== undefined) {
          input.selectedIndex = state.selectedIndex;
        }
      }
    });

    return clone;
  }

  // ==========================================
  // 修复6: 提取并保留元数据（问题3.5）
  // ==========================================
  function extractMetaInfo(contentElement) {
    const meta = [];

    // 查找作者信息
    const authorSelectors = [
      '.author', '.post-author', '.byline', '[itemprop="author"]',
      '.author-name', '.writer', '.posted-by', '.author-info'
    ];

    for (const selector of authorSelectors) {
      const authorEl = contentElement.querySelector(selector);
      if (authorEl && authorEl.textContent.trim()) {
        meta.push(`<span class="meta-author">作者: ${authorEl.textContent.trim()}</span>`);
        break;
      }
    }

    // 查找发布日期
    const dateSelectors = [
      '.date', '.post-date', '.publish-date', '.published',
      '[itemprop="datePublished"]', '.timestamp', 'time',
      '.publish-info'
    ];

    for (const selector of dateSelectors) {
      const dateEl = contentElement.querySelector(selector);
      if (dateEl) {
        const dateText = dateEl.textContent.trim() ||
                        dateEl.getAttribute('datetime') ||
                        dateEl.getAttribute('data-time');
        if (dateText) {
          meta.push(`<span class="meta-date">发布于: ${dateText}</span>`);
          break;
        }
      }
    }

    // 查找分类
    const categorySelectors = [
      '.category', '.categories', '.tag', '.tags',
      '[itemprop="articleSection"]', '.post-category'
    ];

    const categories = [];
    for (const selector of categorySelectors) {
      const catEls = contentElement.querySelectorAll(selector);
      catEls.forEach(catEl => {
        if (catEl.textContent.trim() && !categories.includes(catEl.textContent.trim())) {
          categories.push(catEl.textContent.trim());
        }
      });
    }

    if (categories.length > 0) {
      meta.push(`<span class="meta-category">分类: ${categories.join(', ')}</span>`);
    }

    return meta.length > 0 ? meta.join(' | ') : null;
  }

  // ==========================================
  // 修复7: CSS修复（问题2.1, 2.2, 2.4）
  // ==========================================
  const CSS_FIXES = `
    /* 修复1: 降低主容器的z-index */
    #focus-mode-container {
      z-index: 10000 !important; /* 从 2147483647 降低到 10000 */
    }

    /* 修复2: 确保表单元素可以交互 */
    #focus-content input,
    #focus-content textarea,
    #focus-content select,
    #focus-content button,
    #focus-content [role="button"],
    #focus-content label,
    #focus-content .checkbox,
    #focus-content .radio {
      pointer-events: auto !important;
      position: relative;
      z-index: 10;
    }

    /* 修复3: 确保iframe可以交互 */
    #focus-content iframe {
      pointer-events: auto !important;
      position: relative;
      z-index: 5;
    }

    /* 修复4: 确保链接可以点击 */
    #focus-content a {
      pointer-events: auto !important;
    }

    /* 修复5: 确保所有内容可交互 */
    #focus-content * {
      pointer-events: auto !important;
    }

    /* 修复6: 元数据样式 */
    .focus-meta-info {
      padding: 16px 0;
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9em;
      color: #718096;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .focus-meta-info .meta-author::before {
      content: '👤 ';
      margin-right: 4px;
    }

    .focus-meta-info .meta-date::before {
      content: '📅 ';
      margin-right: 4px;
    }

    .focus-meta-info .meta-category::before {
      content: '📁 ';
      margin-right: 4px;
    }

    /* 修复7: 代码高亮基础样式 */
    #focus-content pre code {
      /* 基础语法高亮 */
      color: #d4d4d4;
    }

    #focus-content .token.comment,
    #focus-content .token.prolog,
    #focus-content .token.doctype {
      color: #6a9955;
    }

    #focus-content .token.punctuation {
      color: #d4d4d4;
    }

    #focus-content .token.property,
    #focus-content .token.tag,
    #focus-content .token.boolean,
    #focus-content .token.number,
    #focus-content .token.constant,
    #focus-content .token.symbol {
      color: #b5cea8;
    }

    #focus-content .token.selector,
    #focus-content .token.attr-name,
    #focus-content .token.string,
    #focus-content .token.char,
    #focus-content .token.builtin {
      color: #ce9178;
    }

    #focus-content .token.keyword {
      color: #c586c0;
    }

    #focus-content .token.function {
      color: #dcdcaa;
    }
  `;

  // 导出修复函数（用于测试）
  window.FocusModeFixes = {
    IMPROVED_CONTENT_SELECTORS,
    improvedIntelligentlyExtractContent,
    improvedCleanContent,
    OPTIMIZED_DISTRACTION_SELECTORS,
    improvedRemoveDistractions,
    preserveFormStates,
    extractMetaInfo,
    CSS_FIXES
  };

})();
