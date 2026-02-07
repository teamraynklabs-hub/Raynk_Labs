'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import {
  Users,
  Briefcase,
  GraduationCap,
  FileText,
  Rocket,
  Shield,
  TrendingUp,
  Calendar,
  Package,
  Layers,
  UserPlus,
} from 'lucide-react'

const quickLinks = [
  { title: 'Submissions', href: '/admin/dashboard/submissions', icon: FileText, color: 'from-blue-500 to-cyan-500', superAdminOnly: false },
  { title: 'Admin Requests', href: '/admin/dashboard/admin-requests', icon: UserPlus, color: 'from-amber-500 to-yellow-500', superAdminOnly: true },
  { title: 'Admin Users', href: '/admin/dashboard/admin-users', icon: Shield, color: 'from-red-500 to-rose-500', superAdminOnly: true },
  { title: 'Services', href: '/admin/dashboard/services', icon: Briefcase, color: 'from-purple-500 to-pink-500', superAdminOnly: false },
  { title: 'Courses', href: '/admin/dashboard/courses', icon: GraduationCap, color: 'from-orange-500 to-red-500', superAdminOnly: false },
  { title: 'Projects', href: '/admin/dashboard/projects', icon: Layers, color: 'from-green-500 to-emerald-500', superAdminOnly: false },
  { title: 'Team', href: '/admin/dashboard/team', icon: Users, color: 'from-indigo-500 to-purple-500', superAdminOnly: true },
  { title: 'Softwares', href: '/admin/dashboard/softwares', icon: Package, color: 'from-yellow-500 to-orange-500', superAdminOnly: false },
  { title: 'Upcoming', href: '/admin/dashboard/upcoming-projects', icon: Rocket, color: 'from-pink-500 to-rose-500', superAdminOnly: false },
  { title: 'Meetups', href: '/admin/dashboard/meetups', icon: Calendar, color: 'from-teal-500 to-cyan-500', superAdminOnly: false },
]

export default function AdminDashboardHome() {
  const { user, isSuperAdmin } = useAdminAuth()

  const visibleLinks = quickLinks.filter(
    link => !link.superAdminOnly || isSuperAdmin
  )

  return (
    <div className="space-y-8">
      {/* WELCOME SECTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-8 shadow-xl"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 backdrop-blur-sm">
              {isSuperAdmin ? (
                <Shield className="text-yellow-500" size={24} />
              ) : (
                <Users className="text-primary" size={24} />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Welcome back!
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user?.email} • <span className="capitalize">{isSuperAdmin ? 'Super Admin' : 'Admin'}</span>
              </p>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl">
            {isSuperAdmin
              ? 'You have full system access. Manage all content, users, and settings from this control panel.'
              : 'Manage website content and view submissions from this control panel.'
            }
          </p>
        </div>

        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-0 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"
          />
        </div>
      </motion.div>

      {/* QUICK ACCESS GRID */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" size={24} />
            Quick Access
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Jump to any section of the admin panel
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  href={link.href}
                  className="group relative block overflow-hidden rounded-xl border border-border/50 bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base group-hover:text-primary transition-colors">
                        {link.title}
                      </h3>
                      {link.superAdminOnly && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Shield size={12} className="text-yellow-500" />
                          <span className="text-xs text-yellow-600 dark:text-yellow-400">
                            Super Admin
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* SYSTEM INFO */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-border/50 bg-card/50 p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="text-primary" size={20} />
          System Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">User Role</span>
            <span className="font-semibold capitalize">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">Access Level</span>
            <span className="font-semibold text-primary">
              {isSuperAdmin ? 'Full Access' : 'Content Management'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">Session Status</span>
            <span className="font-semibold text-green-500">Active</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">Email</span>
            <span className="font-semibold truncate max-w-[200px]">{user?.email}</span>
          </div>
        </div>
      </motion.div>

      {/* PERMISSIONS INFO */}
      {!isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6"
        >
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-500">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Admin Access
              </h3>
              <p className="text-sm text-muted-foreground">
                You have access to content management features. Team management and advanced settings require Super Admin access.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
