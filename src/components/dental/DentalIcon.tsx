/** Monoline dental icon set, drawn to match the Emerald mark (rounded caps, single stroke). */
const tooth = 'M8.2 3.2C5.9 3.2 4.6 5 4.6 7.2c0 2.6 1.5 4 2 6.6.4 2.2.7 4.9 2 4.9s1.5-3.3 2.2-4.8c.4-.8 1-1.1 1.4-1.1s1 .3 1.4 1.1c.7 1.5.9 4.8 2.2 4.8s1.6-2.7 2-4.9c.5-2.6 2-4 2-6.6 0-2.2-1.3-4-3.6-4-1.9 0-3 1.1-4 1.1s-2.1-1.1-4-1.1Z'

const extra: Record<string, React.ReactNode> = {
  checkup: <><circle cx="17.5" cy="17.5" r="3.2" /><path d="m19.8 19.8 2.2 2.2" /></>,
  filling: <path d="M9.5 7.5c1 .9 2 .9 2.5.9s1.5 0 2.5-.9" />,
  rootcanal: <path d="M9 14.5v4.5M15 14.5v4.5M12 6.5v3" />,
  crown: <path d="M5 6.5 7 3l2.5 2L12 2.5 14.5 5 17 3l2 3.5" />,
  implant: <path d="M10 15h4M10.5 17.5h3M11 20h2" />,
  whitening: <path d="M20 2.5v3M18.5 4h3M3.5 15.5v2.5M2.3 16.8h2.4" />,
  veneer: <path d="M6.5 6.8c2 1.5 9 1.5 11 0" />,
  aligner: <path d="M3.5 9.5c0-3 3-5.5 8.5-5.5s8.5 2.5 8.5 5.5" />,
  kids: <><circle cx="19" cy="4.5" r="1.4" /><path d="M10 9.2c.6.6 1.3.8 2 .8s1.4-.2 2-.8" /></>,
  extraction: <path d="m15.5 16 5 5M20.5 16l-5 5" />,
}

export function DentalIcon({ name, size = 28, className = '', strokeWidth = 1.5 }: { name: string; size?: number; className?: string; strokeWidth?: number }) {
  const isImplant = name === 'implant'
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {isImplant ? (
        <path d="M6.5 4.5c0-1 1-1.6 2-1.6 1.4 0 2.3.8 3.5.8s2.1-.8 3.5-.8c1 0 2 .6 2 1.6 0 2.4-1.3 4.6-2.2 6.3H8.7C7.8 9.1 6.5 6.9 6.5 4.5ZM12 10.8V22" />
      ) : (
        <path d={tooth} />
      )}
      {extra[name]}
    </svg>
  )
}
