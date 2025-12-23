'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= VALIDATION ================= */
  function validate() {
    if (!email.trim()) {
      setError('Email is required')
      return false
    }
    if (!password.trim()) {
      setError('Password is required')
      return false
    }
    if (!email.includes('@')) {
      setError('Enter a valid email address')
      return false
    }
    return true
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid credentials')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">

      {/* BACK BUTTON */}
      <button
        onClick={() => router.push('/')}
        className="
          fixed left-5 top-5 z-50
          flex items-center gap-2
          rounded-full border border-border bg-card
          px-4 py-2 text-sm font-medium
          transition hover:bg-muted
        "
      >
        <FiArrowLeft />
        Back
      </button>

      {/* LOGIN CARD */}
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-10 shadow-xl">
        <h1 className="mb-2 text-center text-3xl font-extrabold text-primary">
          RaYnk Labs
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Admin Secure Login
        </p>

        {/* ERROR */}
        {error && (
          <div className="
            mb-6 flex items-center gap-2
            rounded-xl border border-destructive/40
            bg-destructive/10 px-4 py-3
            text-sm text-destructive
          ">
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* EMAIL */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="
                  w-full rounded-xl border border-border bg-muted
                  pl-11 pr-4 py-3
                  outline-none transition
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                "
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="
                  w-full rounded-xl border border-border bg-muted
                  pl-11 pr-4 py-3
                  outline-none transition
                  focus:border-primary focus:ring-2 focus:ring-primary/30
                "
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-xl bg-primary
              py-3 text-lg font-semibold
              text-primary-foreground
              transition hover:opacity-90
              disabled:opacity-60
            "
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Secure admin access only
        </p>
      </div>
    </div>
  )
}
