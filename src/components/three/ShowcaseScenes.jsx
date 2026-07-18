import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useInView, useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import { SceneErrorBoundary, guardContextLoss, isLowEnd } from './SceneShell.jsx'

/* narrow screens get a pulled-back camera so labels stay inside the frame */
function useCompact() {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 700px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    const onChange = (e) => setCompact(e.matches)
    // Safari ≤13.4 has no add/removeEventListener on MediaQueryList
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])
  return compact
}

/* Shared GPU resources — these shapes repeat dozens of times across the four
   always-mounted scenes; one geometry/material each instead of one per mesh. */
const COIN_GEO = new THREE.CylinderGeometry(1, 1, 0.035, 24) // scaled per-coin
const COIN_MAT = new THREE.MeshStandardMaterial({
  color: '#fbbf24', emissive: '#b45309', emissiveIntensity: 0.25, metalness: 0.85, roughness: 0.3,
})
const HEAD_GEO = new THREE.SphereGeometry(0.085, 16, 16)
const BODY_GEO = new THREE.CapsuleGeometry(0.075, 0.14, 4, 12)
const PIN_GEO = new THREE.BoxGeometry(0.12, 0.045, 0.05)
const PIN_MAT = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.9, roughness: 0.3 })
const TOOTH_GEO = new THREE.BoxGeometry(0.07, 0.055, 0.06)
const STEEL_MAT = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.8, roughness: 0.35 })

/* ═══════════════════ shared helpers ═══════════════════ */

/* Springy scale-in whenever a scene becomes active, plus a gentle sway.
   Scenes stay mounted (visible toggled) so tab switches never re-compile
   geometry/shaders — the swap is instant even on weak GPUs. */
function Entrance({ children, active }) {
  const ref = useRef()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    // With reduced motion the frameloop is 'demand', so the spring below never
    // runs — jump straight to full scale instead of animating in.
    if (active && ref.current) ref.current.scale.setScalar(reducedMotion ? 1 : 0.05)
  }, [active, reducedMotion])
  useFrame(({ clock }, dt) => {
    if (!ref.current || !active || reducedMotion) return
    const s = THREE.MathUtils.damp(ref.current.scale.x, 1, 4.5, dt)
    ref.current.scale.setScalar(s)
    ref.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.16
  })
  return (
    <group ref={ref} visible={active} scale={reducedMotion ? 1 : 0.05}>
      {children}
    </group>
  )
}

/* Text chip anchored to a 3D point — uses page fonts, no texture loading */
function Label({ position, accent = '#22d3ee', strong, children }) {
  return (
    <Html
      position={position}
      center
      distanceFactor={9}
      zIndexRange={[40, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className={`scene-label ${strong ? 'strong' : ''}`} style={{ '--accent': accent }}>
        {children}
      </div>
    </Html>
  )
}

/* Little stylised human — head + capsule body */
function Person({ position = [0, 0, 0], scale = 1, body = '#94a3b8', head = '#e2e8f0' }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.19, 0]} geometry={HEAD_GEO}>
        <meshStandardMaterial color={head} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]} geometry={BODY_GEO}>
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* Stack of gold coins */
function CoinStack({ position = [0, 0, 0], count = 4, r = 0.13 }) {
  return (
    <group position={position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[(i % 2) * 0.015, i * 0.042, ((i + 1) % 2) * 0.012]}
          geometry={COIN_GEO}
          material={COIN_MAT}
          scale={[r, 1, r]}
        />
      ))}
    </group>
  )
}

