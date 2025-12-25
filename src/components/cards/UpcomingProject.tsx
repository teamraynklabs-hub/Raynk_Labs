'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  GraduationCap,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

/* ================= ICON MAP ================= */
const ICONS: Record<string, any> = {
  education: GraduationCap,
  growth: TrendingUp,
  career: Briefcase,
  default: Sparkles,
}

export default function UpcomingProject() {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/upcoming-projects', { cache: 'no-store' })
      .then(res => res.json())
      .then(setProjects)
  }, [])

  if (!projects.length) return null

  return (
    <section className="bg-background py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* ================= SECTION HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Upcoming Real-World Projects
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Carefully designed solutions focused on solving real industry
            problems, empowering students and professionals with practical
            tools and experiences.
          </p>
        </motion.div>

        {/* ================= PROJECT BLOCKS ================= */}
        <div className="space-y-36">
          {projects.map((project, index) => (
            <div
              key={project._id}
              className="grid items-center gap-20 lg:grid-cols-2"
            >
              {/* ================= LEFT CONTENT ================= */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-10"
              >
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">
                    <Sparkles size={16} />
                    Upcoming Launch
                  </span>

                  <h3 className="text-3xl font-extrabold text-foreground">
                    {project.title}
                  </h3>

                  <p className="max-w-xl text-lg text-muted-foreground">
                    {project.description}
                  </p>
                </div>

                {/* ================= FEATURES ================= */}
                <div className="grid gap-5">
                  {project.features.map((f: any, i: number) => {
                    const Icon = ICONS[f.icon] || ICONS.default
                    return (
                      <div
                        key={i}
                        className="
                          flex gap-4 rounded-2xl border border-border
                          bg-card p-6
                          transition-all
                          hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg
                        "
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Icon size={22} />
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">
                            {f.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {f.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ================= CTA ================= */}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    className="
                      inline-flex w-fit items-center gap-3
                      rounded-full
                      bg-gradient-to-r from-primary to-accent
                      px-10 py-4
                      font-semibold text-primary-foreground
                      transition
                      hover:-translate-y-1 hover:shadow-xl
                    "
                  >
                    Explore Concept
                    <ArrowRight size={18} />
                  </a>
                )}
              </motion.div>

              {/* ================= RIGHT MOCKUP ================= */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex justify-center"
              >
                <div className="relative w-[300px] sm:w-[450px] aspect-[10/18]">
                  {/* SCREEN */}
                  <div className="absolute inset-0 rounded-[32px] overflow-hidden">
                    {project.previewUrl && (
                      <iframe
                        src={project.previewUrl}
                        className="
                          h-[125%] w-[125%]
                          scale-[0.8]
                          origin-top-left
                          border-0
                        "
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
