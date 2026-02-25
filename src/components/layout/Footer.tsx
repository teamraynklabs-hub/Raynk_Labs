'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Mail,
  Phone,
  MapPin,
  LucideIcon,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface SocialLink {
  _id?: string
  platform: string
  href: string
  order: number
  isVisible: boolean
}

interface QuickLink {
  _id?: string
  label: string
  href: string
  order: number
  isVisible: boolean
}

interface FooterData {
  _id?: string
  brandName: string
  brandTagline: string
  socialLinks: SocialLink[]
  quickLinks: QuickLink[]
  email: string
  phone: string
  location: string
  copyright: string
}

/* ─────────────────────────────────────────────
   Platform → lucide icon map
───────────────────────────────────────────── */
const ICON_MAP: Record<string, LucideIcon> = {
  github:    Github,
  linkedin:  Linkedin,
  instagram: Instagram,
  youtube:   Youtube,
  twitter:   Twitter,
  facebook:  Facebook,
}

/* ─────────────────────────────────────────────
   Fallback data — shown until API responds
───────────────────────────────────────────── */
const FALLBACK: FooterData = {
  brandName:    'RaYnk Labs',
  brandTagline: 'Empowering students through innovation, education, and real-world project experience.',
  socialLinks: [
    { platform: 'github',    href: 'https://github.com/rohitrathod1', order: 0, isVisible: true },
    { platform: 'linkedin',  href: 'https://www.linkedin.com',        order: 1, isVisible: true },
    { platform: 'instagram', href: 'https://www.instagram.com',       order: 2, isVisible: true },
    { platform: 'youtube',   href: 'https://www.youtube.com',         order: 3, isVisible: true },
  ],
  quickLinks: [
    { label: 'Services',  href: '/services',  order: 0, isVisible: true },
    { label: 'Softwares', href: '/softwares', order: 1, isVisible: true },
    { label: 'Projects',  href: '/projects',  order: 2, isVisible: true },
    { label: 'Courses',   href: '/courses',   order: 3, isVisible: true },
  ],
  email:     'team.raynklabs@gmail.com',
  phone:     '+91 98765 43210',
  location:  'India',
  copyright: 'RaYnk Labs. All rights reserved.',
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function Footer() {
  const [data, setData] = useState<FooterData>(FALLBACK)

  useEffect(() => {
    fetch('/api/footer', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then((d: FooterData | null) => { if (d) setData(d) })
      .catch(() => { /* keep fallback */ })
  }, [])

  const visibleSocials = [...data.socialLinks]
    .filter(s => s.isVisible)
    .sort((a, b) => a.order - b.order)

  const visibleLinks = [...data.quickLinks]
    .filter(l => l.isVisible)
    .sort((a, b) => a.order - b.order)

  return (
    <motion.footer
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      className="mt-16 border-t border-border/50 bg-background"
    >
      <div className="section-container section-padding">

        {/* ══════════════════════════════════════
            MAIN GRID
        ══════════════════════════════════════ */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

          {/* ── BRAND ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3
              className="mb-3 text-2xl font-extrabold bg-linear-to-r from-primary to-electric-purple bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-heading, Georgia, serif)' }}
            >
              {data.brandName}
            </h3>

            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              {data.brandTagline}
            </p>

            {/* Social links */}
            {visibleSocials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {visibleSocials.map(social => {
                  const Icon = ICON_MAP[social.platform.toLowerCase()] ?? Github
                  return (
                    <motion.a
                      key={social._id ?? social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      whileHover={{ scale: 1.15 }}
                      className="
                        flex h-10 w-10 items-center justify-center
                        rounded-full border border-border/50 bg-card
                        text-muted-foreground shadow-soft
                        transition-luxury hover:bg-primary hover:text-primary-foreground
                        hover:border-primary hover:shadow-luxury
                        cursor-pointer
                      "
                    >
                      <Icon size={17} />
                    </motion.a>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── QUICK LINKS ── */}
          <div>
            <h5 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/50">
              Quick Links
            </h5>

            {visibleLinks.length > 0 ? (
              <ul className="space-y-3">
                {visibleLinks.map(link => (
                  <li key={link._id ?? link.href}>
                    <Link
                      href={link.href}
                      className="
                        group flex items-center gap-2 text-sm text-muted-foreground
                        transition-luxury hover:text-primary
                      "
                    >
                      <span className="h-px w-4 bg-border group-hover:w-6 group-hover:bg-primary transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground/60">No links added.</p>
            )}
          </div>

          {/* ── CONTACT ── */}
          <div>
            <h5 className="mb-5 text-xs font-bold uppercase tracking-widest text-foreground/50">
              Get In Touch
            </h5>

            <div className="space-y-4">
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-start gap-3 text-sm text-muted-foreground transition-luxury hover:text-primary group"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-luxury group-hover:bg-primary group-hover:text-primary-foreground">
                    <Mail size={14} />
                  </span>
                  <span className="break-all leading-relaxed">{data.email}</span>
                </a>
              )}

              {data.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground transition-luxury hover:text-primary group"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-luxury group-hover:bg-primary group-hover:text-primary-foreground">
                    <Phone size={14} />
                  </span>
                  {data.phone}
                </a>
              )}

              {data.location && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin size={14} />
                  </span>
                  {data.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════
            BOTTOM BAR
        ══════════════════════════════════════ */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/40 pt-6">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © {new Date().getFullYear()} {data.copyright}
          </p>
          <p className="text-xs text-muted-foreground/50">
            Built with ❤ in India
          </p>
        </div>

      </div>
    </motion.footer>
  )
}
