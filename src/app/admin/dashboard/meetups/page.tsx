'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Plus, X, Edit, Calendar } from 'lucide-react'

type Meetup = {
  _id: string
  title: string
  date: string
  description: string
  type: 'meetup' | 'masterclass' | 'podcast'
}

export default function AdminMeetups() {
  const [data, setData] = useState<Meetup[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Meetup | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    date: '',
    description: '',
    type: 'meetup',
  })

  /* ================= LOAD ================= */
  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/meetups', { cache: 'no-store' })
      setData(await res.json())
    } catch {
      setError('Failed to load meetups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  /* ================= OPEN MODAL ================= */
  function openAdd() {
    setEditing(null)
    setForm({
      title: '',
      date: '',
      description: '',
      type: 'meetup',
    })
    setError('')
    setOpen(true)
  }

  function openEdit(item: Meetup) {
    setEditing(item)
    setForm({
      title: item.title,
      date: item.date,
      description: item.description,
      type: item.type,
    })
    setError('')
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
    setError('')
  }

  /* ================= SAVE ================= */
  async function save() {
    setError('')

    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (!form.date.trim()) {
      setError('Date is required')
      return
    }
    if (!form.description.trim()) {
      setError('Description is required')
      return
    }

    await fetch('/api/meetups', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        editing ? { id: editing._id, ...form } : form
      ),
    })

    close()
    load()
  }

  /* ================= DELETE ================= */
  async function remove(id: string) {
    if (!confirm('Delete this meetup?')) return

    await fetch('/api/meetups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    load()
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Meetups
            </h1>
            <Calendar className="text-primary" size={28} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage meetups, masterclasses and podcasts
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
            cursor-pointer flex items-center gap-2
            rounded-full bg-linear-to-r from-primary to-purple-600 px-6 py-3
            font-semibold text-primary-foreground
            transition hover:opacity-90 hover:scale-105 active:scale-95
          "
        >
          <Plus size={18} /> Add Meetup
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <Calendar className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No meetups found</h3>
          <p className="text-sm text-muted-foreground">
            Get started by adding your first meetup, masterclass, or podcast
          </p>
        </div>
      ) : (
        <>
          {/* TABLE (DESKTOP) */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border/50 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4 text-left">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <motion.tr
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-t transition hover:bg-muted/50"
                  >
                <td className="p-4 font-medium">{item.title}</td>
                <td className="p-4 capitalize">{item.type}</td>
                <td className="p-4">{item.date}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="rounded-lg border px-3 py-2 hover:bg-accent transition cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => remove(item._id)}
                        className="rounded-lg border border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10 transition cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="space-y-4 md:hidden">
            {data.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-2 shadow-sm"
              >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.type}</span>
              <span>{item.date}</span>
            </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex-1 rounded-lg border py-2 hover:bg-accent transition cursor-pointer hover:scale-105 active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    className="flex-1 rounded-lg border border-destructive/40 py-2 text-destructive hover:bg-destructive/10 transition cursor-pointer hover:scale-105 active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {editing ? 'Edit Meetup' : 'Add Meetup'}
                </h2>
                <button onClick={close} className="cursor-pointer hover:bg-accent rounded-lg p-1 transition">
                  <X />
                </button>
              </div>

            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 placeholder:text-muted-foreground transition focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
              />

              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 transition focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
              />

              <textarea
                rows={4}
                placeholder="Description"
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border border-input bg-background px-4 py-3 placeholder:text-muted-foreground transition focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
              />

              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 transition focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
              >
                <option value="meetup">Meetup</option>
                <option value="masterclass">Masterclass</option>
                <option value="podcast">Podcast</option>
              </select>

              <button
                onClick={save}
                className="cursor-pointer w-full rounded-full bg-linear-to-r from-primary to-purple-600 py-3 font-semibold text-primary-foreground transition hover:opacity-90 hover:scale-105 active:scale-95"
              >
                {editing ? 'Save Changes' : 'Save Meetup'}
              </button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
