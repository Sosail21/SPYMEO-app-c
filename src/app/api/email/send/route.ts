/**
 * API endpoint for sending emails
 * POST /api/email/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as EmailService from '@/lib/services/email-service';

// Request validation schema
const sendEmailSchema = z.object({
  type: z.enum([
    'welcome',
    'password-reset',
    'appointment-confirmation',
    'appointment-reminder',
    'pass-activation',
    'pass-renewal',
    'carnet-shipped',
    'invoice',
    'message-notification',
    'blog-status',
    'article-published',
  ]),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    role: z.string().optional(),
  }),
  data: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { type, user, data } = sendEmailSchema.parse(body);

    let jobId: string;

    // Route to appropriate email service function
    switch (type) {
      case 'welcome':
        jobId = await EmailService.sendWelcomeEmail(user);
        break;

      case 'password-reset':
        if (!data.resetToken) {
          return NextResponse.json(
            { error: 'resetToken is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendPasswordReset(
          user,
          data.resetToken,
          data.expiresIn
        );
        break;

      case 'appointment-confirmation':
        if (!data.appointment) {
          return NextResponse.json(
            { error: 'appointment data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendAppointmentConfirmation(user, data.appointment);
        break;

      case 'appointment-reminder':
        if (!data.appointment) {
          return NextResponse.json(
            { error: 'appointment data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendAppointmentReminder(user, data.appointment);
        break;

      case 'pass-activation':
        if (!data.plan) {
          return NextResponse.json({ error: 'plan data is required' }, { status: 400 });
        }
        jobId = await EmailService.sendPassActivation(user, data.plan);
        break;

      case 'pass-renewal':
        if (!data.plan || !data.daysUntilRenewal) {
          return NextResponse.json(
            { error: 'plan and daysUntilRenewal are required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendPassRenewal(
          user,
          data.plan,
          data.daysUntilRenewal
        );
        break;

      case 'carnet-shipped':
        if (!data.tracking) {
          return NextResponse.json(
            { error: 'tracking data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendCarnetShipped(user, data.tracking);
        break;

      case 'invoice':
        if (!data.invoice) {
          return NextResponse.json(
            { error: 'invoice data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendInvoice(user, data.invoice);
        break;

      case 'message-notification':
        if (!data.message) {
          return NextResponse.json(
            { error: 'message data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendMessageNotification(user, data.message);
        break;

      case 'blog-status':
        if (!data.article) {
          return NextResponse.json(
            { error: 'article data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendBlogStatusUpdate(user, data.article);
        break;

      case 'article-published':
        if (!data.article) {
          return NextResponse.json(
            { error: 'article data is required' },
            { status: 400 }
          );
        }
        jobId = await EmailService.sendArticlePublished(user, data.article);
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Email queued successfully',
    });
  } catch (error) {
    console.error('Email send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

/**
 * Get email queue statistics
 * GET /api/email/send?stats=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Get stats
  if (searchParams.get('stats') === 'true') {
    const stats = EmailService.getEmailStats();
    return NextResponse.json(stats);
  }

  // Get job status
  const jobId = searchParams.get('jobId');
  if (jobId) {
    const status = EmailService.getEmailJobStatus(jobId);
    return NextResponse.json({ jobId, status });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
