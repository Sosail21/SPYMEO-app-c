/**
 * Email queue system for SPYMEO
 * Handles rate limiting, retries, and background processing
 */

import { resend, isEmailEnabled, logEmailInsteadOfSending } from './client';
import { EMAIL_CONFIG } from './config';

export interface EmailJob {
  id: string;
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
  }>;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  scheduledFor?: Date;
  lastError?: string;
}

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalSent: number;
}

class EmailQueue {
  private queue: EmailJob[] = [];
  private processing: Set<string> = new Set();
  private completed: Map<string, Date> = new Map();
  private failed: Map<string, string> = new Map();
  private isProcessing = false;
  private lastSendTime = 0;
  private sendCount = { second: 0, minute: 0, hour: 0 };
  private timeWindowStart = { second: 0, minute: 0, hour: 0 };

  /**
   * Add an email to the queue
   */
  async enqueue(emailData: Omit<EmailJob, 'id' | 'attempts' | 'maxAttempts' | 'createdAt'>): Promise<string> {
    const job: EmailJob = {
      ...emailData,
      id: this.generateId(),
      attempts: 0,
      maxAttempts: EMAIL_CONFIG.retry.maxAttempts,
      createdAt: new Date(),
    };

    this.queue.push(job);
    console.log(`📬 Email queued: ${job.id} - To: ${job.to} - Subject: ${job.subject}`);

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return job.id;
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      // Check rate limits
      await this.checkRateLimits();

      // Get next job that's ready to send
      const jobIndex = this.queue.findIndex(
        (job) =>
          !this.processing.has(job.id) &&
          (!job.scheduledFor || job.scheduledFor <= new Date())
      );

      if (jobIndex === -1) {
        // No jobs ready, wait a bit and check again
        await this.sleep(100);
        continue;
      }

      const job = this.queue[jobIndex];
      this.queue.splice(jobIndex, 1);
      this.processing.add(job.id);

      // Process the job
      await this.processJob(job);
    }

    this.isProcessing = false;
  }

  /**
   * Process a single email job
   */
  private async processJob(job: EmailJob): Promise<void> {
    job.attempts++;

    try {
      // Check if email sending is enabled
      if (!isEmailEnabled()) {
        logEmailInsteadOfSending(job);
        this.markCompleted(job.id);
        return;
      }

      // Send the email
      const result = await resend.emails.send({
        to: job.to,
        from: job.from,
        subject: job.subject,
        html: job.html,
        text: job.text,
        replyTo: job.replyTo,
        tags: job.tags,
        headers: job.headers,
        attachments: job.attachments,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log(`✅ Email sent successfully: ${job.id} - Resend ID: ${result.data?.id}`);
      this.markCompleted(job.id);
      this.updateSendCount();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Email failed: ${job.id} - Attempt ${job.attempts}/${job.maxAttempts}`, errorMessage);

      job.lastError = errorMessage;

      // Retry if we haven't exceeded max attempts
      if (job.attempts < job.maxAttempts) {
        const backoff = this.calculateBackoff(job.attempts);
        job.scheduledFor = new Date(Date.now() + backoff);

        console.log(`🔄 Retrying email ${job.id} in ${backoff}ms`);
        this.queue.push(job);
        this.processing.delete(job.id);
      } else {
        // Max attempts reached, mark as failed
        console.error(`💥 Email permanently failed: ${job.id}`);
        this.markFailed(job.id, errorMessage);
      }
    }
  }

  /**
   * Check and enforce rate limits
   */
  private async checkRateLimits(): Promise<void> {
    const now = Date.now();

    // Reset counters if time windows have passed
    if (now - this.timeWindowStart.second >= 1000) {
      this.sendCount.second = 0;
      this.timeWindowStart.second = now;
    }
    if (now - this.timeWindowStart.minute >= 60000) {
      this.sendCount.minute = 0;
      this.timeWindowStart.minute = now;
    }
    if (now - this.timeWindowStart.hour >= 3600000) {
      this.sendCount.hour = 0;
      this.timeWindowStart.hour = now;
    }

    // Check if we've hit any rate limits
    if (this.sendCount.second >= EMAIL_CONFIG.rateLimit.maxPerSecond) {
      const waitTime = 1000 - (now - this.timeWindowStart.second);
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached (per second), waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }

    if (this.sendCount.minute >= EMAIL_CONFIG.rateLimit.maxPerMinute) {
      const waitTime = 60000 - (now - this.timeWindowStart.minute);
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached (per minute), waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }

    if (this.sendCount.hour >= EMAIL_CONFIG.rateLimit.maxPerHour) {
      const waitTime = 3600000 - (now - this.timeWindowStart.hour);
      if (waitTime > 0) {
        console.log(`⏳ Rate limit reached (per hour), waiting ${waitTime}ms`);
        await this.sleep(waitTime);
      }
    }
  }

  /**
   * Update send count for rate limiting
   */
  private updateSendCount(): void {
    this.sendCount.second++;
    this.sendCount.minute++;
    this.sendCount.hour++;
    this.lastSendTime = Date.now();
  }

  /**
   * Calculate exponential backoff for retries
   */
  private calculateBackoff(attempt: number): number {
    const backoff = Math.min(
      EMAIL_CONFIG.retry.backoffMs * Math.pow(2, attempt - 1),
      EMAIL_CONFIG.retry.maxBackoffMs
    );
    // Add jitter to prevent thundering herd
    return backoff + Math.random() * 1000;
  }

  /**
   * Mark job as completed
   */
  private markCompleted(jobId: string): void {
    this.processing.delete(jobId);
    this.completed.set(jobId, new Date());
  }

  /**
   * Mark job as failed
   */
  private markFailed(jobId: string, error: string): void {
    this.processing.delete(jobId);
    this.failed.set(jobId, error);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return {
      pending: this.queue.length,
      processing: this.processing.size,
      completed: this.completed.size,
      failed: this.failed.size,
      totalSent: this.completed.size,
    };
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): 'pending' | 'processing' | 'completed' | 'failed' | 'not_found' {
    if (this.processing.has(jobId)) return 'processing';
    if (this.completed.has(jobId)) return 'completed';
    if (this.failed.has(jobId)) return 'failed';
    if (this.queue.some((job) => job.id === jobId)) return 'pending';
    return 'not_found';
  }

  /**
   * Clear completed and failed jobs older than specified time
   */
  cleanup(olderThanMs = 3600000): void {
    const cutoff = Date.now() - olderThanMs;

    // Clear old completed jobs
    for (const [id, completedAt] of this.completed.entries()) {
      if (completedAt.getTime() < cutoff) {
        this.completed.delete(id);
      }
    }

    console.log(`🧹 Cleanup: Removed old jobs`);
  }

  /**
   * Generate unique job ID
   */
  private generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cancel a pending job
   */
  cancelJob(jobId: string): boolean {
    const index = this.queue.findIndex((job) => job.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      console.log(`🚫 Cancelled email job: ${jobId}`);
      return true;
    }
    return false;
  }
}

// Singleton instance
export const emailQueue = new EmailQueue();

// Auto-cleanup every hour
if (typeof window === 'undefined') {
  // Only run on server
  setInterval(() => {
    emailQueue.cleanup();
  }, 3600000); // 1 hour
}
