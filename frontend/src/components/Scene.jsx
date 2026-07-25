import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import AgentOrb from './AgentOrb'

// Central Sentient Dialectic Core 3D Model Component
function SentientDialecticCore({ activeSpeaker }) {
  const coreRef = useRef()
  const innerMeshRef = useRef()
  const outerWireframeRef = useRef()
  const ring1Ref = useRef()
  const ring2Ref = useRef()
  const ring3Ref = useRef()

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const isDebating = Boolean(activeSpeaker)

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y += delta * (isDebating ? 2.5 : 0.7)
      innerMeshRef.current.rotation.z += delta * (isDebating ? 1.2 : 0.3)
      const scalePulse = 0.9 + Math.sin(time * (isDebating ? 5.0 : 1.8)) * 0.12
      innerMeshRef.current.scale.set(scalePulse, scalePulse, scalePulse)
    }

    if (outerWireframeRef.current) {
      outerWireframeRef.current.rotation.x -= delta * (isDebating ? 1.6 : 0.5)
      outerWireframeRef.current.rotation.z += delta * (isDebating ? 1.0 : 0.3)
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * (isDebating ? 4.0 : 1.2)
      ring1Ref.current.rotation.x += delta * 0.4
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * (isDebating ? 3.0 : 0.9)
      ring2Ref.current.rotation.y += delta * 0.5
    }

    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * (isDebating ? 3.5 : 1.1)
      ring3Ref.current.rotation.z -= delta * 0.4
    }
  })

  return (
    <group ref={coreRef} position={[0, 0.4, 0]}>
      {/* Glowing Inner Octahedron Quantum Core */}
      <mesh ref={innerMeshRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#38bdf8"
          emissiveIntensity={3.0}
          roughness={0.05}
          metalness={0.95}
          flatShading
        />
      </mesh>

      {/* Rotating Cyber Outer Wireframe Shell */}
      <mesh ref={outerWireframeRef}>
        <icosahedronGeometry args={[0.88, 1]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Core Orbital Ring 1 - Cyan */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.05, 0.02, 16, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.9} />
      </mesh>

      {/* Core Orbital Ring 2 - Rose Accent */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 3, 0]}>
        <torusGeometry args={[1.25, 0.015, 16, 64]} />
        <meshBasicMaterial color="#f43f5e" transparent opacity={0.8} />
      </mesh>

      {/* Core Orbital Ring 3 - Gold Accent */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 3, 0, Math.PI / 4]}>
        <torusGeometry args={[1.42, 0.01, 16, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
      </mesh>
    </group>
  )
}


function SceneRig({ activeSpeaker, agents, children }) {
  const stageRef = useRef()

  const activeAgent = agents.find((agent) => {
    if (!activeSpeaker) return false
    if (activeSpeaker === agent.role || activeSpeaker === agent.roleKey) return true
    if (agent.roleKey === 'proxy' && (activeSpeaker === 'proxy' || activeSpeaker === 'Institutional Advocate')) return true
    if (agent.roleKey === 'challenger' && (activeSpeaker === 'challenger' || activeSpeaker === 'Egalitarian Conscience')) return true
    return false
  })

  const activeTargetAngle = activeAgent ? Math.atan2(activeAgent.position[0], activeAgent.position[2]) : 0

  useFrame((state, delta) => {
    if (!stageRef.current) return

    const targetRotationY = activeSpeaker ? -activeTargetAngle : state.clock.elapsedTime * 0.02
    stageRef.current.rotation.y = THREE.MathUtils.lerp(
      stageRef.current.rotation.y,
      targetRotationY,
      delta * 1.5
    )
  })

  return <group ref={stageRef}>{children}</group>
}

export default function Scene({ userRole = 'Institutional Advocate', activeSpeaker, hideLabels = false }) {
  // Ambient Floating Cyber Particle Cloud
  const ParticleField = ({ count = 350 }) => {
    const pointsRef = useRef()

    const positions = useMemo(() => {
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 22
        pos[i * 3 + 1] = (Math.random() - 0.5) * 14 + 2
        pos[i * 3 + 2] = (Math.random() - 0.5) * 22
      }
      return pos
    }, [count])

    useFrame((state, delta) => {
      if (pointsRef.current) {
        pointsRef.current.rotation.y += delta * 0.01
        pointsRef.current.rotation.x += delta * 0.005
      }
    })

    return (
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.07}
          color="#38bdf8"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>
    )
  }

  // 1v1 Debate Setup: Boss (Decision Maker) vs Suggestionist Advisor
  const customRoleName = userRole || 'CEO of Apex Labs'

  const agents = [
    {
      role: customRoleName,
      roleKey: 'proxy',
      badgeTag: 'BOSS / DECISION MAKER',
      color: '#38bdf8',
      position: [-2.5, 0.5, 0]
    },
    {
      role: 'Suggestionist Advisor',
      roleKey: 'challenger',
      badgeTag: 'SUGGESTIONIST ADVISOR',
      color: '#f43f5e',
      position: [2.5, 0.5, 0]
    }
  ]

  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 3.5, 7.5]} fov={50} />
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={4}
          maxDistance={14}
          autoRotate={!activeSpeaker}
          autoRotateSpeed={0.12}
        />
        
        <SceneRig activeSpeaker={activeSpeaker} agents={agents}>
          {/* Background Deep Starfield & Ambient Particles */}
          <Stars radius={45} depth={50} count={2500} factor={4} saturation={0.6} fade speed={0.4} />
          <ParticleField count={350} />

          {/* Cinematic Studio Lighting Setup */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 12, 6]} intensity={1.8} color="#ffffff" castShadow />
          <directionalLight position={[-6, 6, -6]} intensity={0.8} color="#0284c7" />
          <pointLight position={[0, 3.5, 0]} intensity={2.2} color="#06b6d4" distance={10} />
          <pointLight position={[0, -1, 0]} intensity={1.2} color="#f43f5e" distance={8} />

          {/* Render 2 Facing 3D Agent Orbs for 1v1 Debate */}
          {agents.map((agent) => (
            <AgentOrb
              key={agent.roleKey}
              role={agent.role}
              roleKey={agent.roleKey}
              badgeTag={agent.badgeTag}
              color={agent.color}
              position={agent.position}
              activeSpeaker={activeSpeaker}
              hideLabel={hideLabels}
            />
          ))}
        </SceneRig>
      </Canvas>
    </div>
  )
}




