const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css'];
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.cache',
  '.vscode',
  '.idea',
]);

/**
 * 使用 window.showDirectoryPicker() 让用户选择本地文件夹，
 * 递归读取所有符合条件的源码文件。
 * @returns {Promise<{filePath: string, fileName: string, content: string, lastModified: number}[]>}
 */
export async function pickAndReadDirectory() {
  const dirHandle = await window.showDirectoryPicker();
  return readDirectory(dirHandle, '');
}

/**
 * 递归读取目录下所有 .js/.jsx/.ts/.tsx/.css 文件
 */
async function readDirectory(dirHandle, basePath) {
  const files = [];

  for await (const [name, handle] of dirHandle.entries()) {
    const currentPath = basePath ? `${basePath}/${name}` : name;

    if (handle.kind === 'directory') {
      if (IGNORED_DIRS.has(name)) continue;
      const subFiles = await readDirectory(handle, currentPath);
      files.push(...subFiles);
    } else if (handle.kind === 'file') {
      if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) continue;

      const file = await handle.getFile();
      const content = await file.text();
      files.push({
        filePath: currentPath,
        fileName: name,
        content,
        lastModified: file.lastModified,
      });
    }
  }

  return files;
}
