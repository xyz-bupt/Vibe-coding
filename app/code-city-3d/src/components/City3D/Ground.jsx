export default function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[500, 500, 80, 80]} />
      <meshBasicMaterial
        color="#00ffff"
        wireframe
        transparent
        opacity={0.2}
      />
    </mesh>
  );
}
