'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Footprints,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Link as LinkIcon,
  Share2,
  Mail,
  Phone,
  MapPin,
  Type,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface SocialLink {
  _id?: string
  platform: string
  href: string
  order: number
  isVisible: boolean
}

interface QuickLink {
  _id?: string
  label: string
  href: string
  order: number
  isVisible: boolean
}

interface FooterData {
  _id?: string
  brandName: string
  brandTagline: string
  socialLinks: SocialLink[]
  quickLinks: QuickLink[]
  email: string
  phone: string
  location: string
  copyright: string
}

const PLATFORMS = ['github', 'linkedin', 'instagram', 'youtube', 'twitter', 'facebook']

const EMPTY_SOCIAL: Omit<SocialLink, '_id'> = {
  platform: 'github',
  href: '',
  order: 0,
  isVisible: true,
}

const EMPTY_QUICK: Omit<QuickLink, '_id'> = {
  label: '',
  href: '',
  order: 0,
  isVisible: true,
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function uid() {
  return Math.random().toString(36).slice(2)
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminFooterPage() {
  const [data, setData]     = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  /* ── Load ── */
  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/footer', { cache: 'no-store', credentials: 'include' })
      const d   = await res.json()
      if (res.ok) setData(d)
      else setError('Failed to load footer data.')
    } catch {
      setError('Failed to load footer data.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Save ── */
  async function save() {
    if (!data) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res  = await fetch('/api/footer', {
        method:      'PUT',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(data),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message || 'Save failed')
      setData(d)
      setSuccess('Footer saved and live on the site!')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to save footer')
    } finally {
      setSaving(false)
    }
  }

  /* ── Social helpers ── */
  function addSocial() {
    if (!data) return
    setData({
      ...data,
      socialLinks: [
        ...data.socialLinks,
        { ...EMPTY_SOCIAL, _id: uid(), order: data.socialLinks.length },
      ],
    })
  }

  function updateSocial(idx: number, field: keyof SocialLink, value: any) {
    if (!data) return
    const arr = [...data.socialLinks]
    ;(arr[idx] as any)[field] = value
    setData({ ...data, socialLinks: arr })
  }

  function removeSocial(idx: number) {
    if (!data) return
    setData({ ...data, socialLinks: data.socialLinks.filter((_, i) => i !== idx) })
  }

  function moveSocial(idx: number, dir: 'up' | 'down') {
    if (!data) return
    const arr   = [...data.socialLinks]
    const swap  = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx].order, arr[swap].order] = [arr[swap].order, arr[idx].order]
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    setData({ ...data, socialLinks: arr })
  }

  /* ── Quick link helpers ── */
  function addQuick() {
    if (!data) return
    setData({
      ...data,
      quickLinks: [
        ...data.quickLinks,
        { ...EMPTY_QUICK, _id: uid(), order: data.quickLinks.length },
      ],
    })
  }

  function updateQuick(idx: number, field: keyof QuickLink, value: any) {
    if (!data) return
    const arr = [...data.quickLinks]
    ;(arr[idx] as any)[field] = value
    setData({ ...data, quickLinks: arr })
  }

  function removeQuick(idx: number) {
    if (!data) return
    setData({ ...data, quickLinks: data.quickLinks.filter((_, i) => i !== idx) })
  }

  function moveQuick(idx: number, dir: 'up' | 'down') {
    if (!data) return
    const arr   = [...data.quickLinks]
    const swap  = dir === 'up' ? idx - 1 : idx + 1
    if (swap < 0 || swap >= arr.length) return
    ;[arr[idx].order, arr[swap].order] = [arr[swap].order, arr[idx].order]
    ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
    setData({ ...data, quickLinks: arr })
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <AlertCircle size={40} className="text-destructive" />
        <p className="text-muted-foreground">{error || 'Could not load footer data.'}</p>
        <button
          onClick={load}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-luxury hover-lift hover:shadow-luxury cursor-pointer"
        >
          Retry
        </button>
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
          <h1 className="text-gradient-primary">Footer Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control all footer content — brand, links, social & contact
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
              Save Footer
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
            <button onClick={() => setError('')} className="shrink-0 cursor-pointer hover:text-destructive/80 transition-luxury"><X size={14} /></button>
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
            <button onClick={() => setSuccess('')} className="shrink-0 cursor-pointer hover:text-success/80 transition-luxury"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          INFO
      ══════════════════════════════════════ */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2.5">
        <Info size={15} className="text-primary mt-0.5 shrink-0" />
        <span>
          All changes are published live after clicking{' '}
          <span className="text-foreground font-medium">Save Footer</span>.
          Hidden social/quick links are saved but not shown to visitors.
        </span>
      </div>

      {/* ══════════════════════════════════════
          BRAND SECTION
      ══════════════════════════════════════ */}
      <Section icon={<Type size={18} />} title="Brand" description="Footer brand name and tagline">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold mb-2">Brand Name</label>
            <input
              value={data.brandName}
              onChange={e => setData({ ...data, brandName: e.target.value })}
              placeholder="RaYnk Labs"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Copyright Text</label>
            <input
              value={data.copyright}
              onChange={e => setData({ ...data, copyright: e.target.value })}
              placeholder="RaYnk Labs. All rights reserved."
              className={inputCls}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Displayed as: © {new Date().getFullYear()} {data.copyright || '…'}
            </p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Tagline</label>
          <textarea
            value={data.brandTagline}
            onChange={e => setData({ ...data, brandTagline: e.target.value })}
            rows={2}
            placeholder="Short brand description shown in the footer"
            className={inputCls}
          />
        </div>
      </Section>

      {/* ══════════════════════════════════════
          CONTACT SECTION
      ══════════════════════════════════════ */}
      <Section icon={<Mail size={18} />} title="Contact Info" description="Email, phone and location">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Mail size={13} className="text-primary" /> Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={e => setData({ ...data, email: e.target.value })}
              placeholder="team@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
              <Phone size={13} className="text-primary" /> Phone
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={e => setData({ ...data, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
              <MapPin size={13} className="text-primary" /> Location
            </label>
            <input
              value={data.location}
              onChange={e => setData({ ...data, location: e.target.value })}
              placeholder="India"
              className={inputCls}
            />
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════
          SOCIAL LINKS
      ══════════════════════════════════════ */}
      <Section
        icon={<Share2 size={18} />}
        title="Social Links"
        description="Social media profiles shown in the footer"
        action={
          <button
            onClick={addSocial}
            className="
              inline-flex items-center gap-1.5 px-4 py-2
              rounded-xl bg-primary/10 text-primary text-sm font-medium
              transition-luxury hover:bg-primary/20 cursor-pointer active:scale-95
            "
          >
            <Plus size={15} /> Add
          </button>
        }
      >
        {data.socialLinks.length === 0 ? (
          <EmptyState label="No social links yet. Click Add to create one." />
        ) : (
          <div className="space-y-3">
            {data.socialLinks.map((s, idx) => (
              <motion.div
                key={s._id ?? idx}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`
                  flex flex-col sm:flex-row sm:items-center gap-3
                  rounded-xl border border-border/50 bg-muted/20 p-4
                  transition-luxury hover:bg-muted/30
                  ${!s.isVisible ? 'opacity-60' : ''}
                `}
              >
                {/* Order controls */}
                <div className="flex sm:flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveSocial(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-md hover:bg-muted disabled:opacity-25 transition-luxury cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className="text-xs font-mono text-muted-foreground w-5 text-center">{idx + 1}</span>
                  <button
                    onClick={() => moveSocial(idx, 'down')}
                    disabled={idx === data.socialLinks.length - 1}
                    className="p-1 rounded-md hover:bg-muted disabled:opacity-25 transition-luxury cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Platform select */}
                <select
                  value={s.platform}
                  onChange={e => updateSocial(idx, 'platform', e.target.value)}
                  className={`${inputCls} w-full sm:w-36 capitalize`}
                >
                  {PLATFORMS.map(p => (
                    <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>

                {/* URL */}
                <input
                  value={s.href}
                  onChange={e => updateSocial(idx, 'href', e.target.value)}
                  placeholder="https://..."
                  className={`${inputCls} flex-1`}
                />

                {/* Visibility + delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateSocial(idx, 'isVisible', !s.isVisible)}
                    title={s.isVisible ? 'Hide' : 'Show'}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      transition-luxury cursor-pointer
                      ${s.isVisible ? 'text-success bg-success/10 hover:bg-success/20' : 'text-muted-foreground bg-muted hover:bg-muted/80'}
                    `}
                  >
                    {s.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => removeSocial(idx)}
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-luxury cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════
          QUICK LINKS
      ══════════════════════════════════════ */}
      <Section
        icon={<LinkIcon size={18} />}
        title="Quick Links"
        description="Navigation links shown in the footer"
        action={
          <button
            onClick={addQuick}
            className="
              inline-flex items-center gap-1.5 px-4 py-2
              rounded-xl bg-primary/10 text-primary text-sm font-medium
              transition-luxury hover:bg-primary/20 cursor-pointer active:scale-95
            "
          >
            <Plus size={15} /> Add
          </button>
        }
      >
        {data.quickLinks.length === 0 ? (
          <EmptyState label="No quick links yet. Click Add to create one." />
        ) : (
          <div className="space-y-3">
            {data.quickLinks.map((l, idx) => (
              <motion.div
                key={l._id ?? idx}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`
                  flex flex-col sm:flex-row sm:items-center gap-3
                  rounded-xl border border-border/50 bg-muted/20 p-4
                  transition-luxury hover:bg-muted/30
                  ${!l.isVisible ? 'opacity-60' : ''}
                `}
              >
                {/* Order controls */}
                <div className="flex sm:flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveQuick(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded-md hover:bg-muted disabled:opacity-25 transition-luxury cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className="text-xs font-mono text-muted-foreground w-5 text-center">{idx + 1}</span>
                  <button
                    onClick={() => moveQuick(idx, 'down')}
                    disabled={idx === data.quickLinks.length - 1}
                    className="p-1 rounded-md hover:bg-muted disabled:opacity-25 transition-luxury cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Label */}
                <input
                  value={l.label}
                  onChange={e => updateQuick(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. Services)"
                  className={`${inputCls} w-full sm:w-40`}
                />

                {/* Path */}
                <input
                  value={l.href}
                  onChange={e => updateQuick(idx, 'href', e.target.value)}
                  placeholder="/path or https://..."
                  className={`${inputCls} flex-1`}
                />

                {/* Visibility + delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuick(idx, 'isVisible', !l.isVisible)}
                    title={l.isVisible ? 'Hide' : 'Show'}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      transition-luxury cursor-pointer
                      ${l.isVisible ? 'text-success bg-success/10 hover:bg-success/20' : 'text-muted-foreground bg-muted hover:bg-muted/80'}
                    `}
                  >
                    {l.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={() => removeQuick(idx)}
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-luxury cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════
          STICKY SAVE (mobile)
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
              Save Footer
            </>
          )}
        </button>
      </div>

      {/* spacer for mobile sticky button */}
      <div className="sm:hidden h-20" />

    </div>
  )
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
const inputCls = `
  w-full rounded-xl border border-border bg-muted/50
  px-4 py-2.5 text-sm
  transition-luxury
  focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
  placeholder:text-muted-foreground
`

function Section({
  icon, title, description, children, action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {/* Body */}
      <div className="p-6 space-y-4">{children}</div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <p className="text-center py-6 text-sm text-muted-foreground/70 rounded-xl border border-dashed border-border/50">
      {label}
    </p>
  )
}
