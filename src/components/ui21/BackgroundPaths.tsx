// Adapted from "Background Paths" by @kokonutd (21st.dev) — flowing line field in Emerald tones.
import { motion } from 'motion/react'

function FloatingPaths({ position, color }: { position: number; color: string }) {
  const paths = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))
  return (
    <svg className="h-full w-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {paths.map((p) => (
        <motion.path
          key={p.id}
          d={p.d}
          stroke={color}
          strokeWidth={p.width}
          strokeOpacity={0.08 + p.id * 0.02}
          initial={{ pathLength: 0.3, opacity: 0.6 }}
          animate={{ pathLength: 1, opacity: [0.3, 0.6, 0.3], pathOffset: [0, 1, 0] }}
          transition={{ duration: 22 + (p.id % 7) * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </svg>
  )
}

export function BackgroundPaths({ color = '#BFE3D3', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <div className="absolute inset-0"><FloatingPaths position={1} color={color} /></div>
      <div className="absolute inset-0"><FloatingPaths position={-1} color={color} /></div>
    </div>
  )
}
