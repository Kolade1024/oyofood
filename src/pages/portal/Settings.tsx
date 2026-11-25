import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogOut, ShieldAlert, Trash2 } from 'lucide-react'
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  IconButton,
  Input,
  Modal,
  PageBody,
  PageHeader,
  Select,
  Tabs,
  Textarea,
  Toggle,
  useLatchedValue,
} from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { vendor } from '../../data/mock'

type Tab = 'profile' | 'alerts' | 'security' | 'staff'
const tabIds: Tab[] = ['profile', 'alerts', 'security', 'staff']

const staffRoles = ['Kitchen Staff', 'Cashier', 'Branch Manager']

function Section({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[260px_1fr] lg:gap-10">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        {description && <p className="mt-1 text-[13px] leading-5 text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function CardFooter({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end gap-2 rounded-b-xl border-t border-line bg-canvas px-5 py-3">{children}</div>
}

export default function Settings() {
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const { logout, notify } = useApp()
  const tabParam = params.get('tab') as Tab
  const tab: Tab = tabIds.includes(tabParam) ? tabParam : 'profile'
  const setTab = (t: Tab) => setParams(t === 'profile' ? {} : { tab: t }, { replace: true })

  const [profile, setProfile] = useState({ owner: vendor.owner, brand: vendor.brand, email: vendor.email, phone: vendor.phone, bio: vendor.bio })
  const [logo, setLogo] = useState<string>('/images/meal1.jpg')
  const [alerts, setAlerts] = useState({ chime: true, sms: true, whatsapp: false, email: true, push: true })
  const [pw, setPw] = useState({ current: '', next: '' })
  const [twoFA, setTwoFA] = useState(true)
  const [twoFAConfirm, setTwoFAConfirm] = useState(false)
  const [staff, setStaff] = useState([
    { name: 'Funmi Adeyemi', email: 'funmi@bukkahut.ng', role: 'Branch Manager' },
    { name: 'Musa Ibrahim', email: 'musa@bukkahut.ng', role: 'Kitchen Staff' },
    { name: 'Ada Okoro', email: 'ada@bukkahut.ng', role: 'Cashier' },
  ])
  const [invite, setInvite] = useState({ name: '', email: '', role: staffRoles[0] })
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removing, setRemoving] = useState<number | null>(null)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const removingName = useLatchedValue(removing !== null ? staff[removing]?.name : null)

  const save = () => {
    if (!profile.owner.trim() || !profile.brand.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) {
      notify('Please fill in all required profile fields', 'bad')
      return
    }
    notify('Preferences saved')
  }

  const emailInvalid = !!profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)

  const alertRows: [keyof typeof alerts, string, string][] = [
    ['chime', 'New-order chime', 'Ring repeatedly until an incoming order is accepted.'],
    ['push', 'Browser notifications', 'Show desktop alerts for new orders when this tab is in the background.'],
    ['sms', 'SMS for delayed pickups', "Text me if a rider hasn't arrived 15 minutes after an order is ready."],
    ['whatsapp', 'Daily WhatsApp summary', 'Nightly revenue and order count via WhatsApp.'],
    ['email', 'Weekly email statement', 'A PDF of settlements and commissions every Monday.'],
  ]

  return (
    <>
      <PageHeader title="Settings">
        <Tabs
          label="Settings sections"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'profile', label: 'Profile' },
            { id: 'alerts', label: 'Notifications' },
            { id: 'security', label: 'Security' },
            { id: 'staff', label: 'Team', count: staff.length + 1 },
          ]}
        />
      </PageHeader>

      <PageBody className="max-w-[1080px] space-y-10">
        {tab === 'profile' && (
          <Section title="Restaurant profile" description="Shown to customers on your store page and used for account notices.">
            <Card>
              <div className="space-y-5 p-5">
                <div className="flex items-center gap-4">
                  <span className="relative h-16 w-16 shrink-0">
                    <img src={logo} alt="Restaurant logo" className="h-16 w-16 rounded-xl object-cover" />
                    <span className="absolute inset-0 rounded-xl outline-1 -outline-offset-1 outline-black/10" />
                  </span>
                  <div>
                    <input
                      ref={logoRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      hidden
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) setLogo(URL.createObjectURL(f))
                      }}
                    />
                    <Button variant="secondary" size="sm" onClick={() => logoRef.current?.click()}>
                      Change logo
                    </Button>
                    <p className="mt-1.5 text-xs text-muted">Square JPG or PNG, at least 400×400px</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Owner name" required error={!profile.owner.trim() ? 'Required' : undefined}>
                    <Input value={profile.owner} invalid={!profile.owner.trim()} onChange={(e) => setProfile({ ...profile, owner: e.target.value })} />
                  </Field>
                  <Field label="Restaurant name" required error={!profile.brand.trim() ? 'Required' : undefined}>
                    <Input value={profile.brand} invalid={!profile.brand.trim()} onChange={(e) => setProfile({ ...profile, brand: e.target.value })} />
                  </Field>
                  <Field label="Email" required error={emailInvalid ? 'Enter a valid email address' : undefined}>
                    <Input type="email" value={profile.email} invalid={emailInvalid} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  </Field>
                  <Field label="Manager phone" required>
                    <Input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                  </Field>
                </div>
                <Field label="Public bio" hint="A sentence or two about your kitchen.">
                  <Textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />
                </Field>
              </div>
              <CardFooter>
                <Button onClick={save}>Save changes</Button>
              </CardFooter>
            </Card>
          </Section>
        )}

        {tab === 'alerts' && (
          <Section title="Order alerts">
            <Card>
              <ul className="divide-y divide-line">
                {alertRows.map(([k, title, desc]) => (
                  <li key={k}>
                    <label className="flex cursor-pointer items-center justify-between gap-6 px-5 py-4">
                      <span>
                        <span className="block text-sm font-medium">{title}</span>
                        <span className="mt-0.5 block text-[13px] text-muted">{desc}</span>
                      </span>
                      <Toggle checked={alerts[k]} onChange={(v) => setAlerts({ ...alerts, [k]: v })} label={title} />
                    </label>
                  </li>
                ))}
              </ul>
              <CardFooter>
                <Button onClick={save}>Save preferences</Button>
              </CardFooter>
            </Card>
          </Section>
        )}

        {tab === 'security' && (
          <>
            <Section title="Password" description="Use at least 8 characters. You'll stay signed in on this device.">
              <Card>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!pw.current || pw.next.length < 8) return
                    setPw({ current: '', next: '' })
                    notify('Password updated')
                  }}
                >
                  <div className="grid gap-4 p-5 sm:grid-cols-2">
                    <Field label="Current password">
                      <Input type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
                    </Field>
                    <Field label="New password" error={pw.next && pw.next.length < 8 ? 'At least 8 characters' : undefined}>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        value={pw.next}
                        invalid={!!pw.next && pw.next.length < 8}
                        onChange={(e) => setPw({ ...pw, next: e.target.value })}
                      />
                    </Field>
                  </div>
                  <CardFooter>
                    <Button type="submit" disabled={!pw.current || pw.next.length < 8}>
                      Update password
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </Section>

            <Section title="Two-factor authentication" description="Ask for a 6-digit SMS code when signing in on a new device.">
              <Card className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    SMS verification
                    {twoFA ? <Badge tone="ok">On</Badge> : <Badge tone="bad">Off</Badge>}
                  </p>
                  <p className="mt-0.5 text-[13px] text-muted">Codes go to {vendor.phone}</p>
                </div>
                <Toggle
                  checked={twoFA}
                  onChange={(v) => {
                    if (!v) {
                      setTwoFAConfirm(true)
                      return
                    }
                    setTwoFA(true)
                    notify('2FA enabled')
                  }}
                  label="Two-factor authentication"
                />
              </Card>
            </Section>

            <Section title="Session" description="Signing out pauses order chimes on this tablet or computer.">
              <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={profile.owner} tone="dark" />
                  <div>
                    <p className="text-sm font-medium">{profile.owner}</p>
                    <p className="text-[13px] text-muted">Signed in on this device</p>
                  </div>
                </div>
                <Button variant="dangerSoft" icon={<LogOut size={16} />} onClick={() => setLogoutOpen(true)}>
                  Log out
                </Button>
              </Card>
            </Section>
          </>
        )}

        {tab === 'staff' && (
          <Section
            title="Team access"
            description={
              <>
                Kitchen staff manage orders only. Managers can also edit menus and hours. Payouts stay owner-only.
              </>
            }
          >
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
                <p className="text-[13px] text-muted">{staff.length + 1} members</p>
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  Invite
                </Button>
              </div>
              <ul className="divide-y divide-line">
                <li className="flex items-center gap-3 px-5 py-3.5">
                  <Avatar name={profile.owner} tone="dark" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {profile.owner} <span className="font-normal text-muted">(you)</span>
                    </p>
                    <p className="truncate text-[13px] text-muted">{profile.email}</p>
                  </div>
                  <Badge tone="dark">Owner</Badge>
                </li>
                {staff.map((s, i) => (
                  <li key={s.email} className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-canvas/60">
                    <Avatar name={s.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="truncate text-[13px] text-muted">{s.email}</p>
                    </div>
                    <Select
                      aria-label={`Role for ${s.name}`}
                      value={s.role}
                      className="h-9 w-40 border-line-strong text-[13px]"
                      onChange={(e) => {
                        setStaff((st) => st.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))
                        notify(`${s.name.split(' ')[0]} is now ${e.target.value}`, 'info')
                      }}
                    >
                      {staffRoles.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                    <IconButton size="sm" variant="dangerGhost" label={`Remove ${s.name}`} onClick={() => setRemoving(i)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </Card>
          </Section>
        )}
      </PageBody>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a team member"
        description="They'll get an email with a link to set up their account."
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invite-form" disabled={!invite.name.trim() || !/^\S+@\S+\.\S+$/.test(invite.email)}>
              Send invite
            </Button>
          </>
        }
      >
        <form
          id="invite-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!invite.name.trim() || !/^\S+@\S+\.\S+$/.test(invite.email)) return
            setStaff((s) => [...s, invite])
            setInvite({ name: '', email: '', role: staffRoles[0] })
            setInviteOpen(false)
            notify(`Invite sent to ${invite.email}`)
          }}
        >
          <Field label="Full name">
            <Input autoFocus value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
          </Field>
          <Field label="Role">
            <Select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
              {staffRoles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (removing !== null) {
            const s = staff[removing]
            setStaff((st) => st.filter((_, j) => j !== removing))
            notify(`${s.name} removed`, 'info')
          }
          setRemoving(null)
        }}
        title={`Remove ${removingName ?? 'team member'}?`}
        description="They'll lose access to the portal immediately. You can invite them again later."
        confirmLabel="Remove"
        icon={<Trash2 size={16} />}
      />

      <ConfirmDialog
        open={twoFAConfirm}
        onClose={() => setTwoFAConfirm(false)}
        onConfirm={() => {
          setTwoFA(false)
          setTwoFAConfirm(false)
          notify('2FA turned off. Your account is less secure.', 'bad')
        }}
        title="Turn off two-factor authentication?"
        description="Anyone with your password could sign in from a new device without a verification code."
        confirmLabel="Turn off 2FA"
        cancelLabel="Keep it on"
        icon={<ShieldAlert size={16} />}
      />

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          logout()
          nav('/login')
        }}
        title="Log out of OYO Food?"
        description="You'll stop receiving order chimes on this device until you log in again."
        confirmLabel="Log out"
        cancelLabel="Stay logged in"
        icon={<LogOut size={16} />}
      />
    </>
  )
}
