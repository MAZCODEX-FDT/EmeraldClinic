import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { content, type Content } from '@/content/site'

export type Lang = 'en' | 'ar'
export type Bi = { en: string; ar: string }

type Ctx = { lang: Lang; dir: 'ltr' | 'rtl'; t: Content; setLang: (l: Lang) => void; toggle: () => void; pick: (b: Bi) => string }
const LangCtx = createContext<Ctx | null>(null)

const KEY = 'emerald.lang'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    try { return (localStorage.getItem(KEY) as Lang) || 'ar' } catch { return 'ar' }
  })
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    try { localStorage.setItem(KEY, lang) } catch { /* private mode */ }
  }, [lang, dir])
  const value: Ctx = {
    lang, dir, t: content[lang], setLang,
    toggle: () => setLang(lang === 'ar' ? 'en' : 'ar'),
    pick: (b) => b[lang],
  }
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang outside provider')
  return c
}

/** Inline bilingual helper: L('English', 'عربي') */
export function useL() {
  const { lang } = useLang()
  return (en: string, ar: string) => (lang === 'ar' ? ar : en)
}
