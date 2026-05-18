import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInterviewInvitation({
    to,
    jobseekerName,
    jobTitle,
    companyName,
    scheduledAt,
    duration,
    meetingType,
    location,
    description,
    interviewId
}) {
    try {
        const scheduledDate = new Date(scheduledAt)
        const formattedDate = scheduledDate.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Jakarta'
        })
        const formattedTime = scheduledDate.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        })

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const detailUrl = `${appUrl}/profile/jobseeker/interviews/${interviewId}`
        const isInPerson = meetingType === 'IN_PERSON'

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
        .info-box { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { display: flex; margin: 10px 0; }
        .info-label { font-weight: bold; min-width: 120px; color: #6b7280; }
        .info-value { color: #111827; }
        .button { display: inline-block; padding: 12px 30px; margin: 10px 5px; text-decoration: none; border-radius: 8px; font-weight: bold; text-align: center; }
        .btn-accept { background: #10b981; color: white; }
        .btn-decline { background: #ef4444; color: white; }
        .btn-accept:hover { background: #059669; }
        .btn-decline:hover { background: #dc2626; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .meeting-link { background: #dbeafe; border-left: 4px solid #2563EB; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .meeting-link a { color: #2563EB; font-weight: bold; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🎯 Undangan Interview</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Selamat! Anda diundang untuk interview</p>
        </div>
        
        <div class="content">
            <p>Halo <strong>${jobseekerName}</strong>,</p>
            
            <p>Selamat! Anda telah dipilih untuk melanjutkan ke tahap interview untuk posisi <strong>${jobTitle}</strong> di <strong>${companyName}</strong>.</p>
            
            <div class="info-box">
                <h3 style="margin-top: 0; color: #1f2937;">📅 Detail Interview</h3>
                <div class="info-row">
                    <div class="info-label">Tanggal:</div>
                    <div class="info-value">${formattedDate}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Waktu:</div>
                    <div class="info-value">${formattedTime} WIB</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Durasi:</div>
                    <div class="info-value">${duration} menit</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Tipe:</div>
                    <div class="info-value">${isInPerson ? 'Tatap muka' : 'Online'}</div>
                </div>
            </div>

            ${description ? `
            <div style="margin: 20px 0;">
                <h4 style="color: #1f2937; margin-bottom: 10px;">📝 Catatan dari Recruiter:</h4>
                <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    ${description.replace(/\n/g, '<br>')}
                </p>
            </div>
            ` : ''}

            <div class="meeting-link">
                <strong>${isInPerson ? '📍 Lokasi Interview:' : '🔗 Room Interview:'}</strong><br>
                ${isInPerson ? location : `<a href="${detailUrl}" target="_blank">Buka detail interview</a>`}
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
                    <em>${isInPerson ? 'Silakan hadir sesuai lokasi dan jadwal.' : 'Anda dapat bergabung melalui room internal 15 menit sebelum waktu yang ditentukan.'}</em>
                </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="font-weight: bold; margin-bottom: 15px;">Mohon konfirmasi kehadiran Anda:</p>
                <a href="${detailUrl}" class="button btn-accept">✓ Buka Detail Interview</a>
            </div>

            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                    <strong>Tips:</strong> Pastikan Anda sudah menyiapkan:
                </p>
                <ul style="margin: 10px 0; padding-left: 20px; color: #6b7280; font-size: 14px;">
                    <li>Koneksi internet yang stabil</li>
                    <li>Webcam dan microphone yang berfungsi</li>
                    <li>Ruangan yang tenang dan pencahayaan yang baik</li>
                    <li>CV dan dokumen pendukung lainnya</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>Email ini dikirim secara otomatis dari sistem JobSeeker.</p>
            <p>Jika Anda memiliki pertanyaan, silakan reply email ini.</p>
            <p style="margin-top: 20px;">
                <a href="${appUrl}/profile/jobseeker/interviews" style="color: #2563EB;">
                    Lihat Semua Interview Saya
                </a>
            </p>
        </div>
    </div>
</body>
</html>
        `

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'noreply@jobseeker.com',
            to: [to],
            subject: `🎯 Undangan Interview - ${jobTitle} di ${companyName}`,
            html: htmlContent
        })

        if (error) {
            throw new Error(error.message)
        }
        return { success: true, data }

    } catch (error) {
        throw error
    }
}
