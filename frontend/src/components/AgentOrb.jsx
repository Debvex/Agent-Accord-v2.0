import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function AgentOrb({ position, color, isActive, isMerging, mergeColor }) {
  const meshRef = useRef()
  const lightRef = useRef()
  const glowRef = useRef()
  const [currentScale, setCurrentScale] = useState(1)
  const [currentEmissive, setCurrentEmissive] = useState(0.3)
  const [currentLightIntensity, setCurrentLightIntensity] = useState(2)
  const [currentColor, setCurrentColor] = useState(color)

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const targetScale = isMerging ? 1.5 : isActive ? 1.3 : 0.85
    const targetEmissive = isMerging ? 0.8 : isActive ? 0.7 : 0.2
    const targetLightIntensity = isMerging ? 6 : isActive ? 5 : 1.5
    const targetColor = isMerging ? mergeColor : color

    const lerpSpeed = delta * 3

    const newScale = currentScale + (targetScale - currentScale) * lerpSpeed
    const newEmissive = currentEmissive + (targetEmissive - currentEmissive) * lerpSpeed
    const newLightIntensity = currentLightIntensity + (targetLightIntensity - currentLightIntensity) * lerpSpeed

    setCurrentScale(newScale)
    setCurrentEmissive(newEmissive)
    setCurrentLightIntensity(newLightIntensity)
    setCurrentColor(targetColor)

    meshRef.current.scale.setScalar(newScale)

    const pulse = isActive ? Math.sin(state.clock.elapsedTime * 4) * 0.05 : 0
    meshRef.current.scale.setScalar(newScale + pulse)

    meshRef.current.rotation.y += delta * (isActive ? 1.5 : 0.3)
    meshRef.current.rotation.x += delta * 0.1

    if (glowRef.current) {
      glowRef.current.scale.setScalar(newScale * 1.3 + pulse * 2)
    }

    if (lightRef.current) {
      lightRef.current.intensity = newLightIntensity
    }

    const floatY = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15
    meshRef.current.position.y = floatY
    if (glowRef.current) glowRef.current.position.y = floatY
    if (lightRef.current) lightRef.current.position.y = floatY
  })

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[0.6, 4]} />
        <meshStandardMaterial
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={currentEmissive}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color={currentColor}
          transparent
          opacity={0.08}
          side={1}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={position}
        color={currentColor}
        intensity={currentLightIntensity}
        distance={8}
        decay={2}
      />
    </group>
  )
}
