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

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const isDebating = Boolean(activeSpeaker)

    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.y += delta * (isDebating ? 2.2 : 0.6)
      const scalePulse = 0.88 + Math.sin(time * (isDebating ? 4.5 : 1.5)) * 0.09
      innerMeshRef.current.scale.set(scalePulse, scalePulse, scalePulse)
    }

    if (outerWireframeRef.current) {
      outerWireframeRef.current.rotation.x -= delta * (isDebating ? 1.4 : 0.4)
      outerWireframeRef.current.rotation.z += delta * (isDebating ? 0.9 : 0.2)
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * (isDebating ? 3.5 : 1.0)
      ring1Ref.current.rotation.x += delta * 0.3
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * (isDebating ? 2.5 : 0.7)
      ring2Ref.current.rotation.y += delta * 0.4
    }
  })

  return (
    <group ref={coreRef} position={[0, 0.4, 0]}>
      {/* Glowing Inner Core Orb */}
      <mesh ref={innerMeshRef}>
        <dodecahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0284c7"
          emissiveIntensity={2.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Rotating Cyber Outer Wireframe Shell */}
      <mesh ref={outerWireframeRef}>
        <icosahedronGeometry args={[0.82, 1]} />
        <meshBasicMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Core Orbital Ring 1 - Cyan */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.0, 0.02, 16, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
      </mesh>

      {/* Core Orbital Ring 2 - Rose Accent */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 3, 0]}>
        <torusGeometry args={[1.2, 0.015, 16, 64]} />
        <meshBasicMaterial color="#f43f5e" transparent opacity={0.75} />
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

    const targetRotationY = activeSpeaker ? -activeTargetAngle : state.clock.elapsedTime * 0.06
    stageRef.current.rotation.y = THREE.MathUtils.lerp(
      stageRef.current.rotation.y,
      targetRotationY,
      delta * 3.5
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
        pointsRef.current.rotation.y += delta * 0.04
        pointsRef.current.rotation.x += delta * 0.02
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

  // 1v1 Debate Setup: 2 Orbs facing each other across the Dialectic Core
  const customRoleName = userRole || 'Institutional Advocate'

  const agents = [
    {
      role: customRoleName,
      roleKey: 'proxy',
      color: '#38bdf8',
      position: [-2.5, 0.5, 0]
    },
    {
      role: 'Egalitarian Conscience',
      roleKey: 'challenger',
      color: '#f43f5e',
      position: [2.5, 0.5, 0]
    }
  ]

  return (
    <div className="w-full h-full relative bg-slate-950">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 4.5, 7.5]} fov={50} />
        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={4}
          maxDistance={14}
          autoRotate={!activeSpeaker}
          autoRotateSpeed={0.4}
        />
        
        <SceneRig activeSpeaker={activeSpeaker} agents={agents}>
          {/* Background Deep Starfield & Ambient Particles */}
          <Stars radius={45} depth={50} count={2500} factor={4} saturation={0.6} fade speed={1.2} />
          <ParticleField count={350} />

          {/* Cinematic Studio Lighting Setup */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 12, 6]} intensity={1.8} color="#ffffff" castShadow />
          <directionalLight position={[-6, 6, -6]} intensity={0.8} color="#0284c7" />
          <pointLight position={[0, 3.5, 0]} intensity={2.8} color="#06b6d4" distance={10} />
          <pointLight position={[0, -1, 0]} intensity={1.5} color="#f43f5e" distance={8} />

          {/* Central Holographic Sentient Dialectic Core Model */}
          <SentientDialecticCore activeSpeaker={activeSpeaker} />

          {/* Futuristic Dialectic Reflexive Glass Table */}
          <mesh position={[0, -0.2, 0]} receiveShadow>
            <cylinderGeometry args={[3.2, 3.2, 0.12, 64]} />
            <meshStandardMaterial
              color="#090d16"
              roughness={0.08}
              metalness={0.95}
              transparent
              opacity={0.94}
            />
          </mesh>
          
          {/* Cyan/Rose Glowing Outer Table Perimeter Rings */}
          <mesh position={[0, -0.13, 0]}>
            <ringGeometry args={[3.15, 3.25, 64]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>

          {/* Inner Accent Ring */}
          <mesh position={[0, -0.12, 0]}>
            <ringGeometry args={[1.6, 1.65, 64]} />
            <meshBasicMaterial color="#f43f5e" side={THREE.DoubleSide} transparent opacity={0.6} />
          </mesh>

          {/* Center Holographic Core Emissive Ring */}
          <mesh position={[0, -0.11, 0]}>
            <ringGeometry args={[0.5, 0.65, 32]} />
            <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} />
          </mesh>

          {/* Render 2 Facing 3D Agent Avatars for 1v1 Debate */}
          {agents.map((agent) => (
            <AgentOrb
              key={agent.roleKey}
              role={agent.role}
              roleKey={agent.roleKey}
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



