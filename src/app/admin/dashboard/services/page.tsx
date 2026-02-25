'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Briefcase,
  AlertCircle,
  Upload,
  Info,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Service {
  _id: string
  title: string
  description: string
  order: number
  image?: { url: string; publicId: string }
  isActive?: boolean
}

const inputCls = `
  w-full rounded-xl border border-border bg-muted/50
  px-4 py-3 text-sm
  transition-luxury placeholder:text-muted-foreground
  focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
`

export default function AdminServicesPage() {
  const [services, setServices]     = useState<Service[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [open, setOpen]             = useState(false)
  const [editing, setEditing]       = useState<Service | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title:        '',
    description:  '',
    order:        0,
    imageFile:    null as File | null,
    imagePreview: '',
  })

  useEffect(() => { loadServices() }, [])

  async function loadServices() {
    try {
      setLoading(true)
      setError('')
      const res  = await fetch('/api/services', { cache: 'no-store', credentials: 'include' })
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({ title: '', description: '', order: services.length, imageFile: null, imagePreview: '' })
    setOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setForm({
      title:        service.title,
      description:  service.description,
      order:        service.order,
      imageFile:    null,
      imagePreview: service.image?.url || '',
    })
    setOpen(true)
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setForm(prev => ({ ...prev, imageFile: file, imagePreview: URL.createObjectURL(file) }))
    }
  }

  async function save() {
    if (!form.title.trim() || !form.description.trim()) {
      alert('Title and description are required')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title',       form.title)
      fd.append('description', form.description)
      fd.append('order',       form.order.toString())
      if (form.imageFile) fd.append('image', form.imageFile)
      if (editing)        fd.append('id',    editing._id)

      const res  = await fetch('/api/services', {
        method:      editing ? 'PUT' : 'POST',
        credentials: 'include',
        body:        fd,
      })
      const data = await res.json()
      if (!res.ok) { alert(data.message || 'Failed to save service'); return }
      setOpen(false)
      loadServices()
    } catch {
      alert('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this service? This action cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch('/api/services', {
        method:      'DELETE',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'include',
        body:        JSON.stringify({ id }),
      })
      if (res.ok) loadServices()
      else alert('Failed to delete service')
    } catch {
      alert('Failed to delete service')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gradient-primary">Services Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all services displayed on your website
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
            inline-flex items-center gap-2 px-5 py-2.5
            rounded-xl bg-primary text-primary-foreground
            text-sm font-medium
            transition-luxury hover-lift hover:shadow-luxury
            cursor-pointer active:scale-95 self-start sm:self-auto
          "
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {/* ══════════════════════════════════════
          ERROR BANNER
      ══════════════════════════════════════ */}
      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ══════════════════════════════════════
          INFO BANNER
      ══════════════════════════════════════ */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground flex items-start gap-2.5">
        <Info size={15} className="text-primary mt-0.5 shrink-0" />
        <span>
          Each service card is shown publicly on the Services page. Upload an image to replace the default icon.
        </span>
      </div>

      {/* ══════════════════════════════════════
          EMPTY STATE
      ══════════════════════════════════════ */}
      {services.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border/50 bg-card/50 shadow-soft">
          <Briefcase className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started by adding your first service</p>
          <button
            onClick={openAdd}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-primary/10 text-primary text-sm font-medium
              transition-luxury hover:bg-primary/20 cursor-pointer
            "
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

      ) : (

        /* ══════════════════════════════════════
            SERVICES GRID
        ══════════════════════════════════════ */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="
                group rounded-2xl border border-border/50 bg-card/50
                overflow-hidden shadow-soft
                transition-luxury hover:shadow-luxury hover:border-primary/30
              "
            >
              {/* Image / placeholder */}
              <div className="relative h-48 overflow-hidden bg-muted/30 flex items-center justify-center">
                {service.image?.url ? (
                  <img
                    src={service.image.url}
                    alt={service.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-luxury group-hover:scale-110 group-hover:bg-primary/15">
                    <ImageIcon size={28} />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-base font-semibold line-clamp-1">{service.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                  <button
                    onClick={() => openEdit(service)}
                    className="
                      flex-1 flex items-center justify-center gap-2 px-3 py-2
                      rounded-lg bg-primary/10 text-primary hover:bg-primary/20
                      text-sm font-medium transition-luxury cursor-pointer active:scale-95
                    "
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => remove(service._id)}
                    disabled={deletingId === service._id}
                    className="
                      flex-1 flex items-center justify-center gap-2 px-3 py-2
                      rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20
                      text-sm font-medium transition-luxury cursor-pointer active:scale-95
                      disabled:opacity-50 disabled:cursor-not-allowed
                    "
                  >
                    {deletingId === service._id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="w-full max-w-2xl rounded-2xl bg-card border border-border/50 shadow-luxury overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-primary/10 text-primary shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <h2 className="text-lg font-bold">
                    {editing ? 'Edit Service' : 'Add New Service'}
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-muted transition-luxury cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal body — scrollable */}
              <div className="overflow-y-auto flex-1">
                <div className="p-6 space-y-5">

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Service title"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className={inputCls}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      placeholder="Service description"
                      rows={4}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Display Order</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.order}
                      onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className={inputCls}
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Lower numbers appear first.</p>
                  </div>

                  {/* Image */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Image</label>
                    <div className="space-y-3">

                      {form.imagePreview && (
                        <div className="relative rounded-xl border border-border/50 overflow-hidden">
                          <img
                            src={form.imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover"
                          />
                          <span className="absolute top-2 right-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                            Preview
                          </span>
                        </div>
                      )}

                      <label className="
                        flex items-center justify-center gap-3 w-full
                        rounded-xl border-2 border-dashed border-border/60
                        bg-muted/20 hover:bg-muted/40 hover:border-primary/50
                        px-4 py-6 text-sm text-muted-foreground
                        transition-luxury cursor-pointer
                      ">
                        <Upload size={16} className="text-primary shrink-0" />
                        <span>{form.imageFile ? 'Change Image' : 'Click to upload image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImage}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>

                </div>
              </div>

              {/* Modal footer — sticky */}
              <div className="flex gap-3 px-6 py-4 border-t border-border/50 bg-muted/10 shrink-0">
                <button
                  onClick={() => setOpen(false)}
                  className="
                    flex-1 px-4 py-3 rounded-xl
                    border border-border/50 bg-muted/50 hover:bg-muted
                    text-sm font-medium transition-luxury cursor-pointer active:scale-95
                  "
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="
                    flex-1 px-4 py-3 rounded-xl
                    bg-primary text-primary-foreground
                    text-sm font-medium
                    transition-luxury hover-lift hover:shadow-luxury
                    cursor-pointer active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  "
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Saving…
                    </span>
                  ) : (
                    editing ? 'Save Changes' : 'Add Service'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
