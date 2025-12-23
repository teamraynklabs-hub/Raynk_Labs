'use client'

import { useState } from 'react'
import {
  Plus,
  X,
  FolderGit2,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react'

type Project = {
  id: number
  title: string
  desc: string
  tech: string
  status: 'Live' | 'Coming Soon'
  url?: string
  imageUrl?: string
}

export default function ProjectsManager() {
  /* TEMP DATA (Replace with API) */
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 1,
      title: 'AI Resume Builder',
      desc: 'Generate professional resumes using AI.',
      tech: 'Next.js, OpenAI, Tailwind',
      status: 'Live',
      url: 'https://example.com',
    },
    {
      id: 2,
      title: 'Student Community App',
      desc: 'Community platform for student collaboration.',
      tech: 'React, Node, MongoDB',
      status: 'Coming Soon',
    },
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const [form, setForm] = useState<Project>({
    id: 0,
    title: '',
    desc: '',
    tech: '',
    status: 'Live',
    url: '',
    imageUrl: '',
  })

  /* ---------------- HANDLERS ---------------- */

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleImage(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setForm({ ...form, imageUrl: URL.createObjectURL(file) })
    // TODO: Upload to backend
  }

  function openAdd() {
    setEditing(null)
    setForm({
      id: 0,
      title: '',
      desc: '',
      tech: '',
      status: 'Live',
      url: '',
      imageUrl: '',
    })
    setOpen(true)
  }

  function openEdit(item: Project) {
    setEditing(item)
    setForm(item)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  function save() {
    if (!form.title.trim()) {
      alert('Project title required')
      return
    }

    if (editing) {
      setProjects(prev =>
        prev.map(p => (p.id === editing.id ? { ...editing, ...form } : p))
      )
    } else {
      setProjects(prev => [{ ...form, id: Date.now() }, ...prev])
    }

    // TODO: POST / PATCH API
    close()
  }

  function remove(id: number) {
    if (!confirm('Delete this project?')) return
    setProjects(prev => prev.filter(p => p.id !== id))
    // TODO: DELETE API
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage all real-world and internal projects.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 transition"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <div
            key={project.id}
            className="
              group relative rounded-2xl border border-border bg-card p-5
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-xl
            "
          >
            {/* STATUS */}
            <span
              className={`
                absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold
                ${project.status === 'Live'
                  ? 'bg-primary/15 text-primary'
                  : 'bg-yellow-400/20 text-yellow-400'}
              `}
            >
              {project.status}
            </span>

            {/* IMAGE */}
            <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-muted overflow-hidden">
              {project.imageUrl ? (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FolderGit2 size={36} className="text-muted-foreground" />
              )}
            </div>

            {/* CONTENT */}
            <h3 className="text-lg font-semibold">{project.title}</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {project.desc}
            </p>

            {/* TECH STACK */}
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tech.split(',').map((t, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
                >
                  {t.trim()}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(project)}
                  className="rounded-lg border px-3 py-1.5 hover:bg-accent transition"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => remove(project.id)}
                  className="rounded-lg border border-destructive/30 px-3 py-1.5 text-destructive hover:bg-destructive/10 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {project.url && project.status === 'Live' && (
                <a
                  href={project.url}
                  target="_blank"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  Visit <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 animate-in fade-in zoom-in">
            {/* HEADER */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Project' : 'Add Project'}
              </h2>
              <button onClick={close}>
                <X className="hover:text-primary" />
              </button>
            </div>

            {/* FORM */}
            <div className="space-y-4">
              <input
                name="title"
                placeholder="Project title"
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

              <input
                name="tech"
                placeholder="Tech stack (comma separated)"
                value={form.tech}
                onChange={handleChange}
                className="w-full rounded-lg border bg-transparent px-4 py-2"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-lg border bg-transparent px-3 py-2"
                >
                  <option>Live</option>
                  <option>Coming Soon</option>
                </select>

                <input
                  name="url"
                  placeholder="Live URL (optional)"
                  value={form.url}
                  onChange={handleChange}
                  className="rounded-lg border bg-transparent px-4 py-2"
                />
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="w-full cursor-pointer text-sm"
              />

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  className="h-40 w-full rounded-lg object-cover border"
                />
              )}

              <button
                onClick={save}
                className="w-full rounded-full bg-primary py-2.5 font-medium text-primary-foreground hover:opacity-90 transition"
              >
                {editing ? 'Save Changes' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
