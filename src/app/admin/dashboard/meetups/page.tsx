'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus } from 'lucide-react'

export default function AdminMeetups() {
  const [data, setData] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [open, setOpen] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/meetups')
    setData(await res.json())
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    await fetch('/api/admin/meetups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({})
    setOpen(false)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete?')) return
    await fetch('/api/admin/meetups', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Meetups</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <table className="w-full border rounded-xl text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-3 text-left">Title</th>
            <th className="p-3">Type</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item._id} className="border-t">
              <td className="p-3">{item.title}</td>
              <td className="p-3 capitalize">{item.type}</td>
              <td className="p-3">
                <button onClick={() => remove(item._id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-card p-6 rounded-xl w-full max-w-md space-y-4">
            <input
              placeholder="Title"
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="Date"
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
            <textarea
              placeholder="Description"
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <select
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="meetup">Meetup</option>
              <option value="masterclass">Masterclass</option>
              <option value="podcast">Podcast</option>
            </select>

            <button
              onClick={save}
              className="w-full bg-primary py-2 rounded-full text-primary-foreground"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
