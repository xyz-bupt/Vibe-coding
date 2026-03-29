import { useMemo } from 'react';

/**
 * 从源码中提取从 fromFile 导入 toFile 的具体语句
 */
function extractImportLines(sourceCode, toFilePath) {
  if (!sourceCode || !toFilePath) return [];

  // 取目标文件名（不含扩展名）作为匹配关键字
  const baseName = toFilePath.replace(/\.\w+$/, '');
  const lastSegment = baseName.split('/').pop();

  const lines = sourceCode.split('\n');
  return lines.filter((line) => {
    const trimmed = line.trim();
    return trimmed.startsWith('import') && trimmed.includes(lastSegment);
  });
}

export default function LinkInspector({ link, sourceCode, onClose }) {
  if (!link) return null;

  const { from, to } = link;

  const importLines = useMemo(
    () => extractImportLines(sourceCode, to.filePath),
    [sourceCode, to.filePath],
  );

  return (
    <div
      className="
        fixed top-0 right-0 h-full w-[400px] z-20
        bg-black/85 backdrop-blur-md
        border-l border-pink-500/30
        font-mono text-sm text-pink-400
        flex flex-col
      "
    >
      {/* 固定头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-pink-500/30 shrink-0">
        <h2 className="text-pink-300 text-base font-bold tracking-widest">
          LINK INSPECTOR
        </h2>
        <button
          onClick={onClose}
          className="
            w-8 h-8 flex items-center justify-center
            text-pink-400/60 hover:text-white
            transition-colors cursor-pointer
          "
        >
          &#x2715;
        </button>
      </div>

      {/* 可滚动内容 */}
      <div className="p-6 pt-5 overflow-y-auto flex-1">
        <div className="space-y-5">
          {/* 源文件 */}
          <div>
            <span className="text-gray-500 text-xs tracking-wider">FROM</span>
            <p className="text-green-400 break-all mt-1 leading-relaxed">{from.filePath}</p>
          </div>

          {/* 箭头指示 */}
          <div className="flex items-center gap-2 text-pink-500/60 text-xs">
            <span className="inline-block w-8 h-px bg-pink-500/40" />
            <span className="tracking-widest">IMPORTS</span>
            <span className="inline-block w-8 h-px bg-pink-500/40" />
          </div>

          {/* 目标文件 */}
          <div>
            <span className="text-gray-500 text-xs tracking-wider">TO</span>
            <p className="text-cyan-400 break-all mt-1 leading-relaxed">{to.filePath}</p>
          </div>

          {/* 依赖规模对比 */}
          <div className="flex gap-8 pt-2">
            <div>
              <span className="text-gray-500 text-xs tracking-wider">FROM LINES</span>
              <p className="text-yellow-400 text-lg font-bold mt-1">{from.lineCount}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs tracking-wider">TO LINES</span>
              <p className="text-yellow-400 text-lg font-bold mt-1">{to.lineCount}</p>
            </div>
          </div>

          {/* 具体 import 语句 */}
          {importLines.length > 0 && (
            <div>
              <span className="text-gray-500 text-xs tracking-wider">IMPORT STATEMENTS</span>
              <div className="mt-2 space-y-1">
                {importLines.map((line, i) => (
                  <pre
                    key={i}
                    className="
                      p-2 rounded
                      bg-black/60 border border-pink-900/40
                      text-[11px] text-gray-300
                      overflow-x-auto whitespace-pre
                      leading-relaxed
                    "
                  >
                    {line}
                  </pre>
                ))}
              </div>
            </div>
          )}

          {/* 路径距离 */}
          <div>
            <span className="text-gray-500 text-xs tracking-wider">PATH DEPTH</span>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-green-400 text-xs">{from.filePath.split('/').length} levels</span>
              <span className="text-pink-500/40">&#x2192;</span>
              <span className="text-cyan-400 text-xs">{to.filePath.split('/').length} levels</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
