import { techStack, industries } from '../data/content.js'

function Row({ items, reverse }) {
  const group = (key, hidden) => (
    <div key={key} aria-hidden={hidden} style={{ display: 'flex', gap: 56 }}>
      {items.map((t) => (
        <span key={t} className="marquee-item">
          {t}
        </span>
      ))}
    </div>
  )
  return (
    <div className={`marquee-track ${reverse ? 'reverse' : ''}`}>
      {group('a', false)}
      {group('b', true)}
    </div>
  )
}

export default function TechMarquee() {
  return (
    <div className="marquee-section">
      <Row items={techStack} />
      <Row items={industries} reverse />
    </div>
  )
}
