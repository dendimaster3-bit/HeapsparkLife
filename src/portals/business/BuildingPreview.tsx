/** Live, slowly rotating 3D preview of the building being configured. */
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BuildingFull, type BuildingVisual } from '@/game/buildings/Building';

export default function BuildingPreview(v: BuildingVisual) {
  return (
    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 to-emerald-100 dark:from-slate-800 dark:to-slate-900">
      <Canvas camera={{ position: [5, 4.5, 7], fov: 40 }} dpr={[1, 1.5]}>
        <hemisphereLight args={['#ffffff', '#64748b', 1.4]} />
        <directionalLight position={[6, 10, 6]} intensity={1.8} />
        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <circleGeometry args={[6, 32]} />
          <meshLambertMaterial color="#86c96b" />
        </mesh>
        <group position-x={-0.8}>
          <BuildingFull {...v} />
        </group>
        <OrbitControls autoRotate autoRotateSpeed={1.2} enablePan={false} minDistance={5} maxDistance={14} maxPolarAngle={1.4} target={[0, 1, 0]} />
      </Canvas>
    </div>
  );
}
