import Navbar from '../Navbar.jsx'
import Footer from '../Footer.jsx'
import WhatsAppFab from '../WhatsAppFab.jsx'
import StickyCtaBar from '../StickyCtaBar.jsx'

/* The page chrome every routed page shares: skip link, ruled-paper ambient
   layer, navbar, the focusable <main> landmark, footer, WhatsApp FAB and the
   mobile sticky CTA bar. App.jsx (home), ServicePage.jsx and ServicesHub.jsx
   each hand-copied this stack — three chances for the shells to drift the way
   the FAB/sticky-bar labels once did.

   The DOM this renders is load-bearing well beyond looks, so treat its
   markup as frozen:
   - #main + tabIndex={-1} is the skip link's target — tabIndex so the link
     reliably MOVES focus, not just scrolls (and the deep-link handlers rely
     on #main being focusable the same way).
   - The prerender snapshots hydrate over exactly this structure; smoke.mjs
     fails on any mismatch.
   - CSS selectors key off the element order (e.g. the main::before rail and
     `main > .section` border rules).

   mainStyle exists for ServicePage, whose <main> carries the service accent
   as a custom property; the other pages pass nothing, which renders no style
   attribute at all — identical to their previous markup. */
export default function PageShell({ mainStyle, children }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="ambient" />
      <Navbar />
      <main id="main" tabIndex={-1} style={mainStyle}>
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <StickyCtaBar />
    </>
  )
}
