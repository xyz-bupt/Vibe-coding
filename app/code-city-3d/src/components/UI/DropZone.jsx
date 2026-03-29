export default function DropZone({ onSelect }) {
  const handleClick = async () => {
    try {
      await onSelect();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to read directory:', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#050510] relative overflow-hidden">
      {/* 背景装饰网格 */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 顶部光晕 */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[400px] h-[300px] rounded-full bg-purple-500/[0.05] blur-[100px]" />

      {/* 主内容 */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg px-6">
        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-widest text-cyan-400 mb-2 font-mono">
            CODE CITY 3D
          </h1>
          <p className="text-sm text-cyan-600/80 font-mono tracking-wider">
            CYBERPUNK CODE VISUALIZER
          </p>
        </div>

        {/* 说明卡片 */}
        <div className="w-full bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-xl p-5 space-y-3 font-mono text-xs text-cyan-300/90">
          <div className="text-cyan-400 font-bold text-sm border-b border-cyan-500/20 pb-2 mb-3 tracking-widest">
            HOW IT WORKS
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 shrink-0">01</span>
            <span>选择一个代码仓库文件夹，自动分析源码结构</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 shrink-0">02</span>
            <span>每个文件变为一栋赛博朋克建筑——高度=代码行数，宽度=函数/类数量</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 shrink-0">03</span>
            <span>文件依赖关系以光束连接，光子在建筑间穿梭传递</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 shrink-0">04</span>
            <span>点击建筑查看源码详情，点击连线查看依赖信息</span>
          </div>
        </div>

        {/* 图例 */}
        <div className="w-full bg-black/30 border border-white/5 rounded-lg p-4 font-mono text-[11px]">
          <div className="text-gray-500 mb-2 tracking-widest">LEGEND</div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3178c6]" />
              <span className="text-gray-400">TypeScript</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f7df1e]" />
              <span className="text-gray-400">JavaScript</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#ff00ff]" />
              <span className="text-gray-400">CSS / Style</span>
            </span>
          </div>
        </div>

        {/* 按钮 */}
        <button
          onClick={handleClick}
          className="
            relative px-12 py-4 rounded-xl
            text-base font-semibold tracking-[0.2em] text-cyan-300 uppercase font-mono
            bg-cyan-500/[0.08] backdrop-blur-xl
            border border-cyan-500/30
            shadow-[0_0_40px_rgba(0,255,255,0.1)]
            hover:bg-cyan-500/[0.15] hover:border-cyan-400/50
            hover:shadow-[0_0_60px_rgba(0,255,255,0.2)]
            active:scale-[0.97]
            transition-all duration-300 cursor-pointer
          "
        >
          SELECT FOLDER
        </button>
      </div>
    </div>
  );
}
