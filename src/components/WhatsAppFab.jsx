import { site } from '../data/content.js'
import { track } from '../lib/analytics.js'
import Icon from './ui/Icons.jsx'

/* Floating WhatsApp click-to-chat button — renders only when site.whatsapp
   is set. Opens a prefilled wa.me conversation in a new tab.

   The aria-label must CONTAIN the visible label (WCAG 2.5.3 Label in Name)
   or voice control cannot reach it: "click WhatsApp us" matched nothing
   against the old "Chat with us on WhatsApp". The label itself is
   display:none below 560px, so the aria-label still has to carry the name. */
export default function WhatsAppFab() {
  if (!site.whatsappLink) return null
  return (
    <a
      className="whatsapp-fab"
      href={site.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp us — opens a chat in a new tab"
      onClick={() => track('WhatsApp Click', { placement: 'fab' })}
    >
      <Icon name="whatsapp" />
      <span className="whatsapp-fab-label">WhatsApp us</span>
    </a>
  )
}
