'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function Hero() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/hero', { cache: 'no-store' })
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background pt-16"
    >
      {/* ══════════════════════════════════════
          DECORATIVE BACKGROUND
      ══════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Gradient wash — soft tint fading into clean background */}
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-background to-background" />

        {/* Constellation dots */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[10%] top-[15%] h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <div className="absolute left-[70%] top-[25%] h-1   w-1   rounded-full bg-electric-purple animate-pulse" />
          <div className="absolute left-[30%] top-[60%] h-1   w-1   rounded-full bg-primary animate-pulse" />
          <div className="absolute left-[80%] top-[75%] h-1.5 w-1.5 rounded-full bg-electric-purple animate-pulse" />
        </div>

        {/* Ambient glow blobs */}
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-electric-purple/20 blur-[120px]" />
      </div>

      {/* ══════════════════════════════════════
          HERO CONTENT
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-5xl px-4 text-center"
      >
        {/* TITLE */}
        <h1
          className="mb-6 bg-linear-to-r from-primary to-electric-purple bg-clip-text text-5xl font-bold text-transparent sm:text-6xl md:text-7xl tracking-tight"
          style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
        >
          {data.title}
        </h1>

        {/* WORD TAGS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-6 flex flex-wrap justify-center gap-2.5"
        >
          {data.words.map((w: string) => (
            <span
              key={w}
              className="
                hover-lift cursor-pointer rounded-full
                border border-primary/20 bg-primary/5
                px-4 py-1.5 text-sm font-medium
                transition-luxury hover:bg-primary/10 hover:border-primary/40 hover:shadow-luxury
              "
            >
              {w}
            </span>
          ))}
        </motion.div>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          {data.tagline}
        </motion.p>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {/* Primary */}
          <Link
            href={data.primaryBtn.href}
            className="
              inline-flex items-center rounded-full
              bg-linear-to-r from-primary to-electric-purple
              px-8 py-3 text-sm font-semibold text-primary-foreground
              transition-luxury hover-lift hover:shadow-luxury
            "
          >
            {data.primaryBtn.label}
          </Link>

          {/* Secondary */}
          <Link
            href={data.secondaryBtn.href}
            className="
              inline-flex items-center rounded-full
              border border-primary/40 bg-primary/5
              px-8 py-3 text-sm font-semibold
              transition-luxury hover-lift hover:bg-primary/10 hover:border-primary hover:shadow-luxury
            "
          >
            {data.secondaryBtn.label}
          </Link>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════
          SCROLL INDICATOR
      ══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <ChevronDown className="h-7 w-7 animate-bounce text-primary/50" />
      </motion.div>
    </section>
  )
}
