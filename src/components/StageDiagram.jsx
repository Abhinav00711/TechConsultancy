/* Static resting state for the dark stage: one hairline sketch per service,
   drawn in the ledger's register — a single ink, an oxide accent, a ruled
   baseline standing in for the live scenes' reflective floor. Inline SVG on
   purpose: no raster asset, no fetch, ~1 KB gzip for all six, and it renders
   in the prerendered HTML (so constrained devices and crawlers get a real
   illustration, not an empty gradient).

   Shown (a) before a visitor engages the live demo, (b) as the permanent
   stage on constrained devices where WebGL never mounts, and (c) when the
   WebGL chunk fails to download — the state the aria-live region already
   describes as "A static illustration is shown instead."

   Decorative alongside the row's copy, exactly like the canvas it stands in
   for, hence aria-hidden on the wrapper. The palette is fixed in CSS
   (.stage-diagram) because the stage panel is dark in both themes. */

const OX = 'var(--sd-oxide)'

/* Ledger chrome shared by all six: corner ticks and a ruled, tick-marked
   baseline the subject sits on. */
const chrome = (
  <g opacity="0.4">
    <path d="M28 32v-8h8M304 24h8v8M312 208v8h-8M36 216h-8v-8" />
    <path d="M36 196h268" />
    <path d="M60 196v4M108 196v4M156 196v4M204 196v4M252 196v4M300 196v4" opacity="0.7" />
  </g>
)

/* Each diagram echoes its live scene's subject: the appliance on a bench,
   the funnel, the hub and modules, the display, the patch network, the
   rack. Coordinates are hand-placed against viewBox 0 0 340 240. */
