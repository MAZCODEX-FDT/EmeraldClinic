export function SectionHead({ eyebrow, title, light = false, center = false, children }: { eyebrow: string; title: string; light?: boolean; center?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${center ? 'items-center text-center md:flex-col md:items-center' : ''}`}>
      <div className={center ? 'max-w-3xl' : 'max-w-2xl'}>
        <p className={`eyebrow ${light ? 'text-jade' : 'text-emerald'}`}>{eyebrow}</p>
        <h2 data-split className={`font-display mt-4 text-4xl leading-[1.05] font-semibold tracking-[-0.02em] md:text-6xl ${light ? 'text-ivory' : 'text-deep'}`}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
