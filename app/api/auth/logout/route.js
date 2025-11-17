import { NextResponse } from 'next/server'

export async function POST(request) {
  const response = NextResponse.json(
    { message: 'Logout berhasil' },
    { status: 200 }
  )

  // Clear cookie
  response.cookies.delete('token')

  return response
}