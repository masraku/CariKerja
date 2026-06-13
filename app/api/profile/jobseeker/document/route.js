import { NextResponse } from 'next/server'
import { requireJobseeker } from '@/lib/authHelper'
import { supabaseAdmin } from '@/lib/supabase'

const DOCUMENT_FIELDS = {
  resume: { field: 'cvUrl', bucket: 'Resume' },
  cv: { field: 'cvUrl', bucket: 'Resume' },
  ktp: { field: 'ktpUrl', bucket: 'Resume' },
  ak1: { field: 'ak1Url', bucket: 'Resume' },
  kartuak1: { field: 'ak1Url', bucket: 'Resume' },
  diploma: { field: 'ijazahUrl', bucket: 'Ijazah' },
  ijazah: { field: 'ijazahUrl', bucket: 'Ijazah' },
  certificate: { field: 'sertifikatUrl', bucket: 'Resume' },
  sertifikat: { field: 'sertifikatUrl', bucket: 'Resume' },
  suratpengalaman: { field: 'suratPengalamanUrl', bucket: 'Resume' }
}

const FALLBACK_BUCKETS = ['Resume', 'Ijazah', 'Profile']

function getDocumentConfig(type) {
  const key = type?.toLowerCase().replace(/[-_\s]/g, '')
  return DOCUMENT_FIELDS[key]
}

function getStorageLocation(documentUrl, fallbackBucket) {
  if (!documentUrl) return null

  if (!/^https?:\/\//i.test(documentUrl)) {
    return {
      bucket: fallbackBucket,
      path: documentUrl.replace(/^\/+/, '')
    }
  }

  try {
    const url = new URL(documentUrl)
    const markers = [
      '/storage/v1/object/public/',
      '/storage/v1/object/sign/'
    ]
    const marker = markers.find((value) => url.pathname.includes(value))

    if (!marker) return null

    const storagePath = url.pathname.slice(url.pathname.indexOf(marker) + marker.length)
    const [bucket, ...pathParts] = storagePath.split('/')

    if (!bucket || pathParts.length === 0) return null

    return {
      bucket: decodeURIComponent(bucket),
      path: pathParts.map((part) => decodeURIComponent(part)).join('/')
    }
  } catch (error) {
    return null
  }
}

function getContentType(path, fallback) {
  const extension = path.split('.').pop()?.toLowerCase()

  if (extension === 'pdf') return 'application/pdf'
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg'
  if (extension === 'png') return 'image/png'
  if (extension === 'gif') return 'image/gif'
  if (extension === 'webp') return 'image/webp'

  if (fallback && fallback !== 'application/octet-stream') return fallback

  return 'application/octet-stream'
}

function getFilename(path) {
  return decodeURIComponent(path.split('/').pop() || 'dokumen')
    .replace(/["\r\n]/g, '')
}

async function createInlineResponse(file, path, contentType) {
  const body = Buffer.from(await file.arrayBuffer())
  const filename = getFilename(path)

  return new NextResponse(body, {
    headers: {
      'Content-Type': getContentType(path, contentType),
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, max-age=300',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

async function createDocumentResponse(documentUrl, fallbackBucket) {
  const storageLocation = getStorageLocation(documentUrl, fallbackBucket)
  const storageLocations = storageLocation
    ? [
        storageLocation,
        ...FALLBACK_BUCKETS
          .filter((bucket) => bucket !== storageLocation.bucket)
          .map((bucket) => ({ bucket, path: storageLocation.path }))
      ]
    : []

  if (supabaseAdmin?.storage) {
    for (const location of storageLocations) {
      const { data, error } = await supabaseAdmin.storage
        .from(location.bucket)
        .download(location.path)

      if (!error && data) {
        return createInlineResponse(data, location.path, data.type)
      }
    }
  }

  if (!/^https?:\/\//i.test(documentUrl)) return null

  const response = await fetch(documentUrl)

  if (!response.ok) {
    return null
  }

  const path = storageLocation?.path || new URL(documentUrl).pathname
  const file = await response.blob()

  return createInlineResponse(
    file,
    path,
    response.headers.get('Content-Type') || file.type
  )
}

export async function GET(request) {
  try {
    const auth = await requireJobseeker(request)

    if (auth.error) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const config = getDocumentConfig(searchParams.get('type'))

    if (!config) {
      return NextResponse.json(
        { error: 'Jenis dokumen tidak valid' },
        { status: 400 }
      )
    }

    const documentUrl = auth.jobseeker?.[config.field]

    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      )
    }

    const documentResponse = await createDocumentResponse(documentUrl, config.bucket)

    if (!documentResponse) {
      return NextResponse.json(
        { error: 'Dokumen tidak dapat dibuka. Konfigurasi Supabase storage perlu diperiksa.' },
        { status: 500 }
      )
    }

    return documentResponse
  } catch (error) {
    return NextResponse.json(
      { error: 'Gagal membuka dokumen' },
      { status: 500 }
    )
  }
}
