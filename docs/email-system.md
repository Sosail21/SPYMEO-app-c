# SPYMEO Email System Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Email Templates](#email-templates)
5. [Sending Emails](#sending-emails)
6. [Email Queue](#email-queue)
7. [Email Preferences](#email-preferences)
8. [Testing](#testing)
9. [API Reference](#api-reference)
10. [Troubleshooting](#troubleshooting)

---

## Overview

SPYMEO uses **Resend** for transactional email delivery and **React Email** for beautiful, responsive email templates. The system includes:

- 11 pre-built email templates
- Queue system with rate limiting and retries
- User email preferences
- API endpoints for sending and previewing emails
- Integration helpers for common flows
- Comprehensive testing suite

### Features

- ✅ Beautiful, responsive HTML emails
- ✅ Automatic rate limiting (100 emails/second)
- ✅ Retry logic with exponential backoff
- ✅ Email preferences per user
- ✅ Queue system for background processing
- ✅ Template previews in browser
- ✅ TypeScript type safety
- ✅ Comprehensive error handling

---

## Architecture

```
┌─────────────────┐
│  Application    │
│  (API Routes,   │
│   Services)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email Service  │
│  Layer          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Email Queue    │
│  (Rate Limit +  │
│   Retry Logic)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Resend API     │
│  (Email         │
│   Delivery)     │
└─────────────────┘
```

### Directory Structure

```
spymeo/
├── emails/                          # React Email templates
│   ├── components/
│   │   ├── EmailLayout.tsx         # Base layout
│   │   └── Button.tsx              # Button component
│   ├── WelcomeEmail.tsx
│   ├── PasswordResetEmail.tsx
│   ├── AppointmentConfirmation.tsx
│   ├── AppointmentReminder.tsx
│   ├── PassActivated.tsx
│   ├── PassRenewal.tsx
│   ├── CarnetShipped.tsx
│   ├── InvoiceEmail.tsx
│   ├── MessageNotification.tsx
│   ├── BlogSubmissionStatus.tsx
│   └── ArticlePublished.tsx
│
├── src/
│   ├── lib/
│   │   ├── email/
│   │   │   ├── client.ts           # Resend client
│   │   │   ├── config.ts           # Email config
│   │   │   └── queue.ts            # Queue system
│   │   ├── services/
│   │   │   └── email-service.ts    # High-level API
│   │   └── integrations/
│   │       └── email-integrations.ts # Integration examples
│   │
│   └── app/
│       ├── api/
│       │   ├── email/
│       │   │   ├── send/route.ts
│       │   │   └── preview/[template]/route.ts
│       │   └── account/
│       │       └── email-preferences/route.ts
│       └── user/
│           └── email-preferences/page.tsx
│
├── scripts/
│   └── preview-emails.ts            # Local preview server
│
└── tests/
    └── unit/
        └── lib/
            ├── services/
            │   └── email-service.test.ts
            └── email/
                └── queue.test.ts
```

---

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```env
# Resend API Key (get from https://resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Disable email sending (for testing)
DISABLE_EMAIL_SENDING=false
```

### 2. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key to your `.env.local`

### 3. Configure Domain (Production)

For production, you need to verify your domain:

1. Go to Resend dashboard → **Domains**
2. Add your domain (e.g., `spymeo.fr`)
3. Add the provided DNS records to your domain
4. Wait for verification (usually a few minutes)
5. Update sender emails in `src/lib/email/config.ts`

### 4. Install Dependencies

Already installed via npm:

```bash
npm install resend @react-email/components react-email
```

---

## Email Templates

### Available Templates

| Template | Purpose | Trigger |
|----------|---------|---------|
| `WelcomeEmail` | Welcome new users | User signup |
| `PasswordResetEmail` | Password reset | Password reset request |
| `AppointmentConfirmation` | Confirm appointment | Appointment booked |
| `AppointmentReminder` | Remind about appointment | 24h before appointment |
| `PassActivated` | PASS subscription activated | Stripe payment success |
| `PassRenewal` | PASS renewal reminder | 7 days before renewal |
| `CarnetShipped` | Carnet shipment tracking | Carnet shipped |
| `InvoiceEmail` | Send invoice | Invoice generated |
| `MessageNotification` | New message received | Message sent |
| `BlogSubmissionStatus` | Blog article moderated | Article approved/rejected |
| `ArticlePublished` | Article published | Article goes live |

### Creating New Templates

1. Create a new file in `/emails/`:

```tsx
import { Heading, Text, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { Button } from './components/Button';

interface MyEmailProps {
  userName: string;
  // ... other props
}

export const MyEmail = ({ userName }: MyEmailProps) => {
  return (
    <EmailLayout preview="Preview text">
      <Heading>Hello {userName}!</Heading>
      <Text>Email content here...</Text>
      <Button href="https://spymeo.fr">Click me</Button>
    </EmailLayout>
  );
};

export default MyEmail;
```

2. Add to email service (`src/lib/services/email-service.ts`):

```ts
import MyEmail from '../../../emails/MyEmail';

export async function sendMyEmail(user: User, data: any) {
  const html = render(MyEmail({ userName: user.name, ...data }));

  return emailQueue.enqueue({
    to: user.email,
    from: getFromEmail('default'),
    subject: 'Your subject',
    html,
  });
}
```

### Styling Guidelines

- Use inline styles (required for email clients)
- Use the provided color palette from `config.ts`
- Keep max-width at 600px
- Test on multiple email clients
- Use web-safe fonts

---

## Sending Emails

### High-Level API (Recommended)

Use the email service for type-safe, validated sending:

```ts
import * as EmailService from '@/lib/services/email-service';

// Welcome email
await EmailService.sendWelcomeEmail({
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'PRACTITIONER',
});

// Appointment confirmation
await EmailService.sendAppointmentConfirmation(user, {
  id: 'apt1',
  practitionerName: 'Dr. Smith',
  date: '15 janvier 2025',
  time: '14h30',
  duration: '1 heure',
  location: '123 rue de Paris',
  type: 'Consultation',
});

// PASS activation
await EmailService.sendPassActivation(user, {
  name: 'PASS Premium',
  price: '39,90€/mois',
  startDate: '1er janvier 2025',
  renewalDate: '1er février 2025',
  benefits: ['Benefit 1', 'Benefit 2'],
});
```

### Low-Level API

Direct queue access:

```ts
import { emailQueue } from '@/lib/email/queue';
import { render } from '@react-email/components';
import MyEmail from '@/emails/MyEmail';

const html = render(MyEmail({ userName: 'John' }));

await emailQueue.enqueue({
  to: 'john@example.com',
  from: 'noreply@spymeo.fr',
  subject: 'Subject',
  html,
  replyTo: 'support@spymeo.fr',
  tags: [{ name: 'category', value: 'transactional' }],
});
```

### Via API Endpoint

```ts
// From client-side or server
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome',
    user: {
      id: 'u1',
      name: 'John',
      email: 'john@example.com',
    },
    data: {},
  }),
});

const { jobId } = await response.json();
```

---

## Email Queue

### Features

- **Rate Limiting**: Respects Resend limits (100/sec, 1000/min, 10000/hour)
- **Retry Logic**: Exponential backoff with jitter
- **Scheduled Sending**: Delay emails (e.g., reminders)
- **Background Processing**: Non-blocking queue
- **Job Tracking**: Monitor email status

### Queue Statistics

```ts
import { emailQueue } from '@/lib/email/queue';

const stats = emailQueue.getStats();
// {
//   pending: 5,
//   processing: 2,
//   completed: 100,
//   failed: 1,
//   totalSent: 100
// }
```

### Job Status

```ts
const status = emailQueue.getJobStatus('job_123');
// 'pending' | 'processing' | 'completed' | 'failed' | 'not_found'
```

### Cancel Job

```ts
const cancelled = emailQueue.cancelJob('job_123');
```

### Scheduled Emails

```ts
// Send in 24 hours
const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

await emailQueue.enqueue({
  to: 'user@example.com',
  from: 'noreply@spymeo.fr',
  subject: 'Reminder',
  html: '<p>Remember...</p>',
  scheduledFor,
});
```

---

## Email Preferences

### User Preferences

Users can control which emails they receive:

- `marketing`: Promotions and offers
- `notifications`: General notifications
- `appointments`: Appointment confirmations/reminders
- `messages`: Message notifications
- `passUpdates`: PASS subscription updates
- `blogUpdates`: Blog notifications

**Note**: System emails (password reset, account confirmation) cannot be disabled.

### Check Preferences Before Sending

```ts
import { canSendEmail } from '@/lib/services/email-service';

const user = {
  id: 'u1',
  name: 'John',
  email: 'john@example.com',
  emailPreferences: {
    messages: false,
    appointments: true,
  },
};

if (canSendEmail(user, 'messages')) {
  // Send message notification
}
```

### API Endpoints

```ts
// Get preferences
GET /api/account/email-preferences

// Update preferences
PUT /api/account/email-preferences
Body: {
  marketing: false,
  notifications: true,
  // ...
}

// Unsubscribe from all
POST /api/account/email-preferences/unsubscribe?userId=u1
```

### UI Page

Users can manage preferences at:
```
/user/email-preferences
```

---

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run email tests only
npm run test tests/unit/lib/email
npm run test tests/unit/lib/services/email-service.test.ts

# Watch mode
npm run test:watch
```

### Preview Templates Locally

```bash
# Start preview server
npm run dev
# Then visit: http://localhost:3000/api/email/preview/welcome

# Or use the standalone preview script
ts-node scripts/preview-emails.ts
# Visit: http://localhost:3001
```

Available preview URLs:
- `/api/email/preview/welcome`
- `/api/email/preview/password-reset`
- `/api/email/preview/appointment-confirmation`
- `/api/email/preview/appointment-reminder`
- `/api/email/preview/pass-activated`
- `/api/email/preview/pass-renewal`
- `/api/email/preview/carnet-shipped`
- `/api/email/preview/invoice`
- `/api/email/preview/message-notification`
- `/api/email/preview/blog-status-approved`
- `/api/email/preview/blog-status-rejected`
- `/api/email/preview/article-published`

### Test Email Sending

```bash
# Disable actual sending for tests
ENABLE_EMAIL_IN_TESTS=false npm run test

# Enable for integration tests
ENABLE_EMAIL_IN_TESTS=true npm run test:integration
```

### Manual Testing

Send test email via API:

```bash
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "user": {
      "id": "test",
      "name": "Test User",
      "email": "your-email@example.com"
    },
    "data": {}
  }'
```

---

## API Reference

### Email Service Functions

#### `sendWelcomeEmail(user)`
Send welcome email to new user.

**Parameters:**
- `user.id` (string): User ID
- `user.name` (string): User name
- `user.email` (string): User email
- `user.role` (string, optional): User role

**Returns:** `Promise<string>` - Job ID

#### `sendPasswordReset(user, resetToken, expiresIn?)`
Send password reset email.

**Parameters:**
- `user` (User): User object
- `resetToken` (string): Reset token
- `expiresIn` (string, optional): Expiry time (default: "1 heure")

**Returns:** `Promise<string>` - Job ID

#### `sendAppointmentConfirmation(user, appointment)`
Send appointment confirmation.

**Parameters:**
- `user` (User): User object
- `appointment` (Appointment): Appointment details

**Returns:** `Promise<string>` - Job ID

#### `sendPassActivation(user, plan)`
Send PASS activation email.

**Parameters:**
- `user` (User): User object
- `plan` (PassPlan): Plan details

**Returns:** `Promise<string>` - Job ID

[...and more, see code documentation]

### API Endpoints

#### `POST /api/email/send`
Send an email via the service.

**Request Body:**
```json
{
  "type": "welcome",
  "user": {
    "id": "u1",
    "name": "John",
    "email": "john@example.com"
  },
  "data": {}
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "email_1234567890_abc123",
  "message": "Email queued successfully"
}
```

#### `GET /api/email/send?stats=true`
Get queue statistics.

**Response:**
```json
{
  "pending": 5,
  "processing": 2,
  "completed": 100,
  "failed": 1,
  "totalSent": 100
}
```

#### `GET /api/email/send?jobId=xxx`
Get job status.

**Response:**
```json
{
  "jobId": "email_123",
  "status": "completed"
}
```

#### `GET /api/email/preview/[template]`
Preview email template.

**Response:** HTML email

---

## Troubleshooting

### Emails not sending

1. **Check Resend API key:**
   ```bash
   # Verify key is set
   echo $RESEND_API_KEY
   ```

2. **Check if sending is disabled:**
   ```bash
   # Should not be 'true'
   echo $DISABLE_EMAIL_SENDING
   ```

3. **Check Resend dashboard:**
   - Go to resend.com dashboard
   - Check "Logs" for delivery status
   - Check for any errors

4. **Verify domain (production):**
   - Ensure domain is verified in Resend
   - Check DNS records are correct

### Rate limit errors

The queue automatically handles rate limits. If you see warnings:

```
⏳ Rate limit reached (per second), waiting...
```

This is normal. The queue will wait and retry.

### Template rendering errors

1. **Check React Email syntax:**
   - All components must be imported from `@react-email/components`
   - Use inline styles only

2. **Test template rendering:**
   ```ts
   import { render } from '@react-email/components';
   import MyEmail from './emails/MyEmail';

   const html = render(MyEmail({ userName: 'Test' }));
   console.log(html);
   ```

3. **Preview in browser:**
   Visit `/api/email/preview/[template]`

### Queue not processing

1. **Check logs:**
   ```bash
   # Look for queue processing logs
   📬 Email queued: ...
   ✅ Email sent successfully: ...
   ```

2. **Check queue stats:**
   ```ts
   const stats = emailQueue.getStats();
   console.log(stats);
   ```

3. **Restart application:**
   Sometimes the queue needs a restart after config changes.

### Email in spam

1. **Verify domain:** Ensure SPF, DKIM, DMARC records are set up
2. **Warm up domain:** Start with low volume, gradually increase
3. **Avoid spam triggers:** Check content for spam words
4. **Monitor reputation:** Use Resend analytics

---

## Best Practices

### 1. Always use email preferences

```ts
if (canSendEmail(user, 'messages')) {
  await sendMessageNotification(user, message);
}
```

### 2. Handle errors gracefully

```ts
try {
  await sendWelcomeEmail(user);
} catch (error) {
  console.error('Failed to send email:', error);
  // Don't block user flow
}
```

### 3. Use appropriate sender addresses

```ts
// Billing emails
from: getFromEmail('billing')

// Support emails
from: getFromEmail('support')

// Notifications
from: getFromEmail('notifications')
```

### 4. Add meaningful tags

```ts
tags: [
  { name: 'category', value: 'transactional' },
  { name: 'user_id', value: user.id },
  { name: 'appointment_id', value: appointment.id },
]
```

### 5. Test before deploying

```bash
# Preview all templates
npm run dev
# Visit /api/email/preview/[template]

# Run tests
npm run test
```

### 6. Monitor delivery

- Check Resend dashboard regularly
- Monitor bounce rates
- Track open rates (if analytics enabled)
- Review spam complaints

---

## Next Steps

1. **Configure cron jobs:**
   - Daily appointment reminders
   - Weekly PASS renewal checks
   - Monthly inactive user emails

2. **Add analytics:**
   - Track open rates
   - Track click rates
   - A/B test subject lines

3. **Implement webhooks:**
   - Handle bounces
   - Handle spam complaints
   - Update user preferences

4. **Expand templates:**
   - Order confirmations
   - Shipping updates
   - Review requests

---

## Support

- **Documentation:** This file
- **Resend Docs:** https://resend.com/docs
- **React Email Docs:** https://react.email/docs
- **Issues:** Contact development team

---

**Last Updated:** January 2025
**Version:** 1.0.0
