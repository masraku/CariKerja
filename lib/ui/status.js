export const applicationStatusMeta = {
  PENDING: { label: 'Menunggu', variant: 'warning' },
  REVIEWING: { label: 'Ditinjau', variant: 'info' },
  SHORTLISTED: { label: 'Shortlist', variant: 'info' },
  INTERVIEW_SCHEDULED: { label: 'Interview', variant: 'info' },
  INTERVIEW_COMPLETED: { label: 'Interview Selesai', variant: 'success' },
  ACCEPTED: { label: 'Diterima', variant: 'success' },
  REJECTED: { label: 'Ditolak', variant: 'destructive' },
  WITHDRAWN: { label: 'Dibatalkan', variant: 'muted' },
  RESIGNED: { label: 'Selesai', variant: 'muted' }
}

export const jobStatusMeta = {
  PENDING: { label: 'Menunggu Review', variant: 'warning' },
  ACTIVE: { label: 'Aktif', variant: 'success' },
  REJECTED: { label: 'Ditolak', variant: 'destructive' },
  CLOSED: { label: 'Ditutup', variant: 'muted' }
}

export const contractStatusMeta = {
  PENDING: { label: 'Menunggu', variant: 'warning' },
  APPROVED: { label: 'Disetujui', variant: 'success' },
  REJECTED: { label: 'Ditolak', variant: 'destructive' },
  ACTIVE: { label: 'Aktif', variant: 'success' },
  COMPLETED: { label: 'Selesai', variant: 'muted' },
  TERMINATED: { label: 'Dihentikan', variant: 'destructive' }
}

export function getStatusMeta(status, map = applicationStatusMeta) {
  return map[status] || { label: status || 'Tidak diketahui', variant: 'muted' }
}
