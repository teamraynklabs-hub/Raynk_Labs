'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  X,
  Trash2,
  Calendar,
  Flag,
  StickyNote,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'

// ============================================
// TYPES
// ============================================

interface PersonalTask {
  _id: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  adminId: string
  assignedBy?: string
  isAssigned: boolean
  dueDate?: string
  completedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

type TaskStatus = 'todo' | 'in-progress' | 'completed'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface TaskFormData {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  notes: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PersonalTasksPage() {
  const { user, loading: authLoading } = useAdminAuth()
  const router = useRouter()

  const [tasks, setTasks] = useState<PersonalTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<PersonalTask | null>(null)
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    notes: '',
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
      const res = await fetch('/api/admin/tasks', {
        credentials: 'include',
      })
      const data = await res.json()

      if (data.success) {
        setTasks(data.data)
      } else {
        setError(data.message || 'Failed to load tasks')
      }
    } catch (err) {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  async function createTask() {
    try {
      setError('')
      if (!formData.title.trim()) {
        setError('Task title is required')
        return
      }

      const res = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          notes: formData.notes.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        // Optimistic update
        setTasks([data.data, ...tasks])
        setShowCreateModal(false)
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
          notes: '',
        })
      } else {
        setError(data.message || 'Failed to create task')
      }
    } catch (err) {
      setError('Failed to create task')
    }
  }

  async function updateTask(taskId: string, updates: Partial<PersonalTask>) {
    try {
      setError('')

      // Optimistic update
      const oldTasks = [...tasks]
      setTasks(
        tasks.map((t) =>
          t._id === taskId ? { ...t, ...updates } : t
        )
      )

      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      })

      const data = await res.json()

      if (data.success) {
        // Update with server response
        setTasks(
          tasks.map((t) => (t._id === taskId ? data.data : t))
        )
        if (editingTask?._id === taskId) {
          setEditingTask(null)
        }
      } else {
        // Revert on error
        setTasks(oldTasks)
        setError(data.message || 'Failed to update task')
      }
    } catch (err) {
      setError('Failed to update task')
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      setError('')

      // Optimistic update
      const oldTasks = [...tasks]
      setTasks(tasks.filter((t) => t._id !== taskId))

      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!data.success) {
        // Revert on error
        setTasks(oldTasks)
        setError(data.message || 'Failed to delete task')
      }
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  function changeStatus(taskId: string, newStatus: TaskStatus) {
    updateTask(taskId, { status: newStatus })
  }

  function openEditModal(task: PersonalTask) {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      notes: task.notes || '',
    })
  }

  function saveEdit() {
    if (!editingTask) return
    updateTask(editingTask._id, {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      notes: formData.notes.trim() || undefined,
    })
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

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
            My Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal and assigned tasks
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
          New Task
        </button>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/40 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TO-DO COLUMN */}
        <TaskColumn
          title="To-Do"
          icon={<Circle size={20} />}
          count={todoTasks.length}
          tasks={todoTasks}
          onStatusChange={changeStatus}
          onEdit={openEditModal}
          onDelete={deleteTask}
          color="gray"
        />

        {/* IN PROGRESS COLUMN */}
        <TaskColumn
          title="In Progress"
          icon={<Clock size={20} />}
          count={inProgressTasks.length}
          tasks={inProgressTasks}
          onStatusChange={changeStatus}
          onEdit={openEditModal}
          onDelete={deleteTask}
          color="blue"
        />

        {/* COMPLETED COLUMN */}
        <TaskColumn
          title="Completed"
          icon={<CheckCircle2 size={20} />}
          count={completedTasks.length}
          tasks={completedTasks}
          onStatusChange={changeStatus}
          onEdit={openEditModal}
          onDelete={deleteTask}
          color="green"
        />
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {(showCreateModal || editingTask) && (
          <TaskModal
            isEdit={!!editingTask}
            formData={formData}
            setFormData={setFormData}
            onSave={editingTask ? saveEdit : createTask}
            onClose={() => {
              setShowCreateModal(false)
              setEditingTask(null)
              setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                notes: '',
              })
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// TASK COLUMN COMPONENT
// ============================================

interface TaskColumnProps {
  title: string
  icon: React.ReactNode
  count: number
  tasks: PersonalTask[]
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onEdit: (task: PersonalTask) => void
  onDelete: (taskId: string) => void
  color: 'gray' | 'blue' | 'green'
}

function TaskColumn({
  title,
  icon,
  count,
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  color,
}: TaskColumnProps) {
  const colorClasses = {
    gray: 'border-gray-500/30 bg-gray-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-green-500/30 bg-green-500/5',
  }

  return (
    <div className="space-y-3">
      {/* COLUMN HEADER */}
      <div
        className={`
        flex items-center justify-between p-4 rounded-xl border
        ${colorClasses[color]}
      `}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold">{title}</h2>
        </div>
        <span className="text-sm font-bold bg-background/50 px-2 py-1 rounded-md">
          {count}
        </span>
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          No tasks
        </p>
      )}
    </div>
  )
}

