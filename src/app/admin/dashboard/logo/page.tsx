'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ImageIcon,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  X,
  Info,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface LogoConfig {
  logoUrl: string
  logoPublicId: string
  updatedAt?: string
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function AdminLogoPage() {
  const [config, setConfig]         = useState<LogoConfig>({ logoUrl: '/images/logos.png', logoPublicId: '' })
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [resetting, setResetting]   = useState(false)
  const [success, setSuccess]       = useState('')
  const [error, setError]           = useState('')
  const [preview, setPreview]       = useState<string | null>(null)
  const [pending, setPending]       = useState<{ url: string; publicId: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadConfig() }, [])

  /* ── Load config ── */
  async function loadConfig() {
    try {
      setLoading(true)
      const res  = await fetch('/api/navbar/config', { cache: 'no-store', credentials: 'include' })
      const data = await res.json()
      if (res.ok) setConfig(data)
    } catch {
      setError('Failed to load logo configuration.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Handle file pick → upload to Cloudinary ── */
  async function handleFile(file: File) {
    setError('')
    setSuccess('')
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      setPending({ url: data.url, publicId: data.public_id })
    } catch (err: any) {
      setError(err.message || 'Image upload failed')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  /* ── Save to DB ── */
  async function save() {
    if (!pending) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res  = await fetch('/api/navbar/config', {
        method:      'PUT',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ logoUrl: pending.url, logoPublicId: pending.publicId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save')
      setConfig(data)
      setPending(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setSuccess('Logo saved and live on the site!')
    } catch (err: any) {
      setError(err.message || 'Failed to save logo')
    } finally {
      setSaving(false)
    }
  }

  /* ── Reset to default ── */
  async function reset() {
    if (!confirm('Reset the logo to the default image? The current Cloudinary image will be deleted.')) return
    setResetting(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/navbar/config', { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Reset failed')
      setConfig({ logoUrl: '/images/logos.png', logoPublicId: '' })
      setPending(null)
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      setSuccess('Logo reset to the default image.')
    } catch (err: any) {
      setError(err.message || 'Failed to reset')
    } finally {
      setResetting(false)
    }
  }

  /* ── Discard pending ── */
  function discard() {
    setPending(null)
    setPreview(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const displayUrl = preview || config.logoUrl
  const hasPending = !!pending

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">

      {/* ══════════════════════════════════════
          PAGE HEADER
      ══════════════════════════════════════ */}
      <div>
        <h1 className="text-gradient-primary">Logo & Branding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage the site logo displayed in the navigation bar
        </p>
      </div>

      {/* ══════════════════════════════════════
          ALERTS
      ══════════════════════════════════════ */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="shrink-0 hover:text-destructive/80 transition-luxury cursor-pointer">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success flex items-center gap-2"
        >
          <CheckCircle size={16} className="shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess('')} className="shrink-0 hover:text-success/80 transition-luxury cursor-pointer">
            <X size={14} />
          </button>
        </motion.div>
      )}

      {/* ══════════════════════════════════════
          CURRENT LOGO CARD
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-soft overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
            <ImageIcon size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {hasPending ? 'Preview (unsaved)' : 'Current Logo'}
            </h2>
            {config.updatedAt && !hasPending && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Last updated: {new Date(config.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 flex items-center justify-center bg-[repeating-conic-gradient(var(--muted)/50%_0_25%,transparent_0_50%)_0_0/20px_20px]">
          <div
            className={`
              relative flex items-center justify-center w-64 h-32
              rounded-2xl border-2 bg-card overflow-hidden shadow-soft
              ${hasPending ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border/50'}
            `}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-xs">Uploading…</span>
              </div>
            ) : (
              <Image
                src={displayUrl}
                alt="Site logo"
                fill
                className="object-contain p-4"
                unoptimized
              />
            )}
            {hasPending && !uploading && (
              <span className="absolute top-2 right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                PREVIEW
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          UPLOAD CARD
      ══════════════════════════════════════ */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-soft overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
            <Upload size={18} />
          </div>
          <div>
            <h2 className="text-base font-semibold">Upload New Logo</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stored on Cloudinary. Recommended: PNG or SVG, transparent background
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Dropzone */}
          <label
            className={`
              flex flex-col items-center gap-3 w-full px-6 py-10
              rounded-xl border-2 border-dashed
              bg-muted/20 hover:bg-muted/40
              text-sm text-muted-foreground
              transition-luxury cursor-pointer
              ${uploading ? 'opacity-60 cursor-not-allowed border-border/40' : 'border-border/60 hover:border-primary/50'}
            `}
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
              <Upload size={22} />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                {uploading ? 'Uploading to Cloudinary…' : 'Click to choose a file'}
              </p>
              <p className="text-xs mt-1">PNG, JPG, SVG, WebP — max 5 MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </label>

          {/* Info */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground flex items-start gap-2">
            <Info size={14} className="text-primary mt-0.5 shrink-0" />
            <span>
              After uploading, click <span className="text-foreground font-medium">Save Logo</span> to make it live.
              The preview above shows how it will look before saving.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {hasPending && (
              <>
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
                  "
                >
                  {saving ? (
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
                  onClick={discard}
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

            {config.logoPublicId && !hasPending && (
              <button
                onClick={reset}
                disabled={resetting}
                className="
                  inline-flex items-center gap-2 px-4 py-2.5
                  rounded-xl border border-destructive/40 bg-destructive/5 text-destructive
                  hover:bg-destructive/10
                  text-sm font-medium
                  transition-luxury cursor-pointer active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {resetting ? (
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

    </div>
  )
}
