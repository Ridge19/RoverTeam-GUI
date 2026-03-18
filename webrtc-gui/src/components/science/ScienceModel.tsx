"use client";

import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function ScienceModel(props: any) {
  const { nodes, materials } = useGLTF('/models/SciencePayload.gltf') as any

  return (
    <group {...props} dispose={null}>
      {/* Main offset and scale from your Blender export */}
      <group position={[2.941, 0.521, 2.574]} scale={0.102}>

        {/* Main body meshes - using original materials */}
        <mesh geometry={nodes.Cube016.geometry} material={materials['Plastic ']} />
        <mesh geometry={nodes.Cube016_1.geometry} material={materials['Metal ']} />
        <mesh geometry={nodes.Cube016_2.geometry} material={materials['Alu Beam ']} />

        {/* Cylinder / Drill component */}
        <group position={[-14.148, 20.787, -19.927]} scale={2.6}>
          <mesh geometry={nodes.Cylinder005.geometry} material={materials['Metal ']} />
          <mesh geometry={nodes.Cylinder005_1.geometry} material={materials['Plastic ']} />
          <mesh geometry={nodes.Cylinder005_2.geometry} material={materials.Logo} />
        </group>

        {/* Stepper / Microscope component */}
        <group position={[-46.328, -1.772, 25.503]} rotation={[-Math.PI, 0, 0]} scale={8.482}>
          <mesh geometry={nodes.Cube020.geometry} material={materials['Plastic ']} />
          <mesh geometry={nodes.Cube020_1.geometry} material={materials['Metal ']} />

          {/* The Swivel part */}
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
  )
}

useGLTF.preload('/models/SciencePayload.gltf')