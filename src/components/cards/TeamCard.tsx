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
    <section id="team" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
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
          Meet Our Team
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          viewport={{ once: true }}
          className="mb-20 text-center text-muted-foreground text-lg"
        >
          Passionate people building real products
        </motion.p>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-primary" size={34} />
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
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => {
              const imageUrl = member.image?.url?.trim() || null
              const skills = member.skills
                ? member.skills.split(',').map(s => s.trim())
                : []

              return (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12 }}
                  viewport={{ once: true }}
                  className="
                    group relative rounded-3xl border border-border
                    bg-card/70 p-8 text-center backdrop-blur
                    transition-all duration-500
                    hover:-translate-y-4 hover:border-primary/50
                    hover:shadow-[0_25px_80px_oklch(0.62_0.22_259_/0.25)]
                  "
                >
                  {/* ================= AVATAR ================= */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="
                      relative mx-auto mb-6 h-40 w-40
                      overflow-hidden rounded-full
                      border-4 border-primary/25
                    "
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={member.name}
                        fill
                        sizes="160px"
                        className="
                          object-cover transition-transform duration-700
                          group-hover:scale-110
                        "
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <User size={52} />
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
                          '0 0 60px oklch(0.62 0.22 259 / 0.4)',
                      }}
                    />
                  </motion.div>

                  {/* ================= INFO ================= */}
                  <h3 className="text-xl font-bold">
                    {member.name}
                  </h3>

                  <p className="mb-5 text-sm text-muted-foreground">
                    {member.role}
                  </p>

                  {/* ================= SKILLS ================= */}
                  {skills.length > 0 && (
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                      {skills.map(skill => (
                        <span
                          key={skill}
                          className="
                            rounded-full border border-primary/30
                            bg-primary/10 px-4 py-1 text-xs
                            font-medium text-primary
                            transition
                            hover:bg-primary hover:text-primary-foreground
                          "
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ================= SOCIAL ================= */}
                  <div className="flex justify-center gap-5 border-t border-border pt-6">
                    {[member.github, member.linkedin, member.portfolio].map(
                      (link, i) =>
                        link && (
                          <motion.a
                            key={i}
                            href={link}
                            target="_blank"
                            whileHover={{ scale: 1.2, rotate: 6 }}
                            whileTap={{ scale: 0.95 }}
                            className="
                              rounded-full border border-primary/30
                              bg-primary/10 p-3 text-primary
                              transition hover:bg-primary
                              hover:text-primary-foreground
                            "
                          >
                            {i === 0 && <Github size={18} />}
                            {i === 1 && <Linkedin size={18} />}
                            {i === 2 && <Globe size={18} />}
                          </motion.a>
                        )
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
