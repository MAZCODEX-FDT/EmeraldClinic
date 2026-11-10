import { useMemo } from 'react'

export type ToothType = 'front' | 'premolar' | 'molar' | 'wisdom'
export type ToothGeo = { fdi: number; x: number; y: number; rot: number; w: number; h: number; type: ToothType; upper: boolean }

const WIDTHS = [8.6, 6.6, 7.8, 7.1, 6.9, 10.4, 9.8, 9.2] // positions 1..8 (central → wisdom)
const typeOf = (pos: number): ToothType => (pos <= 3 ? 'front' : pos <= 5 ? 'premolar' : pos <= 7 ? 'molar' : 'wisdom')

/** FDI layout on two parabolic arches, viewer-oriented (patient's right on viewer's left). */
export function archLayout(W = 420, H = 454): ToothGeo[] {
  const cx = W / 2
  const out: ToothGeo[] = []
  const spread = 1.5 // radians each side
  const total = WIDTHS.reduce((a, b) => a + b, 0)
  const build = (upper: boolean) => {
    const a = W * 0.4
    const b = H * 0.37
    const cy = upper ? H * 0.48 : H * 0.52
    // order viewer left → right: quadrant (1|4) pos 8..1, then (2|3) pos 1..8
    const seq: { q: number; pos: number }[] = []
    const qL = upper ? 1 : 4
    const qR = upper ? 2 : 3
    for (let p = 8; p >= 1; p--) seq.push({ q: qL, pos: p })
    for (let p = 1; p <= 8; p++) seq.push({ q: qR, pos: p })
    let acc = -total
    for (const s of seq) {
      const w = WIDTHS[s.pos - 1]
      const mid = acc + w / 2
      acc += w
      const phi = (mid / total) * spread
      const x = cx + a * Math.sin(phi)
      const y = upper ? cy - b * Math.cos(phi) : cy + b * Math.cos(phi)
      const deg = (phi * 180) / Math.PI
      const scale = 3.75
      out.push({
        fdi: s.q * 10 + s.pos, x, y, rot: upper ? deg : -deg,
        w: w * scale * 0.9, h: (s.pos <= 3 ? 9.5 : s.pos <= 5 ? 9 : 10) * scale, type: typeOf(s.pos), upper,
      })
    }
  }
  build(true)
  build(false)
  return out
}

type Props = {
  width?: number
  fill?: (t: ToothGeo) => string
  stroke?: (t: ToothGeo) => string
  selected?: number | null
  onSelect?: (t: ToothGeo) => void
  onHover?: (t: ToothGeo | null) => void
  showNumbers?: boolean
  marker?: (t: ToothGeo) => React.ReactNode
  className?: string
  labelColor?: string
}

export function DentalArch({ width = 420, fill, stroke, selected, onSelect, onHover, showNumbers = true, marker, className = '', labelColor = '#8C8F8D' }: Props) {
  const H = width * 1.08
  const teeth = useMemo(() => archLayout(width, H), [width, H])
  return (
    <svg viewBox={`0 0 ${width} ${H}`} className={className} role="group" aria-label="Dental chart">
      {teeth.map((t) => {
        const sel = selected === t.fdi
        const rx = t.type === 'front' ? t.w * 0.45 : t.w * 0.32
        const labelOffset = t.upper ? -t.h * 0.95 : t.h * 0.95
        const lx = t.x - labelOffset * Math.sin((t.rot * Math.PI) / 180)
        const ly = t.y + labelOffset * Math.cos((t.rot * Math.PI) / 180)
        return (
          <g
            key={t.fdi}
            data-tooth={t.fdi}
            className="tooth cursor-pointer outline-none"
            tabIndex={onSelect ? 0 : -1}
            role={onSelect ? 'button' : undefined}
            aria-label={`Tooth ${t.fdi}`}
            onClick={() => onSelect?.(t)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.(t) } }}
            onMouseEnter={() => onHover?.(t)}
            onMouseLeave={() => onHover?.(null)}
          >
            <g transform={`translate(${t.x} ${t.y}) rotate(${t.rot})`}>
              <rect
                x={-t.w / 2} y={-t.h / 2} width={t.w} height={t.h} rx={rx}
                fill={fill ? fill(t) : '#F7F4EE'}
                stroke={sel ? '#0E4D3C' : stroke ? stroke(t) : '#BFE3D3'}
                strokeWidth={sel ? 3 : 1.6}
                style={{ transition: 'fill .35s, stroke .25s, transform .35s', transformBox: 'fill-box', transformOrigin: 'center', transform: sel ? 'scale(1.12)' : undefined }}
              />
              {t.type !== 'front' && (
                <path d={`M${-t.w * 0.22} 0 Q0 ${t.h * 0.12} ${t.w * 0.22} 0`} fill="none" stroke={sel ? '#0E4D3C' : 'rgba(14,77,60,.25)'} strokeWidth={1.2} strokeLinecap="round" />
              )}
              {marker?.(t)}
            </g>
            {showNumbers && (
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize={width * 0.024} fill={sel ? '#0E4D3C' : labelColor} fontFamily="Inter" fontWeight={sel ? 700 : 500}>
                {t.fdi}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
