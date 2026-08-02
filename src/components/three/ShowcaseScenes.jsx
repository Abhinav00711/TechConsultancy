import { useRef, useMemo, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Html, Environment, Lightformer, ContactShadows, RoundedBox, MeshReflectorMaterial,
} from '@react-three/drei'
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

/* ═══════════════════ material library ═══════════════════
   Every surface is a real one. Metals get metalness 1 and earn their look
   from roughness + the studio environment map, never from emissive colour —
   emissive is reserved for things that genuinely emit (LEDs, screens, fibre),
   which is also the only thing the 0.9-threshold bloom is allowed to catch. */

const M = {
  /* brushed aluminium — bezels, chassis shells, machined hubs.
     Roughness is deliberately mid: a mirror finish on a dark stage just
     reflects the void and reads black, which is what killed the first pass. */
  aluminium: new THREE.MeshPhysicalMaterial({
    color: '#c2c7d0', metalness: 1, roughness: 0.29, envMapIntensity: 1.6,
  }),
  aluminiumDark: new THREE.MeshPhysicalMaterial({
    color: '#787f89', metalness: 1, roughness: 0.36, envMapIntensity: 1.4,
  }),
  /* stainless — the CRM funnel, basin. Satin, not chrome, for the same reason. */
  steel: new THREE.MeshPhysicalMaterial({
    color: '#d2d7e0', metalness: 1, roughness: 0.26, envMapIntensity: 1.9, side: THREE.DoubleSide,
  }),
  /* powder-coated equipment housing — reads as dark grey, never as a black slab */
  chassis: new THREE.MeshPhysicalMaterial({
    color: '#1e232d', metalness: 0.45, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.5,
    envMapIntensity: 1.25,
  }),
  chassisFace: new THREE.MeshPhysicalMaterial({
    color: '#272e3b', metalness: 0.5, roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.38,
    envMapIntensity: 1.35,
  }),
  /* deep recesses — vent slots, port cut-outs, screen wells */
  cavity: new THREE.MeshStandardMaterial({ color: '#05060a', metalness: 0.2, roughness: 0.95 }),
  /* cable jacket */
  rubber: new THREE.MeshStandardMaterial({ color: '#0c0e13', metalness: 0, roughness: 0.82 }),
  copper: new THREE.MeshPhysicalMaterial({
    color: '#b4703a', metalness: 1, roughness: 0.29, envMapIntensity: 1.2,
  }),
  /* uncoated paper — matte, no spec, no metal. Kept off pure white so the
     key light has somewhere to go before it clips. */
  paper: new THREE.MeshStandardMaterial({ color: '#9aa2b4', metalness: 0, roughness: 0.95 }),
  paperInk: new THREE.MeshStandardMaterial({ color: '#6b7383', metalness: 0, roughness: 0.9 }),
  pcb: new THREE.MeshStandardMaterial({ color: '#0f3a2e', metalness: 0.15, roughness: 0.62 }),
  screwHead: new THREE.MeshPhysicalMaterial({
    color: '#8b929c', metalness: 1, roughness: 0.25, envMapIntensity: 1.1,
  }),
  /* the only transmissive material on the site — one shared instance so the
     renderer does a single transmission pass no matter how many spheres use it */
  glass: new THREE.MeshPhysicalMaterial({
    color: '#e3ebff', metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.42,
    ior: 1.48, envMapIntensity: 1.4,
  }),
  /* screen cover glass — reflection without the cost of real transmission */
  coverGlass: new THREE.MeshPhysicalMaterial({
    color: '#0a0d16', metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03,
    transparent: true, opacity: 0.16, envMapIntensity: 1.5,
  }),
  screenOff: new THREE.MeshStandardMaterial({ color: '#080b13', metalness: 0.1, roughness: 0.5 }),
  /* Lit-panel surfaces. Tone-mapped on purpose: a screen is a lit surface in
     the room, not a light source, so these stay under the bloom threshold and
     never turn into the flat neon slabs the first pass produced. */
  screenPanel: new THREE.MeshStandardMaterial({
    color: '#1b2233', emissive: '#3d4a68', emissiveIntensity: 0.8, roughness: 0.5,
  }),
  screenText: new THREE.MeshStandardMaterial({
    color: '#111827', emissive: '#8f9cbb', emissiveIntensity: 0.85, roughness: 0.5,
  }),
  screenAccent: new THREE.MeshStandardMaterial({
    color: '#3b1230', emissive: '#f472b6', emissiveIntensity: 0.9, roughness: 0.45,
  }),
  screenAccentSoft: new THREE.MeshStandardMaterial({
    color: '#2c1526', emissive: '#9d4a72', emissiveIntensity: 0.7, roughness: 0.5,
  }),
}

/* LEDs / screen pixels / fibre light — cached per colour. These are the only
   emissive surfaces in the six scenes, and they are all physically small. */
const emissiveCache = new Map()
function emissive(color, intensity = 2.4) {
  const key = `${color}|${intensity}`
  let m = emissiveCache.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color: '#0a0a0c', emissive: color, emissiveIntensity: intensity, toneMapped: false,
      roughness: 0.4,
    })
    emissiveCache.set(key, m)
  }
  return m
}

/* Unlit light points travelling inside fibre — toneMapped off so bloom
   actually picks them up at the 0.9 threshold. */
const lightCache = new Map()
function lightDot(color) {
  let m = lightCache.get(color)
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, toneMapped: false })
    lightCache.set(color, m)
  }
  return m
}

/* Fibre sheath — faint, so the run is readable when no pulse is on it */
const sheathCache = new Map()
function sheath(color) {
  let m = sheathCache.get(color)
  if (!m) {
    m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.14, toneMapped: false })
    sheathCache.set(color, m)
  }
  return m
}

/* ═══════════════════ shared geometry ═══════════════════ */

const SCREW_GEO = new THREE.CylinderGeometry(0.026, 0.026, 0.014, 12)
const LED_GEO = new THREE.CylinderGeometry(0.019, 0.019, 0.016, 10)
const VENT_GEO = new THREE.BoxGeometry(0.026, 0.19, 0.02)
const FIN_GEO = new THREE.BoxGeometry(0.016, 0.3, 0.62)
const DOT_GEO = new THREE.SphereGeometry(0.028, 10, 10)

/* ═══════════════════ construction primitives ═══════════════════
   Real hardware reads real because of bevels, fasteners and recesses —
   the details that catch a highlight. These are the vocabulary the six
   scenes are assembled from. */

/* Row of machined vent slots cut into a face */
function Vents({ position = [0, 0, 0], rotation = [0, 0, 0], count = 9, gap = 0.045 }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[(i - (count - 1) / 2) * gap, 0, 0]} geometry={VENT_GEO} material={M.cavity} />
      ))}
    </group>
  )
}

