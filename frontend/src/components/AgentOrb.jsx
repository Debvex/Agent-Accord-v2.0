import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function AgentOrb({ position, role, roleKey, color, activeSpeaker, hideLabel = false, badgeTag }) {
  const groupRef = useRef()
  const ballRef = useRef()
  const shadowGlowRef = useRef()
  const ringAuraRef = useRef()
  const visualizerGroupRef = useRef()
  

  const isBoss = roleKey === 'proxy'
  const isSuggestionist = roleKey === 'challenger'

  const isActive = useMemo(() => {
    if (!activeSpeaker) return false
    if (activeSpeaker === role || activeSpeaker === roleKey) return true
    if (roleKey === 'proxy' && (activeSpeaker === 'proxy' || activeSpeaker === 'Institutional Advocate')) return true
    if (roleKey === 'challenger' && (activeSpeaker === 'challenger' || activeSpeaker === 'Egalitarian Conscience' || activeSpeaker === 'Suggestionist Advisor')) return true
    return false
  }, [activeSpeaker, role, roleKey])

  const basePosition = useMemo(() => new THREE.Vector3(position[0], position[1], position[2]), [position])
  const centerPosition = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  // Create custom gradient texture for the 3D ball
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    const grad = ctx.createLinearGradient(0, 0, 512, 512)
    if (roleKey === 'proxy') {
      grad.addColorStop(0, '#38bdf8') // Vibrant Cyan
      grad.addColorStop(0.5, '#0284c7') // Deep Electric Blue
      grad.addColorStop(1, '#4f46e5') // Indigo
    } else {
      grad.addColorStop(0, '#f43f5e') // Bright Rose
      grad.addColorStop(0.5, '#e11d48') // Crimson
      grad.addColorStop(1, '#fbbf24') // Warm Amber
    }

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 512, 512)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [roleKey])

  // Audio equalizer bars
  const bars = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      baseHeight: 0.2 + Math.random() * 0.2,
      speed: 5 + Math.random() * 6
    }))
  }, [])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime

    // Floating idle animation (Slow & Smooth)
    if (groupRef.current) {
      const targetY = basePosition.y + (isActive ? 0.35 : Math.sin(time * 0.8 + basePosition.x) * 0.08)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 2.5)
    }

    // Ball rotation & scaling (Slow & Smooth)
    if (ballRef.current) {
      ballRef.current.rotation.y += delta * (isActive ? 0.5 : 0.15)
      ballRef.current.rotation.x += delta * 0.08

      const targetScale = isActive ? 1.25 : 1.0
      ballRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4)

      if (ballRef.current.material) {
        const targetEmissive = isActive ? 1.8 : 0.35
        ballRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
          ballRef.current.material.emissiveIntensity,
          targetEmissive,
          delta * 4
        )
      }
    }

    // Gentle Breathing Glowing Shadow Aura around the ball when speaking (Slower)
    if (shadowGlowRef.current) {
      if (isActive) {
        // Slow gentle breathing glow effect when speaking
        const blinkOpacity = 0.35 + Math.abs(Math.sin(time * 3.5)) * 0.45
        const glowPulse = 1.05 + Math.sin(time * 2.5) * 0.1
        shadowGlowRef.current.scale.set(glowPulse, glowPulse, glowPulse)
        shadowGlowRef.current.material.opacity = THREE.MathUtils.lerp(
          shadowGlowRef.current.material.opacity,
          blinkOpacity,
          delta * 5
        )
      } else {
        shadowGlowRef.current.material.opacity = THREE.MathUtils.lerp(
          shadowGlowRef.current.material.opacity,
          0.0,
          delta * 5
        )
      }
    }

    // Outer Blinking Halo Ring (Slower)
    if (ringAuraRef.current) {
      if (isActive) {
        const ringBlink = 0.3 + Math.abs(Math.cos(time * 3.0)) * 0.5
        const ringScale = 1.0 + Math.sin(time * 2.2) * 0.15
        ringAuraRef.current.scale.set(ringScale, ringScale, 1)
        ringAuraRef.current.rotation.z += delta * 0.8
        ringAuraRef.current.material.opacity = THREE.MathUtils.lerp(
          ringAuraRef.current.material.opacity,
          ringBlink,
          delta * 5
        )
      } else {
        ringAuraRef.current.material.opacity = THREE.MathUtils.lerp(
          ringAuraRef.current.material.opacity,
          0.0,
          delta * 5
        )
      }
    }

    // Animate audio equalizer bars when active (Slower)
    if (visualizerGroupRef.current) {
      visualizerGroupRef.current.children.forEach((barMesh, idx) => {
        const barData = bars[idx]
        if (barData) {
          const scaleY = isActive ? 1 + Math.sin(time * (barData.speed * 0.5) + idx) * 1.1 : 0.05
          barMesh.scale.y = THREE.MathUtils.lerp(barMesh.scale.y, scaleY, delta * 6)
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
      {/* Base Cyber Pedestal Shadow */}
      <group position={[0, -0.55, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.75, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isActive ? 0.9 : 0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Main 3D Gradient Sphere Ball */}
      <mesh ref={ballRef}>
        <sphereGeometry args={[0.65, 64, 64]} />
        <meshStandardMaterial
          map={gradientTexture}
          roughness={0.15}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>

      {/* Blinking Glowing Shadow Aura Sphere around the Ball (Speaking Effect) */}
      <mesh ref={shadowGlowRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Blinking Glowing Perimeter Halo Ring (Speaking Effect) */}
      <mesh ref={ringAuraRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 1.25, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Active Speaker Audio Visualizer Equalizer Columns */}
      <group ref={visualizerGroupRef} position={[0, 0, 0]}>
        {bars.map((bar, idx) => (
          <mesh
            key={idx}
            position={[
              Math.cos(bar.angle) * 1.25,
              0,
              Math.sin(bar.angle) * 1.25
            ]}
          >
            <boxGeometry args={[0.035, 0.7, 0.035]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={isActive ? 0.95 : 0.0}
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
        <Html position={[0, 1.45, 0]} center distanceFactor={10}>
          <div
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 shadow-2xl border backdrop-blur-md flex flex-col items-center gap-0.5 ${
              isActive
                ? isBoss
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.7)] scale-110'
                  : 'bg-rose-950/90 text-rose-300 border-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.7)] scale-110'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/80 opacity-80'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold tracking-wide">
              {isBoss && <span className="text-amber-400 text-xs">👑</span>}
              {isSuggestionist && <span className="text-rose-400 text-xs">💡</span>}
              <span>{role}</span>
              {isActive && (
                <span className="text-[9px] font-extrabold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  SPEAKING
                </span>
              )}
            </div>
            <span
              className={`text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded ${
                isBoss
                  ? 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/50'
                  : 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
              }`}
            >
              {badgeTag || (isBoss ? 'BOSS / DECISION MAKER' : 'SUGGESTIONIST ADVISOR')}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}



