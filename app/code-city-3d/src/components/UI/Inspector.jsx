export default function Inspector({ building, depsIn, sourceCode, onClose }) {
  if (!building) return null;

  const depsOut = building.targets.length;

  // 源码预览：前 10 行
  const codePreview = sourceCode
    ? sourceCode.split('\n').slice(0, 10).join('\n')
    : '(source unavailable)';

  return (
    <div
      className="
        fixed top-0 right-0 h-full w-[380px] z-10
        bg-black/80 backdrop-blur-md
        border-l border-cyan-500/30
        font-mono text-sm text-cyan-400
        flex flex-col
      "
    >
      {/* 固定头部：标题 + 关闭按钮 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 shrink-0">
        <h2 className="text-cyan-300 text-base font-bold tracking-widest">
          FILE INSPECTOR
        </h2>
        <button
          onClick={onClose}
          className="
            w-8 h-8 flex items-center justify-center
            text-cyan-400/60 hover:text-white
            transition-colors cursor-pointer
          "
        >
          &#x2715;
        </button>
      </div>

      {/* 可滚动内容区 */}
      <div className="p-6 pt-5 overflow-y-auto flex-1">
        <div className="space-y-5">
          {/* 文件路径 */}
          <div>
            <span className="text-gray-500 text-xs tracking-wider">PATH</span>
            <p className="text-green-400 break-all mt-1 leading-relaxed">{building.filePath}</p>
          </div>

          {/* 代码行数 */}
          <div>
            <span className="text-gray-500 text-xs tracking-wider">LINES OF CODE</span>
            <p className="text-yellow-400 text-lg font-bold mt-1">{building.lineCount}</p>
          </div>

          {/* 依赖出入 */}
          <div className="flex gap-10">
            <div>
              <span className="text-gray-500 text-xs tracking-wider">DEPS OUT</span>
              <p className="text-pink-400 text-lg font-bold mt-1">{depsOut}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs tracking-wider">DEPS IN</span>
              <p className="text-pink-400 text-lg font-bold mt-1">{depsIn}</p>
            </div>
          </div>

          {/* 源码预览 */}
          <div>
            <span className="text-gray-500 text-xs tracking-wider">SOURCE PREVIEW</span>
            <pre
              className="
                mt-2 p-3 rounded
                bg-black/60 border border-cyan-900/50
                text-[11px] text-gray-300
                overflow-x-auto whitespace-pre
                leading-relaxed
              "
            >
              {codePreview}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
