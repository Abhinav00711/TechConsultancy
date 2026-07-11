import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/* Springy scale-in whenever a scene becomes active, plus a gentle sway.
   Scenes stay mounted (visible toggled) so tab switches never re-compile
   geometry/shaders — the swap is instant even on weak GPUs. */
function Entrance({ children, active }) {
  const ref = useRef()
  useEffect(() => {
    if (active && ref.current) ref.current.scale.setScalar(0.05)
  }, [active])
  useFrame(({ clock }, dt) => {
    if (!ref.current || !active) return
    const s = THREE.MathUtils.damp(ref.current.scale.x, 1, 4.5, dt)
    ref.current.scale.setScalar(s)
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.22) * 0.32
  })
  return (
    <group ref={ref} visible={active} scale={0.05}>
      {children}
    </group>
  )
}

/* ───────────── AI WORKFLOW — neural network with signal pulses ───────────── */

const LAYERS = [4, 6, 6, 3]
const LAYER_COLORS = ['#22d3ee', '#818cf8', '#a78bfa', '#f472b6']

function buildNetwork() {
  const nodes = []
  LAYERS.forEach((count, li) => {
    for (let i = 0; i < count; i++) {
      nodes.push({
        layer: li,
        pos: new THREE.Vector3(
          (li - (LAYERS.length - 1) / 2) * 2.0,
          (i - (count - 1) / 2) * 0.85,
          (Math.random() - 0.5) * 0.6,
        ),
      })
    }
  })
  const edges = []
  let offset = 0
  for (let li = 0; li < LAYERS.length - 1; li++) {
    const aStart = offset
    const bStart = offset + LAYERS[li]
    for (let a = aStart; a < aStart + LAYERS[li]; a++) {
      edges.push([a, bStart + Math.floor(Math.random() * LAYERS[li + 1])])
      for (let b = bStart; b < bStart + LAYERS[li + 1]; b++) {
        if (Math.random() < 0.35) edges.push([a, b])
      }
    }
    offset += LAYERS[li]
  }
  return { nodes, edges }
}

function NeuralScene({ active }) {
  const { nodes, edges } = useMemo(buildNetwork, [])
  const linePositions = useMemo(() => {
    const arr = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      nodes[a].pos.toArray(arr, i * 6)
      nodes[b].pos.toArray(arr, i * 6 + 3)
    })
    return arr
  }, [nodes, edges])

  const PULSES = 22
  const pulses = useMemo(
    () =>
      Array.from({ length: PULSES }, () => ({
        edge: Math.floor(Math.random() * edges.length),
        t: Math.random(),
        speed: 0.35 + Math.random() * 0.55,
      })),
    [edges],
  )
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, dt) => {
    if (!inst.current || !active) return
    pulses.forEach((p, i) => {
      p.t += p.speed * dt
      if (p.t > 1) {
        p.t = 0
        p.edge = Math.floor(Math.random() * edges.length)
      }
      const [a, b] = edges[p.edge]
      dummy.position.lerpVectors(nodes[a].pos, nodes[b].pos, p.t)
      const s = Math.sin(p.t * Math.PI)
      dummy.scale.setScalar(0.5 + s * 0.7)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
  })

  return (
    <Entrance active={active}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#6366f1" transparent opacity={0.28} />
      </lineSegments>

      {nodes.map((n, i) => (
        <mesh key={i} position={n.pos}>
          <sphereGeometry args={[n.layer === 0 || n.layer === LAYERS.length - 1 ? 0.16 : 0.12, 24, 24]} />
          <meshStandardMaterial
            color={LAYER_COLORS[n.layer]}
            emissive={LAYER_COLORS[n.layer]}
            emissiveIntensity={0.9}
            roughness={0.3}
          />
        </mesh>
      ))}

      <instancedMesh ref={inst} args={[undefined, undefined, PULSES]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
      </instancedMesh>
    </Entrance>
  )
}

/* ───────────── CRM — sales funnel with leads converting to gold ───────────── */

const STAGES = [
  { y: 1.5, r: 1.7, color: '#22d3ee' },
  { y: 0.5, r: 1.33, color: '#818cf8' },
  { y: -0.5, r: 0.97, color: '#c084fc' },
  { y: -1.5, r: 0.6, color: '#f472b6' },
]

const funnelRadius = (y) => THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(y, -1.5, 1.5, 0.55, 1.65), 0.35, 1.8)

