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

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface NavItem {
  _id?: string
  title: string
  path: string
  order: number
  isVisible: boolean
}

/* ─────────────────────────────────────────────
   Fallback links — used until API responds
───────────────────────────────────────────── */
const FALLBACK_LINKS: NavItem[] = [
  { title: 'Home',         path: '/',         order: 0, isVisible: true },
  { title: 'About Us',     path: '/about',    order: 1, isVisible: true },
  { title: 'Services',     path: '/services', order: 2, isVisible: true },
  { title: 'Software',     path: '/softwares',order: 3, isVisible: true },
  { title: 'Courses',      path: '/courses',  order: 4, isVisible: true },
  { title: 'Team Members', path: '/team',     order: 5, isVisible: true },
  { title: 'Contact',      path: '/contact',  order: 6, isVisible: true },
]

/* ─────────────────────────────────────────────
   Side-dock section anchors (home page only)
───────────────────────────────────────────── */
const SIDE_LINKS = [
  { id: 'hero',      icon: Home },
  { id: 'services',  icon: Briefcase },
  { id: 'courses',   icon: GraduationCap },
  { id: 'ai-tools',  icon: Bot },
  { id: 'community', icon: Users },
  { id: 'meetups',   icon: Calendar },
  { id: 'team',      icon: UserRound },
  { id: 'contact',   icon: Mail },
]

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Navigation() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  const [open, setOpen]         = useState(false)
  const [active, setActive]     = useState('hero')
  const [showDock, setShowDock] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_LINKS)
  const [logoUrl, setLogoUrl]   = useState('/images/logos.png')

  /* ── Fetch dynamic navbar items ── */
  useEffect(() => {
    fetch('/api/navbar', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: NavItem[] | null) => {
        if (Array.isArray(data) && data.length > 0) {
          setNavItems(
            data
              .filter(item => item.isVisible)
              .sort((a, b) => a.order - b.order)
          )
        }
      })
      .catch(() => {
        /* keep fallback items silently */
      })
  }, [])

  /* ── Fetch dynamic logo ── */
  useEffect(() => {
    fetch('/api/navbar/config', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: { logoUrl: string } | null) => {
        if (data?.logoUrl) setLogoUrl(data.logoUrl)
      })
      .catch(() => { /* keep default silently */ })
  }, [])

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  /* ── Scroll-track for side dock (home only) ── */
  useEffect(() => {
    if (!isHome) return

    const onScroll = () => {
      const y = window.scrollY
      setShowDock(y > window.innerHeight * 0.15)

      const offset = y + 180
      for (const link of SIDE_LINKS) {
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
    window.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' })
  }

  const activeIndex = SIDE_LINKS.findIndex(l => l.id === active)

  return (
    <>
      {/* ══════════════════════════════════════
          TOP NAVBAR — all pages
      ══════════════════════════════════════ */}
      <motion.header
        role="navigation"
        aria-label="Main navigation"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full fixed top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">

          {/* LEFT — Logo */}
          <Link
            href="/"
            aria-label="RaYnk Labs — go to homepage"
            className="shrink-0"
          >
            <Image
              src={logoUrl}
              alt="RaYnk Labs"
              width={95}
              height={20}
              priority
              unoptimized
            />
          </Link>

          {/* CENTER — Desktop navigation links */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navItems.map(link => {
              const isActivePage = pathname === link.path
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  aria-current={isActivePage ? 'page' : undefined}
                  className={`
                    text-sm font-medium px-3 py-2 transition-colors duration-200 relative
                    after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5
                    after:rounded-full after:transition-all after:duration-200
                    ${isActivePage
                      ? 'text-primary after:bg-primary after:scale-x-100'
                      : 'text-foreground/70 hover:text-foreground after:bg-primary after:scale-x-0 hover:after:scale-x-100'}
                  `}
                >
                  {link.title}
                </Link>
              )
            })}
          </nav>

          {/* RIGHT — Theme toggle (desktop) + Mobile controls */}
          <div className="flex items-center gap-1 shrink-0">
            <div className="hidden md:flex items-center">
              <ModeToggle />
            </div>

            {/* Mobile: theme toggle + hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <ModeToggle />
              <button
                onClick={() => setOpen(prev => !prev)}
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
                aria-controls="mobile-nav-menu"
                className="p-2 rounded-lg hover:bg-accent/50 transition-colors"
              >
                {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu dropdown ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav-menu"
              role="menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden bg-background/80 backdrop-blur-md border-t border-border/50 px-4 py-3"
            >
              <nav className="flex flex-col gap-1">
                {navItems.map(link => {
                  const isActivePage = pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      aria-current={isActivePage ? 'page' : undefined}
                      className={`
                        text-sm py-2.5 px-3 font-medium transition-colors border-l-2
                        ${isActivePage
                          ? 'text-primary border-primary'
                          : 'text-muted-foreground hover:text-foreground border-transparent hover:border-foreground/30'}
                      `}
                    >
                      {link.title}
                    </Link>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ══════════════════════════════════════
          SIDE DOCK — home page only
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {isHome && showDock && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            className="fixed z-40 top-1/2 right-0 -translate-y-1/2"
          >
            <div className="flex flex-col items-center gap-3 rounded-l-2xl bg-background/90 backdrop-blur-md border border-border/50 px-3 py-4 shadow-luxury">
              {SIDE_LINKS.map((link, i) => {
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
                    title={link.id.charAt(0).toUpperCase() + link.id.slice(1).replace('-', ' ')}
                    className="cursor-pointer flex items-center justify-center rounded-full"
                    whileHover={{ scale: 1.25 }}
                    animate={{
                      width:  isActive ? 56 : near ? 48 : 40,
                      height: isActive ? 56 : near ? 48 : 40,
                      backgroundColor: isActive
                        ? 'oklch(0.648 0.2 131.684 / 15%)'
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
