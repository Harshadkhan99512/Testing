'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import Particles from './Particles'
import { Suspense } from 'react'

export default function Hero3D() {
  return (
    <div className="h-[60vh] w-full rounded-lg border border-white/10 bg-gradient-to-b from-transparent to-white/5">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <Text
            fontSize={1}
            position={[0, 0, 0]}
            color="#60a5fa"
            anchorX="center"
            anchorY="middle"
          >
            Your Name
          </Text>
          <Particles count={1200} radius={4.5} />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}