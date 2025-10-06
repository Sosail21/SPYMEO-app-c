import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/services/client-service';
import {
  createAntecedent,
  getAntecedent,
  listAntecedents,
  updateAntecedent,
  deleteAntecedent,
} from '@/lib/services/antecedent-service';
import { getPractitionerUser } from '../../../fixtures/users';

describe('Antecedent Tests', () => {
  const practitioner = getPractitionerUser();
  let testClientId: string;
  let testAntecedentIds: string[] = [];

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
    if (testAntecedentIds.length > 0) {
      await prisma.antecedent.deleteMany({
        where: { id: { in: testAntecedentIds } },
      });
      testAntecedentIds = [];
    }

    if (testClientId) {
      await prisma.client.delete({ where: { id: testClientId } });
    }
  });

  describe('Create Antecedent', () => {
    it('should create an antecedent with required fields', async () => {
      const antecedentData = {
        clientId: testClientId,
        category: 'medical',
        label: 'Hypertension',
      };

      const antecedent = await createAntecedent(antecedentData);
      testAntecedentIds.push(antecedent.id);

      expect(antecedent).toBeDefined();
      expect(antecedent.id).toBeTruthy();
      expect(antecedent.clientId).toBe(testClientId);
      expect(antecedent.category).toBe('medical');
      expect(antecedent.label).toBe('Hypertension');
    });

    it('should create an antecedent with all fields', async () => {
      const antecedentData = {
        clientId: testClientId,
        category: 'surgical',
        label: 'Appendectomy',
        details: 'Performed in 2010, no complications',
        date: new Date('2010-05-15'),
      };

      const antecedent = await createAntecedent(antecedentData);
      testAntecedentIds.push(antecedent.id);

      expect(antecedent.category).toBe('surgical');
      expect(antecedent.label).toBe('Appendectomy');
      expect(antecedent.details).toBe('Performed in 2010, no complications');
      expect(antecedent.date).toEqual(new Date('2010-05-15'));
    });

    it('should support various antecedent categories', async () => {
      const categories = [
        'medical',
        'surgical',
        'familial',
        'allergies',
        'medications',
      ];

      for (const category of categories) {
        const antecedent = await createAntecedent({
          clientId: testClientId,
          category,
          label: `Test ${category}`,
        });
        testAntecedentIds.push(antecedent.id);

        expect(antecedent.category).toBe(category);
      }
    });

    it('should validate client exists', async () => {
      const antecedentData = {
        clientId: 'non-existent-client',
        category: 'medical',
        label: 'Test',
      };

      await expect(createAntecedent(antecedentData)).rejects.toThrow();
    });

    it('should validate category is required', async () => {
      const antecedentData = {
        clientId: testClientId,
        label: 'Test',
      } as any;

      await expect(createAntecedent(antecedentData)).rejects.toThrow();
    });

    it('should validate label is required', async () => {
      const antecedentData = {
        clientId: testClientId,
        category: 'medical',
      } as any;

      await expect(createAntecedent(antecedentData)).rejects.toThrow();
    });

    it('should reject empty category', async () => {
      const antecedentData = {
        clientId: testClientId,
        category: '',
        label: 'Test',
      };

      await expect(createAntecedent(antecedentData)).rejects.toThrow();
    });

    it('should reject empty label', async () => {
      const antecedentData = {
        clientId: testClientId,
        category: 'medical',
        label: '',
      };

      await expect(createAntecedent(antecedentData)).rejects.toThrow();
    });
  });

  describe('Get Antecedent', () => {
    it('should retrieve an antecedent by ID', async () => {
      const created = await createAntecedent({
        clientId: testClientId,
        category: 'allergies',
        label: 'Peanuts',
        details: 'Severe allergy',
      });
      testAntecedentIds.push(created.id);

      const antecedent = await getAntecedent(created.id);

      expect(antecedent).toBeDefined();
      expect(antecedent?.id).toBe(created.id);
      expect(antecedent?.label).toBe('Peanuts');
      expect(antecedent?.details).toBe('Severe allergy');
    });

    it('should return null for non-existent antecedent', async () => {
      const antecedent = await getAntecedent('non-existent');

      expect(antecedent).toBeNull();
    });

    it('should include client information when requested', async () => {
      const created = await createAntecedent({
        clientId: testClientId,
        category: 'medical',
        label: 'Test',
      });
      testAntecedentIds.push(created.id);

      const antecedent = await getAntecedent(created.id, {
        include: { client: true },
      });

      expect(antecedent?.client).toBeDefined();
      expect(antecedent?.client.id).toBe(testClientId);
    });
  });

  describe('List Antecedents', () => {
    beforeEach(async () => {
      // Create multiple antecedents
      const antecedents = await Promise.all([
        createAntecedent({
          clientId: testClientId,
          category: 'medical',
          label: 'Hypertension',
          date: new Date('2020-01-15'),
        }),
        createAntecedent({
          clientId: testClientId,
          category: 'surgical',
          label: 'Appendectomy',
          date: new Date('2010-05-20'),
        }),
        createAntecedent({
          clientId: testClientId,
          category: 'allergies',
          label: 'Pollen',
        }),
      ]);

      testAntecedentIds.push(...antecedents.map((a) => a.id));
    });

    it('should list all antecedents for a client', async () => {
      const antecedents = await listAntecedents(testClientId);

      expect(antecedents.length).toBeGreaterThanOrEqual(3);
    });

    it('should return empty array for client with no antecedents', async () => {
      const newClient = await createClient(practitioner.id, {
        firstName: 'No',
        lastName: 'Antecedents',
      });

      const antecedents = await listAntecedents(newClient.id);

      expect(antecedents).toEqual([]);

      await prisma.client.delete({ where: { id: newClient.id } });
    });

    it('should filter by category', async () => {
      const medicalAntecedents = await listAntecedents(testClientId, {
        category: 'medical',
      });

      expect(medicalAntecedents.length).toBeGreaterThanOrEqual(1);
      medicalAntecedents.forEach((a) => {
        expect(a.category).toBe('medical');
      });
    });

    it('should order by date descending (most recent first)', async () => {
      const antecedents = await listAntecedents(testClientId);

      const withDates = antecedents.filter((a) => a.date);
      for (let i = 0; i < withDates.length - 1; i++) {
        if (withDates[i].date && withDates[i + 1].date) {
          expect(withDates[i].date!.getTime()).toBeGreaterThanOrEqual(
            withDates[i + 1].date!.getTime()
          );
        }
      }
    });
  });

  describe('Update Antecedent', () => {
    let antecedentId: string;

    beforeEach(async () => {
      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'medical',
        label: 'Original Label',
        details: 'Original details',
      });
      antecedentId = antecedent.id;
      testAntecedentIds.push(antecedentId);
    });

    it('should update antecedent label', async () => {
      const updated = await updateAntecedent(antecedentId, {
        label: 'Updated Label',
      });

      expect(updated?.label).toBe('Updated Label');
    });

    it('should update multiple fields', async () => {
      const updated = await updateAntecedent(antecedentId, {
        category: 'allergies',
        label: 'Lactose Intolerance',
        details: 'Diagnosed in 2022',
        date: new Date('2022-03-10'),
      });

      expect(updated?.category).toBe('allergies');
      expect(updated?.label).toBe('Lactose Intolerance');
      expect(updated?.details).toBe('Diagnosed in 2022');
      expect(updated?.date).toEqual(new Date('2022-03-10'));
    });

    it('should allow setting details to null', async () => {
      const updated = await updateAntecedent(antecedentId, {
        details: null,
      });

      expect(updated?.details).toBeNull();
    });

    it('should return null for non-existent antecedent', async () => {
      const updated = await updateAntecedent('non-existent', {
        label: 'Test',
      });

      expect(updated).toBeNull();
    });

    it('should reject empty label', async () => {
      await expect(
        updateAntecedent(antecedentId, { label: '' })
      ).rejects.toThrow();
    });

    it('should reject empty category', async () => {
      await expect(
        updateAntecedent(antecedentId, { category: '' })
      ).rejects.toThrow();
    });

    it('should update updatedAt timestamp', async () => {
      const original = await getAntecedent(antecedentId);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await updateAntecedent(antecedentId, {
        label: 'Updated',
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        original?.updatedAt.getTime() || 0
      );
    });
  });

  describe('Delete Antecedent', () => {
    it('should delete an antecedent', async () => {
      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'medical',
        label: 'To Delete',
      });
      testAntecedentIds.push(antecedent.id);

      const result = await deleteAntecedent(antecedent.id);

      expect(result).toBe(true);

      const deleted = await getAntecedent(antecedent.id);
      expect(deleted).toBeNull();

      testAntecedentIds = testAntecedentIds.filter((id) => id !== antecedent.id);
    });

    it('should return false for non-existent antecedent', async () => {
      const result = await deleteAntecedent('non-existent');

      expect(result).toBe(false);
    });

    it('should handle multiple deletions gracefully', async () => {
      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'medical',
        label: 'Test',
      });
      testAntecedentIds.push(antecedent.id);

      const result1 = await deleteAntecedent(antecedent.id);
      expect(result1).toBe(true);

      const result2 = await deleteAntecedent(antecedent.id);
      expect(result2).toBe(false);

      testAntecedentIds = testAntecedentIds.filter((id) => id !== antecedent.id);
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should handle long text in details field', async () => {
      const longText = 'A'.repeat(5000);

      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'medical',
        label: 'Test',
        details: longText,
      });
      testAntecedentIds.push(antecedent.id);

      expect(antecedent.details?.length).toBe(5000);
    });

    it('should handle special characters in labels', async () => {
      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'allergies',
        label: "Intolérance au lactose & œufs",
      });
      testAntecedentIds.push(antecedent.id);

      expect(antecedent.label).toBe("Intolérance au lactose & œufs");
    });

    it('should store dates accurately', async () => {
      const specificDate = new Date('1995-06-15T00:00:00.000Z');

      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'surgical',
        label: 'Surgery',
        date: specificDate,
      });
      testAntecedentIds.push(antecedent.id);

      expect(antecedent.date?.toISOString()).toBe(specificDate.toISOString());
    });
  });

  describe('Business Logic', () => {
    it('should allow multiple antecedents with same category', async () => {
      const antecedents = await Promise.all([
        createAntecedent({
          clientId: testClientId,
          category: 'allergies',
          label: 'Peanuts',
        }),
        createAntecedent({
          clientId: testClientId,
          category: 'allergies',
          label: 'Shellfish',
        }),
        createAntecedent({
          clientId: testClientId,
          category: 'allergies',
          label: 'Pollen',
        }),
      ]);

      testAntecedentIds.push(...antecedents.map((a) => a.id));

      expect(antecedents.length).toBe(3);
      antecedents.forEach((a) => {
        expect(a.category).toBe('allergies');
      });
    });

    it('should maintain timestamps correctly', async () => {
      const antecedent = await createAntecedent({
        clientId: testClientId,
        category: 'medical',
        label: 'Test',
      });
      testAntecedentIds.push(antecedent.id);

      expect(antecedent.createdAt).toBeInstanceOf(Date);
      expect(antecedent.updatedAt).toBeInstanceOf(Date);
      expect(antecedent.createdAt.getTime()).toBeLessThanOrEqual(
        antecedent.updatedAt.getTime()
      );
    });
  });
});
