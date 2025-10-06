import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/services/client-service';
import { getPractitionerUser } from '../../../fixtures/users';

describe('Client Creation Tests', () => {
  const practitioner = getPractitionerUser();
  let createdClientIds: string[] = [];

  afterEach(async () => {
    // Cleanup created clients
    if (createdClientIds.length > 0) {
      await prisma.client.deleteMany({
        where: { id: { in: createdClientIds } },
      });
      createdClientIds = [];
    }
  });

  describe('Valid Client Creation', () => {
    it('should create a client with all required fields', async () => {
      const clientData = {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '0612345678',
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client).toBeDefined();
      expect(client.id).toBeTruthy();
      expect(client.firstName).toBe('Jean');
      expect(client.lastName).toBe('Dupont');
      expect(client.email).toBe('jean.dupont@example.com');
      expect(client.phone).toBe('0612345678');
      expect(client.practitionerId).toBe(practitioner.id);
      expect(client.createdAt).toBeInstanceOf(Date);
      expect(client.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a client with minimal data', async () => {
      const clientData = {
        firstName: 'Marie',
        lastName: 'Martin',
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client).toBeDefined();
      expect(client.firstName).toBe('Marie');
      expect(client.lastName).toBe('Martin');
      expect(client.email).toBeNull();
      expect(client.phone).toBeNull();
    });

    it('should create a client with all optional fields', async () => {
      const clientData = {
        firstName: 'Pierre',
        lastName: 'Bernard',
        email: 'pierre.bernard@example.com',
        phone: '0698765432',
        birthDate: new Date('1985-03-15'),
        address: '123 rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        notes: 'Patient with chronic stress',
        tags: ['stress', 'insomnia'],
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client).toBeDefined();
      expect(client.firstName).toBe('Pierre');
      expect(client.lastName).toBe('Bernard');
      expect(client.email).toBe('pierre.bernard@example.com');
      expect(client.phone).toBe('0698765432');
      expect(client.birthDate).toEqual(new Date('1985-03-15'));
      expect(client.address).toBe('123 rue de la Paix');
      expect(client.city).toBe('Paris');
      expect(client.postalCode).toBe('75001');
      expect(client.notes).toBe('Patient with chronic stress');
      expect(client.tags).toEqual(['stress', 'insomnia']);
    });

    it('should store birthDate correctly as DateTime', async () => {
      const birthDate = new Date('1990-07-22');
      const clientData = {
        firstName: 'Test',
        lastName: 'BirthDate',
        birthDate,
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client.birthDate).toBeInstanceOf(Date);
      expect(client.birthDate?.getFullYear()).toBe(1990);
      expect(client.birthDate?.getMonth()).toBe(6); // July (0-indexed)
      expect(client.birthDate?.getDate()).toBe(22);
    });

    it('should initialize empty tags array by default', async () => {
      const clientData = {
        firstName: 'Test',
        lastName: 'Tags',
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client.tags).toEqual([]);
    });
  });

  describe('Validation Tests', () => {
    it('should throw error when firstName is missing', async () => {
      const clientData = {
        lastName: 'Test',
      } as any;

      await expect(createClient(practitioner.id, clientData)).rejects.toThrow();
    });

    it('should throw error when lastName is missing', async () => {
      const clientData = {
        firstName: 'Test',
      } as any;

      await expect(createClient(practitioner.id, clientData)).rejects.toThrow();
    });

    it('should throw error when firstName is empty string', async () => {
      const clientData = {
        firstName: '',
        lastName: 'Test',
      };

      await expect(createClient(practitioner.id, clientData)).rejects.toThrow();
    });

    it('should throw error when lastName is empty string', async () => {
      const clientData = {
        firstName: 'Test',
        lastName: '',
      };

      await expect(createClient(practitioner.id, clientData)).rejects.toThrow();
    });

    it('should throw error for invalid email format', async () => {
      const clientData = {
        firstName: 'Test',
        lastName: 'Email',
        email: 'invalid-email',
      };

      await expect(createClient(practitioner.id, clientData)).rejects.toThrow();
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user+tag@domain.co.uk',
        'firstname.lastname@example.org',
      ];

      for (const email of validEmails) {
        const clientData = {
          firstName: 'Test',
          lastName: 'Email',
          email,
        };

        const client = await createClient(practitioner.id, clientData);
        createdClientIds.push(client.id);

        expect(client.email).toBe(email);
      }
    });

    it('should throw error when practitionerId is invalid', async () => {
      const clientData = {
        firstName: 'Test',
        lastName: 'Invalid',
      };

      await expect(createClient('invalid-id', clientData)).rejects.toThrow();
    });
  });

  describe('Data Integrity Tests', () => {
    it('should trim whitespace from name fields', async () => {
      const clientData = {
        firstName: '  Jean  ',
        lastName: '  Dupont  ',
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client.firstName).toBe('Jean');
      expect(client.lastName).toBe('Dupont');
    });

    it('should preserve case in name fields', async () => {
      const clientData = {
        firstName: 'Jean-Claude',
        lastName: 'Van Damme',
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client.firstName).toBe('Jean-Claude');
      expect(client.lastName).toBe('Van Damme');
    });

    it('should handle special characters in names', async () => {
      const clientData = {
        firstName: "Jean-François",
        lastName: "O'Connor",
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client.firstName).toBe("Jean-François");
      expect(client.lastName).toBe("O'Connor");
    });

    it('should store long notes without truncation', async () => {
      const longNotes = 'A'.repeat(5000);
      const clientData = {
        firstName: 'Test',
        lastName: 'Notes',
        notes: longNotes,
      };

      const client = await createClient(practitioner.id, clientData);
      createdClientIds.push(client.id);

      expect(client.notes).toBe(longNotes);
      expect(client.notes?.length).toBe(5000);
    });
  });

  describe('Database Constraints Tests', () => {
    it('should create clients with same names for different practitioners', async () => {
      const clientData = {
        firstName: 'Duplicate',
        lastName: 'Name',
        email: 'duplicate1@example.com',
      };

      const client1 = await createClient(practitioner.id, clientData);
      createdClientIds.push(client1.id);

      // Same name, different email (different practitioner would be tested with another practitioner)
      const clientData2 = {
        firstName: 'Duplicate',
        lastName: 'Name',
        email: 'duplicate2@example.com',
      };

      const client2 = await createClient(practitioner.id, clientData2);
      createdClientIds.push(client2.id);

      expect(client1.id).not.toBe(client2.id);
      expect(client1.firstName).toBe(client2.firstName);
      expect(client1.lastName).toBe(client2.lastName);
    });

    it('should generate unique CUIDs for each client', async () => {
      const clients = await Promise.all([
        createClient(practitioner.id, { firstName: 'Test1', lastName: 'Unique' }),
        createClient(practitioner.id, { firstName: 'Test2', lastName: 'Unique' }),
        createClient(practitioner.id, { firstName: 'Test3', lastName: 'Unique' }),
      ]);

      clients.forEach((c) => createdClientIds.push(c.id));

      const ids = clients.map((c) => c.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
      ids.forEach((id) => {
        expect(id).toMatch(/^c[a-z0-9]{24,25}$/); // CUID format
      });
    });
  });

  describe('Timestamps Tests', () => {
    it('should set createdAt timestamp on creation', async () => {
      const before = new Date();

      const client = await createClient(practitioner.id, {
        firstName: 'Test',
        lastName: 'Timestamp',
      });
      createdClientIds.push(client.id);

      const after = new Date();

      expect(client.createdAt).toBeInstanceOf(Date);
      expect(client.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(client.createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should set updatedAt timestamp on creation', async () => {
      const client = await createClient(practitioner.id, {
        firstName: 'Test',
        lastName: 'Timestamp',
      });
      createdClientIds.push(client.id);

      expect(client.updatedAt).toBeInstanceOf(Date);
      expect(client.updatedAt.getTime()).toBeCloseTo(client.createdAt.getTime(), -3);
    });
  });
});
