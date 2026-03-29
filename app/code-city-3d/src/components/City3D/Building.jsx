import { useMemo, useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { edgesColorFor } from '../../core/colorMap';

// ---------------------------------------------------------------------------
// 程序化窗户纹理
// ---------------------------------------------------------------------------

function generateWindowTexture(accentColor) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 深色背景
  ctx.fillStyle = '#08080f';
  ctx.fillRect(0, 0, size, size);

  const cols = 8;
  const rows = 16;
  const padX = 3;
  const padY = 2;
  const cellW = (size - padX * (cols + 1)) / cols;
  const cellH = (size - padY * (rows + 1)) / rows;

  const litColors = [accentColor, '#00ffff', '#ffcc00'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (cellW + padX);
      const y = padY + r * (cellH + padY);

      if (Math.random() < 0.3) {
        ctx.fillStyle = litColors[Math.floor(Math.random() * litColors.length)];
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
      } else {
        ctx.fillStyle = '#10101c';
        ctx.globalAlpha = 0.9;
      }
      ctx.fillRect(x, y, cellW, cellH);
    }
  }

  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// ---------------------------------------------------------------------------
// 建筑类型判断
// ---------------------------------------------------------------------------

function getBuildingType(filePath) {
  const fileName = filePath.split('/').pop().toLowerCase();
  if (
    fileName.startsWith('index.') ||
    fileName.startsWith('main.') ||
    fileName === 'app.jsx' ||
    fileName === 'app.tsx'
  ) {
    return 'entry';
  }
  if (filePath.toLowerCase().includes('component')) {
    return 'component';
  }
  return 'standard';
}

// ---------------------------------------------------------------------------
// 共享交互逻辑
// ---------------------------------------------------------------------------

function useBuildingInteraction(data, onSelect) {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    return () => {
      if (hovered) document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const handlers = {
    onClick: (e) => {
      e.stopPropagation();
      onSelect(data.id);
    },
    onPointerOver: (e) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      setHovered(false);
      document.body.style.cursor = 'auto';
    },
  };

  return { hovered, handlers };
}

// ---------------------------------------------------------------------------
// 文件新鲜度计算
// ---------------------------------------------------------------------------

const ONE_DAY = 24 * 3600_000;
const ONE_MONTH = 30 * ONE_DAY;

function getFileFreshness(lastModified) {
  if (!lastModified) return 'old';
  const age = Date.now() - lastModified;
  if (age < ONE_DAY) return 'fresh';
  if (age < ONE_MONTH) return 'normal';
  return 'old';
}

// ---------------------------------------------------------------------------
// 全息投影文件名招牌
// ---------------------------------------------------------------------------

