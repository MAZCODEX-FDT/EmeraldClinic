import { useMemo } from 'react'
import { Star, Quote } from 'lucide-react'
import { DisplayCards } from '@/components/ui21/DisplayCards'
import AnimatedContent from '@/components/reactbits/AnimatedContent'
import { useLang } from '@/lib/i18n'
import { useDB } from '@/lib/store'
import { SectionHead } from './ServicesBento'

export function Reviews() {
  const { t, lang, pick } = useLang()
  const reviews = useDB((d) => d.reviews)
  const services = useDB((d) => d.services)
  const visible = useMemo(() => reviews.filter((r) => r.visible), [reviews])
  const mine = useMemo(() => [...visible.filter((r) => r.lang === lang), ...visible.filter((r) => r.lang !== lang)], [visible, lang])
  const svc = (id?: string) => { const s = services.find((x) => x.id === id); return s ? pick(s.name) : '' }

  return (
    <section id="reviews" className="overflow-hidden bg-cloud px-6 py-28 md:py-36">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHead eyebrow={t.reviews.eyebrow} title={t.reviews.title} />
          <AnimatedContent stagger={0.1} distance={40} className="mt-10 space-y-4">
            {mine.slice(3, 6).map((r) => (
              <figure key={r.id} className="rounded-2xl border border-deep/10 bg-white/70 p-5" dir={r.lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex gap-0.5 text-emerald">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}</div>
                <blockquote className="mt-2 leading-relaxed text-charcoal/85">{r.text}</blockquote>
                <figcaption className="mt-2 text-xs text-stone">{r.name} · {svc(r.serviceId)}</figcaption>
              </figure>
            ))}
          </AnimatedContent>
        </div>
        <div className="flex justify-center py-10 pe-24 md:pe-32 lg:py-0">
          <DisplayCards
            cards={mine.slice(0, 3).map((r) => ({
              icon: <Quote className="size-4" />,
              title: <span dir={r.lang === 'ar' ? 'rtl' : 'ltr'}>{r.name}</span>,
              description: <span dir={r.lang === 'ar' ? 'rtl' : 'ltr'} className="block">{r.text}</span>,
              date: svc(r.serviceId),
            }))}
          />
        </div>
      </div>
    </section>
  )
}
