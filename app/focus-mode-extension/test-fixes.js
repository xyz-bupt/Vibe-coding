/**
 * 专注模式修复验证脚本
 *
 * 使用方法：
 * 1. 在浏览器控制台中运行此脚本
 * 2. 检查输出结果
 */

console.log('=== 专注模式修复验证 ===\n');

// 测试1: 检查关键函数是否存在
console.log('1. 检查关键函数:');
const functions = [
  'restoreHiddenElements',
  'reattachFormEvents',
  'enhanceFormInteractivity'
];

functions.forEach(funcName => {
  if (typeof window[funcName] === 'function') {
    console.log(`   ✓ ${funcName} 存在`);
  } else {
    console.log(`   ✗ ${funcName} 不存在（需要刷新页面）`);
  }
});

// 测试2: 检查专注模式容器
console.log('\n2. 检查专注模式容器:');
const focusContainer = document.getElementById('focus-mode-container');
if (focusContainer) {
  console.log('   ✓ 专注模式容器已创建');
  console.log(`   - z-index: ${getComputedStyle(focusContainer).zIndex}`);

  // 检查控制栏
  const controlBar = document.getElementById('focus-control-bar');
  if (controlBar) {
    console.log('   ✓ 控制栏已创建');
    console.log(`   - 控制栏 z-index: ${getComputedStyle(controlBar).zIndex}`);

    // 检查按钮
    const closeButton = controlBar.querySelector('.focus-close-button');
    const settingsButton = controlBar.querySelector('.focus-settings-button');

    if (closeButton && settingsButton) {
      console.log('   ✓ 按钮已创建');
      console.log(`   - 关闭按钮 pointer-events: ${getComputedStyle(closeButton).pointerEvents}`);
      console.log(`   - 设置按钮 pointer-events: ${getComputedStyle(settingsButton).pointerEvents}`);
      console.log(`   - 关闭按钮 z-index: ${closeButton.style.zIndex || '未设置'}`);
      console.log(`   - 设置按钮 z-index: ${settingsButton.style.zIndex || '未设置'}`);
    } else {
      console.log('   ✗ 按钮未找到');
    }
  } else {
    console.log('   ✗ 控制栏未找到');
  }

  // 检查内容区域
  const focusContent = document.getElementById('focus-content');
  if (focusContent) {
    console.log('   ✓ 内容区域已创建');

    // 检查表单元素
    const inputs = focusContent.querySelectorAll('input[type="checkbox"], input[type="radio"]');
    console.log(`   - 找到 ${inputs.length} 个 checkbox/radio 元素`);

    if (inputs.length > 0) {
      const firstInput = inputs[0];
      console.log(`   - 第一个表单元素 pointer-events: ${getComputedStyle(firstInput).pointerEvents}`);
      console.log(`   - 第一个表单元素 z-index: ${firstInput.style.zIndex || getComputedStyle(firstInput).zIndex}`);
      console.log(`   - 第一个表单元素 cursor: ${getComputedStyle(firstInput).cursor}`);
    }
  } else {
    console.log('   ✗ 内容区域未找到');
  }
} else {
  console.log('   ✗ 专注模式容器未创建（请先启用专注模式）');
}

// 测试3: 检查隐藏元素
console.log('\n3. 检查被隐藏的元素:');
const hiddenElements = document.querySelectorAll('[data-focus-hidden="true"]');
console.log(`   - 找到 ${hiddenElements.length} 个被隐藏的元素`);

if (hiddenElements.length > 0) {
  let hasOriginalDisplay = 0;
  hiddenElements.forEach(el => {
    if (el.dataset.focusOriginalDisplay !== undefined) {
      hasOriginalDisplay++;
    }
  });
  console.log(`   - ${hasOriginalDisplay} 个元素保存了原始 display 值`);
}

// 测试4: 手动测试函数
console.log('\n4. 手动测试指南:');
console.log('   请在页面上执行以下操作:');
console.log('   [ ] 点击设置按钮 - 应该打开设置页面');
console.log('   [ ] 点击关闭按钮 - 应该退出专注模式且页面不黑屏');
console.log('   [ ] 点击 checkbox/radio - 应该能切换选中状态');
console.log('   [ ] 点击 select 下拉框 - 应该能展开选项');
console.log('   [ ] 在 input/textarea 中输入 - 应该能正常输入');
console.log('   [ ] 点击 button - 应该能触发点击行为');

console.log('\n=== 验证完成 ===');

// 导出给外部使用
window.focusModeTest = {
  checkButtons: () => {
    const closeBtn = document.querySelector('.focus-close-button');
    const settingsBtn = document.querySelector('.focus-settings-button');
    return {
      close: {
        exists: !!closeBtn,
        pointerEvents: closeBtn ? getComputedStyle(closeBtn).pointerEvents : null,
        zIndex: closeBtn ? closeBtn.style.zIndex : null
      },
      settings: {
        exists: !!settingsBtn,
        pointerEvents: settingsBtn ? getComputedStyle(settingsBtn).pointerEvents : null,
        zIndex: settingsBtn ? settingsBtn.style.zIndex : null
      }
    };
  },

  checkFormElements: () => {
    const content = document.getElementById('focus-content');
    if (!content) return null;

    const forms = content.querySelectorAll('input, textarea, select, button');
    return {
      total: forms.length,
      interactive: Array.from(forms).filter(el => {
        const styles = getComputedStyle(el);
        return styles.pointerEvents === 'auto' && parseInt(styles.zIndex) > 0;
      }).length
    };
  },

  checkHiddenElements: () => {
    const hidden = document.querySelectorAll('[data-focus-hidden="true"]');
    return {
      total: hidden.length,
      withOriginalDisplay: Array.from(hidden).filter(el => el.dataset.focusOriginalDisplay).length
    };
  }
};

console.log('\n提示: 使用 window.focusModeTest 访问测试函数');
