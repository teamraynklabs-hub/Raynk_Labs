'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Pencil, Rocket } from 'lucide-react'

export default function AdminUpcomingProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    liveUrl: '',
    previewUrl: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  /* ================= FETCH ================= */
  async function fetchProjects() {
    setLoading(true)
    const res = await fetch('/api/upcoming-projects', {
      cache: 'no-store',
    })
    const data = await res.json()
    setProjects(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  /* ================= SUBMIT ================= */
  async function submit() {
    if (!form.title || !form.description) {
      alert('Title & description required')
      return
    }

    setSubmitting(true)
    try {
      await fetch('/api/upcoming-projects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingId ? { id: editingId, ...form } : form
        ),
      })

      setForm({
        title: '',
        description: '',
        liveUrl: '',
        previewUrl: '',
      })
      setEditingId(null)
      fetchProjects()
    } catch {
      alert('Failed to save project')
    } finally {
      setSubmitting(false)
    }
  }

  /* ================= DELETE ================= */
  async function remove(id: string) {
    if (!confirm('Hide this project?')) return

    await fetch('/api/upcoming-projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    fetchProjects()
  }

  /* ================= EDIT ================= */
  function edit(p: any) {
    setEditingId(p._id)
    setForm({
      title: p.title,
      description: p.description,
      liveUrl: p.liveUrl || '',
      previewUrl: p.previewUrl || '',
    })
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Upcoming Projects
        </h1>
        <Rocket className="text-primary" size={28} />
      </div>
      <p className="text-sm text-muted-foreground">
        Showcase projects currently in development
      </p>

      {/* ================= FORM ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4 shadow-sm"
      >
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Plus size={18} />
          {editingId ? 'Edit Project' : 'Add Project'}
        </h2>

        <input
          placeholder="Project Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <textarea
          placeholder="Project Description"
          rows={4}
          value={form.description}
          onChange={e =>
            setForm({ ...form, description: e.target.value })
          }
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Live URL (optional)"
          value={form.liveUrl}
          onChange={e => setForm({ ...form, liveUrl: e.target.value })}
          className="w-full rounded-xl border px-4 py-3"
        />

        <input
          placeholder="Preview URL (iframe)"
          value={form.previewUrl}
          onChange={e =>
            setForm({ ...form, previewUrl: e.target.value })
          }
          className="w-full rounded-xl border px-4 py-3"
        />

        <button
          onClick={submit}
          disabled={submitting}
          className="rounded-full cursor-pointer bg-linear-to-r from-primary to-purple-600 px-8 py-3 text-primary-foreground font-semibold transition hover:opacity-90 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}
        </button>
      </motion.div>

      {/* ================= TABLE ================= */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <Rocket className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No upcoming projects</h3>
          <p className="text-sm text-muted-foreground">
            Add your first upcoming project above
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/50 overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, index) => (
                <motion.tr
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t transition hover:bg-muted/50"
                >
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => edit(p)}
                      className="rounded-lg border px-4 py-2 flex items-center gap-1 cursor-pointer transition hover:bg-accent hover:scale-105 active:scale-95"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="rounded-lg border border-destructive/40 text-destructive px-4 py-2 flex items-center gap-1 cursor-pointer transition hover:bg-destructive/10 hover:scale-105 active:scale-95"
                    >
                      <Trash2 size={14} />
                      Hide
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
