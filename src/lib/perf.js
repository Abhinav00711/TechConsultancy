/* Device/network tier check used BEFORE loading the WebGL chunks.
   This decides whether ~280 KB gzip of three.js should download at all;
   SceneShell's isLowEnd() then tunes quality once a canvas exists.

   The hardware bar here must sit BELOW isLowEnd()'s (≤2 vs ≤4): when the
   two predicates were identical, every device that reached a canvas was by
   construction not low-end, so the reduced tier (dpr cap, no floor, no
   contact shadows) was dead code and the mid-range Android + 4G audience
   the site targets got either nothing or the maximum-cost configuration.
   Three tiers now exist: very-low/slow → static fallback, mid (≤4 cores or
   ≤4 GB) → reduced scene, everything else → full scene. */
export function isConstrained() {
  const mem = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  const veryLow = (mem !== undefined && mem <= 2) || (cores !== undefined && cores <= 2)
  const conn = navigator.connection
  const slowNet = conn ? conn.saveData || /(^|-)(2|3)g$/.test(conn.effectiveType || '') : false
  return veryLow || slowNet
}
