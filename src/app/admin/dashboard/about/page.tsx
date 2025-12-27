'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'

interface AboutCard {
  title: string
  description: string
  icon: string
}

export default function AdminAboutPage() {
  const [data, setData] = useState<any>({
    _id: '',
    heading: '',
    description: '',
    cards: [] as AboutCard[],
  })

  const [loading, setLoading] = useState(false)

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch('/api/about')
      .then(res => res.json())
      .then(d => d && setData(d))
  }, [])

  /* ================= SAVE ================= */
  async function save() {
    setLoading(true)
    try {
      await fetch('/api/about', {
        method: data._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          data._id ? { id: data._id, ...data } : data
        ),
      })
      alert('About section saved successfully')
    } catch {
      alert('Failed to save section')
    } finally {
      setLoading(false)
    }
  }

  /* ================= CARD ACTIONS ================= */
  const addCard = () => {
    setData({
      ...data,
      cards: [
        ...data.cards,
        { title: '', description: '', icon: '' },
      ],
    })
  }

  const updateCard = (
    index: number,
    field: keyof AboutCard,
    value: string
  ) => {
    const updated = [...data.cards]
    updated[index][field] = value
    setData({ ...data, cards: updated })
  }

  const deleteCard = (index: number) => {
    setData({
      ...data,
      cards: data.cards.filter(
        (_: any, i: number) => i !== index
      ),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-12"
    >
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          About Section
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage heading, description and feature cards
        </p>
      </div>

      {/* ================= BASIC CONTENT ================= */}
      <div className="rounded-3xl border bg-card p-8 space-y-6">
        <div>
          <label className="text-sm font-semibold">
            Heading
          </label>
          <input
            value={data.heading}
            onChange={e =>
              setData({ ...data, heading: e.target.value })
            }
            placeholder="Enter about heading"
            className="
              mt-2 w-full rounded-xl border bg-background
              px-4 py-3 text-sm
              transition
              placeholder:text-muted-foreground
              focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
            "
          />
        </div>

        <div>
          <label className="text-sm font-semibold">
            Description
          </label>
          <textarea
            value={data.description}
            onChange={e =>
              setData({ ...data, description: e.target.value })
            }
            rows={4}
            placeholder="Short about description"
            className="
              mt-2 w-full rounded-xl border bg-background
              px-4 py-3 text-sm
              transition
              placeholder:text-muted-foreground
              focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
            "
          />
        </div>
      </div>

      {/* ================= CARDS ================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Feature Cards
          </h2>
          <button
            onClick={addCard}
            className="
              flex items-center gap-2
              rounded-full
              bg-primary px-6 py-2
              text-sm font-semibold text-primary-foreground
              transition hover:opacity-90
              cursor-pointer
            "
          >
            <Plus size={16} />
            Add Card
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {data.cards.map((card: AboutCard, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                relative rounded-2xl border bg-card
                p-6 space-y-4
                transition hover:shadow-lg
              "
            >
              <button
                onClick={() => deleteCard(index)}
                className="
                  absolute right-4 top-4
                  text-destructive
                  transition hover:scale-110
                  cursor-pointer
                "
              >
                <Trash2 size={18} />
              </button>

              <div>
                <label className="text-xs font-semibold">
                  Title
                </label>
                <input
                  value={card.title}
                  onChange={e =>
                    updateCard(index, 'title', e.target.value)
                  }
                  placeholder="Card title"
                  className="
                    mt-1 w-full rounded-xl border bg-background
                    px-4 py-2 text-sm
                    placeholder:text-muted-foreground
                    transition focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
                  "
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Description
                </label>
                <textarea
                  value={card.description}
                  onChange={e =>
                    updateCard(index, 'description', e.target.value)
                  }
                  rows={3}
                  placeholder="Card description"
                  className="
                    mt-1 w-full rounded-xl border bg-background
                    px-4 py-2 text-sm
                    placeholder:text-muted-foreground
                    transition focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
                  "
                />
              </div>

              <div>
                <label className="text-xs font-semibold">
                  Icon Key
                </label>
                <input
                  value={card.icon}
                  onChange={e =>
                    updateCard(index, 'icon', e.target.value)
                  }
                  placeholder="example: innovation, learning"
                  className="
                    mt-1 w-full rounded-xl border bg-background
                    px-4 py-2 text-sm
                    placeholder:text-muted-foreground
                    transition focus:border-primary
                    focus:ring-2 focus:ring-primary/30 outline-none
                  "
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ================= SAVE ================= */}
      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={loading}
          className="
            rounded-full
            bg-gradient-to-r from-primary to-[var(--electric-purple)]
            px-10 py-3
            font-semibold text-primary-foreground
            transition hover:shadow-xl
            disabled:opacity-60
            cursor-pointer
          "
        >
          {loading ? 'Saving…' : 'Save About Section'}
        </button>
      </div>
    </motion.div>
  )
}
