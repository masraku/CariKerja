import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET 

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

/**
 * Get authentication info from cookies
 * @returns {Promise<{userId: string, email: string, role: string} | null>}
 */
export async function getAuthFromCookies() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return null
    return verifyToken(token.value)
  } catch (error) {
    return null
  }
}