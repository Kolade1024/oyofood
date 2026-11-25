import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, CircleCheck, Eye, EyeOff, FileBadge, IdCard, LoaderCircle, MapPin, Utensils, X } from 'lucide-react'
import { AuthLayout } from '../../components/AuthLayout'
import { Select } from '../../components/Select'
import { BrandBadge, Button, Checkbox, Field, IconButton, Input, Overlay, PhoneInput, Textarea } from '../../components/ui'
import { GoogleButton } from '../auth/GoogleButton'
import { Divider } from '../auth/Welcome'
import { useApp } from '../../context/AppContext'
import type { SignupDraft } from '../../context/AppContext'
import { banks, nigerianStates, restaurantTypes } from '../../data/mock'
import { cx } from '../../lib/format'

/* ============================================================================
 * Flow: one question per screen, grouped into the 4 segments of the progress bar.
 * `check` returns an error message when the answer is not acceptable.
 * ========================================================================== */

interface Step {
  id: string
  section: 1 | 2 | 3 | 4
  check?: (d: SignupDraft) => string | undefined
}

const emailError = (d: SignupDraft) => (/^\S+@\S+\.\S+$/.test(d.email) ? undefined : 'Enter a valid email address')

const steps: Step[] = [
  { id: 'state', section: 1, check: (d) => (d.state ? undefined : 'Select your state') },
  { id: 'email', section: 1, check: emailError },
  { id: 'verify-email', section: 1, check: (d) => (d.verifiedEmail && d.verifiedEmail === d.email ? undefined : 'Enter the code we sent you') },
  { id: 'name', section: 1, check: (d) => (d.ownerName.trim().split(/\s+/).length < 2 ? "Enter the owner's first and last name" : undefined) },
  { id: 'phone', section: 1, check: (d) => (d.phone.replace(/\D/g, '').length < 10 ? 'Enter a valid Nigerian phone number' : undefined) },
  { id: 'password', section: 1, check: (d) => (d.password.length < 8 ? 'Password must be at least 8 characters' : undefined) },

  { id: 'restaurant', section: 2, check: (d) => (d.restaurantName.trim().length < 2 ? 'Enter your restaurant name' : undefined) },
  { id: 'type', section: 2, check: (d) => (d.restaurantType ? undefined : 'Select a restaurant type') },
  { id: 'cuisine', section: 2, check: (d) => (d.cuisine.trim() ? undefined : 'Enter at least one cuisine') },
  { id: 'restaurant-phone', section: 2 },
  { id: 'about', section: 2 },
  { id: 'logo', section: 2 },

  { id: 'lga', section: 3, check: (d) => (d.lga ? undefined : 'Select your LGA') },
  { id: 'street', section: 3, check: (d) => (d.street.trim().length < 5 ? 'Enter your street address' : undefined) },
  { id: 'landmark', section: 3 },
  { id: 'map', section: 3 },

  { id: 'cac', section: 4, check: (d) => (d.cacFile ? undefined : 'Upload your CAC certificate') },
  { id: 'id', section: 4, check: (d) => (d.idFile ? undefined : 'Upload a government-issued ID') },
  { id: 'permit', section: 4 },
  { id: 'bank', section: 4, check: (d) => (!d.bank ? 'Select your bank' : d.accountNumber.length !== 10 ? 'Enter a 10-digit NUBAN' : undefined) },
  { id: 'consent', section: 4, check: (d) => (d.agreeTerms && d.agreeKyc ? undefined : 'Please accept both agreements to continue') },
]

/** /signup/1 to /signup/4 still work: they open the first question of that section. */
const legacy: Record<string, string> = { '1': 'state', '2': 'restaurant', '3': 'lga', '4': 'cac' }

const path = (id: string) => `/signup/${id}`

