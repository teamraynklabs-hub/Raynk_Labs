'use client'

import Link from 'next/link'
import {
  Briefcase,
  GraduationCap,
  Layers,
  Users,
  Settings,
} from 'lucide-react'

const dashboardCards = [
  {
    title: 'Services',
    desc: 'Manage all services shown on the website.',
    href: '/admin/dashboard/services',
    icon: Briefcase,
  },
  {
    title: 'Courses',
    desc: 'Create, update and control course listings.',
    href: '/admin/dashboard/courses',
    icon: GraduationCap,
  },
  {
    title: 'Projects',
    desc: 'Showcase and manage completed projects.',
    href: '/admin/dashboard/projects',
    icon: Layers,
  },
  {
    title: 'Softwares',
    desc: 'Manage internal & public software tools.',
    href: '/admin/dashboard/softwares',
    icon: Settings,
  },
  {
    title: 'Team',
    desc: 'Add or update team members and roles.',
    href: '/admin/dashboard/team',
    icon: Users,
  },
]

export default function AdminDashboardHome() {
  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Control all RaYnk Labs website content from one place.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dashboardCards.map((item, index) => {
          const Icon = item.icon

          return (
            <Link
              key={index}
              href={item.href}
              className="
                group relative overflow-hidden
                rounded-2xl border border-border bg-card
                p-6 transition-all duration-300
                hover:-translate-y-1 hover:shadow-xl
              "
            >
              {/* SOFT GLOW */}
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="absolute -inset-12 bg-gradient-to-r from-primary/10 to-[var(--electric-purple)]/10 blur-2xl" />
              </div>

              <div className="relative z-10">
                {/* ICON */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon size={22} />
                </div>

                {/* CONTENT */}
                <h3 className="text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  {item.desc}
                </p>

                <span className="mt-5 inline-block text-sm font-medium text-primary">
                  Manage →
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* INFO BOX */}
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        Tip: Use the sidebar to quickly switch between sections and manage content efficiently.
      </div>
    </div>
  )
}
