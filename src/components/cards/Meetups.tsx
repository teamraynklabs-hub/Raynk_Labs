'use client'

import { useEffect, useState } from 'react'
import FormModal from '@/components/cards/FormModal'
import {
  CalendarDays,
  Presentation,
  Podcast,
  Loader2,
} from 'lucide-react'

const ICON_MAP: any = {
  meetup: CalendarDays,
  masterclass: Presentation,
  podcast: Podcast,
}

export default function Meetups() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/meetups', { cache: 'no-store' })
      setData(await res.json())
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <>
      <section id="meetups" className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-14 text-center text-3xl font-bold">
            Meetups & Podcasts
          </h2>

          {loading && (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" size={32} />
            </div>
          )}

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.map(item => {
              const Icon = ICON_MAP[item.type]

              return (
                <div
                  key={item._id}
                  className="group relative rounded-2xl border bg-card p-8 text-center transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                    Free
                  </span>

                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-primary group-hover:scale-110 transition">
                    <Icon size={40} />
                  </div>

                  <h3 className="mb-2 text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mb-3 text-sm font-medium text-primary">
                    {item.date}
                  </p>

                  <p className="mb-6 text-sm text-muted-foreground">
                    {item.description}
                  </p>

                  <button
                    onClick={() => setSelected(item.title)}
                    className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:opacity-90 transition"
                  >
                    {item.cta}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {selected && (
        <FormModal
          type="meetup"
          title={selected}
          isOpen={true}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
