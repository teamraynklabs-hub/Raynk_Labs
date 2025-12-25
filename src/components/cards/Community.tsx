'use client'

import { useEffect, useState } from 'react'
import { Users, CheckCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import FormModal from '@/components/cards/FormModal'

export default function Community() {
  const [data, setData] = useState<any>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/community', { cache: 'no-store' })
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <>
      <section id="community" className="relative overflow-hidden py-20">

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="grid items-center gap-20 md:grid-cols-2">
            {/* ================= TEXT ================= */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <h2
                className="
                  mb-6 text-4xl font-extrabold
                  bg-gradient-to-r from-primary to-[var(--electric-purple)]
                  bg-clip-text text-transparent
                "
              >
                {data.title}
              </h2>

              <p className="mb-10 text-lg text-muted-foreground">
                {data.description}
              </p>

              <div className="mb-12 space-y-4">
                {data.points.map((p: string) => (
                  <div key={p} className="flex items-center gap-3">
                    <CheckCircle className="text-primary" size={20} />
                    <span className="text-sm">{p}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setOpen(true)}
                className="
                  inline-flex items-center justify-center
                  rounded-full bg-gradient-to-r
                  from-primary to-[var(--electric-purple)]
                  px-12 py-4 font-semibold text-primary-foreground
                  transition-all
                  hover:-translate-y-1 hover:shadow-2xl
                "
              >
                {data.ctaText}
              </button>
            </motion.div>

            {/* ================= VISUAL ================= */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex h-[380px] items-center justify-center"
            >
              {/* Outer glow ring */}
              <div className="absolute h-80 w-80 rounded-full bg-primary/10 blur-xl" />

              {/* Main Circle */}
              <div
                className="
                  relative flex h-64 w-64 items-center justify-center
                  rounded-full border border-primary/30
                  bg-card shadow-2xl
                  transition group hover:border-primary/60
                "
              >
                {/* Floating users INSIDE circle */}
                <motion.div
                  className="absolute top-10 left-1/2 -translate-x-1/2 text-primary"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <User size={20} />
                </motion.div>

                <motion.div
                  className="absolute bottom-12 left-12 text-primary"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <User size={18} />
                </motion.div>

                <motion.div
                  className="absolute bottom-14 right-14 text-primary"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <User size={18} />
                </motion.div>

                {/* Center Icon */}
                <div
                  className="
                    relative z-10 flex h-24 w-24 items-center justify-center
                    rounded-full bg-primary/15 text-primary
                    shadow-lg transition
                    group-hover:scale-110
                  "
                >
                  <Users size={44} />
                </div>

                {/* Hover glow */}
                <div
                  className="
                    pointer-events-none absolute inset-0 rounded-full
                    opacity-0 transition group-hover:opacity-100
                  "
                  style={{
                    boxShadow:
                      'inset 0 0 0 1px oklch(1 0 0 / 8%), 0 0 80px oklch(0.62 0.22 259 / 0.25)',
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= MODAL ================= */}
      {open && (
        <FormModal
          type="community"
          title={data.title}
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
