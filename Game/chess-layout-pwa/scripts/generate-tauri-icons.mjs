#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceIcon = path.join(__dirname, '../public/icons/icon-source.svg');
const tauriIconsDir = path.join(__dirname, '../src-tauri/icons');

// Tauri 图标尺寸
const tauriIconSizes = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  '256x256.png',
  '256x256@2x.png',
  '512x512.png',
  '512x512@2x.png',
  '1024x1024.png'
];

async function generateTauriIcons() {
  console.log('🎨 生成 Tauri 图标...\n');

  try {
    // 创建图标目录
    await fs.mkdir(tauriIconsDir, { recursive: true });

    // 生成图标
    for (const iconName of tauriIconSizes) {
      let size;
      if (iconName.includes('@2x')) {
        size = parseInt(iconName.split('@')[0]) * 2;
      } else {
        size = parseInt(iconName.split('x')[0]);
      }

      const outputPath = path.join(tauriIconsDir, iconName);

      await sharp(sourceIcon)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ 生成 ${iconName} (${size}x${size})`);
    }

    console.log('\n✅ Tauri 图标生成完成！');
    console.log(`📁 输出目录: ${tauriIconsDir}`);

  } catch (error) {
    console.error('❌ 生成图标失败:', error.message);
    process.exit(1);
  }
}

generateTauriIcons();