export default function Signup() {
  const { step: raw = '' } = useParams()
  const nav = useNavigate()
  const { draft } = useApp()

  const index = steps.findIndex((s) => s.id === raw)
  if (index < 0) return <Navigate to={path(legacy[raw] ?? 'state')} replace />

  // A question can only be opened once everything required before it is answered.
  const gap = steps.findIndex((s) => s.check?.(draft))
  if (gap >= 0 && gap < index) return <Navigate to={path(steps[gap].id)} replace />

  const back = () => nav(index === 0 ? '/' : path(steps[index - 1].id))
  const next = () => nav(path(steps[Math.min(index + 1, steps.length - 1)].id))

  return (
    <AuthLayout
      progress={<Progress index={index} />}
      header={
        <>
          <IconButton label={index === 0 ? 'Close' : 'Back'} size="sm" className="text-ink" onClick={back}>
            {index === 0 ? <X size={18} /> : <ArrowLeft size={18} />}
          </IconButton>
          <span className="text-sm font-medium">Get Started</span>
        </>
      }
    >
      <div key={raw} className="mx-auto w-full max-w-[360px] animate-fade-in pb-8 sm:pt-[9vh]">
        <Screen step={steps[index]} next={next} />
      </div>
    </AuthLayout>
  )
}

function Progress({ index }: { index: number }) {
  return (
    <div role="progressbar" aria-label={`Question ${index + 1} of ${steps.length}`} aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={steps.length} className="flex gap-1">
      {[1, 2, 3, 4].map((section) => {
        const ids = steps.map((s, i) => (s.section === section ? i : -1)).filter((i) => i >= 0)
        const done = ids.filter((i) => i <= index).length / ids.length
        return (
          <span key={section} className="h-[3px] flex-1 overflow-hidden rounded-full bg-line">
            <span className="block h-full origin-left rounded-full bg-brand transition-transform duration-300 ease-snappy" style={{ transform: `scaleX(${done})` }} />
          </span>
        )
      })}
    </div>
  )
}

/* ============================================================================
 * Building blocks
 * ========================================================================== */

function Question({
  title,
  description,
  onSubmit,
  ready = true,
  loading,
  submitLabel = 'Continue',
  onSkip,
  before,
  after,
  children,
}: {
  title: string
  description?: ReactNode
  onSubmit: () => void
  ready?: boolean
  loading?: boolean
  submitLabel?: string
  onSkip?: () => void
  before?: ReactNode
  after?: ReactNode
  children: ReactNode
}) {
  return (
    <form
      noValidate
      onSubmit={(e: FormEvent) => {
        e.preventDefault()
        if (ready && !loading) onSubmit()
      }}
    >
      <h1 className="text-[22px] font-semibold leading-7 tracking-tight">{title}</h1>
      {description && <p className="mt-1 break-words text-[13px] leading-5 text-muted">{description}</p>}
      {before}
      <div className="mt-6">{children}</div>
      <Button
        type="submit"
        disabled={!ready}
        loading={loading}
        className={cx('mt-5 h-11 w-full', !loading && 'disabled:bg-hover disabled:text-muted disabled:opacity-100')}
      >
        {submitLabel}
      </Button>
      {onSkip && (
        <Button variant="ghost" className="mt-2 h-11 w-full text-muted" onClick={onSkip}>
          Skip for now
        </Button>
      )}
      {after}
    </form>
  )
}

function SignInLink() {
  return (
    <p className="mt-10 text-center text-[13px] text-muted">
      Got an account?{' '}
      <Link to="/login" className="font-medium text-brand-fg hover:underline">
        Sign in
      </Link>
    </p>
  )
}

