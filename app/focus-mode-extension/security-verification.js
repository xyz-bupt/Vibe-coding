#!/usr/bin/env node

/**
 * 安全验证脚本
 * 验证所有安全修复是否正确应用
 */

const fs = require('fs');
const path = require('path');

const ANSI_GREEN = '\x1b[32m';
const ANSI_RED = '\x1b[31m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_RESET = '\x1b[0m';

console.log('🔒 安全验证脚本\n');
console.log('='.repeat(60));

let checksPassed = 0;
let checksFailed = 0;
let checksWarning = 0;

function check(condition, message) {
  if (condition) {
    console.log(`${ANSI_GREEN}✅${ANSI_RESET} ${message}`);
    checksPassed++;
  } else {
    console.log(`${ANSI_RED}❌${ANSI_RESET} ${message}`);
    checksFailed++;
  }
}

function warn(condition, message) {
  if (condition) {
    console.log(`${ANSI_GREEN}✅${ANSI_RESET} ${message}`);
    checksPassed++;
  } else {
    console.log(`${ANSI_YELLOW}⚠️${ANSI_RESET} ${message}`);
    checksWarning++;
  }
}

// 1. 验证 manifest.json
console.log('\n📋 验证 manifest.json:');
try {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  check(manifest.manifest_version === 3, 'Manifest 版本为 3');
  check(manifest.permissions.includes('storage'), '包含 storage 权限');
  check(manifest.permissions.includes('tabs'), '包含 tabs 权限');

  // 检查 CSP
  warn(manifest.content_security_policy, '包含 CSP 策略');
  if (manifest.content_security_policy) {
    check(
      manifest.content_security_policy.extension_pages.includes("'self'"),
      'CSP 包含 self 源'
    );
  }

  // 检查排除匹配
  const contentScript = manifest.content_scripts && manifest.content_scripts[0];
  warn(contentScript && contentScript.exclude_matches, '包含排除匹配规则');
  if (contentScript && contentScript.exclude_matches) {
    check(
      contentScript.exclude_matches.some(m => m.includes('chrome.google.com')),
      '排除 Chrome Web Store'
    );
  }

} catch (error) {
  console.log(`${ANSI_RED}❌${ANSI_RESET} 无法解析 manifest.json: ${error.message}`);
  checksFailed++;
}

// 2. 验证 content.js 安全性
console.log('\n📄 验证 content.js 安全性:');
try {
  const contentPath = path.join(__dirname, 'content.js');
  const content = fs.readFileSync(contentPath, 'utf8');

  // 检查安全函数
  check(content.includes('matchPattern'), '包含 matchPattern 函数');
  check(content.includes('try {'), '包含异常处理');
  check(content.includes('sender.id !== chrome.runtime.id'), '验证消息来源');

  // 检查是否使用 innerHTML (应该避免)
  const innerHTMLCount = (content.match(/\.innerHTML\s*=/g) || []).length;
  warn(innerHTMLCount === 0, `避免使用 innerHTML (发现 ${innerHTMLCount} 处)`);

  // 检查 ReDoS 防护
  check(content.includes('length >'), '包含输入长度验证');
  check(content.includes('catch (e)'), '包含错误捕获');

} catch (error) {
  console.log(`${ANSI_RED}❌${ANSI_RESET} 无法读取 content.js: ${error.message}`);
  checksFailed++;
}

// 3. 验证 options.js 输入验证
console.log('\n⚙️  验证 options.js 输入验证:');
try {
  const optionsPath = path.join(__dirname, 'options.js');
  const options = fs.readFileSync(optionsPath, 'utf8');

  check(options.includes('querySelector(selector)'), '验证 CSS 选择器');
  check(options.includes('.trim()'), '清理用户输入');
  check(options.includes('length >'), '验证输入长度');
  check(options.includes('try {'), '包含异常处理');

  // 检查通知系统
  check(options.includes('showNotification'), '包含通知系统');
  check(!options.includes('alert('), '不使用原生 alert');

} catch (error) {
  console.log(`${ANSI_RED}❌${ANSI_RESET} 无法读取 options.js: ${error.message}`);
  checksFailed++;
}

// 4. 验证 background.js
console.log('\n🔧 验证 background.js:');
try {
  const backgroundPath = path.join(__dirname, 'background.js');
  const background = fs.readFileSync(backgroundPath, 'utf8');

  check(background.includes('chrome.runtime.lastError'), '检查运行时错误');
  check(background.includes('.catch(()'), '包含 Promise 错误处理');
  check(background.includes('contextMenus'), '支持右键菜单');

  // 检查是否有重复的 onInstalled 监听器
  const onInstalledCount = (background.match(/chrome\.runtime\.onInstalled\.addListener/g) || []).length;
  warn(onInstalledCount <= 1, `onInstalled 监听器数量 (${onInstalledCount})`);

} catch (error) {
  console.log(`${ANSI_RED}❌${ANSI_RESET} 无法读取 background.js: ${error.message}`);
  checksFailed++;
}

// 5. 验证 HTML 文件安全性
console.log('\n🌐 验证 HTML 文件安全性:');
try {
  const popupPath = path.join(__dirname, 'popup.html');
  const popup = fs.readFileSync(popupPath, 'utf8');

  check(popup.includes('<!DOCTYPE html>'), '包含 DOCTYPE 声明');
  check(popup.includes('meta charset'), '包含字符集声明');
  check(popup.includes('viewport'), '包含 viewport 设置');

  // 检查内联脚本 (应该避免)
  warn(!popup.includes('javascript:'), '避免使用 javascript: 协议');

} catch (error) {
  console.log(`${ANSI_RED}❌${ANSI_RESET} 无法读取 popup.html: ${error.message}`);
  checksFailed++;
}

// 6. 语法检查
console.log('\n🔍 验证 JavaScript 语法:');
const jsFiles = ['background.js', 'content.js', 'popup.js', 'options.js'];
jsFiles.forEach(file => {
  try {
    const { execSync } = require('child_process');
    execSync(`node --check ${file}`, { cwd: __dirname, stdio: 'pipe' });
    check(true, `${file} 语法正确`);
  } catch (error) {
    check(false, `${file} 语法错误`);
  }
});

// 7. 文件完整性
console.log('\n📊 验证文件完整性:');
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.js',
  'popup.html',
  'options.js',
  'options.html'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  check(exists, `文件存在: ${file}`);
});

// 总结
console.log('\n' + '='.repeat(60));
console.log('📊 验证总结:\n');
console.log(`${ANSI_GREEN}✅ 通过:${ANSI_RESET} ${checksPassed}`);
console.log(`${ANSI_RED}❌ 失败:${ANSI_RESET} ${checksFailed}`);
console.log(`${ANSI_YELLOW}⚠️  警告:${ANSI_RESET} ${checksWarning}`);

if (checksFailed === 0) {
  console.log(`\n${ANSI_GREEN}🎉 所有安全检查通过！${ANSI_RESET}`);
  console.log('\n扩展已准备好进行测试和发布。');
  process.exit(0);
} else {
  console.log(`\n${ANSI_RED}❌ 发现 ${checksFailed} 个问题需要修复。${ANSI_RESET}`);
  console.log('\n请查看上述错误详情并修复。');
  process.exit(1);
}