function CrmScene({ active }) {
  const LEADS = 30
  const leads = useMemo(
    () =>
      Array.from({ length: LEADS }, () => ({
        angle: Math.random() * Math.PI * 2,
        spin: 0.6 + Math.random() * 0.9,
        fall: 0.35 + Math.random() * 0.4,
        jitter: 0.7 + Math.random() * 0.3,
        y: -2 + Math.random() * 4.4,
      })),
    [],
  )
  const inst = useRef()
  const gold = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const rings = useRef()

  useFrame(({ clock }, dt) => {
    if (!active) return
    const t = clock.getElapsedTime()
    if (inst.current) {
      leads.forEach((l, i) => {
        l.y -= l.fall * dt
        l.angle += l.spin * dt
        if (l.y < -1.95) {
          l.y = 2.1 + Math.random() * 0.7
          l.angle = Math.random() * Math.PI * 2
        }
        const r = funnelRadius(l.y) * l.jitter
        dummy.position.set(Math.cos(l.angle) * r, l.y, Math.sin(l.angle) * r)
        dummy.scale.setScalar(THREE.MathUtils.mapLinear(l.y, -2, 2.6, 0.55, 1.1))
        dummy.updateMatrix()
        inst.current.setMatrixAt(i, dummy.matrix)
      })
      inst.current.instanceMatrix.needsUpdate = true
    }
    if (gold.current) gold.current.rotation.y = t * 0.9
    if (rings.current) rings.current.rotation.y = t * 0.12
  })

  return (
    <Entrance active={active}>
      <group position={[0, 0.2, 0]}>
        <group ref={rings}>
          {STAGES.map((s) => (
            <mesh key={s.y} position={[0, s.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[s.r, 0.02, 12, 72]} />
              <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.9} />
            </mesh>
          ))}
          {/* translucent funnel wall */}
          <mesh>
            <cylinderGeometry args={[1.72, 0.55, 3.1, 28, 5, true]} />
            <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.07} />
          </mesh>
        </group>

        <instancedMesh ref={inst} args={[undefined, undefined, LEADS]}>
          <sphereGeometry args={[0.075, 12, 12]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.8} roughness={0.3} />
        </instancedMesh>

        {/* converted customers — gold orbit at the base */}
        <mesh position={[0, -2.18, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.05, 40]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
        <group ref={gold} position={[0, -2.02, 0]}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 0.52, 0, Math.sin(a) * 0.52]}>
                <sphereGeometry args={[0.07, 12, 12]} />
                <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={1.1} />
              </mesh>
            )
          })}
        </group>
      </group>
    </Entrance>
  )
}

/* ───────────── ERP — module cubes orbiting a unified core ───────────── */

const MODULES = [
  { color: '#22d3ee' }, // finance
  { color: '#818cf8' }, // inventory
  { color: '#c084fc' }, // HR
  { color: '#f472b6' }, // sales
  { color: '#34d399' }, // operations
  { color: '#fbbf24' }, // reporting
]

