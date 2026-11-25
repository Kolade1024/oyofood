import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { AuthLayout, HeroCard, SecureNote } from '../../components/AuthLayout'
import { Button, Field, Input } from '../../components/ui'
import { GoogleButton } from './GoogleButton'
import { Divider, LegalFooter } from './Welcome'
import { useApp } from '../../context/AppContext'
import { cx } from '../../lib/format'

export default function Login() {
  const nav = useNavigate()
  const { login, notify } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
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
    <AuthLayout
      pill={
        <>
          Merchant Portal
        </>
      }
      eyebrow="Vendor access"
      title="Welcome Back!"
      lead="Log in to your restaurant account and continue managing your business, kitchen orders, and daily payouts."
      panel={<HeroCard />}
      footerLeft={<SecureNote>Encrypted 256-bit secure session</SecureNote>}
      footerRight="Help: 0800-OYO-FOOD"
    >
      <div className="flex items-center justify-between text-xs text-muted">
        <Link to="/" className="hover:text-ink">
          Back to Welcome
        </Link>
        <span className="flex items-center gap-1.5">
          Server Status: Operational
        </span>
      </div>

      <form onSubmit={submit} className="mx-auto my-auto w-full max-w-[448px] py-10" noValidate>
        <h2 className="font-display text-[34px] font-extrabold tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-[15px] leading-6 text-muted">Log in to your OYO Food vendor account to manage your restaurant and orders.</p>

        <Field label={<span className="text-base font-semibold text-ink">Email Address</span>} required error={errors.email} className="mt-8">
          <Input
            type="email"
            autoComplete="email"
            icon={<Mail size={18} />}
            placeholder="babatunde@bukkahut.ng"
            className="h-12"
            value={email}
            invalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          label={<span className="text-base font-semibold text-ink">Password</span>}
          required
          error={errors.password}
          className="mt-6"
          aside={
            <Link to="/forgot-password" className="text-xs font-semibold text-ink hover:text-brand">
              Forgot Password?
            </Link>
          }
        >
          <Input
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            icon={<Lock size={18} />}
            placeholder="Enter your password"
            className="h-12"
            value={password}
            invalid={!!errors.password}
            onChange={(e) => setPassword(e.target.value)}
            right={
              <button type="button" onClick={() => setShow((s) => !s)} className="p-1 text-gray-500" aria-label="Toggle password">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </Field>

        <button type="button" onClick={() => setRemember((r) => !r)} className="mt-4 flex items-center gap-2 text-[13px] text-gray-700">
          <span className={cx('flex h-4 w-4 items-center justify-center rounded', remember ? 'bg-ink text-white' : 'border border-gray-400')}>
            {remember && <Check size={11} strokeWidth={3} />}
          </span>
          Remember me for 30 days
        </button>

        <Button type="submit" size="lg" className="mt-8 w-full rounded-full" disabled={loading} iconRight={<ArrowRight size={18} />}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>

        <Divider label="Or continue with" />
        <GoogleButton
          bold
          label="Log in with Google"
          onClick={() => {
            login()
            nav('/dashboard')
          }}
        />

        <p className="mt-8 text-center text-[13px] text-gray-600">
          Don't have a vendor account?{' '}
          <Link to="/signup/1" className="font-semibold text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </form>

      <LegalFooter />
    </AuthLayout>
  )
}
