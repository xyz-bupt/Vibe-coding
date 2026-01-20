#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../public/icons');
const sourceIcon = path.join(iconsDir, 'icon-source.svg');

// 图标尺寸配置
const iconSizes = [
  { size: 72, name: 'icon-72x72-maskable.png', suffix: '-maskable' },
  { size: 96, name: 'icon-96x96-maskable.png', suffix: '-maskable' },
  { size: 128, name: 'icon-128x128-maskable.png', suffix: '-maskable' },
  { size: 144, name: 'icon-144x144-maskable.png', suffix: '-maskable' },
  { size: 152, name: 'icon-152x152-maskable.png', suffix: '-maskable' },
  { size: 192, name: 'icon-192x192.png', suffix: '' },
  { size: 192, name: 'icon-192x192-maskable.png', suffix: '-maskable' },
  { size: 384, name: 'icon-384x384.png', suffix: '' },
  { size: 384, name: 'icon-384x384-maskable.png', suffix: '-maskable' },
  { size: 512, name: 'icon-512x512.png', suffix: '' },
  { size: 512, name: 'icon-512x512-maskable.png', suffix: '-maskable' },
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateIcons() {
  console.log('🎨 生成象棋布局教学 PWA 图标...\n');

  try {
    // 检查源文件
    await fs.access(sourceIcon);
    console.log('✓ 找到源文件:', sourceIcon);

    // 生成所有图标
    for (const { size, name } of iconSizes) {
      const outputPath = path.join(iconsDir, name);

      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ 生成 ${name} (${size}x${size})`);
    }

    // 复制 favicon.svg
    const faviconSvg = path.join(iconsDir, 'favicon.svg');
    await fs.copyFile(faviconSvg, path.join(__dirname, '../public/favicon.svg'));
    console.log('✓ 复制 favicon.svg');

    console.log('\n✅ 图标生成完成！');
    console.log(`📁 输出目录: ${iconsDir}`);

  } catch (error) {
    console.error('❌ 生成图标失败:', error.message);
    process.exit(1);
  }
}

generateIcons();
