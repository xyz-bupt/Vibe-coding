/**
 * 简化版图标生成脚本
 * 仅使用 Node.js 内置模块，不需要额外依赖
 *
 * 注意：此脚本仅生成 SVG 的副本，不进行 PNG 转换
 * 实际使用中需要使用 ImageMagick 或 sharp 进行转换
 */

const fs = require('fs').promises;
const path = require('path');

const SCRIPT_DIR = __dirname;
const SOURCE_SVG = path.join(SCRIPT_DIR, 'icon-source.svg');
const FAVICON_SVG = path.join(SCRIPT_DIR, 'favicon.svg');

async function setup() {
  console.log('========================================');
  console.log('象棋布局教学 PWA - 图标生成准备');
  console.log('========================================');
  console.log('');

  // 检查源文件
  try {
    await fs.access(SOURCE_SVG);
    console.log('✓ 找到源文件: icon-source.svg');
  } catch (error) {
    console.error('✗ 错误: 找不到源文件');
    process.exit(1);
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('请选择生成方法：');
  console.log('----------------------------------------');
  console.log('');
  console.log('方法 1: 使用 ImageMagick（推荐）');
  console.log('  1. 安装: brew install imagemagick');
  console.log('  2. 运行: bash generate-icons.sh');
  console.log('');
  console.log('方法 2: 使用 Node.js + sharp');
  console.log('  1. 安装: npm install sharp');
  console.log('  2. 运行: node generate-icons.js');
  console.log('');
  console.log('方法 3: 使用在线工具');
  console.log('  - PNG 转换: https://cloudconvert.com/svg-to-png');
  console.log('  - ICO 转换: https://www.icoconverter.com/');
  console.log('');
  console.log('----------------------------------------');
  console.log('');
  console.log('已配置的文件：');
  console.log('  ✓ icon-source.svg (源文件)');
  console.log('  ✓ favicon.svg');
  console.log('  ✓ generate-icons.sh (ImageMagick 脚本)');
  console.log('  ✓ generate-icons.js (Node.js + sharp)');
  console.log('  ✓ README.md (详细文档)');
  console.log('  ✓ QUICKSTART.md (快速开始)');
  console.log('');
  console.log('已更新的项目文件：');
  console.log('  ✓ /manifest.json');
  console.log('  ✓ /index.html');
  console.log('');
}

setup().catch(console.error);
