'use client'

import { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import {
  Lightbulb,
  GraduationCap,
  Users,
  Rocket,
  Code,
  Briefcase,
  Star,
  Zap,
  Heart,
  Globe,
  Award,
  Target,
  LucideIcon,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Icon map (frontend only — no model change)
───────────────────────────────────────────── */
const ICON_MAP: Record<string, LucideIcon> = {
  innovation:   Lightbulb,
  learning:     GraduationCap,
  community:    Users,
  opportunities: Rocket,
  code:         Code,
  briefcase:    Briefcase,
  star:         Star,
  zap:          Zap,
  heart:        Heart,
  globe:        Globe,
  award:        Award,
  target:       Target,
}

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function AboutPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/about', { cache: 'no-store' })
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-background section-padding"
    >
      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/4 h-80 w-80 rounded-full bg-electric-purple/10 blur-[120px]" />
      </div>

      <div className="relative z-10 section-container">

        {/* ══════════════════════════════════════
            SECTION LABEL
        ══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Who We Are
          </span>
        </motion.div>

        {/* ══════════════════════════════════════
            HEADING
        ══════════════════════════════════════ */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="
            mb-5 text-center
            bg-linear-to-r from-primary to-electric-purple
            bg-clip-text text-transparent
          "
          style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
        >
          {data.heading}
        </motion.h2>

        {/* ══════════════════════════════════════
            DESCRIPTION
        ══════════════════════════════════════ */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mb-14 max-w-3xl text-center text-base text-muted-foreground md:text-lg"
        >
          {data.description}
        </motion.p>

        {/* ══════════════════════════════════════
            CARDS
        ══════════════════════════════════════ */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {data.cards.map((c: any, i: number) => {
            const Icon = ICON_MAP[c.icon] ?? Lightbulb

            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="
                  group relative overflow-hidden
                  rounded-2xl border border-border/50 bg-card
                  p-8 text-center
                  transition-luxury shadow-soft
                  hover:-translate-y-2 hover:border-primary/40 hover:shadow-luxury
                "
              >
                {/* Top accent bar */}
                <div
                  className="
                    absolute top-0 left-0 h-0.5 w-full
                    origin-left scale-x-0
                    bg-linear-to-r from-primary to-electric-purple
                    transition-transform duration-300
                    group-hover:scale-x-100
                  "
                />

                {/* Icon */}
                <div
                  className="
                    mx-auto mb-6 flex h-18 w-18 items-center justify-center
                    rounded-2xl bg-primary/10 text-primary
                    transition-luxury
                    group-hover:scale-110 group-hover:bg-primary/15
                  "
                  style={{ width: '4.5rem', height: '4.5rem' }}
                >
                  <Icon size={32} />
                </div>

                {/* Title */}
                <h3
                  className="mb-3 text-lg font-semibold text-foreground"
                  style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
                >
                  {c.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {c.description}
                </p>

                {/* Bottom glow overlay on hover */}
                <div className="
                  pointer-events-none absolute inset-0 rounded-2xl
                  opacity-0 transition-opacity duration-300
                  group-hover:opacity-100
                  bg-linear-to-b from-transparent to-primary/4
                " />
              </motion.div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}
