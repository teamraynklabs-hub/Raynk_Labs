'use client'

import { useEffect, useState } from 'react'
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
} from 'lucide-react'

/* ================= ICON MAP ================= */
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

/* ================= TYPES ================= */
type Service = {
  _id: string
  title: string
  description: string
  icon?: string
}

export default function ServicesCard() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [selectedService, setSelectedService] =
    useState<Service | null>(null)

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
    <>
      <section id="services" className="bg-background py-24">
        <div className="mx-auto max-w-6xl px-4">
          {/* HEADER */}
          <h2 className="mb-3 text-center text-3xl font-bold text-foreground">
            Our Services
          </h2>
          <p className="mb-16 text-center text-muted-foreground">
            Professional solutions crafted for real-world impact
          </p>

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
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(service => {
                const Icon =
                  ICON_MAP[service.icon || ''] || ICON_MAP.default

                return (
                  <div
                    key={service._id}
                    className="
                      group relative overflow-hidden
                      rounded-2xl border border-border bg-card p-8 text-center
                      transition-all
                      hover:-translate-y-2
                      hover:border-primary/50
                      hover:shadow-2xl
                    "
                  >
                    {/* TOP LINE */}
                    <div
                      className="
                        absolute top-0 left-0 h-1 w-full
                        origin-left scale-x-0
                        bg-gradient-to-r from-primary to-accent
                        transition-transform duration-300
                        group-hover:scale-x-100
                      "
                    />

                    {/* ICON */}
                    <div
                      className="
                        mx-auto mb-6
                        flex h-20 w-20 items-center justify-center
                        rounded-full bg-primary/15 text-primary
                        transition group-hover:scale-110
                      "
                    >
                      <Icon size={36} />
                    </div>

                    {/* TITLE */}
                    <h3 className="mb-3 text-xl font-semibold">
                      {service.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <p className="mb-6 text-sm text-muted-foreground">
                      {service.description}
                    </p>

                    {/* CTA */}
                    <button
                      onClick={() => setSelectedService(service)}
                      className="
                        w-full rounded-full
                        bg-gradient-to-r from-primary to-accent
                        py-3 font-semibold text-primary-foreground
                        transition
                        hover:-translate-y-1
                        hover:shadow-xl
                        cursor-pointer
                      "
                    >
                      Get Service
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= MODAL ================= */}
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
