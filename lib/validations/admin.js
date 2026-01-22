import { z } from 'zod'

// News schemas
export const newsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'PUBLISHED', 'DRAFT', 'ARCHIVED']).optional().default('all'),
  category: z.string().optional().default('all'),
  sort: z.enum(['newest', 'oldest', 'most_viewed', 'title_asc']).optional().default('newest')
})

export const createNewsSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Konten minimal 10 karakter'),
  image: z.string().url().optional().nullable(),
  category: z.string().min(1, 'Kategori wajib diisi'),
  author: z.string().min(1, 'Author wajib diisi'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT')
})

export const updateNewsSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10, 'Konten minimal 10 karakter').optional(),
  image: z.string().url().optional().nullable(),
  category: z.string().optional(),
  author: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
})

// Company schemas
export const verifyCompanySchema = z.object({
  notes: z.string().optional()
})

export const rejectCompanySchema = z.object({
  reason: z.string().min(5, 'Alasan penolakan minimal 5 karakter')
})

// Contract schemas
export const processContractSchema = z.object({
  action: z.enum(['approve', 'reject'], { 
    errorMap: () => ({ message: 'Action harus "approve" atau "reject"' })
  }),
  adminNotes: z.string().optional(),
  adminResponseDocUrl: z.string().url().optional().nullable()
})
