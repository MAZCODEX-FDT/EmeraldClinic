// Inspired by "Background Paths" by @kokonutd (21st.dev).
// Lightweight version: the paths are static and only the whole layer drifts with a
// GPU-composited transform, so there is no per-frame SVG repaint (the old version
// animated 60 path lengths and stuttered in the footer).

function Paths({ position, color }: { position: number; color: string }) {
  return (
    <svg className="h-full w-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <path
          key={i}
          d={`M-${380 - i * 8 * position} -${189 + i * 10}C-${380 - i * 8 * position} -${189 + i * 10} -${312 - i * 8 * position} ${216 - i * 10} ${152 - i * 8 * position} ${343 - i * 10}C${616 - i * 8 * position} ${470 - i * 10} ${684 - i * 8 * position} ${875 - i * 10} ${684 - i * 8 * position} ${875 - i * 10}`}
          stroke={color}
          strokeWidth={0.6 + i * 0.04}
          strokeOpacity={0.1 + i * 0.025}
        />
      ))}
    </svg>
  )
}

export function BackgroundPaths({ color = '#BFE3D3', className = '' }: { color?: string; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -inset-[10%] animate-[pathsDrift_28s_ease-in-out_infinite_alternate] will-change-transform motion-reduce:animate-none">
        <Paths position={1} color={color} />
      </div>
      <div className="absolute -inset-[10%] animate-[pathsDrift_34s_ease-in-out_infinite_alternate-reverse] will-change-transform motion-reduce:animate-none">
        <Paths position={-1} color={color} />
      </div>
    </div>
  )
}
