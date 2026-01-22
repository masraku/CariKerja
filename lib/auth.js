import jwt from 'jsonwebtoken'

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