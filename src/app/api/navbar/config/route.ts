import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import NavbarConfig from '@/lib/models/NavbarConfig'
import { requireAdmin } from '@/lib/auth/authGuard'
import { deleteImage } from '@/lib/cloudinary'

/* ===== GET — Public: fetch current logo config ===== */
export async function GET() {
  try {
    await connectDB()
    let config = await NavbarConfig.findOne().lean()

    // Seed default config on first use
    if (!config) {
      config = await NavbarConfig.create({
        logoUrl: '/images/logos.png',
        logoPublicId: '',
      })
    }

    return NextResponse.json(config)
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch navbar config' },
      { status: 500 }
    )
  }
}

/* ===== PUT — Admin: update logo config ===== */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    const body = await req.json()
    const { logoUrl, logoPublicId } = body

    if (!logoUrl?.trim()) {
      return NextResponse.json(
        { message: 'logoUrl is required' },
        { status: 400 }
      )
    }

    let config = await NavbarConfig.findOne()

    if (!config) {
      config = await NavbarConfig.create({ logoUrl, logoPublicId: logoPublicId || '' })
    } else {
      // If replacing a Cloudinary image, delete the old one
      if (
        config.logoPublicId &&
        logoPublicId &&
        config.logoPublicId !== logoPublicId
      ) {
        try {
          await deleteImage(config.logoPublicId)
        } catch {
          /* non-fatal — old image cleanup failure */
        }
      }
      config.logoUrl = logoUrl.trim()
      config.logoPublicId = logoPublicId || ''
      await config.save()
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
      { message: 'Failed to update navbar config' },
      { status: 500 }
    )
  }
}

/* ===== DELETE — Admin: reset logo to default ===== */
export async function DELETE() {
  try {
    await requireAdmin()
    await connectDB()

    const config = await NavbarConfig.findOne()
    if (config?.logoPublicId) {
      try {
        await deleteImage(config.logoPublicId)
      } catch {
        /* non-fatal */
      }
    }

    await NavbarConfig.updateOne(
      {},
      { logoUrl: '/images/logos.png', logoPublicId: '' },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (
      error.message === 'Unauthorized' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to reset logo' },
      { status: 500 }
    )
  }
}
