'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export default function AdminSoftwaresPage() {
  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({})

  async function fetchData() {
    const res = await fetch('/api/admin/softwares')
    setData(await res.json())
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function save() {
    const body = new FormData()
    Object.entries(form).forEach(([k, v]: any) => v && body.append(k, v))

    await fetch('/api/admin/softwares', {
      method: 'POST',
      body,
    })

    setForm({})
    setOpen(false)
    fetchData()
  }

  async function remove(id: string) {
    if (!confirm('Delete software?')) return
    await fetch('/api/admin/softwares', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
    fetchData()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Softwares</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">URL</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item._id} className="border-t">
                <td className="p-3">{item.name}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {item.downloadUrl || '-'}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => remove(item._id)}
                    className="text-destructive"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="w-full max-w-md rounded-xl bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Add Software</h2>

            <input
              placeholder="Name"
              className="w-full border rounded-lg px-3 py-2"
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border rounded-lg px-3 py-2"
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <input
              placeholder="External URL"
              className="w-full border rounded-lg px-3 py-2"
              onChange={e =>
                setForm({ ...form, downloadUrl: e.target.value })
              }
            />
            <input
              type="file"
              onChange={e =>
                setForm({ ...form, image: e.target.files?.[0] })
              }
            />

            <button
              onClick={save}
              className="w-full rounded-full bg-primary py-2 text-primary-foreground"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
