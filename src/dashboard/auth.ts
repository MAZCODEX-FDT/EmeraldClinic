// Demo-only auth. Replace with a real backend (e.g. Laravel/Supabase) before production.
const KEY = 'emerald.session'
export const DEMO = { email: 'admin@emeralddental.eg', password: 'emerald2026' }
export const auth = {
  isIn: () => { try { return sessionStorage.getItem(KEY) === '1' } catch { return false } },
  login: (email: string, password: string) => {
    const ok = email.trim().toLowerCase() === DEMO.email && password === DEMO.password
    if (ok) try { sessionStorage.setItem(KEY, '1') } catch { /* ignore */ }
    return ok
  },
  logout: () => { try { sessionStorage.removeItem(KEY) } catch { /* ignore */ } },
}
