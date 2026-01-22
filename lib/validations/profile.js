import { z } from 'zod'

// Interview Response Schema
export const interviewRespondSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'RESCHEDULE_REQUESTED'], {
    errorMap: () => ({ message: 'Status harus ACCEPTED, DECLINED, atau RESCHEDULE_REQUESTED' })
  }),
  message: z.string().optional()
}).refine((data) => {
  if (data.status === 'RESCHEDULE_REQUESTED') {
    return data.message && data.message.trim().length >= 10
  }
  return true
}, {
  message: 'Alasan reschedule minimal 10 karakter',
  path: ['message']
})

// Job Creation Schema
export const createJobSchema = z.object({
  // Required
  title: z.string().min(5, 'Judul lowongan minimal 5 karakter'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  
  // Optional with defaults
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  jobType: z.string().optional(),
  level: z.string().optional().default('MID_LEVEL'),
  category: z.string().optional().default('Other'),
  location: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  isRemote: z.boolean().optional().default(false),
  jobScope: z.string().optional().default('DOMESTIC'),
  
  // Salary
  salaryMin: z.union([z.string(), z.number()]).optional().nullable(),
  salaryMax: z.union([z.string(), z.number()]).optional().nullable(),
  salaryType: z.string().optional().default('monthly'),
  showSalary: z.boolean().optional().default(true),
  
  // Work Schedule
  workingDays: z.string().optional(),
  holidays: z.string().optional(),
  isShift: z.boolean().optional().default(false),
  shiftCount: z.union([z.string(), z.number()]).optional().nullable(),
  isDisabilityFriendly: z.boolean().optional().default(false),
  disabilityDescription: z.string().optional().nullable(),
  
  // Requirements
  minExperience: z.union([z.string(), z.number()]).optional().nullable(),
  maxExperience: z.union([z.string(), z.number()]).optional().nullable(),
  educationLevel: z.string().optional().nullable(),
  
  // Additional
  benefits: z.array(z.string()).optional(),
  numberOfPositions: z.union([z.string(), z.number()]).optional().default(1),
  applicationDeadline: z.string().optional().nullable(),
  
  // Media
  photo: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional(),
  
  // Skills
  skills: z.array(z.string()).optional()
})

// Reschedule Interview Schema
export const rescheduleInterviewSchema = z.object({
  scheduledAt: z.string().min(1, 'Tanggal wajib diisi'),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().nullable(),
  notes: z.string().optional()
})

// Application Update Schema
export const applicationStatusSchema = z.object({
  status: z.enum(['REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'ACCEPTED', 'REJECTED']),
  notes: z.string().optional()
})

// Schedule Interview Schema
export const scheduleInterviewSchema = z.object({
  applicationIds: z.array(z.string()).min(1, 'Pilih minimal 1 aplikasi'),
  scheduledAt: z.string().min(1, 'Tanggal dan waktu wajib diisi'),
  type: z.enum(['ONLINE', 'OFFLINE']).default('ONLINE'),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().nullable(),
  notes: z.string().optional()
})

// Contract Creation Schema  
export const createContractSchema = z.object({
  workers: z.array(z.object({
    applicationId: z.string().min(1),
    jobseekerId: z.string().min(1),
    jobTitle: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    salary: z.union([z.string(), z.number()]),
    attachmentUrl: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })).min(1, 'Minimal 1 worker diperlukan'),
  recruiterDocUrl: z.string().optional().nullable()
})

// Job Application Schema
export const applyJobSchema = z.object({
  coverLetter: z.string().optional(),
  expectedSalary: z.union([z.string(), z.number()]).optional().nullable(),
  availableDate: z.string().optional().nullable(),
  notes: z.string().optional()
})

// Resignation Submit Schema
export const submitResignationSchema = z.object({
  reason: z.string().min(10, 'Alasan pengunduran diri minimal 10 karakter'),
  lastWorkingDate: z.string().min(1, 'Tanggal terakhir kerja wajib diisi'),
  notes: z.string().optional()
})

// Job Update Schema
export const updateJobSchema = z.object({
  title: z.string().min(5, 'Judul lowongan minimal 5 karakter'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  jobType: z.string().min(1, 'Tipe pekerjaan wajib diisi'),
  
  // Optional fields
  benefits: z.array(z.string()).optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  isRemote: z.boolean().optional().default(false),
  jobScope: z.string().optional().default('DOMESTIC'),
  educationLevel: z.string().optional().nullable(),
  numberOfPositions: z.union([z.string(), z.number()]).optional(),
  applicationDeadline: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  photo: z.string().optional().nullable(),
  workingDays: z.string().optional().nullable(),
  holidays: z.string().optional().nullable(),
  isShift: z.boolean().optional().default(false),
  shiftCount: z.union([z.string(), z.number()]).optional().nullable(),
  isDisabilityFriendly: z.boolean().optional().default(false),
  disabilityDescription: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional()
})

// Reschedule Interview Schema (for recruiter)
export const recruiterRescheduleSchema = z.object({
  scheduledAt: z.string().min(1, 'Tanggal dan waktu wajib diisi'),
  duration: z.union([z.string(), z.number()]).optional(),
  meetingUrl: z.string().url().optional().nullable(),
  description: z.string().optional(),
  participantId: z.string().optional() // For individual reschedule
})

// Contract Terminate Schema
export const terminateContractSchema = z.object({
  contractWorkerId: z.string().min(1, 'Contract worker ID wajib diisi'),
  reason: z.string().min(10, 'Alasan pemutusan minimal 10 karakter'),
  effectiveDate: z.string().optional()
})

// Contract Resubmit Schema
export const resubmitContractSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID wajib diisi'),
  workers: z.array(z.object({
    id: z.string(),
    jobTitle: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    salary: z.union([z.string(), z.number()]).optional()
  })).optional(),
  recruiterDocUrl: z.string().optional().nullable()
})
