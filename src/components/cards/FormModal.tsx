'use client'

import { useState } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  required?: boolean
  placeholder?: string
}

interface FormModalProps {
  type:
  | 'service'
  | 'course'
  | 'ai_tool'
  | 'community'
  | 'meetup'
  | 'contact'
  | 'turning_point'
  originTitle?: string
  title?: string
  buttonText?: string
  buttonClass?: string
  fields?: FormField[]
  isOpen?: boolean
  onClose?: () => void
}

/* ─────────────────────────────────────────────
   Default fields per form type
───────────────────────────────────────────── */
const defaultFields: Record<string, FormField[]> = {
  service: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  course: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  ai_tool: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  community: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  meetup: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
  contact: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea', required: true },
  ],
  turning_point: [
    { name: 'name',    label: 'Name',    type: 'text',     required: true },
    { name: 'email',   label: 'Email',   type: 'email',    required: true },
    { name: 'phone',   label: 'Phone',   type: 'tel' },
    { name: 'message', label: 'Message', type: 'textarea' },
  ],
}

const inputCls = `
  w-full rounded-xl border border-border bg-muted/50
  px-4 py-3 text-sm
  transition-luxury placeholder:text-muted-foreground
  focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
`

export default function FormModal({
  type,
  originTitle,
  title,
  buttonText,
  buttonClass,
  fields,
  isOpen: externalOpen,
  onClose,
}: FormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData]         = useState<Record<string, string>>({})
  const [loading, setLoading]           = useState(false)
  const [showSuccess, setShowSuccess]   = useState(false)

  const isOpen       = externalOpen ?? internalOpen
  const displayTitle = title || originTitle || 'Form'
  const formFields   = fields || defaultFields[type]

  const close = () => {
    setFormData({})
    onClose ? onClose() : setInternalOpen(false)
  }

  /* ── Submit ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/submissions', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, originTitle: displayTitle, ...formData }),
      })
      const data = await res.json()
      if (data.success) {
        setShowSuccess(true)
        setTimeout(() => { close(); setShowSuccess(false) }, 1500)
      } else {
        alert(data.message || 'Submission failed')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Trigger button (optional) ── */}
      {buttonText && (
        <button
          onClick={() => setInternalOpen(true)}
          className={
            buttonClass ??
            'rounded-full bg-linear-to-r from-primary to-electric-purple px-6 py-3 font-semibold text-primary-foreground transition-luxury hover-lift hover:shadow-luxury'
          }
        >
          {buttonText}
        </button>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          >
            <motion.div
              key="modal-card"
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl border border-border/50 bg-card shadow-luxury overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-6 py-4 bg-muted/20">
                <h3
                  className="text-xl font-bold bg-linear-to-r from-primary to-electric-purple bg-clip-text text-transparent"
                  style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
                >
                  {displayTitle}
                </h3>
                <button
                  onClick={close}
                  className="rounded-lg p-1.5 hover:bg-muted transition-luxury cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={submit} className="space-y-4 px-6 py-6">
                {formFields.map(field => (
                  <div key={field.name}>
                    <label className="mb-1.5 block text-sm font-semibold">
                      {field.label}{' '}
                      {field.required && <span className="text-destructive">*</span>}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        rows={4}
                        className={`${inputCls} resize-none`}
                      />
                    ) : (
                      <input
                        type={field.type}
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                        className={inputCls}
                      />
                    )}
                  </div>
                ))}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    className="
                      flex-1 rounded-xl border border-border/50 bg-muted/50
                      px-4 py-2.5 text-sm font-medium
                      hover:bg-muted transition-luxury cursor-pointer active:scale-95
                    "
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      flex-1 rounded-xl bg-primary text-primary-foreground
                      px-4 py-2.5 text-sm font-semibold
                      transition-luxury hover-lift hover:shadow-luxury
                      cursor-pointer active:scale-95
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                    "
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Submitting…
                      </span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success toast ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="
              fixed top-24 left-1/2 z-[60]
              flex -translate-x-1/2 items-center gap-3
              rounded-xl border border-success/50 bg-success/15
              px-6 py-3 text-sm font-medium text-success
              backdrop-blur-sm shadow-luxury
            "
          >
            <CheckCircle size={18} />
            Message sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
