# Testing Guide - Interview Scheduling System

## Setup Requirements

1. **Dev server running**: `npm run dev`
2. **Database seeded**: Harus ada user recruiter dan jobseeker
3. **Resend API key**: Di `.env.local` (optional untuk email)

---

## Phase 2: Recruiter Schedule Interview

### Test Steps:

1. Login sebagai **Recruiter**
2. Buka job detail → Applications
3. Shortlist satu aplikasi
4. Klik tombol **"Schedule Interview"** (warna indigo)
5. Modal muncul dengan form:
   - Tanggal & waktu
   - Durasi (dropdown)
   - Google Meet link
   - Catatan (optional)
6. Isi semua field
7. Klik **"Jadwalkan & Kirim Undangan"**
8. ✅ Success alert muncul
9. ✅ Application status berubah ke `INTERVIEW_SCHEDULED`

**Expected Result**:

- Modal muncul
- Form validation works
- Interview tersimpan di database
- Email terkirim (jika Resend configured)

---

## Phase 3: Jobseeker Response

### Test Steps:

1. Login sebagai **Jobseeker**
2. Buka **"Interview Saya"** menu (atau `/profile/jobseeker/interviews`)
3. ✅ Lihat interview dashboard dengan:
   - Stats cards (Total, Pending, Confirmed, Declined)
   - Pending invitations (yellow box)
4. Klik **"Saya Akan Hadir"**
5. Confirm di SweetAlert
6. ✅ Status berubah ke "Terkonfirmasi" (hijau)
7. ✅ Join button muncul (disabled jika >15 menit)

**Expected Result**:

- Dashboard loads dengan data benar
- Accept/Decline works
- Status update real-time
- Join button logic benar

---

## Phase 4: Interview Room

### Test Steps (15 Min Before Interview):

1. Pastikan interview sudah di-schedule
2. Ubah `scheduledAt` di database agar 10 menit dari sekarang:
   ```sql
   UPDATE Interview
   SET scheduledAt = NOW() + INTERVAL '10 minutes'
   WHERE id = 'interview-id';
   ```
3. Login sebagai **Jobseeker**
4. Buka interview room: `/interviews/[interview-id]/room`
5. ✅ Lihat countdown timer live
6. ✅ Join button aktif (hijau, animated)
7. Klik **"Join Google Meet Sekarang"**
8. ✅ Redirect ke Google Meet di tab baru
9. ✅ Dialog muncul tanya "Interview selesai?"

**Expected Result**:

- Countdown timer update tiap detik
- Join button enable/disable sesuai timing
- Google Meet opens correctly
- Mark completed works

---

## Quick Test URLs

Setelah dev server running:

### Recruiter:

- Applications list: `http://localhost:3000/profile/recruiter/dashboard/jobs/[job-slug]/applications`
- Schedule interview: Click button di halaman atas

### Jobseeker:

- Interviews dashboard: `http://localhost:3000/profile/jobseeker/interviews`
- Interview room: `http://localhost:3000/interviews/[interview-id]/room`

---

## Troubleshooting

### Modal tidak muncul:

- Check console for errors
- Ensure SweetAlert2 installed
- Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

### API 404:

- Restart dev server
- Check file paths benar: `app/api/...`

### Countdown tidak jalan:

- Check browser console
- Verify `scheduledAt` format benar (ISO string)

### Email tidak terkirim:

- Cek `.env.local` ada `RESEND_API_KEY`
- Check console logs: "📧 Email sent"
- Verify email address valid

---

## Database Check

Cek data di database:

```sql
-- Check interviews
SELECT * FROM "Interview" ORDER BY "scheduledAt" DESC LIMIT 5;

-- Check participants
SELECT * FROM "InterviewParticipant" WHERE status = 'PENDING';

-- Check applications with interview
SELECT a.*, i.scheduledAt
FROM "Application" a
JOIN "InterviewParticipant" ip ON ip.applicationId = a.id
JOIN "Interview" i ON i.id = ip.interviewId
ORDER BY i.scheduledAt DESC;
```

---

## Success Checklist

- [ ] Schedule interview button muncul
- [ ] Modal schedule berfungsi
- [ ] Email terkirim (atau log muncul)
- [ ] Jobseeker dashboard loads
- [ ] Accept/Decline works
- [ ] Interview room countdown jalan
- [ ] Join button enable di waktu yang tepat
- [ ] Google Meet redirect works

**Jika semua ✅, system READY!** 🎉
