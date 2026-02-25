import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import FooterConfig from '@/lib/models/FooterConfig'
import { requireAdmin } from '@/lib/auth/authGuard'

/* Default seed data — used when the collection is empty */
const DEFAULTS = {
  brandName: 'RaYnk Labs',
  brandTagline:
    'Empowering students through innovation, education, and real-world project experience.',
  socialLinks: [
    { platform: 'github',    href: 'https://github.com/rohitrathod1',   order: 0, isVisible: true },
    { platform: 'linkedin',  href: 'https://www.linkedin.com',          order: 1, isVisible: true },
    { platform: 'instagram', href: 'https://www.instagram.com',         order: 2, isVisible: true },
    { platform: 'youtube',   href: 'https://www.youtube.com',           order: 3, isVisible: true },
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

/* ===== GET — Public ===== */
export async function GET() {
  try {
    await connectDB()
    let config = await FooterConfig.findOne().lean()

    if (!config) {
      config = await FooterConfig.create(DEFAULTS)
    }

    return NextResponse.json(config)
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch footer config' },
      { status: 500 }
    )
  }
}

/* ===== PUT — Admin: full replace ===== */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    const body = await req.json()
    const { id, ...data } = body

    let config
    if (id) {
      config = await FooterConfig.findByIdAndUpdate(id, data, { new: true })
    } else {
      // Upsert — update the single document or create if none exists
      config = await FooterConfig.findOneAndUpdate({}, data, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      })
    }

    return NextResponse.json(config)
  } catch (error: any) {
    if (
      error.message === 'Unauthorized' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to update footer config' },
      { status: 500 }
    )
  }
}