/* Four countersunk screws inset from the corners of a w × h face */
function Screws({ w, h, z, inset = 0.07 }) {
  const pts = [
    [-w / 2 + inset, h / 2 - inset],
    [w / 2 - inset, h / 2 - inset],
    [-w / 2 + inset, -h / 2 + inset],
    [w / 2 - inset, -h / 2 + inset],
  ]
  return pts.map(([x, y], i) => (
    <mesh key={i} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]} geometry={SCREW_GEO} material={M.screwHead} />
  ))
}

/* Extruded-aluminium heatsink: parallel fins on a solid base */
function Heatsink({ position = [0, 0, 0], count = 11 }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.72, 0.05, 0.66]} radius={0.012} smoothness={3} material={M.aluminium} />
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          position={[(i - (count - 1) / 2) * 0.062, 0.17, 0]}
          geometry={FIN_GEO}
          material={M.aluminium}
        />
      ))}
    </group>
  )
}

/* Status LED — small emissive cylinder sitting in a dark recess */
function Led({ position, color, on = true, rotation = [Math.PI / 2, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={[1.5, 0.6, 1.5]} geometry={LED_GEO} material={M.cavity} />
      <mesh position={[0, 0.008, 0]} geometry={LED_GEO} material={on ? emissive(color, 3) : M.cavity} />
    </group>
  )
}

/* Routed cable with real slack — sags under its own weight between endpoints */
function Cable({ from, to, sag = 0.55, radius = 0.026, material = M.rubber, out = 0.35 }) {
  const geo = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().lerp(b, 0.5)
    const dir = b.clone().sub(a)
    // pull the belly of the run toward the viewer as well as down, so the
    // curve is legible instead of collapsing into the connecting line
    const bow = new THREE.Vector3(0, -sag, out * Math.min(1, dir.length() / 3))
    const curve = new THREE.CatmullRomCurve3([
      a,
      a.clone().lerp(b, 0.28).add(bow.clone().multiplyScalar(0.8)),
      mid.clone().add(bow),
      a.clone().lerp(b, 0.72).add(bow.clone().multiplyScalar(0.8)),
      b,
    ])
    return new THREE.TubeGeometry(curve, 40, radius, 8, false)
  }, [from, to, sag, radius, out])
  useEffect(() => () => geo.dispose(), [geo])
  return <mesh geometry={geo} material={material} />
}

/* Thin fibre run + the light travelling inside it. One instanced mesh drives
   every pulse in a scene, so the whole data-flow costs a single draw call. */
function Fibre({ curves, color, count = 10, radius = 0.009, speed = 0.3, bidirectional = false }) {
  const tubes = useMemo(
    () => curves.map((c) => new THREE.TubeGeometry(c, 44, radius, 6, false)),
    [curves, radius],
  )
  useEffect(() => () => tubes.forEach((t) => t.dispose()), [tubes])

  const pulses = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        curve: i % curves.length,
        t: Math.random(),
        speed: speed * (0.75 + Math.random() * 0.6),
        dir: bidirectional && i % 2 === 1 ? -1 : 1,
      })),
    [count, curves.length, speed, bidirectional],
  )

  const inst = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const v = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, dt) => {
    if (!inst.current) return
    pulses.forEach((p, i) => {
      p.t += p.speed * dt
      if (p.t > 1) {
        p.t = 0
        p.curve = Math.floor(Math.random() * curves.length)
      }
      curves[p.curve].getPoint(p.dir > 0 ? p.t : 1 - p.t, v)
      dummy.position.copy(v)
      // fade in and out at the ends instead of popping at the connector
      dummy.scale.setScalar(Math.sin(p.t * Math.PI) * 0.95 + 0.05)
      dummy.updateMatrix()
      inst.current.setMatrixAt(i, dummy.matrix)
    })
    inst.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} material={sheath(color)} />
      ))}
      <instancedMesh ref={inst} args={[DOT_GEO, lightDot(color), count]} />
    </group>
  )
}

/* Text chip anchored to a 3D point — uses page fonts, no texture loading.
   distanceFactor is tuned against the portrait canvas: chips any larger and
   the outer ones run past the horizontal frame edge. */
function Label({ position, accent = '#22d3ee', strong, children }) {
  return (
    <Html
      position={position}
      center
      distanceFactor={5}
      zIndexRange={[40, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div className={`scene-label ${strong ? 'strong' : ''}`} style={{ '--accent': accent }}>
        {children}
      </div>
    </Html>
  )
}

/* Weighted entrance: the assembly drops the last few centimetres into place,
   damps out, and then STOPS. No perpetual sway — a scene that never settles
   is the thing that reads as a toy. */
function Settle({ children, drop = 0.3, yaw = -0.2, fit = 1 }) {
  const ref = useRef()
  const reducedMotion = useReducedMotion()
  const done = useRef(false)

  useEffect(() => {
    const g = ref.current
    if (!g) return
    if (reducedMotion) {
      g.position.set(0, 0, 0)
      g.rotation.set(0, 0, 0)
      g.scale.setScalar(fit)
      done.current = true
      return
    }
    g.position.set(0, drop, 0)
    g.rotation.set(0, yaw, 0)
    g.scale.setScalar(fit * 0.972)
    done.current = false
  }, [drop, yaw, fit, reducedMotion])

  useFrame((_, dt) => {
    const g = ref.current
    if (!g || done.current) return
    g.position.y = THREE.MathUtils.damp(g.position.y, 0, 3.4, dt)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, 0, 3.1, dt)
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, fit, 3.6, dt))
    if (Math.abs(g.position.y) < 0.0015 && Math.abs(g.rotation.y) < 0.0015) {
      g.position.y = 0
      g.rotation.y = 0
      g.scale.setScalar(fit)
      done.current = true
    }
  })

  return <group ref={ref}>{children}</group>
}

/* Every scene is modelled at whatever size suited its subject, then fitted
   into one shared frame here. The canvas is portrait (~640 × 770 on desktop),
   so the binding constraint is horizontal: keep everything inside |x| ≲ 1.9,
   labels included, or the outer chips run off the edge. */
const FIT = { ai: 0.86, crm: 0.88, erp: 0.82, web: 1.12, api: 0.82, cloud: 0.88 }

/* ═══════════════════ AI — an inference appliance on a bench ═══════════════════
   Paper goes in one side, the appliance works, finished actions come out the
   other. The machine is a machine: powder-coated chassis, machined heatsink,
   real fasteners, a status strip that is the only thing giving off light. */

function PaperStack({ position, rotation = [0, 0, 0], count = 5 }) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[(i % 2) * 0.012 - 0.006, i * 0.014, (i % 3) * 0.008 - 0.008]} rotation={[0, 0, (i - count / 2) * 0.018]}>
          <RoundedBox args={[0.46, 0.012, 0.62]} radius={0.004} smoothness={2} material={M.paper} />
          {i === count - 1 &&
            [0.2, 0.11, 0.02, -0.07, -0.16].map((z, k) => (
              <mesh key={k} position={[k === 0 ? -0.07 : 0.01, 0.008, z]}>
                <boxGeometry args={[k === 0 ? 0.2 : 0.32, 0.002, 0.018]} />
                <primitive object={M.paperInk} attach="material" />
              </mesh>
            ))}
        </group>
      ))}
    </group>
  )
}