function Screen({ step, next }: { step: Step; next: () => void }) {
  const { draft, updateDraft } = useApp()
  const [error, setError] = useState<string>()

  const set = (patch: Partial<SignupDraft>) => {
    updateDraft(patch)
    setError(undefined)
  }
  const submit = () => {
    const e = step.check?.(draft)
    setError(e)
    if (!e) next()
  }
  const props = { draft, set, error, submit, next }

  switch (step.id) {
    case 'state':
      return <StateQuestion {...props} />
    case 'email':
      return <EmailQuestion {...props} />
    case 'verify-email':
      return <VerifyEmail next={next} />
    case 'name':
      return (
        <Question title="What's your name?" description="The owner's name, as it appears on their ID" onSubmit={submit} ready={!!draft.ownerName.trim()}>
          <Field label="Full name" error={error}>
            <Input autoFocus autoComplete="name" className="h-12" placeholder="e.g. Babatunde Adeleke" value={draft.ownerName} invalid={!!error} onChange={(e) => set({ ownerName: e.target.value })} />
          </Field>
        </Question>
      )
    case 'phone':
      return (
        <Question title="What's your phone number?" description="We call this number about your account" onSubmit={submit} ready={!!draft.phone}>
          <Field label="Phone number" error={error}>
            <PhoneInput value={draft.phone} invalid={!!error} onChange={(phone) => set({ phone })} />
          </Field>
        </Question>
      )
    case 'password':
      return <PasswordQuestion {...props} />
    case 'restaurant':
      return (
        <Question title="What's your restaurant called?" description="Customers see this name in the app" onSubmit={submit} ready={!!draft.restaurantName.trim()}>
          <Field label="Restaurant name" error={error}>
            <Input autoFocus autoComplete="organization" className="h-12" placeholder="e.g. Bukka Hut Kitchen" value={draft.restaurantName} invalid={!!error} onChange={(e) => set({ restaurantName: e.target.value })} />
          </Field>
        </Question>
      )
    case 'type':
      return (
        <Question title="What type of restaurant is it?" onSubmit={submit} ready={!!draft.restaurantType}>
          <Field label="Restaurant type" error={error}>
            <Select className="h-12" placeholder="Select type" value={draft.restaurantType} options={restaurantTypes} onChange={(restaurantType) => set({ restaurantType })} />
          </Field>
        </Question>
      )
    case 'cuisine':
      return (
        <Question title="What food do you serve?" onSubmit={submit} ready={!!draft.cuisine.trim()}>
          <Field label="Cuisine" error={error}>
            <Input autoFocus className="h-12" placeholder="e.g. Nigerian, Continental" value={draft.cuisine} invalid={!!error} onChange={(e) => set({ cuisine: e.target.value })} />
          </Field>
        </Question>
      )
    case 'restaurant-phone':
      return (
        <Question title="Does the restaurant have its own phone?" onSubmit={submit} ready={!!draft.restaurantPhone} onSkip={next}>
          <Field label="Restaurant phone number">
            <PhoneInput placeholder="800 000 0000" value={draft.restaurantPhone} onChange={(restaurantPhone) => set({ restaurantPhone })} />
          </Field>
        </Question>
      )
    case 'about':
      return (
        <Question title="How would you describe your restaurant?" onSubmit={submit} ready={!!draft.description.trim()} onSkip={next}>
          <Field label="Description" aside={<span className="tabular-nums">{draft.description.length}/500</span>}>
            <Textarea autoFocus rows={4} maxLength={500} placeholder="Tell customers about your restaurant" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </Question>
      )
    case 'logo':
      return <LogoQuestion {...props} />
    case 'lga':
      return (
        <Question title="Which local government are you in?" description={`In ${draft.state} state`} onSubmit={submit} ready={!!draft.lga}>
          <Field label="Local Government Area" error={error}>
            <Select searchable className="h-12" placeholder="Select LGA" value={draft.lga} options={nigerianStates[draft.state] ?? []} onChange={(lga) => set({ lga })} />
          </Field>
        </Question>
      )
    case 'street':
      return (
        <Question title="What's your street address?" description="Riders collect orders from here" onSubmit={submit} ready={!!draft.street.trim()}>
          <Field label="Street address" error={error}>
            <Input autoFocus autoComplete="street-address" className="h-12" placeholder="Enter street address" value={draft.street} invalid={!!error} onChange={(e) => set({ street: e.target.value })} />
          </Field>
        </Question>
      )
    case 'landmark':
      return (
        <Question title="Is there a landmark nearby?" onSubmit={submit} ready={!!draft.landmark.trim()} onSkip={next}>
          <Field label="Landmark">
            <Input autoFocus className="h-12" placeholder="e.g. Near Oyo State Secretariat" value={draft.landmark} onChange={(e) => set({ landmark: e.target.value })} />
          </Field>
        </Question>
      )
    case 'map':
      return (
        <Question title="Pin your location" description="Tap the map where riders should arrive" onSubmit={submit} ready={draft.pinned} onSkip={draft.pinned ? undefined : next}>
          <MapPicker pinned={draft.pinned} onPin={() => set({ pinned: true })} />
        </Question>
      )
    case 'cac':
      return (
        <Question title="Upload your CAC certificate" description="Your business registration, BN or RC" onSubmit={submit} ready={!!draft.cacFile}>
          <UploadBox icon={<FileBadge size={20} />} title="CAC certificate" hint="PDF or JPG, max 5MB" accept=".pdf,image/jpeg" file={draft.cacFile} error={error} onFile={(cacFile) => set({ cacFile })} />
        </Question>
      )
    case 'id':
      return (
        <Question title="Upload a government-issued ID" description="NIN, voter's card or passport" onSubmit={submit} ready={!!draft.idFile}>
          <UploadBox icon={<IdCard size={20} />} title="Identity document" hint="Clear front and back, JPG or PNG" accept="image/png,image/jpeg" file={draft.idFile} error={error} onFile={(idFile) => set({ idFile })} />
        </Question>
      )
    case 'permit':
      return (
        <Question title="Do you have a food safety permit?" description="Or a hygiene certificate from your local council" onSubmit={submit} ready={!!draft.permitFile} onSkip={next}>
          <UploadBox icon={<Utensils size={20} />} title="Food handler permit" hint="Optional" accept=".pdf,image/png,image/jpeg" file={draft.permitFile} onFile={(permitFile) => set({ permitFile })} />
        </Question>
      )
    case 'bank':
      return <BankQuestion {...props} />
    default:
      return <ConsentQuestion {...props} />
  }
}

