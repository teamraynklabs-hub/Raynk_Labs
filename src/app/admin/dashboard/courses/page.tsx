'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react'

interface Course {
  _id: string
  title: string
  description: string
  badge?: string
  icon?: string
  order?: number
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    badge: 'Free',
    icon: 'default',
    order: 0,
  })

  const [error, setError] = useState('')

  /* ================= FETCH ================= */
  async function loadCourses() {
    setLoading(true)
    try {
      const res = await fetch('/api/courses', { cache: 'no-store' })
      setCourses(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  /* ================= FORM ================= */
  function openAdd() {
    setEditing(null)
    setForm({
      title: '',
      description: '',
      badge: 'Free',
      icon: 'default',
      order: 0,
    })
    setError('')
    setOpen(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setForm({
      title: course.title,
      description: course.description,
      badge: course.badge || 'Free',
      icon: course.icon || 'default',
      order: course.order || 0,
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
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/courses', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editing ? { id: editing._id, ...form } : form
        ),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      await loadCourses()
      close()
    } catch (err: any) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE ================= */
  async function remove(id: string) {
    if (!confirm('Delete this course?')) return

    await fetch('/api/courses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    loadCourses()
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-10 max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground">
            Manage all courses displayed on the website
          </p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={16} className="inline mr-1" />
          Add Course
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      {/* GRID (SERVICE STYLE) */}
      {!loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <div
              key={course._id}
              className="
                group rounded-2xl border border-border bg-card p-5
                transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl
              "
            >
              {/* BADGE */}
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {course.badge || 'Free'}
              </span>

              {/* TITLE */}
              <h3 className="mt-3 text-lg font-semibold">
                {course.title}
              </h3>

              {/* DESC */}
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                {course.description}
              </p>

              {/* ACTIONS */}
              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => openEdit(course)}
                  className="rounded-lg border px-3 py-2 hover:bg-accent transition"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => remove(course._id)}
                  className="rounded-lg border border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL (UNCHANGED FUNCTIONALITY) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-card border p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Course' : 'Add Course'}
              </h2>
              <button onClick={close}>
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
                placeholder="Course Title"
                value={form.title}
                onChange={e =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none"
              />

              <textarea
                rows={4}
                placeholder="Course Description"
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  value={form.badge}
                  onChange={e =>
                    setForm({ ...form, badge: e.target.value })
                  }
                  className="rounded-xl border px-4 py-3"
                >
                  <option>Free</option>
                  <option>Paid</option>
                  <option>Popular</option>
                </select>

                <input
                  type="number"
                  placeholder="Order"
                  value={form.order}
                  onChange={e =>
                    setForm({
                      ...form,
                      order: Number(e.target.value),
                    })
                  }
                  className="rounded-xl border px-4 py-3"
                />
              </div>

              <button
                onClick={save}
                disabled={saving}
                className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : editing
                  ? 'Save Changes'
                  : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
