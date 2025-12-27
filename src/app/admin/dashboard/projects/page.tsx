'use client'

import { useEffect, useState } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  X,
  ExternalLink,
} from 'lucide-react'

interface Project {
  _id: string
  name: string
  description: string
  tech: string[]
  url?: string
  status: 'Live' | 'Coming Soon'
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const [form, setForm] = useState({
    title: '',
    desc: '',
    tech: '',
    url: '',
    status: 'Live',
  })

  async function load() {
    const res = await fetch('/api/projects', { cache: 'no-store' })
    setProjects(await res.json())
  }

  useEffect(() => {
    load()
  }, [])

  function openAdd() {
    setEditing(null)
    setForm({
      title: '',
      desc: '',
      tech: '',
      url: '',
      status: 'Live',
    })
    setOpen(true)
  }

  function openEdit(p: Project) {
    setEditing(p)
    setForm({
      title: p.name,
      desc: p.description,
      tech: p.tech.join(', '),
      url: p.url || '',
      status: p.status,
    })
    setOpen(true)
  }

  async function save() {
    if (!form.title.trim() || !form.desc.trim()) {
      alert('Title and description required')
      return
    }

    await fetch('/api/projects', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editing?._id,
        title: form.title,
        desc: form.desc,
        tech: form.tech,
        url: form.url,
        status: form.status,
      }),
    })

    setOpen(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete project?')) return

    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    load()
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6">
      {/* HEADER */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage all real-world and internal projects
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
            inline-flex items-center gap-2
            rounded-full bg-gradient-to-r
            from-primary to-[var(--electric-purple)]
            px-6 py-3 font-semibold text-primary-foreground
            transition hover:opacity-90
            focus:outline-none focus:ring-2 focus:ring-primary/40
          "
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(p => (
          <div
            key={p._id}
            className="
              group relative rounded-2xl
              border border-border bg-card p-6
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-2xl
            "
          >
            {/* STATUS */}
            <span
              className={`
                absolute right-4 top-4 rounded-full
                px-3 py-1 text-xs font-semibold
                ${
                  p.status === 'Live'
                    ? 'bg-primary/15 text-primary'
                    : 'bg-yellow-400/20 text-yellow-400'
                }
              `}
            >
              {p.status}
            </span>

            {/* TITLE */}
            <h3 className="mt-2 text-lg font-bold">
              {p.name}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {p.description}
            </p>

            {/* TECH */}
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tech.map(t => (
                <span
                  key={t}
                  className="
                    rounded-full border border-primary/20
                    bg-primary/10 px-3 py-1
                    text-xs font-medium text-primary
                  "
                >
                  {t}
                </span>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(p)}
                  className="
                    rounded-lg border border-border
                    p-2 transition
                    hover:bg-accent
                  "
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => remove(p._id)}
                  className="
                    rounded-lg border border-destructive/40
                    p-2 text-destructive
                    transition hover:bg-destructive/10
                  "
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  className="
                    flex items-center gap-1
                    text-sm font-medium text-primary
                    hover:underline
                  "
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editing ? 'Edit Project' : 'Add Project'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-accent"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              {[
                {
                  placeholder: 'Project Title',
                  value: form.title,
                  onChange: (v: string) =>
                    setForm({ ...form, title: v }),
                },
                {
                  placeholder: 'Tech (comma separated)',
                  value: form.tech,
                  onChange: (v: string) =>
                    setForm({ ...form, tech: v }),
                },
                {
                  placeholder: 'Live URL https://...',
                  value: form.url,
                  onChange: (v: string) =>
                    setForm({ ...form, url: v }),
                },
              ].map((f, i) => (
                <input
                  key={i}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  className="
                    w-full rounded-xl border border-input
                    bg-background px-4 py-3 text-sm
                    placeholder:text-muted-foreground
                    transition focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
                  "
                />
              ))}

              <textarea
                rows={4}
                placeholder="Project description"
                value={form.desc}
                onChange={e =>
                  setForm({ ...form, desc: e.target.value })
                }
                className="
                  w-full rounded-xl border border-input
                  bg-background px-4 py-3 text-sm
                  placeholder:text-muted-foreground
                  transition focus:border-primary
                  focus:ring-2 focus:ring-primary/30 outline-none
                "
              />

              <button
                onClick={save}
                className="
                  w-full rounded-full
                  bg-gradient-to-r from-primary to-[var(--electric-purple)]
                  py-3 font-semibold text-primary-foreground
                  transition hover:opacity-90
                "
              >
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
