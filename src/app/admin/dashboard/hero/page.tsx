'use client'

import { useEffect, useState } from 'react'

export default function AdminHeroPage() {
  const [data, setData] = useState<any>({
    title: '',
    tagline: '',
    words: [],
    primaryBtn: { label: '', href: '' },
    secondaryBtn: { label: '', href: '' },
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch('/api/hero')
      .then(res => res.json())
      .then(d => d && setData(d))
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
  return (
    <div className="max-w-4xl space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Hero Section</h1>
        <p className="mt-1 text-muted-foreground">
          Manage main landing page headline and rotating text
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* FORM */}
      <div className="space-y-6">
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
      <div className="pt-4">
        <button
          onClick={save}
          disabled={saving}
          className="
            cursor-pointer rounded-full
            bg-primary px-10 py-3
            font-semibold text-primary-foreground
            transition hover:opacity-90
            disabled:opacity-60
          "
        >
          {saving ? 'Saving...' : 'Save Hero Section'}
        </button>
      </div>
    </div>
  )
}
