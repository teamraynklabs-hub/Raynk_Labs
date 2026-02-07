'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  email: string
  role: 'admin' | 'super-admin'
  adminId: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  isSuperAdmin: boolean
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify', {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.authenticated && data.admin) {
        setUser(data.admin)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth verification failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isSuperAdmin = user?.role === 'super-admin'
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin'

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        loading,
        logout,
        refreshAuth,
        isSuperAdmin,
        isAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
