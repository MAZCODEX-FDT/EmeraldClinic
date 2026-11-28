import { useLang } from '@/lib/i18n'

/**
 * Emerald's mark (brand guidelines v2): a tooth built from four overlapping translucent forms,
 * two halves and two crown ellipses. "light" is the colourway for light backgrounds,
 * "dark" the one for Emerald Deep. Exported from the brand guidelines in Canva.
 */
export function Mark({ size = 40, tone = 'light', className = '', opacity }: { size?: number; tone?: 'light' | 'dark'; className?: string; opacity?: number }) {
  return (
    <img
      src={tone === 'dark' ? '/img/mark-dark.webp' : '/img/mark-light.webp'}
      width={size}
      height={size}
      alt=""
      aria-hidden
      draggable={false}
      className={`select-none ${className}`}
      style={opacity === undefined ? undefined : { opacity }}
    />
  )
}

/**
 * The primary logo: mark + wordmark. English: EMERALD in Italiana (+8% tracking) with
 * DENTAL CLINIC in Jost Medium (+50%) centred under it. Italiana gets a hairline stroke so it holds up at nav sizes. Arabic lockup in Tajawal.
 */
export function Logo({ light = false, size = 38 }: { light?: boolean; size?: number }) {
  const { lang } = useLang()
  const name = light ? 'text-ivory' : 'text-deep'
  const sub = light ? 'text-gold' : 'text-emerald'
  return (
    <span className="inline-flex items-center gap-2.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Mark size={size} tone={light ? 'dark' : 'light'} />
      {lang === 'ar' ? (
        <span className="flex flex-col items-center leading-none">
          <span className={`text-[1.45rem] font-bold ${name}`} style={{ fontFamily: 'Tajawal, sans-serif' }}>إميرالد</span>
          <span className={`mt-0.5 text-[0.72rem] font-medium ${sub}`} style={{ fontFamily: 'Tajawal, sans-serif' }}>لطب الأسنان</span>
        </span>
      ) : (
        <span className="flex flex-col items-center leading-none">
          <span className={`text-[1.7rem] tracking-[0.08em] ${name}`} style={{ fontFamily: 'Italiana, serif', fontWeight: 400, WebkitTextStroke: '0.6px currentColor' }}>EMERALD</span>
          <span className={`mt-1 ps-[0.5em] text-[0.62rem] tracking-[0.5em] ${sub}`} style={{ fontFamily: 'Jost, sans-serif', fontWeight: 500 }}>DENTAL CLINIC</span>
        </span>
      )}
    </span>
  )
}
