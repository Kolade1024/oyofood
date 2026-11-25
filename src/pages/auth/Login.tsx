import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { Button, Field, Input } from '../../components/ui'
import { GoogleButton } from './GoogleButton'
import { Divider } from './Welcome'
import { useApp } from '../../context/AppContext'

const copy = {
  en: {
    title: 'Welcome back!',
    google: 'Sign in with Google',
    or: 'Or continue with',
    email: 'Email address',
    emailHint: 'Enter your email address',
    password: 'Password',
    passwordHint: 'Enter your password',
    forgot: 'Forgot password?',
    submit: 'Login',
    newUser: 'Are you a new user?',
    create: 'Create an account',
  },
  yo: {
    title: 'Ẹ káàbọ̀ padà!',
    google: 'Tẹ̀síwájú pẹ̀lú Google',
    or: 'Tàbí tẹ̀síwájú pẹ̀lú',
    email: 'Àdírẹ́ẹ̀sì ímeèlì',
    emailHint: 'Tẹ àdírẹ́ẹ̀sì ímeèlì rẹ',
    password: 'Ọ̀rọ̀ aṣínà',
    passwordHint: 'Tẹ ọ̀rọ̀ aṣínà rẹ',
    forgot: 'Ṣé o gbàgbé ọ̀rọ̀ aṣínà?',
    submit: 'Wọlé',
    newUser: 'Ṣé ẹni tuntun ni ọ́?',
    create: 'Ṣẹ̀dá àkáǹtì',
  },
}

export default function Login() {
  const nav = useNavigate()
  const { lang, login, notify } = useApp()
  const t = copy[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address'
    if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    setTimeout(() => {
      login()
      notify('Welcome back, Babatunde!')
      nav('/dashboard')
    }, 600)
  }

  return (
    <AuthLayout>
      <form onSubmit={submit} className="mx-auto w-full max-w-[360px]" noValidate>
        <h1 className="text-[22px] font-semibold tracking-tight">{t.title}</h1>

        <div className="mt-7">
          <GoogleButton
            label={t.google}
            onClick={() => {
              login()
              nav('/dashboard')
            }}
          />
        </div>
        <Divider label={t.or} />

        <Field label={t.email} error={errors.email}>
          <Input
            type="email"
            autoComplete="email"
            placeholder={t.emailHint}
            className="h-12"
            value={email}
            invalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label={t.password} error={errors.password} className="mt-6">
          <Input
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t.passwordHint}
            className="h-12"
            value={password}
            invalid={!!errors.password}
            onChange={(e) => setPassword(e.target.value)}
            right={
              <button type="button" onClick={() => setShow((s) => !s)} className="flex p-1 text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </Field>
        <Link to="/forgot-password" className="mt-3 inline-block text-[13px] font-medium text-brand-fg hover:underline">
          {t.forgot}
        </Link>

        <Button
          type="submit"
          loading={loading}
          disabled={!email || !password}
          className="mt-6 h-11 w-full disabled:bg-hover disabled:text-muted disabled:opacity-100"
        >
          {t.submit}
        </Button>

        <p className="mt-9 text-center text-[13px] text-muted">
          {t.newUser}{' '}
          <Link to="/signup/1" className="font-medium text-brand-fg hover:underline">
            {t.create}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
