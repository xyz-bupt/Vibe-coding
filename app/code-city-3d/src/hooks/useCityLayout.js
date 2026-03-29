import { useMemo } from 'react';

/**
 * 将分析后的文件数据映射为 3D 城市布局
 * 同目录文件聚簇为一个 Block，使用网格布局，中心留空
 */
export function useCityLayout(analyzedFiles) {
  return useMemo(() => {
    if (!analyzedFiles || analyzedFiles.length === 0) return [];

    // 1) 按"所在目录"分簇
    const blockMap = new Map();
    analyzedFiles.forEach((file) => {
      const dir = file.filePath.includes('/')
        ? file.filePath.substring(0, file.filePath.lastIndexOf('/'))
        : '__root__';
      if (!blockMap.has(dir)) blockMap.set(dir, []);
      blockMap.get(dir).push(file);
    });

    // 2) 为每个 Block 分配一个中心坐标（螺旋布局）
    const blocks = Array.from(blockMap.entries());
    const blockCenters = assignBlockCenters(blocks.length);

    // 3) 在每个 Block 内部做网格布局
    const idMap = new Map();
    const buildings = [];
    let nextId = 0;

    blocks.forEach(([dir, files], blockIdx) => {
      const center = blockCenters[blockIdx];
      const cols = Math.ceil(Math.sqrt(files.length));

      files.forEach((file, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const id = nextId++;
        idMap.set(file.filePath, id);

        buildings.push({
          id,
          filePath: file.filePath,
          lineCount: file.lineCount,
          lastModified: file.lastModified || 0,
          targetedBy: 0,
          metrics: {
            height: file.height,
            width: file.width,
            depth: file.depth,
          },
          position: [
            center[0] + col * 4,
            0,
            center[1] + row * 4,
          ],
          targets: [],
        });
      });
    });

    // 4) 解析依赖关系 + 计算 targetedBy
    const filePathSet = new Set(analyzedFiles.map((f) => f.filePath));

    analyzedFiles.forEach((file) => {
      const buildingId = idMap.get(file.filePath);
      if (buildingId === undefined) return;
      const building = buildings[buildingId];

      file.imports.forEach((imp) => {
        const resolved = resolveImportPath(file.filePath, imp, filePathSet);
        if (resolved) {
          const targetId = idMap.get(resolved);
          if (targetId !== undefined && targetId !== building.id) {
            building.targets.push(targetId);
            buildings[targetId].targetedBy++;
          }
        }
      });
    });

    return buildings;
  }, [analyzedFiles]);
}

function assignBlockCenters(count) {
  const centers = [];
  if (count === 0) return centers;

  const step = 30;
  const dirs = [[1, 0], [0, -1], [-1, 0], [0, 1]];
  let x = 0, z = 0, dirIdx = 0, segLen = 1, segPassed = 0, turnCount = 0;

  for (let i = 0; i < count; i++) {
    centers.push([x * step, z * step]);
    x += dirs[dirIdx][0];
    z += dirs[dirIdx][1];
    segPassed++;
    if (segPassed >= segLen) {
      segPassed = 0;
      dirIdx = (dirIdx + 1) % 4;
      turnCount++;
      if (turnCount % 2 === 0) segLen++;
    }
  }

  return centers;
}

function normalizePathSegments(path) {
  const parts = path.split('/');
  const result = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') { result.pop(); } else { result.push(part); }
  }
  return result.join('/');
}

function resolveImportPath(fromFile, importPath, filePathSet) {
  if (!importPath.startsWith('.')) return null;
  const dir = fromFile.includes('/')
    ? fromFile.substring(0, fromFile.lastIndexOf('/'))
    : '';
  const normalized = normalizePathSegments(dir + '/' + importPath);
  if (filePathSet.has(normalized)) return normalized;
  const extensions = ['.js', '.jsx', '.ts', '.tsx'];
  for (const ext of extensions) {
    if (filePathSet.has(normalized + ext)) return normalized + ext;
  }
  for (const ext of extensions) {
    if (filePathSet.has(normalized + '/index' + ext)) return normalized + '/index' + ext;
  }
  return null;
}
