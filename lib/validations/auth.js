import { z } from 'zod'

// Strong password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/

const passwordSchema = z.string()
  .min(8, 'Password minimal 8 karakter')
  .regex(strongPasswordRegex, 'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus (!@#$%^&*)')

// For login - only check if password exists (don't reveal policy)
export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  role: z.enum(['JOBSEEKER', 'RECRUITER', 'ADMIN']).optional()
})

export const registerJobseekerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: passwordSchema,
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').regex(/^\d+$/, 'Nomor telepon harus angka')
})

export const registerRecruiterSchema = z.object({
  firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
  lastName: z.string().optional(),
  email: z.string().email('Format email tidak valid'),
  password: passwordSchema,
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').regex(/^\d+$/, 'Nomor telepon harus angka'),
  companyName: z.string().min(3, 'Nama perusahaan minimal 3 karakter'),
  position: z.string().min(2, 'Jabatan minimal 2 karakter')
})

// For password change
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password baru tidak cocok',
  path: ['confirmPassword']
})

// Export for reuse
export { passwordSchema }
