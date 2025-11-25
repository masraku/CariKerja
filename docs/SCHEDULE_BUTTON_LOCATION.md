# Lokasi Tombol Schedule Interview

## ❌ WRONG PAGE - Job Detail Page

**URL**: `/profile/recruiter/dashboard/jobs/[slug]`

Ini adalah halaman untuk **manage job posting**, bukan untuk manage applications.

---

## ✅ CORRECT PAGE - Applications Page

**URL**: `/profile/recruiter/dashboard/jobs/[slug]/applications`

Ini adalah halaman untuk **lihat semua pelamar** dari satu job.

### Cara Akses:

1. Dari dashboard recruiter
2. Klik job card
3. Klik tab/tombol **"Applications"** atau **"Pelamar"**
4. Atau langsung ke: `http://localhost:3000/profile/recruiter/dashboard/jobs/admin-gudang-1763875864182/applications`

### Tombol Schedule Interview:

- Muncul di **bawah setiap application card**
- Hanya untuk status: **SHORTLISTED**
- Warna: **Indigo/Ungu border**
- Icon: Calendar
- Text: "Schedule Interview"

---

## Cara Test:

### Step 1: Shortlist Aplikasi

1. Buka applications page
2. Pilih aplikasi yang masih PENDING/REVIEWING
3. Klik tombol **"Shortlist"** (warna kuning)
4. Status berubah ke SHORTLISTED

### Step 2: Schedule Interview

1. Setelah status SHORTLISTED
2. Tombol **"Schedule Interview"** akan muncul
3. Klik tombol tersebut
4. Modal muncul dengan form

### Step 3: Isi Form

1. Pilih tanggal & waktu
2. Pilih durasi (30-120 menit)
3. Masukkan Google Meet link
4. (Optional) Tambahkan catatan
5. Klik **"Jadwalkan & Kirim Undangan"**

---

## Troubleshooting

### "Tombol tidak muncul"

- ✅ Pastikan di halaman `/applications` (bukan job detail)
- ✅ Pastikan application sudah di-SHORTLIST
- ✅ Refresh browser (Cmd+Shift+R)

### "Modal tidak muncul"

- Check browser console untuk errors
- Pastikan SweetAlert2 loaded
- Hard refresh

### "Button disabled"

- Tombol "Accept" memang disabled sampai interview selesai
- Tombol "Schedule Interview" hanya untuk SHORTLISTED

---

## Quick Links

Ganti `admin-gudang-1763875864182` dengan job slug Anda:

- Applications page: `http://localhost:3000/profile/recruiter/dashboard/jobs/admin-gudang-1763875864182/applications`
- Job detail: `http://localhost:3000/profile/recruiter/dashboard/jobs/admin-gudang-1763875864182`

**TIP**: Lihat URL browser Anda. Jika tidak ada `/applications` di akhir, Anda belum di halaman yang benar!
