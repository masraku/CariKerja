import { z } from 'zod'

export const jobSearchSchema = z.object({
  page: z.string().transform(val => parseInt(val)).pipe(z.number().min(1)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(100)).optional().default('10'),
  search: z.string().optional(),
  location: z.string().optional(),
  jobType: z.string().optional(),
  category: z.string().optional(),
  experience: z.string().optional(),
  sortBy: z.enum(['latest', 'salary', 'popular']).optional().default('latest')
})
