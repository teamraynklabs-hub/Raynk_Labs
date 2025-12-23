'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'

/* icon mapper (backend → frontend safe) */
const ICON_MAP: Record<string, any> = {
  resume: FileText,
  portfolio: Globe,
  branding: Palette,
  ai: Bot,
  development: Code2,
  career: Compass,
  social: Share2,
  freelance: Handshake,
  default: FileText,
}

type Service = {
  _id: string
  title: string
  description: string
  icon?: string
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  /* ================= FETCH SERVICES ================= */
  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await fetch('/api/services', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed')

        const data = await res.json()
        setServices(data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <h2 className="mb-16 text-center text-4xl font-extrabold text-primary">
          Our Services
        </h2>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-center text-destructive">
            Failed to load services
          </p>
        )}

        {/* GRID */}
        {!loading && !error && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map(service => {
              const Icon =
                ICON_MAP[service.icon || ''] || ICON_MAP.default

              return (
                <div
                  key={service._id}
                  onMouseEnter={() => setActive(service._id)}
                  onMouseLeave={() => setActive(null)}
                  className="
                    group relative flex flex-col items-center
                    rounded-2xl border border-border
                    bg-card px-6 py-10 text-center
                    transition-all duration-300
                    hover:-translate-y-2 hover:shadow-xl
                  "
                >
                  {/* ICON */}
                  <div
                    className="
                      mb-6 flex h-14 w-14 items-center justify-center
                      rounded-full bg-primary/10 text-primary
                      transition-all duration-300
                      group-hover:scale-110
                    "
                  >
                    <Icon size={26} />
                  </div>

                  {/* TITLE */}
                  <h3 className="mb-3 text-lg font-bold text-foreground">
                    {service.title}
                  </h3>

                  {/* DESC */}
                  <p className="mb-8 text-sm text-muted-foreground">
                    {service.description}
                  </p>

                  {/* CTA */}
                  <button
                    className="relative rounded-full px-8 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300"
                    style={{
                      background: 'var(--gradient-1)',
                      boxShadow:
                        active === service._id
                          ? '0 0 30px oklch(0.62 0.22 259 / 0.45)'
                          : 'none',
                    }}
                  >
                    Get Service
                  </button>

                  {/* HOVER GLOW */}
                  <div
                    className="
                      pointer-events-none absolute inset-0 rounded-2xl
                      opacity-0 transition-opacity duration-300
                      group-hover:opacity-100
                    "
                    style={{
                      boxShadow:
                        'inset 0 0 0 1px oklch(1 0 0 / 6%), 0 0 60px oklch(0.62 0.22 259 / 0.12)',
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
