import { Link } from 'react-router-dom'
import { Phone, MapPin, Clock, MessageCircle, Mail } from 'lucide-react'
import { Logo, Mark } from '@/components/brand/Logo'
import { BackgroundPaths } from '@/components/ui21/BackgroundPaths'
import { useLang } from '@/lib/i18n'
import { useDB, mainBranch } from '@/lib/store'

const Instagram = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" /></svg>
)
const Facebook = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H9.2v3h2.5V21" /></svg>
)

export function Footer() {
  const { t, l } = useLang()
  const b = useDB(mainBranch)
  const s = useDB((d) => d.settings)
  return (
    <footer id="contact" className="glow-bg grain relative overflow-hidden text-ivory">
      <BackgroundPaths color="#BFE3D3" className="opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-10">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light size={44} />
            <p className="mt-6 max-w-xs text-ivory/70">{t.footer.tag}</p>
            <Link to="/book" className="mt-8 inline-flex rounded-full bg-ivory px-6 py-3 text-sm font-medium text-deep transition-colors hover:bg-jade">{t.nav.book}</Link>
          </div>
          <div>
            <p className="eyebrow text-jade">{t.footer.visit}</p>
            <a href={b.map_url} target="_blank" rel="noreferrer" className="mt-4 flex items-start gap-2 text-ivory/80 hover:text-ivory"><MapPin className="mt-0.5 size-4 shrink-0 text-jade" />{l(b, 'address')}</a>
            <p className="eyebrow mt-8 text-jade">{t.footer.hours}</p>
            <p className="mt-4 flex items-start gap-2 text-ivory/80"><Clock className="mt-0.5 size-4 shrink-0 text-jade" />{l(b, 'hours')}</p>
          </div>
          <div>
            <p className="eyebrow text-jade">{t.footer.contact}</p>
            <ul className="mt-4 space-y-3 text-ivory/80">
              <li><a href={`tel:${b.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-ivory" dir="ltr"><Phone className="size-4 text-jade" />{b.phone}</a></li>
              <li><a href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-ivory"><MessageCircle className="size-4 text-jade" />WhatsApp</a></li>
              <li><a href={`mailto:${b.email}`} className="flex items-center gap-2 hover:text-ivory"><Mail className="size-4 text-jade" />{b.email}</a></li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-jade">{t.footer.follow}</p>
            <div className="mt-4 flex gap-3">
              <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid size-11 place-items-center rounded-full border border-ivory/20 transition-colors hover:bg-ivory hover:text-deep"><Instagram className="size-4" /></a>
              <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid size-11 place-items-center rounded-full border border-ivory/20 transition-colors hover:bg-ivory hover:text-deep"><Facebook className="size-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-24 flex items-end justify-between gap-6 overflow-hidden">
          <p className="font-display select-none text-[18vw] leading-[0.8] font-bold tracking-[0.06em] text-ivory/[0.06] md:text-[13vw]" aria-hidden>{t.brand.name.toUpperCase()}</p>
          <Mark size={96} tooth="#BFE3D3" smile="#F7F4EE" className="mb-4 hidden shrink-0 opacity-30 md:block" />
        </div>
        <div className="mt-6 flex flex-col justify-between gap-3 border-t border-ivory/10 pt-6 text-xs text-ivory/50 md:flex-row">
          <p>© {new Date().getFullYear()} Emerald Dental Clinic. {t.footer.rights}</p>
          <div className="flex gap-6"><Link to="/dashboard" className="hover:text-ivory">{t.nav.dashboard}</Link><span>{t.footer.made}</span></div>
        </div>
      </div>
    </footer>
  )
}
