import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  initialMeals,
  initialOrders,
  initialPromotions,
  initialReviews,
  initialSchedule,
} from '../data/mock'
import type { Meal, Order, OrderStatus, Promotion, Review } from '../data/mock'

export type Lang = 'en' | 'yo'

export interface SignupDraft {
  ownerName: string
  restaurantName: string
  email: string
  /** The address the 6-digit code was entered for. */
  verifiedEmail: string
  phone: string
  password: string
  restaurantType: string
  cuisine: string
  restaurantPhone: string
  description: string
  logo?: string
  state: string
  lga: string
  street: string
  landmark: string
  pinned: boolean
  cacFile?: string
  idFile?: string
  permitFile?: string
  bank: string
  accountNumber: string
  agreeTerms: boolean
  agreeKyc: boolean
}

const emptyDraft: SignupDraft = {
  ownerName: '',
  restaurantName: '',
  email: '',
  verifiedEmail: '',
  phone: '',
  password: '',
  restaurantType: '',
  cuisine: '',
  restaurantPhone: '',
  description: '',
  state: '',
  lga: '',
  street: '',
  landmark: '',
  pinned: false,
  bank: '',
  accountNumber: '',
  agreeTerms: false,
  agreeKyc: false,
}

interface Toast {
  id: number
  message: string
  tone: 'ok' | 'bad' | 'info'
}

interface AppState {
  lang: Lang
  setLang: (l: Lang) => void
  storeOpen: boolean
  setStoreOpen: (v: boolean) => void
  authed: boolean
  login: () => void
  logout: () => void
  resetEmail: string
  setResetEmail: (e: string) => void

  draft: SignupDraft
  updateDraft: (patch: Partial<SignupDraft>) => void
  resetDraft: () => void

  orders: Order[]
  setOrderStatus: (id: string, status: OrderStatus, extra?: Partial<Order>) => void

  meals: Meal[]
  toggleMeal: (id: string) => void
  addMeal: (meal: Meal) => void
  updateMeal: (meal: Meal) => void
  deleteMeal: (id: string) => void

  reviews: Review[]
  replyToReview: (id: string, text: string) => void

  promotions: Promotion[]
  addPromotion: (p: Promotion) => void
  togglePromotion: (id: string) => void

  schedule: typeof initialSchedule
  setSchedule: (s: typeof initialSchedule) => void

  toasts: Toast[]
  notify: (message: string, tone?: Toast['tone']) => void
  dismiss: (id: number) => void
}

const Ctx = createContext<AppState | null>(null)

let toastId = 0

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [storeOpen, setStoreOpen] = useState(true)
  const [authed, setAuthed] = useState(true)
  const [resetEmail, setResetEmail] = useState('babatunde@bukkahut.ng')
  const [draft, setDraft] = useState<SignupDraft>(emptyDraft)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions)
  const [schedule, setSchedule] = useState(initialSchedule)
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, tone: Toast['tone'] = 'ok') => {
    const id = ++toastId
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      storeOpen,
      setStoreOpen,
      authed,
      login: () => setAuthed(true),
      logout: () => setAuthed(false),
      resetEmail,
      setResetEmail,
      draft,
      updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
      resetDraft: () => setDraft(emptyDraft),
      orders,
      setOrderStatus: (id, status, extra) =>
        setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...extra, status } : o))),
      meals,
      toggleMeal: (id) =>
        setMeals((ms) => ms.map((m) => (m.id === id ? { ...m, available: !m.available } : m))),
      addMeal: (meal) => setMeals((ms) => [...ms, meal]),
      updateMeal: (meal) => setMeals((ms) => ms.map((m) => (m.id === meal.id ? meal : m))),
      deleteMeal: (id) => setMeals((ms) => ms.filter((m) => m.id !== id)),
      reviews,
      replyToReview: (id, text) =>
        setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, reply: { text, when: 'Just now' } } : r))),
      promotions,
      addPromotion: (p) => setPromotions((ps) => [p, ...ps]),
      togglePromotion: (id) =>
        setPromotions((ps) =>
          ps.map((p) =>
            p.id === id
              ? { ...p, status: p.status === 'active' ? 'scheduled' : p.status === 'scheduled' ? 'active' : p.status }
              : p,
          ),
        ),
      schedule,
      setSchedule,
      toasts,
      notify,
      dismiss,
    }),
    [lang, storeOpen, authed, resetEmail, draft, orders, meals, reviews, promotions, schedule, toasts, notify, dismiss],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp must be used inside AppProvider')
  return v
}
