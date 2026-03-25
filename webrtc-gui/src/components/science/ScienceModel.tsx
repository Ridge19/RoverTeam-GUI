"use client";

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ScienceModelProps {
  drillOffset?: number;
  microscopeOffset?: number;
  microscopeSwivel?: number;
}

const mesh = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0,
  metalness: 0.3,

});
const ScienceModel = ({ drillOffset = 0, microscopeOffset = 0, microscopeSwivel = 0, ...props }: ScienceModelProps) => {
  const { nodes, materials } = useGLTF('/models/SciencePayload.gltf') as any

  const drillStepperGroupRef = useRef<THREE.Group>(null);
  const microscopeStepperGroupRef = useRef<THREE.Group>(null);
  const microscopeSwivelGroupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    // 1. Drill Vertical Movement
    if (drillStepperGroupRef.current) {
      const targetY = 20.787 - drillOffset;
      drillStepperGroupRef.current.position.y = THREE.MathUtils.lerp(
        drillStepperGroupRef.current.position.y,
        targetY,
        0.1
      );
    }

    // 2. Microscope Vertical Movement
    if (microscopeStepperGroupRef.current) {
      const targetY = -1.772 - microscopeOffset; // Changed from drillOffset
      microscopeStepperGroupRef.current.position.y = THREE.MathUtils.lerp(
        microscopeStepperGroupRef.current.position.y,
        targetY,
        0.1
      );
    }

    // 3. Microscope Swivel (Rotation)
    if (microscopeSwivelGroupRef.current) {
      // Swivels usually rotate around Y axis
      // We lerp the rotation for smoothness
      microscopeSwivelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        microscopeSwivelGroupRef.current.rotation.y,
        microscopeSwivel, // Changed from drillOffset
        0.1
      );
    }
  });


  return (
    <group {...props} dispose={null}>
      {/* Main offset and scale from your Blender export */}
      <group position={[2.941, -3, 1.774]} scale={0.102}>

        {/* Main body meshes - using original materials */}
        <mesh geometry={nodes.Cube016.geometry} material={materials['Plastic ']} />
        <mesh geometry={nodes.Cube016_1.geometry} material={materials['Metal ']} />
        <mesh geometry={nodes.Cube016_2.geometry} material={materials['Alu Beam ']} />

        {/* Cylinder / Drill component */}
        <group ref={drillStepperGroupRef} position={[-14.148, 20.787, -19.927]} scale={2.6}>
          <mesh geometry={nodes.Cylinder005.geometry} material={materials['Metal ']} />
          <mesh geometry={nodes.Cylinder005_1.geometry} material={materials['Plastic ']} />
          <mesh geometry={nodes.Cylinder005_2.geometry} material={materials.Logo} />
        </group>

        {/* Stepper / Microscope component */}
        <group ref={microscopeStepperGroupRef} position={[-46.328, -1.772, 25.503]} rotation={[-Math.PI, 0, 0]} scale={8.482}>
          <mesh geometry={nodes.Cube020.geometry} material={materials['Plastic ']} />
          <mesh geometry={nodes.Cube020_1.geometry} material={materials['Metal ']} />

          {/* The Swivel part */}
          <group ref={microscopeSwivelGroupRef}>
            <mesh
              geometry={nodes.MicroscopeSwivel.geometry}
              material={materials['Plastic ']}
              position={[0.004, 0.695, 0.065]}
              rotation={[Math.PI, 0, 0]}
              scale={[0.358, 0.398, 0.358]}
            />
          </group>
        </group>

      </group>
    </group>
  )
}

useGLTF.preload('/models/SciencePayload.gltf')

export default ScienceModel