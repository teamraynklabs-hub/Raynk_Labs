'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Shield,
  Briefcase,
} from 'lucide-react'

// ============================================
// TYPES
// ============================================

type NotificationType =
  | 'task-assigned'
  | 'task-completed'
  | 'task-updated'
  | 'request-submitted'
  | 'request-approved'
  | 'request-rejected'
  | 'admin-approved'
  | 'admin-rejected'
  | 'system'
  | 'announcement'

interface Notification {
  _id: string
  type: NotificationType
  title: string
  message: string
  recipient: string
  sender?: string
  refType?: 'Task' | 'AdminRequest' | 'Admin'
  refId?: string
  isRead: boolean
  readAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// NOTIFICATION CENTER COMPONENT
// ============================================

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications(true) // Silent fetch
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  async function fetchNotifications(silent = false) {
    try {
      if (!silent) setLoading(true)

      const params = new URLSearchParams()
      if (filter === 'unread') params.append('isRead', 'false')
      if (filter === 'read') params.append('isRead', 'true')

      const res = await fetch(`/api/admin/notifications?${params}`, {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setNotifications(data.data.notifications)
        setUnreadCount(data.data.unreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  async function markAsRead(notificationId: string) {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PUT',
        credentials: 'include',
      })

      if (!res.ok) {
        // Revert on error
        fetchNotifications(true)
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
      fetchNotifications(true)
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        credentials: 'include',
      })

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  async function deleteNotification(notificationId: string) {
    try {
      // Optimistic update
      const wasUnread = !notifications.find((n) => n._id === notificationId)?.isRead
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId))
      if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1))

      const res = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!res.ok) {
        // Revert on error
        fetchNotifications(true)
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
      fetchNotifications(true)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'read') return n.isRead
    return true
  })

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL ICON BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          relative p-2 rounded-lg cursor-pointer
          hover:bg-accent transition
          focus:outline-none focus:ring-2 focus:ring-primary/30
        "
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="
              absolute -top-1 -right-1
              bg-red-500 text-white text-xs
              font-bold rounded-full
              min-w-[18px] h-[18px]
              flex items-center justify-center
              px-1
            "
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* NOTIFICATION DROPDOWN */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="
              absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)]
              bg-card border border-border rounded-2xl
              shadow-2xl overflow-hidden z-50
            "
          >
            {/* HEADER */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-accent rounded-lg transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* FILTER TABS */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`
                    flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer
                    ${
                      filter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent hover:bg-accent/80'
                    }
                  `}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`
                    flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer
                    ${
                      filter === 'unread'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent hover:bg-accent/80'
                    }
                  `}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`
                    flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer
                    ${
                      filter === 'read'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent hover:bg-accent/80'
                    }
                  `}
                >
                  Read
                </button>
              </div>

              {/* MARK ALL AS READ */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="
                    mt-2 w-full flex items-center justify-center gap-2
                    px-3 py-1.5 rounded-lg text-xs font-medium
                    bg-green-500/10 text-green-600 dark:text-green-400
                    hover:bg-green-500/20 transition cursor-pointer
                    border border-green-500/20
                  "
                >
                  <CheckCheck size={14} />
                  Mark all as read
                </button>
              )}
            </div>

            {/* NOTIFICATION LIST */}
            <div className="max-h-[500px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell size={48} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================
// NOTIFICATION ITEM COMPONENT
// ============================================

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const notificationIcons: Record<NotificationType, React.ReactNode> = {
    'task-assigned': <Briefcase size={16} className="text-blue-500" />,
    'task-completed': <CheckCircle2 size={16} className="text-green-500" />,
    'task-updated': <FileText size={16} className="text-orange-500" />,
    'request-submitted': <FileText size={16} className="text-purple-500" />,
    'request-approved': <CheckCircle2 size={16} className="text-green-500" />,
    'request-rejected': <XCircle size={16} className="text-red-500" />,
    'admin-approved': <Shield size={16} className="text-green-500" />,
    'admin-rejected': <Shield size={16} className="text-red-500" />,
    system: <AlertCircle size={16} className="text-blue-500" />,
    announcement: <Bell size={16} className="text-purple-500" />,
  }

  const timeAgo = getTimeAgo(new Date(notification.createdAt))

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`
        p-4 hover:bg-muted/30 transition group
        ${!notification.isRead ? 'bg-primary/5' : ''}
      `}
    >
      <div className="flex gap-3">
        {/* ICON */}
        <div className="flex-shrink-0 mt-1">
          {notificationIcons[notification.type]}
        </div>

        {/* CONTENT */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {!notification.isRead && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{timeAgo}</span>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 mt-3">
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification._id)}
                className="
                  flex items-center gap-1 px-2 py-1 rounded-md text-xs
                  bg-green-500/10 text-green-600 dark:text-green-400
                  hover:bg-green-500/20 transition cursor-pointer
                  border border-green-500/20
                "
              >
                <Check size={12} />
                Mark as read
              </button>
            )}
            <button
              onClick={() => onDelete(notification._id)}
              className="
                flex items-center gap-1 px-2 py-1 rounded-md text-xs
                bg-destructive/10 text-destructive
                hover:bg-destructive/20 transition cursor-pointer
                border border-destructive/20 opacity-0 group-hover:opacity-100
              "
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffDay > 7) {
    return date.toLocaleDateString()
  } else if (diffDay > 0) {
    return `${diffDay}d ago`
  } else if (diffHour > 0) {
    return `${diffHour}h ago`
  } else if (diffMin > 0) {
    return `${diffMin}m ago`
  } else {
    return 'Just now'
  }
}
