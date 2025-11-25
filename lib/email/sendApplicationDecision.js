import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendApplicationDecision({
    to,
    jobseekerName,
    jobTitle,
    companyName,
    decision, // 'ACCEPTED' or 'REJECTED'
    message = '',
    nextSteps = ''
}) {
    try {
        const isAccepted = decision === 'ACCEPTED'
        
        const subject = isAccepted 
            ? `🎉 Selamat! Anda Diterima di ${companyName}`
            : `Pemberitahuan Hasil Seleksi - ${jobTitle}`

        const htmlContent = isAccepted ? `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                            <div style="font-size: 48px; margin-bottom: 12px;">🎉</div>
                            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Selamat, ${jobseekerName}!</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0 0; font-size: 16px;">Anda telah diterima</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Kami dengan senang hati memberitahukan bahwa Anda telah <strong>diterima</strong> untuk posisi:
                            </p>

                            <div style="background: #f3f4f6; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 6px;">
                                <div style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 8px;">${jobTitle}</div>
                                <div style="color: #6b7280; font-size: 16px;">
                                    <strong>🏢 ${companyName}</strong>
                                </div>
                            </div>

                            ${message ? `
                            <div style="margin: 24px 0; padding: 16px; background: #ecfdf5; border-radius: 8px; border: 1px solid #d1fae5;">
                                <p style="color: #065f46; margin: 0; font-size: 14px; line-height: 1.5;">
                                    <strong>📝 Pesan dari Recruiter:</strong><br/>
                                    ${message}
                                </p>
                            </div>
                            ` : ''}

                            ${nextSteps ? `
                            <div style="margin: 24px 0;">
                                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Langkah Selanjutnya:</h3>
                                <p style="color: #4b5563; margin: 0; line-height: 1.6;">${nextSteps}</p>
                            </div>
                            ` : `
                            <div style="margin: 24px 0;">
                                <h3 style="color: #1f2937; font-size: 18px; margin: 0 0 12px 0;">Langkah Selanjutnya:</h3>
                                <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                                    Tim ${companyName} akan segera menghubungi Anda untuk informasi lebih lanjut mengenai proses onboarding dan detail pekerjaan.
                                </p>
                            </div>
                            `}

                            <div style="margin: 32px 0 0 0; padding: 20px; background: #fef3c7; border-radius: 8px; border: 1px solid #fde68a;">
                                <p style="color: #78350f; margin: 0; font-size: 14px; text-align: center;">
                                    <strong>⏰ Penting:</strong> Harap segera konfirmasi kehadiran dan persiapkan dokumen yang diperlukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                Terima kasih telah menggunakan <strong>JobSeeker</strong>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                Platform pencarian kerja terpercaya di Indonesia
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ` : `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0;">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Pemberitahuan Hasil Seleksi</h1>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 12px 0 0 0; font-size: 16px;">${companyName}</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Halo <strong>${jobseekerName}</strong>,
                            </p>

                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Terima kasih atas waktu dan minat Anda untuk bergabung dengan kami di posisi:
                            </p>

                            <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; border-radius: 6px;">
                                <div style="color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 8px;">${jobTitle}</div>
                                <div style="color: #6b7280; font-size: 16px;">
                                    <strong>🏢 ${companyName}</strong>
                                </div>
                            </div>

                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                                Setelah melalui proses seleksi yang mendalam, kami informasikan bahwa saat ini kami memutuskan untuk tidak melanjutkan proses perekrutan Anda untuk posisi ini.
                            </p>

                            ${message ? `
                            <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
                                    <strong>📝 Catatan:</strong><br/>
                                    ${message}
                                </p>
                            </div>
                            ` : ''}

                            <div style="margin: 32px 0; padding: 20px; background: #dbeafe; border-radius: 8px; border: 1px solid #bfdbfe;">
                                <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
                                    <strong>💡 Jangan berkecil hati!</strong><br/>
                                    Kami menghargai usaha Anda dan mendorong Anda untuk terus mencari peluang lain. Kualifikasi dan pengalaman Anda sangat berharga, dan kami yakin ada peluang yang tepat untuk Anda.
                                </p>
                            </div>

                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                                Kami menghargai minat Anda dan mengucapkan terima kasih atas waktu yang telah Anda luangkan. Kami berharap dapat bertemu dengan Anda di kesempatan yang lain.
                            </p>

                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0;">
                                Salam hangat,<br/>
                                <strong>Tim ${companyName}</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                                Terima kasih telah menggunakan <strong>JobSeeker</strong>
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                                Tetap semangat dalam pencarian kerja Anda! 💪
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'JobSeeker <noreply@jobseeker.com>',
            to,
            subject,
            html: htmlContent
        })

        if (error) {
            console.error('❌ Error sending application decision email:', error)
            return { success: false, error }
        }

        console.log(`✅ Application decision email sent to ${to} (${decision})`)
        return { success: true, data }

    } catch (error) {
        console.error('❌ Error in sendApplicationDecision:', error)
        return { success: false, error: error.message }
    }
}
