import { useNavigate } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Globe } from 'lucide-react'
import { AuthLayout, HeroCard } from '../../components/AuthLayout'
import { Button } from '../../components/ui'
import { GoogleButton } from './GoogleButton'
import { useApp } from '../../context/AppContext'
import type { Lang } from '../../context/AppContext'
import { cx } from '../../lib/format'

const copy = {
  en: {
    title: 'Welcome to OYO FOOD',
    lead: 'Choose your preferred language to get started with your restaurant registration or log in to manage your kitchen.',
    select: 'Select Your Language',
    signup: 'Sign Up',
    login: 'Log in',
    or: 'Or continue with',
    google: 'Continue with Google',
    selected: 'Selected: English',
  },
  yo: {
    title: 'Ẹ káàbọ̀ sí OYO FOOD',
    lead: 'Yan èdè tí o fẹ́ láti bẹ̀rẹ̀ ìforúkọsílẹ̀ ilé oúnjẹ rẹ tàbí wọlé láti ṣàkóso ilé ìdáná rẹ.',
    select: 'Yan Èdè Rẹ',
    signup: 'Forúkọ Sílẹ̀',
    login: 'Wọlé',
    or: 'Tàbí tẹ̀síwájú pẹ̀lú',
    google: 'Tẹ̀síwájú pẹ̀lú Google',
    selected: 'Àṣàyàn: Yorùbá',
  },
}

const langs: { id: Lang; name: string; sub: string; code: string }[] = [
  { id: 'en', name: 'English', sub: 'Default dialect', code: 'EN' },
  { id: 'yo', name: 'Yoruba', sub: 'Èdè Yorùbá', code: 'YO' },
]

export default function Welcome() {
  const nav = useNavigate()
  const { lang, setLang, login } = useApp()
  const t = copy[lang]

  return (
    <AuthLayout
      eyebrow="The #1 food vendor platform"
      title="Join OYO Food"
      lead="Register your restaurant and start receiving orders from thousands of hungry customers across Nigeria."
      panel={<HeroCard />}
      footerLeft={
        <>
          <BadgeCheck size={16} /> Zero onboarding fee • Fast 24hr KYC verification
        </>
      }
      footerRight={<span className="flex gap-4">Lagos <span>•</span> Ibadan <span>•</span> Abuja</span>}
    >
      <div className="flex justify-end text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Globe size={14} /> {t.selected}
        </span>
      </div>

      <div className="mx-auto my-auto w-full max-w-[448px] py-10">
        <h2 className="font-display text-[32px] font-extrabold tracking-tight text-ink">{t.title}</h2>
        <p className="mt-3 text-[15px] leading-6 text-muted">{t.lead}</p>

        <p className="mt-10 text-[15px] font-semibold">{t.select}</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {langs.map((l) => {
            const active = lang === l.id
            return (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={cx(
                  'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition',
                  active ? 'border-brand bg-brand-50/40' : 'border-line hover:border-gray-300',
                )}
              >
                <span
                  className={cx(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    active ? 'border-brand' : 'border-gray-400',
                  )}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{l.name}</span>
                  <span className="block truncate text-xs text-muted">{l.sub}</span>
                </span>
                <span
                  className={cx(
                    'rounded-md border px-1.5 py-0.5 text-[10px] font-semibold',
                    active ? 'border-brand-100 text-brand' : 'border-gray-200 bg-gray-100 text-gray-500',
                  )}
                >
                  {l.code}
                </span>
              </button>
            )
          })}
        </div>

        <Button size="lg" className="mt-10 w-full" iconRight={<ArrowRight size={18} />} onClick={() => nav('/signup/1')}>
          {t.signup}
        </Button>
        <Button
          variant="outline"
          size="md"
          className="mt-3 w-full border-line"
          iconRight={<ArrowRight size={16} />}
          onClick={() => nav('/login')}
        >
          {t.login}
        </Button>

        <Divider label={t.or} />
        <GoogleButton
          label={t.google}
          onClick={() => {
            login()
            nav('/dashboard')
          }}
        />
      </div>

      <LegalFooter />
    </AuthLayout>
  )
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-8 flex items-center gap-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}

export function LegalFooter() {
  return (
    <p className="border-t border-line pt-6 text-center text-xs text-gray-600">
      By continuing, you agree to OYO Food's <a className="font-medium text-brand hover:underline" href="#">Terms of Service</a> and{' '}
      <a className="font-medium text-brand hover:underline" href="#">Privacy Policy</a>.
    </p>
  )
}
