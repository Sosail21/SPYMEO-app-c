/**
 * Unit tests for email service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as EmailService from '@/lib/services/email-service';
import { emailQueue } from '@/lib/email/queue';

// Mock the email queue
vi.mock('@/lib/email/queue', () => ({
  emailQueue: {
    enqueue: vi.fn(),
    getStats: vi.fn(),
    getJobStatus: vi.fn(),
  },
}));

// Mock React Email render
vi.mock('@react-email/components', () => ({
  render: vi.fn((component) => '<html>Mocked email</html>'),
}));

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(emailQueue.enqueue).mockResolvedValue('job_123');
  });

  describe('sendWelcomeEmail', () => {
    it('should queue welcome email with correct data', async () => {
      const user = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'FREE_USER',
      };

      const jobId = await EmailService.sendWelcomeEmail(user);

      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('Bienvenue'),
          html: expect.any(String),
          tags: expect.arrayContaining([
            { name: 'category', value: 'transactional' },
            { name: 'template', value: 'welcome' },
          ]),
        })
      );
      expect(jobId).toBe('job_123');
    });
  });

  describe('sendPasswordReset', () => {
    it('should queue password reset email with token', async () => {
      const user = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      };
      const resetToken = 'abc123';

      await EmailService.sendPasswordReset(user, resetToken);

      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('Réinitialisation'),
          html: expect.any(String),
        })
      );
    });

    it('should use custom expiry time', async () => {
      const user = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      await EmailService.sendPasswordReset(user, 'token', '2 heures');

      expect(emailQueue.enqueue).toHaveBeenCalled();
    });
  });

  describe('sendAppointmentConfirmation', () => {
    it('should queue appointment confirmation email', async () => {
      const user = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const appointment = {
        id: 'apt1',
        practitionerName: 'Dr. Smith',
        date: '15/01/2025',
        time: '14:30',
        duration: '1h',
        type: 'Consultation',
      };

      await EmailService.sendAppointmentConfirmation(user, appointment);

      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('Dr. Smith'),
          tags: expect.arrayContaining([
            { name: 'appointment_id', value: 'apt1' },
          ]),
        })
      );
    });
  });

  describe('sendPassActivation', () => {
    it('should queue PASS activation email', async () => {
      const user = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const plan = {
        name: 'PASS Premium',
        price: '39,90€',
        startDate: '01/01/2025',
        renewalDate: '01/02/2025',
        benefits: ['Benefit 1', 'Benefit 2'],
      };

      await EmailService.sendPassActivation(user, plan);

      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('PASS Premium'),
          tags: expect.arrayContaining([
            { name: 'plan', value: 'PASS Premium' },
          ]),
        })
      );
    });
  });

  describe('sendInvoice', () => {
    it('should queue invoice email', async () => {
      const user = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const invoice = {
        number: 'INV-001',
        date: '01/01/2025',
        dueDate: '31/01/2025',
        amount: '39,90€',
        items: [
          {
            description: 'Service',
            quantity: 1,
            unitPrice: '39,90€',
            total: '39,90€',
          },
        ],
        downloadUrl: 'https://example.com/invoice.pdf',
      };

      await EmailService.sendInvoice(user, invoice);

      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('INV-001'),
          tags: expect.arrayContaining([
            { name: 'invoice_number', value: 'INV-001' },
          ]),
        })
      );
    });
  });

  describe('sendMessageNotification', () => {
    it('should queue message notification email', async () => {
      const recipient = {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
      };

      const message = {
        id: 'msg1',
        senderName: 'Jane Smith',
        preview: 'Hello...',
        conversationId: 'conv1',
        sentAt: '5 min ago',
      };

      await EmailService.sendMessageNotification(recipient, message);

      expect(emailQueue.enqueue).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'john@example.com',
          subject: expect.stringContaining('Jane Smith'),
          tags: expect.arrayContaining([
            { name: 'conversation_id', value: 'conv1' },
          ]),
        })
      );
    });
  });

  describe('canSendEmail', () => {
    it('should allow system emails always', () => {
      const user = {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        emailPreferences: { messages: false },
      };

      expect(EmailService.canSendEmail(user, 'system')).toBe(true);
    });

    it('should respect user preferences', () => {
      const user = {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        emailPreferences: { messages: false },
      };

      expect(EmailService.canSendEmail(user, 'messages')).toBe(false);
    });

    it('should default to enabled if no preferences', () => {
      const user = {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
      };

      expect(EmailService.canSendEmail(user, 'messages')).toBe(true);
    });
  });

  describe('getEmailStats', () => {
    it('should return queue statistics', () => {
      const mockStats = {
        pending: 5,
        processing: 2,
        completed: 100,
        failed: 1,
        totalSent: 100,
      };

      vi.mocked(emailQueue.getStats).mockReturnValue(mockStats);

      const stats = EmailService.getEmailStats();

      expect(stats).toEqual(mockStats);
      expect(emailQueue.getStats).toHaveBeenCalled();
    });
  });

  describe('getEmailJobStatus', () => {
    it('should return job status', () => {
      vi.mocked(emailQueue.getJobStatus).mockReturnValue('completed');

      const status = EmailService.getEmailJobStatus('job_123');

      expect(status).toBe('completed');
      expect(emailQueue.getJobStatus).toHaveBeenCalledWith('job_123');
    });
  });
});
