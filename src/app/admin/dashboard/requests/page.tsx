'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PauseCircle,
  AlertCircle,
  Briefcase,
  Send,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

// ============================================
// TYPES
// ============================================

type RequestType = 'leave' | 'tool-subscription' | 'resource' | 'other'
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'on-hold'

interface AdminRequest {
  _id: string
  type: RequestType
  title: string
  description: string
  requestedBy: string
  leaveStartDate?: string
  leaveEndDate?: string
  leaveReason?: string
  toolName?: string
  toolCost?: number
  toolDuration?: string
  status: RequestStatus
  processedBy?: string
  processedAt?: string
  responseNote?: string
  createdAt: string
  updatedAt: string
}

interface RequestFormData {
  type: RequestType
  title: string
  description: string
  // Leave specific
  leaveStartDate: string
  leaveEndDate: string
  leaveReason: string
  // Tool subscription specific
  toolName: string
  toolCost: string
  toolDuration: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function AdminRequestsPage() {
  const { user, loading: authLoading } = useAdminAuth()
  const router = useRouter()

  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all')
  const [formData, setFormData] = useState<RequestFormData>({
    type: 'leave',
    title: '',
    description: '',
    leaveStartDate: '',
    leaveEndDate: '',
    leaveReason: '',
    toolName: '',
    toolCost: '',
    toolDuration: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user, filter])

  async function fetchRequests() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)

