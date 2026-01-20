/**
 * 象棋布局教学 PWA - 图标生成脚本 (Node.js 版本)
 * 使用 sharp 库生成所有需要的 PWA 图标尺寸
 *
 * 安装依赖: npm install sharp
 * 运行: node generate-icons.js
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_SVG = path.join(__dirname, 'icon-source.svg');
const SCRIPT_DIR = __dirname;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
};

console.log(`${colors.green}========================================${colors.reset}`);
console.log(`${colors.green}象棋布局教学 PWA - 图标生成工具${colors.reset}`);
console.log(`${colors.green}========================================${colors.reset}`);
console.log('');

// 检查 sharp 是否安装
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log(`${colors.red}错误: 未找到 sharp 库${colors.reset}`);
  console.log('');
  console.log('请安装 sharp:');
  console.log('  npm install sharp');
  console.log('');
  console.log('或者使用 ImageMagick 版本:');
  console.log('  bash generate-icons.sh');
  process.exit(1);
}

// 图标配置
const icons = [
  // PWA 图标 - maskable
  { name: 'icon-72x72-maskable.png', size: 72, purpose: 'maskable' },
  { name: 'icon-96x96-maskable.png', size: 96, purpose: 'maskable' },
  { name: 'icon-128x128-maskable.png', size: 128, purpose: 'maskable' },
  { name: 'icon-144x144-maskable.png', size: 144, purpose: 'maskable' },
  { name: 'icon-152x152-maskable.png', size: 152, purpose: 'maskable' },
  // PWA 图标 - any
  { name: 'icon-192x192.png', size: 192, purpose: 'any' },
  { name: 'icon-192x192-maskable.png', size: 192, purpose: 'maskable' },
  { name: 'icon-384x384.png', size: 384, purpose: 'any' },
  { name: 'icon-384x384-maskable.png', size: 384, purpose: 'maskable' },
  { name: 'icon-512x512.png', size: 512, purpose: 'any' },
  { name: 'icon-512x512-maskable.png', size: 512, purpose: 'maskable' },
  // Favicon
  { name: 'favicon-16x16.png', size: 16, purpose: 'any' },
  { name: 'favicon-32x32.png', size: 32, purpose: 'any' },
  // Apple touch icon
  { name: 'apple-touch-icon.png', size: 180, purpose: 'any' },
];

async function generateIcons() {
  try {
    // 检查源文件
    await fs.access(SOURCE_SVG);

    console.log(`${colors.yellow}步骤 1: 生成 PNG 图标${colors.reset}`);
    console.log('');

    // 读取 SVG 文件
    const svgBuffer = await fs.readFile(SOURCE_SVG);

    // 生成所有图标
    for (const icon of icons) {
      console.log(`  生成 ${colors.green}${icon.name}${colors.reset} (${icon.size}x${icon.size})`);

      // 使用 sharp 调整 SVG 大小
      await sharp(svgBuffer, { density: 300 })
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(SCRIPT_DIR, icon.name));
    }

    console.log('');
    console.log(`${colors.yellow}步骤 2: 生成 Favicon (.ico)${colors.reset}`);
    console.log('');

    // 检查是否安装了 png-to-ico 或其他工具
    try {
      // 尝试使用 sharp 直接创建 ico（需要额外插件）
      // 这里我们只生成 PNG 格式，提示用户使用在线工具转换
      console.log(`  ${colors.yellow}提示: favicon.ico 需要使用在线工具转换${colors.reset}`);
      console.log(`  推荐工具: https://www.icoconverter.com/`);
      console.log(`  或使用以下命令（需要 ImageMagick）:`);
      console.log(`  convert favicon-16x16.png favicon-32x32.png favicon.ico`);
    } catch (error) {
      console.log(`  ${colors.yellow}跳过 favicon.ico 生成${colors.reset}`);
    }

    console.log('');
    console.log(`${colors.green}========================================${colors.reset}`);
    console.log(`${colors.green}✓ 图标生成完成！${colors.reset}`);
    console.log(`${colors.green}========================================${colors.reset}`);
    console.log('');

    // 列出生成的文件
    const files = await fs.readdir(SCRIPT_DIR);
    const iconFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.ico'));

    console.log('生成的文件列表:');
    for (const file of iconFiles) {
      const filePath = path.join(SCRIPT_DIR, file);
      const stats = await fs.stat(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`  ${file} (${sizeKB} KB)`);
    }

    console.log('');
    console.log(`${colors.yellow}下一步：${colors.reset}`);
    console.log('1. 将图标复制到项目根目录的 public/ 文件夹');
    console.log('2. 更新 manifest.json 和 index.html 中的图标引用');
    console.log('');

  } catch (error) {
    console.error(`${colors.red}错误: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// 执行生成
generateIcons();
