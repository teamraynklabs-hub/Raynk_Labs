'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

export default function AdminCommunityPage() {
  const [data, setData] = useState<any>({
    _id: '',
    title: '',
    description: '',
    points: [],
    ctaText: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/community')
      .then(res => res.json())
      .then(d => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/community', {
        method: data._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      alert('Community section updated')
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  /* ================= INPUT STYLE ================= */
  const inputStyle = `
    w-full rounded-xl border border-border
    bg-background px-4 py-3 text-sm
    placeholder:text-muted-foreground
    transition
    focus:border-primary
    focus:ring-2 focus:ring-primary/30
    outline-none
  `

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
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Community Section
        </h1>
        <Users className="text-primary" size={28} />
      </div>
      <p className="text-sm text-muted-foreground">
        Manage community engagement content and call-to-action
      </p>

      {/* FORM CARD */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-6 shadow-sm">
        {/* TITLE */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Section Title</label>
          <input
            className={inputStyle}
            placeholder="Join Our Growing Community"
            value={data.title}
            onChange={e =>
              setData({ ...data, title: e.target.value })
            }
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Description</label>
          <textarea
            className={inputStyle}
            rows={3}
            placeholder="Community description..."
            value={data.description}
            onChange={e =>
              setData({ ...data, description: e.target.value })
            }
          />
        </div>

        {/* POINTS */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Key Points</label>
          <input
            className={inputStyle}
            placeholder="Learn Together, Build Projects, Share Knowledge"
            value={data.points.join(', ')}
            onChange={e =>
              setData({
                ...data,
                points: e.target.value
                  .split(',')
                  .map((p: string) => p.trim())
                  .filter(Boolean),
              })
            }
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate points with commas
          </p>
        </div>

        {/* CTA TEXT */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Call-to-Action Button Text</label>
          <input
            className={inputStyle}
            placeholder="Join Community"
            value={data.ctaText}
            onChange={e =>
              setData({ ...data, ctaText: e.target.value })
            }
          />
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={saving}
          className="
            cursor-pointer
            rounded-full
            bg-linear-to-r from-primary to-purple-600
            px-10 py-3
            font-semibold text-primary-foreground
            transition hover:opacity-90 hover:scale-105 active:scale-95
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {saving ? 'Saving...' : 'Save Community Section'}
        </button>
      </div>
    </motion.div>
  )
}
