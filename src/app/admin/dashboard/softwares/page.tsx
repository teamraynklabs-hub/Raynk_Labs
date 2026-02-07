'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Plus,
  Edit,
  Trash2,
  X,
  ExternalLink,
  Loader2,
  FileText,
} from 'lucide-react'
import { motion } from 'framer-motion'

interface Software {
  _id: string
  name: string
  description: string
  downloadUrl: string
  image?: { url?: string }
}

/* ================= URL NORMALIZER ================= */
function normalizeUrl(url?: string) {
  if (!url) return '#'
  if (url.startsWith('http')) return url
  return `https://${url}`
}

export default function AdminSoftwaresPage() {
  const [softwares, setSoftwares] = useState<Software[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Software | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '',
    downloadUrl: '',
    image: null as File | null,
  })

  /* ================= LOAD ================= */
  async function loadSoftwares() {
    setLoading(true)
    const res = await fetch('/api/softwares', { cache: 'no-store' })
    setSoftwares(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    loadSoftwares()
  }, [])

  /* ================= OPEN MODAL ================= */
  function openAdd() {
    setEditing(null)
    setForm({ name: '', description: '', downloadUrl: '', image: null })
    setOpen(true)
  }

  function openEdit(s: Software) {
    setEditing(s)
    setForm({
      name: s.name,
      description: s.description,
      downloadUrl: s.downloadUrl,
      image: null,
    })
    setOpen(true)
  }

  /* ================= SAVE ================= */
  async function save() {
    if (!form.name || !form.description || !form.downloadUrl) {
      alert('All fields are required')
      return
    }

    const body = new FormData()
    body.append('name', form.name)
    body.append('description', form.description)
    body.append('downloadUrl', form.downloadUrl)
    if (form.image) body.append('image', form.image)
    if (editing) body.append('id', editing._id)

    const res = await fetch('/api/softwares', {
      method: editing ? 'PUT' : 'POST',
      body,
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.message || 'Failed')
      return
    }

    setOpen(false)
    loadSoftwares()
  }

  /* ================= DELETE ================= */
  async function remove(id: string) {
    if (!confirm('Delete this software?')) return

    await fetch('/api/softwares', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    loadSoftwares()
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Softwares
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all downloadable tools
          </p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-full cursor-pointer bg-linear-to-r from-primary to-purple-600 px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition hover:scale-105 active:scale-95"
        >
          <Plus size={16} className="inline mr-1" />
          Add Software
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : softwares.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No software found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by adding your first software
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {softwares.map((s, i) => {
            const imageUrl = s.image?.url?.trim() || null

            return (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="
                  group relative overflow-hidden
                  rounded-2xl border border-border/50 bg-card/50 p-6
                  shadow-sm hover:shadow-md transition-all duration-200
                "
              >
                {/* IMAGE */}
                <div className="relative mx-auto mb-5 h-20 w-20 rounded-full bg-primary/15 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={s.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary">
                      <FileText size={32} />
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {s.description}
                </p>

                <a
                  href={normalizeUrl(s.downloadUrl)}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                >
                  Open <ExternalLink size={14} />
                </a>

                {/* ACTIONS */}
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => openEdit(s)}
                    className="flex-1 rounded-lg border cursor-pointer px-3 py-2 hover:bg-accent transition hover:scale-105 active:scale-95"
                  >
                    <Edit size={16} className="inline mr-1" />
                    Edit
                  </button>

                  <button
                    onClick={() => remove(s._id)}
                    className="flex-1 rounded-lg border cursor-pointer border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10 transition hover:scale-105 active:scale-95"
                  >
                    <Trash2 size={16} className="inline mr-1" />
                    Delete
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-card p-6 border border-border"
          >
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Software' : 'Add Software'}
              </h2>
              <button className='cursor-pointer hover:bg-accent rounded-lg p-1 transition' onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <input
                placeholder="Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border px-4 py-3"
              />

              <textarea
                rows={3}
                placeholder="Description"
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border px-4 py-3"
              />

              <input
                placeholder="Download URL"
                value={form.downloadUrl}
                onChange={e =>
                  setForm({ ...form, downloadUrl: e.target.value })
                }
                className="w-full rounded-xl border px-4 py-3"
              />

              <input
                type="file"
                onChange={e =>
                  setForm({
                    ...form,
                    image: e.target.files?.[0] || null,
                  })
                }
              />

              <button
                onClick={save}
                className="w-full rounded-full cursor-pointer bg-linear-to-r from-primary to-purple-600 py-3 font-semibold text-primary-foreground hover:opacity-90 transition hover:scale-105 active:scale-95"
              >
                Save Software
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
