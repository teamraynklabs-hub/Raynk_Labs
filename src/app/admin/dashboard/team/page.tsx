'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus,
  X,
  User,
  Edit,
  Trash2,
  Github,
  Linkedin,
  Globe,
  Loader2,
} from 'lucide-react'
import Image from 'next/image'

type TeamMember = {
  _id: string
  name: string
  role: string
  skills?: string
  image?: { url: string; publicId: string }
  github?: string
  linkedin?: string
  portfolio?: string
}

export default function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [uploading, setUploading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    role: '',
    skills: '',
    image: null as File | null,
    imageUrl: '',
    github: '',
    linkedin: '',
    portfolio: '',
  })

  async function fetchTeam() {
    const res = await fetch('/api/team')
    setTeam(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  function handleChange(e: any) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleImage(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setForm(p => ({ ...p, image: file }))

    const body = new FormData()
    body.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body })
    const data = await res.json()

    setForm(p => ({ ...p, imageUrl: data.url }))
    setUploading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm({
      name: '',
      role: '',
      skills: '',
      image: null,
      imageUrl: '',
      github: '',
      linkedin: '',
      portfolio: '',
    })
    setOpen(true)
  }

  function openEdit(m: TeamMember) {
    setEditing(m)
    setForm({
      name: m.name,
      role: m.role,
      skills: m.skills || '',
      image: null,
      imageUrl: m.image?.url || '',
      github: m.github || '',
      linkedin: m.linkedin || '',
      portfolio: m.portfolio || '',
    })
    setOpen(true)
  }

  async function save() {
    if (!form.name || !form.role) return alert('Name and role required')

    const body = new FormData()
    Object.entries(form).forEach(([k, v]: any) => v && body.append(k, v))
    if (editing) body.append('id', editing._id)

    await fetch('/api/team', {
      method: editing ? 'PUT' : 'POST',
      body,
    })

    fetchTeam()
    setOpen(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete member?')) return
    await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchTeam()
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Manager</h1>
          <p className="text-muted-foreground">Manage team members</p>
        </div>

        <button
          onClick={openAdd}
          className="cursor-pointer rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus size={18} className="inline mr-1" />
          Add Member
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} />
          Loading...
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map(m => (
          <div
            key={m._id}
            className="rounded-2xl border bg-card p-5 transition hover:shadow-xl"
          >
            {/* IMAGE – CENTERED */}
            <div className="h-50 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {m.image?.url ? (
                <Image
                  src={m.image.url}
                  height={180}
                  width={180}
                  alt={m.name}
                  className="object-center"
                />
              ) : (
                <User size={40} className="text-muted-foreground" />
              )}
            </div>

            <h3 className="mt-4 text-lg font-semibold">{m.name}</h3>
            <p className="text-primary text-sm">{m.role}</p>

            {m.skills && (
              <p className="mt-1 text-sm text-muted-foreground">
                {m.skills}
              </p>
            )}

            {/* LINKS */}
            <div className="mt-3 flex gap-4 text-muted-foreground">
              {m.github && (
                <Link
                  href={m.github}
                  target="_blank"
                  className="cursor-pointer hover:text-primary"
                >
                  <Github size={18} />
                </Link>
              )}
              {m.linkedin && (
                <Link
                  href={m.linkedin}
                  target="_blank"
                  className="cursor-pointer hover:text-primary"
                >
                  <Linkedin size={18} />
                </Link>
              )}
              {m.portfolio && (
                <Link
                  href={m.portfolio}
                  target="_blank"
                  className="cursor-pointer hover:text-primary"
                >
                  <Globe size={18} />
                </Link>
              )}
            </div>

            <div className="mt-5 flex justify-between">
              <button
                onClick={() => openEdit(m)}
                className="cursor-pointer rounded-lg border px-3 py-2 hover:bg-accent"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => remove(m._id)}
                className="cursor-pointer rounded-lg border border-destructive/40 px-3 py-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card p-6 border max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Member' : 'Add Member'}
              </h2>
              <button onClick={() => setOpen(false)} className="cursor-pointer">
                <X />
              </button>
            </div>

            <div className="space-y-4">
              {['name', 'role', 'skills', 'github', 'linkedin', 'portfolio'].map(f => (
                <input
                  key={f}
                  name={f}
                  value={(form as any)[f]}
                  onChange={handleChange}
                  placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                  className="
                    w-full rounded-xl border border-input
                    bg-background px-4 py-3
                    outline-none
                    focus:border-primary
                    focus:ring-2 focus:ring-primary/30
                  "
                />
              ))}

              <input type="file" onChange={handleImage} disabled={uploading} />

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  className="h-40 w-full rounded-xl object-cover"
                />
              )}

              <button
                onClick={save}
                disabled={uploading}
                className="cursor-pointer w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90"
              >
                {editing ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
