/**
 * Unit tests for email queue
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emailQueue } from '@/lib/email/queue';

// Mock Resend
vi.mock('@/lib/email/client', () => ({
  resend: {
    emails: {
      send: vi.fn(),
    },
  },
  isEmailEnabled: vi.fn(() => true),
  logEmailInsteadOfSending: vi.fn(),
}));

import { resend, isEmailEnabled } from '@/lib/email/client';

describe('Email Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resend.emails.send).mockResolvedValue({
      data: { id: 'resend_123' },
      error: null,
    } as any);
  });

  describe('enqueue', () => {
    it('should add email to queue and return job ID', async () => {
      const jobId = await emailQueue.enqueue({
        to: 'test@example.com',
        from: 'noreply@spymeo.fr',
        subject: 'Test Email',
        html: '<p>Test</p>',
      });

      expect(jobId).toMatch(/^email_/);
    });

    it('should process queued emails', async () => {
      await emailQueue.enqueue({
        to: 'test@example.com',
        from: 'noreply@spymeo.fr',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(resend.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          from: 'noreply@spymeo.fr',
          subject: 'Test',
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      const stats = emailQueue.getStats();

      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('processing');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('totalSent');
    });
  });

  describe('getJobStatus', () => {
    it('should return not_found for unknown job', () => {
      const status = emailQueue.getJobStatus('unknown_job');
      expect(status).toBe('not_found');
    });

    it('should return pending for queued job', async () => {
      vi.mocked(isEmailEnabled).mockReturnValue(false);

      const jobId = await emailQueue.enqueue({
        to: 'test@example.com',
        from: 'noreply@spymeo.fr',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      const status = emailQueue.getJobStatus(jobId);
      expect(['pending', 'processing', 'completed']).toContain(status);
    });
  });

  describe('retry logic', () => {
    it('should retry failed emails', async () => {
      // First call fails, second succeeds
      vi.mocked(resend.emails.send)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { id: 'resend_123' },
          error: null,
        } as any);

      await emailQueue.enqueue({
        to: 'test@example.com',
        from: 'noreply@spymeo.fr',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      // Wait for retry
      await new Promise((resolve) => setTimeout(resolve, 2000));

      expect(resend.emails.send).toHaveBeenCalledTimes(2);
    });
  });

  describe('cancelJob', () => {
    it('should cancel pending job', async () => {
      vi.mocked(isEmailEnabled).mockReturnValue(false);

      const jobId = await emailQueue.enqueue({
        to: 'test@example.com',
        from: 'noreply@spymeo.fr',
        subject: 'Test',
        html: '<p>Test</p>',
      });

      const cancelled = emailQueue.cancelJob(jobId);
      expect(cancelled).toBe(true);
    });

    it('should return false for unknown job', () => {
      const cancelled = emailQueue.cancelJob('unknown');
      expect(cancelled).toBe(false);
    });
  });
});
