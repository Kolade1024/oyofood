import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock,
  Eye,
  EyeOff,
  Lock,
  LockKeyhole,
  Mail,
  MailCheck,
  RotateCcwKey,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { AuthLayout, InfoPanel } from '../../components/AuthLayout'
import { Button, Field, Input } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { cx } from '../../lib/format'

function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-[13px] text-gray-600 hover:text-ink">
      <ArrowLeft size={16} /> {children}
    </Link>
  )
}

function IconTile({ children, tone = 'brand', size = 'md' }: { children: ReactNode; tone?: 'brand' | 'ok'; size?: 'md' | 'lg' }) {
  return (
    <div
      className={cx(
        'flex items-center justify-center rounded-2xl border',
        size === 'lg' ? 'h-20 w-20' : 'h-14 w-14',
        tone === 'ok' ? 'border-emerald-200 bg-ok-50 text-ok' : 'border-brand-100 bg-brand-50 text-brand',
      )}
    >
      {children}
    </div>
  )
}

/* ---------------- Forgot Password ---------------- */

export function ForgotPassword() {
  const nav = useNavigate()
  const { resetEmail, setResetEmail } = useApp()
  const [email, setEmail] = useState(resetEmail)
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter your registered email address')
    setResetEmail(email)
    nav('/check-email')
  }

  return (
    <AuthLayout
      pill={
        <>
          <ShieldCheck size={14} className="text-ok" /> Account Security
        </>
      }
      eyebrow="Vendor recovery"
      title="Forgot Your Password?"
      lead="No worries! Enter your registered vendor email and we will send you a secure verification link to reset your account credentials."
      panel={<InfoPanel icon={<ShieldCheck size={22} className="text-ok" />} title="2-Step Verified Recovery" text="Your restaurant financial wallet remains protected" />}
      footerLeft="Need emergency kitchen support? Call 0800-OYO-FOOD"
      footerRight="Secure KYC Link"
    >
      <BackLink to="/login">Back to Login</BackLink>
      <form onSubmit={submit} noValidate className="mx-auto my-auto w-full max-w-[448px] py-10">
        <IconTile>
          <RotateCcwKey size={24} />
        </IconTile>
        <h2 className="mt-8 font-display text-[34px] font-extrabold tracking-tight">Forgot Password?</h2>
        <p className="mt-2 text-[15px] leading-6 text-muted">Enter your registered email address and we'll send you a password reset link.</p>
        <Field
          label={<span className="text-base font-semibold text-ink">Email Address</span>}
          required
          error={error}
          hint="We'll send an authenticated password reset link to this inbox."
          className="mt-8"
        >
          <Input
            type="email"
            icon={<Mail size={18} />}
            className="h-12"
            value={email}
            invalid={!!error}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
          />
        </Field>
        <Button type="submit" size="lg" className="mt-6 w-full rounded-full" iconRight={<Send size={18} />}>
          Send Reset Link
        </Button>
        <Link to="/login" className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm font-semibold text-brand hover:underline">
          <ArrowLeft size={16} /> Return to Login
        </Link>
      </form>
      <p className="border-t border-line pt-6 text-center text-xs text-gray-600">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-brand">
          Log in now
        </Link>
      </p>
    </AuthLayout>
  )
}

/* ---------------- Check Your Email ---------------- */

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
    <AuthLayout
      pill={
        <>
          <MailCheck size={14} className="text-ok" /> Verification Sent
        </>
      }
      eyebrow="Email dispatched"
      title="Check Your Email"
      lead="We've sent password reset instructions to your inbox. Follow the link inside to set up your new secure password."
      panel={<InfoPanel icon={<Clock size={22} />} title="15-Minute Expiration" text="For your restaurant security, reset links expire after 15 minutes." />}
      footerLeft="Didn't receive an email? Check your spam folder."
    >
      <BackLink to="/login">Back to Login</BackLink>
      <div className="mx-auto my-auto flex w-full max-w-[448px] flex-col items-center py-10 text-center">
        <IconTile size="lg">
          <MailCheck size={30} />
        </IconTile>
        <h2 className="mt-6 font-display text-[34px] font-extrabold tracking-tight">Check Your Email</h2>
        <p className="mt-2 text-[15px] text-muted">We have sent a password reset link to:</p>
        <span className="mt-3 rounded-xl border border-line bg-gray-50 px-4 py-2 text-sm font-semibold">{resetEmail}</span>
        <p className="mt-5 text-xs leading-5 text-muted">
          Click the link in the email to choose a new password. If you don't see it, check your spam or promotions folder.
        </p>
        <Button size="lg" className="mt-8 w-full rounded-full" iconRight={<ArrowRight size={18} />} onClick={() => nav('/reset-password')}>
          Open Reset Link (Simulate Click)
        </Button>
        <Button variant="outline" size="lg" className="mt-3 w-full rounded-full border-2" onClick={() => nav('/login')}>
          Back to Login
        </Button>
        <p className="mt-8 text-[13px] text-gray-600">
          Didn't receive the email?{' '}
          <button
            disabled={seconds > 0}
            onClick={() => {
              setSeconds(60)
              notify('Reset link resent to ' + resetEmail)
            }}
            className="font-semibold text-brand disabled:opacity-70"
          >
            {seconds > 0 ? `Click to resend (${seconds}s)` : 'Click to resend'}
          </button>
        </p>
      </div>
      <p className="border-t border-line pt-6 text-center text-xs text-gray-600">
        Wrong email address?{' '}
        <Link to="/forgot-password" className="font-semibold text-brand">
          Change email
        </Link>
      </p>
    </AuthLayout>
  )
}

