import { useNavigate } from 'react-router-dom'
import { AuthLayout } from '../../components/AuthLayout'
import { Button } from '../../components/ui'
import { GoogleButton } from './GoogleButton'
import { useApp } from '../../context/AppContext'

const copy = {
  en: {
    title: 'Welcome to OYO Food',
    lead: 'Register your restaurant or log in to manage your kitchen',
    signup: 'Create an account',
    login: 'Login',
    or: 'Or continue with',
    google: 'Continue with Google',
  },
  yo: {
    title: 'Ẹ káàbọ̀ sí OYO Food',
    lead: 'Forúkọ ilé oúnjẹ rẹ sílẹ̀ tàbí wọlé láti ṣàkóso ilé ìdáná rẹ',
    signup: 'Ṣẹ̀dá àkáǹtì',
    login: 'Wọlé',
    or: 'Tàbí tẹ̀síwájú pẹ̀lú',
    google: 'Tẹ̀síwájú pẹ̀lú Google',
  },
}

export default function Welcome() {
  const nav = useNavigate()
  const { lang, login } = useApp()
  const t = copy[lang]

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[360px] animate-fade-in pb-8 sm:pt-[12vh]">
        <h1 className="text-[22px] font-semibold leading-7 tracking-tight">{t.title}</h1>
        <p className="mt-1 text-[13px] leading-5 text-gray-700">{t.lead}</p>

        <Button className="mt-8 h-11 w-full" onClick={() => nav('/signup')}>
          {t.signup}
        </Button>
        <Button variant="secondary" className="mt-2 h-11 w-full" onClick={() => nav('/login')}>
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

        <p className="mx-auto mt-8 max-w-[270px] text-center text-[13px] leading-[18px] text-gray-700">
          By continuing, you agree to our{' '}
          <a href="#" className="text-brand-fg underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-brand-fg underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-7 flex items-center gap-3.5 text-xs text-muted">
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
