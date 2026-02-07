'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'
import {
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Filter,
  Search,
  AlertCircle,
  CheckCircle2,
  Download,
  Clock,
} from 'lucide-react'

interface Submission {
  _id: string
  type: string
  originTitle: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  isRead: boolean
  userAgent?: string
  createdAt: string
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterRead, setFilterRead] = useState('all')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      const res = await fetch('/api/submissions', {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setSubmissions(data.data)
      } else {
        setError(data.message || 'Failed to fetch submissions')
      }
    } catch (err) {
      setError('Failed to load submissions')
    } finally {
      setLoading(false)
    }
  }

  async function toggleReadStatus(id: string, currentStatus: boolean) {
    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isRead: !currentStatus }),
      })

      const data = await res.json()
      if (data.success) {
        setSubmissions(prev =>
          prev.map(sub => (sub._id === id ? { ...sub, isRead: !currentStatus } : sub))
        )
      }
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  async function deleteSubmission(id: string) {
    if (!confirm('Are you sure you want to delete this submission?')) return

    try {
      const res = await fetch(`/api/submissions?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()
      if (data.success) {
        setSubmissions(prev => prev.filter(sub => sub._id !== id))
      }
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  function exportExcel() {
    const rows = submissions.map(d => ({
      Type: d.type,
      Purpose: d.originTitle || '',
      Name: d.name,
      Email: d.email,
      Phone: d.phone || '',
      Message: d.message || '',
      Status: d.isRead ? 'Read' : 'Unread',
      Time: new Date(d.createdAt).toLocaleString(),
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions')
    XLSX.writeFile(wb, 'submissions.xlsx')
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.message && sub.message.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === 'all' || sub.type === filterType
    const matchesRead =
      filterRead === 'all' ||
      (filterRead === 'read' && sub.isRead) ||
      (filterRead === 'unread' && !sub.isRead)

    return matchesSearch && matchesType && matchesRead
  })

  const types = ['all', ...new Set(submissions.map(s => s.type))]
  const unreadCount = submissions.filter(s => !s.isRead).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Form Submissions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all user form submissions
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <AlertCircle size={12} />
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or message..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer appearance-none"
          >
            {types.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>

        {/* Read Status Filter */}
        <div className="relative">
          <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={filterRead}
            onChange={e => setFilterRead(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer appearance-none"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-border/50 bg-card/50">
          <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || filterType !== 'all' || filterRead !== 'all'
              ? 'Try adjusting your filters'
              : 'Submissions will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border ${
                submission.isRead ? 'border-border/50 bg-card/50' : 'border-primary/30 bg-primary/5'
              } p-6 shadow-sm hover:shadow-md transition-all duration-200`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{submission.name}</h3>
                        {!submission.isRead && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                            NEW
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium capitalize">
                          {submission.type}
                        </span>
                        {submission.originTitle && (
                          <span className="text-xs text-muted-foreground">
                            • {submission.originTitle}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Mail size={14} />
                          <a href={`mailto:${submission.email}`} className="hover:text-primary transition-colors cursor-pointer">
                            {submission.email}
                          </a>
                        </div>
                        {submission.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} />
                            <a href={`tel:${submission.phone}`} className="hover:text-primary transition-colors cursor-pointer">
                              {submission.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {new Date(submission.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {submission.message && (
                    <div className="rounded-lg bg-muted/50 p-3 border border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Message</span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{submission.message}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => toggleReadStatus(submission._id, submission.isRead)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                      submission.isRead
                        ? 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                    title={submission.isRead ? 'Mark as unread' : 'Mark as read'}
                  >
                    {submission.isRead ? (
                      <>
                        <EyeOff size={16} />
                        <span className="hidden sm:inline">Unread</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span className="hidden sm:inline">Read</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => deleteSubmission(submission._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-primary/10 to-purple-500/10 p-4">
          <div className="text-2xl font-bold">{submissions.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Total</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4">
          <div className="text-2xl font-bold">{unreadCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Unread</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4">
          <div className="text-2xl font-bold">{submissions.length - unreadCount}</div>
          <div className="text-xs text-muted-foreground mt-1">Read</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4">
          <div className="text-2xl font-bold">{types.length - 1}</div>
          <div className="text-xs text-muted-foreground mt-1">Types</div>
        </div>
      </div>
    </div>
  )
}
