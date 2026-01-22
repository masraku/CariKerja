import { describe, it, expect } from 'vitest'
import { 
  validateMagicNumber,
  sanitizeFilename,
  isDangerousFilename,
  isAllowedExtension,
  getMimeCategory,
  generateSafeFilename
} from '@/lib/fileValidation'

describe('File Validation', () => {
  describe('validateMagicNumber', () => {
    it('should validate JPEG magic number', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10])
      expect(validateMagicNumber(jpegBuffer, 'image/jpeg')).toBe(true)
    })

    it('should validate PNG magic number', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      expect(validateMagicNumber(pngBuffer, 'image/png')).toBe(true)
    })

    it('should validate PDF magic number', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D])
      expect(validateMagicNumber(pdfBuffer, 'application/pdf')).toBe(true)
    })

    it('should reject mismatched magic number', () => {
      const fakeJpeg = Buffer.from([0x00, 0x00, 0x00, 0x00])
      expect(validateMagicNumber(fakeJpeg, 'image/jpeg')).toBe(false)
    })
  })

  describe('sanitizeFilename', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeFilename('file<>:"|?*.jpg')).toBe('file.jpg')
    })

    it('should handle path traversal attempts', () => {
      const result = sanitizeFilename('../../../etc/passwd')
      // Should not contain path traversal and should have sanitized name
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
    })

    it('should preserve valid characters', () => {
      expect(sanitizeFilename('my-file_123.pdf')).toBe('my-file_123.pdf')
    })

    it('should handle empty filename', () => {
      const result = sanitizeFilename('')
      expect(result).toMatch(/^file_\d+$/)
    })
  })

  describe('isDangerousFilename', () => {
    it('should detect path traversal', () => {
      expect(isDangerousFilename('../file.txt')).toBe(true)
    })

    it('should detect executable extensions', () => {
      expect(isDangerousFilename('virus.php')).toBe(true)
      expect(isDangerousFilename('hack.exe')).toBe(true)
      expect(isDangerousFilename('script.sh')).toBe(true)
    })

    it('should allow safe filenames', () => {
      expect(isDangerousFilename('document.pdf')).toBe(false)
      expect(isDangerousFilename('photo.jpg')).toBe(false)
    })
  })

  describe('isAllowedExtension', () => {
    it('should allow image extensions', () => {
      expect(isAllowedExtension('photo.jpg', 'image')).toBe(true)
      expect(isAllowedExtension('image.png', 'image')).toBe(true)
      expect(isAllowedExtension('pic.webp', 'image')).toBe(true)
    })

    it('should allow document extensions', () => {
      expect(isAllowedExtension('file.pdf', 'document')).toBe(true)
    })

    it('should reject unknown extensions', () => {
      expect(isAllowedExtension('file.php', 'image')).toBe(false)
      expect(isAllowedExtension('file.exe', 'document')).toBe(false)
    })
  })

  describe('getMimeCategory', () => {
    it('should categorize image types', () => {
      expect(getMimeCategory('image/jpeg')).toBe('image')
      expect(getMimeCategory('image/png')).toBe('image')
    })

    it('should categorize document types', () => {
      expect(getMimeCategory('application/pdf')).toBe('document')
    })

    it('should return null for unknown types', () => {
      expect(getMimeCategory('application/x-php')).toBe(null)
    })
  })

  describe('generateSafeFilename', () => {
    it('should generate unique filenames', () => {
      const name1 = generateSafeFilename('test.jpg')
      const name2 = generateSafeFilename('test.jpg')
      expect(name1).not.toBe(name2)
    })

    it('should preserve extension', () => {
      const result = generateSafeFilename('photo.png')
      expect(result).toMatch(/\.png$/)
    })
  })
})