/* Ascending 3D bar chart */
function BarChart({ position = [0, 0, 0] }) {
  const bars = [
    { h: 0.14, c: '#22d3ee' },
    { h: 0.22, c: '#818cf8' },
    { h: 0.3, c: '#c084fc' },
    { h: 0.4, c: '#f472b6' },
  ]
  return (
    <group position={position}>
      <mesh position={[0, -0.015, 0]}>
        <boxGeometry args={[0.48, 0.03, 0.24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {bars.map((b, i) => (
        <mesh key={i} position={[-0.165 + i * 0.11, b.h / 2, 0]}>
          <boxGeometry args={[0.08, b.h, 0.14]} />
          <meshStandardMaterial color={b.c} emissive={b.c} emissiveIntensity={0.35} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

/* Paper document with text lines */
function Document({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh>
        <boxGeometry args={[0.32, 0.42, 0.015]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      {[0.11, 0.04, -0.03, -0.1].map((y, i) => (
        <mesh key={i} position={[i === 0 ? -0.04 : 0, y, 0.012]}>
          <boxGeometry args={[i === 0 ? 0.16 : 0.22, 0.022, 0.004]} />
          <meshStandardMaterial color={i === 0 ? '#334155' : '#94a3b8'} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════ AI WORKFLOW — docs → AI chip → completed actions ═══════════════════ */

function AiChip({ active }) {
  const die = useRef()
  useFrame(({ clock }) => {
    if (!die.current || !active) return
    die.current.material.emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 3) * 0.35
  })
  const pins = useMemo(() => {
    const list = []
    for (let i = 0; i < 6; i++) {
      const o = -0.375 + i * 0.15
      list.push({ pos: [o, 0.56, 0], rot: [0, 0, Math.PI / 2] })
      list.push({ pos: [o, -0.56, 0], rot: [0, 0, Math.PI / 2] })
      list.push({ pos: [0.56, o, 0], rot: [0, 0, 0] })
      list.push({ pos: [-0.56, o, 0], rot: [0, 0, 0] })
    }
    return list
  }, [])
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.05, 1.05, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.35} />
      </mesh>
      {pins.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot} geometry={PIN_GEO} material={PIN_MAT} />
      ))}
      <mesh ref={die} position={[0, 0, 0.075]}>
        <boxGeometry args={[0.46, 0.46, 0.05]} />
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      {/* circuit traces */}
      {[
        { pos: [0.36, 0.28, 0.07], args: [0.26, 0.015, 0.01] },
        { pos: [-0.36, -0.28, 0.07], args: [0.26, 0.015, 0.01] },
        { pos: [0.28, -0.36, 0.07], args: [0.015, 0.26, 0.01] },
        { pos: [-0.28, 0.36, 0.07], args: [0.015, 0.26, 0.01] },
      ].map((t, i) => (
        <mesh key={i} position={t.pos}>
          <boxGeometry args={t.args} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/* green tick on a disc */
function DoneBadge({ position }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.04, 28]} />
        <meshStandardMaterial color="#064e3b" roughness={0.4} />
      </mesh>
      <mesh position={[-0.045, -0.02, 0.03]} rotation={[0, 0, -0.8]}>
        <boxGeometry args={[0.045, 0.12, 0.03]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.035, 0.005, 0.03]} rotation={[0, 0, 0.7]}>
        <boxGeometry args={[0.045, 0.2, 0.03]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

/* clipboard with task lines */
function TaskBoard({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.3, 0.38, 0.02]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.19, 0.005]}>
        <boxGeometry args={[0.12, 0.05, 0.035]} />
        <meshStandardMaterial color="#818cf8" metalness={0.5} roughness={0.4} />
      </mesh>
      {[0.08, 0, -0.08].map((y, i) => (
        <group key={i} position={[0, y, 0.015]}>
          <mesh position={[-0.09, 0, 0]}>
            <boxGeometry args={[0.035, 0.035, 0.008]} />
            <meshStandardMaterial color={i < 2 ? '#34d399' : '#94a3b8'} emissive={i < 2 ? '#34d399' : '#000'} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.03, 0, 0]}>
            <boxGeometry args={[0.15, 0.02, 0.006]} />
            <meshStandardMaterial color="#64748b" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

const AI_IN = [
  [-2.15, 0.95, 0],
  [-2.35, 0.05, 0.15],
  [-2.1, -0.85, 0],
]
const AI_OUT = [
  [2.1, 1.05, 0],
  [2.2, 0.05, 0],
  [2.1, -1.0, 0],
]

function AiScene({ active }) {
  const curves = useMemo(() => {
    const cs = []
    AI_IN.forEach((p) => {
      const a = new THREE.Vector3(...p)
      const b = new THREE.Vector3(-0.75, 0, 0.1)
      cs.push(new THREE.QuadraticBezierCurve3(a, new THREE.Vector3((a.x + b.x) / 2, a.y * 0.55, 0.2), b))
    })
    AI_OUT.forEach((p) => {
      const a = new THREE.Vector3(0.75, 0, 0.1)
      const b = new THREE.Vector3(...p)
      cs.push(new THREE.QuadraticBezierCurve3(a, new THREE.Vector3((a.x + b.x) / 2, b.y * 0.55, 0.2), b))
    })
    return cs
  }, [])

  const PULSES = 12
  const pulses = useMemo(
    () =>
      Array.from({ length: PULSES }, (_, i) => ({
        curve: i % curves.length,
        t: Math.random(),
        speed: 0.3 + Math.random() * 0.25,
      })),
    [curves],
  )
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    if (!inst.current || !active) return
    pulses.forEach((p, i) => {
      p.t += p.speed * dt
      if (p.t > 1) {
        p.t = 0
        p.curve = Math.floor(Math.random() * curves.length)
      }
      curves[p.curve].getPoint(p.t, v)
      dummy.position.copy(v)
      dummy.scale.setScalar(0.7 + Math.sin(p.t * Math.PI) * 0.5)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
  })

  return (
    <Entrance active={active}>
      {/* incoming documents */}
      {AI_IN.map((p, i) => (
        <Float key={i} enabled={active} speed={1.6} rotationIntensity={0.25} floatIntensity={0.5}>
          <Document position={p} rotation={[0, 0.35, i * 0.12 - 0.12]} scale={0.95} />
        </Float>
      ))}

      {/* the AI engine */}
      <Float enabled={active} speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
        <AiChip active={active} />
      </Float>

      {/* completed business actions */}
      <Float enabled={active} speed={1.8} rotationIntensity={0.2} floatIntensity={0.5}>
        <DoneBadge position={AI_OUT[0]} />
      </Float>
      <Float enabled={active} speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <TaskBoard position={AI_OUT[1]} />
      </Float>
      <Float enabled={active} speed={1.7} rotationIntensity={0.2} floatIntensity={0.5}>
        <BarChart position={[AI_OUT[2][0], AI_OUT[2][1] - 0.15, AI_OUT[2][2]]} />
      </Float>

      {/* data lanes */}
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[c, 32, 0.012, 6, false]} />
          <meshBasicMaterial color={i < 3 ? '#38bdf8' : '#34d399'} transparent opacity={0.28} />
        </mesh>
      ))}
      <instancedMesh ref={inst} args={[undefined, undefined, PULSES]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="#e0f2fe" toneMapped={false} />
      </instancedMesh>

      {active && (
        <>
          <Label position={[-1.65, -1.55, 0]} accent="#38bdf8">Emails · Orders · Docs</Label>
          <Label position={[0, -1.15, 0]} accent="#22d3ee" strong>AI Engine</Label>
          <Label position={[2.0, 1.62, 0]} accent="#34d399">Replies sent</Label>
          <Label position={[2.05, -0.52, 0]} accent="#818cf8">Tasks assigned</Label>
          <Label position={[2.0, -1.62, 0]} accent="#c084fc">Reports ready</Label>
        </>
      )}
    </Entrance>
  )
}

/* ═══════════════════ CRM — people falling through a labelled sales funnel ═══════════════════ */

const STAGES = [
  { y: 1.5, r: 1.7, color: '#22d3ee', label: 'New Leads', count: 120 },
  { y: 0.55, r: 1.32, color: '#818cf8', label: 'Qualified', count: 64 },
  { y: -0.4, r: 0.95, color: '#c084fc', label: 'Proposal', count: 28 },
  { y: -1.35, r: 0.6, color: '#f472b6', label: 'Closed Won', count: 12 },
]

const funnelRadius = (y) => THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(y, -1.35, 1.5, 0.52, 1.62), 0.35, 1.85)

function CrmScene({ active }) {
  const LEADS = 22
  const leads = useMemo(
    () =>
      Array.from({ length: LEADS }, () => ({
        angle: Math.random() * Math.PI * 2,
        spin: 0.45 + Math.random() * 0.5,
        fall: 0.3 + Math.random() * 0.3,
        jitter: 0.65 + Math.random() * 0.3,
        y: -1.8 + Math.random() * 4.2,
      })),
    [],
  )
  const heads = useRef()
  const bodies = useRef()
  const gold = useRef()
  const rings = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }, dt) => {
    if (!active) return
    const t = clock.getElapsedTime()
    if (heads.current && bodies.current) {
      leads.forEach((l, i) => {
        l.y -= l.fall * dt
        l.angle += l.spin * dt
        if (l.y < -1.75) {
          l.y = 2.15 + Math.random() * 0.6
          l.angle = Math.random() * Math.PI * 2
        }
        const r = funnelRadius(l.y) * l.jitter
        const x = Math.cos(l.angle) * r
        const z = Math.sin(l.angle) * r
        const s = THREE.MathUtils.mapLinear(l.y, -1.8, 2.6, 0.65, 1.05)

        dummy.position.set(x, l.y, z)
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        bodies.current.setMatrixAt(i, dummy.matrix)

        dummy.position.set(x, l.y + 0.17 * s, z)
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        heads.current.setMatrixAt(i, dummy.matrix)
      })
      heads.current.instanceMatrix.needsUpdate = true
      bodies.current.instanceMatrix.needsUpdate = true
    }
    if (gold.current) gold.current.rotation.y = t * 0.7
    if (rings.current) rings.current.rotation.y = t * 0.1
  })

  return (
    <Entrance active={active}>
      <group position={[-0.55, 0.25, 0]}>
        <group ref={rings}>
          {STAGES.map((s) => (
            <mesh key={s.y} position={[0, s.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[s.r, 0.022, 12, 72]} />
              <meshStandardMaterial color={s.color} emissive={s.color} emissiveIntensity={0.8} />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[1.68, 0.54, 2.9, 28, 5, true]} />
            <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.06} />
          </mesh>
        </group>

        {/* leads = little people */}
        <instancedMesh ref={bodies} args={[undefined, undefined, LEADS]}>
          <capsuleGeometry args={[0.07, 0.13, 4, 10]} />
          <meshStandardMaterial color="#a5b4fc" roughness={0.45} />
        </instancedMesh>
        <instancedMesh ref={heads} args={[undefined, undefined, LEADS]}>
          <sphereGeometry args={[0.078, 12, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </instancedMesh>

        {/* revenue at the bottom */}
        <mesh position={[0, -2.14, 0]}>
          <cylinderGeometry args={[0.85, 0.85, 0.06, 40]} />
          <meshStandardMaterial color="#292524" metalness={0.4} roughness={0.5} />
        </mesh>
        <group ref={gold} position={[0, -2.06, 0]}>
          {Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2
            return <CoinStack key={i} position={[Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5]} count={2 + (i % 3)} r={0.1} />
          })}
        </group>
        <Person position={[0, -1.86, 0]} scale={1.15} body="#fbbf24" head="#fde68a" />

        {active && (
          <>
            {STAGES.map((s) => (
              <Label key={s.label} position={[s.r + 0.95, s.y, 0]} accent={s.color}>
                {s.label} — {s.count}
              </Label>
            ))}
            <Label position={[1.55, -2.05, 0]} accent="#fbbf24" strong>Customers → Revenue</Label>
          </>
        )}
      </group>
    </Entrance>
  )
}

/* ═══════════════════ ERP — department dioramas around a shared core ═══════════════════ */

const ERP_MODULES = [
  { label: 'Finance', color: '#fbbf24' },
  { label: 'Inventory', color: '#22d3ee' },
  { label: 'HR & Payroll', color: '#818cf8' },
  { label: 'Sales', color: '#f472b6' },
  { label: 'Operations', color: '#94a3b8' },
  { label: 'Reports', color: '#c084fc' },
]

function Pedestal({ color }) {
  return (
    <mesh position={[0, -0.09, 0]}>
      <cylinderGeometry args={[0.42, 0.48, 0.06, 28]} />
      <meshStandardMaterial color="#1e293b" emissive={color} emissiveIntensity={0.12} roughness={0.5} />
    </mesh>
  )
}

function Gear({ position, active }) {
  const g = useRef()
  useFrame(({ clock }) => {
    if (!g.current || !active) return
    g.current.rotation.z = clock.getElapsedTime() * 0.6
  })
  return (
    <group ref={g} position={position} rotation={[0.35, 0, 0]}>
      <mesh material={STEEL_MAT}>
        <torusGeometry args={[0.16, 0.055, 12, 24]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.21, Math.sin(a) * 0.21, 0]}
            rotation={[0, 0, a]}
            geometry={TOOTH_GEO}
            material={STEEL_MAT}
          />
        )
      })}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.4} />
      </mesh>
    </group>
  )
}

