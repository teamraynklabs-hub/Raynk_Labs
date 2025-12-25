'use client'

import { useEffect, useState } from 'react'

export default function AdminAboutPage() {
  const [data, setData] = useState<any>({
    heading: '',
    description: '',
    cards: [],
  })

  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(d => d && setData(d))
  }, [])

  async function save() {
    await fetch('/api/about', {
      method: data._id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data._id ? data : data),
    })
    alert('Saved')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">About Section</h1>

      <input
        value={data.heading}
        onChange={e =>
          setData({ ...data, heading: e.target.value })
        }
        placeholder="Heading"
        className="w-full rounded-xl border px-4 py-3"
      />

      <textarea
        value={data.description}
        onChange={e =>
          setData({ ...data, description: e.target.value })
        }
        placeholder="Description"
        rows={4}
        className="w-full rounded-xl border px-4 py-3"
      />

      <button
        onClick={save}
        className="rounded-full bg-primary px-8 py-3 text-primary-foreground font-semibold"
      >
        Save Section
      </button>
    </div>
  )
}
