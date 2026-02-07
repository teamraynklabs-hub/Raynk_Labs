'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Users as UsersIcon,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  UserCheck,
  UserX,
  Pause,
  Edit,
  Trash2,
  Clock,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

interface AdminUser {
  _id: string
  name: string
  email: string
  mobile: string
  role: 'admin' | 'super-admin'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  image?: {
    url: string
  }
  createdAt: string
  approvedAt?: string
  approvedBy?: {
    email: string
  }
}

export default function AdminUsersPage() {
  const { isSuperAdmin, loading: authLoading, user } = useAdminAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('approved')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isSuperAdmin, authLoading, router])

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins()
    }
  }, [isSuperAdmin, filter])

  async function fetchAdmins() {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? '/api/admin/users'
        : `/api/admin/users?status=${filter}`

      const res = await fetch(url, {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        // Filter out the current super admin from the list
        setAdmins(data.data.filter((admin: AdminUser) => admin.email !== user?.email))
      } else {
        setError(data.message || 'Failed to fetch admins')
      }
    } catch (err) {
      setError('Failed to load admins')
    } finally {
      setLoading(false)
    }
  }

  async function processAdmin(adminId: string, action: 'approve' | 'suspend' | 'delete') {
    if (action === 'delete') {
      if (!confirm('Delete this admin permanently? This action cannot be undone.')) {
        return
      }
    }

    setProcessing(adminId)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adminId, action }),
      })

      const data = await res.json()

      if (data.success) {
        fetchAdmins()
      } else {
        alert(data.message || 'Failed to process action')
      }
    } catch (err) {
      alert('Failed to process action')
    } finally {
      setProcessing(null)
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

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Pending' },
    approved: { icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' },
    rejected: { icon: UserX, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
    suspended: { icon: Pause, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Suspended' },
  }

  const approvedCount = admins.filter(a => a.status === 'approved').length
  const suspendedCount = admins.filter(a => a.status === 'suspended').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Users Management
            </h1>
            <Shield className="text-yellow-500" size={24} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Super Admin Only • Manage all admin accounts
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
          <UsersIcon className="text-primary" size={18} />
          <span className="text-sm font-semibold text-primary">
            {approvedCount} Active Admin{approvedCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'approved', 'pending', 'suspended'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              filter === status
                ? 'bg-linear-to-r from-primary to-purple-600 text-white shadow-lg'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Admins List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <UsersIcon className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No admins found</h3>
          <p className="text-sm text-muted-foreground">
            {filter !== 'all' ? `No ${filter} admins` : 'No admin accounts yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin, index) => {
            const StatusIcon = statusConfig[admin.status].icon

            return (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Header with Image */}
                <div className="h-24 bg-linear-to-br from-primary/10 to-purple-500/10 flex items-center justify-center relative">
                  {admin.image?.url ? (
                    <img
                      src={admin.image.url}
                      alt={admin.name}
                      className="h-16 w-16 rounded-full border-4 border-card object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full border-4 border-card bg-primary/20 flex items-center justify-center">
                      <UsersIcon className="text-primary" size={32} />
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusConfig[admin.status].bg}`}>
                    <StatusIcon size={10} className={statusConfig[admin.status].color} />
                    <span className={`text-xs font-semibold ${statusConfig[admin.status].color}`}>
                      {statusConfig[admin.status].label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-1">{admin.name}</h3>
                    {admin.role === 'super-admin' && (
                      <div className="flex items-center gap-1 mt-1">
                        <Shield size={12} className="text-yellow-500" />
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                          Super Admin
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail size={12} />
                      <a href={`mailto:${admin.email}`} className="hover:text-primary transition-colors cursor-pointer truncate">
                        {admin.email}
                      </a>
                    </div>
                    {admin.mobile && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} />
                        <a href={`tel:${admin.mobile}`} className="hover:text-primary transition-colors cursor-pointer">
                          {admin.mobile}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span className="text-xs">
                        Joined {new Date(admin.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {admin.approvedAt && admin.approvedBy && (
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                      Approved by {admin.approvedBy.email}
                    </div>
                  )}

                  {/* Actions */}
                  {admin.role !== 'super-admin' && (
                    <div className="flex gap-2 pt-2">
                      {admin.status === 'approved' && (
                        <button
                          onClick={() => processAdmin(admin._id, 'suspend')}
                          disabled={processing === admin._id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 text-xs font-medium"
                        >
                          <Pause size={12} />
                          Suspend
                        </button>
                      )}

                      {admin.status === 'suspended' && (
                        <button
                          onClick={() => processAdmin(admin._id, 'approve')}
                          disabled={processing === admin._id}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 text-xs font-medium"
                        >
                          <UserCheck size={12} />
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => processAdmin(admin._id, 'delete')}
                        disabled={processing === admin._id}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 text-xs font-medium"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-primary/10 to-purple-500/10 p-4">
          <div className="text-2xl font-bold">{admins.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Admins</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-green-500/10 to-emerald-500/10 p-4">
          <div className="text-2xl font-bold">{approvedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Active</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-orange-500/10 to-red-500/10 p-4">
          <div className="text-2xl font-bold">{suspendedCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Suspended</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-yellow-500/10 to-amber-500/10 p-4">
          <div className="text-2xl font-bold">{admins.filter(a => a.status === 'pending').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending</div>
        </div>
      </div>
    </div>
  )
}
