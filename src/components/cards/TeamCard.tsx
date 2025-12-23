'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Github,
  Linkedin,
  Globe,
  User,
  Loader2,
} from 'lucide-react'

/* ================= TYPES ================= */
interface TeamMember {
  _id: string
  name: string
  role: string
  skills?: string
  image?: {
    url: string
    publicId: string
  } | null
  github?: string
  linkedin?: string
  portfolio?: string
}

/* ================= COMPONENT ================= */
export default function TeamCard() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  /* ================= FETCH TEAM ================= */
  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await fetch('/api/team', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setTeam(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchTeam()
  }, [])

  return (
    <section id="team" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* ================= HEADER ================= */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center text-3xl font-bold"
        >
          Meet Our Team
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          viewport={{ once: true }}
          className="mb-16 text-center text-muted-foreground"
        >
          Passionate people building real products
        </motion.p>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <p className="text-center text-destructive">
            Failed to load team members
          </p>
        )}

        {/* ================= CARDS ================= */}
        {!loading && !error && (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => {
              const imageUrl =
                member.image?.url?.trim() || null

              const skills = member.skills
                ? member.skills.split(',').map(s => s.trim())
                : []

              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="
                    group relative rounded-3xl border bg-card p-8 text-center
                    transition-all duration-300
                    hover:-translate-y-3 hover:shadow-2xl
                  "
                >
                  {/* ================= AVATAR ================= */}
                  <div className="relative mx-auto mb-6 h-40 w-40 overflow-hidden rounded-full border-4 border-primary/20">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={member.name}
                        fill
                        sizes="160px"
                        className="
                          object-cover transition-transform duration-500
                          group-hover:scale-110
                        "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User size={48} />
                      </div>
                    )}

                    {/* Glow ring */}
                    <div
                      className="
                        pointer-events-none absolute inset-0 rounded-full
                        opacity-0 transition duration-500
                        group-hover:opacity-100
                      "
                      style={{
                        boxShadow:
                          '0 0 40px oklch(0.62 0.22 259 / 0.35)',
                      }}
                    />
                  </div>

                  {/* ================= INFO ================= */}
                  <h3 className="text-xl font-bold">
                    {member.name}
                  </h3>

                  <p className="mb-4 text-sm text-muted-foreground">
                    {member.role}
                  </p>

                  {/* ================= SKILLS ================= */}
                  {skills.length > 0 && (
                    <div className="mb-6 flex flex-wrap justify-center gap-2">
                      {skills.map(skill => (
                        <span
                          key={skill}
                          className="
                            rounded-full border border-primary/30
                            bg-primary/10 px-4 py-1 text-xs font-medium
                            text-primary
                          "
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ================= SOCIAL ================= */}
                  <div className="flex justify-center gap-4 border-t border-border pt-5">
                    {member.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        className="
                          rounded-full border border-primary/30
                          bg-primary/10 p-3 text-primary
                          transition hover:scale-110 hover:bg-primary
                          hover:text-primary-foreground
                        "
                      >
                        <Github size={18} />
                      </a>
                    )}

                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        className="
                          rounded-full border border-primary/30
                          bg-primary/10 p-3 text-primary
                          transition hover:scale-110 hover:bg-primary
                          hover:text-primary-foreground
                        "
                      >
                        <Linkedin size={18} />
                      </a>
                    )}

                    {member.portfolio && (
                      <a
                        href={member.portfolio}
                        target="_blank"
                        className="
                          rounded-full border border-primary/30
                          bg-primary/10 p-3 text-primary
                          transition hover:scale-110 hover:bg-primary
                          hover:text-primary-foreground
                        "
                      >
                        <Globe size={18} />
                      </a>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
