import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function AgentOrb({ position, role, roleKey, color, activeSpeaker, hideLabel = false }) {
  const groupRef = useRef()
  const meshRef = useRef()
  const outerWireframeRef = useRef()
  const ringRef1 = useRef()
  const ringRef2 = useRef()
  const visualizerGroupRef = useRef()

  const isActive = useMemo(() => {
    if (!activeSpeaker) return false
    if (activeSpeaker === role || activeSpeaker === roleKey) return true
    if (roleKey === 'proxy' && (activeSpeaker === 'proxy' || activeSpeaker === 'Institutional Advocate')) return true
    if (roleKey === 'challenger' && (activeSpeaker === 'challenger' || activeSpeaker === 'Egalitarian Conscience')) return true
    return false
  }, [activeSpeaker, role, roleKey])

  const basePosition = useMemo(() => new THREE.Vector3(position[0], position[1], position[2]), [position])
  const centerPosition = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  // Create audio visualizer bar heights & angles
  const bars = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      baseHeight: 0.2 + Math.random() * 0.2,
      speed: 3 + Math.random() * 5
    }))
  }, [])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    if (groupRef.current) {
      const targetY = basePosition.y + (isActive ? 0.35 : Math.sin(time * 1.5 + basePosition.x) * 0.08)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 4)
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isActive ? 1.2 : 0.4)
      meshRef.current.rotation.x += delta * 0.2

      const targetScale = isActive ? 1.35 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6)

      if (meshRef.current.material) {
        const targetEmissive = isActive ? 3.2 : 0.6
        meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
          meshRef.current.material.emissiveIntensity,
          targetEmissive,
          delta * 6
        )
      }
    }

    if (outerWireframeRef.current) {
      outerWireframeRef.current.rotation.y -= delta * (isActive ? 1.8 : 0.5)
      outerWireframeRef.current.rotation.z += delta * 0.3
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * (isActive ? 3.5 : 1.0)
      ringRef1.current.rotation.x += delta * 0.5
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * (isActive ? 2.5 : 0.8)
      ringRef2.current.rotation.y += delta * 0.6
    }

    // Animate audio visualizer bars when active
    if (visualizerGroupRef.current) {
      visualizerGroupRef.current.children.forEach((barMesh, idx) => {
        const barData = bars[idx]
        if (barData) {
          const scaleY = isActive ? 1 + Math.sin(time * barData.speed + idx) * 0.8 : 0.1
          barMesh.scale.y = THREE.MathUtils.lerp(barMesh.scale.y, scaleY, delta * 8)
        }
      })
    }
  })

  // Laser energy beam geometry from Agent to Center when active
  const beamPoints = useMemo(() => {
    return [new THREE.Vector3(0, 0, 0), centerPosition.clone().sub(basePosition)]
  }, [basePosition, centerPosition])

  const beamLineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(beamPoints)
  }, [beamPoints])

  return (
    <group ref={groupRef} position={position}>
      {/* Base Glowing Pedestal Circle */}
      <mesh position={[0, -0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.7, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.85 : 0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Primary Glowing Core Sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.55, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Outer Holographic Wireframe Shield */}
      <mesh ref={outerWireframeRef}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={isActive ? 0.7 : 0.3}
        />
      </mesh>

      {/* Ring 1 - Primary Energy Ring */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[0.88, 0.025, 16, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.95 : 0.4}
        />
      </mesh>

      {/* Ring 2 - Secondary Angled Ring */}
      <mesh ref={ringRef2} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.05, 0.015, 16, 64]} />
        <meshBasicMaterial
          color={isActive ? '#38bdf8' : color}
          transparent
          opacity={isActive ? 0.8 : 0.2}
        />
      </mesh>

      {/* Active Speaker Audio Visualizer Ring of Equalizer Columns */}
      <group ref={visualizerGroupRef} position={[0, 0, 0]}>
        {bars.map((bar, idx) => (
          <mesh
            key={idx}
            position={[
              Math.cos(bar.angle) * 1.15,
              0,
              Math.sin(bar.angle) * 1.15
            ]}
          >
            <boxGeometry args={[0.04, 0.6, 0.04]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isActive ? 0.9 : 0.0}
            />
          </mesh>
        ))}
      </group>

      {/* Laser Energy Stream to Center when Active */}
      {isActive && (
        <line geometry={beamLineGeometry}>
          <lineBasicMaterial color={color} linewidth={3} transparent opacity={0.85} />
        </line>
      )}

      {/* 3D Holographic Label Badge */}
      {!hideLabel && (
        <Html position={[0, 1.4, 0]} center distanceFactor={10}>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shadow-2xl border backdrop-blur-md ${
              isActive
                ? 'bg-slate-950/95 text-white border-cyan-400 scale-110 shadow-cyan-500/50 ring-2 ring-cyan-400/40'
                : 'bg-slate-950/80 text-slate-300 border-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${isActive ? 'animate-ping' : ''}`}
                style={{ backgroundColor: color }}
              />
              <span className="font-bold tracking-wide text-slate-100">{role}</span>
              {isActive && (
                <span className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  SPEAKING
                </span>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

