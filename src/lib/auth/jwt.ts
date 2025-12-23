import jwt from 'jsonwebtoken'

/* =========================
   TYPES
========================= */
export interface AdminJWTPayload {
  adminId: string
  email: string
  role: 'admin'
}

/* =========================
   SECRET
========================= */
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

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
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}
