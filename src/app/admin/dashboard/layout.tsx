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
  ArrowLeft,
} from 'lucide-react'

const menuItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Services', href: '/admin/dashboard/services', icon: Briefcase },
  { title: 'Courses', href: '/admin/dashboard/courses', icon: GraduationCap },
  { title: 'Projects', href: '/admin/dashboard/projects', icon: Layers },
  { title: 'Softwares', href: '/admin/dashboard/softwares', icon: Layers },
  { title: 'Team', href: '/admin/dashboard/team', icon: Users },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  /* Close sidebar on route change (mobile) */
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  /* Click outside to close (mobile) */
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
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft size={18} />
            Website
          </Link>

          <span className="text-sm font-semibold">Admin Panel</span>
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
                  rounded-lg px-3 py-2 text-sm font-medium
                  transition
                  ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
              >
                <Icon size={18} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 md:ml-64">
        {/* MOBILE TOPBAR */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="text-sm font-semibold">Admin Dashboard</span>
          <div className="w-6" />
        </header>

        {/* PAGE CONTENT */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
