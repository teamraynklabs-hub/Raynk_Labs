'use client'

import { useState } from 'react'
import {
  Plus,
  X,
  Cpu,
  Edit,
  Trash2,
  ExternalLink,
  Monitor,
} from 'lucide-react'

type Software = {
  id: number
  name: string
  desc: string
  category: 'Web' | 'Mobile' | 'AI' | 'Desktop'
  status: 'Live' | 'Beta' | 'Coming Soon'
  url?: string
  imageUrl?: string
}

export default function SoftwaresManager() {
  /* TEMP DATA (Replace after backend integration) */
  const [softwares, setSoftwares] = useState<Software[]>([
    {
      id: 1,
      name: 'AI Resume Analyzer',
      desc: 'Analyze resumes and suggest improvements using AI.',
      category: 'AI',
      status: 'Live',
      url: 'https://example.com',
    },
    {
      id: 2,
      name: 'Student Notes App',
      desc: 'Cross-platform notes management software.',
      category: 'Mobile',
      status: 'Beta',
    },
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Software | null>(null)

  const [form, setForm] = useState<Software>({
    id: 0,
    name: '',
    desc: '',
    category: 'Web',
    status: 'Live',
    url: '',
    imageUrl: '',
  })

  /* ---------------- HANDLERS ---------------- */

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImage(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm({ ...form, imageUrl: URL.createObjectURL(file) })
    // TODO: Upload image → API
  }

  function openAdd() {
    setEditing(null)
    setForm({
      id: 0,
      name: '',
      desc: '',
      category: 'Web',
      status: 'Live',
      url: '',
      imageUrl: '',
    })
    setOpen(true)
  }

  function openEdit(item: Software) {
    setEditing(item)
    setForm(item)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function save() {
    if (!form.name.trim()) {
      alert('Software name required')
      return
    }

    if (editing) {
      setSoftwares(prev =>
        prev.map(s => (s.id === editing.id ? { ...editing, ...form } : s))
      )
    } else {
      setSoftwares(prev => [{ ...form, id: Date.now() }, ...prev])
    }

    // TODO: POST / PATCH API
    close()
  }

  function remove(id: number) {
    if (!confirm('Delete this software?')) return
    setSoftwares(prev => prev.filter(s => s.id !== id))
    // TODO: DELETE API
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Softwares</h1>
          <p className="text-muted-foreground mt-1">
            Manage internal and public software tools.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Software
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {softwares.map(item => (
          <div
            key={item.id}
            className="
              group relative rounded-2xl border border-border bg-card p-5
              transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
            "
          >
            {/* STATUS */}
            <span
              className={`
                absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold
                ${item.status === 'Live'
                  ? 'bg-primary/15 text-primary'
                  : item.status === 'Beta'
                  ? 'bg-blue-400/15 text-blue-400'
                  : 'bg-yellow-400/20 text-yellow-400'}
              `}
            >
              {item.status}
            </span>

            {/* IMAGE */}
            <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-muted overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  className="h-full w-full object-cover"
                  alt={item.name}
                />
              ) : (
                <Cpu size={36} className="text-muted-foreground" />
              )}
            </div>

            {/* CONTENT */}
            <h3 className="text-lg font-semibold">{item.name}</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {item.desc}
            </p>

            {/* TAG */}
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              <Monitor size={14} /> {item.category}
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="rounded-lg border px-3 py-1.5 hover:bg-accent transition"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => remove(item.id)}
                  className="rounded-lg border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {item.url && item.status === 'Live' && (
                <a
                  href={item.url}
                  target="_blank"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  Open <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 animate-in fade-in zoom-in">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Software' : 'Add Software'}
              </h2>
              <button onClick={close}>
                <X className="hover:text-primary" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="name"
                placeholder="Software name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-lg border bg-transparent px-4 py-2"
              />

              <textarea
                name="desc"
                rows={3}
                placeholder="Description"
                value={form.desc}
                onChange={handleChange}
                className="w-full rounded-lg border bg-transparent px-4 py-2"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="rounded-lg border bg-transparent px-3 py-2"
                >
                  <option>Web</option>
                  <option>Mobile</option>
                  <option>AI</option>
                  <option>Desktop</option>
                </select>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-lg border bg-transparent px-3 py-2"
                >
                  <option>Live</option>
                  <option>Beta</option>
                  <option>Coming Soon</option>
                </select>
              </div>

              <input
                name="url"
                placeholder="Live URL (optional)"
                value={form.url}
                onChange={handleChange}
                className="w-full rounded-lg border bg-transparent px-4 py-2"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="cursor-pointer text-sm"
              />

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  className="h-40 w-full rounded-lg object-cover border"
                />
              )}

              <button
                onClick={save}
                className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 transition"
              >
                {editing ? 'Save Changes' : 'Add Software'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
