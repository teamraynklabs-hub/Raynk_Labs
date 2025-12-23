'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Briefcase,
  GraduationCap,
  Bot,
  Users,
  Calendar,
  UserRound,
  Mail,
  Menu,
  X,
} from 'lucide-react'
import { ModeToggle } from '../theme/mode-toggle'


/* ================= SIDE DOCK (HOME SECTIONS) ================= */
const sideLinks = [
  { id: 'home', icon: Home },
  { id: 'services', icon: Briefcase },
  { id: 'courses', icon: GraduationCap },
  { id: 'ai-tools', icon: Bot },
  { id: 'community', icon: Users },
  { id: 'meetups', icon: Calendar },
  { id: 'team', icon: UserRound },
  { id: 'contact', icon: Mail },
]

/* ================= TOP NAV (PAGES) ================= */
const topLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/services', label: 'Services' },
  { href: '/softwares', label: 'Software' },
  { href: '/courses', label: 'Courses' },
  { href: '/team', label: 'Team Members' },
  { href: '/contact', label: 'Contact' },
]

export default function Navigation() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const [showDock, setShowDock] = useState(false)

  /* ================= SCROLL TRACK (ONLY HOME) ================= */
  useEffect(() => {
    if (!isHome) return

    const onScroll = () => {
      const y = window.scrollY
      setShowDock(y > window.innerHeight * 0.15)

      const offset = y + 180
      for (const link of sideLinks) {
        const el = document.getElementById(link.id)
        if (!el) continue
        if (offset >= el.offsetTop && offset < el.offsetTop + el.offsetHeight) {
          setActive(link.id)
          break
        }
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    window.scrollTo({
      top: el.offsetTop - 90,
      behavior: 'smooth',
    })
  }

  const activeIndex = sideLinks.findIndex(l => l.id === active)

  return (
    <>
      {/* ================= TOP NAVBAR (ALL PAGES) ================= */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-0 top-0 z-50 h-16 bg-background backdrop-blur border-b border-border"
      >
        <div className="mx-auto flex h-full max-w-8xl items-center justify-between px-10">
          {/* LOGO */}
          <Link href="/">
            <Image 
              
              src="/images/logos.png"
              alt="RaYnk Labs"
              width={95}
              height={20}
              priority
            />
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-10">
            {topLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-primary rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
            <ModeToggle />
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-background/95 backdrop-blur border-b border-border"
            >
              <div className="flex flex-col gap-2 p-4">
                {topLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 text-sm hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                ))}
            <ModeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ================= SIDE DOCK (ONLY HOME PAGE) ================= */}
      <AnimatePresence>
        {isHome && showDock && (
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed z-40 top-1/2 right-0 -translate-y-1/2"
          >
            <div className="flex flex-col items-center gap-3 rounded-l-full bg-background/90 backdrop-blur border border-border px-3 py-4">
              {sideLinks.map((link, i) => {
                const Icon = link.icon
                const isActive = link.id === active
                const near =
                  i === activeIndex ||
                  i === activeIndex - 1 ||
                  i === activeIndex + 1

                return (
                  <motion.button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="cursor-pointer flex items-center justify-center rounded-full"
                    whileHover={{ scale: 1.25 }}
                    animate={{
                      width: isActive ? 56 : near ? 48 : 40,
                      height: isActive ? 56 : near ? 48 : 40,
                      backgroundColor: isActive
                        ? 'rgba(59,167,255,0.25)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--primary)'
                        : 'var(--muted-foreground)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Icon size={18} />
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
          
        )}
      </AnimatePresence>
    </>
  )
}
