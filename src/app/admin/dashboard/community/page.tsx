'use client'

import { useEffect, useState } from 'react'

export default function AdminCommunityPage() {
  const [data, setData] = useState<any>({
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Community Section</h1>

      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Title"
        value={data.title}
        onChange={e => setData({ ...data, title: e.target.value })}
      />

      <textarea
        className="w-full rounded-xl border px-4 py-3"
        rows={3}
        placeholder="Description"
        value={data.description}
        onChange={e => setData({ ...data, description: e.target.value })}
      />

      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Points (comma separated)"
        value={data.points.join(',')}
        onChange={e =>
          setData({ ...data, points: e.target.value.split(',') })
        }
      />

      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder="CTA Button Text"
        value={data.ctaText}
        onChange={e => setData({ ...data, ctaText: e.target.value })}
      />

      <button
        onClick={save}
        className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground"
      >
        Save Community
      </button>
    </div>
  )
}
