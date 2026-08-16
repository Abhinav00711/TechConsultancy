/* Visually-hidden " (opens in new tab)" suffix for every target="_blank"
   link whose accessible name comes from its content (WCAG 3.2.5 advisory /
   G201). A screen-reader user otherwise activates "Book a Free Discovery
   Call" and lands in a different tab with no warning and a broken Back
   button. One component, not thirteen hand-typed spans, so the wording
   can't drift between call sites the way the FAB/sticky-bar names once did.

   Links named by aria-label (the footer's social icons, the founders'
   LinkedIn icons, the WhatsApp FAB) can't use a child span — aria-label
   replaces content in the accessible name — so they append the same warning
   to the label string instead. */
export default function NewTabHint() {
  return <span className="sr-only"> (opens in new tab)</span>
}
