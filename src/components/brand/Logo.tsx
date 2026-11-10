import { useLang } from '@/lib/i18n'

/** Emerald monoline mark: tooth outline cradled by a smile arc (stroke = 10/128). */
export function Mark({ size = 40, tooth = '#1F7A5C', smile = '#0E4D3C', className = '', draw = false }: { size?: number; tooth?: string; smile?: string; className?: string; draw?: boolean }) {
  return (
    <svg viewBox="0 0 128 128" width={size} height={size} className={className} fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path
        data-draw={draw || undefined}
        stroke={tooth}
        strokeWidth={10}
        d="M40 14C28 14 22 24 22 36c0 14 8 22 11 36 2 12 4 26 11 26s8-18 12-26c2-4 6-6 8-6s6 2 8 6c4 8 5 26 12 26s9-14 11-26c3-14 11-22 11-36 0-12-6-22-18-22-10 0-16 6-24 6s-14-6-24-6Z"
      />
      <path data-draw={draw || undefined} stroke={smile} strokeWidth={10} d="M16 92A60 60 0 0 0 112 92" />
    </svg>
  )
}

export function Logo({ light = false, size = 38 }: { light?: boolean; size?: number }) {
  const { lang } = useLang()
  const toothC = light ? '#BFE3D3' : '#1F7A5C'
  const smileC = light ? '#F7F4EE' : '#0E4D3C'
  const text = light ? 'text-ivory' : 'text-deep'
  return (
    <span className="inline-flex items-center gap-3">
      <Mark size={size} tooth={toothC} smile={smileC} />
      {lang === 'ar' ? (
        <span className={`flex flex-col leading-none ${text}`}>
          <span className="font-ar-display text-[1.35rem] font-bold">إميرالد</span>
          <span className="font-ar text-[0.78rem] opacity-70 mt-0.5">لطب الأسنان</span>
        </span>
      ) : (
        <span className={`flex flex-col leading-none ${text}`}>
          <span className="font-display text-[1.15rem] font-bold tracking-[0.14em]">EMERALD</span>
          <span className="text-[0.55rem] tracking-[0.62em] opacity-70 mt-1">DENTAL CLINIC</span>
        </span>
      )}
    </span>
  )
}
