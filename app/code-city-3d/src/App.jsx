import { useState, useMemo, useCallback } from 'react';
import DropZone from './components/UI/DropZone';
import CityScene from './components/City3D/Scene';
import Inspector from './components/UI/Inspector';
import LinkInspector from './components/UI/LinkInspector';
import { pickAndReadDirectory } from './core/fileSystem';
import { analyzeCode } from './core/astParser';
import { useCityLayout } from './hooks/useCityLayout';

function StatsDashboard({ stats }) {
  if (!stats) return null;

  return (
    <div
      className="
        fixed top-4 left-4 z-10
        bg-black/70 backdrop-blur-md
        border border-cyan-500/30 rounded-lg
        p-4 font-mono text-xs text-cyan-400
        min-w-[260px]
      "
    >
      <div className="text-cyan-300 font-bold text-sm border-b border-cyan-500/30 pb-1 mb-2 tracking-widest">
        CITY STATS
      </div>
      <div className="space-y-1">
        <div>
          TOTAL FILES: <span className="text-white">{stats.totalFiles}</span>
        </div>
        <div>
          TALLEST:{' '}
          <span className="text-yellow-400 break-all">{stats.tallest.path}</span>{' '}
          <span className="text-gray-500">({stats.tallest.lines} lines)</span>
        </div>
        <div>
          HUB:{' '}
          <span className="text-pink-400 break-all">{stats.busiest.path}</span>{' '}
          <span className="text-gray-500">({stats.busiest.imports} imports)</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [rawFiles, setRawFiles] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);

  const layout = useCityLayout(cityData);

  // 源码映射：filePath → content
  const sourceMap = useMemo(() => {
    if (!rawFiles) return new Map();
    return new Map(rawFiles.map((f) => [f.filePath, f.content]));
  }, [rawFiles]);

  // 当前选中建筑（O(n) 查找仅在此处执行一次）
  const selectedBuilding = useMemo(() => {
    if (selectedId === null) return null;
    return layout.find((b) => b.id === selectedId) ?? null;
  }, [selectedId, layout]);

  // 反向依赖映射：buildingId → 被引用次数
  const reverseDepsMap = useMemo(() => {
    const map = new Map();
    layout.forEach((b) => {
      b.targets.forEach((tid) => {
        map.set(tid, (map.get(tid) || 0) + 1);
      });
    });
    return map;
  }, [layout]);

  // 城市统计数据（复用 reverseDepsMap）
  const stats = useMemo(() => {
    if (layout.length === 0) return null;

    const tallest = layout.reduce((a, b) =>
      a.metrics.height > b.metrics.height ? a : b,
    );

    const busiest = layout.reduce((a, b) =>
      (reverseDepsMap.get(a.id) || 0) >= (reverseDepsMap.get(b.id) || 0) ? a : b,
    );

    return {
      totalFiles: layout.length,
      tallest: { path: tallest.filePath, lines: tallest.lineCount },
      busiest: { path: busiest.filePath, imports: reverseDepsMap.get(busiest.id) || 0 },
    };
  }, [layout, reverseDepsMap]);

  const handleDeselect = useCallback(() => setSelectedId(null), []);

  // 点击连线时：设置 selectedLink，同时取消建筑选中
  const handleSelectLink = useCallback((from, to) => {
    setSelectedLink({ from, to });
    setSelectedId(null);
  }, []);

  const handleDeselectLink = useCallback(() => setSelectedLink(null), []);

  // 连线源文件源码（用于提取 import 语句）
  const linkSourceCode = useMemo(() => {
    if (!selectedLink) return null;
    return sourceMap.get(selectedLink.from.filePath) ?? null;
  }, [selectedLink, sourceMap]);

  const handleSelect = async () => {
    const files = await pickAndReadDirectory();

    const analyzed = files.map((f) => analyzeCode(f.content, f.filePath, f.lastModified));

    setRawFiles(files);
    setCityData(analyzed);
    setSelectedId(null);
    setSelectedLink(null);
    return files;
  };

  return (
    <div className="w-full h-screen">
      {layout.length > 0 ? (
        <>
          <CityScene
            cityData={layout}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(id) => { setSelectedId(id); setSelectedLink(null); }}
            onSelectLink={handleSelectLink}
          />
          <StatsDashboard stats={stats} />
          <Inspector
            building={selectedBuilding}
            depsIn={
              selectedBuilding
                ? (reverseDepsMap.get(selectedBuilding.id) || 0)
                : 0
            }
            sourceCode={
              selectedBuilding
                ? sourceMap.get(selectedBuilding.filePath) ?? null
                : null
            }
            onClose={handleDeselect}
          />
          <LinkInspector
            link={selectedLink}
            sourceCode={linkSourceCode}
            onClose={handleDeselectLink}
          />
        </>
      ) : (
        <DropZone onSelect={handleSelect} />
      )}
    </div>
  );
}
