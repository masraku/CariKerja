# Bug Fix: Interview Schedule API Error

## Problem

Error saat schedule interview: "Failed to schedule interview"

## Root Cause

**Prisma model casing salah** di `/lib/authHelper.js`:

- ❌ `prisma.jobseeker` (lowercase)
- ✅ `prisma.jobSeeker` (camelCase)

## What Was Fixed

### File: `/lib/authHelper.js`

**Line 60**: Changed

```javascript
// BEFORE (WRONG)
const jobseeker = await prisma.jobseeker.findUnique({

// AFTER (CORRECT)
const jobseeker = await prisma.jobSeeker.findUnique({
```

**Line 83-92**: Added validation

```javascript
// BEFORE: Recruiter bisa null
return { user, recruiter };

// AFTER: Validate recruiter exists
if (!recruiter) {
  return { error: "Recruiter profile not found", status: 404 };
}
return { user, recruiter };
```

## Why This Happened

Prisma generates client dengan **PascalCase** untuk model names:

- Schema: `model JobSeeker` → Client: `prisma.jobSeeker`
- Schema: `model Recruiter` → Client: `prisma.recruiter`

JavaScript is **case-sensitive**, jadi `jobseeker` ≠ `jobSeeker`

## Testing

1. **Refresh browser** atau hard reload (Cmd+Shift+R)
2. Coba schedule interview lagi
3. Should work now! ✅

## Expected Behavior After Fix

- ✅ Modal schedule muncul
- ✅ Fill form dan submit
- ✅ Success alert: "Interview Dijadwalkan!"
- ✅ Status application berubah ke `INTERVIEW_SCHEDULED`
- ✅ Email terkirim (jika R esend API configured)
