'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Hero() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/hero', { cache: 'no-store' })
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return null

  return (
    <section id='hero' className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden bg-background px-4">
      {/* ================= PARTICLE / CONSTELLATION BG ================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-black/40" />

        {/* glowing dots */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute left-[10%] top-[15%] h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <div className="absolute left-[70%] top-[25%] h-1 w-1 rounded-full bg-[var(--electric-purple)] animate-pulse" />
          <div className="absolute left-[30%] top-[60%] h-1 w-1 rounded-full bg-primary animate-pulse" />
          <div className="absolute left-[80%] top-[75%] h-1.5 w-1.5 rounded-full bg-[var(--electric-purple)] animate-pulse" />
        </div>

        {/* blurred glow blobs */}
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[var(--electric-purple)]/30 blur-[120px]" />
      </div>

      {/* ================= CONTENT ================= */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-5xl text-center"
      >
        {/* TITLE */}
        <h1 className="mb-6 bg-gradient-to-r from-primary to-[var(--electric-purple)] bg-clip-text text-5xl font-extrabold text-transparent md:text-7xl">
          {data.title}
        </h1>

        {/* WORD TAGS */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {data.words.map((w: string) => (
            <span
              key={w}
              className="
                cursor-pointer rounded-xl border border-primary/20
                bg-primary/5 px-4 py-1.5 text-sm font-semibold
                transition-all duration-300
                hover:-translate-y-1 hover:bg-primary/15 hover:shadow-lg
              "
            >
              {w}
            </span>
          ))}
        </div>

        {/* TAGLINE */}
        <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground md:text-lg">
          {data.tagline}
        </p>

        {/* BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={data.primaryBtn.href}
            className="
              rounded-full
              bg-gradient-to-r from-primary to-[var(--electric-purple)]
              px-8 py-3 font-semibold text-primary-foreground
              transition-all
              hover:-translate-y-1 hover:shadow-xl
            "
          >
            {data.primaryBtn.label}
          </Link>

          <Link
            href={data.secondaryBtn.href}
            className="
              rounded-full border border-primary
              px-8 py-3 font-semibold
              transition-all
              hover:-translate-y-1 hover:bg-primary/10 hover:shadow-lg
            "
          >
            {data.secondaryBtn.label}
          </Link>
        </div>
      </motion.div>

      {/* ================= SCROLL INDICATOR ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex h-12 w-7 justify-center rounded-full border-2 border-primary">
          <span className="mt-2 h-2 w-1 animate-bounce rounded-full bg-primary" />
        </div>
      </motion.div>
    </section>
  )
}
