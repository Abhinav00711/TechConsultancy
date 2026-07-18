import { useId } from 'react'

/* Inline SVG icon set — stroke icons sized by the parent's font/color */
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  width: 28,
  height: 28,
  viewBox: '0 0 24 24',
}

export const Logo = ({ size = 36 }) => {
  // Unique gradient id per instance — the logo renders in both navbar and
  // footer, and duplicate SVG ids can break the gradient reference.
  const id = useId()
  const g = `url(#${id})`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#818cf8" />
          <stop offset="1" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <path d="M14 20 L32 10 L50 20 L50 44 L32 54 L14 44 Z" stroke={g} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M32 10 L32 54 M14 20 L50 44 M50 20 L14 44" stroke={g} strokeWidth="1.5" opacity="0.55" />
      <circle cx="32" cy="32" r="5" fill={g} />
    </svg>
  )
}

const icons = {
  ai: (
    <svg {...base}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  crm: (
    <svg {...base}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16.5 3.8a3.2 3.2 0 0 1 0 8.4M17.8 15.2c1.8.8 2.7 2.6 2.7 4.8" />
    </svg>
  ),
  erp: (
    <svg {...base}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
      <path d="M10.5 6.75h3M6.75 10.5v3M17.25 10.5v3M10.5 17.25h3" />
    </svg>
  ),
  web: (
    <svg {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9z" />
    </svg>
  ),
  api: (
    <svg {...base}>
      <path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 5l-3 14" />
    </svg>
  ),
  cloud: (
    <svg {...base}>
      <path d="M7 18a4.5 4.5 0 1 1 .6-8.96A6 6 0 0 1 19 10.5 3.75 3.75 0 0 1 18 18H7z" />
      <path d="M12 13v5M9.8 15.5L12 13l2.2 2.5" />
    </svg>
  ),
  mail: (
    <svg {...base}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7l8.5 6 8.5-6" />
    </svg>
  ),
  phone: (
    <svg {...base}>
      <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  ),
  pin: (
    <svg {...base}>
      <path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  whatsapp: (
    <svg {...base}>
      <path d="M12 3a9 9 0 0 0-7.6 13.8L3 21l4.4-1.3A9 9 0 1 0 12 3z" />
      <path d="M9.2 8.6c.5 2.6 3.6 5.7 6.2 6.2l1.2-1.9-2.2-1.1-.9.9a6.7 6.7 0 0 1-2-2l.9-.9-1.1-2.2-2.1 1z" />
    </svg>
  ),
  calendar: (
    <svg {...base}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v4M16 3v4" />
    </svg>
  ),
  linkedin: (
    <svg {...base} strokeWidth={1.5} width={20} height={20}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17M8 7.2v.1M12 17v-3.8c0-1.4 1-2.4 2.4-2.4S17 11.8 17 13.2V17" />
    </svg>
  ),
  twitter: (
    <svg {...base} strokeWidth={1.5} width={20} height={20}>
      <path d="M4 4l7.2 9.3L4.4 20h2.4l5.5-5.4L16.8 20H20l-7.5-9.7L18.9 4h-2.4l-4.9 4.9L8 4H4z" />
    </svg>
  ),
  github: (
    <svg {...base} strokeWidth={1.5} width={20} height={20}>
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  ),
  instagram: (
    <svg {...base} strokeWidth={1.5} width={20} height={20}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.4" fill="currentColor" />
    </svg>
  ),
  arrow: (
    <svg {...base} width={18} height={18}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
}

export default function Icon({ name, ...props }) {
  const el = icons[name]
  if (!el) return null
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }} aria-hidden="true" {...props}>
      {el}
    </span>
  )
}
