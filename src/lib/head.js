/* Per-page <head> metadata.

   React does not render into <head> here, so these tags are mutated directly.
   That is safe for hydration precisely because they are outside the React tree:
   scripts/prerender.mjs captures the head *after* this has run, so the shipped
   HTML already carries the right title, description, canonical and OG tags for
   crawlers that never execute JavaScript — and re-running it on hydration
   writes the same values back.

   index.html ships the home page's values, so every sub-page must set all of
   them; anything left alone would silently claim to be the home page. */

const upsert = (selector, create) => {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  return el
}

const meta = (attr, name, content) => {
  const el = upsert(`meta[${attr}="${name}"]`, () => {
    const created = document.createElement('meta')
    created.setAttribute(attr, name)
    return created
  })
  el.setAttribute('content', content)
}

export function setMeta({ title, description, canonical }) {
  document.title = title
  meta('name', 'description', description)

  upsert('link[rel="canonical"]', () => {
    const link = document.createElement('link')
    link.rel = 'canonical'
    return link
  }).setAttribute('href', canonical)

  meta('property', 'og:title', title)
  meta('property', 'og:description', description)
  meta('property', 'og:url', canonical)
  meta('name', 'twitter:title', title)
  meta('name', 'twitter:description', description)
}
