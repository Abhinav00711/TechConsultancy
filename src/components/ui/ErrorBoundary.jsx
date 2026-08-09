import { Component } from 'react'

/* Generic error boundary. The one in SceneShell.jsx guards renderer crashes
   inside an already-loaded canvas; this one exists for everything that
   boundary structurally cannot catch — above all a lazy chunk that fails to
   download (flaky 4G, or stale HTML naming an evicted hash after a deploy).
   React.lazy rethrows that rejection at render time, and without a boundary
   above the Suspense the whole tree unmounts to a white page. */
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}