function Target({ position }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      {[
        { r: 0.2, c: '#f8fafc', y: 0 },
        { r: 0.135, c: '#f472b6', y: 0.012 },
        { r: 0.07, c: '#f8fafc', y: 0.024 },
      ].map((ring, i) => (
        <mesh key={i} position={[0, ring.y, 0]}>
          <cylinderGeometry args={[ring.r, ring.r, 0.02, 28]} />
          <meshStandardMaterial color={ring.c} roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0, 0.045, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

function CargoBoxes({ position }) {
  return (
    <group position={position}>
      <mesh position={[-0.09, 0.09, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#b45309" roughness={0.75} />
      </mesh>
      <mesh position={[0.13, 0.08, 0.03]}>
        <boxGeometry args={[0.18, 0.18, 0.18]} />
        <meshStandardMaterial color="#d97706" roughness={0.75} />
      </mesh>
      <mesh position={[0.0, 0.28, -0.01]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.17, 0.17, 0.17]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.7} />
      </mesh>
    </group>
  )
}

function ModuleDiorama({ index, active }) {
  switch (index) {
    case 0:
      return (
        <group>
          <CoinStack position={[-0.08, 0, 0]} count={4} />
          <CoinStack position={[0.15, 0, 0.06]} count={2} r={0.1} />
        </group>
      )
    case 1:
      return <CargoBoxes position={[0, -0.05, 0]} />
    case 2:
      return (
        <group>
          <Person position={[-0.11, 0.1, 0]} scale={0.9} body="#818cf8" />
          <Person position={[0.12, 0.1, 0.05]} scale={0.8} body="#a5b4fc" />
        </group>
      )
    case 3:
      return <Target position={[0, 0.18, 0]} />
    case 4:
      return <Gear position={[0, 0.2, 0]} active={active} />
    default:
      return <BarChart position={[0, -0.02, 0]} />
  }
}

function ErpScene({ active }) {
  const core = useRef()
  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  /* two columns of three dioramas flanking the core — labels never overlap */
  const modulePos = useMemo(
    () => [
      new THREE.Vector3(-1.9, 1.62, 0.2),   // Finance
      new THREE.Vector3(1.9, 1.62, -0.2),   // Inventory
      new THREE.Vector3(-1.9, 0.12, -0.3),  // HR & Payroll
      new THREE.Vector3(1.9, 0.12, 0.3),    // Sales
      new THREE.Vector3(-1.9, -1.35, 0.1),  // Operations
      new THREE.Vector3(1.9, -1.35, -0.1),  // Reports
    ],
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
        line: i % ERP_MODULES.length,
        phase: Math.random(),
        speed: 0.28 + Math.random() * 0.3,
        out: i % 2 === 0,
      })),
    [],
  )

  useFrame(({ clock }) => {
    if (!active) return
    const t = clock.getElapsedTime()
    if (core.current) {
      core.current.rotation.y = -t * 0.35
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
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial color="#6366f1" emissive="#818cf8" emissiveIntensity={0.65} roughness={0.2} metalness={0.6} flatShading />
      </mesh>
      <mesh scale={1.3}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.16} />
      </mesh>

      <group>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial color="#818cf8" transparent opacity={0.35} />
        </lineSegments>

        {ERP_MODULES.map((m, i) => (
          <group key={m.label} position={modulePos[i]} scale={1.15}>
            <Float enabled={active} speed={1.6} rotationIntensity={0.12} floatIntensity={0.35}>
              <Pedestal color={m.color} />
              <ModuleDiorama index={i} active={active} />
            </Float>
          </group>
        ))}

        <instancedMesh ref={inst} args={[undefined, undefined, PULSES]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshBasicMaterial color="#ede9fe" toneMapped={false} />
        </instancedMesh>
      </group>

      {active && (
        <>
          <Label position={[0, -1.05, 0]} accent="#818cf8" strong>ERP Core — one source of truth</Label>
          {ERP_MODULES.map((m, i) => (
            <Label key={m.label} position={[modulePos[i].x, modulePos[i].y - 0.68, modulePos[i].z]} accent={m.color}>
              {m.label}
            </Label>
          ))}
        </>
      )}
    </Entrance>
  )
}

/* ═══════════════════ API — named business systems exchanging packets ═══════════════════ */

const API_SYSTEMS = [
  { label: 'Your Website', color: '#22d3ee', pos: new THREE.Vector3(-2.05, 1.1, 0) },
  { label: 'Payments', color: '#34d399', pos: new THREE.Vector3(-1.55, -1.25, 0.4) },
  { label: 'WhatsApp', color: '#a3e635', pos: new THREE.Vector3(0.1, 1.55, -0.3) },
  { label: 'Banking', color: '#fbbf24', pos: new THREE.Vector3(1.5, -1.15, 0.4) },
  { label: 'ERP / Tally', color: '#c084fc', pos: new THREE.Vector3(2.1, 1.05, -0.2) },
  { label: 'Logistics', color: '#f472b6', pos: new THREE.Vector3(0.3, 0.05, -0.9) },
]
const API_LINKS = [
  [0, 2], [2, 4], [0, 1], [1, 3], [3, 4], [2, 3], [1, 5], [5, 3], [0, 5],
]

function SystemNode({ color }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.52, 0.52, 0.14]} />
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.4, 0.4, 0.03]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.3} />
      </mesh>
      {/* tiny "status" lights */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <mesh key={i} position={[x, -0.14, 0.1]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 10]} />
          <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={i === 1 ? 1 : 0.3} />
        </mesh>
      ))}
      <mesh scale={1.22}>
        <boxGeometry args={[0.52, 0.52, 0.14]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.22} />
      </mesh>
    </group>
  )
}