interface QProps {
  draft: SignupDraft
  set: (patch: Partial<SignupDraft>) => void
  error?: string
  submit: () => void
  next: () => void
}

/* ============================================================================
 * Section 1: account
 * ========================================================================== */

function StateQuestion({ draft, set, error, next }: QProps) {
  const [confirm, setConfirm] = useState(false)
  return (
    <>
      <Question
        title="What state is your restaurant in?"
        description="Tell us where you cook and take orders"
        onSubmit={() => setConfirm(true)}
        ready={!!draft.state}
        after={
          <>
            <p className="mx-auto mt-6 max-w-[270px] text-center text-[13px] leading-[18px] text-gray-700">
              By continuing, you agree to our{' '}
              <a href="#" className="text-brand-fg underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-brand-fg underline">
                Privacy Policy
              </a>
            </p>
            <SignInLink />
          </>
        }
      >
        <Field label="State" error={error}>
          <Select
            searchable
            className="h-12"
            placeholder="Select state"
            value={draft.state}
            options={Object.keys(nigerianStates)}
            onChange={(state) => set(state === draft.state ? { state } : { state, lga: '' })}
          />
        </Field>
      </Question>

      <Overlay open={confirm} onClose={() => setConfirm(false)} labelledBy="confirm-id" className="w-full max-w-[360px] rounded-2xl border border-transparent bg-white p-3.5 text-center shadow-overlay">
        <IdIllustration />
        <h2 id="confirm-id" className="mx-auto mt-5 max-w-[230px] text-[22px] leading-[26px] tracking-tight">
          Confirm you have a <span className="font-semibold">valid Nigerian ID</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[270px] text-sm leading-[22px] text-gray-700">You will also need your CAC certificate to verify the restaurant.</p>
        <Button className="mt-7 h-11 w-full" onClick={next}>
          Yes, I have a valid ID
        </Button>
        <Button variant="secondary" className="mt-2 h-11 w-full" onClick={() => setConfirm(false)}>
          Go back
        </Button>
      </Overlay>
    </>
  )
}

function IdIllustration() {
  const line = 'block h-1.5 bg-black/10'
  return (
    <div aria-hidden className="relative mx-auto mt-4 h-[162px] w-[256px] rounded-lg border border-line-strong bg-gradient-to-br from-[#e9ebee] to-[#f6f7f8] p-4 text-left shadow-[0_2px_8px_oklch(0_0_0/0.06)]">
      <span className="block h-2.5 w-[144px] bg-black/10" />
      <span className="mt-1.5 block h-1.5 w-16 bg-black/10" />
      <span className="absolute left-4 top-11 h-20 w-[70px] rounded-sm bg-black/[0.07]" />
      <span className="absolute right-3 top-2.5 flex h-10 w-10 overflow-hidden rounded-full ring-1 ring-black/5">
        <span className="flex-1 bg-[#008751]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#008751]" />
      </span>
      <span className="absolute left-[100px] top-[52px] space-y-1.5 text-[6px] font-medium uppercase leading-none text-gray-600">
        {['Surname', 'First name', 'Date of birth', 'NIN'].map((l, i) => (
          <span key={l} className="block space-y-1">
            <span className="block">{l}</span>
            <span className={line} style={{ width: [34, 54, 44, 72][i] }} />
          </span>
        ))}
      </span>
      <span className="absolute bottom-3 right-3 opacity-90">
        <BrandBadge size={24} />
      </span>
    </div>
  )
}