const DIAGRAMS = {
  /* inference appliance: paper in, machine works, trays out */
  ai: (
    <g>
      <g opacity="0.55">
        <rect x="46" y="182" width="46" height="7" rx="2" />
        <rect x="50" y="175" width="46" height="7" rx="2" />
        <rect x="54" y="168" width="46" height="7" rx="2" />
        <path d="M62 172h24M62 168h16" opacity="0.8" />
      </g>
      <rect x="128" y="108" width="84" height="60" rx="5" />
      <rect x="136" y="116" width="68" height="44" rx="3" opacity="0.45" />
      <path d="M144 126v20M151 126v20M158 126v20M165 126v20" opacity="0.6" />
      <g stroke={OX}>
        <rect x="176" y="128" width="5" height="12" fill={OX} fillOpacity="0.85" />
        <rect x="184" y="128" width="5" height="12" fill={OX} fillOpacity="0.85" />
        <rect x="192" y="128" width="5" height="12" fill="none" opacity="0.55" />
      </g>
      <circle cx="197" cy="152" r="2" fill={OX} stroke="none" />
      <g opacity="0.55">
        <rect x="250" y="168" width="42" height="10" rx="2" />
        <rect x="256" y="152" width="42" height="10" rx="2" />
      </g>
      <g stroke={OX} strokeDasharray="4 5" opacity="0.9">
        <path d="M96 178c14 0 18-40 32-40" />
        <path d="M212 138c16 0 20 20 36 20" />
      </g>
      <path d="M243 155l7 3-7 3" stroke={OX} />
    </g>
  ),
  /* the machined funnel: leads in at the rim, revenue in the basin */
  crm: (
    <g>
      <path d="M108 66h124M108 66l46 82M232 66l-46 82M154 148v14h32v-14" />
      <path d="M122 90h96" opacity="0.5" />
      <path d="M136 114h68" stroke={OX} opacity="0.9" />
      <path d="M148 134h44" opacity="0.5" />
      <g opacity="0.75">
        <circle cx="142" cy="50" r="3.5" />
        <circle cx="172" cy="44" r="3.5" />
        <circle cx="202" cy="52" r="3.5" />
      </g>
      <rect x="140" y="172" width="60" height="16" rx="3" />
      <circle cx="158" cy="180" r="3.5" opacity="0.75" />
      <circle cx="182" cy="180" r="3.5" fill={OX} stroke="none" />
    </g>
  ),
  /* one core, six identical modules on a harness */
  erp: (
    <g>
      <circle cx="170" cy="128" r="23" />
      <circle cx="170" cy="128" r="9" stroke={OX} />
      <g opacity="0.45">
        <path d="M96 79l55 34M244 79l-55 34M82 130h65M193 130h65M96 177l55-34M244 177l-55-34" />
      </g>
      <circle cx="123" cy="96" r="2.2" fill={OX} stroke="none" />
      <circle cx="226" cy="147" r="2.2" fill={OX} stroke="none" />
      <g opacity="0.8">
        <rect x="79" y="68" width="34" height="22" rx="3" />
        <rect x="227" y="68" width="34" height="22" rx="3" />
        <rect x="48" y="119" width="34" height="22" rx="3" />
        <rect x="258" y="119" width="34" height="22" rx="3" />
        <rect x="79" y="166" width="34" height="22" rx="3" />
        <rect x="227" y="166" width="34" height="22" rx="3" />
        <path d="M85 80h22M233 80h22M54 131h22M264 131h22M85 178h22M233 178h22" opacity="0.6" />
      </g>
    </g>
  ),
  /* a display on its stand, the page blocked out on the panel */
  web: (
    <g>
      <rect x="116" y="72" width="108" height="76" rx="5" />
      <rect x="124" y="80" width="92" height="60" rx="2" opacity="0.55" />
      <path d="M124 92h92" opacity="0.55" />
      <path d="M130 104h34M130 112h26M130 120h30" opacity="0.7" />
      <rect x="176" y="100" width="34" height="22" stroke={OX} />
      <g opacity="0.6">
        <rect x="128" y="126" width="40" height="10" rx="1" />
        <rect x="172" y="126" width="40" height="10" rx="1" />
      </g>
      <circle cx="170" cy="144" r="1.6" fill={OX} stroke="none" />
      <path d="M164 148v14M176 148v14" opacity="0.8" />
      <rect x="144" y="162" width="52" height="6" rx="3" />
    </g>
  ),
  /* named systems, patch cables with real sag, traffic on the runs */
  api: (
    <g>
      <g opacity="0.5">
        <path d="M96 90c22 26 36-8 58-8M154 82c30 0 40 22 68 22M114 92c4 34 24 52 50 56M264 106c-8 24-42 40-76 42" />
      </g>
      <circle cx="132" cy="101" r="2.2" fill={OX} stroke="none" />
      <circle cx="228" cy="140" r="2.2" fill={OX} stroke="none" />
      <g opacity="0.85">
        <rect x="60" y="72" width="38" height="20" rx="3" />
        <rect x="136" y="62" width="38" height="20" rx="3" />
        <rect x="246" y="86" width="38" height="20" rx="3" />
        <rect x="96" y="148" width="38" height="20" rx="3" />
        <rect x="188" y="148" width="38" height="20" rx="3" />
        <path d="M66 84h12M142 74h12M252 98h12M102 160h12M194 160h12" opacity="0.6" />
        <circle cx="92" cy="78" r="1.6" fill={OX} stroke="none" />
        <circle cx="168" cy="68" r="1.6" fill={OX} stroke="none" />
        <circle cx="278" cy="92" r="1.6" fill={OX} stroke="none" />
        <circle cx="128" cy="154" r="1.6" fill={OX} stroke="none" />
        <circle cx="220" cy="154" r="1.6" fill={OX} stroke="none" />
      </g>
    </g>
  ),
  /* commit travels into the rack; containers stack beside it */
  cloud: (
    <g>
      <rect x="198" y="70" width="70" height="118" rx="4" />
      <path d="M198 100h70M198 130h70M198 160h70" opacity="0.5" />
      <path d="M206 84h26M206 114h26M206 144h26M206 174h26" opacity="0.6" />
      <circle cx="256" cy="85" r="2" fill={OX} stroke="none" />
      <circle cx="256" cy="115" r="2" opacity="0.6" />
      <circle cx="256" cy="145" r="2" fill={OX} stroke="none" />
      <circle cx="256" cy="175" r="2" opacity="0.6" />
      <g opacity="0.8">
        <rect x="84" y="158" width="20" height="20" rx="2" />
        <rect x="108" y="158" width="20" height="20" rx="2" />
        <rect x="96" y="136" width="20" height="20" rx="2" />
        <path d="M100 141h12" stroke={OX} />
      </g>
      <path d="M52 190c44 8 96 6 138-14" stroke={OX} strokeDasharray="4 5" opacity="0.9" />
      <circle cx="122" cy="193" r="3" fill={OX} stroke="none" />
      <path d="M184 179l8-2-4 7" stroke={OX} />
    </g>
  ),
}

export default function StageDiagram({ id }) {
  return (
    <div className="stage-diagram" aria-hidden="true">
      <svg
        viewBox="0 0 340 240"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        focusable="false"
        fill="none"
        stroke="var(--sd-ink)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {chrome}
        {DIAGRAMS[id] || DIAGRAMS.ai}
      </svg>
    </div>
  )
}