/* Small output tray holding a finished, stamped result */
function ResultTray({ position, color }) {
  return (
    <group position={position}>
      <RoundedBox args={[0.62, 0.055, 0.5]} radius={0.014} smoothness={3} material={M.aluminiumDark} />
      <RoundedBox args={[0.5, 0.02, 0.4]} radius={0.006} smoothness={2} position={[0, 0.045, 0]} material={M.paper} />
      <mesh position={[0, 0.058, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.052, 0.075, 24]} />
        <primitive object={emissive(color, 2)} attach="material" />
      </mesh>
      <Led position={[0.24, 0.032, 0.2]} color={color} />
    </group>
  )
}

const AI_SEGMENTS = 9

function AiScene() {
  const segs = useRef([])
  const fan = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Segmented load bar, not a glowing strip: segments light and unlight the
    // way a real front-panel meter does. Plus the fan. Both are the machine
    // *working* — the only things still moving once the scene has settled.
    const lit = 3 + Math.round((Math.sin(t * 0.85) * 0.5 + 0.5) * (AI_SEGMENTS - 3))
    segs.current.forEach((m, i) => {
      if (m) m.material = i < lit ? emissive('#22d3ee', 2.8) : M.cavity
    })
    if (fan.current) fan.current.rotation.z = t * 5.5
  })

  const curves = useMemo(() => {
    // ports sit on the appliance's flanks, at its actual mid-height
    const left = new THREE.Vector3(-0.88, -0.3, 0.1)
    const right = new THREE.Vector3(0.88, -0.3, 0.1)
    const inPts = [new THREE.Vector3(-1.78, -0.5, 0.3), new THREE.Vector3(-1.84, -0.56, -0.5)]
    const outPts = [
      new THREE.Vector3(1.7, -0.58, 0.42),
      new THREE.Vector3(1.74, -0.58, -0.05),
      new THREE.Vector3(1.7, -0.58, -0.52),
    ]
    return [
      ...inPts.map((p) => new THREE.QuadraticBezierCurve3(p, p.clone().lerp(left, 0.5).setY(-0.16), left)),
      ...outPts.map((p) => new THREE.QuadraticBezierCurve3(right, right.clone().lerp(p, 0.5).setY(-0.16), p)),
    ]
  }, [])

  return (
    <Settle fit={FIT.ai}>
      {/* incoming work */}
      <PaperStack position={[-2.05, -0.73, 0.3]} rotation={[0, 0.22, 0]} />
      <PaperStack position={[-2.15, -0.73, -0.5]} rotation={[0, -0.14, 0]} count={3} />

      {/* the appliance — sits on the bench, not floating above it */}
      <group position={[0, -0.41, 0]}>
        <RoundedBox args={[1.72, 0.66, 1.1]} radius={0.05} smoothness={4} material={M.chassis} />
        {/* front face, recessed a hair so its edge catches the key light */}
        <RoundedBox args={[1.6, 0.54, 0.03]} radius={0.02} smoothness={3} position={[0, 0, 0.555]} material={M.chassisFace} />
        <Vents position={[-0.42, 0.02, 0.575]} count={10} />
        <Screws w={1.6} h={0.54} z={0.578} inset={0.06} />

        {/* load meter — recessed well, then discrete segments inside it */}
        <mesh position={[0.42, 0.14, 0.574]}>
          <boxGeometry args={[0.6, 0.055, 0.008]} />
          <primitive object={M.cavity} attach="material" />
        </mesh>
        {Array.from({ length: AI_SEGMENTS }, (_, i) => (
          <mesh
            key={i}
            ref={(el) => (segs.current[i] = el)}
            position={[0.42 + (i - (AI_SEGMENTS - 1) / 2) * 0.062, 0.14, 0.58]}
            material={M.cavity}
          >
            <boxGeometry args={[0.042, 0.03, 0.008]} />
          </mesh>
        ))}
        <Led position={[0.2, -0.12, 0.578]} color="#34d399" />
        <Led position={[0.3, -0.12, 0.578]} color="#22d3ee" />
        <Led position={[0.4, -0.12, 0.578]} color="#475569" on={false} />

        {/* exhaust fan in the side panel */}
        <group position={[-0.87, 0.02, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh geometry={LED_GEO} scale={[13, 0.5, 13]} rotation={[Math.PI / 2, 0, 0]} material={M.cavity} />
          <group ref={fan} position={[0, 0, 0.01]}>
            {Array.from({ length: 7 }, (_, i) => (
              <mesh key={i} rotation={[0, 0, (i / 7) * Math.PI * 2]} position={[0, 0, 0]}>
                <boxGeometry args={[0.2, 0.05, 0.012]} />
                <primitive object={M.aluminiumDark} attach="material" />
              </mesh>
            ))}
          </group>
        </group>

        {/* cooling stack + heat pipes on the lid */}
        <Heatsink position={[0, 0.33, -0.05]} />
        {[-0.2, 0, 0.2].map((x) => (
          <mesh key={x} position={[x, 0.34, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.028, 0.028, 0.34, 12]} />
            <primitive object={M.copper} attach="material" />
          </mesh>
        ))}
      </group>

      {/* finished actions */}
      <ResultTray position={[1.94, -0.71, 0.42]} color="#34d399" />
      <ResultTray position={[1.98, -0.71, -0.05]} color="#818cf8" />
      <ResultTray position={[1.94, -0.71, -0.52]} color="#c084fc" />

      <Fibre curves={curves} color="#7dd3fc" count={11} speed={0.34} />

      {/* labels sit under their own objects and the title takes the empty
          headroom — anything hung off the sides runs past the frame edge */}
      <Label position={[-1.82, -1.22, 0]} accent="#38bdf8">Emails · Orders</Label>
      <Label position={[1.7, -1.22, 0]} accent="#34d399">Replies · Tasks</Label>
      <Label position={[0, 0.62, 0]} accent="#22d3ee" strong>AI Engine</Label>
    </Settle>
  )
}

/* ═══════════════════ CRM — a machined funnel on a bench ═══════════════════
   Leads are glass marbles: they enter at the wide rim, work down the polished
   stainless cone past the engraved stage bands, and land in the basin as
   revenue. Real lathe-turned profile, real refraction. */

const FUNNEL_PROFILE = (() => {
  const pts = []
  pts.push(new THREE.Vector2(1.5, 1.32))
  pts.push(new THREE.Vector2(1.58, 1.24)) // rolled rim
  pts.push(new THREE.Vector2(1.54, 1.18))
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    const y = THREE.MathUtils.lerp(1.18, -0.72, t)
    const r = THREE.MathUtils.lerp(1.54, 0.3, Math.pow(t, 1.35))
    pts.push(new THREE.Vector2(r, y))
  }
  pts.push(new THREE.Vector2(0.3, -1.14)) // throat
  pts.push(new THREE.Vector2(0.26, -1.2))
  return pts
})()
const FUNNEL_GEO = new THREE.LatheGeometry(FUNNEL_PROFILE, 96)

