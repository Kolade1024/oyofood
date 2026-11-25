import { useState } from 'react'
import { BadgeCheck, Banknote, Download } from 'lucide-react'
import { Badge, Button, Card, CardHeader, Field, Input, Modal, PageBody, PageHeader, Select, StatCard, Table, Td, Th, Tr } from '../../components/ui'
import { useApp } from '../../context/AppContext'
import { banks, transactions, vendor } from '../../data/mock'
import { cx, naira } from '../../lib/format'

export default function Earnings() {
  const { notify } = useApp()
  const [balance, setBalance] = useState(492850)
  const [txs, setTxs] = useState(transactions)
  const [bank, setBank] = useState(vendor.bank)
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [bankOpen, setBankOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankDraft, setBankDraft] = useState({ name: bank.name, nuban: bank.nuban })

  const instantFee = (n: number) => Math.min(Math.round(n * 0.01), 1000)

  const exportCsv = () => {
    const rows = [['Reference', 'Date', 'Type', 'Gross', 'Commission', 'Net', 'Status'], ...txs.map((t) => [t.ref, t.date, t.type, t.gross, t.commission, t.net, t.status])]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'oyo-statement.csv'
    a.click()
    notify('Statement downloaded')
  }

  const requestPayout = () => {
    const n = Number(amount)
    if (!n || n > balance || n < 1000) return
    const fee = instantFee(n)
    setBalance((b) => b - n)
    setTxs((t) => [
      {
        ref: 'PAY-OYO-' + Math.floor(10000 + Math.random() * 89999),
        date: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        type: 'Instant Payout',
        gross: n,
        commission: fee,
        net: n - fee,
        status: 'payout' as const,
      },
      ...t,
    ])
    setPayoutOpen(false)
    setAmount('')
    notify(`${naira(n - fee)} is on its way to ${bank.name.split(' (')[0]}`)
  }

  const amountN = Number(amount)
  const amountError = amountN > balance ? 'Amount exceeds your available balance' : amount && amountN < 1000 ? 'Minimum payout is ₦1,000' : undefined
  const amountOk = amountN >= 1000 && amountN <= balance

  return (
    <>
      <PageHeader
        title="Earnings"
        actions={
          <>
            <Button variant="secondary" icon={<Download size={16} />} onClick={exportCsv}>
              Export statement
            </Button>
            <Button icon={<Banknote size={16} />} onClick={() => setPayoutOpen(true)}>
              Withdraw
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="relative flex flex-col overflow-hidden rounded-xl bg-ink p-5 text-white shadow-raised">
            <p className="text-[13px] font-medium text-white/70">Available balance</p>
            <p className="mt-2.5 text-[28px] font-semibold tracking-tight tabular-nums">{naira(balance, 2)}</p>
            <p className="mt-1 text-[13px] text-white/60">Cleared for automatic daily settlement</p>
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-[13px]">
              <span className="min-w-0 text-white/60">
                Next transfer <span className="whitespace-nowrap font-medium text-white">Tomorrow, 6 AM</span>
              </span>
              <button
                type="button"
                onClick={() => setPayoutOpen(true)}
                className="-mr-2 shrink-0 whitespace-nowrap rounded-md px-2 py-1 font-medium text-white transition-colors hover:bg-white/10"
              >
                Withdraw now
              </button>
            </div>
          </div>
          <StatCard
            label="Pending in orders"
            value={naira(78400, 2)}
            hint="14 orders, cleared on handover"
          />
          <StatCard
            label="Lifetime volume"
            value={naira(8420150, 2)}
            hint={
              <>
                1,940 orders · avg. daily payout <span className="font-medium text-ok-fg">₦142,600</span>
              </>
            }
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="flex flex-col p-5">
            <CardHeader title="Settlement account" action={<Badge tone="ok">Primary</Badge>} />
            <div className="mt-4">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  {bank.name}
                  <BadgeCheck size={16} className="shrink-0 text-ok-fg" aria-label="Verified" />
                </p>
                <p className="mt-0.5 font-mono text-[13px] text-muted">{bank.nuban}</p>
                <p className="mt-0.5 text-[13px] text-gray-700">{bank.accountName}</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] text-muted">Daily settlements are free via NIBSS Instant Payments.</p>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setBankDraft({ name: bank.name, nuban: bank.nuban })
                  setBankOpen(true)
                }}
              >
                Change account
              </Button>
              <Badge tone="gray">CAC verified</Badge>
            </div>
          </Card>

          <Card className="p-5">
            <CardHeader title="Fees & commission" description="Applied to each completed order" action={<Badge tone="brand">Standard tier · 15%</Badge>} />
            <dl className="mt-5 grid gap-px overflow-hidden rounded-lg bg-line sm:grid-cols-3">
              <FeeTile title="Platform commission" value="15%" note="App, rider routing & marketing" />
              <FeeTile title="Payment processing" value="1.5%" note="Capped at ₦2,000 · Paystack" />
              <FeeTile title="Packaging fees" value="100% yours" note="No commission on containers" ok />
            </dl>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
              <span className="text-muted">
                Settlement cycle <span className="font-medium text-ink">T+1 · every business morning</span>
              </span>
              <a className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink" href="#">
                Merchant agreement
              </a>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader
            className="p-5"
            title="Transactions"
            action={
              <Select aria-label="Period" className="h-9 w-auto border-line-strong text-[13px]" defaultValue="week">
                <option value="week">This week · Nov 5–11</option>
                <option value="last">Last week</option>
                <option value="month">This month</option>
              </Select>
            }
          />
          <Table minWidth={820}>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th align="right">Gross</Th>
                <Th align="right">Fees</Th>
                <Th align="right">Net</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => {
                const payout = t.status === 'payout'
                return (
                  <Tr key={t.ref}>
                    <Td className="font-mono text-xs text-gray-700">{t.ref}</Td>
                    <Td className="whitespace-nowrap text-muted">{t.date}</Td>
                    <Td>
                      {t.type}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {naira(t.gross)}
                    </Td>
                    <Td align="right" className="tabular-nums text-muted">
                      {payout ? (t.commission ? `−${naira(t.commission)}` : '₦0') : `−${naira(t.commission)}`}
                    </Td>
                    <Td align="right" className="font-medium tabular-nums">
                      {naira(t.net)}
                    </Td>
                    <Td>{payout ? <Badge tone="gray">Paid · GTBank</Badge> : <Badge tone="ok">Cleared</Badge>}</Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        </Card>
      </PageBody>

      <Modal
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        title="Withdraw to bank"
        description={
          <>
            Available: <span className="font-medium text-ink tabular-nums">{naira(balance, 2)}</span>
          </>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setPayoutOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="payout-form" disabled={!amountOk}>
              {amountOk ? `Withdraw ${naira(amountN - instantFee(amountN))}` : 'Withdraw'}
            </Button>
          </>
        }
      >
        <form
          id="payout-form"
          onSubmit={(e) => {
            e.preventDefault()
            requestPayout()
          }}
        >
          <Field label="Amount" error={amountError}>
            <Input
              autoFocus
              inputMode="numeric"
              value={amount ? Number(amount).toLocaleString('en-NG') : ''}
              placeholder="100,000"
              invalid={!!amountError}
              icon={<span className="text-sm text-muted">₦</span>}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              className="text-lg font-medium tabular-nums sm:text-base"
            />
          </Field>
          <button
            type="button"
            className="mt-2 text-xs font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink"
            onClick={() => setAmount(String(balance))}
          >
            Use full balance
          </button>
          <dl
            className={cx(
              'mt-4 space-y-2 rounded-lg bg-canvas p-4 text-[13px] transition-opacity duration-200',
              amountOk ? 'opacity-100' : 'opacity-50',
            )}
          >
            <div className="flex justify-between">
              <dt className="text-muted">Instant transfer fee (1%, max ₦1,000)</dt>
              <dd className="tabular-nums">−{naira(amountOk ? instantFee(amountN) : 0)}</dd>
            </div>
            <div className="flex justify-between font-medium">
              <dt>You'll receive</dt>
              <dd className="tabular-nums">{naira(amountOk ? amountN - instantFee(amountN) : 0)}</dd>
            </div>
            <p className="border-t border-line pt-2 text-xs text-muted">
              To {bank.name} · {bank.nuban}
            </p>
          </dl>
        </form>
      </Modal>

      <Modal
        open={bankOpen}
        onClose={() => setBankOpen(false)}
        title="Change settlement account"
        description="For security, we'll send a 6-digit code to your registered phone before the change takes effect."
        footer={
          <>
            <Button variant="secondary" onClick={() => setBankOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={bankDraft.nuban.length !== 10}
              onClick={() => {
                setBank({ ...bank, name: bankDraft.name, nuban: bankDraft.nuban })
                setBankOpen(false)
                notify('Settlement bank updated')
              }}
            >
              Save account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Bank">
            <Select value={bankDraft.name} onChange={(e) => setBankDraft({ ...bankDraft, name: e.target.value })}>
              {banks.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>
          </Field>
          <Field
            label="Account number (NUBAN)"
            aside={<span className="tabular-nums">{bankDraft.nuban.length}/10</span>}
            hint="10-digit account number"
          >
            <Input
              inputMode="numeric"
              maxLength={10}
              className="font-mono tracking-wider"
              value={bankDraft.nuban}
              onChange={(e) => setBankDraft({ ...bankDraft, nuban: e.target.value.replace(/\D/g, '').slice(0, 10) })}
            />
          </Field>
        </div>
      </Modal>
    </>
  )
}

function FeeTile({ title, value, note, ok }: { title: string; value: string; note: string; ok?: boolean }) {
  return (
    <div className="bg-white p-4">
      <dt className="text-[13px] text-muted">{title}</dt>
      <dd className={cx('mt-1 text-lg font-semibold tracking-tight', ok && 'text-ok-fg')}>{value}</dd>
      <dd className="mt-0.5 text-xs text-muted">{note}</dd>
    </div>
  )
}
