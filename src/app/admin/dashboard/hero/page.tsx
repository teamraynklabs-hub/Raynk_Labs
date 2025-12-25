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

  useEffect(() => {
    fetch('/api/hero')
      .then(res => res.json())
      .then(d => d && setData(d))
  }, [])

  async function save() {
    await fetch('/api/hero', {
      method: data._id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    alert('Hero updated')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Hero Section</h1>

      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Title"
        value={data.title}
        onChange={e => setData({ ...data, title: e.target.value })}
      />

      <textarea
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Tagline"
        rows={3}
        value={data.tagline}
        onChange={e => setData({ ...data, tagline: e.target.value })}
      />

      <input
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Words (comma separated)"
        value={data.words.join(',')}
        onChange={e =>
          setData({ ...data, words: e.target.value.split(',') })
        }
      />

      <button
        onClick={save}
        className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground"
      >
        Save Hero
      </button>
    </div>
  )
}