/* engraved indicator bands, keyed to the pipeline stages */
const CRM_BANDS = [
  { y: 1.02, r: 1.42, color: '#22d3ee', label: 'New Leads', count: 120 },
  { y: 0.42, r: 1.12, color: '#818cf8', label: 'Qualified', count: 64 },
  { y: -0.18, r: 0.76, color: '#c084fc', label: 'Proposal', count: 28 },
  { y: -0.72, r: 0.36, color: '#f472b6', label: 'Closed Won', count: 12 },
]

const crmRadius = (y) =>
  THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(y, -0.72, 1.18, 0.3, 1.5), 0.24, 1.62)

function CrmScene() {
  const MARBLES = 12
  /* Spawned well above the rim: the cone is opaque steel, so a lead is only
     legible on its way in and once it lands. Depth-testing against the funnel
     wall handles the disappearance for free — no visibility bookkeeping. */
  const marbles = useMemo(
    () =>
      Array.from({ length: MARBLES }, (_, i) => ({
        angle: Math.random() * Math.PI * 2,
        spin: 0.5 + Math.random() * 0.45,
        fall: 0.3 + Math.random() * 0.18,
        y: 1.85 - (i / MARBLES) * 3.05,
      })),
    [],
  )
  const refs = useRef([])

  useFrame((_, dt) => {
    marbles.forEach((m, i) => {
      const mesh = refs.current[i]
      if (!mesh) return
      // gravity-ish: the cone narrows, so they accelerate as they descend
      m.y -= m.fall * dt * (1 + (1.3 - m.y) * 0.28)
      m.angle += m.spin * dt
      if (m.y < -1.24) {
        m.y = 1.7 + Math.random() * 0.4
        m.angle = Math.random() * Math.PI * 2
      }
      // capped so leads drop *into* the mouth rather than orbiting the rim
      const r = Math.max(0, Math.min(crmRadius(m.y), 1.28) - 0.11)
      mesh.position.set(Math.cos(m.angle) * r, m.y, Math.sin(m.angle) * r)
      mesh.visible = m.y > -1.18
    })
  })

  return (
    <Settle fit={FIT.crm}>
      <group position={[-0.5, 0.28, 0]}>
        {/* the funnel itself */}
        <mesh geometry={FUNNEL_GEO} material={M.steel} />

        {/* engraved stage bands — anodised rings set into the cone wall */}
        {CRM_BANDS.map((b) => (
          <group key={b.label}>
            <mesh position={[0, b.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[b.r + 0.012, 0.016, 10, 84]} />
              <primitive object={M.aluminiumDark} attach="material" />
            </mesh>
            <mesh position={[0, b.y - 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[b.r + 0.012, 0.005, 8, 84]} />
              <primitive object={emissive(b.color, 1.6)} attach="material" />
            </mesh>
          </group>
        ))}

        {/* glass leads working down the cone */}
        {marbles.map((_, i) => (
          <mesh key={i} ref={(el) => (refs.current[i] = el)} material={M.glass}>
            <sphereGeometry args={[0.072, 20, 20]} />
          </mesh>
        ))}

        {/* collection basin */}
        <group position={[0, -1.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.78, 0.82, 0.26, 56]} />
            <primitive object={M.steel} attach="material" />
          </mesh>
          <mesh position={[0, 0.135, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.02, 48]} />
            <primitive object={M.aluminiumDark} attach="material" />
          </mesh>
          {/* what already landed */}
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2
            const rr = i === 6 ? 0 : 0.34
            return (
              <mesh key={i} position={[Math.cos(a) * rr, 0.21, Math.sin(a) * rr]} material={M.glass}>
                <sphereGeometry args={[0.072, 20, 20]} />
              </mesh>
            )
          })}
          {/* machined feet */}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 + 0.5
            return (
              <mesh key={i} position={[Math.cos(a) * 0.6, -0.17, Math.sin(a) * 0.6]}>
                <cylinderGeometry args={[0.09, 0.11, 0.09, 20]} />
                <primitive object={M.aluminiumDark} attach="material" />
              </mesh>
            )
          })}
        </group>

        {CRM_BANDS.map((b) => (
          <Label key={b.label} position={[b.r + 0.72, b.y, 0]} accent={b.color}>
            {b.label} · {b.count}
          </Label>
        ))}
        <Label position={[0.5, -2.06, 0]} accent="#fbbf24" strong>Customers → Revenue</Label>
      </group>
    </Settle>
  )
}

/* ═══════════════════ ERP — a turned hub with six instrument modules ═══════════════════
   One machined core, six identical panel units on a harness. The point of the
   scene is that the modules are the *same* hardware talking to one source of
   truth, so they are built from one component with a different face plate. */

const ERP_MODULES = [
  { label: 'Finance', color: '#fbbf24' },
  { label: 'Inventory', color: '#22d3ee' },
  { label: 'HR & Payroll', color: '#818cf8' },
  { label: 'Sales', color: '#f472b6' },
  { label: 'Operations', color: '#94a3b8' },
  { label: 'Reports', color: '#c084fc' },
]

/* Lathe-turned aluminium core. Deliberately a plain chamfered cylinder: the
   first profile had a waist that caught the key light as two white blobs and
   read as a blob rather than as a machined part. */
const HUB_GEO = (() => {
  const p = [
    [0, 0.6],
    [0.3, 0.6],
    [0.4, 0.5], // top chamfer
    [0.4, 0.22],
    [0.5, 0.15], // upper flange
    [0.5, -0.15],
    [0.4, -0.22], // lower flange
    [0.4, -0.5],
    [0.3, -0.6],
    [0, -0.6],
  ].map(([x, y]) => new THREE.Vector2(x, y))
  return new THREE.LatheGeometry(p, 72)
})()

/* Bead-blasted finish for the hub — a near-mirror here just mirrors the
   softbox straight back down the lens and clips to white. */
const HUB_MAT = new THREE.MeshPhysicalMaterial({
  color: '#aeb4bf', metalness: 1, roughness: 0.56, envMapIntensity: 0.85,
})

