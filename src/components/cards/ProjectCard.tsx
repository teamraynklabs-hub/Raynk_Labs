'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Project {
  _id: string
  name: string
  description: string
  tech: string[]
  url?: string
  icon?: string
  status: 'Live' | 'Coming Soon'
}

export default function ProjectsCard() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    fetch('/api/projects', { cache: 'no-store' })
      .then(res => res.json())
      .then(setProjects)
  }, [])

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-3xl border bg-card p-8 hover:-translate-y-2 hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold">{project.name}</h3>

              <p className="mt-3 text-sm text-muted-foreground">
                {project.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map(t => (
                  <span
                    key={t}
                    className="rounded-full border px-3 py-1 text-xs text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                {project.status === 'Live' ? (
                  <span className="inline-flex items-center gap-2 text-primary">
                    <CheckCircle size={14} /> Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock size={14} /> Coming Soon
                  </span>
                )}
              </div>

              {project.status === 'Live' ? (
                <a
                  href={project.url}
                  target="_blank"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-primary-foreground transition hover:opacity-90"
                >
                  View Project <ArrowRight size={16} />
                </a>
              ) : (
                <div className="mt-6 w-full rounded-full border py-3 text-center text-muted-foreground">
                  Coming Soon
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
