'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Plus,
  X,
  Trash2,
  Calendar,
  Users,
  AlertCircle,
  Edit,
  Shield,
  Clock,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

// ============================================
// TYPES
// ============================================

interface CommonTask {
  _id: string
  title: string
  description?: string
  completedBy: Array<{
    adminId: string
    completedAt: string
  }>
  createdBy: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface TaskFormData {
  title: string
  description: string
  dueDate: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CommonTasksPage() {
  const { user, loading: authLoading, isSuperAdmin } = useAdminAuth()
  const router = useRouter()

  const [tasks, setTasks] = useState<CommonTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<CommonTask | null>(null)
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  async function fetchTasks() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/tasks/common', {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setTasks(data.data)
      } else {
        setError(data.message || 'Failed to load common tasks')
      }
    } catch (err) {
      setError('Failed to load common tasks')
    } finally {
      setLoading(false)
    }
  }

  async function createTask() {
    try {
      setError('')
      setSuccess('')

      if (!formData.title.trim()) {
        setError('Task title is required')
        return
      }

      const res = await fetch('/api/admin/tasks/common', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          dueDate: formData.dueDate || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setTasks([data.data, ...tasks])
        setShowCreateModal(false)
        setFormData({ title: '', description: '', dueDate: '' })
        setSuccess('Common task created successfully')
      } else {
        setError(data.message || 'Failed to create task')
      }
    } catch (err) {
      setError('Failed to create task')
    }
  }

  async function updateTask() {
    if (!editingTask) return

    try {
      setError('')
      setSuccess('')

      const res = await fetch(`/api/admin/tasks/common/${editingTask._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          dueDate: formData.dueDate || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setTasks(tasks.map((t) => (t._id === editingTask._id ? data.data : t)))
        setEditingTask(null)
        setFormData({ title: '', description: '', dueDate: '' })
        setSuccess('Task updated successfully')
      } else {
        setError(data.message || 'Failed to update task')
      }
    } catch (err) {
      setError('Failed to update task')
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this common task?')) return

    try {
      setError('')
      setSuccess('')

      const res = await fetch(`/api/admin/tasks/common/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        setTasks(tasks.filter((t) => t._id !== taskId))
        setSuccess('Task deleted successfully')
      } else {
        setError(data.message || 'Failed to delete task')
      }
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  async function markAsComplete(taskId: string) {
    try {
      setError('')
      setSuccess('')

      // Optimistic update
      const oldTasks = [...tasks]
      setTasks(
        tasks.map((t) =>
          t._id === taskId
            ? {
                ...t,
                completedBy: [
                  ...t.completedBy,
                  { adminId: user!.adminId, completedAt: new Date().toISOString() },
                ],
              }
            : t
        )
      )

      const res = await fetch(`/api/admin/tasks/common/${taskId}`, {
        method: 'POST',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        // Update with server response
        setTasks(tasks.map((t) => (t._id === taskId ? data.data : t)))
        setSuccess('Task marked as completed')
      } else {
        // Revert on error
        setTasks(oldTasks)
        setError(data.message || 'Failed to mark task as complete')
      }
    } catch (err) {
      setError('Failed to mark task as complete')
    }
  }

  function openEditModal(task: CommonTask) {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    })
  }

  function isCompletedByMe(task: CommonTask): boolean {
    return task.completedBy.some((c) => c.adminId === user?.adminId)
  }

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
            Common Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks shared across all team members
          </p>
        </div>
        {isSuperAdmin && (
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
            New Common Task
          </button>
        )}
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

      {/* TASKS TABLE */}
      <div className="rounded-2xl border border-border/50 bg-card/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/50">
                <th className="text-left p-4 font-semibold text-sm">Task</th>
                <th className="text-left p-4 font-semibold text-sm">Due Date</th>
                <th className="text-center p-4 font-semibold text-sm">
                  Completions
                </th>
                <th className="text-center p-4 font-semibold text-sm">Status</th>
                <th className="text-center p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <motion.tr
                  key={task._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/30 hover:bg-muted/30 transition"
                >
                  {/* TASK INFO */}
                  <td className="p-4">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* DUE DATE */}
                  <td className="p-4">
                    {task.dueDate ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No due date
                      </span>
                    )}
                  </td>

                  {/* COMPLETIONS */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Users size={16} className="text-primary" />
                      <span className="font-semibold">
                        {task.completedBy.length}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="p-4 text-center">
                    {isCompletedByMe(task) ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-medium border border-green-500/20">
                        <CheckCircle2 size={12} />
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-500/10 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full font-medium border border-gray-500/20">
                        <Circle size={12} />
                        Pending
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      {!isCompletedByMe(task) && (
                        <button
                          onClick={() => markAsComplete(task._id)}
                          className="
                            p-2 rounded-lg cursor-pointer
                            bg-green-500/10 text-green-600 dark:text-green-400
                            hover:bg-green-500/20 transition
                            border border-green-500/20
                          "
                          title="Mark as complete"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}

                      {isSuperAdmin && (
                        <>
                          <button
                            onClick={() => openEditModal(task)}
                            className="
                              p-2 rounded-lg cursor-pointer
                              bg-primary/10 text-primary
                              hover:bg-primary/20 transition
                              border border-primary/20
                            "
                            title="Edit task"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteTask(task._id)}
                            className="
                              p-2 rounded-lg cursor-pointer
                              bg-destructive/10 text-destructive
                              hover:bg-destructive/20 transition
                              border border-destructive/20
                            "
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No common tasks yet</p>
            {isSuperAdmin && (
              <p className="text-sm text-muted-foreground mt-1">
                Create your first common task to get started
              </p>
            )}
          </div>
        )}
      </div>

      {/* INFO CARD */}
      <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 flex items-start gap-3">
        <Shield className="text-blue-500 mt-0.5" size={20} />
        <div className="text-sm">
          <p className="font-semibold text-blue-600 dark:text-blue-400">
            About Common Tasks
          </p>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? 'You can create, edit, and delete common tasks. All team members can mark tasks as complete.'
              : 'Common tasks are shared across all team members. Mark tasks as complete when you finish them.'}
          </p>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {(showCreateModal || editingTask) && (
          <TaskModal
            isEdit={!!editingTask}
            formData={formData}
            setFormData={setFormData}
            onSave={editingTask ? updateTask : createTask}
            onClose={() => {
              setShowCreateModal(false)
              setEditingTask(null)
              setFormData({ title: '', description: '', dueDate: '' })
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// TASK MODAL COMPONENT
// ============================================

interface TaskModalProps {
  isEdit: boolean
  formData: TaskFormData
  setFormData: React.Dispatch<React.SetStateAction<TaskFormData>>
  onSave: () => void
  onClose: () => void
}

function TaskModal({
  isEdit,
  formData,
  setFormData,
  onSave,
  onClose,
}: TaskModalProps) {
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
        className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Edit Common Task' : 'Create Common Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={inputClass}
              placeholder="Enter task title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={inputClass}
              placeholder="Add task description (optional)"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar size={14} />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className={inputClass}
            />
          </div>
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
            onClick={onSave}
            className="
              px-6 py-2 rounded-lg cursor-pointer
              bg-linear-to-r from-primary to-purple-600
              text-primary-foreground font-semibold
              transition hover:opacity-90 hover:scale-105 active:scale-95
            "
          >
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
