import { cookies } from 'next/headers'
import { verifyJWT, type AdminJWTPayload } from '@/lib/auth/jwt'

export async function requireAdmin(): Promise<AdminJWTPayload> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    throw new Error('Unauthorized')
  }

  return verifyJWT(token)
}

export async function optionalAdmin(): Promise<AdminJWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value

    if (!token) {
      return null
    }

    return verifyJWT(token)
  } catch {
    return null
  }
}

export async function requireSuperAdmin(): Promise<AdminJWTPayload> {
  const payload = await requireAdmin()
  if (payload.role !== 'super-admin') {
    throw new Error('Super admin access required')
  }
  return payload
}
