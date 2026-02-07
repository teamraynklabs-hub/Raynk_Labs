'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  X,
  User,
  Users,
  AlertCircle,
  Upload,
  Shield,
  Github,
  Linkedin,
  Globe,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

interface TeamMember {
  _id: string
  name: string
  role: string
  skills: string
  image?: { url: string; publicId: string }
  github: string
  linkedin: string
  portfolio: string
}

export default function TeamManager() {
  const { isSuperAdmin, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    role: '',
    skills: '',
    imageFile: null as File | null,
    imagePreview: '',
    github: '',
    linkedin: '',
    portfolio: '',
  })

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isSuperAdmin, authLoading, router])

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTeam()
    }
  }, [isSuperAdmin])

  async function fetchTeam() {
    try {
      setLoading(true)
      const res = await fetch('/api/team', {
        credentials: 'include',
      })
      const data = await res.json()
      setTeam(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({
      name: '',
      role: '',
      skills: '',
      imageFile: null,
      imagePreview: '',
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
      imageFile: null,
      imagePreview: member.image?.url || '',
      github: member.github || '',
      linkedin: member.linkedin || '',
      portfolio: member.portfolio || '',
    })
    setOpen(true)
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }))
    }
  }

  async function save() {
    if (!form.name.trim() || !form.role.trim()) {
      alert('Name and role are required')
      return
    }

    setSaving(true)

    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('role', form.role)
      formData.append('skills', form.skills)
      formData.append('github', form.github)
      formData.append('linkedin', form.linkedin)
      formData.append('portfolio', form.portfolio)

      if (form.imageFile) {
        formData.append('image', form.imageFile)
      }

      if (editing) {
        formData.append('id', editing._id)
      }

      const res = await fetch('/api/team', {
        method: editing ? 'PUT' : 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.message || 'Failed to save team member')
        return
      }

      setOpen(false)
      fetchTeam()
    } catch (err) {
      alert('Failed to save team member')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this team member? This action cannot be undone.')) return

    try {
      const res = await fetch('/api/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchTeam()
      }
    } catch (err) {
      alert('Failed to delete team member')
    }
  }

  if (authLoading || (loading && isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Team Management
            </h1>
            <Shield className="text-yellow-500" size={24} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Super Admin Only • Manage team members
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-primary to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          Add Member
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Team Grid */}
      {team.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <Users className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No team members yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add your first team member</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Add Member
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              {/* Image */}
              <div className="h-48 bg-linear-to-br from-primary/10 to-purple-500/10 flex items-center justify-center overflow-hidden relative">
                {member.image?.url ? (
                  <img
                    src={member.image.url}
                    alt={member.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <User className="text-muted-foreground" size={48} />
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-primary font-medium">{member.role}</p>
                  {member.skills && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {member.skills}
                    </p>
                  )}
                </div>

                {/* Social Links */}
                {(member.github || member.linkedin || member.portfolio) && (
                  <div className="flex items-center gap-3 pt-2">
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Github size={18} />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
                    {member.portfolio && (
                      <a
                        href={member.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <button
                    onClick={() => openEdit(member)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Edit size={14} />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => remove(member._id)}
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
              className="w-full max-w-2xl rounded-2xl bg-card border border-border/50 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {editing ? 'Edit Team Member' : 'Add New Member'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Role *</label>
                    <input
                      type="text"
                      placeholder="Job title"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Skills</label>
                  <textarea
                    placeholder="Key skills and expertise"
                    rows={3}
                    value={form.skills}
                    onChange={e => setForm({ ...form, skills: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">GitHub</label>
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={form.github}
                      onChange={e => setForm({ ...form, github: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">LinkedIn</label>
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={form.linkedin}
                      onChange={e => setForm({ ...form, linkedin: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Portfolio</label>
                    <input
                      type="url"
                      placeholder="Portfolio URL"
                      value={form.portfolio}
                      onChange={e => setForm({ ...form, portfolio: e.target.value })}
                      className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Profile Image</label>
                  <div className="space-y-3">
                    {form.imagePreview && (
                      <div className="rounded-xl border border-border/50 overflow-hidden">
                        <img
                          src={form.imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <label className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-border hover:border-primary bg-muted/50 hover:bg-muted px-4 py-6 text-sm transition-all cursor-pointer">
                      <Upload size={18} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {form.imageFile ? 'Change Image' : 'Upload Image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImage}
                        className="hidden"
                      />
                    </label>
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
                      `${editing ? 'Save Changes' : 'Add Member'}`
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
