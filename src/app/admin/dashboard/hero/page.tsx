'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function AdminHeroPage() {
  const [data, setData] = useState<any>({
    title: '',
    tagline: '',
    words: [],
    primaryBtn: { label: '', href: '' },
    secondaryBtn: { label: '', href: '' },
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* ================= FETCH ================= */
  useEffect(() => {
    setLoading(true)
    fetch('/api/hero')
      .then(res => res.json())
      .then(d => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  /* ================= SAVE ================= */
  async function save() {
    setError('')

    if (!data.title.trim()) {
      setError('Title is required')
      return
    }

    if (!data.tagline.trim()) {
      setError('Tagline is required')
      return
    }

    if (!data.words.length) {
      setError('At least one rotating word is required')
      return
    }

    setSaving(true)

    await fetch('/api/hero', {
      method: data._id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setSaving(false)
    alert('Hero section updated')
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Hero Section
          </h1>
          <Sparkles className="text-primary" size={28} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage main landing page headline and rotating text
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/40">
          {error}
        </div>
      )}

      {/* FORM */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-6 shadow-sm">
        {/* TITLE */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Main Title
          </label>
          <input
            value={data.title}
            onChange={e =>
              setData({ ...data, title: e.target.value })
            }
            placeholder="Empowering Students to Build the Future"
            className="
              w-full rounded-xl border border-input
              bg-background px-4 py-3
              placeholder:text-muted-foreground
              transition focus:border-primary
              focus:ring-2 focus:ring-primary/30 outline-none
            "
          />
        </div>

        {/* TAGLINE */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Tagline
          </label>
          <textarea
            rows={3}
            value={data.tagline}
            onChange={e =>
              setData({ ...data, tagline: e.target.value })
            }
            placeholder="Learn real skills. Build real products. Grow with community."
            className="
              w-full rounded-xl border border-input
              bg-background px-4 py-3
              placeholder:text-muted-foreground
              transition focus:border-primary
              focus:ring-2 focus:ring-primary/30 outline-none
            "
          />
        </div>

        {/* WORDS */}
        <div>
          <label className="mb-2 block text-sm font-medium">
            Rotating Words
          </label>
          <input
            value={data.words.join(',')}
            onChange={e =>
              setData({
                ...data,
                words: e.target.value
                  .split(',')
                  .map((w: string) => w.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Learn, Build, Innovate, Grow"
            className="
              w-full rounded-xl border border-input
              bg-background px-4 py-3
              placeholder:text-muted-foreground
              transition focus:border-primary
              focus:ring-2 focus:ring-primary/30 outline-none
            "
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Separate words using commas
          </p>
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="
            cursor-pointer rounded-full
            bg-linear-to-r from-primary to-purple-600 px-10 py-3
            font-semibold text-primary-foreground
            transition hover:opacity-90 hover:scale-105 active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Saving...' : 'Save Hero Section'}
        </button>
      </div>
    </motion.div>
  )
}