/* ---------------- Reset Password ---------------- */

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
    <button type="button" onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))} className="p-1 text-gray-500" aria-label="Toggle visibility">
      {show[k] ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  )

  return (
    <AuthLayout
      pill={
        <>
          <LockKeyhole size={14} className="text-ok" /> Set New Password
        </>
      }
      eyebrow="Credentials update"
      title="Create New Password"
      lead="Your new password must be different from previous used passwords to keep your kitchen orders and banking payouts secure."
      panel={
        <InfoPanel
          icon={<CircleCheck size={22} className="text-ok" />}
          title="Password Protection"
          text="Once saved, you'll be logged in and can resume kitchen dispatch immediately."
        />
      }
      footerLeft="Session Protected • 256-bit encryption"
    >
      <BackLink to="/login">Cancel &amp; Return to Login</BackLink>
      <form onSubmit={submit} noValidate className="mx-auto my-auto w-full max-w-[448px] py-10">
        <IconTile>
          <span className="text-lg font-bold leading-none tracking-widest">***</span>
        </IconTile>
        <h2 className="mt-8 font-display text-[34px] font-extrabold tracking-tight">Reset Password</h2>
        <p className="mt-2 text-[15px] text-muted">Please enter and confirm your new password below.</p>

        <Field label={<span className="text-base font-semibold text-ink">New Password</span>} required className="mt-8">
          <Input type={show.a ? 'text' : 'password'} icon={<Lock size={18} />} className="h-12" value={pw} onChange={(e) => setPw(e.target.value)} right={eye('a')} />
        </Field>
        <Field
          label={<span className="text-base font-semibold text-ink">Confirm New Password</span>}
          required
          className="mt-6"
          error={touched && !match ? 'Passwords do not match' : undefined}
        >
          <Input
            type={show.b ? 'text' : 'password'}
            icon={<Lock size={18} />}
            className="h-12"
            value={confirm}
            invalid={touched && !match}
            onChange={(e) => setConfirm(e.target.value)}
            right={eye('b')}
          />
        </Field>

        <div className="mt-6 rounded-xl border border-line bg-gray-50 p-4">
          <p className="text-xs font-semibold">Password Requirements:</p>
          <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {rules.map((r) => {
              const ok = r.test(pw)
              return (
                <li key={r.label} className={cx('flex items-center gap-2 text-xs', ok ? 'text-ok' : 'text-gray-500')}>
                  <CircleCheck size={14} /> {r.label}
                </li>
              )
            })}
          </ul>
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full rounded-full" disabled={touched && (!allOk || !match)} iconRight={<Check size={18} />}>
          Reset Password
        </Button>
      </form>
      <p className="border-t border-line pt-6 text-center text-xs text-gray-500">
        Security alert: Never share your OYO vendor credentials with third-party delivery riders.
      </p>
    </AuthLayout>
  )
}

/* ---------------- Success ---------------- */

export function ResetSuccess() {
  const nav = useNavigate()
  return (
    <AuthLayout
      pill={
        <>
          <ShieldCheck size={14} className="text-ok" /> Security Confirmed
        </>
      }
      eyebrow="Update complete"
      title="Account Ready!"
      lead="Your restaurant credentials have been successfully updated. You can now log into your kitchen dashboard."
      panel={<InfoPanel tone="ok" icon={<Lock size={22} />} title="Password Updated" text="All previous sessions have been logged out for security." />}
      footerLeft="Instant Login Support: support@oyofood.ng"
    >
      <div className="mx-auto my-auto flex w-full max-w-[448px] flex-col items-center py-10 text-center">
        <IconTile tone="ok" size="lg">
          <CircleCheck size={36} />
        </IconTile>
        <h2 className="mt-6 font-display text-[32px] font-extrabold tracking-tight">Password Reset Successful</h2>
        <p className="mt-3 text-[15px] leading-6 text-muted">
          Your password has been updated successfully. You can now use your new password to sign into your OYO Food vendor portal.
        </p>
        <div className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-gray-50 py-3.5 text-[13px]">
          <ShieldCheck size={16} className="text-brand" /> Your restaurant account is active and verified
        </div>
        <Button size="lg" className="mt-12 w-full rounded-full" iconRight={<ArrowRight size={18} />} onClick={() => nav('/login')}>
          Continue to Login
        </Button>
      </div>
      <p className="border-t border-line pt-6 text-center text-xs text-gray-600">
        Need assistance?{' '}
        <a href="mailto:support@oyofood.ng" className="font-semibold text-brand">
          Contact Vendor Support
        </a>
      </p>
    </AuthLayout>
  )
}
