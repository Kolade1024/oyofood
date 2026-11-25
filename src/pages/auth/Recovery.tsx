import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleCheck, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { Button, Field, Input } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cx } from '../../lib/format'

const submitClass = 'mt-5 h-11 w-full disabled:bg-hover disabled:text-muted disabled:opacity-100'
const linkClass = 'font-medium text-brand-fg hover:underline'

/** Shared frame: title, one line of help, then the form. */
function Panel({ title, description, children }: { title: string; description: ReactNode; children: ReactNode }) {
  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[360px] animate-fade-in pb-8 sm:pt-[12vh]">
        <h1 className="text-[22px] font-semibold leading-7 tracking-tight">{title}</h1>
        <p className="mt-1 break-words text-[13px] leading-5 text-gray-700">{description}</p>
        {children}
      </div>
    </AuthLayout>
  )
}

function FootNote({ children }: { children: ReactNode }) {
  return <p className="mt-10 text-center text-[13px] text-muted">{children}</p>
}

/* ---------------- Forgot password ---------------- */

export function ForgotPassword() {
  const nav = useNavigate()
  const { setResetEmail } = useApp()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address')
    setResetEmail(email)
    nav('/check-email')
  }

  return (
    <Panel title="Reset your password" description="Enter your email address to get a link to reset your password">
      <form onSubmit={submit} noValidate className="mt-8">
        <Field label="Email address" error={error}>
          <Input
            type="email"
            autoComplete="email"
            className="h-12"
            placeholder="Enter your email address"
            value={email}
            invalid={!!error}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
          />
        </Field>
        <Button type="submit" disabled={!email} className={submitClass}>
          Send password reset link
        </Button>
      </form>
      <FootNote>
        Remembered your password?{' '}
        <Link to="/login" className={linkClass}>
          Login
        </Link>
      </FootNote>
    </Panel>
  )
}

/* ---------------- Check your email ---------------- */

export function CheckEmail() {
  const nav = useNavigate()
  const { resetEmail, notify } = useApp()
  const [seconds, setSeconds] = useState(60)

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  return (
    <Panel
      title="Check your email"
      description={
        <>
          We sent a password reset link to <span className="font-medium text-ink">{resetEmail}</span>. It expires after 15 minutes.
        </>
      }
    >
      <Button className="mt-8 h-11 w-full" onClick={() => nav('/reset-password')}>
        Open reset link (demo)
      </Button>
      <p className="mt-8 text-[13px] leading-[18px] text-gray-700">
        Didn't get the email? Check your spam or promotions folder, or{' '}
        <button
          type="button"
          disabled={seconds > 0}
          onClick={() => {
            setSeconds(60)
            notify('Reset link resent to ' + resetEmail)
          }}
          className={cx(linkClass, 'tabular-nums disabled:text-muted disabled:no-underline')}
        >
          resend link{seconds > 0 && ` (${seconds}s)`}
        </button>
      </p>
      <FootNote>
        Wrong email address?{' '}
        <Link to="/forgot-password" className={linkClass}>
          Change email
        </Link>
      </FootNote>
    </Panel>
  )
}

/* ---------------- New password ---------------- */

const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number (0-9)', test: (p: string) => /\d/.test(p) },
  { label: 'One special symbol (@$!#)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export function ResetPassword() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState({ a: false, b: false })
  const [touched, setTouched] = useState(false)

  const allOk = rules.every((r) => r.test(pw))
  const match = pw === confirm && confirm.length > 0

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (allOk && match) nav('/reset-success')
  }

  const eye = (k: 'a' | 'b') => (
    <button type="button" onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))} className="flex p-1 text-ink" aria-label={show[k] ? 'Hide password' : 'Show password'}>
      {show[k] ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  )

  return (
    <Panel title="Create a new password" description="It must be different from passwords you used before">
      <form onSubmit={submit} noValidate className="mt-8">
        <Field label="New password" error={touched && !allOk ? 'Your password must meet every rule below' : undefined}>
          <Input
            type={show.a ? 'text' : 'password'}
            autoComplete="new-password"
            className="h-12"
            placeholder="Enter your new password"
            value={pw}
            invalid={touched && !allOk}
            onChange={(e) => setPw(e.target.value)}
            right={eye('a')}
          />
        </Field>
        <ul className="mt-3 grid gap-x-3 gap-y-1.5 sm:grid-cols-2" aria-label="Password rules">
          {rules.map((r) => {
            const ok = r.test(pw)
            return (
              <li key={r.label} className={cx('flex items-center gap-1.5 text-xs transition-colors duration-150', ok ? 'text-ok-fg' : 'text-muted')}>
                <CircleCheck size={14} className="shrink-0" /> {r.label}
                {ok && <span className="sr-only">, met</span>}
              </li>
            )
          })}
        </ul>
        <Field label="Confirm new password" className="mt-6" error={touched && !match ? 'Passwords do not match' : undefined}>
          <Input
            type={show.b ? 'text' : 'password'}
            autoComplete="new-password"
            className="h-12"
            placeholder="Enter it again"
            value={confirm}
            invalid={touched && !match}
            onChange={(e) => setConfirm(e.target.value)}
            right={eye('b')}
          />
        </Field>
        <Button type="submit" disabled={!pw || !confirm} className={submitClass}>
          Reset password
        </Button>
      </form>
      <FootNote>
        Remembered your password?{' '}
        <Link to="/login" className={linkClass}>
          Login
        </Link>
      </FootNote>
    </Panel>
  )
}

/* ---------------- Success ---------------- */

export function ResetSuccess() {
  const nav = useNavigate()
  return (
    <Panel title="Password updated" description="For security, all previous sessions have been logged out. Log in with your new password.">
      <Button className="mt-8 h-11 w-full" onClick={() => nav('/login')}>
        Login
      </Button>
      <FootNote>
        Need help?{' '}
        <a href="mailto:support@oyofood.ng" className={linkClass}>
          Contact support
        </a>
      </FootNote>
    </Panel>
  )
}
