'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

const DEFAULT_FALLBACK_SRC = '/assets/logo-disnakerkabcirebon.png'

export default function NewsCoverImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
}) {
  const [resolvedSrc, setResolvedSrc] = useState(src || fallbackSrc)
  const isFallback = resolvedSrc === fallbackSrc

  useEffect(() => {
    setResolvedSrc(src || fallbackSrc)
  }, [src, fallbackSrc])

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={{
        objectFit: isFallback ? 'contain' : 'cover',
        objectPosition: 'center',
        backgroundColor: isFallback ? '#ffffff' : 'transparent',
      }}
      onError={() => {
        if (resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc)
        }
      }}
    />
  )
}
