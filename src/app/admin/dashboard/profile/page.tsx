'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Lock,
  Github,
  Instagram,
  Linkedin,
  Globe,
  Camera,
  Save,
  ShieldCheck,
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

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    otp: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

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

  async function requestOtp() {
    try {
      setSendingOtp(true)
      setError('')

      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: profileData.mobile }),
      })

      const data = await res.json()

      if (data.success) {
        setOtpSent(true)
        setSuccess(data.message || 'OTP sent to your registered email')
      } else {
        setError(data.message || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Failed to send OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  async function changePassword() {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        setError('New passwords do not match')
        return
      }

      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          mobile: profileData.mobile,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmNewPassword: passwordForm.confirmNewPassword,
          otp: passwordForm.otp,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess(data.message || 'Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
          otp: '',
        })
        setShowPasswordForm(false)
        setOtpSent(false)
      } else {
        setError(data.message || 'Failed to change password')
      }
    } catch (err) {
      setError('Failed to change password')
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

      {/* PASSWORD CHANGE SECTION */}
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="text-yellow-500" size={20} />
            <h2 className="font-semibold text-lg">Password & Security</h2>
          </div>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="text-sm text-primary hover:underline cursor-pointer"
            >
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-4 border-t border-border"
          >
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <ShieldCheck className="text-yellow-500 mt-0.5" size={18} />
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                <p className="font-semibold">OTP Verification Required</p>
                <p className="text-xs mt-1">
                  An OTP will be sent to your registered email for verification
                </p>
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special
                char
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmNewPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmNewPassword: e.target.value,
                  })
                }
                className={inputClass}
                placeholder="Confirm new password"
              />
            </div>

            {/* OTP Section */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-semibold mb-2 block">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={passwordForm.otp}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      otp: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  disabled={!otpSent}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={requestOtp}
                  disabled={sendingOtp || otpSent}
                  className="
                    rounded-lg px-6 py-3 cursor-pointer
                    bg-primary/10 text-primary border border-primary/20
                    hover:bg-primary/20 transition
                    disabled:opacity-60 disabled:cursor-not-allowed
                    text-sm font-semibold whitespace-nowrap
                  "
                >
                  {sendingOtp ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                    otp: '',
                  })
                  setOtpSent(false)
                  setError('')
                  setSuccess('')
                }}
                className="
                  px-6 py-2 rounded-lg cursor-pointer
                  border border-border hover:bg-accent
                  transition text-sm font-medium
                "
              >
                Cancel
              </button>
              <button
                onClick={changePassword}
                disabled={
                  saving ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmNewPassword ||
                  !passwordForm.otp
                }
                className="
                  flex items-center gap-2 px-6 py-2 rounded-lg cursor-pointer
                  bg-linear-to-r from-primary to-purple-600
                  text-primary-foreground font-semibold
                  transition hover:opacity-90 hover:scale-105 active:scale-95
                  disabled:opacity-60 disabled:cursor-not-allowed
                  text-sm
                "
              >
                <Lock size={16} />
                {saving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
