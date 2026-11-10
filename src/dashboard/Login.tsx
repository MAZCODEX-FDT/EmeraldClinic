import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo, Mark } from '@/components/brand/Logo'
import { BackgroundPaths } from '@/components/ui21/BackgroundPaths'
import { useLang } from '@/lib/i18n'
import { auth, DEMO } from './auth'
import { useTr, inputCls } from './ui'

export default function Login() {
  const nav = useNavigate()
  const tr = useTr()
  const { toggle, t } = useLang()
  const [email, setEmail] = useState(DEMO.email)
  const [pw, setPw] = useState(DEMO.password)
  const [err, setErr] = useState(false)
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="glow-bg grain relative hidden overflow-hidden p-12 text-ivory lg:flex lg:flex-col lg:justify-between">
        <BackgroundPaths className="opacity-70" />
        <Logo light size={40} />
        <div className="relative">
          <Mark size={120} tooth="#BFE3D3" smile="#F7F4EE" />
          <p className="font-display mt-10 max-w-md text-4xl leading-tight font-semibold">{tr('Every plan, every chair, every smile — in one calm place.', 'كل خطة، كل كرسي، كل ابتسامة — في مكان واحد هادي.')}</p>
        </div>
        <p className="relative text-xs text-ivory/50">Emerald Clinic OS · MAZCODEX</p>
      </div>
      <div className="flex flex-col bg-ivory p-6 md:p-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm text-emerald hover:text-deep">← {t.nav.home}</Link>
          <button onClick={toggle} className="text-sm text-emerald">{t.nav.lang}</button>
        </div>
        <form className="m-auto w-full max-w-sm" onSubmit={(e) => { e.preventDefault(); if (auth.login(email, pw)) nav('/dashboard'); else setErr(true) }}>
          <div className="lg:hidden"><Logo size={36} /></div>
          <h1 className="font-display mt-10 text-4xl font-semibold text-deep lg:mt-0">{tr('Welcome back', 'أهلًا بيك')}</h1>
          <p className="mt-2 text-sm text-stone">{tr('Sign in to the clinic dashboard.', 'سجّل دخول للوحة تحكم العيادة.')}</p>
          <div className="mt-8 space-y-4">
            <input className={inputCls + ' !py-3.5'} value={email} onChange={(e) => { setEmail(e.target.value); setErr(false) }} type="email" placeholder="Email" dir="ltr" aria-label="Email" />
            <input className={inputCls + ' !py-3.5'} value={pw} onChange={(e) => { setPw(e.target.value); setErr(false) }} type="password" placeholder="Password" dir="ltr" aria-label="Password" />
          </div>
          {err && <p className="mt-3 text-sm text-charcoal">{tr('Email or password is not correct.', 'الإيميل أو الباسورد مش صح.')}</p>}
          <button className="group mt-6 flex w-full items-center justify-between rounded-full bg-deep py-3 ps-6 pe-3 font-medium text-ivory transition-colors hover:bg-emerald">
            {tr('Sign in', 'دخول')}<span className="grid size-9 place-items-center rounded-full bg-ivory text-deep transition-transform group-hover:rotate-45"><ArrowUpRight className="size-4 rtl:-scale-x-100" /></span>
          </button>
          <p className="mt-6 rounded-xl bg-jade/40 p-3 text-xs text-deep">{tr('Demo access is pre-filled. Connect a real backend before going live.', 'بيانات الديمو مكتوبة جاهزة. لازم نربط Backend حقيقي قبل الإطلاق.')}</p>
        </form>
      </div>
    </div>
  )
}
