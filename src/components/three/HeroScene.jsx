import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useInView, useReducedMotion } from 'motion/react'
import * as THREE from 'three'
import { SceneErrorBoundary, guardContextLoss, isLowEnd } from './SceneShell.jsx'

/* Central morphing orb with a wireframe shell */
function CoreOrb() {
  const group = useRef()
  const wire = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (group.current) {
      group.current.rotation.y = t * 0.12
      group.current.rotation.z = Math.sin(t * 0.2) * 0.08
    }
    if (wire.current) {
      wire.current.rotation.y = -t * 0.18
      wire.current.rotation.x = Math.sin(t * 0.15) * 0.25
    }
  })

  return (
    <group position={[2.4, 0.2, 0]}>
      <group ref={group}>
        <mesh>
          <icosahedronGeometry args={[1.35, 24]} />
          <MeshDistortMaterial
            color="#4338ca"
            emissive="#22d3ee"
            emissiveIntensity={0.32}
            roughness={0.18}
            metalness={0.55}
            distort={0.42}
            speed={2.2}
          />
        </mesh>
      </group>
      <mesh ref={wire} scale={1.75}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  )
}

/* Two glowing rings orbiting the core */
function OrbitRings() {
  const a = useRef()
  const b = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (a.current) {
      a.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.3) * 0.15
      a.current.rotation.z = t * 0.25
    }
    if (b.current) {
      b.current.rotation.x = Math.PI / 1.7 - Math.sin(t * 0.24) * 0.15
      b.current.rotation.z = -t * 0.18
    }
  })

  return (
    <group position={[2.4, 0.2, 0]}>
      <mesh ref={a}>
        <torusGeometry args={[2.5, 0.015, 16, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.65} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[3.1, 0.012, 16, 128]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/* Small geometric satellites drifting around the scene */
function Satellites() {
  const shapes = useMemo(
    () => [
      { geo: 'octahedron', pos: [-3.6, 1.6, -1.5], color: '#22d3ee', scale: 0.32, speed: 1.4 },
      { geo: 'torusKnot', pos: [-4.4, -1.4, -2.5], color: '#c084fc', scale: 0.3, speed: 1.0 },
      { geo: 'box', pos: [5.2, 2.2, -2], color: '#818cf8', scale: 0.34, speed: 1.8 },
      { geo: 'octahedron', pos: [4.6, -2.1, -1], color: '#f472b6', scale: 0.26, speed: 1.2 },
      { geo: 'torus', pos: [-1.6, 2.6, -3], color: '#34d399', scale: 0.3, speed: 1.6 },
      { geo: 'box', pos: [0.6, -2.6, -2], color: '#22d3ee', scale: 0.22, speed: 2.0 },
    ],
    [],
  )

  return shapes.map((s, i) => (
    <Float key={i} speed={s.speed} rotationIntensity={1.6} floatIntensity={2.2}>
      <mesh position={s.pos} scale={s.scale}>
        {s.geo === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
        {s.geo === 'box' && <boxGeometry args={[1, 1, 1]} />}
        {s.geo === 'torus' && <torusGeometry args={[0.8, 0.3, 16, 48]} />}
        {s.geo === 'torusKnot' && <torusKnotGeometry args={[0.7, 0.24, 96, 16]} />}
        <meshStandardMaterial
          color={s.color}
          emissive={s.color}
          emissiveIntensity={0.55}
          roughness={0.25}
          metalness={0.8}
        />
      </mesh>
    </Float>
  ))
}

/* Slowly swirling particle field */
function ParticleField({ count = 1600 }) {
  const points = useRef()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [new THREE.Color('#22d3ee'), new THREE.Color('#818cf8'), new THREE.Color('#c084fc'), new THREE.Color('#e2e8f0')]
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 14
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
      pos[i * 3 + 2] = r * Math.cos(phi) - 4
      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return [pos, col]
  }, [count])

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.getElapsedTime() * 0.02
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* Camera drifts gently toward the cursor (frame-rate independent damping) */
function CameraRig() {
  useFrame(({ camera, pointer }, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.7, 2.7, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.45, 2.7, dt)
    camera.lookAt(1.2, 0, 0)
  })
  return null
}

export default function HeroScene() {
  const wrap = useRef(null)
  const visible = useInView(wrap, { margin: '80px' })
  const reducedMotion = useReducedMotion()
  const lowEnd = useMemo(isLowEnd, [])

  // Reduced motion: render a single static frame ('demand') instead of looping.
  const frameloop = reducedMotion ? 'demand' : visible ? 'always' : 'never'

  return (
    <div className="hero-canvas" ref={wrap} aria-hidden="true">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 9], fov: 45 }}
          dpr={[1, lowEnd ? 1.4 : 1.8]}
          frameloop={frameloop}
          onCreated={guardContextLoss}
          // MSAA is wasted when everything renders through the composer
          gl={{ antialias: lowEnd, alpha: true, powerPreference: 'high-performance' }}
        >
        <Suspense fallback={null}>
          <color attach="background" args={['#05060e']} />
          <fog attach="fog" args={['#05060e', 10, 26]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[6, 6, 6]} intensity={1.2} color="#a5b4fc" />
          <pointLight position={[-6, -3, 2]} intensity={22} color="#22d3ee" />
          <pointLight position={[6, 3, -4]} intensity={26} color="#c084fc" />

          <CoreOrb />
          <OrbitRings />
          <Satellites />
          <ParticleField count={lowEnd ? 800 : 1600} />
          {!reducedMotion && <CameraRig />}

          {!lowEnd && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={0.85} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur />
              <Vignette eskil={false} offset={0.18} darkness={0.85} />
            </EffectComposer>
          )}
        </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