/* One panel unit — identical hardware, colour-coded face plate */
function InstrumentModule({ color, readout }) {
  return (
    <group>
      <RoundedBox args={[0.86, 0.62, 0.28]} radius={0.028} smoothness={4} material={M.chassis} />
      <RoundedBox args={[0.78, 0.54, 0.02]} radius={0.014} smoothness={3} position={[0, 0, 0.148]} material={M.chassisFace} />
      <Screws w={0.78} h={0.54} z={0.162} inset={0.05} />
      {/* recessed readout window */}
      <mesh position={[0, 0.08, 0.158]}>
        <boxGeometry args={[0.52, 0.2, 0.008]} />
        <primitive object={M.cavity} attach="material" />
      </mesh>
      {/* bar readout — different pattern per module so they read as distinct units */}
      {readout.map((h, i) => (
        <mesh key={i} position={[-0.19 + i * 0.095, 0.02 + h / 2, 0.164]}>
          <boxGeometry args={[0.052, h, 0.004]} />
          <primitive object={emissive(color, 2.2)} attach="material" />
        </mesh>
      ))}
      {/* colour-coded ident band + status */}
      <mesh position={[0, -0.16, 0.16]}>
        <boxGeometry args={[0.52, 0.028, 0.006]} />
        <primitive object={emissive(color, 1.4)} attach="material" />
      </mesh>
      <Led position={[0.29, -0.16, 0.162]} color={color} />
      {/* rear harness connector */}
      <mesh position={[0, 0, -0.16]}>
        <boxGeometry args={[0.18, 0.1, 0.06]} />
        <primitive object={M.aluminiumDark} attach="material" />
      </mesh>
    </group>
  )
}

const ERP_POS = [
  new THREE.Vector3(-1.95, 1.28, 0.1),
  new THREE.Vector3(1.95, 1.28, -0.1),
  new THREE.Vector3(-2.05, 0.0, -0.2),
  new THREE.Vector3(2.05, 0.0, 0.2),
  new THREE.Vector3(-1.95, -1.28, 0.05),
  new THREE.Vector3(1.95, -1.28, -0.05),
]
const ERP_READOUTS = [
  [0.1, 0.15, 0.09, 0.17, 0.12],
  [0.16, 0.08, 0.13, 0.06, 0.15],
  [0.07, 0.12, 0.16, 0.1, 0.08],
  [0.12, 0.16, 0.11, 0.15, 0.17],
  [0.14, 0.07, 0.15, 0.12, 0.09],
  [0.09, 0.13, 0.07, 0.16, 0.14],
]

function ErpScene() {
  const hub = useRef()

  useFrame(({ clock }) => {
    // a turned part on a spindle: constant, slow, single-axis. No wobble.
    if (hub.current) hub.current.rotation.y = clock.getElapsedTime() * 0.22
  })

  const curves = useMemo(
    () =>
      ERP_POS.map((p) => {
        const a = new THREE.Vector3(p.x > 0 ? 0.5 : -0.5, p.y * 0.12, 0.16)
        const b = p.clone().add(new THREE.Vector3(p.x > 0 ? 0.44 : -0.44, 0, -0.16))
        const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -0.26, 0.2))
        return new THREE.CatmullRomCurve3([a, mid, b])
      }),
    [],
  )

  return (
    <Settle fit={FIT.erp}>
      {/* the core */}
      <group>
        <mesh ref={hub} geometry={HUB_GEO} material={HUB_MAT} />
        {/* knurled collar so the spin is legible without any glow */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.54, 0.032, 12, 64]} />
          <primitive object={M.aluminiumDark} attach="material" />
        </mesh>
        <mesh position={[0, -0.72, 0]}>
          <cylinderGeometry args={[0.5, 0.62, 0.1, 48]} />
          <primitive object={M.chassis} attach="material" />
        </mesh>
      </group>

      {/* harness runs — rubber jacket, real slack */}
      {ERP_POS.map((p, i) => (
        <Cable
          key={i}
          from={[p.x > 0 ? 0.5 : -0.5, p.y * 0.12, 0.16]}
          to={[p.x + (p.x > 0 ? 0.44 : -0.44), p.y, p.z - 0.16]}
          sag={0.3}
          radius={0.03}
          out={0.28}
        />
      ))}
      <Fibre curves={curves} color="#a5b4fc" count={9} speed={0.24} bidirectional />

      {ERP_MODULES.map((m, i) => (
        <group key={m.label} position={ERP_POS[i]} rotation={[0, ERP_POS[i].x > 0 ? -0.24 : 0.24, 0]}>
          <InstrumentModule color={m.color} readout={ERP_READOUTS[i]} />
        </group>
      ))}

      <Label position={[0, -1.12, 0]} accent="#818cf8" strong>ERP Core — one source of truth</Label>
      {ERP_MODULES.map((m, i) => (
        <Label key={m.label} position={[ERP_POS[i].x, ERP_POS[i].y - 0.52, ERP_POS[i].z]} accent={m.color}>
          {m.label}
        </Label>
      ))}
    </Settle>
  )
}

/* ═══════════════════ WEB — a real display on a weighted stand ═══════════════════
   Aluminium bezel, cover glass with a genuine reflection, a stand with mass.
   The page builds itself on the panel; the hardware stays still. */

