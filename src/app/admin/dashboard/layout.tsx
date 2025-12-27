'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Layers,
  Users,
  Settings,
  FileText,
  Rocket,
  Calendar,
  Home,
  ArrowLeft,
} from 'lucide-react'

const menuItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Submissions', href: '/admin/dashboard/submissions', icon: FileText },
  { title: 'Team', href: '/admin/dashboard/team', icon: Users },
  { title: 'Services', href: '/admin/dashboard/services', icon: Briefcase },
  { title: 'Courses', href: '/admin/dashboard/courses', icon: GraduationCap },
  { title: 'Projects', href: '/admin/dashboard/projects', icon: Layers },
  { title: 'Softwares', href: '/admin/dashboard/softwares', icon: Settings },
  { title: 'Community', href: '/admin/dashboard/community', icon: Users },
  { title: 'Upcoming Projects', href: '/admin/dashboard/upcoming-projects', icon: Rocket },
  { title: 'Meetups', href: '/admin/dashboard/meetups', icon: Calendar },
  { title: 'Hero', href: '/admin/dashboard/hero', icon: Home },
  { title: 'About', href: '/admin/dashboard/about', icon: FileText },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ================= SIDEBAR ================= */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          border-r border-border bg-card
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-80"
          >
            <ArrowLeft size={18} />
            Website
          </Link>
          <span className="text-xs font-bold tracking-wide">ADMIN</span>
        </div>

        {/* NAV */}
        <nav className="p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3
                  rounded-xl px-4 py-3 text-sm font-medium
                  transition-all
                  ${
                    active
                      ? 'bg-gradient-to-r from-primary to-[var(--electric-purple)] text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                  }
                `}
              >
                <Icon size={18} className="group-hover:scale-110 transition" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* MOBILE TOPBAR */}
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 hover:bg-muted"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <span className="text-sm font-semibold">
            RaYnk Labs Admin
          </span>

          <div className="w-6" />
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
