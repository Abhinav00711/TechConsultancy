import { techStack } from '../data/content.js'

export default function TechMarquee() {
  const group = (key, hidden) => (
    <div key={key} aria-hidden={hidden} style={{ display: 'flex', gap: 56 }}>
      {techStack.map((t) => (
        <span key={t} className="marquee-item">
          {t}
        </span>
      ))}
    </div>
  )
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        {group('a', false)}
        {group('b', true)}
      </div>
    </div>
  )
}
