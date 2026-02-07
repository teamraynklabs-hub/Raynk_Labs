import jwt from 'jsonwebtoken'

export const runtime = "nodejs";

/* =========================
   TYPES
========================= */
export interface AdminJWTPayload {
  adminId: string
  email: string
  role: 'admin' | 'super-admin'
}

/* =========================
   SECRET
========================= */
const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined')
  }
  return secret
})()

/* =========================
   SIGN TOKEN
========================= */
export function signJWT(payload: AdminJWTPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  })
}

/* =========================
   VERIFY TOKEN
========================= */
export function verifyJWT(token: string): AdminJWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJWTPayload
  } catch {
    throw new Error('Invalid or expired token')
  }
}
