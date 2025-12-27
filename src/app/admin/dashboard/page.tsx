'use client'

import { motion } from 'framer-motion'

export default function AdminDashboardHome() {
  return (
    <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden">
      {/* CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        {/* MAIN HEADING */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="
            bg-gradient-to-r from-primary to-[var(--electric-purple)]
            bg-clip-text text-transparent
            text-4xl font-extrabold tracking-tight
            sm:text-5xl md:text-6xl lg:text-7xl
          "
        >
          Welcome to RaYnk Labs
        </motion.h1>

        {/* SUB HEADING */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="
            mt-4 text-lg font-medium
            text-muted-foreground
            sm:text-xl md:text-2xl
          "
        >
          Admin Control Panel
        </motion.p>

        {/* DIVIDER */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="
            mx-auto mt-6 h-[3px] w-24
            origin-left rounded-full
            bg-gradient-to-r from-primary to-[var(--electric-purple)]
          "
        />

        {/* DESCRIPTION */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="
            mx-auto mt-8 max-w-2xl
            text-sm text-muted-foreground
            sm:text-base md:text-lg
          "
        >
          Manage website content, users, projects, services and internal data
          securely from one centralized admin workspace.
        </motion.p>
      </motion.div>

      {/* SOFT ANIMATED GLOW */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="
            absolute left-1/2 top-1/2
            h-[320px] w-[320px]
            -translate-x-1/2 -translate-y-1/2
            rounded-full
            bg-primary/20 blur-[120px]
          "
        />
      </div>
    </section>
  )
}