function ApiScene({ active }) {
  const curves = useMemo(
    () =>
      API_LINKS.map(([a, b], i) => {
        const A = API_SYSTEMS[a].pos
        const B = API_SYSTEMS[b].pos
        const mid = A.clone().lerp(B, 0.5)
        const dir = B.clone().sub(A).normalize()
        const normal = new THREE.Vector3(-dir.y, dir.x, 0.6).normalize().multiplyScalar(0.5 + (i % 3) * 0.22)
        return new THREE.QuadraticBezierCurve3(A, mid.add(normal), B)
      }),
    [],
  )

  const PACKETS = 16
  const packets = useMemo(
    () =>
      Array.from({ length: PACKETS }, (_, i) => ({
        curve: i % curves.length,
        t: Math.random(),
        speed: 0.22 + Math.random() * 0.35,
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
          <tubeGeometry args={[c, 36, 0.013, 6, false]} />
          <meshBasicMaterial color={API_SYSTEMS[API_LINKS[i][0]].color} transparent opacity={0.26} />
        </mesh>
      ))}

      {API_SYSTEMS.map((s) => (
        <group key={s.label} position={s.pos}>
          <Float enabled={active} speed={1.5} rotationIntensity={0.18} floatIntensity={0.35}>
            <SystemNode color={s.color} />
          </Float>
        </group>
      ))}

      <instancedMesh ref={inst} args={[undefined, undefined, PACKETS]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshBasicMaterial color="#d1fae5" toneMapped={false} />
      </instancedMesh>

      {active && (
        <>
          {API_SYSTEMS.map((s) => (
            <Label key={s.label} position={[s.pos.x, s.pos.y - 0.55, s.pos.z]} accent={s.color}>
              {s.label}
            </Label>
          ))}
          <Label position={[0, -2.3, 0]} accent="#34d399" strong>Secure APIs keep every system in sync</Label>
        </>
      )}
    </Entrance>
  )
}

/* ═══════════════════ WEB — a browser window assembling itself ═══════════════════ */

function BrowserChrome() {
  return (
    <group position={[0, 0.62, -0.02]}>
      <mesh>
        <boxGeometry args={[2.2, 0.22, 0.02]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {[-0.94, -0.84, -0.74].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.02]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial
            color={i === 0 ? '#f472b6' : i === 1 ? '#fbbf24' : '#34d399'}
            emissive={i === 0 ? '#f472b6' : i === 1 ? '#fbbf24' : '#34d399'}
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

const WEB_BLOCKS = [
  { pos: [0, 0.2, 0], size: [1.9, 0.55], color: '#f472b6', delay: 0 }, // hero
  { pos: [-0.62, -0.42, 0], size: [0.85, 0.5], color: '#ec4899', delay: 0.33 },
  { pos: [0.32, -0.42, 0], size: [0.85, 0.5], color: '#fb7185', delay: 0.66 },
]
const WEB_CYCLE = 3.6 // seconds per full assemble → hold → reset loop

function WebScene({ active }) {
  const win = useRef()
  const blockRefs = useRef([])
  const cursor = useRef()
  const reducedMotion = useReducedMotion()

  useFrame(({ clock }, dt) => {
    if (!active) return
    const t = clock.getElapsedTime()
    if (win.current) win.current.position.y = Math.sin(t * 0.6) * 0.05

    if (reducedMotion) {
      // Static, fully-assembled frame — no looping build animation.
      blockRefs.current.forEach((m) => {
        if (m) m.scale.setScalar(1)
      })
      return
    }

    const phase = t % WEB_CYCLE
    WEB_BLOCKS.forEach((b, i) => {
      const m = blockRefs.current[i]
      if (!m) return
      const target = phase > b.delay ? 1 : 0
      const s = THREE.MathUtils.damp(m.scale.x, target, 6, dt)
      m.scale.set(s, s, 1)
    })

    // cursor "places" the next block, then loops back to the start
    if (cursor.current) {
      const activeIdx = Math.min(WEB_BLOCKS.length - 1, Math.floor(phase / 0.33))
      const target = WEB_BLOCKS[Math.min(activeIdx + 1, WEB_BLOCKS.length - 1)]
      const cx = THREE.MathUtils.damp(cursor.current.position.x, target.pos[0], 5, dt)
      const cy = THREE.MathUtils.damp(cursor.current.position.y, target.pos[1] + 0.3, 5, dt)
      cursor.current.position.set(cx, cy, 0.1)
    }
  })

  return (
    <Entrance active={active}>
      <group ref={win}>
        {/* window panel + glow */}
        <mesh>
          <boxGeometry args={[2.2, 1.5, 0.03]} />
          <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh scale={1.04} position={[0, 0, -0.02]}>
          <boxGeometry args={[2.2, 1.5, 0.02]} />
          <meshBasicMaterial color="#f472b6" transparent opacity={0.1} />
        </mesh>
        <BrowserChrome />

        {WEB_BLOCKS.map((b, i) => (
          <mesh
            key={i}
            ref={(el) => (blockRefs.current[i] = el)}
            position={[b.pos[0], b.pos[1], 0.02]}
            scale={reducedMotion ? 1 : 0}
          >
            <boxGeometry args={[b.size[0], b.size[1], 0.025]} />
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.3} roughness={0.4} />
          </mesh>
        ))}

        {!reducedMotion && (
          <mesh ref={cursor} position={[0, 0.5, 0.1]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#fff" emissive="#f472b6" emissiveIntensity={0.9} />
          </mesh>
        )}
      </group>

      {active && (
        <>
          <Label position={[0, 1.15, 0]} accent="#f472b6" strong>Your Website</Label>
          <Label position={[-0.62, -1.05, 0]} accent="#ec4899">Design</Label>
          <Label position={[0.32, -1.05, 0]} accent="#fb7185">Ship</Label>
        </>
      )}
    </Entrance>
  )
}

/* ═══════════════════ CLOUD — deploy pipeline into a container cloud ═══════════════════ */

const CLOUD_CONTAINERS = [
  { color: '#fbbf24', tilt: 0.25, r: 1.15, speed: 0.35, phase: 0 },
  { color: '#f59e0b', tilt: -0.35, r: 1.3, speed: 0.28, phase: 1.6 },
  { color: '#fde68a', tilt: 0.12, r: 1.0, speed: 0.42, phase: 3.4 },
  { color: '#d97706', tilt: -0.18, r: 1.22, speed: 0.32, phase: 5.0 },
]

function CloudCore() {
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial color="#78350f" emissive="#fbbf24" emissiveIntensity={0.45} roughness={0.35} metalness={0.3} flatShading />
      </mesh>
      {[
        [0.42, 0.1, 0.1],
        [-0.4, -0.05, -0.15],
        [0.05, 0.35, -0.2],
      ].map((p, i) => (
        <mesh key={i} position={p} scale={0.42}>
          <sphereGeometry args={[0.62, 14, 14]} />
          <meshStandardMaterial color="#92400e" emissive="#fbbf24" emissiveIntensity={0.3} roughness={0.4} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function CloudScene({ active }) {
  const core = useRef()
  const containerRefs = useRef([])
  const ring = useRef()
  const commit = useRef()
  const buildBox = useRef()
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.1, -1.6, 0),
        new THREE.Vector3(-1.1, -1.1, 0.2),
        new THREE.Vector3(-0.55, -0.55, 0.1),
        new THREE.Vector3(-0.1, 0.05, 0),
      ]),
    [],
  )
  const v = useMemo(() => new THREE.Vector3(), [])
  const commitT = useRef(0)

  useFrame(({ clock }, dt) => {
    if (!active) return
    const t = clock.getElapsedTime()
    if (core.current) {
      core.current.rotation.y = t * 0.25
      core.current.position.y = Math.sin(t * 0.5) * 0.06
    }
    containerRefs.current.forEach((m, i) => {
      if (!m) return
      const c = CLOUD_CONTAINERS[i]
      const a = t * c.speed + c.phase
      m.position.set(Math.cos(a) * c.r, Math.sin(a) * c.r * 0.35 + Math.sin(c.tilt) * 0.3, Math.sin(a) * c.r * 0.5)
      m.rotation.set(a * 0.6, a * 0.4, 0)
    })
    if (ring.current) {
      const pulse = 0.85 + Math.sin(t * 1.4) * 0.1
      ring.current.scale.set(pulse, 1, pulse)
      ring.current.material.opacity = 0.35 + Math.sin(t * 1.4) * 0.15
    }
    // commit dot travels from bottom-left, through the build box, into the core, loops
    commitT.current += dt * 0.35
    if (commitT.current > 1) commitT.current = 0
    if (commit.current) {
      curve.getPoint(Math.min(commitT.current, 1), v)
      commit.current.position.copy(v)
      commit.current.visible = commitT.current < 0.82
    }
    if (buildBox.current) {
      const near = commitT.current > 0.35 && commitT.current < 0.7
      const s = THREE.MathUtils.damp(buildBox.current.scale.x, near ? 1.15 : 1, 6, dt)
      buildBox.current.scale.setScalar(s)
    }
  })

  return (
    <Entrance active={active}>
      <group position={[0.5, 0.3, 0]}>
        <group ref={core}>
          <CloudCore />
        </group>

        {CLOUD_CONTAINERS.map((c, i) => (
          <mesh key={i} ref={(el) => (containerRefs.current[i] = el)}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.4} roughness={0.4} metalness={0.2} />
          </mesh>
        ))}

        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.9, 0]}>
          <torusGeometry args={[0.75, 0.02, 12, 48]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* CI/CD flow: commit → build → cloud */}
      <mesh ref={buildBox} position={[-0.6, -1.05, 0.1]}>
        <boxGeometry args={[0.34, 0.24, 0.05]} />
        <meshStandardMaterial color="#334155" emissive="#fbbf24" emissiveIntensity={0.25} roughness={0.4} />
      </mesh>
      <mesh>
        <tubeGeometry args={[curve, 40, 0.012, 6, false]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
      </mesh>
      <mesh ref={commit} position={[-2.1, -1.6, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color="#fde68a" toneMapped={false} />
      </mesh>

      {active && (
        <>
          <Label position={[0.5, 1.35, 0]} accent="#fbbf24" strong>Cloud Deploy</Label>
          <Label position={[-0.6, -1.35, 0]} accent="#f59e0b">CI/CD</Label>
        </>
      )}
    </Entrance>
  )
}

/* ═══════════════════ shared canvas ═══════════════════ */

const SCENES = { ai: AiScene, crm: CrmScene, erp: ErpScene, web: WebScene, api: ApiScene, cloud: CloudScene }

/* Moves the camera in place on breakpoint changes — remounting the Canvas
   would destroy the WebGL context and recompile every shader. */
function ResponsiveCamera({ compact }) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    camera.position.z = compact ? 9 : 7
    camera.updateProjectionMatrix()
  }, [compact, camera])
  return null
}

export default function ShowcaseCanvas({ scene }) {
  const compact = useCompact()
  const wrap = useRef(null)
  const visible = useInView(wrap, { margin: '120px' })
  const reducedMotion = useReducedMotion()
  const lowEnd = useMemo(isLowEnd, [])

  // Reduced motion: a single static frame per tab switch instead of a loop.
  const frameloop = reducedMotion ? 'demand' : visible ? 'always' : 'never'

  return (
    <div className="showcase-canvas-inner" ref={wrap}>
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, compact ? 9 : 7], fov: 45 }}
          dpr={[1, lowEnd ? 1.3 : 1.6]}
          frameloop={frameloop}
          onCreated={guardContextLoss}
          // MSAA is wasted when everything renders through the composer
          gl={{ antialias: lowEnd, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ResponsiveCamera compact={compact} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[5, 6, 5]} intensity={1.1} color="#e0e7ff" />
            <pointLight position={[-5, -2, 3]} intensity={14} color="#22d3ee" />
            <pointLight position={[5, 3, -3]} intensity={15} color="#c084fc" />

            {/* Desktop keeps all scenes warm so tab switches are instant;
                compact viewports mount only the active scene — phones pay a
                permanent memory/battery tax for warm scenes they may never
                switch to. */}
            {Object.entries(SCENES).map(([id, Scene]) =>
              compact && id !== scene ? null : <Scene key={id} active={id === scene} />,
            )}

            {!lowEnd && (
              <EffectComposer multisampling={0}>
                <Bloom intensity={0.55} luminanceThreshold={0.35} luminanceSmoothing={0.85} mipmapBlur />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