function HolographicSign({ label, y }) {
  const ref = useRef();
  const baseY = useRef(y);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = baseY.current + Math.sin(clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <Text
      ref={ref}
      position={[0, y, 0]}
      fontSize={1.2}
      color="#00ffff"
      anchorX="center"
      anchorY="bottom"
      maxWidth={12}
      fillOpacity={0.85}
      outlineWidth={0.04}
      outlineColor="#005555"
    >
      {label}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// 枢纽文件数据环
// ---------------------------------------------------------------------------

function DataRing({ y, radius }) {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.15, 8, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 呼吸光效 Hook
// ---------------------------------------------------------------------------

function useBreathingEmissive(lastModified, highlighted) {
  const matRef = useRef();

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const freshness = getFileFreshness(lastModified);

    if (freshness === 'fresh') {
      // emissiveIntensity 在 0.5 到 2.0 之间呼吸
      const t = (Math.sin(clock.elapsedTime * 2) + 1) / 2; // 0~1
      const intensity = 0.5 + t * 1.5; // 0.5~2.0
      matRef.current.emissiveIntensity = highlighted ? intensity * 1.2 : intensity;
    } else if (freshness === 'normal') {
      matRef.current.emissiveIntensity = highlighted ? 0.8 : 0.4;
    } else {
      matRef.current.emissiveIntensity = highlighted ? 0.4 : 0.1;
    }
  });

  return matRef;
}

// ---------------------------------------------------------------------------
// 标准建筑 — Box
// ---------------------------------------------------------------------------

function StandardBuilding({ metrics, position, highlighted, accentColor, handlers, lastModified }) {
  const { height, width, depth } = metrics;

  const windowTex = useMemo(() => generateWindowTexture(accentColor), [accentColor]);
  useEffect(() => () => windowTex.dispose(), [windowTex]);

  const edgesGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, [width, height, depth]);
  useEffect(() => () => edgesGeo.dispose(), [edgesGeo]);

  const matRef = useBreathingEmissive(lastModified, highlighted);

  return (
    <group position={[position[0], height / 2, position[2]]}>
      <mesh {...handlers}>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          ref={matRef}
          color={highlighted ? '#ffffff' : '#1a1a2e'}
          map={windowTex}
          emissive={accentColor}
          emissiveMap={windowTex}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={accentColor} transparent opacity={highlighted ? 1 : 0.6} />
      </lineSegments>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 入口建筑 — Cylinder + 天线
// ---------------------------------------------------------------------------

function EntryBuilding({ metrics, position, highlighted, accentColor, handlers, lastModified }) {
  const { height, width, depth } = metrics;
  const radius = Math.max(width, depth) / 2;

  const windowTex = useMemo(() => generateWindowTexture(accentColor), [accentColor]);
  useEffect(() => () => windowTex.dispose(), [windowTex]);

  const matRef = useBreathingEmissive(lastModified, highlighted);

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* 主体圆柱 */}
      <mesh {...handlers} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 0.7, radius, height, 8]} />
        <meshPhysicalMaterial
          ref={matRef}
          color={highlighted ? '#ffffff' : '#12122a'}
          map={windowTex}
          emissive={accentColor}
          emissiveMap={windowTex}
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 顶部光环 */}
      <mesh position={[0, height + 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 0.75, radius * 0.95, 8]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={highlighted ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 天线杆 */}
      <mesh position={[0, height + 3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 6, 4]} />
        <meshBasicMaterial color={accentColor} />
      </mesh>

      {/* 天线顶端发光球 */}
      <mesh position={[0, height + 6.5, 0]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 组件建筑 — 堆叠 Box Group（组件化隐喻）
// ---------------------------------------------------------------------------

function ComponentBuilding({ metrics, position, highlighted, accentColor, handlers, lastModified }) {
  const { height, width, depth } = metrics;

  const windowTex = useMemo(() => generateWindowTexture(accentColor), [accentColor]);
  useEffect(() => () => windowTex.dispose(), [windowTex]);

  const matRef = useBreathingEmissive(lastModified, highlighted);

  const { boxes, edgesGeos } = useMemo(() => {
    const count = 3 + (Math.round(width * depth) % 3); // 3-5 个子块
    const result = [];
    const edges = [];
    let currentY = 0;
    const sectionH = height / count;

    for (let i = 0; i < count; i++) {
      const scale = 0.6 + ((i * 7 + 3) % 5) / 10;
      const boxH = sectionH * (0.75 + ((i * 3 + 1) % 5) / 20);
      const boxW = width * scale;
      const boxD = depth * scale;
      const xOff = (((i * 13) % 7) - 3) / 10 * width * 0.3;
      const zOff = (((i * 11) % 7) - 3) / 10 * depth * 0.3;

      result.push({
        width: boxW,
        height: boxH,
        depth: boxD,
        y: currentY + boxH / 2,
        xOff,
        zOff,
      });

      const b = new THREE.BoxGeometry(boxW, boxH, boxD);
      const e = new THREE.EdgesGeometry(b);
      b.dispose();
      edges.push(e);

      currentY += boxH;
    }
    return { boxes: result, edgesGeos: edges };
  }, [height, width, depth]);

  useEffect(() => () => {
    edgesGeos.forEach((g) => g.dispose());
  }, [edgesGeos]);

  return (
    <group position={[position[0], 0, position[2]]}>
      {boxes.map((box, i) => (
        <mesh key={i} position={[box.xOff, box.y, box.zOff]} {...handlers}>
          <boxGeometry args={[box.width, box.height, box.depth]} />
          <meshPhysicalMaterial
            ref={i === 0 ? matRef : undefined}
            color={highlighted ? '#ffffff' : '#1a1a2e'}
            map={windowTex}
            emissive={accentColor}
            emissiveMap={windowTex}
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}
      {edgesGeos.map((geo, i) => {
        const box = boxes[i];
        return (
          <lineSegments
            key={`e-${i}`}
            position={[box.xOff, box.y, box.zOff]}
            geometry={geo}
          >
            <lineBasicMaterial
              color={accentColor}
              transparent
              opacity={highlighted ? 1 : 0.6}
            />
          </lineSegments>
        );
      })}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 主组件
// ---------------------------------------------------------------------------

export default function Building({ data, isSelected, onSelect }) {
  const { metrics, position } = data;
  const { hovered, handlers } = useBuildingInteraction(data, onSelect);
  const highlighted = hovered || isSelected;

  const accentColor = edgesColorFor(data.filePath);
  const type = getBuildingType(data.filePath);
  const fileName = data.filePath.split('/').pop();
  const buildingHeight = metrics.height;

  const props = {
    metrics,
    position,
    highlighted,
    accentColor,
    handlers,
    lastModified: data.lastModified,
  };

  const signY = type === 'entry' ? buildingHeight + 7.5 : buildingHeight + 1.5;

  return (
    <group>
      {type === 'entry' && <EntryBuilding {...props} />}
      {type === 'component' && <ComponentBuilding {...props} />}
      {type !== 'entry' && type !== 'component' && <StandardBuilding {...props} />}

      {/* 全息投影文件名招牌 */}
      <group position={[position[0], 0, position[2]]}>
        <HolographicSign label={fileName} y={signY} />
      </group>

      {/* 枢纽文件数据环 */}
      {data.targetedBy > 5 && (
        <group position={[position[0], 0, position[2]]}>
          <DataRing y={buildingHeight * 0.3} radius={Math.max(metrics.width, metrics.depth) * 0.8} />
        </group>
      )}
    </group>
  );
}
