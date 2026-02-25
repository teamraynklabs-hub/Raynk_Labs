import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import NavbarItem from '@/lib/models/NavbarItem'
import { requireAdmin } from '@/lib/auth/authGuard'

/* ===== Default seed items (used when collection is empty) ===== */
const DEFAULT_ITEMS = [
  { title: 'Home',         path: '/',         order: 0, isVisible: true, isDropdown: false },
  { title: 'About Us',     path: '/about',    order: 1, isVisible: true, isDropdown: false },
  { title: 'Services',     path: '/services', order: 2, isVisible: true, isDropdown: false },
  { title: 'Software',     path: '/softwares',order: 3, isVisible: true, isDropdown: false },
  { title: 'Courses',      path: '/courses',  order: 4, isVisible: true, isDropdown: false },
  { title: 'Team Members', path: '/team',     order: 5, isVisible: true, isDropdown: false },
  { title: 'Contact',      path: '/contact',  order: 6, isVisible: true, isDropdown: false },
]

/* ===== GET — Public: all active items (admin page filters visible server-side) ===== */
export async function GET() {
  try {
    await connectDB()
    let items = await NavbarItem.find({ isActive: true }).sort({ order: 1 }).lean()

    // Seed defaults on first use
    if (items.length === 0) {
      await NavbarItem.insertMany(DEFAULT_ITEMS)
      items = await NavbarItem.find({ isActive: true }).sort({ order: 1 }).lean()
    }

    return NextResponse.json(items)
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch navbar items' },
      { status: 500 }
    )
  }
}

/* ===== POST — Admin: create a new navbar item ===== */
export async function POST(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    const body = await req.json()
    const { title, path, order, isVisible, isDropdown, parentId } = body

    if (!title?.trim() || !path?.trim()) {
      return NextResponse.json(
        { message: 'Title and path are required' },
        { status: 400 }
      )
    }

    const item = await NavbarItem.create({
      title:      title.trim(),
      path:       path.trim(),
      order:      order ?? 0,
      isVisible:  isVisible !== false,
      isDropdown: isDropdown || false,
      parentId:   parentId || null,
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    if (
      error.message === 'Unauthorized' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to create navbar item' },
      { status: 500 }
    )
  }
}

/* ===== PUT — Admin: update an existing navbar item ===== */
export async function PUT(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    const body = await req.json()
    const { id, title, path, order, isVisible, isDropdown, parentId } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Item ID is required' },
        { status: 400 }
      )
    }

    const item = await NavbarItem.findById(id)
    if (!item) {
      return NextResponse.json(
        { message: 'Navbar item not found' },
        { status: 404 }
      )
    }

    if (title     !== undefined) item.title      = title.trim()
    if (path      !== undefined) item.path       = path.trim()
    if (order     !== undefined) item.order      = order
    if (isVisible !== undefined) item.isVisible  = isVisible
    if (isDropdown !== undefined) item.isDropdown = isDropdown
    if (parentId  !== undefined) item.parentId   = parentId || null

    await item.save()
    return NextResponse.json(item)
  } catch (error: any) {
    if (
      error.message === 'Unauthorized' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to update navbar item' },
      { status: 500 }
    )
  }
}

/* ===== DELETE — Admin: soft-delete a navbar item ===== */
export async function DELETE(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json(
        { message: 'Item ID is required' },
        { status: 400 }
      )
    }

    const item = await NavbarItem.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )

    if (!item) {
      return NextResponse.json(
        { message: 'Navbar item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (
      error.message === 'Unauthorized' ||
      error.message === 'Invalid or expired token'
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { message: 'Failed to delete navbar item' },
      { status: 500 }
    )
  }
}

/* ===== PATCH — Admin: bulk reorder navbar items ===== */
export async function PATCH(req: Request) {
  try {
    await requireAdmin()
    await connectDB()

    const body = await req.json()
    const { items } = body // [{ id: string, order: number }]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'items array is required' },
        { status: 400 }
      )
    }

    await Promise.all(
      items.map(({ id, order }: { id: string; order: number }) =>
        NavbarItem.findByIdAndUpdate(id, { order })
      )
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
      { message: 'Failed to reorder navbar items' },
      { status: 500 }
    )
  }
}
