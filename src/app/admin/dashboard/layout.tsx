'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  LogOut,
  User,
  ChevronDown,
  Shield,
  Package,
  UserPlus,
  CheckSquare,
} from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'
import NotificationCenter from '@/components/NotificationCenter'

const menuItems = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, superAdminOnly: false },
  { title: 'Profile', href: '/admin/dashboard/profile', icon: User, superAdminOnly: false },
  { title: 'Tasks', href: '/admin/dashboard/tasks', icon: CheckSquare, superAdminOnly: false },
  { title: 'Submissions', href: '/admin/dashboard/submissions', icon: FileText, superAdminOnly: false },
  { title: 'Admin Requests', href: '/admin/dashboard/admin-requests', icon: UserPlus, superAdminOnly: true },
  { title: 'Admin Users', href: '/admin/dashboard/admin-users', icon: Shield, superAdminOnly: true },
  { title: 'Team', href: '/admin/dashboard/team', icon: Users, superAdminOnly: true },
  { title: 'Services', href: '/admin/dashboard/services', icon: Briefcase, superAdminOnly: false },
  { title: 'Courses', href: '/admin/dashboard/courses', icon: GraduationCap, superAdminOnly: false },
  { title: 'Projects', href: '/admin/dashboard/projects', icon: Layers, superAdminOnly: false },
  { title: 'Softwares', href: '/admin/dashboard/softwares', icon: Package, superAdminOnly: false },
  { title: 'Community', href: '/admin/dashboard/community', icon: Users, superAdminOnly: false },
  { title: 'Upcoming Projects', href: '/admin/dashboard/upcoming-projects', icon: Rocket, superAdminOnly: false },
  { title: 'Meetups', href: '/admin/dashboard/meetups', icon: Calendar, superAdminOnly: false },
  { title: 'Hero', href: '/admin/dashboard/hero', icon: Home, superAdminOnly: false },
  { title: 'About', href: '/admin/dashboard/about', icon: FileText, superAdminOnly: false },
]

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout, isSuperAdmin } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin')
    }
  }, [user, loading, router])

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close sidebar on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, userMenuOpen])

  const isActive = (href: string) => pathname === href

  // Filter menu items based on role
  const visibleMenuItems = menuItems.filter(
    item => !item.superAdminOnly || isSuperAdmin
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* ================= SIDEBAR ================= */}
      <aside
        ref={sidebarRef}
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          border-r border-border/50 bg-card/95 backdrop-blur-xl
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          shadow-2xl
        `}
      >
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-5 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Website</span>
          </Link>
          <span className="text-xs font-bold tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
            ADMIN
          </span>
        </div>

        {/* USER INFO */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <User size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {user.role === 'super-admin' && (
                  <Shield size={12} className="text-yellow-500" />
                )}
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {visibleMenuItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3
                  rounded-xl px-4 py-3 text-sm font-medium
                  transition-all duration-200 cursor-pointer
                  ${
                    active
                      ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30 scale-[1.02]'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:scale-[1.01]'
                  }
                `}
              >
                <Icon size={18} className={`group-hover:scale-110 transition-transform ${active ? 'animate-pulse' : ''}`} />
                <span className="flex-1">{item.title}</span>
                {item.superAdminOnly && (
                  <Shield size={14} className="text-yellow-500/70" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-border/50">
          <button
            onClick={logout}
            className="group w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer hover:scale-[1.01]"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* MOBILE TOPBAR */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-xl px-4 shadow-sm md:hidden">
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 hover:bg-muted transition-colors cursor-pointer active:scale-95"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <span className="text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            RaYnk Labs Admin
          </span>

          {/* Notification Center & Mobile user menu */}
          <div className="flex items-center gap-2">
            <NotificationCenter />

            <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors cursor-pointer"
            >
              <User size={18} className="text-primary" />
              <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-xl overflow-hidden">
                <div className="p-3 border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5">
                  <p className="text-xs font-semibold truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {user.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-border/50 py-4 px-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} RaYnk Labs. All rights reserved.</p>
        </footer>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AdminAuthProvider>
  )
}
