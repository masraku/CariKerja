import { NextResponse } from 'next/server'

export function authorizeCronRequest(request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET belum dikonfigurasi' },
      { status: 503 }
    )
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Tidak memiliki akses' },
      { status: 401 }
    )
  }

  return null
}
