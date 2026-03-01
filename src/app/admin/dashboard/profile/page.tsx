'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Github,
  Instagram,
  Linkedin,
  Globe,
  Camera,
  Save,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AdminProfile {
  name: string
  mobile: string
  profile?: {
    email?: string
    image?: {
      url: string
      publicId: string
    }
    github?: string
    instagram?: string
    linkedin?: string
    portfolio?: string
  }
}

export default function AdminProfilePage() {
  const { user, loading: authLoading } = useAdminAuth()
  const router = useRouter()

  const [profileData, setProfileData] = useState<AdminProfile>({
    name: '',
    mobile: '',
    profile: {},
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  async function fetchProfile() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/profile', {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setProfileData(data.data)
        if (data.data.profile?.image?.url) {
          setImagePreview(data.data.profile.image.url)
        }
      } else {
        setError(data.message || 'Failed to load profile')
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function saveProfile() {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const formData = new FormData()
      formData.append('name', profileData.name)
      if (profileData.profile) {
        formData.append('profile', JSON.stringify(profileData.profile))
      }
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('Profile updated successfully')
        setProfileData(data.data)
        setImageFile(null)
        if (data.data.profile?.image?.url) {
          setImagePreview(data.data.profile.image.url)
        }
      } else {
        setError(data.message || 'Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const inputClass = `
    w-full rounded-xl border border-input
    bg-background px-4 py-3 text-sm
    placeholder:text-muted-foreground
    transition focus:border-primary
    focus:ring-2 focus:ring-primary/30 outline-none
  `

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <User className="text-primary" size={28} />
      </div>
      <p className="text-sm text-muted-foreground">
        Manage your profile information and account settings
      </p>

      {/* ALERTS */}
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/40">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400 border border-green-500/40">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN - Profile Image */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Profile Photo</h2>

            {/* Image Preview */}
            <div className="relative mx-auto w-48 h-48 rounded-full bg-primary/10 border-4 border-card overflow-hidden">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-primary">
                  <User size={80} />
                </div>
              )}

              {/* Upload Button Overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition cursor-pointer">
                <Camera size={32} className="text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Click the image to upload a new photo (Max 5MB)
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN - Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Basic Information</h2>

            {/* Name */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className={inputClass}
                placeholder="Enter your full name"
              />
            </div>

            {/* Mobile (Read-only) */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Phone size={14} />
                Mobile Number
                <span className="text-xs font-normal text-muted-foreground">
                  (Cannot be changed)
                </span>
              </label>
              <input
                type="text"
                value={profileData.mobile}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
              />
            </div>

            {/* Email for Team Card */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Mail size={14} />
                Email
                <span className="text-xs font-normal text-muted-foreground">
                  (Displayed on Team page)
                </span>
              </label>
              <input
                type="email"
                value={profileData.profile?.email || ''}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile: {
                      ...profileData.profile,
                      email: e.target.value,
                    },
                  })
                }
                className={inputClass}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg">Social Links</h2>
            <p className="text-xs text-muted-foreground">
              These links will be displayed on your Team Member card
            </p>

            {/* GitHub */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Github size={14} />
                GitHub
              </label>
              <input
                type="url"
                value={profileData.profile?.github || ''}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile: {
                      ...profileData.profile,
                      github: e.target.value,
                    },
                  })
                }
                className={inputClass}
                placeholder="https://github.com/yourusername"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Instagram size={14} />
                Instagram
              </label>
              <input
                type="url"
                value={profileData.profile?.instagram || ''}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile: {
                      ...profileData.profile,
                      instagram: e.target.value,
                    },
                  })
                }
                className={inputClass}
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Linkedin size={14} />
                LinkedIn
              </label>
              <input
                type="url"
                value={profileData.profile?.linkedin || ''}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile: {
                      ...profileData.profile,
                      linkedin: e.target.value,
                    },
                  })
                }
                className={inputClass}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
                <Globe size={14} />
                Portfolio
              </label>
              <input
                type="url"
                value={profileData.profile?.portfolio || ''}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    profile: {
                      ...profileData.profile,
                      portfolio: e.target.value,
                    },
                  })
                }
                className={inputClass}
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="
                flex items-center gap-2
                rounded-full cursor-pointer
                bg-linear-to-r from-primary to-purple-600
                px-8 py-3 font-semibold text-primary-foreground
                transition hover:opacity-90 hover:scale-105 active:scale-95
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  )
}