function EmailQuestion({ draft, set, error, submit }: QProps) {
  const nav = useNavigate()
  const { login } = useApp()
  return (
    <Question
      title="Let's get you started!"
      onSubmit={submit}
      ready={!!draft.email}
      before={
        <>
          <div className="mt-6">
            <GoogleButton
              label="Sign up with Google"
              onClick={() => {
                login()
                nav('/dashboard')
              }}
            />
          </div>
          <Divider label="Or continue with" />
        </>
      }
      after={<SignInLink />}
    >
      <Field label="Email address" error={error}>
        <Input type="email" autoComplete="email" className="h-12" placeholder="Enter your email address" value={draft.email} invalid={!!error} onChange={(e) => set({ email: e.target.value })} />
      </Field>
    </Question>
  )
}

/** Demo only: there is no mail service yet, so every account uses this code. */
const DEMO_CODE = '123456'

function VerifyEmail({ next }: { next: () => void }) {
  const { draft, updateDraft, notify } = useApp()
  const [code, setCodeState] = useState('')
  const codeRef = useRef('') // read by handlers that can run before the next render
  const setCode = (v: string) => {
    codeRef.current = v
    setCodeState(v)
  }
  const [wrong, setWrong] = useState(false)
  const [seconds, setSeconds] = useState(60)
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    boxes.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const verify = (value: string) => {
    if (value !== DEMO_CODE) {
      setWrong(true)
      return
    }
    updateDraft({ verifiedEmail: draft.email })
    next()
  }

  /* Digits always fill left to right, so the code is one string shown across six boxes. */
  const write = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, '')
    setWrong(false)
    if (!digits) return
    const now = codeRef.current
    const value = (now.slice(0, i) + digits + now.slice(i + digits.length)).slice(0, 6)
    setCode(value)
    boxes.current[Math.min(i + digits.length, 5, value.length)]?.focus()
    if (value.length === 6) verify(value)
  }

  return (
    <Question
      title="Verify your email"
      description={
        <>
          Enter the 6-digit code sent to <span className="font-medium text-ink">{draft.email}</span>
        </>
      }
      onSubmit={() => verify(code)}
      ready={code.length === 6}
      after={
        <p className="mt-8 text-[13px] leading-[18px] text-gray-700">
          Didn't get the email? Check your spam or promotions folder, or{' '}
          <button
            type="button"
            disabled={seconds > 0}
            onClick={() => {
              setSeconds(60)
              notify('Code resent to ' + draft.email)
            }}
            className="font-medium tabular-nums text-brand-fg hover:underline disabled:text-muted disabled:no-underline"
          >
            resend code{seconds > 0 && ` (${seconds}s)`}
          </button>
        </p>
      }
    >
      <div role="group" aria-label="6-digit code" className={cx('grid grid-cols-6 gap-2', wrong && 'animate-shake')}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <input
            key={i}
            ref={(el) => {
              boxes.current[i] = el
            }}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={wrong || undefined}
            value={code[i] ?? ''}
            onFocus={(e) => {
              const filled = codeRef.current.length
              if (i > filled) boxes.current[filled]?.focus()
              else e.target.select()
            }}
            onChange={(e) => write(i, e.target.value)}
            onPaste={(e) => {
              e.preventDefault()
              write(0, e.clipboardData.getData('text'))
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                e.preventDefault()
                setWrong(false)
                const now = codeRef.current
                const at = now[i] ? i : i - 1
                if (at < 0) return
                setCode(now.slice(0, at) + now.slice(at + 1))
                boxes.current[at]?.focus()
              } else if (e.key === 'ArrowLeft') {
                e.preventDefault()
                boxes.current[i - 1]?.focus()
              } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                boxes.current[i + 1]?.focus()
              }
            }}
            className="h-14 w-full min-w-0 rounded-lg border border-field bg-white text-center text-xl font-medium tabular-nums outline-none transition-[border-color,box-shadow] duration-150 focus:border-ink focus:ring-4 focus:ring-brand/15 aria-invalid:border-bad-fg"
          />
        ))}
      </div>
      <p role={wrong ? 'alert' : undefined} className={cx('mt-2 text-xs', wrong ? 'font-medium text-bad-fg' : 'text-muted')}>
        {wrong ? 'That code is not right. Check the email and try again.' : `Demo code: ${DEMO_CODE}`}
      </p>
    </Question>
  )
}

