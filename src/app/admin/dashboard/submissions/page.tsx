'use client'

import { useEffect, useState } from 'react'

type Submission = {
  _id: string
  type: string
  originTitle?: string
  name: string
  email: string
  phone?: string
  isRead: boolean
  createdAt: string
}

export default function SubmissionsPage() {
  const [data, setData] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  /* filters */
  const [type, setType] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  /* ================= FETCH ================= */
  async function fetchData() {
    setLoading(true)

    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (from) params.append('from', from)
    if (to) params.append('to', to)

    const res = await fetch('/api/admin/submissions?' + params.toString())
    const json = await res.json()

    setData(json)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  /* ================= ACTIONS ================= */
  async function markRead(id: string) {
    await fetch(`/api/admin/submissions/${id}`, { method: 'PATCH' })
    fetchData()
  }

  async function remove(id: string) {
    if (!confirm('Delete this submission?')) return
    await fetch(`/api/admin/submissions/${id}`, { method: 'DELETE' })
    fetchData()
  }

  function exportCSV() {
    if (!data.length) return

    const header = [
      'Type',
      'Title',
      'Name',
      'Email',
      'Phone',
      'Read',
      'Time',
    ]

    const rows = data.map(d => [
      d.type,
      d.originTitle || '',
      d.name,
      d.email,
      d.phone || '',
      d.isRead ? 'Yes' : 'No',
      new Date(d.createdAt).toLocaleString(),
    ])

    const csv =
      [header, ...rows].map(r => r.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'submissions.csv'
    a.click()
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        <p className="text-muted-foreground text-sm">
          All user enquiries and requests
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3">
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="service">Service</option>
          <option value="course">Course</option>
          <option value="contact">Contact</option>
          <option value="community">Community</option>
          <option value="meetup">Meetup</option>
        </select>

        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />

        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />

        <button
          onClick={fetchData}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Apply
        </button>

        <button
          onClick={exportCSV}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded-xl border">
        {loading ? (
          <p className="p-6 text-center">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">
            No submissions found
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map(item => (
                <tr
                  key={item._id}
                  className={`border-t ${
                    !item.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="p-3 capitalize">{item.type}</td>
                  <td className="p-3">{item.originTitle || '-'}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.email}</td>
                  <td className="p-3">{item.phone || '-'}</td>
                  <td className="p-3">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {item.isRead ? 'Read' : 'Unread'}
                  </td>
                  <td className="p-3 space-x-2">
                    {!item.isRead && (
                      <button
                        onClick={() => markRead(item._id)}
                        className="text-xs underline"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => remove(item._id)}
                      className="text-xs text-destructive underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
