import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  CircleCheck,
  EyeOff,
  Eye,
  FileBadge,
  FolderOpen,
  IdCard,
  Landmark,
  LoaderCircle,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Utensils,
  X,
} from 'lucide-react'
import { OnboardingLayout } from '../../components/AuthLayout'
import { Button, Checkbox, Field, Input, PhoneInput, Select, Textarea } from '../../components/ui'
import { GoogleButton } from '../auth/GoogleButton'
import { Divider } from '../auth/Welcome'
import { useApp } from '../../context/AppContext'
import type { SignupDraft } from '../../context/AppContext'
import { banks, nigerianStates, restaurantTypes } from '../../data/mock'
import { cx } from '../../lib/format'

type Errors = Partial<Record<keyof SignupDraft, string>>

function Progress({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        aria-label="Back"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line hover:bg-gray-50"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="flex-1">
        <p className="text-[13px] text-gray-500">Step {step} of 4</p>
        <div className="mt-2 flex max-w-[310px] gap-1">
          {[1, 2, 3, 4].map((i) => (
            <span key={i} className={cx('h-1 flex-1 rounded-full', i <= step ? 'bg-brand' : 'bg-gray-200')} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ContinueButton({ children = 'Continue', icon = <ArrowRight size={18} /> }: { children?: ReactNode; icon?: ReactNode }) {
  return (
    <Button type="submit" size="lg" className="mt-8 w-full" iconRight={icon}>
      {children}
    </Button>
  )
}

export default function Signup() {
  const { step: raw } = useParams()
  const step = Number(raw)
  const nav = useNavigate()
  const back = () => (step === 1 ? nav('/') : nav(`/signup/${step - 1}`))

  if (![1, 2, 3, 4].includes(step)) return <Navigate to="/signup/1" replace />

  return (
    <OnboardingLayout
      badge={
        step === 4 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-4 py-2 text-xs font-medium">
            <ShieldCheck size={14} className="text-ok" /> Verified Merchant Onboarding
          </span>
        )
      }
    >
      <Progress step={step} onBack={back} />
      {step === 1 && <StepAccount />}
      {step === 2 && <StepProfile />}
      {step === 3 && <StepAddress />}
      {step === 4 && <StepVerification />}
    </OnboardingLayout>
  )
}

/* ---------------- Step 1 ---------------- */

function StepAccount() {
  const nav = useNavigate()
  const { draft, updateDraft, login } = useApp()
  const [errors, setErrors] = useState<Errors>({})
  const [show, setShow] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Errors = {}
    if (draft.ownerName.trim().split(/\s+/).length < 2) errs.ownerName = "Enter the owner's first and last name"
    if (draft.restaurantName.trim().length < 2) errs.restaurantName = 'Enter your restaurant name'
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) errs.email = 'Enter a valid email address'
    if (draft.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid Nigerian phone number'
    if (draft.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs)
    if (!Object.keys(errs).length) nav('/signup/2')
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-5">
      <Field label="Owner's full name" error={errors.ownerName}>
        <Input icon={<User size={18} />} placeholder="e.g. Babatunde Adeleke" value={draft.ownerName} invalid={!!errors.ownerName} onChange={(e) => updateDraft({ ownerName: e.target.value })} />
      </Field>
      <Field label="Restaurant name" error={errors.restaurantName}>
        <Input icon={<Utensils size={18} />} placeholder="e.g. Bukka Hut Kitchen" value={draft.restaurantName} invalid={!!errors.restaurantName} onChange={(e) => updateDraft({ restaurantName: e.target.value })} />
      </Field>
      <Field label="Email address" error={errors.email}>
        <Input type="email" icon={<Mail size={18} />} placeholder="name@example.com" value={draft.email} invalid={!!errors.email} onChange={(e) => updateDraft({ email: e.target.value })} />
      </Field>
      <Field label="Phone number" error={errors.phone}>
        <PhoneInput value={draft.phone} invalid={!!errors.phone} onChange={(phone) => updateDraft({ phone })} />
      </Field>
      <Field label="Password" aside="At least 8 characters" error={errors.password}>
        <Input
          type={show ? 'text' : 'password'}
          icon={<Lock size={18} />}
          placeholder="Enter your secret key"
          value={draft.password}
          invalid={!!errors.password}
          onChange={(e) => updateDraft({ password: e.target.value })}
          right={
            <button type="button" className="p-1 text-gray-500" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
              {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          }
        />
      </Field>

      <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-xs text-amber-900">
        <ShieldCheck size={16} className="shrink-0 text-brand" />
        Your information will be used to set up and verify your restaurant account.
      </div>

      <ContinueButton />
      <Divider label="Or continue with" />
      <GoogleButton
        label="Google"
        onClick={() => {
          login()
          nav('/dashboard')
        }}
      />
      <p className="pb-4 text-center text-sm text-gray-700">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand">
          Sign in
        </Link>
      </p>
    </form>
  )
}

/* ---------------- Step 2 ---------------- */

function StepProfile() {
  const nav = useNavigate()
  const { draft, updateDraft, notify } = useApp()
  const [errors, setErrors] = useState<Errors>({})
  const fileRef = useRef<HTMLInputElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Errors = {}
    if (!draft.restaurantType) errs.restaurantType = 'Select a restaurant type'
    if (!draft.cuisine.trim()) errs.cuisine = 'Enter at least one cuisine'
    setErrors(errs)
    if (!Object.keys(errs).length) nav('/signup/3')
  }

  const onLogo = (f?: File) => {
    if (!f) return
    if (f.size > 2 * 1024 * 1024) return notify('Logo must be 2MB or smaller', 'bad')
    updateDraft({ logo: URL.createObjectURL(f) })
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6">
      <h2 className="text-[22px] font-bold">Restaurant Profile</h2>
      <p className="mt-1 text-sm text-gray-500">Tell us more about your restaurant.</p>

      <div className="mt-8 space-y-5">
        <Field label="Restaurant type" required error={errors.restaurantType}>
          <Select value={draft.restaurantType} onChange={(e) => updateDraft({ restaurantType: e.target.value })}>
            <option value="">Select restaurant type</option>
            {restaurantTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </Field>
        <Field label="Cuisine (e.g. Nigerian, Continental, etc.)" required error={errors.cuisine}>
          <Input placeholder="Enter cuisine type" value={draft.cuisine} invalid={!!errors.cuisine} onChange={(e) => updateDraft({ cuisine: e.target.value })} />
        </Field>
        <Field label="Restaurant phone number">
          <PhoneInput placeholder="800 000 0000" value={draft.restaurantPhone} onChange={(restaurantPhone) => updateDraft({ restaurantPhone })} />
        </Field>
        <Field label="Description">
          <div className="relative">
            <Textarea
              maxLength={500}
              placeholder="Tell customers about your restaurant..."
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">{draft.description.length}/500</span>
          </div>
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-gray-700">Upload restaurant logo (optional)</p>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
          {draft.logo ? (
            <div className="flex items-center gap-4 rounded-xl border border-line p-4">
              <img src={draft.logo} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-medium">Logo uploaded</p>
                <button type="button" className="text-xs text-brand" onClick={() => fileRef.current?.click()}>
                  Replace
                </button>
              </div>
              <button type="button" onClick={() => updateDraft({ logo: undefined })} className="p-1 text-gray-400 hover:text-bad" aria-label="Remove logo">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/60 text-center hover:border-brand"
            >
              <Camera size={22} className="text-gray-500" />
              <span className="mt-2 text-xs font-semibold">Tap to upload</span>
              <span className="text-[11px] text-gray-500">JPG, PNG (max 2MB)</span>
            </button>
          )}
        </div>
      </div>
      <ContinueButton />
    </form>
  )
}

/* ---------------- Step 3 ---------------- */

function StepAddress() {
  const nav = useNavigate()
  const { draft, updateDraft } = useApp()
  const [errors, setErrors] = useState<Errors>({})
  const lgas = draft.state ? nigerianStates[draft.state] ?? [] : []

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Errors = {}
    if (!draft.state) errs.state = 'Select your state'
    if (!draft.lga) errs.lga = 'Select your LGA'
    if (draft.street.trim().length < 5) errs.street = 'Enter your street address'
    setErrors(errs)
    if (!Object.keys(errs).length) nav('/signup/4')
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-5">
      <Field label="State" required error={errors.state}>
        <Select value={draft.state} onChange={(e) => updateDraft({ state: e.target.value, lga: '' })}>
          <option value="">Select state</option>
          {Object.keys(nigerianStates).map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </Field>
      <Field label="Local Government Area" required error={errors.lga}>
        <Select value={draft.lga} disabled={!draft.state} onChange={(e) => updateDraft({ lga: e.target.value })}>
          <option value="">{draft.state ? 'Select LGA' : 'Select a state first'}</option>
          {lgas.map((l) => (
            <option key={l}>{l}</option>
          ))}
        </Select>
      </Field>
      <Field label="Street address" required error={errors.street}>
        <Input placeholder="Enter street address" value={draft.street} invalid={!!errors.street} onChange={(e) => updateDraft({ street: e.target.value })} />
      </Field>
      <Field label="Landmark" optional>
        <Input placeholder="e.g. Near Oyo State Secretariat" value={draft.landmark} onChange={(e) => updateDraft({ landmark: e.target.value })} />
      </Field>

      <MapPicker pinned={draft.pinned} onPin={() => updateDraft({ pinned: true })} />
      <ContinueButton />
    </form>
  )
}

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

/* ---------------- Step 4 ---------------- */

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
          <p className="text-xs text-gray-500">{file ? 'Uploaded • ready for review' : hint}</p>
        </div>
        {file ? (
          <button type="button" onClick={() => onFile(undefined)} className="p-1 text-gray-400 hover:text-bad" aria-label="Remove file">
            <X size={16} />
          </button>
        ) : (
          <Button type="button" variant="pill" size="sm" onClick={() => ref.current?.click()}>
            Browse
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  )
}

function StepVerification() {
  const nav = useNavigate()
  const { draft, updateDraft, notify, login, resetDraft } = useApp()
  const [errors, setErrors] = useState<Errors>({})
  const [verifying, setVerifying] = useState(false)
  const [verifiedName, setVerifiedName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const permitRef = useRef<HTMLInputElement>(null)

  const verifyAccount = (bank: string, acct: string) => {
    setVerifiedName('')
    if (bank && acct.length === 10) {
      setVerifying(true)
      setTimeout(() => {
        setVerifying(false)
        setVerifiedName((draft.restaurantName || 'Bukka Hut Kitchen').toUpperCase() + ' NIG LTD')
      }, 900)
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Errors = {}
    if (!draft.cacFile) errs.cacFile = 'Upload your CAC certificate'
    if (!draft.idFile) errs.idFile = 'Upload a government-issued ID'
    if (!draft.bank) errs.bank = 'Select your bank'
    if (draft.accountNumber.length !== 10) errs.accountNumber = 'Enter a 10-digit NUBAN'
    if (!draft.agreeTerms || !draft.agreeKyc) errs.agreeTerms = 'Please accept both agreements to continue'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    setTimeout(() => {
      resetDraft()
      login()
      notify('Submitted! Your account will be verified within 24 hours.')
      nav('/dashboard')
    }, 900)
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8">
      <h2 className="font-display text-[30px] font-bold tracking-tight">Verification &amp; Consent</h2>
      <p className="mt-2 text-[15px] leading-6 text-gray-500">
        Upload your compliance documents and payout details to get verified and start receiving customer payouts.
      </p>

      <h3 className="mt-8 flex items-center gap-2 border-b border-line pb-3 text-[15px] font-semibold">
        <FolderOpen size={18} className="text-brand" /> Compliance Documents
      </h3>

      <p className="mb-2 mt-5 text-[15px]">
        CAC Business Registration Certificate <span className="text-brand">*</span>
      </p>
      <UploadBox
        icon={<FileBadge size={20} />}
        title="Click to upload CAC Certificate"
        hint="BN or RC certificate (PDF, JPG, max 5MB)"
        accept=".pdf,image/jpeg"
        file={draft.cacFile}
        error={errors.cacFile}
        onFile={(cacFile) => updateDraft({ cacFile })}
      />

      <p className="mb-2 mt-5 text-[15px]">
        Government-issued Identification (NIN / Voter's Card / Passport) <span className="text-brand">*</span>
      </p>
      <UploadBox
        icon={<IdCard size={20} />}
        title="National Identity Slip or Card"
        hint="Clear front and back image (JPG, PNG)"
        accept="image/png,image/jpeg"
        file={draft.idFile}
        error={errors.idFile}
        onFile={(idFile) => updateDraft({ idFile })}
      />

      <p className="mb-2 mt-5 text-[15px]">
        Food Safety Permit or Hygiene Certificate <span className="text-gray-400">(Optional)</span>
      </p>
      <input ref={permitRef} type="file" hidden onChange={(e) => updateDraft({ permitFile: e.target.files?.[0]?.name })} />
      <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3.5 text-xs text-gray-500">
        <Utensils size={16} className="text-gray-500" />
        <span className="flex-1 truncate">{draft.permitFile ?? 'Local council food handler permit'}</span>
        {draft.permitFile ? (
          <button type="button" onClick={() => updateDraft({ permitFile: undefined })} aria-label="Remove permit">
            <X size={14} />
          </button>
        ) : (
          <button type="button" className="font-semibold text-ink" onClick={() => permitRef.current?.click()}>
            + Add file
          </button>
        )}
      </div>

      <h3 className="mt-10 flex items-center gap-2 border-b border-line pb-3 text-[15px] font-semibold">
        <Landmark size={18} className="text-brand" /> Payout Bank Account
      </h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label={<span className="text-[15px] font-normal text-ink">Bank Name</span>} required error={errors.bank}>
          <Select
            value={draft.bank}
            onChange={(e) => {
              updateDraft({ bank: e.target.value })
              verifyAccount(e.target.value, draft.accountNumber)
            }}
          >
            <option value="">Select bank</option>
            {banks.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </Select>
        </Field>
        <Field label={<span className="text-[15px] font-normal text-ink">Account Number</span>} required error={errors.accountNumber}>
          <Input
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit NUBAN"
            value={draft.accountNumber}
            invalid={!!errors.accountNumber}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 10)
              updateDraft({ accountNumber: v })
              verifyAccount(draft.bank, v)
            }}
          />
        </Field>
      </div>
      {(verifying || verifiedName) && (
        <div
          className={cx(
            'mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-xs font-semibold',
            verifiedName ? 'border-emerald-200 bg-ok-50 text-ink' : 'border-line bg-gray-50 text-gray-600',
          )}
        >
          {verifying ? <LoaderCircle size={18} className="animate-spin" /> : <CircleCheck size={18} className="text-ok" />}
          <span className="flex-1">{verifying ? 'Verifying account with NIBSS…' : `Account Verified: ${verifiedName}`}</span>
          {verifiedName && <span className="text-ok">VERIFIED</span>}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <Checkbox checked={draft.agreeTerms} onChange={(agreeTerms) => updateDraft({ agreeTerms })}>
          I agree to the <a className="text-brand">OYO Food Merchant Terms and Conditions</a>, including the standard commission agreement and service
          level expectations.
        </Checkbox>
        <Checkbox checked={draft.agreeKyc} onChange={(agreeKyc) => updateDraft({ agreeKyc })}>
          I consent to the collection and verification of business KYC information in accordance with the <a className="text-brand">Privacy Policy</a>.
        </Checkbox>
        {errors.agreeTerms && <p className="text-xs text-bad">{errors.agreeTerms}</p>}
      </div>

      <Button type="submit" size="lg" className="mt-8 w-full" disabled={submitting} iconRight={<ArrowRight size={18} />}>
        {submitting ? 'Submitting…' : 'Submit for Verification'}
      </Button>

      <div className="mb-6 mt-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-gray-600">
        <BadgeCheck size={18} className="shrink-0 text-brand" />
        <span>
          Account approval usually takes <b className="text-ink">under 24 hours</b>. Our merchant onboarding team will inspect your uploaded credentials.
        </span>
      </div>
    </form>
  )
}
