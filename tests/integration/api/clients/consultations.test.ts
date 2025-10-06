import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/services/client-service';
import {
  createConsultation,
  getConsultation,
  listConsultations,
  updateConsultation,
  deleteConsultation,
} from '@/lib/services/consultation-service';
import { getPractitionerUser } from '../../../fixtures/users';

describe('Consultation Tests', () => {
  const practitioner = getPractitionerUser();
  let testClientId: string;
  let testConsultationIds: string[] = [];

  beforeEach(async () => {
    // Create a test client
    const client = await createClient(practitioner.id, {
      firstName: 'Test',
      lastName: 'Client',
    });
    testClientId = client.id;
  });

  afterEach(async () => {
    // Cleanup
    if (testConsultationIds.length > 0) {
      await prisma.consultation.deleteMany({
        where: { id: { in: testConsultationIds } },
      });
      testConsultationIds = [];
    }

    if (testClientId) {
      await prisma.client.delete({ where: { id: testClientId } });
    }
  });

  describe('Create Consultation', () => {
    it('should create a consultation with required fields', async () => {
      const consultationData = {
        clientId: testClientId,
        date: new Date('2025-01-15T10:00:00Z'),
      };

      const consultation = await createConsultation(
        practitioner.id,
        consultationData
      );
      testConsultationIds.push(consultation.id);

      expect(consultation).toBeDefined();
      expect(consultation.id).toBeTruthy();
      expect(consultation.clientId).toBe(testClientId);
      expect(consultation.practitionerId).toBe(practitioner.id);
      expect(consultation.date).toEqual(new Date('2025-01-15T10:00:00Z'));
    });

    it('should create a consultation with all fields', async () => {
      const consultationData = {
        clientId: testClientId,
        date: new Date('2025-01-20T14:00:00Z'),
        duration: 60,
        type: 'Suivi',
        notes: 'Patient shows improvement',
        recommendations: 'Continue treatment',
        nextSteps: 'Follow-up in 2 weeks',
      };

      const consultation = await createConsultation(
        practitioner.id,
        consultationData
      );
      testConsultationIds.push(consultation.id);

      expect(consultation.date).toEqual(new Date('2025-01-20T14:00:00Z'));
      expect(consultation.duration).toBe(60);
      expect(consultation.type).toBe('Suivi');
      expect(consultation.notes).toBe('Patient shows improvement');
      expect(consultation.recommendations).toBe('Continue treatment');
      expect(consultation.nextSteps).toBe('Follow-up in 2 weeks');
    });

    it('should validate client exists', async () => {
      const consultationData = {
        clientId: 'non-existent-client',
        date: new Date(),
      };

      await expect(
        createConsultation(practitioner.id, consultationData)
      ).rejects.toThrow();
    });

    it('should validate date is required', async () => {
      const consultationData = {
        clientId: testClientId,
      } as any;

      await expect(
        createConsultation(practitioner.id, consultationData)
      ).rejects.toThrow();
    });

    it('should validate duration is positive', async () => {
      const consultationData = {
        clientId: testClientId,
        date: new Date(),
        duration: -10,
      };

      await expect(
        createConsultation(practitioner.id, consultationData)
      ).rejects.toThrow();
    });

    it('should allow null for optional fields', async () => {
      const consultationData = {
        clientId: testClientId,
        date: new Date(),
        duration: null,
        type: null,
        notes: null,
      };

      const consultation = await createConsultation(
        practitioner.id,
        consultationData
      );
      testConsultationIds.push(consultation.id);

      expect(consultation.duration).toBeNull();
      expect(consultation.type).toBeNull();
      expect(consultation.notes).toBeNull();
    });
  });

  describe('Get Consultation', () => {
    it('should retrieve a consultation by ID', async () => {
      const created = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date(),
        notes: 'Test notes',
      });
      testConsultationIds.push(created.id);

      const consultation = await getConsultation(created.id, practitioner.id);

      expect(consultation).toBeDefined();
      expect(consultation?.id).toBe(created.id);
      expect(consultation?.notes).toBe('Test notes');
    });

    it('should return null for non-existent consultation', async () => {
      const consultation = await getConsultation('non-existent', practitioner.id);

      expect(consultation).toBeNull();
    });

    it('should include client information', async () => {
      const created = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date(),
      });
      testConsultationIds.push(created.id);

      const consultation = await getConsultation(created.id, practitioner.id, {
        include: { client: true },
      });

      expect(consultation?.client).toBeDefined();
      expect(consultation?.client.id).toBe(testClientId);
    });

    it('should prevent access from other practitioners', async () => {
      const created = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date(),
      });
      testConsultationIds.push(created.id);

      const otherPractitionerId = 'user-practitioner-2';
      const consultation = await getConsultation(created.id, otherPractitionerId);

      expect(consultation).toBeNull();
    });
  });

  describe('List Consultations', () => {
    beforeEach(async () => {
      // Create multiple consultations
      const consultations = await Promise.all([
        createConsultation(practitioner.id, {
          clientId: testClientId,
          date: new Date('2025-01-10T10:00:00Z'),
          type: 'Initial',
        }),
        createConsultation(practitioner.id, {
          clientId: testClientId,
          date: new Date('2025-01-20T14:00:00Z'),
          type: 'Follow-up',
        }),
        createConsultation(practitioner.id, {
          clientId: testClientId,
          date: new Date('2025-01-30T09:00:00Z'),
          type: 'Check-up',
        }),
      ]);

      testConsultationIds.push(...consultations.map((c) => c.id));
    });

    it('should list all consultations for a client', async () => {
      const consultations = await listConsultations(testClientId, practitioner.id);

      expect(consultations.length).toBeGreaterThanOrEqual(3);
    });

    it('should order consultations by date descending', async () => {
      const consultations = await listConsultations(testClientId, practitioner.id);

      for (let i = 0; i < consultations.length - 1; i++) {
        expect(consultations[i].date.getTime()).toBeGreaterThanOrEqual(
          consultations[i + 1].date.getTime()
        );
      }
    });

    it('should return empty array for client with no consultations', async () => {
      const newClient = await createClient(practitioner.id, {
        firstName: 'No',
        lastName: 'Consultations',
      });

      const consultations = await listConsultations(newClient.id, practitioner.id);

      expect(consultations).toEqual([]);

      await prisma.client.delete({ where: { id: newClient.id } });
    });

    it('should prevent listing consultations from other practitioners', async () => {
      const otherPractitionerId = 'user-practitioner-2';
      const consultations = await listConsultations(
        testClientId,
        otherPractitionerId
      );

      expect(consultations).toEqual([]);
    });
  });

  describe('Update Consultation', () => {
    let consultationId: string;

    beforeEach(async () => {
      const consultation = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date('2025-01-15T10:00:00Z'),
        notes: 'Original notes',
        type: 'Initial',
      });
      consultationId = consultation.id;
      testConsultationIds.push(consultationId);
    });

    it('should update consultation notes', async () => {
      const updated = await updateConsultation(
        consultationId,
        practitioner.id,
        { notes: 'Updated notes' }
      );

      expect(updated?.notes).toBe('Updated notes');
    });

    it('should update multiple fields', async () => {
      const updated = await updateConsultation(consultationId, practitioner.id, {
        type: 'Follow-up',
        duration: 45,
        recommendations: 'Continue treatment',
      });

      expect(updated?.type).toBe('Follow-up');
      expect(updated?.duration).toBe(45);
      expect(updated?.recommendations).toBe('Continue treatment');
    });

    it('should update consultation date', async () => {
      const newDate = new Date('2025-02-01T14:00:00Z');
      const updated = await updateConsultation(consultationId, practitioner.id, {
        date: newDate,
      });

      expect(updated?.date).toEqual(newDate);
    });

    it('should return null for non-existent consultation', async () => {
      const updated = await updateConsultation('non-existent', practitioner.id, {
        notes: 'Test',
      });

      expect(updated).toBeNull();
    });

    it('should prevent updates from other practitioners', async () => {
      const otherPractitionerId = 'user-practitioner-2';
      const updated = await updateConsultation(
        consultationId,
        otherPractitionerId,
        { notes: 'Unauthorized' }
      );

      expect(updated).toBeNull();

      // Verify original unchanged
      const original = await getConsultation(consultationId, practitioner.id);
      expect(original?.notes).toBe('Original notes');
    });

    it('should update updatedAt timestamp', async () => {
      const original = await getConsultation(consultationId, practitioner.id);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await updateConsultation(consultationId, practitioner.id, {
        notes: 'Updated',
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        original?.updatedAt.getTime() || 0
      );
    });
  });

  describe('Delete Consultation', () => {
    it('should delete a consultation', async () => {
      const consultation = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date(),
      });
      testConsultationIds.push(consultation.id);

      const result = await deleteConsultation(consultation.id, practitioner.id);

      expect(result).toBe(true);

      const deleted = await getConsultation(consultation.id, practitioner.id);
      expect(deleted).toBeNull();

      testConsultationIds = testConsultationIds.filter(
        (id) => id !== consultation.id
      );
    });

    it('should return false for non-existent consultation', async () => {
      const result = await deleteConsultation('non-existent', practitioner.id);

      expect(result).toBe(false);
    });

    it('should prevent deletion from other practitioners', async () => {
      const consultation = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date(),
      });
      testConsultationIds.push(consultation.id);

      const otherPractitionerId = 'user-practitioner-2';
      const result = await deleteConsultation(
        consultation.id,
        otherPractitionerId
      );

      expect(result).toBe(false);

      const stillExists = await getConsultation(consultation.id, practitioner.id);
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Data Validation', () => {
    it('should accept valid duration values', async () => {
      const validDurations = [15, 30, 45, 60, 90, 120];

      for (const duration of validDurations) {
        const consultation = await createConsultation(practitioner.id, {
          clientId: testClientId,
          date: new Date(),
          duration,
        });
        testConsultationIds.push(consultation.id);

        expect(consultation.duration).toBe(duration);
      }
    });

    it('should handle long text fields', async () => {
      const longText = 'A'.repeat(5000);

      const consultation = await createConsultation(practitioner.id, {
        clientId: testClientId,
        date: new Date(),
        notes: longText,
        recommendations: longText,
        nextSteps: longText,
      });
      testConsultationIds.push(consultation.id);

      expect(consultation.notes?.length).toBe(5000);
      expect(consultation.recommendations?.length).toBe(5000);
      expect(consultation.nextSteps?.length).toBe(5000);
    });
  });
});