function PasswordQuestion({ draft, set, error, submit }: QProps) {
  const [show, setShow] = useState(false)
  return (
    <Question title="Create a password" description="Use at least 8 characters" onSubmit={submit} ready={!!draft.password}>
      <Field label="Password" error={error}>
        <Input
          autoFocus
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          className="h-12"
          placeholder="Enter your password"
          value={draft.password}
          invalid={!!error}
          onChange={(e) => set({ password: e.target.value })}
          right={
            <button type="button" className="flex p-1 text-ink" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      </Field>
    </Question>
  )
}

/* ============================================================================
 * Section 2: restaurant
 * ========================================================================== */

function LogoQuestion({ draft, set, submit, next }: QProps) {
  const { notify } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  const onLogo = (f?: File) => {
    if (!f) return
    if (f.size > 2 * 1024 * 1024) return notify('Logo must be 2MB or smaller', 'bad')
    set({ logo: URL.createObjectURL(f) })
  }

  return (
    <Question title="Add your restaurant logo" onSubmit={submit} ready={!!draft.logo} onSkip={next}>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
      {draft.logo ? (
        <div className="flex items-center gap-4 rounded-lg border border-line p-4">
          <img src={draft.logo} alt="Logo preview" className="h-16 w-16 rounded-lg object-cover outline-1 -outline-offset-1 outline-black/10" />
          <div className="flex-1 text-sm">
            <p className="font-medium">Logo uploaded</p>
            <button type="button" className="text-[13px] font-medium text-brand-fg hover:underline" onClick={() => fileRef.current?.click()}>
              Replace
            </button>
          </div>
          <IconButton label="Remove logo" size="sm" variant="dangerGhost" onClick={() => set({ logo: undefined })}>
            <X size={16} />
          </IconButton>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-canvas text-center transition-colors hover:border-muted"
        >
          <Camera size={22} className="text-muted" />
          <span className="mt-2 text-[13px] font-medium">Upload a logo</span>
          <span className="text-xs text-muted">JPG or PNG, max 2MB</span>
        </button>
      )}
    </Question>
  )
}

/* ============================================================================
 * Section 3: address
 * ========================================================================== */

function MapPicker({ pinned, onPin }: { pinned: boolean; onPin: () => void }) {
  const [pos, setPos] = useState({ x: 50, y: 48 })
  return (
    <div
      className="relative h-[248px] cursor-crosshair overflow-hidden rounded-xl border border-line bg-[#e6efe8]"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        onPin()
      }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 570 248" preserveAspectRatio="none" aria-hidden>
        <path d="M0 70 C120 90 200 60 300 70 S 420 120 400 125" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M165 0 L 270 135" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M245 175 C 320 120 420 95 500 60" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M460 0 L 410 145" stroke="#fff" strokeWidth="4" fill="none" />
        <rect x="40" y="140" width="90" height="60" rx="8" fill="#d6e6d9" />
        <rect x="430" y="160" width="100" height="56" rx="8" fill="#d6e6d9" />
      </svg>
      <MapPin
        size={28}
        className="absolute -translate-x-1/2 -translate-y-full fill-red-500 text-white drop-shadow transition-all"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      />
      <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-semibold shadow">
        {pinned ? <CircleCheck size={14} className="text-ok" /> : <MapPin size={14} className="text-emerald-800" />}
        {pinned ? 'Location pinned' : 'Select on map'}
      </span>
    </div>
  )
}

/* ============================================================================
 * Section 4: verification
 * ========================================================================== */

