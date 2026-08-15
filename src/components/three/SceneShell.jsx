import { Component } from 'react'

/* Shared resilience/quality helpers for the WebGL scenes. */

let webglChecked = null
export function webglSupported() {
  if (webglChecked === null) {
    try {
      const c = document.createElement('canvas')
      webglChecked = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webglChecked = false
    }
  }
  return webglChecked
}

/* Rough low-end heuristic: few cores or little memory → smaller DPR, no floor.
   Deliberately a HIGHER bar than perf.js isConstrained() (≤4 vs ≤2): devices
   between the two get the reduced-quality scene instead of either extreme —
   see the tier note in src/lib/perf.js. */
export function isLowEnd() {
  const mem = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  return (mem !== undefined && mem <= 4) || (cores !== undefined && cores <= 4)
}

/* Prevent-default on context loss so the browser attempts a restore instead
   of leaving a dead canvas. Pass to Canvas onCreated. */
export function guardContextLoss({ gl }) {
  gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
}

/* A renderer crash inside Canvas must never blank the whole site —
   fall back to the decorative gradient the CSS already paints behind it. */
export class SceneErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed || !webglSupported()) {
      return <div className={this.props.fallbackClassName || 'canvas-fallback'} aria-hidden="true" />
    }
    return this.props.children
  }
}
