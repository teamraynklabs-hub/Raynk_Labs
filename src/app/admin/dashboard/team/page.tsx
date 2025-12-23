'use client'

import { useEffect, useState } from 'react'
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

type TeamMember = {
  _id: string
  name: string
  role: string
  skills?: string
  image?: {
    url: string
    publicId: string
  }
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

  /* ================= FETCH TEAM ================= */
  async function fetchTeam() {
    setLoading(true)
    const res = await fetch('/api/team')
    const data = await res.json()
    setTeam(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchTeam()
  }, [])

  /* ================= HANDLERS ================= */

  function handleChange(e: any) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleImage(e: any) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setForm(prev => ({ ...prev, image: file }))

    try {
      const body = new FormData()
      body.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      })

      const data = await res.json()
      if (!res.ok) throw new Error()

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

  function openEdit(member: TeamMember) {
    setEditing(member)
    setForm({
      name: member.name,
      role: member.role,
      skills: member.skills || '',
      image: null,
      imageUrl: member.image?.url || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      portfolio: member.portfolio || '',
    })
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setEditing(null)
  }

  /* ================= SAVE ================= */
  async function save() {
    if (!form.name || !form.role) {
      alert('Name and role are required')
      return
    }

    const body = new FormData()
    body.append('name', form.name)
    body.append('role', form.role)
    body.append('skills', form.skills)
    body.append('github', form.github)
    body.append('linkedin', form.linkedin)
    body.append('portfolio', form.portfolio)
    if (form.image) body.append('image', form.image)

    const res = await fetch('/api/team', {
      method: editing ? 'PUT' : 'POST',
      body: editing ? (() => { body.append('id', editing._id); return body })() : body,
    })

    if (!res.ok) {
      alert('Save failed')
      return
    }

    await fetchTeam()
    close()
  }

  /* ================= DELETE ================= */
  async function remove(id: string) {
    if (!confirm('Delete this member?')) return

    await fetch('/api/team', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    fetchTeam()
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Manager</h1>
          <p className="text-muted-foreground">Manage team members</p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-primary-foreground"
        >
          <Plus size={18} /> Add Member
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> Loading team...
        </div>
      )}

      {/* GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {team.map(member => (
          <div
            key={member._id}
            className="rounded-2xl border border-border bg-card p-5 hover:-translate-y-1 hover:shadow-xl transition"
          >
            <div className="mb-4 h-32 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
              {member.image?.url ? (
                <img src={member.image.url} className="h-full w-full object-cover" />
              ) : (
                <User className="text-muted-foreground" size={36} />
              )}
            </div>

            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-primary">{member.role}</p>
            <p className="text-sm text-muted-foreground mt-1">{member.skills}</p>

            <div className="flex gap-3 mt-3 text-muted-foreground">
              {member.github && <a href={member.github}><Github size={16} /></a>}
              {member.linkedin && <a href={member.linkedin}><Linkedin size={16} /></a>}
              {member.portfolio && <a href={member.portfolio}><Globe size={16} /></a>}
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={() => openEdit(member)} className="border rounded-lg px-3 py-1.5">
                <Edit size={16} />
              </button>
              <button
                onClick={() => remove(member._id)}
                className="border border-destructive/30 text-destructive rounded-lg px-3 py-1.5"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="max-w-lg w-full bg-card border rounded-2xl p-6 animate-in zoom-in">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editing ? 'Edit Member' : 'Add Member'}
              </h2>
              <button onClick={close}><X /></button>
            </div>

            <div className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="input" />
              <input name="role" value={form.role} onChange={handleChange} placeholder="Role" className="input" />
              <input name="skills" value={form.skills} onChange={handleChange} placeholder="Skills" className="input" />
              <input type="file" onChange={handleImage} disabled={uploading} />
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              {form.imageUrl && <img src={form.imageUrl} className="h-40 w-full object-cover rounded-lg" />}
              <input name="github" value={form.github} onChange={handleChange} placeholder="GitHub URL" className="input" />
              <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="input" />
              <input name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="Portfolio URL" className="input" />

              <button
                onClick={save}
                disabled={uploading}
                className="w-full rounded-full bg-primary py-2.5 text-primary-foreground"
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
