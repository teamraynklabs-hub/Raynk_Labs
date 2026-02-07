'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  X,
  GraduationCap,
  AlertCircle,
  Tag,
} from 'lucide-react'

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
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    badge: 'Free',
    icon: 'default',
    order: 0,
  })

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      setLoading(true)
      const res = await fetch('/api/courses', {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({
      title: '',
      description: '',
      badge: 'Free',
      icon: 'default',
      order: courses.length,
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
        credentials: 'include',
        body: JSON.stringify(
          editing ? { id: editing._id, ...form } : form
        ),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to save course')
        return
      }

      setOpen(false)
      loadCourses()
    } catch (err) {
      setError('Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this course? This action cannot be undone.')) return

    try {
      const res = await fetch('/api/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        loadCourses()
      }
    } catch (err) {
      alert('Failed to delete course')
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
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Courses Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all courses displayed on your website
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-primary to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Add Course
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <GraduationCap className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Get started by adding your first course</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Course
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              {/* Content */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Tag className="text-muted-foreground flex-shrink-0 mt-1" size={18} />
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {course.badge || 'Free'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-semibold line-clamp-1">{course.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">
                    {course.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => openEdit(course)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Edit size={14} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => remove(course._id)}
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
                <h2 className="text-2xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {editing ? 'Edit Course' : 'Add New Course'}
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
                  <label className="block text-sm font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Course title"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description *</label>
                  <textarea
                    placeholder="Course description"
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Badge</label>
                    <select
                      value={form.badge}
                      onChange={e => setForm({ ...form, badge: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
                    >
                      <option value="Free">Free</option>
                      <option value="Paid">Paid</option>
                      <option value="Popular">Popular</option>
                      <option value="New">New</option>
                    </select>
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
                    className="flex-1 px-4 py-3 rounded-xl bg-linear-to-r from-primary to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      `${editing ? 'Save Changes' : 'Add Course'}`
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