/* Small helper so the page mock reads as a page and not as coloured slabs */
function Bar({ x = 0, y = 0, w, h, material = M.screenText }) {
  return (
    <mesh position={[x, y, 0]}>
      <boxGeometry args={[w, h, 0.004]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

/* Nav → hero → cards. Three regions, assembled in reading order. */
const WEB_REGIONS = [
  {
    at: 0,
    y: 0.6,
    render: () => (
      <>
        <Bar w={2.36} h={0.17} material={M.screenPanel} />
        <Bar x={-1.06} w={0.13} h={0.09} material={M.screenAccent} />
        {[0.42, 0.72, 1.02].map((x) => (
          <Bar key={x} x={x} w={0.22} h={0.045} />
        ))}
      </>
    ),
  },
  {
    at: 0.7,
    y: 0.16,
    render: () => (
      <>
        <Bar x={-0.62} y={0.19} w={1.02} h={0.09} />
        <Bar x={-0.72} y={0.03} w={0.82} h={0.065} />
        <Bar x={-0.83} y={-0.09} w={0.6} h={0.065} />
        <Bar x={-0.9} y={-0.26} w={0.46} h={0.12} material={M.screenAccent} />
        <Bar x={0.66} y={-0.02} w={1.02} h={0.62} material={M.screenAccentSoft} />
      </>
    ),
  },
  {
    at: 1.4,
    y: -0.46,
    render: () => (
      <>
        {[-0.61, 0.61].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Bar w={1.14} h={0.46} material={M.screenPanel} />
            <Bar y={0.11} w={1.02} h={0.16} material={M.screenAccentSoft} />
            <Bar x={-0.14} y={-0.06} w={0.74} h={0.05} />
            <Bar x={-0.27} y={-0.15} w={0.48} h={0.05} />
          </group>
        ))}
      </>
    ),
  },
]
const WEB_CYCLE = 6.4 // build ≈2.1s, hold ≈4.3s — it finishes, then rests

function WebScene() {
  const blockRefs = useRef([])
  const caret = useRef()
  const reducedMotion = useReducedMotion()

  useFrame(({ clock }, dt) => {
    if (reducedMotion) {
      blockRefs.current.forEach((m) => m && m.scale.set(1, 1, 1))
      if (caret.current) caret.current.visible = false
      return
    }
    const phase = clock.getElapsedTime() % WEB_CYCLE
    WEB_REGIONS.forEach((b, i) => {
      const m = blockRefs.current[i]
      if (!m) return
      const target = phase > b.at ? 1 : 0
      // damp, not spring — regions land, they don't bounce
      const s = THREE.MathUtils.damp(m.scale.y, target, 9, dt)
      m.scale.set(1, s, 1)
    })
    if (caret.current) {
      const idx = WEB_REGIONS.findIndex((b) => phase < b.at)
      const target = WEB_REGIONS[idx === -1 ? WEB_REGIONS.length - 1 : idx]
      caret.current.position.y = THREE.MathUtils.damp(caret.current.position.y, target.y, 7, dt)
      caret.current.visible = idx !== -1
    }
  })

  return (
    <Settle drop={0.22} fit={FIT.web}>
      <group position={[0, 0.34, 0]}>
        {/* bezel + back shell */}
        <RoundedBox args={[2.72, 1.72, 0.09]} radius={0.035} smoothness={4} material={M.aluminium} />
        <RoundedBox args={[2.5, 1.5, 0.12]} radius={0.02} smoothness={3} position={[0, 0, -0.055]} material={M.chassis} />
        {/* panel well */}
        <mesh position={[0, 0, 0.047]}>
          <boxGeometry args={[2.5, 1.5, 0.012]} />
          <primitive object={M.screenOff} attach="material" />
        </mesh>

        {/* the page assembling on the panel */}
        <group position={[0, 0, 0.056]}>
          {WEB_REGIONS.map((b, i) => (
            <group
              key={i}
              ref={(el) => (blockRefs.current[i] = el)}
              position={[0, b.y, 0]}
              scale={reducedMotion ? 1 : [1, 0, 1]}
            >
              {b.render()}
            </group>
          ))}
          {/* build caret parked at the left margin, tracking the active region */}
          <mesh ref={caret} position={[-1.16, 0.6, 0.006]}>
            <boxGeometry args={[0.02, 0.2, 0.004]} />
            <primitive object={emissive('#ffffff', 2.4)} attach="material" />
          </mesh>
        </group>

        {/* cover glass — reflects the studio, sells it as a display */}
        <mesh position={[0, 0, 0.062]}>
          <boxGeometry args={[2.5, 1.5, 0.006]} />
          <primitive object={M.coverGlass} attach="material" />
        </mesh>
        <Led position={[0, -0.79, 0.052]} color="#f472b6" />
      </group>

      {/* stand — neck and a base with visible mass */}
      <group position={[0, -0.9, -0.06]}>
        <RoundedBox args={[0.3, 0.86, 0.16]} radius={0.03} smoothness={3} position={[0, 0.42, 0]} material={M.aluminium} />
        <mesh position={[0, -0.02, 0.06]}>
          <cylinderGeometry args={[0.62, 0.66, 0.07, 48]} />
          <primitive object={M.aluminium} attach="material" />
        </mesh>
        <mesh position={[0, -0.06, 0.06]}>
          <cylinderGeometry args={[0.6, 0.6, 0.02, 48]} />
          <primitive object={M.rubber} attach="material" />
        </mesh>
      </group>

      <Label position={[0, 1.42, 0]} accent="#f472b6" strong>Your Website</Label>
      <Label position={[-0.9, -1.32, 0]} accent="#ec4899">Design</Label>
      <Label position={[0.9, -1.32, 0]} accent="#fb7185">Ship</Label>
    </Settle>
  )
}

/* ═══════════════════ API — patch-panel network ═══════════════════
   Named business systems as identical 1U-style boxes, wired together with
   jacketed patch cables that actually sag, with light moving in the fibre. */

const API_SYSTEMS = [
  { label: 'Your Website', color: '#22d3ee', pos: new THREE.Vector3(-1.95, 1.12, 0.1) },
  { label: 'Payments', color: '#34d399', pos: new THREE.Vector3(-2.05, -0.32, -0.2) },
  { label: 'WhatsApp', color: '#a3e635', pos: new THREE.Vector3(-0.15, 1.35, -0.35) },
  { label: 'Banking', color: '#fbbf24', pos: new THREE.Vector3(1.55, -0.5, 0.25) },
  { label: 'ERP / Tally', color: '#c084fc', pos: new THREE.Vector3(2.0, 1.05, -0.15) },
  { label: 'Logistics', color: '#f472b6', pos: new THREE.Vector3(0.2, -0.15, -0.75) },
]
const API_LINKS = [[0, 2], [2, 4], [0, 1], [1, 3], [3, 4], [1, 5], [5, 3]]

/* One rack box: ported front panel, ident LED, rubber feet */
function SystemNode({ color }) {
  return (
    <group>
      <RoundedBox args={[0.92, 0.34, 0.62]} radius={0.024} smoothness={4} material={M.chassis} />
      <RoundedBox args={[0.84, 0.26, 0.02]} radius={0.012} smoothness={3} position={[0, 0, 0.32]} material={M.chassisFace} />
      {/* RJ45-style ports */}
      {[-0.28, -0.16, -0.04].map((x, i) => (
        <mesh key={i} position={[x, -0.03, 0.331]}>
          <boxGeometry args={[0.075, 0.06, 0.01]} />
          <primitive object={M.cavity} attach="material" />
        </mesh>
      ))}
      <Vents position={[0.24, -0.02, 0.331]} count={6} gap={0.038} rotation={[0, 0, Math.PI / 2]} />
      <mesh position={[0, 0.085, 0.332]}>
        <boxGeometry args={[0.4, 0.02, 0.006]} />
        <primitive object={emissive(color, 1.6)} attach="material" />
      </mesh>
      <Led position={[0.34, 0.085, 0.333]} color={color} />
      {[-0.36, 0.36].map((x) => (
        <mesh key={x} position={[x, -0.185, 0.2]}>
          <cylinderGeometry args={[0.038, 0.042, 0.04, 16]} />
          <primitive object={M.rubber} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

function ApiScene() {
  const curves = useMemo(
    () =>
      API_LINKS.map(([a, b]) => {
        const A = API_SYSTEMS[a].pos.clone().add(new THREE.Vector3(0, -0.12, 0.3))
        const B = API_SYSTEMS[b].pos.clone().add(new THREE.Vector3(0, -0.12, 0.3))
        const mid = A.clone().lerp(B, 0.5).add(new THREE.Vector3(0, -0.42, 0.3))
        return new THREE.CatmullRomCurve3([A, A.clone().lerp(mid, 0.6), mid, B.clone().lerp(mid, 0.6), B])
      }),
    [],
  )

  return (
    <Settle fit={FIT.api}>
      {/* jacketed patch runs */}
      {API_LINKS.map(([a, b], i) => (
        <Cable
          key={i}
          from={API_SYSTEMS[a].pos.clone().add(new THREE.Vector3(0, -0.12, 0.3)).toArray()}
          to={API_SYSTEMS[b].pos.clone().add(new THREE.Vector3(0, -0.12, 0.3)).toArray()}
          sag={0.42}
          radius={0.024}
          out={0.3}
        />
      ))}
      {/* the traffic inside them */}
      <Fibre curves={curves} color="#6ee7b7" count={12} speed={0.26} bidirectional />

      {API_SYSTEMS.map((s, i) => (
        <group key={s.label} position={s.pos} rotation={[0, i % 2 ? -0.2 : 0.2, 0]}>
          <SystemNode color={s.color} />
        </group>
      ))}

      {API_SYSTEMS.map((s) => (
        <Label key={s.label} position={[s.pos.x, s.pos.y + 0.36, s.pos.z]} accent={s.color}>
          {s.label}
        </Label>
      ))}
      <Label position={[0, -1.55, 0]} accent="#34d399" strong>Secure APIs keep every system in sync</Label>
    </Settle>
  )
}

/* ═══════════════════ CLOUD — a rack, and what you ship into it ═══════════════════
   Commit travels the fibre, the build unit acknowledges it, the rack takes it,
   and anodised container blocks stack up on the shelf beside it. */

const CLOUD_COLORS = ['#fbbf24', '#f59e0b', '#fcd34d', '#d97706']

/* One rack-mounted server: vents, drive bays, activity LEDs */
function RackUnit({ y, color, lit }) {
  return (
    <group position={[0, y, 0]}>
      <RoundedBox args={[1.5, 0.3, 0.78]} radius={0.02} smoothness={4} material={M.chassis} />
      <RoundedBox args={[1.42, 0.24, 0.02]} radius={0.01} smoothness={3} position={[0, 0, 0.4]} material={M.chassisFace} />
      <Vents position={[-0.34, 0, 0.412]} count={12} gap={0.036} />
      {/* drive bay handles */}
      {[0.24, 0.4, 0.56].map((x) => (
        <mesh key={x} position={[x, 0, 0.414]}>
          <boxGeometry args={[0.1, 0.16, 0.014]} />
          <primitive object={M.aluminiumDark} attach="material" />
        </mesh>
      ))}
      <Led position={[0.66, 0.06, 0.414]} color={color} on={lit} />
      <Led position={[0.66, -0.06, 0.414]} color="#34d399" on={lit} />
    </group>
  )
}

function CloudScene() {
  const containerRefs = useRef([])
  const commit = useRef()
  const buildUnit = useRef()
  const buildLed = useRef()

  /* A cable run along the floor into the base of the rack, not a line into
     mid-air: the commit has to arrive somewhere for the scene to make sense. */
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.3, -1.12, 0.62),
        new THREE.Vector3(-1.1, -1.1, 0.66),
        new THREE.Vector3(-0.35, -1.05, 0.6),
        new THREE.Vector3(0.15, -1.02, 0.36),
        new THREE.Vector3(0.45, -0.99, 0.1),
      ]),
    [],
  )
  const v = useMemo(() => new THREE.Vector3(), [])
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.3) % 1
    const k = t.current
    if (commit.current) {
      curve.getPoint(Math.min(k, 1), v)
      commit.current.position.copy(v)
      commit.current.visible = k < 0.88
    }
    // build unit registers the commit passing through it, then relaxes
    const near = k > 0.34 && k < 0.62
    if (buildUnit.current) {
      buildUnit.current.position.y = THREE.MathUtils.damp(buildUnit.current.position.y, near ? -0.99 : -1.05, 6, dt)
    }
    if (buildLed.current) {
      buildLed.current.material = near ? emissive('#fbbf24', 3) : emissive('#475569', 0.4)
    }
    // containers settle onto the shelf in sequence, then hold
    containerRefs.current.forEach((m, i) => {
      if (!m) return
      const target = k > 0.55 + i * 0.09 ? 0 : 0.9
      m.position.y = THREE.MathUtils.damp(m.position.y, target, 5, dt)
    })
  })

  return (
    <Settle fit={FIT.cloud}>
      {/* the rack — standing on the floor, not hovering over it */}
      <group position={[0.45, 0.145, 0]}>
        {/* frame posts */}
        {[[-0.82, 0.42], [0.82, 0.42], [-0.82, -0.42], [0.82, -0.42]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.07, 2.5, 0.07]} />
            <primitive object={M.aluminiumDark} attach="material" />
          </mesh>
        ))}
        <mesh position={[0, -1.28, 0]}>
          <boxGeometry args={[1.78, 0.09, 0.94]} />
          <primitive object={M.aluminiumDark} attach="material" />
        </mesh>
        <mesh position={[0, 1.28, 0]}>
          <boxGeometry args={[1.78, 0.09, 0.94]} />
          <primitive object={M.aluminiumDark} attach="material" />
        </mesh>
        {[0.92, 0.56, 0.2, -0.16, -0.52, -0.88].map((y, i) => (
          <RackUnit key={y} y={y} color={CLOUD_COLORS[i % CLOUD_COLORS.length]} lit={i !== 5} />
        ))}
      </group>

      {/* anodised container blocks stacking on a pallet beside the rack */}
      <group position={[-1.45, -0.74, 0.15]}>
        <mesh position={[0, -0.42, 0]}>
          <boxGeometry args={[1.06, 0.06, 0.74]} />
          <primitive object={M.aluminiumDark} attach="material" />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} ref={(el) => (containerRefs.current[i] = el)} position={[0, 0.9, 0]}>
            <RoundedBox
              args={[0.42, 0.3, 0.42]}
              radius={0.03}
              smoothness={4}
              position={[(i % 2) * 0.46 - 0.23, -0.23 + Math.floor(i / 2) * 0.32, (i % 2) * 0.04]}
              material={M.aluminium}
            />
            <mesh position={[(i % 2) * 0.46 - 0.23, -0.23 + Math.floor(i / 2) * 0.32, (i % 2) * 0.04 + 0.212]}>
              <boxGeometry args={[0.24, 0.03, 0.006]} />
              <primitive object={emissive(CLOUD_COLORS[i], 1.8)} attach="material" />
            </mesh>
          </group>
        ))}
      </group>

      {/* commit → build → rack */}
      <group ref={buildUnit} position={[-0.35, -1.05, 0.6]}>
        <RoundedBox args={[0.56, 0.24, 0.44]} radius={0.02} smoothness={4} material={M.chassis} />
        <mesh ref={buildLed} position={[0, 0.02, 0.226]}>
          <boxGeometry args={[0.3, 0.03, 0.006]} />
          <primitive object={emissive('#475569', 0.4)} attach="material" />
        </mesh>
        <Screws w={0.44} h={0.16} z={0.228} inset={0.03} />
      </group>
      {/* the run itself; the single commit travelling it is driven below */}
      <Fibre curves={[curve]} color="#fcd34d" count={0} radius={0.011} />
      <mesh ref={commit} geometry={DOT_GEO} material={lightDot('#fde68a')} scale={1.4} />

      <Label position={[0.45, 1.78, 0]} accent="#fbbf24" strong>Cloud Deploy</Label>
      <Label position={[-1.45, 0.42, 0]} accent="#f59e0b">Containers</Label>
      <Label position={[-1.72, -0.98, 0.62]} accent="#d97706">Commit → CI/CD</Label>
    </Settle>
  )
}

