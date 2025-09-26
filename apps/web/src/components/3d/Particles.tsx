'use client'

import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

type ParticlesProps = {
  count?: number
  radius?: number
  speed?: number
}

export default function Particles({ count = 1000, radius = 5, speed = 0.002 }: ParticlesProps) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = radius * Math.sqrt(Math.random())
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(2 * Math.random() - 1)
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      pos.set([x, y, z], i * 3)
    }
    return pos
  }, [count, radius])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (ref.current) {
      ref.current.rotation.y = t * speed * 2
      ref.current.rotation.x = t * speed
    }
  })

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial transparent color="#86efac" size={0.015} sizeAttenuation depthWrite={false} />
    </Points>
  )
}