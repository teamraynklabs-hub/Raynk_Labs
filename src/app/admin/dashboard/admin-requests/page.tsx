'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Pause,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

interface AdminRequest {
  _id: string
  name: string
  email: string
  mobile: string
  message?: string
  status: 'pending' | 'approved' | 'rejected' | 'on-hold'
  createdAt: string
  processedAt?: string
  processedBy?: {
    email: string
  }
}

export default function AdminRequestsPage() {
  const { isSuperAdmin, loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'on-hold'>('pending')
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isSuperAdmin, authLoading, router])

  useEffect(() => {
    if (isSuperAdmin) {
      fetchRequests()
    }
  }, [isSuperAdmin, filter])

  async function fetchRequests() {
    try {
      setLoading(true)
      const url = filter === 'all'
        ? '/api/admin/requests?all=true'
        : `/api/admin/requests?all=true&status=${filter}`

      const res = await fetch(url, {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setRequests(data.data)
      } else {
        setError(data.message || 'Failed to fetch requests')
      }
    } catch (err) {
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  async function processRequest(requestId: string, action: 'approve' | 'reject' | 'hold') {
    setProcessing(requestId)

    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (data.success) {
        fetchRequests()
      } else {
        alert(data.message || 'Failed to process request')
      }
    } catch (err) {
      alert('Failed to process request')
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
    approved: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
    'on-hold': { icon: Pause, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'On Hold' },
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Admin Requests
            </h1>
            <Shield className="text-yellow-500" size={24} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Super Admin Only • Manage admin signup requests
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <AlertCircle className="text-yellow-500" size={18} />
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
              {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected', 'on-hold'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              filter === status
                ? 'bg-linear-to-r from-primary to-purple-600 text-white shadow-lg'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {status === 'all' ? 'All' : status === 'on-hold' ? 'On Hold' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <UserPlus className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No requests found</h3>
          <p className="text-sm text-muted-foreground">
            {filter !== 'all' ? `No ${filter} requests` : 'No admin requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request, index) => {
            const StatusIcon = statusConfig[request.status].icon

            return (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/50 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold">{request.name}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig[request.status].bg} text-xs font-semibold`}>
                            <StatusIcon size={12} className={statusConfig[request.status].color} />
                            <span className={statusConfig[request.status].color}>
                              {statusConfig[request.status].label}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Mail size={14} />
                            <a href={`mailto:${request.email}`} className="hover:text-primary transition-colors cursor-pointer">
                              {request.email}
                            </a>
                          </div>
                          {request.mobile && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={14} />
                              <a href={`tel:${request.mobile}`} className="hover:text-primary transition-colors cursor-pointer">
                                {request.mobile}
                              </a>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.message && (
                      <div className="rounded-lg bg-muted/50 p-3 border border-border/50">
                        <p className="text-sm text-foreground">{request.message}</p>
                      </div>
                    )}

                    {request.processedAt && request.processedBy && (
                      <div className="text-xs text-muted-foreground">
                        Processed by {request.processedBy.email} on{' '}
                        {new Date(request.processedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => processRequest(request._id, 'approve')}
                        disabled={processing === request._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CheckCircle2 size={16} />
                        <span className="text-sm font-medium">Approve</span>
                      </button>

                      <button
                        onClick={() => processRequest(request._id, 'hold')}
                        disabled={processing === request._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Pause size={16} />
                        <span className="text-sm font-medium">Hold</span>
                      </button>

                      <button
                        onClick={() => processRequest(request._id, 'reject')}
                        disabled={processing === request._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                        <span className="text-sm font-medium">Reject</span>
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
          <div className="text-2xl font-bold">{requests.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-yellow-500/10 to-orange-500/10 p-4">
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Pending</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-green-500/10 to-emerald-500/10 p-4">
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Approved</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-linear-to-br from-red-500/10 to-pink-500/10 p-4">
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</div>
          <div className="text-xs text-muted-foreground mt-1">Rejected</div>
        </div>
      </div>
    </div>
  )
}
