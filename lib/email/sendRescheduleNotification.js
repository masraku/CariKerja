import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRescheduleNotification({
  to,
  candidateName,
  jobTitle,
  companyName,
  oldScheduledAt,
  newScheduledAt,
  duration,
  meetingUrl,
  description,
  interviewId
}) {
  try {
    const oldDate = new Date(oldScheduledAt)
    const newDate = new Date(newScheduledAt)
    
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta'
      }).format(date)
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'JobSeeker <noreply@jobseeker.com>',
      to: [to],
      subject: `⚠️ Interview Rescheduled: ${jobTitle} - ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Rescheduled</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">⚠️ Interview Rescheduled</h1>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 30px 40px 20px 40px;">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Hi <strong>${candidateName}</strong>,
                      </p>
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333;">
                        Your interview schedule has been updated. Please note the new date and time below:
                      </p>
                    </td>
                  </tr>

                  <!-- Job Info -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px;">
                        <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #92400e;">
                          ${jobTitle}
                        </h2>
                        <p style="margin: 0; font-size: 16px; color: #78350f;">
                          <strong>${companyName}</strong>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Schedule Comparison -->
                  <tr>
                    <td style="padding: 0 40px 20px 40px;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="width: 50%; padding: 15px; background-color: #fee2e2; border-radius: 8px; vertical-align: top;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #991b1b; font-weight: bold;">Previous Schedule</p>
                            <p style="margin: 0; font-size: 14px; color: #7f1d1d; text-decoration: line-through;">
                              ${formatDate(oldDate)}
                            </p>
                          </td>
                          <td style="width: 50%; padding: 15px; background-color: #d1fae5; border-radius: 8px; vertical-align: top;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #065f46; font-weight: bold;">New Schedule</p>
                            <p style="margin: 0; font-size: 14px; color: #064e3b; font-weight: bold;">
                              ${formatDate(newDate)}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Interview Details -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1f2937;">Interview Details</h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; width: 30%; vertical-align: top;">
                              <strong style="color: #4b5563;">Duration:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${duration} minutes
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #4b5563;">Meeting Link:</strong>
                            </td>
                            <td style="padding: 8px 0;">
                              <a href="${meetingUrl}" style="color: #2563eb; text-decoration: none; word-break: break-all;">
                                ${meetingUrl}
                              </a>
                            </td>
                          </tr>
                          ${description ? `
                          <tr>
                            <td style="padding: 8px 0; vertical-align: top;">
                              <strong style="color: #4b5563;">Description:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1f2937;">
                              ${description}
                            </td>
                          </tr>
                          ` : ''}
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- CTA Button -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px; text-align: center;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile/jobseeker/interviews/${interviewId}" 
                         style="display: inline-block; padding: 14px 32px; background-color: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        View Interview Details
                      </a>
                    </td>
                  </tr>

                  <!-- Important Note -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #fef3c7; border-radius: 8px; padding: 15px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; font-size: 14px; color: #78350f;">
                          <strong>⚠️ Important:</strong> Please update your calendar with the new schedule. If you have any conflicts with the new time, please contact the recruiter as soon as possible.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                        Best regards,<br>
                        <strong>${companyName} Recruitment Team</strong>
                      </p>
                      <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af;">
                        This is an automated notification from JobSeeker platform. Please do not reply to this email.
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
    })

    if (error) {
      console.error('Resend API error:', error)
      throw error
    }

    console.log('✅ Reschedule notification sent to:', to)
    return { success: true, data }

  } catch (error) {
    console.error('❌ Send reschedule notification error:', error)
    throw error
  }
}
