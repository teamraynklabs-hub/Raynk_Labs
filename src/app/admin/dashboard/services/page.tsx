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
} from 'lucide-react'

interface Service {
  _id: string
  title: string
  description: string
  order: number
  image?: { url: string; publicId: string }
  isActive?: boolean
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    order: 0,
    imageFile: null as File | null,
    imagePreview: '',
  })

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    try {
      setLoading(true)
      const res = await fetch('/api/services', {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (err) {
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
      title: service.title,
      description: service.description,
      order: service.order,
      imageFile: null,
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
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('order', form.order.toString())

      if (form.imageFile) {
        formData.append('image', form.imageFile)
      }

      if (editing) {
        formData.append('id', editing._id)
      }

      const res = await fetch('/api/services', {
        method: editing ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.message || 'Failed to save service')
        return
      }

      setOpen(false)
      loadServices()
    } catch (err) {
      alert('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this service? This action cannot be undone.')) return

    try {
      const res = await fetch('/api/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        loadServices()
      }
    } catch (err) {
      alert('Failed to delete service')
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Services Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all services displayed on your website
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Services Grid */}
      {services.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <Briefcase className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started by adding your first service</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center overflow-hidden relative">
                {service.image?.url ? (
                  <img
                    src={service.image.url}
                    alt={service.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <ImageIcon className="text-muted-foreground" size={48} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold line-clamp-1">{service.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => openEdit(service)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Edit size={14} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => remove(service._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Trash2 size={14} />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl rounded-2xl bg-card border border-border/50 p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {editing ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Service title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    placeholder="Service description"
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Order</label>
                  <input
                    type="number"
                    placeholder="Display order"
                    value={form.order}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Image</label>
                  <div className="space-y-3">
                    {form.imagePreview && (
                      <div className="rounded-xl border border-border/50 overflow-hidden">
                        <img
                          src={form.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-muted px-4 py-6 text-sm transition-all cursor-pointer">
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-muted-foreground">{form.imageFile ? 'Change Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-muted/50 hover:bg-muted text-foreground font-medium transition-all cursor-pointer hover:scale-105 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      'Save Service'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