function UploadBox({
  icon,
  title,
  hint,
  file,
  onFile,
  accept,
  error,
}: {
  icon: ReactNode
  title: string
  hint: string
  file?: string
  onFile: (name?: string) => void
  accept: string
  error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input ref={ref} type="file" hidden accept={accept} onChange={(e) => onFile(e.target.files?.[0]?.name)} />
      <div
        className={cx(
          'flex items-center gap-4 rounded-xl border border-dashed p-4',
          file ? 'border-emerald-300 bg-ok-50/60' : error ? 'border-bad bg-red-50/40' : 'border-gray-300 bg-gray-50/60',
        )}
      >
        <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-white', file ? 'text-ok' : 'text-brand')}>
          {file ? <CircleCheck size={20} /> : icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{file ?? title}</p>
          <p className="text-xs text-gray-500">{file ? 'Uploaded, ready for review' : hint}</p>
        </div>
        {file ? (
          <button type="button" onClick={() => onFile(undefined)} className="p-1 text-gray-400 hover:text-bad" aria-label="Remove file">
            <X size={16} />
          </button>
        ) : (
          <Button type="button" variant="secondary" size="sm" onClick={() => ref.current?.click()}>
            Browse
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-bad-fg">
          {error}
        </p>
      )}
    </div>
  )
}

function BankQuestion({ draft, set, error, submit }: QProps) {
  const [verifying, setVerifying] = useState(false)
  const [verifiedName, setVerifiedName] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const verifyAccount = (bank: string, acct: string) => {
    clearTimeout(timer.current)
    setVerifiedName('')
    setVerifying(false)
    if (bank && acct.length === 10) {
      setVerifying(true)
      timer.current = setTimeout(() => {
        setVerifying(false)
        setVerifiedName((draft.restaurantName || 'Bukka Hut Kitchen').toUpperCase() + ' NIG LTD')
      }, 900)
    }
  }

  return (
    <Question title="Where should we pay you?" description="Payouts go to this bank account" onSubmit={submit} ready={!!draft.bank && !!draft.accountNumber}>
      <div className="space-y-4">
        <Field label="Bank">
          <Select
            searchable
            className="h-12"
            placeholder="Select bank"
            value={draft.bank}
            options={banks}
            onChange={(bank) => {
              set({ bank })
              verifyAccount(bank, draft.accountNumber)
            }}
          />
        </Field>
        <Field label="Account number" error={error}>
          <Input
            inputMode="numeric"
            maxLength={10}
            className="h-12 tabular-nums"
            placeholder="10-digit NUBAN"
            value={draft.accountNumber}
            invalid={!!error}
            onChange={(e) => {
              const accountNumber = e.target.value.replace(/\D/g, '').slice(0, 10)
              set({ accountNumber })
              verifyAccount(draft.bank, accountNumber)
            }}
          />
        </Field>
      </div>
      {(verifying || verifiedName) && (
        <p role="status" className={cx('mt-4 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px]', verifiedName ? 'bg-ok-50 text-ok-fg' : 'bg-canvas text-muted')}>
          {verifying ? <LoaderCircle size={16} className="shrink-0 animate-spin" /> : <CircleCheck size={16} className="shrink-0" />}
          {verifying ? 'Verifying account with NIBSS…' : verifiedName}
        </p>
      )}
    </Question>
  )
}

function ConsentQuestion({ draft, set, error }: QProps) {
  const nav = useNavigate()
  const { notify, login, resetDraft } = useApp()
  const [submitting, setSubmitting] = useState(false)
  const done = useRef(false)

  // Clear the draft after leaving: clearing it earlier would trip the "unanswered question" guard.
  useEffect(
    () => () => {
      if (done.current) resetDraft()
    },
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const submit = () => {
    setSubmitting(true)
    setTimeout(() => {
      login()
      notify('Submitted! Your account will be verified within 24 hours.')
      done.current = true
      nav('/dashboard')
    }, 900)
  }

  return (
    <Question
      title="One last thing"
      description="Approval usually takes under 24 hours"
      onSubmit={submit}
      ready={draft.agreeTerms && draft.agreeKyc}
      loading={submitting}
      submitLabel="Submit for verification"
    >
      <div className="space-y-4">
        <Checkbox checked={draft.agreeTerms} onChange={(agreeTerms) => set({ agreeTerms })}>
          I agree to the OYO Food Merchant Terms and Conditions, including the standard commission agreement and service level expectations.
        </Checkbox>
        <Checkbox checked={draft.agreeKyc} onChange={(agreeKyc) => set({ agreeKyc })}>
          I consent to the collection and verification of business KYC information in accordance with the Privacy Policy.
        </Checkbox>
        {error && <p className="text-xs font-medium text-bad-fg">{error}</p>}
      </div>
    </Question>
  )
}
