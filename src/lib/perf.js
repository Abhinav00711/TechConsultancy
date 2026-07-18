/* Device/network tier check used BEFORE loading the WebGL chunks.
   SceneShell's isLowEnd() only tunes quality once a canvas exists; this
   decides whether ~280 KB gzip of three.js should download at all. Weak
   hardware or a constrained connection gets the static gradient fallback
   instead — precisely the mid-range Android + 4G audience the site targets. */
export function isConstrained() {
  const mem = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  const lowEnd = (mem !== undefined && mem <= 4) || (cores !== undefined && cores <= 4)
  const conn = navigator.connection
  const slowNet = conn ? conn.saveData || /(^|-)(2|3)g$/.test(conn.effectiveType || '') : false
  return lowEnd || slowNet
}
