'use client'

import { useEffect, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import FormModal from '@/components/cards/FormModal'
import {
  FileText,
  Globe,
  Palette,
  Bot,
  Code2,
  Compass,
  Share2,
  Handshake,
  Loader2,
  ImageIcon,
  LucideIcon,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Icon map
───────────────────────────────────────────── */
const ICON_MAP: Record<string, LucideIcon> = {
  resume:      FileText,
  portfolio:   Globe,
  branding:    Palette,
  ai:          Bot,
  development: Code2,
  career:      Compass,
  social:      Share2,
  freelance:   Handshake,
  default:     FileText,
}

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Service = {
  _id: string
  title: string
  description: string
  icon?: string
  image?: { url: string; publicId: string }
}

/* ─────────────────────────────────────────────
   Animation variants
───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function ServicesCard() {
  const [services, setServices]               = useState<Service[]>([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  useEffect(() => {
    fetch('/api/services', { cache: 'no-store' })
      .then(res => { if (!res.ok) throw new Error(); return res.json() })
      .then(setServices)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section id="services" className="relative bg-background section-padding overflow-hidden">

        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-electric-purple/8 blur-[100px]" />
        </div>

        <div className="relative z-10 section-container">

          {/* ══════════════════════════════════════
              SECTION LABEL
          ══════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              What We Offer
            </span>
          </motion.div>

          {/* ══════════════════════════════════════
              HEADING
          ══════════════════════════════════════ */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-4 text-center bg-linear-to-r from-primary to-electric-purple bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
          >
            Our Services
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mb-14 text-center text-base text-muted-foreground max-w-xl mx-auto"
          >
            Professional solutions crafted for real-world impact
          </motion.p>

          {/* ══════════════════════════════════════
              LOADING
          ══════════════════════════════════════ */}
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={36} />
            </div>
          )}

          {/* ══════════════════════════════════════
              ERROR
          ══════════════════════════════════════ */}
          {error && (
            <p className="py-16 text-center text-sm text-destructive">
              Failed to load services. Please try again later.
            </p>
          )}

          {/* ══════════════════════════════════════
              CARDS GRID
          ══════════════════════════════════════ */}
          {!loading && !error && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {services.map(service => {
                const Icon = ICON_MAP[service.icon || ''] ?? ICON_MAP.default

                return (
                  <motion.div
                    key={service._id}
                    variants={cardVariants}
                    className="
                      group relative flex flex-col overflow-hidden
                      rounded-2xl border border-border/50 bg-card
                      shadow-soft transition-luxury
                      hover:-translate-y-2 hover:border-primary/40 hover:shadow-luxury
                    "
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-linear-to-r from-primary to-electric-purple transition-transform duration-300 group-hover:scale-x-100" />

                    {/* ── IMAGE / ICON AREA ── */}
                    <div className="relative h-48 w-full overflow-hidden bg-muted/40">
                      {service.image?.url ? (
                        <img
                          src={service.image.url}
                          alt={service.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-luxury group-hover:scale-110 group-hover:bg-primary/15">
                            <Icon size={36} />
                          </div>
                        </div>
                      )}

                      {/* Gradient overlay — fades image into card */}
                      <div className="absolute inset-0 bg-linear-to-t from-card/70 to-transparent" />
                    </div>

                    {/* ── CONTENT ── */}
                    <div className="flex flex-1 flex-col p-6">
                      <h3
                        className="mb-2 text-lg font-semibold text-foreground"
                        style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
                      >
                        {service.title}
                      </h3>

                      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>

                      <button
                        onClick={() => setSelectedService(service)}
                        className="
                          w-full rounded-full cursor-pointer
                          bg-linear-to-r from-primary to-electric-purple
                          py-2.5 text-sm font-semibold text-primary-foreground
                          transition-luxury hover-lift hover:shadow-luxury
                        "
                      >
                        Get Service
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          ENQUIRY MODAL
      ══════════════════════════════════════ */}
      {selectedService && (
        <FormModal
          type="service"
          title={selectedService.title}
          isOpen={true}
          onClose={() => setSelectedService(null)}
        />
      )}
    </>
  )
}
