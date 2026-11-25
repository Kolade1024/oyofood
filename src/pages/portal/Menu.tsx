import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Clock, Eye, ImagePlus, Pencil, Plus, SearchX, Trash2, TriangleAlert, UtensilsCrossed, X } from 'lucide-react'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  Input,
  Modal,
  PageBody,
  PageHeader,
  SearchInput,
  Sheet,
  Tabs,
  Textarea,
  Toggle,
  useLatchedValue,
} from '../../components/ui'
import { CustomerPreview } from '../../components/CustomerPreview'
import { Select } from '../../components/Select'
import { useApp } from '../../context/AppContext'
import { addOns as defaultAddOns, categories as defaultCategories } from '../../data/mock'
import type { Meal } from '../../data/mock'
import { cx, naira } from '../../lib/format'
import { listCard, withViewTransition } from '../../lib/viewTransition'

const shortCat = (c: string) => c.replace('Swallow & Native Soups', 'Swallow & Native')

interface FormState {
  id?: string
  name: string
  category: string
  description: string
  price: string
  discountPrice: string
  prepTime: string
  image?: string
  addOns: { name: string; price: number; on: boolean }[]
}

const emptyForm = (category: string): FormState => ({
  name: '',
  category,
  description: '',
  price: '',
  discountPrice: '',
  prepTime: '20',
  addOns: defaultAddOns.map((a) => ({ ...a, on: false })),
})