function ErpScene({ active }) {
  const orbit = useRef()
  const core = useRef()
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const modulePos = useMemo(
    () =>
      MODULES.map((_, i) => {
        const a = (i / MODULES.length) * Math.PI * 2
        return new THREE.Vector3(Math.cos(a) * 2.3, i % 2 === 0 ? 0.45 : -0.45, Math.sin(a) * 2.3)
      }),
    [],
  )

  const linePositions = useMemo(() => {
    const arr = new Float32Array(modulePos.length * 6)
    modulePos.forEach((p, i) => {
      arr.set([0, 0, 0], i * 6)
      p.toArray(arr, i * 6 + 3)
    })
    return arr
  }, [modulePos])

  const PULSES = 12
  const pulses = useMemo(
    () =>
      Array.from({ length: PULSES }, (_, i) => ({
        line: i % MODULES.length,
        phase: Math.random(),
        speed: 0.3 + Math.random() * 0.35,
        out: i % 2 === 0,
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!active) return
    const t = clock.getElapsedTime()
    if (orbit.current) orbit.current.rotation.y = t * 0.16
    if (core.current) {
      core.current.rotation.y = -t * 0.4
      core.current.scale.setScalar(1 + Math.sin(t * 2) * 0.05)
    }
    if (inst.current) {
      pulses.forEach((p, i) => {
        const raw = (t * p.speed + p.phase) % 1
        const k = p.out ? raw : 1 - raw
        dummy.position.copy(modulePos[p.line]).multiplyScalar(k)
        dummy.scale.setScalar(0.5 + Math.sin(raw * Math.PI) * 0.6)
        dummy.updateMatrix()
        inst.current.setMatrixAt(i, dummy.matrix)
      })
      inst.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <Entrance active={active}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial color="#6366f1" emissive="#818cf8" emissiveIntensity={0.7} roughness={0.2} metalness={0.6} flatShading />
      </mesh>
      <mesh scale={1.25}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.18} />
      </mesh>

      <group ref={orbit}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#818cf8" transparent opacity={0.35} />
        </lineSegments>

        {MODULES.map((m, i) => (
          <Float key={i} speed={2} rotationIntensity={0.9} floatIntensity={0.5}>
            <group position={modulePos[i]}>
              <mesh>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color={m.color} emissive={m.color} emissiveIntensity={0.5} roughness={0.25} metalness={0.5} />
              </mesh>
              <mesh scale={1.35}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial color={m.color} wireframe transparent opacity={0.28} />
              </mesh>
            </group>
          </Float>
        ))}

        <instancedMesh ref={inst} args={[undefined, undefined, PULSES]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshBasicMaterial color="#ede9fe" toneMapped={false} />
        </instancedMesh>
      </group>
    </Entrance>
  )
}

/* ───────────── API — packets racing along curved data highways ───────────── */

const API_NODES = [
  new THREE.Vector3(-2.7, 0.9, 0),
  new THREE.Vector3(-1.3, -1.2, 0.6),
  new THREE.Vector3(0, 1.5, -0.4),
  new THREE.Vector3(1.5, -0.7, 0.5),
  new THREE.Vector3(2.8, 1.0, -0.2),
  new THREE.Vector3(0.3, -0.1, -1.3),
]
const API_LINKS = [
  [0, 2], [2, 4], [0, 1], [1, 3], [3, 4], [2, 3], [1, 5], [5, 3], [0, 5],
]
const LINK_COLORS = ['#34d399', '#22d3ee', '#818cf8']

function ApiScene({ active }) {
  const curves = useMemo(
    () =>
      API_LINKS.map(([a, b], i) => {
        const mid = API_NODES[a].clone().lerp(API_NODES[b], 0.5)
        const dir = API_NODES[b].clone().sub(API_NODES[a]).normalize()
        const normal = new THREE.Vector3(-dir.y, dir.x, 0.6).normalize().multiplyScalar(0.55 + (i % 3) * 0.25)
        return new THREE.QuadraticBezierCurve3(API_NODES[a], mid.add(normal), API_NODES[b])
      }),
    [],
  )

  const PACKETS = 16
  const packets = useMemo(
    () =>
      Array.from({ length: PACKETS }, (_, i) => ({
        curve: i % curves.length,
        t: Math.random(),
        speed: 0.25 + Math.random() * 0.4,
        dir: i % 2 === 0 ? 1 : -1,
      })),
    [curves],
  )
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    if (!inst.current || !active) return
    packets.forEach((p, i) => {
      p.t += p.speed * dt
      if (p.t > 1) {
        p.t = 0
        p.curve = Math.floor(Math.random() * curves.length)
      }
      const k = p.dir > 0 ? p.t : 1 - p.t
      curves[p.curve].getPoint(k, v)
      dummy.position.copy(v)
      dummy.rotation.set(p.t * 6, p.t * 4, 0)
      dummy.scale.setScalar(0.8 + Math.sin(p.t * Math.PI) * 0.4)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
  })

  return (
    <Entrance active={active}>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 36, 0.014, 6, false]} />
          <meshBasicMaterial color={LINK_COLORS[i % LINK_COLORS.length]} transparent opacity={0.3} />
        </mesh>
      ))}

      {API_NODES.map((p, i) => (
        <Float key={i} speed={1.6} rotationIntensity={1.4} floatIntensity={0.4}>
          <mesh position={p}>
            <octahedronGeometry args={[0.2, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#34d399' : '#22d3ee'}
              emissive={i % 2 === 0 ? '#34d399' : '#22d3ee'}
              emissiveIntensity={0.8}
              roughness={0.25}
              metalness={0.5}
            />
          </mesh>
        </Float>
      ))}

      <instancedMesh ref={inst} args={[undefined, undefined, PACKETS]}>
        <boxGeometry args={[0.09, 0.09, 0.09]} />
        <meshBasicMaterial color="#d1fae5" toneMapped={false} />
      </instancedMesh>
    </Entrance>
  )
}

/* ───────────── shared canvas ───────────── */

const SCENES = { ai: NeuralScene, crm: CrmScene, erp: ErpScene, api: ApiScene }

export default function ShowcaseCanvas({ scene }) {
  return (
    <div className="showcase-canvas-inner">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.45} />
          <directionalLight position={[5, 6, 5]} intensity={0.9} color="#c7d2fe" />
          <pointLight position={[-5, -2, 3]} intensity={16} color="#22d3ee" />
          <pointLight position={[5, 3, -3]} intensity={18} color="#c084fc" />

          {Object.entries(SCENES).map(([id, Scene]) => (
            <Scene key={id} active={id === scene} />
          ))}

          <EffectComposer multisampling={0}>
            <Bloom intensity={0.9} luminanceThreshold={0.25} luminanceSmoothing={0.85} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
