import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import AgentOrb from './AgentOrb'

export default function Stage3D({ activeSpeaker, phase }) {
  const isAccord = phase === 'accord'

  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 8, 25]} />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />

      <Stars radius={50} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />

      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[4, 4, 0.1, 64]} />
        <meshStandardMaterial
          color="#111827"
          metalness={0.8}
          roughness={0.3}
          emissive="#1f2937"
          emissiveIntensity={0.1}
        />
      </mesh>

      <mesh position={[0, -1.44, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.8, 4, 64]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>

      <AgentOrb
        position={isAccord ? [0, 0.5, 0] : [-2.5, 0.5, 0]}
        color="#3b82f6"
        isActive={activeSpeaker === 'proxy' && !isAccord}
        isMerging={isAccord}
        mergeColor="#f59e0b"
      />

      <AgentOrb
        position={isAccord ? [0, 0.5, 0] : [2.5, 0.5, 0]}
        color="#10b981"
        isActive={activeSpeaker === 'challenger' && !isAccord}
        isMerging={isAccord}
        mergeColor="#f59e0b"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 4}
      />
    </Canvas>
  )
}
