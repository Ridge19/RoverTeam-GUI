"use client";

import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function ScienceModel(props: any) {
  // 1. Fix the path to match where your file actually is
  const { nodes, materials } = useGLTF('/models/SciencePayload.gltf') as any

  // 2. Define one shared Black Material
  const blackMaterial = (
    <meshStandardMaterial
      color="#000000"
      roughness={0.2}
      metalness={0.8}
    />
  )

  return (
    <group {...props} dispose={null}>
      <group position={[9.532, 1.688, 8.342]} scale={0.329}>
        {/* We override the materials here by putting our blackMaterial inside the mesh */}
        <mesh geometry={nodes.Cube016.geometry}>{blackMaterial}</mesh>
        <mesh geometry={nodes.Cube016_1.geometry}>{blackMaterial}</mesh>

        <group position={[-14.148, 20.787, -19.927]} scale={2.6}>
          <mesh geometry={nodes.Cylinder005.geometry}>{blackMaterial}</mesh>
          <mesh geometry={nodes.Cylinder005_1.geometry}>{blackMaterial}</mesh>
        </group>

        <mesh geometry={nodes.MicroscopeStepper.geometry} position={[-46.328, -1.772, 25.503]} rotation={[-Math.PI, 0, 0]} scale={8.482}>
          {blackMaterial}
          <mesh geometry={nodes.MicroscopeSwivel.geometry} position={[0.004, 0.695, 0.065]} rotation={[Math.PI, 0, 0]} scale={[0.358, 0.398, 0.358]}>
            {blackMaterial}
          </mesh>
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/models/SciencePayload.gltf')