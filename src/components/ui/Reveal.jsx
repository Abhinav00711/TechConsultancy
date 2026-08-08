/* Motion doctrine (Ledger redesign): motion must carry meaning. The blanket
   fade-up-on-scroll this component used to apply was ambient decoration, so it
   now renders a plain wrapper. Kept as a component so its many call sites —
   and their className/layout duties — stay untouched, and so a deliberate
   entrance can be reintroduced in one place if a section ever earns one. */
export default function Reveal({ children, className }) {
  return <div className={className}>{children}</div>
}