/* ═══════════════════ stage ═══════════════════ */

const SCENES = { ai: AiScene, crm: CrmScene, erp: ErpScene, web: WebScene, api: ApiScene, cloud: CloudScene }

/* Stage height per scene — set just under each assembly's lowest part, so the
   contact shadow actually reads as contact rather than as a detached smudge.
   Also where the sweep floor sits, which is what fills the lower half of this
   very tall canvas and gives the metals something to reflect. */
const GROUND = {
  ai: -0.75 * FIT.ai,
  crm: -1.46 * FIT.crm,
  erp: -1.64 * FIT.erp,
  web: -0.99 * FIT.web,
  api: -1.12 * FIT.api,
  cloud: -1.18 * FIT.cloud,
}

/* Radial falloff so the sweep dissolves into the stage instead of ending on a
   hard horizon line across the canvas — a square floor plane cuts the frame in
   two, which is the giveaway that it is a plane and not a room. */
const FLOOR_ALPHA = (() => {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(128, 128, 8, 128, 128, 128)
  grd.addColorStop(0, '#ffffff')
  grd.addColorStop(0.4, '#e0e0e0')
  grd.addColorStop(0.72, '#4a4a4a')
  grd.addColorStop(1, '#000000')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
})()

/* Polished studio sweep. Planar reflection is the single biggest realism win
   available here: it puts the hardware in a room instead of in a void, and it
   is the reason the empty bottom third of the canvas now reads as floor. */
