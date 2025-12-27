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
  Image as ImageIcon,
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
  image?: {
    url: string
    publicId: string
  }
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
          <h2 className="mb-3 text-center text-3xl font-bold">
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
                      rounded-2xl border border-border bg-card
                      transition-all hover:-translate-y-2 hover:shadow-2xl
                    "
                  >
                    {/* IMAGE / ICON SECTION */}
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      {service.image?.url ? (
                        <img
                          src={service.image.url}
                          alt={service.title}
                          className="
                            h-full w-full object-cover
                            transition-transform duration-500
                            group-hover:scale-110
                          "
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Icon size={40} className="text-muted-foreground" />
                        </div>
                      )}

                      {/* GRADIENT OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    {/* CONTENT */}
                    <div className="p-6 text-center">
                      <h3 className="mb-2 text-xl font-semibold">
                        {service.title}
                      </h3>

                      <p className="mb-5 text-sm text-muted-foreground">
                        {service.description}
                      </p>

                      <button
                        onClick={() => setSelectedService(service)}
                        className="
                          w-full rounded-full cursor-pointer
                          bg-gradient-to-r from-primary to-accent
                          py-3 font-semibold text-primary-foreground
                          transition hover:-translate-y-1 hover:shadow-xl
                        "
                      >
                        Get Service
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
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
