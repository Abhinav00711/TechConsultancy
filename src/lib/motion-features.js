/* framer-motion's animation feature bundle, isolated so it becomes its own
   lazy chunk. The entry keeps only LazyMotion + the `m` renderer; App.jsx
   starts this import at module evaluation, so the download runs in parallel
   with hydration instead of blocking the first paint behind it. */
export { domAnimation as default } from 'motion/react'
