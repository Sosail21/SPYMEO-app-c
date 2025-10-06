import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createClient, updateClient, getClient } from '@/lib/services/client-service';
import { getPractitionerUser } from '../../../fixtures/users';

describe('Client Update Tests', () => {
  const practitioner = getPractitionerUser();
  let testClientId: string;

  beforeEach(async () => {
    // Create a test client before each test
    const client = await createClient(practitioner.id, {
      firstName: 'Original',
      lastName: 'Name',
      email: 'original@example.com',
      phone: '0600000000',
      address: 'Original Address',
      city: 'Original City',
      postalCode: '00000',
      notes: 'Original notes',
      tags: ['tag1', 'tag2'],
    });
    testClientId = client.id;
  });

  afterEach(async () => {
    // Cleanup
    if (testClientId) {
      await prisma.client.deleteMany({
        where: { id: testClientId },
      });
    }
  });

  describe('Valid Updates', () => {
    it('should update firstName', async () => {
      const updated = await updateClient(
        testClientId,
        practitioner.id,
        { firstName: 'Updated' }
      );

      expect(updated).toBeDefined();
      expect(updated?.firstName).toBe('Updated');
      expect(updated?.lastName).toBe('Name'); // Unchanged
    });

    it('should update lastName', async () => {
      const updated = await updateClient(
        testClientId,
        practitioner.id,
        { lastName: 'NewLastName' }
      );

      expect(updated?.lastName).toBe('NewLastName');
      expect(updated?.firstName).toBe('Original'); // Unchanged
    });

    it('should update email', async () => {
      const updated = await updateClient(
        testClientId,
        practitioner.id,
        { email: 'updated@example.com' }
      );

      expect(updated?.email).toBe('updated@example.com');
    });

    it('should update phone', async () => {
      const updated = await updateClient(
        testClientId,
        practitioner.id,
        { phone: '0611111111' }
      );

      expect(updated?.phone).toBe('0611111111');
    });

    it('should update multiple fields at once', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: 'Multi',
        lastName: 'Update',
        email: 'multi@example.com',
        phone: '0622222222',
      });

      expect(updated?.firstName).toBe('Multi');
      expect(updated?.lastName).toBe('Update');
      expect(updated?.email).toBe('multi@example.com');
      expect(updated?.phone).toBe('0622222222');
    });

    it('should update address fields', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        address: 'New Address',
        city: 'New City',
        postalCode: '99999',
      });

      expect(updated?.address).toBe('New Address');
      expect(updated?.city).toBe('New City');
      expect(updated?.postalCode).toBe('99999');
    });

    it('should update notes', async () => {
      const longNotes = 'Updated notes with lots of information. '.repeat(50);
      const updated = await updateClient(testClientId, practitioner.id, {
        notes: longNotes,
      });

      expect(updated?.notes).toBe(longNotes);
    });

    it('should update tags', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        tags: ['newTag1', 'newTag2', 'newTag3'],
      });

      expect(updated?.tags).toEqual(['newTag1', 'newTag2', 'newTag3']);
    });

    it('should update birthDate', async () => {
      const newBirthDate = new Date('1995-05-15');
      const updated = await updateClient(testClientId, practitioner.id, {
        birthDate: newBirthDate,
      });

      expect(updated?.birthDate).toEqual(newBirthDate);
    });

    it('should allow setting fields to null', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        email: null,
        phone: null,
        address: null,
      });

      expect(updated?.email).toBeNull();
      expect(updated?.phone).toBeNull();
      expect(updated?.address).toBeNull();
    });

    it('should clear tags array', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        tags: [],
      });

      expect(updated?.tags).toEqual([]);
    });
  });

  describe('Validation Tests', () => {
    it('should reject empty firstName', async () => {
      await expect(
        updateClient(testClientId, practitioner.id, { firstName: '' })
      ).rejects.toThrow();
    });

    it('should reject empty lastName', async () => {
      await expect(
        updateClient(testClientId, practitioner.id, { lastName: '' })
      ).rejects.toThrow();
    });

    it('should reject invalid email format', async () => {
      await expect(
        updateClient(testClientId, practitioner.id, { email: 'invalid-email' })
      ).rejects.toThrow();
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'firstname.lastname@example.org',
      ];

      for (const email of validEmails) {
        const updated = await updateClient(testClientId, practitioner.id, { email });
        expect(updated?.email).toBe(email);
      }
    });

    it('should handle very long names', async () => {
      const longName = 'A'.repeat(100);
      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: longName,
      });

      expect(updated?.firstName).toBe(longName);
    });
  });

  describe('Immutable Fields', () => {
    it('should not allow updating client ID', async () => {
      const updated = await updateClient(
        testClientId,
        practitioner.id,
        { id: 'new-id' } as any
      );

      expect(updated?.id).toBe(testClientId); // ID unchanged
    });

    it('should not allow changing practitionerId', async () => {
      const updated = await updateClient(
        testClientId,
        practitioner.id,
        { practitionerId: 'other-practitioner' } as any
      );

      expect(updated?.practitionerId).toBe(practitioner.id); // Unchanged
    });

    it('should not modify createdAt timestamp', async () => {
      const original = await getClient(testClientId, practitioner.id);
      const originalCreatedAt = original?.createdAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: 'Updated',
      });

      expect(updated?.createdAt.getTime()).toBe(originalCreatedAt?.getTime());
    });
  });

  describe('Timestamp Tests', () => {
    it('should update updatedAt timestamp', async () => {
      const original = await getClient(testClientId, practitioner.id);
      const originalUpdatedAt = original?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: 'Updated',
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt?.getTime() || 0
      );
    });

    it('should update updatedAt even with no-op changes', async () => {
      const original = await getClient(testClientId, practitioner.id);
      const originalUpdatedAt = original?.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: 'Original', // Same value
      });

      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt?.getTime() || 0
      );
    });
  });

  describe('Non-existent Client', () => {
    it('should return null when updating non-existent client', async () => {
      const updated = await updateClient('non-existent-id', practitioner.id, {
        firstName: 'Test',
      });

      expect(updated).toBeNull();
    });

    it('should not throw error for non-existent client', async () => {
      await expect(
        updateClient('non-existent-id', practitioner.id, { firstName: 'Test' })
      ).resolves.not.toThrow();
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent updating other practitioner clients', async () => {
      const otherPractitionerId = 'user-practitioner-2';

      const updated = await updateClient(testClientId, otherPractitionerId, {
        firstName: 'Unauthorized',
      });

      expect(updated).toBeNull();

      // Verify original data unchanged
      const original = await getClient(testClientId, practitioner.id);
      expect(original?.firstName).toBe('Original');
    });

    it('should allow admin to update any client with bypass', async () => {
      const adminId = 'user-admin-1';

      const updated = await updateClient(
        testClientId,
        adminId,
        { firstName: 'AdminUpdated' },
        { bypassAuth: true }
      );

      expect(updated?.firstName).toBe('AdminUpdated');
    });
  });

  describe('Partial Updates', () => {
    it('should update only specified fields', async () => {
      const original = await getClient(testClientId, practitioner.id);

      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: 'PartialUpdate',
      });

      expect(updated?.firstName).toBe('PartialUpdate');
      expect(updated?.lastName).toBe(original?.lastName);
      expect(updated?.email).toBe(original?.email);
      expect(updated?.phone).toBe(original?.phone);
      expect(updated?.address).toBe(original?.address);
    });

    it('should handle empty update object', async () => {
      const original = await getClient(testClientId, practitioner.id);

      const updated = await updateClient(testClientId, practitioner.id, {});

      expect(updated?.firstName).toBe(original?.firstName);
      expect(updated?.lastName).toBe(original?.lastName);
    });
  });

  describe('Data Integrity', () => {
    it('should trim whitespace from name fields', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: '  Trimmed  ',
        lastName: '  Name  ',
      });

      expect(updated?.firstName).toBe('Trimmed');
      expect(updated?.lastName).toBe('Name');
    });

    it('should preserve special characters', async () => {
      const updated = await updateClient(testClientId, practitioner.id, {
        firstName: "Jean-François",
        lastName: "O'Connor",
      });

      expect(updated?.firstName).toBe("Jean-François");
      expect(updated?.lastName).toBe("O'Connor");
    });

    it('should handle concurrent updates safely', async () => {
      const updates = await Promise.all([
        updateClient(testClientId, practitioner.id, { firstName: 'Update1' }),
        updateClient(testClientId, practitioner.id, { lastName: 'Update2' }),
      ]);

      expect(updates[0]).toBeDefined();
      expect(updates[1]).toBeDefined();

      const final = await getClient(testClientId, practitioner.id);
      expect(final?.firstName).toBeDefined();
      expect(final?.lastName).toBeDefined();
    });
  });
});
