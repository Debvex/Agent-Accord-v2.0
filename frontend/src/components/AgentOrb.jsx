import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'


function WaveRing({
  color,
  active,
  delay = 0
}) {
  const ringRef = useRef()
  const glowRef = useRef()
  const outerGlowRef = useRef()

  const segments = 180
  const baseRadius = 1.08

  const geometry = useMemo(() => {
    const positions = new Float32Array(
      segments * 3
    )

    const geometry =
      new THREE.BufferGeometry()

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3
      )
    )

    return geometry
  }, [])


  useFrame((state, delta) => {
    if (
      !ringRef.current ||
      !glowRef.current ||
      !outerGlowRef.current
    ) {
      return
    }

    const time =
      state.clock.elapsedTime


    /*
    =========================================
    FACE CAMERA
    =========================================

    All three ring layers always face
    directly toward the camera.

    This keeps the rings perfectly
    circular from the viewer's perspective.
    */

    ringRef.current.quaternion.copy(
      state.camera.quaternion
    )

    glowRef.current.quaternion.copy(
      state.camera.quaternion
    )

    outerGlowRef.current.quaternion.copy(
      state.camera.quaternion
    )


    /*
    =========================================
    FADE OUT WHEN INACTIVE
    =========================================
    */

    if (!active) {

      ringRef.current.material.opacity =
        THREE.MathUtils.damp(
          ringRef.current.material.opacity,
          0,
          8,
          delta
        )

      glowRef.current.material.opacity =
        THREE.MathUtils.damp(
          glowRef.current.material.opacity,
          0,
          8,
          delta
        )

      outerGlowRef.current.material.opacity =
        THREE.MathUtils.damp(
          outerGlowRef.current.material.opacity,
          0,
          8,
          delta
        )

      return
    }


    /*
    =========================================
    WAVY RING GEOMETRY
    =========================================
    */

    const positions =
      ringRef.current
        .geometry
        .attributes
        .position


    for (
      let i = 0;
      i < segments;
      i++
    ) {

      const angle =
        (
          i /
          segments
        ) *
        Math.PI *
        2


      /*
      Primary wave
      */

      const primaryWave =
        Math.sin(
          angle * 7 -
          time * 5 +
          delay
        )


      /*
      Secondary wave
      */

      const secondaryWave =
        Math.sin(
          angle * 3 +
          time * 2 +
          delay
        )


      /*
      Combine both waves.
      */

      const radius =
        baseRadius +
        primaryWave * 0.105 +
        secondaryWave * 0.045


      /*
      Ring is generated in XY plane.
      Camera quaternion makes it face
      the viewer.
      */

      positions.array[
        i * 3
      ] =
        Math.cos(angle) *
        radius

      positions.array[
        i * 3 + 1
      ] =
        Math.sin(angle) *
        radius

      positions.array[
        i * 3 + 2
      ] = 0
    }


    positions.needsUpdate = true


    /*
    =========================================
    SUBTLE RING BREATHING
    =========================================
    */

    const scale =
      1 +
      Math.sin(
        time * 2 +
        delay
      ) *
      0.045


    /*
    Main sharp ring
    */

    ringRef.current.scale.set(
      scale,
      scale,
      1
    )


    /*
    Medium glow
    */

    glowRef.current.scale.set(
      scale * 1.015,
      scale * 1.015,
      1
    )


    /*
    Outer soft glow
    */

    outerGlowRef.current.scale.set(
      scale * 1.03,
      scale * 1.03,
      1
    )


    /*
    =========================================
    SHARP CORE RING
    =========================================
    */

    const ringOpacity =
      0.8 +
      Math.sin(
        time * 3 +
        delay
      ) *
      0.08


    ringRef.current.material.opacity =
      THREE.MathUtils.damp(
        ringRef.current.material.opacity,
        ringOpacity,
        6,
        delta
      )


    /*
    =========================================
    MEDIUM GLOW
    =========================================
    */

    const glowOpacity =
      0.28 +
      Math.sin(
        time * 2.5 +
        delay
      ) *
      0.06


    glowRef.current.material.opacity =
      THREE.MathUtils.damp(
        glowRef.current.material.opacity,
        glowOpacity,
        6,
        delta
      )


    /*
    =========================================
    OUTER SOFT GLOW
    =========================================
    */

    const outerGlowOpacity =
      0.10 +
      Math.sin(
        time * 2 +
        delay
      ) *
      0.025


    outerGlowRef.current.material.opacity =
      THREE.MathUtils.damp(
        outerGlowRef.current.material.opacity,
        outerGlowOpacity,
        6,
        delta
      )
  })


  return (
    <>

      {/* =====================================
          OUTER SOFT GLOW
      ===================================== */}

      <lineLoop
        ref={outerGlowRef}
        geometry={geometry}
      >

        <lineBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />

      </lineLoop>


      {/* =====================================
          MEDIUM GLOW
      ===================================== */}

      <lineLoop
        ref={glowRef}
        geometry={geometry}
      >

        <lineBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />

      </lineLoop>


      {/* =====================================
          SHARP CORE RING
      ===================================== */}

      <lineLoop
        ref={ringRef}
        geometry={geometry}
      >

        <lineBasicMaterial
          color={color}
          transparent
          opacity={0}
          blending={
            THREE.AdditiveBlending
          }
          depthWrite={false}
        />

      </lineLoop>

    </>
  )
}


