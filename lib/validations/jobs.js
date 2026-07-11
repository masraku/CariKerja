import { z } from 'zod'

export const jobSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  category: z.string().optional(),
  experience: z.string().optional(),
  sortBy: z.enum(['latest', 'salary', 'popular']).optional().default('latest')
})
