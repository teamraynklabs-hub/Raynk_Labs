'use client'

import { useEffect, useState } from 'react'

export default function AdminCommunityPage() {
  const [data, setData] = useState<any>({
    _id: '',
    title: '',
    description: '',
    points: [],
    ctaText: '',
  })

  useEffect(() => {
    fetch('/api/community')
      .then(res => res.json())
      .then(d => d && setData(d))
  }, [])

  async function save() {
    await fetch('/api/community', {
      method: data._id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    alert('Community section updated')
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <h1 className="text-3xl font-bold">
        Community Section
      </h1>

      {/* TITLE */}
      <input
        className={inputStyle}
        placeholder="Title"
        value={data.title}
        onChange={e =>
          setData({ ...data, title: e.target.value })
        }
      />

      {/* DESCRIPTION */}
      <textarea
        className={inputStyle}
        rows={3}
        placeholder="Description"
        value={data.description}
        onChange={e =>
          setData({ ...data, description: e.target.value })
        }
      />

      {/* POINTS */}
      <input
        className={inputStyle}
        placeholder="Points (comma separated)"
        value={data.points.join(',')}
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

      {/* CTA TEXT */}
      <input
        className={inputStyle}
        placeholder="CTA Button Text"
        value={data.ctaText}
        onChange={e =>
          setData({ ...data, ctaText: e.target.value })
        }
      />

      {/* SAVE BUTTON */}
      <button
        onClick={save}
        className="
          cursor-pointer
          rounded-full
          bg-gradient-to-r from-primary to-[var(--electric-purple)]
          px-8 py-3
          font-semibold text-primary-foreground
          transition hover:shadow-xl
        "
      >
        Save Community
      </button>
    </div>
  )
}
