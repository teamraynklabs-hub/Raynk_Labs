'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Navigation,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Link as LinkIcon,
  Info,
  ImageIcon,
  Upload,
  RotateCcw,
  CheckCircle,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface NavbarItem {
  _id: string
  title: string
  path: string
  order: number
  isVisible: boolean
  isDropdown: boolean
  parentId: string | null
}

interface FormState {
  title: string
  path: string
  order: number
  isVisible: boolean
  isDropdown: boolean
}

interface LogoConfig {
  logoUrl: string
  logoPublicId: string
}

const EMPTY_FORM: FormState = {
  title: '',
  path: '',
  order: 0,
  isVisible: true,
  isDropdown: false,
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminNavbarPage() {
  /* ── Nav items state ── */
  const [items, setItems]     = useState<NavbarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [open, setOpen]       = useState(false)
  const [editing, setEditing] = useState<NavbarItem | null>(null)
  const [saving, setSaving]   = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm]       = useState<FormState>(EMPTY_FORM)

  /* ── Logo config state ── */
  const [logo, setLogo]               = useState<LogoConfig>({ logoUrl: '/images/logos.png', logoPublicId: '' })
  const [logoLoading, setLogoLoading] = useState(true)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoSaving, setLogoSaving]   = useState(false)
  const [logoResetting, setLogoResetting] = useState(false)
  const [logoSuccess, setLogoSuccess] = useState(false)
  const [logoError, setLogoError]     = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [pendingLogo, setPendingLogo] = useState<{ url: string; publicId: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadItems(); loadLogo() }, [])

  /* ── Load nav items ── */
  async function loadItems() {
    try {
      setLoading(true)
      setError('')
      const res  = await fetch('/api/navbar', { cache: 'no-store', credentials: 'include' })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load navbar items. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Load logo config ── */
  async function loadLogo() {
    try {
      setLogoLoading(true)
      const res  = await fetch('/api/navbar/config', { cache: 'no-store', credentials: 'include' })
      const data = await res.json()
      if (res.ok) setLogo(data)
    } catch {
      /* keep default silently */
    } finally {
      setLogoLoading(false)
    }
  }

  /* ── Handle logo file selection → upload to Cloudinary ── */
  async function handleLogoFile(file: File) {
    if (!file) return
    setLogoError('')
    setLogoSuccess(false)

    const objectUrl = URL.createObjectURL(file)
    setLogoPreview(objectUrl)

    setLogoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setPendingLogo({ url: data.url, publicId: data.public_id })
    } catch (err: any) {
      setLogoError(err.message || 'Image upload failed')
      setLogoPreview(null)
    } finally {
      setLogoUploading(false)
    }
  }

  /* ── Save logo config ── */
  async function saveLogo() {
    if (!pendingLogo) return
    setLogoSaving(true)
    setLogoError('')
    try {
      const res  = await fetch('/api/navbar/config', {
        method:      'PUT',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ logoUrl: pendingLogo.url, logoPublicId: pendingLogo.publicId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save logo')
      setLogo({ logoUrl: data.logoUrl, logoPublicId: data.logoPublicId })
      setPendingLogo(null)
      setLogoPreview(null)
      setLogoSuccess(true)
      setTimeout(() => setLogoSuccess(false), 3000)
    } catch (err: any) {
      setLogoError(err.message || 'Failed to save logo')
    } finally {
      setLogoSaving(false)
    }
  }

  /* ── Reset logo to default ── */
  async function resetLogo() {
    if (!confirm('Reset logo to the default image?')) return
    setLogoResetting(true)
    setLogoError('')
    try {
      const res = await fetch('/api/navbar/config', { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Failed to reset')
      setLogo({ logoUrl: '/images/logos.png', logoPublicId: '' })
      setPendingLogo(null)
      setLogoPreview(null)
      setLogoSuccess(true)
      setTimeout(() => setLogoSuccess(false), 3000)
    } catch (err: any) {
      setLogoError(err.message || 'Failed to reset logo')
    } finally {
      setLogoResetting(false)
    }
  }

  /* ── Discard pending upload ── */
  function discardPending() {
    setPendingLogo(null)
    setLogoPreview(null)
    setLogoError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  /* ── Open add modal ── */
  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_FORM, order: sortedItems.length })
    setOpen(true)
  }

  /* ── Open edit modal ── */
  function openEdit(item: NavbarItem) {
    setEditing(item)
    setForm({
      title:      item.title,
      path:       item.path,
      order:      item.order,
      isVisible:  item.isVisible,
      isDropdown: item.isDropdown,
    })
    setOpen(true)
  }

  /* ── Save nav item (create / update) ── */
  async function save() {
    if (!form.title.trim() || !form.path.trim()) {
      alert('Label and path are required.')
      return
    }

    setSaving(true)
    try {
      const body = editing ? { id: editing._id, ...form } : form
      const res  = await fetch('/api/navbar', {
        method:      editing ? 'PUT' : 'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || 'Failed to save.'); return }
      setOpen(false)
      loadItems()
    } catch {
      alert('Failed to save navbar item.')
    } finally {
      setSaving(false)
    }
  }

  /* ── Toggle visibility ── */
  async function toggleVisibility(item: NavbarItem) {
    try {
      await fetch('/api/navbar', {
        method:      'PUT',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ id: item._id, isVisible: !item.isVisible }),
      })
      loadItems()
    } catch {
      alert('Failed to update visibility.')
    }
  }

  /* ── Delete ── */
  async function remove(id: string) {
    if (!confirm('Delete this navbar item? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/navbar', {
        method:      'DELETE',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ id }),
      })
      if (res.ok) loadItems()
      else alert('Failed to delete item.')
    } catch {
      alert('Failed to delete item.')
    } finally {
      setDeletingId(null)
    }
  }

  /* ── Reorder (swap adjacent items) ── */
  async function moveItem(item: NavbarItem, direction: 'up' | 'down') {
    const idx     = sortedItems.findIndex(i => i._id === item._id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sortedItems.length) return

    const swapItem = sortedItems[swapIdx]
    try {
      await fetch('/api/navbar', {
        method:      'PATCH',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({
          items: [
            { id: item._id,     order: swapItem.order },
            { id: swapItem._id, order: item.order },
          ],
        }),
      })
      loadItems()
    } catch {
      alert('Failed to reorder items.')
    }
  }

  /* ── Derived sorted list ── */
  const sortedItems = [...items].sort((a, b) => a.order - b.order)

  /* ── Current logo to display ── */
  const displayLogoUrl = logoPreview || logo.logoUrl

  /* ────────────── Loading state ────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  /* ────────────── Render ────────────── */
  return (
    <div className="space-y-8">

      {/* ══════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-primary">
            Navbar Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control your site logo and navigation links
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            rounded-xl bg-primary text-primary-foreground
            text-sm font-medium
            transition-luxury hover-lift hover:shadow-luxury
            cursor-pointer active:scale-95
          "
        >
          <Plus size={18} />
          Add Link
        </button>
      </div>

      {/* ══════════════════════════════════════
          ERROR BANNER
      ══════════════════════════════════════ */}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ══════════════════════════════════════
          LOGO MANAGEMENT SECTION
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-soft overflow-hidden">

        {/* Section header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
            <ImageIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Logo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload a new logo or reset to the default image
            </p>
          </div>
        </div>

        <div className="p-6">
          {logoLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start gap-6">

              {/* Current / Preview logo */}
              <div className="shrink-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {pendingLogo ? 'Preview (unsaved)' : 'Current Logo'}
                </p>
                <div
                  className={`
                    relative flex items-center justify-center w-48 h-24
                    rounded-xl border-2 bg-muted/30
                    overflow-hidden
                    ${pendingLogo
                      ? 'border-primary/50 ring-2 ring-primary/20'
                      : 'border-border/50'}
                  `}
                >
                  {logoUploading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-xs">Uploading…</span>
                    </div>
                  ) : (
                    <Image
                      src={displayLogoUrl}
                      alt="Site logo"
                      fill
                      className="object-contain p-3"
                      unoptimized
                    />
                  )}
                  {pendingLogo && !logoUploading && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                      NEW
                    </span>
                  )}
                </div>
              </div>

              {/* Upload controls */}
              <div className="flex-1 space-y-4">

                {/* Logo error */}
                {logoError && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{logoError}</span>
                  </div>
                )}

                {/* Logo success */}
                {logoSuccess && (
                  <div className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2">
                    <CheckCircle size={15} className="shrink-0" />
                    <span>Logo updated successfully!</span>
                  </div>
                )}

                {/* File input */}
                <div>
                  <p className="text-sm font-semibold mb-2">Upload new logo</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Recommended: PNG or SVG with transparent background, at least 200×60 px.
                  </p>

                  <label
                    className="
                      flex items-center gap-3 w-full px-4 py-3
                      rounded-xl border-2 border-dashed border-border/60
                      bg-muted/30 hover:bg-muted/50 hover:border-primary/40
                      text-sm text-muted-foreground
                      transition-luxury cursor-pointer
                    "
                  >
                    <Upload size={16} className="shrink-0 text-primary" />
                    <span>
                      {logoUploading ? 'Uploading to Cloudinary…' : 'Click to choose a file'}
                    </span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={logoUploading}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleLogoFile(file)
                      }}
                    />
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 pt-1">
                  {pendingLogo && (
                    <>
                      <button
                        onClick={saveLogo}
                        disabled={logoSaving}
                        className="
                          inline-flex items-center gap-2 px-5 py-2.5
                          rounded-xl bg-primary text-primary-foreground
                          text-sm font-medium
                          transition-luxury hover-lift hover:shadow-luxury
                          cursor-pointer active:scale-95
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                        "
                      >
                        {logoSaving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Save Logo
                          </>
                        )}
                      </button>

                      <button
                        onClick={discardPending}
                        className="
                          inline-flex items-center gap-2 px-4 py-2.5
                          rounded-xl border border-border/50 bg-muted/50 hover:bg-muted
                          text-sm font-medium
                          transition-luxury cursor-pointer active:scale-95
                        "
                      >
                        <X size={15} />
                        Discard
                      </button>
                    </>
                  )}

                  {/* Reset to default */}
                  {logo.logoPublicId && !pendingLogo && (
                    <button
                      onClick={resetLogo}
                      disabled={logoResetting}
                      className="
                        inline-flex items-center gap-2 px-4 py-2.5
                        rounded-xl border border-destructive/40 bg-destructive/5 text-destructive
                        hover:bg-destructive/10
                        text-sm font-medium
                        transition-luxury cursor-pointer active:scale-95
                        disabled:opacity-50 disabled:cursor-not-allowed
                      "
                    >
                      {logoResetting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                          Resetting…
                        </>
                      ) : (
                        <>
                          <RotateCcw size={15} />
                          Reset to Default
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          INFO BANNER
      ══════════════════════════════════════ */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2.5">
        <Info size={15} className="text-primary mt-0.5 shrink-0" />
        <span>
          Changes are reflected on your site immediately. Hidden items are saved but not shown to visitors.
          Use the <span className="text-foreground font-medium">eye icon</span> to toggle visibility, or the{' '}
          <span className="text-foreground font-medium">arrows</span> to reorder links.
        </span>
      </div>

      {/* ══════════════════════════════════════
          EMPTY STATE
      ══════════════════════════════════════ */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50 shadow-soft">
          <Navigation className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No navbar items yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your first navigation link to get started
          </p>
          <button
            onClick={openAdd}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-primary/10 text-primary
              text-sm font-medium
              transition-luxury hover:bg-primary/20
              cursor-pointer
            "
          >
            <Plus size={16} />
            Add Link
          </button>
        </div>

      ) : (

        /* ══════════════════════════════════════
            ITEMS TABLE
        ══════════════════════════════════════ */
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-soft">

          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[3rem_1fr_1fr_6rem_5rem_5.5rem] gap-4 px-5 py-3 border-b border-border/50 bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Order</span>
            <span>Label</span>
            <span>Path</span>
            <span className="text-center">Visible</span>
            <span className="text-center">Status</span>
            <span className="text-center">Actions</span>
          </div>

          <div className="divide-y divide-border/30">
            {sortedItems.map((item, idx) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`
                  flex flex-col sm:grid sm:grid-cols-[3rem_1fr_1fr_6rem_5rem_5.5rem]
                  gap-3 sm:gap-4 items-start sm:items-center
                  px-5 py-4 transition-luxury hover:bg-muted/20
                  ${!item.isVisible ? 'opacity-60' : ''}
                `}
              >
                {/* Order controls */}
                <div className="flex sm:flex-col items-center gap-1">
                  <button
                    onClick={() => moveItem(item, 'up')}
                    disabled={idx === 0}
                    title="Move up"
                    className="p-1 rounded-md hover:bg-muted disabled:opacity-25 transition-luxury cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <span className="text-xs font-mono text-muted-foreground w-5 text-center select-none">
                    {idx + 1}
                  </span>
                  <button
                    onClick={() => moveItem(item, 'down')}
                    disabled={idx === sortedItems.length - 1}
                    title="Move down"
                    className="p-1 rounded-md hover:bg-muted disabled:opacity-25 transition-luxury cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Label */}
                <div className="min-w-0 flex-1 sm:flex-none">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                </div>

                {/* Path */}
                <div className="min-w-0 flex items-center gap-1.5">
                  <LinkIcon size={12} className="text-muted-foreground shrink-0" />
                  <code className="text-xs text-muted-foreground truncate font-mono">
                    {item.path}
                  </code>
                </div>

                {/* Visibility toggle */}
                <div className="flex sm:justify-center">
                  <button
                    onClick={() => toggleVisibility(item)}
                    title={item.isVisible ? 'Click to hide' : 'Click to show'}
                    className={`
                      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                      text-xs font-medium transition-luxury cursor-pointer
                      ${item.isVisible
                        ? 'text-success bg-success/10 hover:bg-success/20'
                        : 'text-muted-foreground bg-muted hover:bg-muted/80'}
                    `}
                  >
                    {item.isVisible
                      ? <><Eye size={13} /><span className="hidden sm:inline">Hide</span></>
                      : <><EyeOff size={13} /><span className="hidden sm:inline">Show</span></>
                    }
                  </button>
                </div>

                {/* Status badge */}
                <div className="hidden sm:flex sm:justify-center">
                  <span
                    className={`
                      inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${item.isVisible
                        ? 'bg-success/15 text-success'
                        : 'bg-muted text-muted-foreground'}
                    `}
                  >
                    {item.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 sm:justify-center">
                  <button
                    onClick={() => openEdit(item)}
                    title="Edit"
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-luxury cursor-pointer"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    disabled={deletingId === item._id}
                    title="Delete"
                    className="flex items-center justify-center h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-luxury cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === item._id
                      ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-full max-w-lg rounded-2xl bg-card border border-border/50 p-6 shadow-luxury"
              onClick={e => e.stopPropagation()}
            >

              {/* Modal header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Navigation size={18} />
                  </div>
                  <h2 className="text-xl font-bold">
                    {editing ? 'Edit Navigation Link' : 'Add Navigation Link'}
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-muted transition-luxury cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4">

                {/* Label */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Label <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. About Us"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="
                      w-full rounded-xl border border-border bg-muted/50
                      px-4 py-3 text-sm
                      transition-luxury
                      focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                    "
                  />
                </div>

                {/* Path */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Path <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. /about"
                    value={form.path}
                    onChange={e => setForm(f => ({ ...f, path: e.target.value }))}
                    className="
                      w-full rounded-xl border border-border bg-muted/50
                      px-4 py-3 text-sm
                      transition-luxury
                      focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                    "
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Use a relative path like <code className="text-primary">/about</code> or a full URL.
                  </p>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                    className="
                      w-full rounded-xl border border-border bg-muted/50
                      px-4 py-3 text-sm
                      transition-luxury
                      focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                    "
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Lower numbers appear first. You can also reorder using the arrows on the list.
                  </p>
                </div>

                {/* Visibility toggle */}
                <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold">Visible to visitors</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Show or hide this link in the public navbar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, isVisible: !f.isVisible }))}
                    role="switch"
                    aria-checked={form.isVisible}
                    className={`
                      relative h-6 w-11 rounded-full transition-luxury cursor-pointer focus:outline-none
                      ${form.isVisible ? 'bg-primary' : 'bg-muted-foreground/30'}
                    `}
                  >
                    <span
                      className={`
                        absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow-sm
                        transition-luxury
                        ${form.isVisible ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>

                {/* Modal action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setOpen(false)}
                    className="
                      flex-1 px-4 py-3 rounded-xl
                      border border-border/50 bg-muted/50 hover:bg-muted
                      text-sm font-medium
                      transition-luxury cursor-pointer active:scale-95
                    "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="
                      flex-1 px-4 py-3 rounded-xl
                      bg-primary text-primary-foreground
                      text-sm font-medium
                      transition-luxury hover-lift hover:shadow-luxury
                      cursor-pointer active:scale-95
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    "
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      editing ? 'Save Changes' : 'Add Link'
                    )}
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
