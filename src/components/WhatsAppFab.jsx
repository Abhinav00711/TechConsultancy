import { site } from '../data/content.js'
import Icon from './ui/Icons.jsx'

/* Floating WhatsApp click-to-chat button — renders only when site.whatsapp
   is set. Opens a prefilled wa.me conversation in a new tab. */
export default function WhatsAppFab() {
  if (!site.whatsappLink) return null
  return (
    <a
      className="whatsapp-fab"
      href={site.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <Icon name="whatsapp" />
      <span className="whatsapp-fab-label">WhatsApp us</span>
    </a>
  )
}
