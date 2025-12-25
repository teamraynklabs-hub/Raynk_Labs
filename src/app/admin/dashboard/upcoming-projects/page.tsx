'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'

export default function AdminUpcomingProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">Upcoming Projects</h1>

      {/* ================= FORM ================= */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
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
          className="rounded-full bg-primary px-8 py-3 text-primary-foreground font-semibold"
        >
          {editingId ? 'Update Project' : 'Create Project'}
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-2xl border overflow-x-auto">
        {loading ? (
          <p className="p-6">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Created</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} className="border-t">
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-3">
                    <button
                      onClick={() => edit(p)}
                      className="rounded-full border px-4 py-2 flex items-center gap-1"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => remove(p._id)}
                      className="rounded-full border border-destructive text-destructive px-4 py-2 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Hide
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No upcoming projects added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
