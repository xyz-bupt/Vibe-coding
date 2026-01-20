#!/usr/bin/env node

/**
 * 专注模式扩展 - 项目验证脚本
 * Focus Mode Extension - Project Verification Script
 */

const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'styles.css',
  'popup.html',
  'popup.js',
  'popup.css',
  'options.html',
  'options.js',
  'options.css',
  'README.md'
];

const iconFiles = [
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

console.log('🔍 验证专注模式扩展项目...\n');

let allGood = true;

// 检查必需文件
console.log('📄 检查必需文件:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allGood = false;
});

// 检查图标文件
console.log('\n🎨 检查图标文件:');
iconFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allGood = false;
});

// 检查 manifest.json
console.log('\n📋 验证 manifest.json:');
try {
  const manifestPath = path.join(__dirname, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  console.log(`  ✅ Manifest 版本: ${manifest.manifest_version}`);
  console.log(`  ✅ 扩展名称: ${manifest.name}`);
  console.log(`  ✅ 扩展版本: ${manifest.version}`);
  console.log(`  ✅ 权限: ${manifest.permissions.join(', ')}`);

  // 检查必需的权限
  const requiredPermissions = ['activeTab', 'storage', 'tabs'];
  const missingPermissions = requiredPermissions.filter(p => !manifest.permissions.includes(p));
  if (missingPermissions.length > 0) {
    console.log(`  ⚠️  缺少权限: ${missingPermissions.join(', ')}`);
  }
} catch (error) {
  console.log(`  ❌ 无法解析 manifest.json: ${error.message}`);
  allGood = false;
}

// 检查文件大小
console.log('\n📊 文件大小统计:');
const stats = {
  'manifest.json': 0,
  'background.js': 0,
  'content.js': 0,
  'popup.html': 0,
  'popup.js': 0,
  'options.html': 0,
  'options.js': 0
};

Object.keys(stats).forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    stats[file] = size;
    const sizeKB = (size / 1024).toFixed(2);
    console.log(`  📁 ${file}: ${sizeKB} KB`);
  }
});

// 总结
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ 所有检查通过！扩展已准备就绪。');
  console.log('\n🚀 安装说明:');
  console.log('1. 打开 Chrome/Edge 浏览器');
  console.log('2. 访问 chrome://extensions/ (或 edge://extensions/)');
  console.log('3. 启用"开发者模式"');
  console.log('4. 点击"加载已解压的扩展程序"');
  console.log('5. 选择此文件夹');
} else {
  console.log('❌ 发现问题，请检查上述错误。');
  process.exit(1);
}