export default function AgentOrb({
  position,
  role,
  roleKey,
  color,
  activeSpeaker,
  hideLabel = false,
  badgeTag
}) {

  const orbRef =
    useRef()


  /*
  =========================================
  AGENT TYPE
  =========================================
  */

  const isBoss =
    roleKey === 'proxy'

  const isSuggestionist =
    roleKey === 'challenger'


  /*
  =========================================
  ACTIVE SPEAKER DETECTION
  =========================================
  */

  const isActive =
    useMemo(() => {

      if (!activeSpeaker) {
        return false
      }


      if (
        activeSpeaker === role ||
        activeSpeaker === roleKey
      ) {
        return true
      }


      if (
        roleKey === 'proxy' &&
        (
          activeSpeaker === 'proxy' ||
          activeSpeaker ===
            'Institutional Advocate'
        )
      ) {
        return true
      }


      if (
        roleKey === 'challenger' &&
        (
          activeSpeaker ===
            'challenger' ||
          activeSpeaker ===
            'Egalitarian Conscience' ||
          activeSpeaker ===
            'Suggestionist Advisor'
        )
      ) {
        return true
      }


      return false

    }, [
      activeSpeaker,
      role,
      roleKey
    ])


  /*
  =========================================
  ORB MATERIAL
  =========================================

  The material starts with a very subtle
  emissive value.

  When active, the emissive intensity
  smoothly increases in the animation loop,
  creating a soft glow around the orb.
  */

  const orbMaterial =
    useMemo(() => {

      return new THREE
        .MeshStandardMaterial({

          color:
            new THREE.Color(
              color
            ),

          roughness:
            0.3,

          metalness:
            0.15,

          emissive:
            new THREE.Color(
              color
            ),

          emissiveIntensity:
            0.05

        })

    }, [color])


  /*
  =========================================
  ANIMATION LOOP
  =========================================

  The parent group is fixed.

  The orb:

  - never rotates
  - floats gently when idle
  - subtly grows and shrinks when active
  - softly glows when active

  The rings:

  - face the camera
  - remain perfectly circular
  - animate independently
  */

  useFrame(
    (
      state,
      delta
    ) => {

      const time =
        state.clock.elapsedTime


      /*
      =========================================
      ORB ANIMATION
      =========================================
      */

      if (
        orbRef.current
      ) {

        if (isActive) {

          /*
          =====================================
          ACTIVE ORB SCALE

          Slight breathing effect.
          */

          const activeScale =
            1 +
            Math.sin(
              time * 4
            ) *
            0.08


          const currentScale =
            THREE.MathUtils.damp(
              orbRef.current.scale.x,
              activeScale,
              8,
              delta
            )


          orbRef.current.scale.set(
            currentScale,
            currentScale,
            currentScale
          )


          /*
          Keep active orb centered.
          */

          orbRef.current.position.y =
            THREE.MathUtils.damp(
              orbRef.current.position.y,
              0,
              8,
              delta
            )


          /*
          =====================================
          ACTIVE ORB GLOW

          Smoothly increase the emissive
          intensity while speaking.

          The glow remains subtle so the
          rings still remain the primary
          visual focus.
          */

          const targetEmissiveIntensity =
            0.65 +
            Math.sin(
              time * 4
            ) *
            0.12


          orbMaterial.emissiveIntensity =
            THREE.MathUtils.damp(
              orbMaterial.emissiveIntensity,
              targetEmissiveIntensity,
              6,
              delta
            )

        } else {

          /*
          =====================================
          IDLE ORB

          Gentle floating motion.
          */

          const idleFloat =
            Math.sin(
              time * 1.2 +
              position[0]
            ) *
            0.08


          orbRef.current.position.y =
            THREE.MathUtils.damp(
              orbRef.current.position.y,
              idleFloat,
              4,
              delta
            )


          /*
          Return to normal size.
          */

          const currentScale =
            THREE.MathUtils.damp(
              orbRef.current.scale.x,
              1,
              5,
              delta
            )


          orbRef.current.scale.set(
            currentScale,
            currentScale,
            currentScale
          )


          /*
          =====================================
          IDLE ORB GLOW

          Smoothly fade the emissive glow
          back to an almost invisible level.
          */

          orbMaterial.emissiveIntensity =
            THREE.MathUtils.damp(
              orbMaterial.emissiveIntensity,
              0.05,
              5,
              delta
            )

        }

      }

    }
  )


  return (

    /*
    =========================================
    FIXED WORLD POSITION

    This parent group never:

    - moves
    - rotates
    - scales

    Therefore the agent stays anchored
    exactly where it was placed.
    */

    <group
      position={position}
    >


      {/* =====================================
          MAIN ORB

          Small, clean, minimalist orb.

          Idle:
          Subtle floating.

          Active:
          Slight breathing + soft glow.

          The orb itself never rotates.
      ===================================== */}

      <mesh
        ref={orbRef}
        material={orbMaterial}
      >

        <sphereGeometry
          args={[
            0.32,
            64,
            64
          ]}
        />

      </mesh>


      {/* =====================================
          ACTIVE WAVY GLOW RING 1
      ===================================== */}

      <WaveRing
        color={color}
        active={isActive}
        delay={0}
      />


      {/* =====================================
          ACTIVE WAVY GLOW RING 2

          Offset from ring 1 to create
          continuous visual movement.
      ===================================== */}

      <WaveRing
        color={color}
        active={isActive}
        delay={Math.PI}
      />


      {/* =====================================
          MINIMAL LABEL
      ===================================== */}

      {!hideLabel && (

        <Html
          position={[
            0,
            0.95,
            0
          ]}
          center
          distanceFactor={9}
          zIndexRange={[
            10,
            0
          ]}
        >

          <div
            className={`
              flex
              items-center
              gap-2
              whitespace-nowrap
              transition-colors
              duration-300
              ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400'
              }
            `}
          >


            {/* =================================
                STATUS INDICATOR
            ================================= */}

            <span
              className={`
                block
                w-1.5
                h-1.5
                rounded-full
                ${
                  isActive

                    ? isBoss

                      ? `
                        bg-cyan-400
                        shadow-[0_0_8px_rgba(34,211,238,0.8)]
                      `

                      : `
                        bg-rose-400
                        shadow-[0_0_8px_rgba(251,113,133,0.8)]
                      `

                    : `
                      bg-slate-600
                    `
                }
              `}
            />


            {/* =================================
                AGENT NAME
            ================================= */}

            <span
              className="
                text-xs
                font-medium
                tracking-wide
              "
            >
              {role}
            </span>


            {/* =================================
                SPEAKING INDICATOR
            ================================= */}

            {isActive && (

              <span
                className={`
                  text-[9px]
                  uppercase
                  tracking-[0.18em]
                  font-medium
                  ${
                    isBoss
                      ? 'text-cyan-400/70'
                      : 'text-rose-400/70'
                  }
                `}
              >
                Speaking
              </span>

            )}

          </div>

        </Html>

      )}

    </group>

  )
}