import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import Building from './Building';
import Ground from './Ground';
import DataLinks from './DataLinks';

/**
 * 摄像机飞行动画：选中建筑时平滑飞向目标
 */
function CameraRig({ target }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const flyingRef = useRef(false);
  const destCamera = useRef(new THREE.Vector3(60, 40, 60));
  const destLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // 用户手动操作（缩放/旋转/平移）时，立即取消飞行动画
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cancel = () => { flyingRef.current = false; };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, []);

  useEffect(() => {
    if (!target) return;
    flyingRef.current = true;
    destCamera.current.set(
      target.position[0] + 15,
      target.metrics.height + 10,
      target.position[2] + 15,
    );
    destLookAt.current.set(
      target.position[0],
      target.metrics.height / 2,
      target.position[2],
    );
    const id = setTimeout(() => {
      flyingRef.current = false;
      camera.position.copy(destCamera.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(destLookAt.current);
      }
    }, 2500);
    return () => clearTimeout(id);
  }, [target, camera]);

  useFrame(() => {
    if (!flyingRef.current) return;
    camera.position.lerp(destCamera.current, 0.04);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(destLookAt.current, 0.04);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      maxPolarAngle={Math.PI / 2.1}
      minDistance={10}
      maxDistance={200}
    />
  );
}

const CHROMATIC_OFFSET = [0.002, 0.002];

export default function CityScene({ cityData, selectedBuilding, onSelectBuilding, onSelectLink }) {
  return (
    <Canvas
      camera={{ position: [60, 40, 60], fov: 55, near: 0.1, far: 1000 }}
      style={{ background: '#050510' }}
      onPointerMissed={() => onSelectBuilding(null)}
    >
      <fog attach="fog" args={['#0a0a2e', 50, 250]} />

      <ambientLight color="#1a1a4e" intensity={0.6} />
      <directionalLight color="#8833ff" position={[30, 50, 20]} intensity={0.8} />

      <Ground />

      {cityData.map((building) => (
        <Building
          key={building.id}
          data={building}
          isSelected={selectedBuilding?.id === building.id}
          onSelect={onSelectBuilding}
        />
      ))}

      <DataLinks cityData={cityData} onSelectLink={onSelectLink} />

      <CameraRig target={selectedBuilding} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={1.5}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
        <ChromaticAberration offset={CHROMATIC_OFFSET} />
      </EffectComposer>
    </Canvas>
  );
}
