'use client'

import { useState } from 'react'
import {
  Plus,
  X,
  GraduationCap,
  Edit,
  Trash2,
  Star,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'

type Course = {
  id: number
  title: string
  desc: string
  level: string
  badge: 'Free' | 'Paid' | 'Popular'
  imageUrl?: string
}

export default function CoursesManager() {
  /* TEMP DATA (replace with API later) */
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'AI for Students',
      desc: 'Learn AI tools and fundamentals with real use-cases.',
      level: 'Beginner',
      badge: 'Free',
      imageUrl: '',
    },
    {
      id: 2,
      title: 'Web Development Bootcamp',
      desc: 'Frontend + Backend with real projects.',
      level: 'Intermediate',
      badge: 'Popular',
      imageUrl: '',
    },
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState<Course>({
    id: 0,
    title: '',
    desc: '',
    level: 'Beginner',
    badge: 'Free',
    imageUrl: '',
  })

  /* ---------------- HANDLERS ---------------- */

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  /* CLOUDINARY IMAGE UPLOAD */
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
    } catch {
      alert('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({
      id: 0,
      title: '',
      desc: '',
      level: 'Beginner',
      badge: 'Free',
      imageUrl: '',
    })
    setOpen(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setForm(course)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function save() {
    if (!form.title.trim()) {
      alert('Course title required')
      return
    }

    if (editing) {
      setCourses(prev =>
        prev.map(c => (c.id === editing.id ? { ...editing, ...form } : c))
      )
      // TODO: PATCH /api/courses/:id
    } else {
      setCourses(prev => [{ ...form, id: Date.now() }, ...prev])
      // TODO: POST /api/courses
    }

    close()
  }

  function remove(id: number) {
    if (!confirm('Delete this course?')) return
    setCourses(prev => prev.filter(c => c.id !== id))
    // TODO: DELETE /api/courses/:id
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage all learning courses shown on the website.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Course
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map(course => (
          <div
            key={course.id}
            className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
          >
            {/* BADGE */}
            <span
              className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold
                ${course.badge === 'Free' && 'bg-primary/15 text-primary'}
                ${course.badge === 'Paid' && 'bg-destructive/15 text-destructive'}
                ${course.badge === 'Popular' && 'bg-yellow-400/20 text-yellow-400'}
              `}
            >
              {course.badge}
            </span>

            {/* IMAGE */}
            <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-muted overflow-hidden">
              {course.imageUrl ? (
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <GraduationCap size={36} className="text-muted-foreground" />
              )}
            </div>

            {/* CONTENT */}
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Star size={16} className="text-primary" />
              {course.title}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {course.desc}
            </p>

            <p className="mt-3 text-xs text-muted-foreground">
              Level: <span className="font-medium">{course.level}</span>
            </p>

            {/* ACTIONS */}
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => openEdit(course)}
                className="rounded-lg border px-3 py-1.5 hover:bg-accent transition"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => remove(course.id)}
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
                {editing ? 'Edit Course' : 'Add Course'}
              </h2>
              <button onClick={close}>
                <X className="hover:text-primary" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                name="title"
                placeholder="Course title"
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

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="rounded-lg border bg-transparent px-3 py-2"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>

                <select
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  className="rounded-lg border bg-transparent px-3 py-2"
                >
                  <option>Free</option>
                  <option>Paid</option>
                  <option>Popular</option>
                </select>
              </div>

              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleImage}
                className="w-full cursor-pointer text-sm"
              />

              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" />
                  Uploading image...
                </div>
              )}

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  className="h-40 w-full rounded-lg object-cover border"
                />
              )}

              <button
                onClick={save}
                disabled={uploading}
                className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 transition disabled:opacity-60"
              >
                {editing ? 'Save Changes' : 'Add Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
