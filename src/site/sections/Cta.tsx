import { Link } from 'react-router-dom'
import { ArrowUpRight, MessageCircle } from 'lucide-react'
import ShinyText from '@/components/reactbits/ShinyText'
import { useLang } from '@/lib/i18n'
import { useDB } from '@/lib/store'

export function Cta() {
  const { t, lang } = useLang()
  const wa = useDB((d) => d.settings.whatsapp)
  return (
    <section className="bg-ivory px-6 pb-24">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-jade/50 px-8 py-20 text-center md:py-28">
        <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-ivory/60 blur-3xl" />
        <div className="relative">
          <h2 className="font-display text-4xl font-semibold tracking-[-0.02em] text-deep md:text-7xl">
            <ShinyText key={lang} text={t.cta.title} color="#0E4D3C" shineColor="#1F7A5C" speed={3.5} />
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-charcoal/70">{t.cta.sub}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/book" className="group inline-flex items-center gap-3 rounded-full bg-deep py-4 ps-7 pe-4 font-medium text-ivory transition-colors hover:bg-emerald">
              {t.cta.btn}<span className="grid size-9 place-items-center rounded-full bg-ivory text-deep transition-transform group-hover:rotate-45"><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
            </Link>
            <a href={`https://wa.me/${wa.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-deep/20 px-7 py-4 font-medium text-deep transition-colors hover:bg-white">
              <MessageCircle className="size-4" />{t.cta.wa}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