      const res = await fetch(`/api/admin/requests?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setRequests(data.data)
      } else {
        setError(data.message || 'Failed to load requests')
      }
    } catch (err) {
      setError('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  async function submitRequest() {
    try {
      setError('')
      setSuccess('')

      if (!formData.title.trim()) {
        setError('Title is required')
        return
      }

      if (!formData.description.trim()) {
        setError('Description is required')
        return
      }

      // Validate type-specific fields
      if (formData.type === 'leave') {
        if (!formData.leaveStartDate || !formData.leaveEndDate) {
          setError('Leave start and end dates are required')
          return
        }
      } else if (formData.type === 'tool-subscription') {
        if (!formData.toolName.trim()) {
          setError('Tool name is required')
          return
        }
      }

      const payload: Record<string, unknown> = {
        type: formData.type,
        title: formData.title.trim(),
        description: formData.description.trim(),
      }

      // Add type-specific fields
      if (formData.type === 'leave') {
        payload.leaveStartDate = formData.leaveStartDate
        payload.leaveEndDate = formData.leaveEndDate
        payload.leaveReason = formData.leaveReason.trim() || undefined
      } else if (formData.type === 'tool-subscription') {
        payload.toolName = formData.toolName.trim()
        payload.toolCost = formData.toolCost
          ? parseFloat(formData.toolCost)
          : undefined
        payload.toolDuration = formData.toolDuration.trim() || undefined
      }

      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        setSuccess('Request submitted successfully')
        setShowCreateModal(false)
        setFormData({
          type: 'leave',
          title: '',
          description: '',
          leaveStartDate: '',
          leaveEndDate: '',
          leaveReason: '',
          toolName: '',
          toolCost: '',
          toolDuration: '',
        })
        fetchRequests()
      } else {
        setError(data.message || 'Failed to submit request')
      }
    } catch (err) {
      setError('Failed to submit request')
    }
  }

  const filteredRequests = requests.filter((r) => {
    if (filter === 'all') return true
    return r.status === filter
  })

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            My Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit leave requests, tool subscriptions, and other requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="
            flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer
            bg-linear-to-r from-primary to-purple-600
            text-primary-foreground font-semibold
            transition hover:opacity-90 hover:scale-105 active:scale-95
          "
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/40 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400 border border-green-500/40">
          {success}
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'pending', 'approved', 'rejected', 'on-hold'] as const).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer whitespace-nowrap
                ${
                  filter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent hover:bg-accent/80'
                }
              `}
            >
              {status === 'all' ? 'All' : status.replace('-', ' ')}
            </button>
          )
        )}
      </div>

      {/* REQUESTS GRID */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground rounded-2xl border border-border/50 bg-card/50">
            <FileText size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No requests found</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <RequestModal
            formData={formData}
            setFormData={setFormData}
            onSubmit={submitRequest}
            onClose={() => {
              setShowCreateModal(false)
              setFormData({
                type: 'leave',
                title: '',
                description: '',
                leaveStartDate: '',
                leaveEndDate: '',
                leaveReason: '',
                toolName: '',
                toolCost: '',
                toolDuration: '',
              })
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// REQUEST CARD COMPONENT
// ============================================

interface RequestCardProps {
  request: AdminRequest
}

function RequestCard({ request }: RequestCardProps) {
  const statusConfig = {
    pending: {
      icon: <Clock size={16} />,
      color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      label: 'Pending',
    },
    approved: {
      icon: <CheckCircle2 size={16} />,
      color: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20',
      label: 'Approved',
    },
    rejected: {
      icon: <XCircle size={16} />,
      color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
      label: 'Rejected',
    },
    'on-hold': {
      icon: <PauseCircle size={16} />,
      color: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
      label: 'On Hold',
    },
  }

  const typeLabels: Record<RequestType, string> = {
    leave: 'Leave Request',
    'tool-subscription': 'Tool Subscription',
    resource: 'Resource Request',
    other: 'Other',
  }

  const status = statusConfig[request.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm hover:shadow-md transition"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
              {typeLabels[request.type]}
            </span>
          </div>
          <h3 className="font-bold text-lg">{request.title}</h3>
        </div>

        <span
          className={`
          flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border
          ${status.color}
        `}
        >
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-muted-foreground mb-4">{request.description}</p>

      {/* TYPE-SPECIFIC DETAILS */}
      <div className="space-y-2 mb-4">
        {request.type === 'leave' && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-primary" />
              <span className="text-muted-foreground">
                {request.leaveStartDate &&
                  new Date(request.leaveStartDate).toLocaleDateString()}{' '}
                -{' '}
                {request.leaveEndDate &&
                  new Date(request.leaveEndDate).toLocaleDateString()}
              </span>
            </div>
            {request.leaveReason && (
              <p className="text-xs text-muted-foreground pl-6">
                Reason: {request.leaveReason}
              </p>
            )}
          </>
        )}

        {request.type === 'tool-subscription' && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase size={14} className="text-primary" />
              <span className="font-medium">{request.toolName}</span>
            </div>
            {request.toolCost && (
              <div className="flex items-center gap-2 text-sm pl-6">
                <DollarSign size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  ${request.toolCost}
                  {request.toolDuration && ` / ${request.toolDuration}`}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* RESPONSE NOTE */}
      {request.responseNote && (
        <div className="rounded-lg bg-muted/50 p-3 mb-4">
          <p className="text-xs font-semibold mb-1">Admin Response:</p>
          <p className="text-sm text-muted-foreground">{request.responseNote}</p>
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/30">
        <span>Submitted {new Date(request.createdAt).toLocaleDateString()}</span>
        {request.processedAt && (
          <span>
            Processed {new Date(request.processedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ============================================
// REQUEST MODAL COMPONENT
// ============================================

interface RequestModalProps {
  formData: RequestFormData
  setFormData: React.Dispatch<React.SetStateAction<RequestFormData>>
  onSubmit: () => void
  onClose: () => void
}

function RequestModal({
  formData,
  setFormData,
  onSubmit,
  onClose,
}: RequestModalProps) {
  const inputClass = `
    w-full rounded-xl border border-input
    bg-background px-4 py-3 text-sm
    placeholder:text-muted-foreground
    transition focus:border-primary
    focus:ring-2 focus:ring-primary/30 outline-none
  `

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Submit New Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4">
          {/* Request Type */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Request Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as RequestType,
                })
              }
              className={inputClass}
            >
              <option value="leave">Leave Request</option>
              <option value="tool-subscription">Tool Subscription</option>
              <option value="resource">Resource Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold mb-2 block">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={inputClass}
              placeholder="Enter request title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Description *
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={inputClass}
              placeholder="Provide detailed description"
            />
          </div>

          {/* LEAVE-SPECIFIC FIELDS */}
          {formData.type === 'leave' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.leaveStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaveStartDate: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.leaveEndDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        leaveEndDate: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Reason (optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.leaveReason}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveReason: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Reason for leave"
                />
              </div>
            </>
          )}

          {/* TOOL-SUBSCRIPTION-SPECIFIC FIELDS */}
          {formData.type === 'tool-subscription' && (
            <>
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Tool Name *
                </label>
                <input
                  type="text"
                  value={formData.toolName}
                  onChange={(e) =>
                    setFormData({ ...formData, toolName: e.target.value })
                  }
                  className={inputClass}
                  placeholder="e.g., Figma Pro, ChatGPT Plus"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Cost (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.toolCost}
                    onChange={(e) =>
                      setFormData({ ...formData, toolCost: e.target.value })
                    }
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Duration (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.toolDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        toolDuration: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="e.g., monthly, yearly"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="
              px-6 py-2 rounded-lg cursor-pointer
              border border-border hover:bg-accent
              transition font-medium
            "
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="
              flex items-center gap-2 px-6 py-2 rounded-lg cursor-pointer
              bg-linear-to-r from-primary to-purple-600
              text-primary-foreground font-semibold
              transition hover:opacity-90 hover:scale-105 active:scale-95
            "
          >
            <Send size={16} />
            Submit Request
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