export default function Menu() {
  const { meals, toggleMeal, addMeal, updateMeal, deleteMeal, notify } = useApp()
  const [params, setParams] = useSearchParams()
  const [cats, setCats] = useState(defaultCategories)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(params.get('add') === '1')
  const [form, setForm] = useState<FormState>(emptyForm(defaultCategories[0]))
  const [formSnapshot, setFormSnapshot] = useState(() => JSON.stringify(emptyForm(defaultCategories[0])))
  const [discardOpen, setDiscardOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newCatOpen, setNewCatOpen] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [newCatError, setNewCatError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Meal | null>(null)
  const [addOnDraft, setAddOnDraft] = useState<{ name: string; price: string } | null>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const deleteTarget = useLatchedValue(confirmDelete)

  // design shows catalogue-wide counts; add live additions on top of them
  const baseCounts: Record<string, number> = { 'Rice & Pastas': 10, 'Swallow & Native Soups': 8, 'Grills & Suya': 6, 'Sides & Beverages': 10 }
  const countFor = (c: string) => (baseCounts[c] ?? 0) + meals.filter((m) => m.category === c && !m.id.startsWith('m')).length
  const total = cats.reduce((s, c) => s + countFor(c), 0)

  const q = query.trim().toLowerCase()
  const visible = (filter === 'all' ? meals : meals.filter((m) => m.category === filter)).filter(
    (m) => !q || `${m.name} ${m.description}`.toLowerCase().includes(q),
  )

  useEffect(() => {
    if (params.get('add') === '1') setParams({}, { replace: true })
  }, [params, setParams])

  const startForm = (f: FormState) => {
    setForm(f)
    setFormSnapshot(JSON.stringify(f))
    setErrors({})
    setAddOnDraft(null)
    setFormOpen(true)
  }

  const openAdd = () => startForm(emptyForm(filter === 'all' ? cats[0] : filter))

  const openEdit = (m: Meal) =>
    startForm({
      id: m.id,
      name: m.name,
      category: m.category,
      description: m.description,
      price: String(m.price),
      discountPrice: m.discountPrice ? String(m.discountPrice) : '',
      prepTime: m.prepTime.replace(/\D.*$/, ''),
      image: m.image,
      addOns: defaultAddOns.map((a) => ({ ...a, on: false })),
    })

  const closeForm = () => {
    setForm(emptyForm(cats[0]))
    setErrors({})
    setFormOpen(false)
  }

  const requestClose = () => {
    if (JSON.stringify(form) !== formSnapshot) setDiscardOpen(true)
    else closeForm()
  }

  const save = () => {
    const errs: Record<string, string> = {}
    if (!form.image) errs.image = 'Add a meal photo'
    if (form.name.trim().length < 3) errs.name = 'Enter the meal name'
    if (form.description.trim().length < 10) errs.description = 'Describe the meal (at least 10 characters)'
    const price = Number(form.price)
    if (!price || price < 100) errs.price = 'Enter a valid price'
    const disc = form.discountPrice ? Number(form.discountPrice) : undefined
    if (disc !== undefined && (disc <= 0 || disc >= price)) errs.discountPrice = 'Must be lower than base price'
    if (!Number(form.prepTime)) errs.prepTime = 'Enter prep time'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const addOnText = form.addOns.filter((a) => a.on).length
    const meal: Meal = {
      id: form.id ?? 'n' + Date.now(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      price,
      discountPrice: disc,
      prepTime: `${form.prepTime} mins`,
      options: addOnText ? `${addOnText} Add-on${addOnText > 1 ? 's' : ''}` : 'No add-ons',
      soldThisWeek: form.id ? meals.find((m) => m.id === form.id)?.soldThisWeek ?? 0 : 0,
      available: form.id ? meals.find((m) => m.id === form.id)?.available ?? true : true,
      image: form.image!,
    }
    if (form.id) {
      updateMeal(meal)
      notify(`${meal.name} updated`)
    } else {
      addMeal(meal)
      notify(`${meal.name} published to your menu`)
    }
    setForm(emptyForm(cats[0]))
    setFormOpen(false)
  }

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))
  const errorCount = Object.keys(errors).length

  return (
    <>
      <PageHeader
        title="Menu"
        subtitle="Changes go live as soon as you save."
        actions={
          <>
            <Button variant="secondary" icon={<Eye size={16} />} onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            <Button icon={<Plus size={16} />} onClick={openAdd}>
              Add item
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Tabs
              style="segmented"
              label="Category"
              value={filter}
              onChange={setFilter}
              tabs={[{ id: 'all', label: 'All', count: total }, ...cats.map((c) => ({ id: c, label: shortCat(c), count: countFor(c) }))]}
            />
            <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setNewCatOpen(true)} className="text-muted hover:text-ink">
              Category
            </Button>
          </div>
          <SearchInput value={query} onChange={setQuery} placeholder="Search dishes" shortcut className="lg:w-64" />
        </div>

        {visible.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((m) => (
              <MealCard
                key={m.id}
                meal={m}
                onToggle={() => {
                  toggleMeal(m.id)
                  notify(m.available ? `${m.name} hidden from customers` : `${m.name} is back on the menu`, m.available ? 'info' : 'ok')
                }}
                onEdit={() => openEdit(m)}
                onDelete={() => setConfirmDelete(m)}
              />
            ))}
          </div>
        ) : q ? (
          <EmptyState
            icon={<SearchX size={18} />}
            title={`No dishes match “${query}”`}
            description="Try a different name or ingredient."
            action={
              <Button variant="secondary" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<UtensilsCrossed size={18} />}
            title="No items in this category yet"
            description="Add your first dish so customers can start ordering it."
            action={
              <Button size="sm" icon={<Plus size={14} />} onClick={openAdd}>
                Add item
              </Button>
            }
          />
        )}
      </PageBody>

      {/* Add / edit item */}
      <Sheet
        open={formOpen}
        onClose={requestClose}
        title={form.id ? 'Edit item' : 'New menu item'}
        footer={
          <>
            {errorCount > 0 && (
              <p role="alert" className="mr-auto flex items-center gap-1.5 self-center text-[13px] font-medium text-bad-fg">
                <TriangleAlert size={14} /> Fix {errorCount} {errorCount === 1 ? 'field' : 'fields'} to continue
              </p>
            )}
            <Button variant="secondary" onClick={requestClose}>
              Cancel
            </Button>
            <Button onClick={save}>{form.id ? 'Save changes' : 'Publish item'}</Button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <p className="mb-1.5 text-[13px] font-medium">
              Photo<span className="ml-0.5 text-brand-fg">*</span>
            </p>
            <input
              ref={imgRef}
              type="file"
              accept="image/png,image/jpeg"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) set({ image: URL.createObjectURL(f) })
              }}
            />
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              className={cx(
                'group relative flex aspect-[2/1] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-canvas text-center transition-colors',
                errors.image ? 'border-bad-fg' : 'border-line-strong hover:border-muted',
              )}
            >
              {form.image ? (
                <>
                  <img src={form.image} alt="Meal preview" className="absolute inset-0 h-full w-full object-cover" />
                  <span className="absolute inset-0 rounded-xl outline-1 -outline-offset-1 outline-black/10" />
                  <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 shadow-card transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Replace photo
                  </span>
                </>
              ) : (
                <>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-transparent bg-white text-muted shadow-card">
                    <ImagePlus size={18} />
                  </span>
                  <span className="mt-3 text-[13px] font-medium">Upload a photo</span>
                  <span className="text-xs text-muted">JPG or PNG · 800×600 recommended</span>
                </>
              )}
            </button>
            {errors.image && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-bad-fg">
                {errors.image}
              </p>
            )}
            {!form.image && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-muted">Or use a sample:</span>
                {['/images/meal1.jpg', '/images/meal2.jpg', '/images/meal3.jpg'].map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => set({ image: src })}
                    aria-label={`Use sample photo ${i + 1}`}
                    className="relative overflow-hidden rounded-md transition-transform hover:scale-105"
                  >
                    <img src={src} alt="" className="h-9 w-12 object-cover" />
                    <span className="absolute inset-0 rounded-md outline-1 -outline-offset-1 outline-black/10" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Field label="Name" required error={errors.name}>
            <Input placeholder="e.g. Asun Fried Rice with Grilled Turkey" value={form.name} invalid={!!errors.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Category" required>
            <Select value={form.category} onChange={(category) => set({ category })} options={cats} />
          </Field>
          <Field label="Description" required error={errors.description} hint="Ingredients, cooking style and portion size.">
            <Textarea
              rows={3}
              placeholder="Smoky party jollof with grilled turkey, fried plantain and coleslaw…"
              value={form.description}
              aria-invalid={!!errors.description || undefined}
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₦)" required error={errors.price}>
              <Input inputMode="numeric" placeholder="3500" value={form.price} invalid={!!errors.price} onChange={(e) => set({ price: e.target.value.replace(/\D/g, '') })} />
            </Field>
            <Field label="Sale price (₦)" error={errors.discountPrice}>
              <Input
                inputMode="numeric"
                placeholder="Optional"
                value={form.discountPrice}
                invalid={!!errors.discountPrice}
                onChange={(e) => set({ discountPrice: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
            <Field label="Prep time" required error={errors.prepTime}>
              <Input
                inputMode="numeric"
                value={form.prepTime}
                invalid={!!errors.prepTime}
                right="min"
                onChange={(e) => set({ prepTime: e.target.value.replace(/\D/g, '') })}
              />
            </Field>
          </div>

          <div className="border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium">Add-ons</p>
                <p className="text-xs text-muted">Extras customers can add to this dish.</p>
              </div>
              {!addOnDraft && (
                <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setAddOnDraft({ name: '', price: '' })}>
                  Custom
                </Button>
              )}
            </div>
            {addOnDraft && (
              <form
                className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-canvas p-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!addOnDraft.name.trim() || !Number(addOnDraft.price)) return
                  set({ addOns: [...form.addOns, { name: addOnDraft.name.trim(), price: Number(addOnDraft.price), on: true }] })
                  setAddOnDraft(null)
                }}
              >
                <input
                  autoFocus
                  aria-label="Add-on name"
                  placeholder="Add-on name"
                  value={addOnDraft.name}
                  onChange={(e) => setAddOnDraft({ ...addOnDraft, name: e.target.value })}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-field bg-white px-3 text-sm outline-none focus:border-ink focus:ring-4 focus:ring-brand/15"
                />
                <input
                  aria-label="Add-on price in Naira"
                  placeholder="₦ price"
                  inputMode="numeric"
                  value={addOnDraft.price}
                  onChange={(e) => setAddOnDraft({ ...addOnDraft, price: e.target.value.replace(/\D/g, '') })}
                  className="h-9 w-24 rounded-lg border border-field bg-white px-3 text-sm outline-none focus:border-ink focus:ring-4 focus:ring-brand/15"
                />
                <Button type="submit" size="sm" disabled={!addOnDraft.name.trim() || !Number(addOnDraft.price)}>
                  Add
                </Button>
                <IconButton size="sm" label="Cancel" onClick={() => setAddOnDraft(null)}>
                  <X size={16} />
                </IconButton>
              </form>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {form.addOns.map((a, i) => (
                <button
                  key={a.name + i}
                  type="button"
                  aria-pressed={a.on}
                  onClick={() => set({ addOns: form.addOns.map((x, j) => (j === i ? { ...x, on: !x.on } : x)) })}
                  className={cx(
                    'flex h-11 items-center gap-2.5 rounded-lg border px-3 text-left text-[13px] transition-colors duration-150',
                    a.on ? 'border-ink bg-white ring-1 ring-inset ring-ink' : 'border-line-strong bg-white hover:border-muted',
                  )}
                >
                  <span
                    className={cx(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                      a.on ? 'border-ink bg-ink text-white' : 'border-field',
                    )}
                  >
                    {a.on && <Check size={11} />}
                  </span>
                  <span className="flex-1 truncate">{a.name}</span>
                  <span className="font-medium tabular-nums text-muted">+{naira(a.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Sheet>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={() => {
          setDiscardOpen(false)
          closeForm()
        }}
        title="Discard unsaved changes?"
        description="Your edits to this item will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
      />

      <Modal
        open={newCatOpen}
        onClose={() => {
          setNewCatOpen(false)
          setNewCatError('')
        }}
        size="sm"
        title="New category"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewCatOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="new-category" disabled={!newCat.trim()}>
              Create category
            </Button>
          </>
        }
      >
        <form
          id="new-category"
          onSubmit={(e) => {
            e.preventDefault()
            const name = newCat.trim()
            if (!name) return
            if (cats.includes(name)) {
              setNewCatError('A category with this name already exists')
              return
            }
            setCats((c) => [...c, name])
            setNewCat('')
            setNewCatError('')
            setNewCatOpen(false)
            notify(`Category "${name}" created`)
          }}
        >
          <Field label="Name" error={newCatError}>
            <Input
              autoFocus
              placeholder="e.g. Breakfast Specials"
              value={newCat}
              invalid={!!newCatError}
              onChange={(e) => {
                setNewCat(e.target.value)
                setNewCatError('')
              }}
            />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            withViewTransition(() => deleteMeal(confirmDelete.id))
            notify(`${confirmDelete.name} deleted`, 'bad')
          }
          setConfirmDelete(null)
        }}
        title="Delete this item?"
        description={
          <>
            <span className="font-medium text-ink">{deleteTarget?.name}</span> will be removed from your menu and customers won't be able to order it.
            Tip: switch it off instead to hide it temporarily.
          </>
        }
        confirmLabel="Delete item"
        cancelLabel="Keep it"
        icon={<Trash2 size={16} />}
      />

      <CustomerPreview open={previewOpen} meals={meals} categories={cats} onClose={() => setPreviewOpen(false)} />
    </>
  )
}

function MealCard({ meal: m, onToggle, onEdit, onDelete }: { meal: Meal; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <article style={listCard(m.id)} className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-white shadow-card transition-shadow duration-200 hover:shadow-raised">
      <div className="relative aspect-[16/9] overflow-hidden bg-canvas">
        <img
          src={m.image}
          alt={m.name}
          loading="lazy"
          className={cx('h-full w-full object-cover transition-[filter] duration-300 ease-snappy', !m.available && 'grayscale')}
        />
        <span className="absolute left-3 top-3 inline-flex h-6 items-center gap-1.5 rounded-full bg-white/95 px-2 text-xs font-medium text-ink shadow-card">
          {m.available ? 'Available' : 'Hidden'}
        </span>
        <span className="absolute right-3 top-3 inline-flex h-6 items-center rounded-full bg-black/60 px-2 text-xs font-medium text-white backdrop-blur-sm">
          {shortCat(m.category)}
        </span>
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-5">{m.name}</h3>
          <div className="shrink-0 text-right tabular-nums">
            {m.discountPrice ? (
              <>
                <p className="text-sm font-semibold">{naira(m.discountPrice)}</p>
                <p className="text-xs text-muted line-through">{naira(m.price)}</p>
              </>
            ) : (
              <p className="text-sm font-semibold">{naira(m.price)}</p>
            )}
          </div>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-muted">{m.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {m.lowStock && !m.available ? (
            <span className="flex items-center gap-1.5 font-medium text-bad-fg">
              <TriangleAlert size={14} /> Low beef inventory
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {m.prepTime}
              </span>
              <span>{m.options}</span>
              <span className="ml-auto font-medium text-gray-700">{m.soldThisWeek > 0 ? `${m.soldThisWeek} sold this week` : 'New'}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-gray-700">
          <Toggle checked={m.available} onChange={onToggle} label={`${m.name} available to order`} />
          <span aria-hidden>{m.available ? 'On menu' : 'Off menu'}</span>
        </label>
        <span className="flex gap-0.5">
          <IconButton size="sm" label={`Edit ${m.name}`} onClick={onEdit}>
            <Pencil size={16} />
          </IconButton>
          <IconButton size="sm" variant="dangerGhost" label={`Delete ${m.name}`} onClick={onDelete}>
            <Trash2 size={16} />
          </IconButton>
        </span>
      </div>
    </article>
  )
}
