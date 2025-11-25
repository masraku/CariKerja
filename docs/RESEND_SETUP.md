# Environment Variables for Resend Email Service

Add these variables to your `.env.local` file:

```bash
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# From email address (must be verified domain in Resend)
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions:

1. **Get Resend API Key**:

   - Go to https://resend.com
   - Sign up/Login
   - Navigate to API Keys
   - Create new API key
   - Copy the key and add to `.env.local`

2. **Verify Domain** (for production):

   - In Resend dashboard, add your domain
   - Add DNS records as instructed
   - Use verified email as `RESEND_FROM_EMAIL`

3. **For Development**:
   - You can use Resend's testing domain: `onboarding@resend.dev`
   - Emails will be limited but functional for testing
