'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus, X, Edit } from 'lucide-react'

type Meetup = {
  _id: string
  title: string
  date: string
  description: string
  type: 'meetup' | 'masterclass' | 'podcast'
}

export default function AdminMeetups() {
  const [data, setData] = useState<Meetup[]>([])
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
    const res = await fetch('/api/admin/meetups', { cache: 'no-store' })
    setData(await res.json())
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

    await fetch('/api/admin/meetups', {
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

    await fetch('/api/admin/meetups', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    load()
  }

  /* ================= UI ================= */
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetups</h1>
          <p className="mt-1 text-muted-foreground">
            Manage meetups, masterclasses and podcasts
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
            cursor-pointer flex items-center gap-2
            rounded-full bg-primary px-6 py-3
            font-semibold text-primary-foreground
            transition hover:opacity-90
          "
        >
          <Plus size={18} /> Add Meetup
        </button>
      </div>

      {/* TABLE (DESKTOP) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
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
            {data.map(item => (
              <tr
                key={item._id}
                className="border-t transition hover:bg-muted/50"
              >
                <td className="p-4 font-medium">{item.title}</td>
                <td className="p-4 capitalize">{item.type}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="rounded-lg border px-3 py-2 hover:bg-accent transition"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    className="rounded-lg border border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {!data.length && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No meetups added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-4 md:hidden">
        {data.map(item => (
          <div
            key={item._id}
            className="rounded-xl border border-border bg-card p-4 space-y-2"
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
                className="flex-1 rounded-lg border py-2 hover:bg-accent transition"
              >
                Edit
              </button>
              <button
                onClick={() => remove(item._id)}
                className="flex-1 rounded-lg border border-destructive/40 py-2 text-destructive hover:bg-destructive/10 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!data.length && (
          <p className="text-center text-muted-foreground">
            No meetups added yet
          </p>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Meetup' : 'Add Meetup'}
              </h2>
              <button onClick={close} className="cursor-pointer">
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
                className="cursor-pointer w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                {editing ? 'Save Changes' : 'Save Meetup'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
