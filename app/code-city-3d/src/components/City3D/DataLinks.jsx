import { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

function topCenter(building) {
  return new THREE.Vector3(
    building.position[0],
    building.metrics.height,
    building.position[2],
  );
}

function DataBeam({ from, to, onSelectLink }) {
  const photonRef = useRef();
  const progressRef = useRef(Math.random());
  const [hovered, setHovered] = useState(false);

  const { curve, points, tubeGeo } = useMemo(() => {
    const start = topCenter(from);
    const end = topCenter(to);

    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const dist = start.distanceTo(end);
    mid.y += dist * 0.35;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(48);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.6, 8, false);

    return { curve, points, tubeGeo };
  }, [from, to]);

  // 光标清理
  useEffect(() => {
    return () => {
      if (hovered) document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useFrame((_, delta) => {
    if (!photonRef.current) return;
    progressRef.current = (progressRef.current + delta * 0.3) % 1;
    const point = curve.getPoint(progressRef.current);
    photonRef.current.position.copy(point);
  });

  return (
    <group>
      {/* 可见光束线条 */}
      <Line
        points={points}
        color={hovered ? '#ff88ff' : '#ff00ff'}
        lineWidth={hovered ? 3 : 1.5}
        transparent
        opacity={hovered ? 0.9 : 0.35}
      />

      {/* 点击热区：沿曲线的透明管道，可被 raycaster 命中 */}
      <mesh
        geometry={tubeGeo}
        onClick={(e) => {
          e.stopPropagation();
          onSelectLink(from, to);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>

      {/* 飞行光子 */}
      <mesh ref={photonRef}>
        <sphereGeometry args={[hovered ? 0.5 : 0.35, 8, 8]} />
        <meshBasicMaterial color={hovered ? '#ffffff' : '#00ffff'} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

export default function DataLinks({ cityData, onSelectLink }) {
  const buildingMap = useMemo(() => {
    const map = new Map();
    cityData.forEach((b) => map.set(b.id, b));
    return map;
  }, [cityData]);

  const links = useMemo(() => {
    const result = [];
    cityData.forEach((building) => {
      building.targets.forEach((targetId) => {
        const target = buildingMap.get(targetId);
        if (target) {
          result.push({ from: building, to: target });
        }
      });
    });
    return result;
  }, [cityData, buildingMap]);

  return (
    <group>
      {links.map((link) => (
        <DataBeam
          key={`${link.from.id}-${link.to.id}`}
          from={link.from}
          to={link.to}
          onSelectLink={onSelectLink}
        />
      ))}
    </group>
  );
}
