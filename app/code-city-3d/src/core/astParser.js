/**
 * 基于正则的轻量级代码分析器（浏览器端运行，无需 Babel）
 */

const IMPORT_RE = /import\s+(?:[\w{},\s]*\s+from\s+)?['"]([^'"]+)['"]/g;
const FUNC_RE = /(?:function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)|[\w]+)\s*=>|\b\w+\s*\([^)]*\)\s*\{)/g;
const CLASS_RE = /\bclass\s+\w+/g;

/**
 * 分析单个源码文件，提取建筑属性
 * @param {string} code
 * @param {string} filePath
 * @param {number} [lastModified=0]
 */
export function analyzeCode(code, filePath, lastModified = 0) {
  const lines = code.split('\n');
  const totalLines = lines.length;

  const height = Math.min(Math.max(Math.ceil(totalLines / 10), 1), 100);

  const funcMatches = code.match(FUNC_RE);
  const funcCount = funcMatches ? funcMatches.length : 0;

  const classMatches = code.match(CLASS_RE);
  const classCount = classMatches ? classMatches.length : 0;

  const complexity = funcCount + classCount * 3;
  const width = Math.min(Math.max(Math.ceil(complexity * 0.6), 1), 20);
  const depth = Math.min(Math.max(Math.ceil(complexity * 0.4), 1), 15);

  const imports = [];
  let match;
  IMPORT_RE.lastIndex = 0;
  while ((match = IMPORT_RE.exec(code)) !== null) {
    imports.push(match[1]);
  }

  return { filePath, lineCount: totalLines, height, width, depth, imports, lastModified };
}