function Floor({ y }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <circleGeometry args={[13, 72]} />
      <MeshReflectorMaterial
        resolution={512}
        blur={[300, 100]}
        mixBlur={1.1}
        mixStrength={18}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.35}
        color="#070911"
        metalness={0.62}
        roughness={0.88}
        mirror={0}
        transparent
        alphaMap={FLOOR_ALPHA}
      />
    </mesh>
  )
}

/* Softbox rig baked into an env map once. Lightformers mean no HDRI download —
   the reflections in every metal surface come from these rectangles. */
function Studio() {
  return (
    <Environment resolution={192} frames={1}>
      {/* Ambient shell first. Without something for the metals to reflect
          everywhere else, a mirror finish on a dark stage renders as a black
          silhouette — which is exactly what the first pass looked like. */}
      <Lightformer form="ring" intensity={0.55} color="#5a6c92" scale={[24, 24, 1]} position={[0, 0, -12]} />
      <Lightformer form="rect" intensity={0.5} color="#3d4a68" scale={[22, 14, 1]} position={[0, 0, 10]} rotation={[0, Math.PI, 0]} />

      {/* key: broad top softbox */}
      <Lightformer form="rect" intensity={5} color="#ffffff" scale={[9, 5, 1]} position={[0, 5.5, 2]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* fill from camera-left, cool */}
      <Lightformer form="rect" intensity={2.6} color="#c4dbff" scale={[5, 7, 1]} position={[-6, 0.5, 3]} rotation={[0, Math.PI / 2, 0]} />
      {/* rim from behind-right, warm — separates the silhouette from the stage */}
      <Lightformer form="rect" intensity={3.4} color="#ffd9b0" scale={[5, 5, 1]} position={[6, 1.5, -4]} rotation={[0, -Math.PI / 2, 0]} />
      {/* long specular streak the brushed metals read as a highlight */}
      <Lightformer form="rect" intensity={4} color="#ffffff" scale={[0.55, 9, 1]} position={[2.5, 3, 3.5]} rotation={[0, 0, Math.PI / 8]} />
      <Lightformer form="rect" intensity={2.4} color="#dce9ff" scale={[0.4, 8, 1]} position={[-3.2, 2, 3]} rotation={[0, 0, -Math.PI / 7]} />
      {/* floor bounce */}
      <Lightformer form="rect" intensity={1.2} color="#8ea3c8" scale={[9, 5, 1]} position={[0, -4.5, 1]} rotation={[Math.PI / 2, 0, 0]} />
    </Environment>
  )
}

/* Moves the camera in place on breakpoint changes — remounting the Canvas
   would destroy the WebGL context and recompile every shader. */
/* Raised three-quarter view rather than a flat elevation: the canvas is
   portrait, so looking slightly down uses the vertical space a head-on shot
   wastes, and it is how hardware is photographed anyway. */
function ResponsiveCamera({ compact }) {
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    camera.position.set(0, compact ? 1.2 : 1.05, compact ? 7.6 : 6.5)
    camera.lookAt(0, -0.32, 0)
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
  const Scene = SCENES[scene] || SCENES.ai

  return (
    <div className="showcase-canvas-inner" ref={wrap}>
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 1.05, 6.5], fov: 42 }}
          dpr={[1, lowEnd ? 1.25 : 1.75]}
          frameloop={frameloop}
          onCreated={guardContextLoss}
          shadows={false}
          gl={{
            antialias: lowEnd,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.22,
          }}
        >
          <Suspense fallback={null}>
            <ResponsiveCamera compact={compact} />
            <Studio />
            {/* A hint of directional over the env map so edges stay crisp —
                the environment is doing nearly all of the lighting. */}
            <ambientLight intensity={0.18} />
            <directionalLight position={[4, 6, 5]} intensity={0.6} color="#eef2ff" />
            <directionalLight position={[-5, 1, -4]} intensity={0.3} color="#a5b4fc" />

            {/* Only the active scene is mounted. Six warm scenes was affordable
                for flat-shaded primitives; with PBR + an env map + transmission
                it is not, and the first-open compile hitch is one frame. */}
            <Scene key={scene} />

            {/* The stage. Keyed to the scene so a tab switch re-bakes rather
                than leaving the previous scene's shadow behind. */}
            {!lowEnd && <Floor key={`floor-${scene}`} y={GROUND[scene]} />}
            {!lowEnd && (
              <ContactShadows
                key={`shadow-${scene}`}
                position={[0, GROUND[scene] + 0.004, 0]}
                opacity={0.8}
                scale={11}
                blur={2.2}
                far={2.6}
                resolution={256}
                frames={reducedMotion ? 1 : Infinity}
                color="#010206"
              />
            )}

            {/* Threshold 0.9: only LEDs, screens and fibre bloom. The metals
                are lit, not glowing. No depth of field — on a canvas this
                small it just softened the machined detail that the whole
                re-model exists to show. */}
            {!lowEnd && (
              <EffectComposer multisampling={4}>
                <Bloom intensity={0.5} luminanceThreshold={0.9} luminanceSmoothing={0.3} mipmapBlur />
              </EffectComposer>
            )}
          </Suspense>
        </Canvas>
      </SceneErrorBoundary>
    </div>
  )
}
