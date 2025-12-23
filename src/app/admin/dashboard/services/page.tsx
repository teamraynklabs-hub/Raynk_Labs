'use client'

import { useState } from 'react'
import {
  Plus,
  X,
  Settings,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'

export default function ServicesManager() {
  /* TEMP DATA (replace with API later) */
  const [services, setServices] = useState<any[]>([
    {
      id: 1,
      title: 'Skill Development Program',
      desc: 'Training students in real-world skills and technology.',
      imageUrl: '',
    },
    {
      id: 2,
      title: 'Career Guidance',
      desc: 'Mentorship, roadmap planning and career support.',
      imageUrl: '',
    },
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    desc: '',
    imageUrl: '',
  })

  /* ---------------- HANDLERS ---------------- */

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /* CLOUDINARY UPLOAD */
  async function handleImage(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const body = new FormData()
      body.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setForm(prev => ({ ...prev, imageUrl: data.url }))
    } catch (err) {
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({ title: '', desc: '', imageUrl: '' })
    setOpen(true)
  }

  function openEdit(item: any) {
    setEditing(item)
    setForm(item)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function save() {
    if (!form.title.trim()) return alert('Title required')

    if (editing) {
      setServices(prev =>
        prev.map(s => (s.id === editing.id ? { ...editing, ...form } : s))
      )
      // TODO: PATCH /api/services/:id
    } else {
      setServices(prev => [{ id: Date.now(), ...form }, ...prev])
      // TODO: POST /api/services
    }

    close()
  }

  function remove(id: number) {
    if (!confirm('Delete this service?')) return
    setServices(prev => prev.filter(s => s.id !== id))
    // TODO: DELETE /api/services/:id
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage all services shown on the website.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Service
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(service => (
          <div
            key={service.id}
            className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            {/* IMAGE */}
            <div className="mb-4 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-muted">
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImageIcon size={36} className="text-muted-foreground" />
              )}
            </div>

            {/* CONTENT */}
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Settings size={16} />
              {service.title}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {service.desc}
            </p>

            {/* ACTIONS */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => openEdit(service)}
                className="rounded-lg border px-3 py-1.5 hover:bg-accent transition"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => remove(service.id)}
                className="rounded-lg border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/10 transition"
              >
                <Trash2 size={16} />
              </button>
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
                {editing ? 'Edit Service' : 'Add Service'}
              </h2>
              <button onClick={close}>
                <X className="hover:text-primary" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="title"
                placeholder="Service title"
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-lg border bg-transparent px-4 py-2"
              />

              <textarea
                name="desc"
                rows={3}
                placeholder="Short description"
                value={form.desc}
                onChange={handleChange}
                className="w-full rounded-lg border bg-transparent px-4 py-2"
              />

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                disabled={uploading}
                className="w-full cursor-pointer text-sm"
              />

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" size={16} />
                  Uploading image...
                </div>
              )}

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  className="h-40 w-full rounded-lg border object-cover"
                />
              )}

              <button
                onClick={save}
                disabled={uploading}
                className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
              >
                {editing ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
