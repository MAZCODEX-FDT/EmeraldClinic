import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { gsap, useGSAP } from '@/lib/gsap'
import { SectionHead } from './ServicesBento'

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const body = useRef<HTMLDivElement>(null)
  useGSAP(() => {
    gsap.to(body.current, { height: open ? 'auto' : 0, opacity: open ? 1 : 0, duration: 0.6, ease: 'expo.out' })
  }, { dependencies: [open] })
  return (
    <div className="border-b border-deep/10">
      <button onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-6 py-6 text-start">
        <span className="font-display text-lg font-medium text-deep md:text-xl">{q}</span>
        <span className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${open ? 'rotate-45 border-deep bg-deep text-ivory' : 'border-deep/15 text-deep'}`}><Plus className="size-4" /></span>
      </button>
      <div ref={body} className="h-0 overflow-hidden opacity-0"><p className="max-w-2xl pb-6 leading-relaxed text-charcoal/70">{a}</p></div>
    </div>
  )
}

export function Faq() {
  const { t } = useLang()
  const [open, setOpen] = useState(0)
  return (
    <section className="bg-white px-6 py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="self-start lg:sticky lg:top-32"><SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} /></div>
        <div>{t.faq.items.map((f, i) => <Item key={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />)}</div>
      </div>
    </section>
  )
}
