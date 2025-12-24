'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FileText, ArrowRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Software {
  _id: string
  name: string
  description: string
  downloadUrl?: string
  image?: {
    url?: string
  }
}

/* ================= URL NORMALIZER ================= */
function normalizeUrl(url?: string) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

export default function SoftwareCard() {
  const [data, setData] = useState<Software[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSoftwares() {
      try {
        const res = await fetch('/api/softwares', { cache: 'no-store' })
        const json = await res.json()
        setData(json)
      } finally {
        setLoading(false)
      }
    }
    fetchSoftwares()
  }, [])

  return (
    <section id="ai-tools" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-4">
        {/* HEADER */}
        <h2 className="mb-3 text-center text-3xl font-bold text-foreground">
          AI-Powered Tools
        </h2>
        <p className="mb-16 text-center text-muted-foreground">
          Smart tools to boost your productivity
        </p>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {/* GRID */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((tool, index) => {
            const imageUrl =
              tool.image?.url && tool.image.url.trim()
                ? tool.image.url
                : null

            const finalUrl = normalizeUrl(tool.downloadUrl)

            return (
              <motion.div
                key={tool._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="
                  group relative overflow-hidden
                  rounded-2xl border border-border bg-card p-8 text-center
                  transition-all
                  hover:-translate-y-2
                  hover:border-primary/50
                  hover:shadow-2xl
                "
              >
                {/* TOP GRADIENT LINE */}
                <div
                  className="
                    absolute top-0 left-0 h-1 w-full
                    origin-left scale-x-0
                    bg-gradient-to-r from-primary to-accent
                    transition-transform duration-300
                    group-hover:scale-x-100
                  "
                />

                {/* IMAGE / ICON */}
                <div
                  className="
                    relative mx-auto mb-6
                    flex h-20 w-20 items-center justify-center
                    overflow-hidden rounded-full
                    bg-primary/15 text-primary
                    transition group-hover:scale-110
                  "
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={tool.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-125"
                    />
                  ) : (
                    <FileText size={36} />
                  )}
                </div>

                {/* TITLE */}
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                  {tool.name}
                </h3>

                {/* DESCRIPTION */}
                <p className="mb-6 text-sm text-muted-foreground">
                  {tool.description}
                </p>

                {/* CTA BUTTON – SAME AS PREVIOUS CARDS */}
                <Link
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex w-full items-center justify-center gap-2
                    rounded-full
                    bg-gradient-to-r from-primary to-accent
                    py-3 font-semibold
                    text-primary-foreground
                    transition
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >
                  Try Tool
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
