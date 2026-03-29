/**
 * 根据文件扩展名返回主题颜色（用于边缘发光 + emissive）
 */
const COLOR_MAP = {
  '.tsx': '#3178c6',   // TypeScript 蓝
  '.ts':  '#3178c6',
  '.jsx': '#f7df1e',   // JavaScript 黄
  '.js':  '#f7df1e',
  '.css': '#ff00ff',   // CSS 粉紫
};

export function edgesColorFor(filePath) {
  for (const [ext, color] of Object.entries(COLOR_MAP)) {
    if (filePath.endsWith(ext)) return color;
  }
  return '#ff00ff';
}
