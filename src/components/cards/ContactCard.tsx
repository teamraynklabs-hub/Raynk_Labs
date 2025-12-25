'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FormModal from '@/components/cards/FormModal'
import { CheckCircle } from 'lucide-react'

/* =========================
   EMAIL VALIDATION
========================= */
const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const blockedDomains = [
  'tempmail',
  'mailinator',
  '10minutemail',
  'guerrillamail',
  'yopmail',
  'fakeinbox',
  'discard',
  'trashmail',
]

function isValidEmail(email: string) {
  if (!emailRegex.test(email)) return false

  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false

  return !blockedDomains.some(d => domain.includes(d))
}

export default function ContactCard() {
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleSubmit = async (formData: Record<string, any>) => {
    setError('')

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid and real email address')
      return false
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          origin_title: 'Contact Form',
          ...formData,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
        return true
      }

      setError(data.message || 'Submission failed')
      return false
    } catch {
      setError('Network error. Please try again.')
      return false
    }
  }

  return (
    <section
      id="contact"
      className="relative bg-background py-28 transition-colors"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* ================= HEADER ================= */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="
            mb-4 text-center text-4xl font-extrabold
            bg-gradient-to-r from-primary to-[var(--electric-purple)]
            bg-clip-text text-transparent
          "
        >
          Get In Touch
        </motion.h2>

        <p className="mx-auto mb-20 max-w-2xl text-center text-lg text-muted-foreground">
          Have an idea, question, or want to collaborate with us?
        </p>

        <div className="grid gap-16 md:grid-cols-2">
          {/* ================= CONTACT FORM ================= */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="
              rounded-3xl border border-border
              bg-card/70 p-8 backdrop-blur
              shadow-lg transition hover:shadow-2xl
            "
          >
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="
                  mb-6 rounded-xl
                  bg-red-500/10 px-4 py-3
                  text-sm text-red-400
                "
              >
                {error}
              </motion.p>
            )}

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)

                handleSubmit({
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  message: formData.get('message'),
                })

                e.currentTarget.reset()
              }}
            >
              {[
                { name: 'name', type: 'text', placeholder: 'Your Name' },
                { name: 'email', type: 'email', placeholder: 'Your Email' },
                { name: 'phone', type: 'tel', placeholder: 'Your Phone' },
              ].map(field => (
                <input
                  key={field.name}
                  name={field.name}
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  className="
                    w-full rounded-xl border border-input
                    bg-background px-5 py-4 text-sm
                    placeholder:text-muted-foreground
                    transition focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
                  "
                />
              ))}

              <textarea
                name="message"
                rows={5}
                required
                placeholder="Your Message"
                className="
                  w-full resize-none rounded-xl border border-input
                  bg-background px-5 py-4 text-sm
                  placeholder:text-muted-foreground
                  transition focus:border-primary
                  focus:ring-2 focus:ring-primary/30 outline-none
                "
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="
                  w-full rounded-full
                  bg-gradient-to-r from-primary to-[var(--electric-purple)]
                  py-4 font-semibold text-primary-foreground
                  transition hover:shadow-xl
                "
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>

          {/* ================= JOIN OPTIONS ================= */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <h3 className="
              text-2xl font-extrabold
              bg-gradient-to-r from-primary to-accent
              bg-clip-text text-transparent
            ">
              Join RaYnk Labs
            </h3>

            <div className="flex flex-col gap-4">
              {['Student', 'Mentor', 'Team'].map(role => (
                <FormModal
                  key={role}
                  type="community"
                  originTitle={`Join as ${role}`}
                  buttonText={`Join as ${role}`}
                  buttonClass="
                    w-full rounded-xl border border-primary/50
                    px-6 py-4 font-semibold text-primary
                    transition hover:bg-primary/10
                  "
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* ================= SUCCESS MESSAGE ================= */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="
                fixed top-24 left-1/2 z-50
                flex -translate-x-1/2 items-center gap-3
                rounded-xl border border-green-500/50
                bg-green-500/20 px-6 py-3
                text-green-400 backdrop-blur
              "
            >
              <CheckCircle size={20} />
              Message sent successfully!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
