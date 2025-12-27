'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react'

interface Service {
  _id: string
  title: string
  description: string
  image?: { url: string; publicId: string }
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageFile: null as File | null,
  })

  /* ================= LOAD ================= */
  async function loadServices() {
    const res = await fetch('/api/services', { cache: 'no-store' })
    setServices(await res.json())
  }

  useEffect(() => {
    loadServices()
  }, [])

  /* ================= HANDLERS ================= */
  function openAdd() {
    setEditing(null)
    setForm({ title: '', description: '', imageFile: null })
    setOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setForm({
      title: service.title,
      description: service.description,
      imageFile: null,
    })
    setOpen(true)
  }

  function handleImage(e: any) {
    const file = e.target.files?.[0]
    if (file) setForm(prev => ({ ...prev, imageFile: file }))
  }

  async function save() {
    if (!form.title.trim() || !form.description.trim()) {
      alert('Title and description are required')
      return
    }

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('description', form.description)
    formData.append('order', '0')

    if (form.imageFile) {
      formData.append('image', form.imageFile)
    }

    if (editing) {
      formData.append('id', editing._id)
    }

    const res = await fetch('/api/services', {
      method: editing ? 'PUT' : 'POST',
      body: formData,
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || 'Failed to save service')
      return
    }

    setOpen(false)
    loadServices()
  }

  async function remove(id: string) {
    if (!confirm('Delete service?')) return

    await fetch('/api/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    loadServices()
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-10 max-w-6xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Manage website services</p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          <Plus size={16} className="inline mr-1" />
          Add Service
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map(s => (
          <div
            key={s._id}
            className="rounded-2xl border bg-card p-5 transition hover:shadow-xl"
          >
            <div className="mb-4 h-32 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {s.image?.url ? (
                <img src={s.image.url} className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="text-muted-foreground" size={32} />
              )}
            </div>

            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {s.description}
            </p>

            <div className="mt-4 flex justify-between">
              <button onClick={() => openEdit(s)}>
                <Edit size={16} />
              </button>
              <button
                onClick={() => remove(s._id)}
                className="text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Service' : 'Add Service'}
              </h2>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Title"
                value={form.title}
                onChange={e =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full rounded-xl border px-4 py-3"
              />

              <textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border px-4 py-3"
              />

              <input type="file" onChange={handleImage} />

              <button
                onClick={save}
                className="w-full rounded-full cursor-pointer bg-primary py-3 font-semibold text-primary-foreground"
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
