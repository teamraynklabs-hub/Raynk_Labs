'use client'

import { useEffect, useState } from 'react'
import {
  Lightbulb,
  GraduationCap,
  Users,
  Rocket,
} from 'lucide-react'
import { motion } from 'framer-motion'

const ICON_MAP: any = {
  innovation: Lightbulb,
  learning: GraduationCap,
  community: Users,
  opportunities: Rocket,
}

/* ================= ANIMATION VARIANTS ================= */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export default function AboutPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/about', { cache: 'no-store' })
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <section className="relative overflow-hidden bg-background py-28">
      {/* Decorative background glow */}
      {/* <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full" />
      </div> */}

      <div className="relative mx-auto max-w-6xl px-4">
        {/* ================= HEADING ================= */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="
            mb-6 text-center text-4xl font-extrabold
            bg-gradient-to-r from-primary to-[var(--electric-purple)]
            bg-clip-text text-transparent
          "
        >
          {data.heading}
        </motion.h2>

        {/* ================= DESCRIPTION ================= */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mx-auto mb-20 max-w-3xl text-center text-lg text-muted-foreground"
        >
          {data.description}
        </motion.p>

        {/* ================= CARDS ================= */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {data.cards.map((c: any, i: number) => {
            const Icon = ICON_MAP[c.icon]

            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="
                  group relative overflow-hidden
                  rounded-3xl border border-border
                  bg-card p-8 text-center
                  transition-all duration-300
                  hover:-translate-y-3 hover:border-primary/50 hover:shadow-2xl
                "
              >
                {/* Top accent line */}
                <div
                  className="
                    absolute top-0 left-0 h-1 w-full
                    origin-left scale-x-0
                    bg-gradient-to-r from-primary to-[var(--electric-purple)]
                    transition-transform duration-300
                    group-hover:scale-x-100
                  "
                />

                {/* ICON */}
                <div
                  className="
                    mx-auto mb-6 flex h-20 w-20 items-center justify-center
                    rounded-full bg-primary/15 text-primary
                    transition-all duration-300
                    group-hover:scale-110 group-hover:rotate-3
                  "
                >
                  <Icon size={36} />
                </div>

                {/* TITLE */}
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {c.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>

                {/* Glow overlay */}
                <div
                  className="
                    pointer-events-none absolute inset-0 rounded-3xl
                    opacity-0 transition-opacity duration-300
                    group-hover:opacity-100
                  "
                  style={{
                    boxShadow:
                      'inset 0 0 0 1px oklch(1 0 0 / 6%), 0 0 80px oklch(0.62 0.22 259 / 0.15)',
                  }}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
