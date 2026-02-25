'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Save,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  Type,
  LayoutGrid,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface AboutCard {
  title: string
  description: string
  icon: string
}

interface AboutData {
  _id: string
  heading: string
  description: string
  cards: AboutCard[]
}

/* ─────────────────────────────────────────────
   Supported icon keys (must match About.tsx ICON_MAP)
───────────────────────────────────────────── */
const ICON_OPTIONS = [
  'innovation', 'learning', 'community', 'opportunities',
  'code', 'briefcase', 'star', 'zap', 'heart', 'globe', 'award', 'target',
]

/* ─────────────────────────────────────────────
   Shared input class
───────────────────────────────────────────── */
const inputCls = `
  w-full rounded-xl border border-border bg-muted/50
  px-4 py-2.5 text-sm
  transition-luxury placeholder:text-muted-foreground
  focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
`

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminAboutPage() {
  const [data, setData]     = useState<AboutData>({ _id: '', heading: '', description: '', cards: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  /* ── Load ── */
  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/about', { cache: 'no-store', credentials: 'include' })
      const d   = await res.json()
      if (d) setData(d)
    } catch {
      setError('Failed to load about section.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Save ── */
  async function save() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/about', {
        method:      data._id ? 'PUT' : 'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(data._id ? { id: data._id, ...data } : data),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message || 'Save failed')
      if (d) setData(d)
      setSuccess('About section saved and live on the site!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to save about section')
    } finally {
      setSaving(false)
    }
  }

  /* ── Card actions ── */
  const addCard = () =>
    setData(prev => ({
      ...prev,
      cards: [...prev.cards, { title: '', description: '', icon: 'innovation' }],
    }))

  const updateCard = (idx: number, field: keyof AboutCard, value: string) => {
    const updated = [...data.cards]
    updated[idx] = { ...updated[idx], [field]: value }
    setData(prev => ({ ...prev, cards: updated }))
  }

  const deleteCard = (idx: number) =>
    setData(prev => ({ ...prev, cards: prev.cards.filter((_, i) => i !== idx) }))

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  /* ── Render ── */
  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-primary">About Section</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the heading, description and feature cards
          </p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="
            inline-flex items-center gap-2 px-6 py-2.5
            rounded-xl bg-primary text-primary-foreground
            text-sm font-medium
            transition-luxury hover-lift hover:shadow-luxury
            cursor-pointer active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            self-start sm:self-auto
          "
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Saving…
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════
          ALERTS
      ══════════════════════════════════════ */}
      <AnimatePresence mode="popLayout">
        {error && (
          <motion.div
            key="err"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2"
          >
            <AlertCircle size={15} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="shrink-0 cursor-pointer hover:opacity-70 transition-luxury">
              <X size={14} />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            key="ok"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2"
          >
            <CheckCircle size={15} className="shrink-0" />
            <span className="flex-1">{success}</span>
            <button onClick={() => setSuccess('')} className="shrink-0 cursor-pointer hover:opacity-70 transition-luxury">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          INFO BANNER
      ══════════════════════════════════════ */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2.5">
        <Info size={15} className="text-primary mt-0.5 shrink-0" />
        <span>
          Changes are published live after clicking{' '}
          <span className="text-foreground font-medium">Save Section</span>.
          The icon key must match one of the supported values listed in the card form.
        </span>
      </div>

      {/* ══════════════════════════════════════
          CONTENT SECTION — heading + description
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-soft overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
            <Type size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold">Content</p>
            <p className="text-xs text-muted-foreground mt-0.5">Section heading and description text</p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Heading */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Heading <span className="text-destructive">*</span>
            </label>
            <input
              value={data.heading}
              onChange={e => setData(prev => ({ ...prev, heading: e.target.value }))}
              placeholder="e.g. Who We Are"
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={data.description}
              onChange={e => setData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Brief description shown below the heading"
              className={inputCls}
            />
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════
          FEATURE CARDS
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-soft overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
              <LayoutGrid size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Feature Cards</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.cards.length} card{data.cards.length !== 1 ? 's' : ''} · displayed in a grid on the page
              </p>
            </div>
          </div>
          <button
            onClick={addCard}
            className="
              shrink-0 inline-flex items-center gap-1.5 px-4 py-2
              rounded-xl bg-primary/10 text-primary text-sm font-medium
              transition-luxury hover:bg-primary/20 cursor-pointer active:scale-95
            "
          >
            <Plus size={15} /> Add Card
          </button>
        </div>

        <div className="p-6">

          {/* Empty state */}
          {data.cards.length === 0 ? (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-border/50">
              <LayoutGrid size={36} className="mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No feature cards yet</p>
              <button
                onClick={addCard}
                className="
                  inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-primary/10 text-primary text-sm font-medium
                  transition-luxury hover:bg-primary/20 cursor-pointer
                "
              >
                <Plus size={15} /> Add First Card
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {data.cards.map((card, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="
                    relative rounded-xl border border-border/50 bg-muted/20
                    p-5 space-y-4
                    transition-luxury hover:bg-muted/30
                  "
                >
                  {/* Card number + delete */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                      Card {index + 1}
                    </span>
                    <button
                      onClick={() => deleteCard(index)}
                      title="Delete card"
                      className="
                        flex items-center justify-center h-7 w-7 rounded-lg
                        bg-destructive/10 text-destructive
                        hover:bg-destructive/20 transition-luxury cursor-pointer
                      "
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={card.title}
                      onChange={e => updateCard(index, 'title', e.target.value)}
                      placeholder="e.g. Innovation"
                      className={inputCls}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={card.description}
                      onChange={e => updateCard(index, 'description', e.target.value)}
                      rows={3}
                      placeholder="Short description for this card"
                      className={inputCls}
                    />
                  </div>

                  {/* Icon key */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Icon</label>
                    <select
                      value={card.icon}
                      onChange={e => updateCard(index, 'icon', e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Select an icon…</option>
                      {ICON_OPTIONS.map(key => (
                        <option key={key} value={key} className="capitalize">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Supported: {ICON_OPTIONS.join(', ')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          STICKY SAVE — mobile
      ══════════════════════════════════════ */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 p-4 bg-background/95 backdrop-blur-sm border-t border-border/50">
        <button
          onClick={save}
          disabled={saving}
          className="
            w-full inline-flex items-center justify-center gap-2 px-6 py-3
            rounded-xl bg-primary text-primary-foreground
            text-sm font-medium
            transition-luxury hover-lift hover:shadow-luxury
            cursor-pointer active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          "
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Saving…
            </>
          ) : (
            <>
              <Save size={16} />
              Save Section
            </>
          )}
        </button>
      </div>

      {/* Spacer for mobile sticky button */}
      <div className="sm:hidden h-20" />

    </div>
  )
}
