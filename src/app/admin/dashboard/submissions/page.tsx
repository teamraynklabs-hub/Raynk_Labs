'use client'

import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Mail,
  Phone,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from 'lucide-react'

type Submission = {
  _id: string
  type: string
  originTitle?: string
  name: string
  email: string
  phone?: string
  message?: string
  isRead: boolean
  createdAt: string
}

export default function SubmissionsPage() {
  const [data, setData] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  const [type, setType] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  async function fetchData() {
    setLoading(true)

    const params = new URLSearchParams()
    if (type) params.append('type', type)
    if (from) params.append('from', from)
    if (to) params.append('to', to)

    const res = await fetch('/api/submissions?' + params)
    const json = await res.json()

    setData(json.data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function toggleRead(id: string, value: boolean) {
    await fetch('/api/submissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isRead: value }),
    })
    fetchData()
  }

  async function remove(id: string) {
    if (!confirm('Delete this submission?')) return
    await fetch('/api/submissions?id=' + id, { method: 'DELETE' })
    fetchData()
  }

  function exportExcel() {
    const rows = data.map(d => ({
      Type: d.type,
      Purpose: d.originTitle || '',
      Name: d.name,
      Email: d.email,
      Phone: d.phone || '',
      Message: d.message || '',
      Status: d.isRead ? 'Read' : 'Unread',
      Time: new Date(d.createdAt).toLocaleString(),
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions')
    XLSX.writeFile(wb, 'submissions.xlsx')
  }

  const unread = data.filter(d => !d.isRead)
  const read = data.filter(d => d.isRead)

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Form Submissions</h1>
        <p className="text-sm text-muted-foreground">
          All user enquiries and requests
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Filter size={16} /> Filters
        </div>

        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="service">Service</option>
          <option value="course">Course</option>
          <option value="contact">Contact</option>
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
          className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground cursor-pointer"
        >
          Apply
        </button>

        <button
          onClick={exportExcel}
          className="rounded-lg border px-4 py-2 text-sm cursor-pointer flex items-center gap-2"
        >
          <Download size={14} /> Export Excel
        </button>
      </div>

      {/* UNREAD */}
      <Section
        title="New / Unread"
        icon={<Clock size={18} />}
        data={unread}
        toggleRead={toggleRead}
        remove={remove}
        loading={loading}
      />

      {/* READ */}
      <Section
        title="Seen"
        icon={<CheckCircle size={18} />}
        data={read}
        toggleRead={toggleRead}
        remove={remove}
        loading={loading}
      />
    </div>
  )
}

/* ================= TABLE SECTION ================= */
function Section({
  title,
  icon,
  data,
  toggleRead,
  remove,
  loading,
}: any) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 font-semibold">
        {icon} {title}
      </h2>

      <div className="rounded-xl border overflow-x-auto">
        {loading ? (
          <p className="p-6 text-center">Loading...</p>
        ) : (
          <table className="min-w-[1400px] w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3">Read</th>
                <th className="p-3">Type</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Message</th>
                <th className="p-3">Time</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((d: Submission) => (
                <tr
                  key={d._id}
                  className="border-t hover:bg-muted/50 transition"
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={d.isRead}
                      onChange={() => toggleRead(d._id, !d.isRead)}
                      className="cursor-pointer"
                    />
                  </td>

                  <td className="p-3 capitalize">{d.type}</td>
                  <td className="p-3">{d.originTitle || '-'}</td>
                  <td className="p-3 font-medium">{d.name}</td>

                  <td className="p-3">
                    <a
                      href={`mailto:${d.email}`}
                      className="flex items-center gap-2 text-primary cursor-pointer"
                    >
                      <Mail size={14} /> {d.email}
                    </a>
                  </td>

                  <td className="p-3">
                    {d.phone ? (
                      <a
                        href={`tel:${d.phone}`}
                        className="flex items-center gap-2 text-primary cursor-pointer"
                      >
                        <Phone size={14} /> {d.phone}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>

                  <td className="p-3 max-w-[300px] break-words">
                    {d.message || '-'}
                  </td>

                  <td className="p-3">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => remove(d._id)}
                      className="text-destructive underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!data.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-muted-foreground"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
