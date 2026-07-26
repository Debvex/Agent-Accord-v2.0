import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import AgentOrb from './AgentOrb'


/*
===========================================
STATIC SCENE RIG
===========================================

The scene does not rotate when the
active speaker changes.

Agent positions remain fixed in
world space.
*/

function SceneRig({ children }) {
  return (
    <group>
      {children}
    </group>
  )
}


export default function Scene({
  userRole = 'Institutional Advocate',
  activeSpeaker,
  hideLabels = false
}) {

  /*
  ===========================================
  AMBIENT FLOATING CYBER PARTICLE CLOUD
  ===========================================
  */

  const ParticleField = ({
    count = 350
  }) => {

    const pointsRef = useRef()

    const positions = useMemo(() => {

      const pos =
        new Float32Array(
          count * 3
        )

      for (
        let i = 0;
        i < count;
        i++
      ) {

        pos[i * 3] =
          (Math.random() - 0.5) * 22

        pos[i * 3 + 1] =
          (Math.random() - 0.5) * 14 + 2

        pos[i * 3 + 2] =
          (Math.random() - 0.5) * 22
      }

      return pos

    }, [count])


    /*
    Slow ambient particle movement.

    This does not affect the AgentOrbs.
    */

    useFrame((state, delta) => {

      if (pointsRef.current) {

        pointsRef.current.rotation.y +=
          delta * 0.01

        pointsRef.current.rotation.x +=
          delta * 0.005
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


  /*
  ===========================================
  1v1 DEBATE SETUP
  ===========================================
  */

  const customRoleName =
    userRole ||
    'CEO of Apex Labs'


  /*
  ===========================================
  FIXED AGENT POSITIONS
  ===========================================

  These positions never change.

  The scene is never rotated based
  on activeSpeaker.
  */

  const agents = [

    {
      role:
        customRoleName,

      roleKey:
        'proxy',

      badgeTag:
        'BOSS / DECISION MAKER',

      color:
        '#38bdf8',

      position: [
        -2.5,
        0.5,
        0
      ]
    },


    {
      role:
        'Suggestionist Advisor',

      roleKey:
        'challenger',

      badgeTag:
        'SUGGESTIONIST ADVISOR',

      color:
        '#f43f5e',

      position: [
        2.5,
        0.5,
        0
      ]
    }

  ]


  return (

    <div
      className="
        w-full
        h-full
        relative
        bg-slate-950
      "
    >

      <Canvas>

        {/* =================================
            FIXED CAMERA
        ================================= */}

        <PerspectiveCamera
          makeDefault
          position={[
            0,
            3.5,
            7.5
          ]}
          fov={50}
        />


        {/* =================================
            ORBIT CONTROLS

            Manual camera movement is allowed.

            Automatic rotation is disabled.
        ================================= */}

        <OrbitControls
          enableZoom={true}
          maxPolarAngle={
            Math.PI / 2.1
          }
          minDistance={4}
          maxDistance={14}
          autoRotate={false}
        />


        {/* =================================
            STATIC SCENE

            No stage rotation.
            No central objects.
        ================================= */}

        <SceneRig>


          {/* ================================
              BACKGROUND STARFIELD
          ================================= */}

          <Stars
            radius={45}
            depth={50}
            count={2500}
            factor={4}
            saturation={0.6}
            fade
            speed={0.4}
          />


          {/* ================================
              AMBIENT PARTICLES
          ================================= */}

          <ParticleField
            count={350}
          />


          {/* ================================
              LIGHTING
          ================================= */}

          <ambientLight
            intensity={0.45}
          />


          <directionalLight
            position={[
              6,
              12,
              6
            ]}
            intensity={1.8}
            color="#ffffff"
            castShadow
          />


          <directionalLight
            position={[
              -6,
              6,
              -6
            ]}
            intensity={0.8}
            color="#0284c7"
          />


          {/* ================================
              FIXED AGENT ORBS
          ================================= */}

          {agents.map(
            (agent) => (

              <AgentOrb
                key={
                  agent.roleKey
                }

                role={
                  agent.role
                }

                roleKey={
                  agent.roleKey
                }

                badgeTag={
                  agent.badgeTag
                }

                color={
                  agent.color
                }

                position={
                  agent.position
                }

                activeSpeaker={
                  activeSpeaker
                }

                hideLabel={
                  hideLabels
                }
              />

            )
          )}


        </SceneRig>

      </Canvas>

    </div>

  )
}