// ============================================
// TASK CARD COMPONENT
// ============================================

interface TaskCardProps {
  task: PersonalTask
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onEdit: (task: PersonalTask) => void
  onDelete: (taskId: string) => void
}

function TaskCard({ task, onStatusChange, onEdit, onDelete }: TaskCardProps) {
  const priorityColors = {
    low: 'text-gray-500 bg-gray-500/10',
    medium: 'text-blue-500 bg-blue-500/10',
    high: 'text-orange-500 bg-orange-500/10',
    urgent: 'text-red-500 bg-red-500/10',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="
        p-4 rounded-xl border border-border/50 bg-card/50
        shadow-sm hover:shadow-md transition cursor-pointer group
      "
    >
      {/* TASK HEADER */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="font-semibold text-sm flex-1 cursor-pointer hover:text-primary"
          onClick={() => onEdit(task)}
        >
          {task.title}
        </h3>
        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 transition text-destructive hover:scale-110"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* DESCRIPTION */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* METADATA */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Priority */}
        <span
          className={`text-xs px-2 py-1 rounded-md font-medium ${
            priorityColors[task.priority]
          }`}
        >
          <Flag size={10} className="inline mr-1" />
          {task.priority}
        </span>

        {/* Due Date */}
        {task.dueDate && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}

        {/* Assigned Badge */}
        {task.isAssigned && (
          <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-md flex items-center gap-1">
            <UserIcon size={10} />
            Assigned
          </span>
        )}

        {/* Notes Indicator */}
        {task.notes && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <StickyNote size={12} />
            Notes
          </span>
        )}
      </div>

      {/* STATUS ACTIONS */}
      <div className="flex gap-2 pt-2 border-t border-border/30">
        {task.status !== 'todo' && (
          <button
            onClick={() => onStatusChange(task._id, 'todo')}
            className="flex-1 text-xs py-1.5 rounded-md border border-border hover:bg-accent transition"
          >
            To-Do
          </button>
        )}
        {task.status !== 'in-progress' && (
          <button
            onClick={() => onStatusChange(task._id, 'in-progress')}
            className="flex-1 text-xs py-1.5 rounded-md border border-border hover:bg-accent transition"
          >
            In Progress
          </button>
        )}
        {task.status !== 'completed' && (
          <button
            onClick={() => onStatusChange(task._id, 'completed')}
            className="flex-1 text-xs py-1.5 rounded-md border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition"
          >
            Complete
          </button>
        )}
      </div>
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl"
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            {isEdit ? 'Edit Task' : 'Create New Task'}
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
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={inputClass}
              placeholder="Add task description (optional)"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className={inputClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">
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

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold mb-2 block flex items-center gap-2">
              <StickyNote size={14} />
              Personal Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className={inputClass}
              placeholder="Add personal notes (only visible to you)"
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
