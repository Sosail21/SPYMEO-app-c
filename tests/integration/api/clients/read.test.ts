import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import {
  createClient,
  getClient,
  listClients,
  searchClients,
  getClientStats,
} from '@/lib/services/client-service';
import { getPractitionerUser, getAdminUser } from '../../../fixtures/users';

describe('Client Read Operations Tests', () => {
  const practitioner = getPractitionerUser();
  const admin = getAdminUser();
  let testClientIds: string[] = [];

  beforeEach(async () => {
    // Create test clients
    const clients = await Promise.all([
      createClient(practitioner.id, {
        firstName: 'Sophie',
        lastName: 'Laurent',
        email: 'sophie.laurent@example.com',
        phone: '0601020304',
        city: 'Paris',
        tags: ['stress', 'insomnia'],
      }),
      createClient(practitioner.id, {
        firstName: 'Marc',
        lastName: 'Dupont',
        email: 'marc.dupont@example.com',
        phone: '0605060708',
        city: 'Lyon',
        tags: ['chronic-pain'],
      }),
      createClient(practitioner.id, {
        firstName: 'Julie',
        lastName: 'Bernard',
        email: 'julie.bernard@example.com',
        phone: '0609101112',
        city: 'Paris',
      }),
    ]);

    testClientIds = clients.map((c) => c.id);
  });

  afterEach(async () => {
    // Cleanup
    if (testClientIds.length > 0) {
      await prisma.client.deleteMany({
        where: { id: { in: testClientIds } },
      });
      testClientIds = [];
    }
  });

  describe('Get Single Client', () => {
    it('should retrieve a client by ID', async () => {
      const clientId = testClientIds[0];

      const client = await getClient(clientId, practitioner.id);

      expect(client).toBeDefined();
      expect(client?.id).toBe(clientId);
      expect(client?.firstName).toBe('Sophie');
      expect(client?.lastName).toBe('Laurent');
      expect(client?.practitionerId).toBe(practitioner.id);
    });

    it('should return null for non-existent client', async () => {
      const client = await getClient('non-existent-id', practitioner.id);

      expect(client).toBeNull();
    });

    it('should include all client fields', async () => {
      const clientId = testClientIds[0];

      const client = await getClient(clientId, practitioner.id);

      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('firstName');
      expect(client).toHaveProperty('lastName');
      expect(client).toHaveProperty('email');
      expect(client).toHaveProperty('phone');
      expect(client).toHaveProperty('birthDate');
      expect(client).toHaveProperty('address');
      expect(client).toHaveProperty('city');
      expect(client).toHaveProperty('postalCode');
      expect(client).toHaveProperty('notes');
      expect(client).toHaveProperty('tags');
      expect(client).toHaveProperty('practitionerId');
      expect(client).toHaveProperty('createdAt');
      expect(client).toHaveProperty('updatedAt');
    });

    it('should preserve data types correctly', async () => {
      const clientId = testClientIds[0];

      const client = await getClient(clientId, practitioner.id);

      expect(typeof client?.id).toBe('string');
      expect(typeof client?.firstName).toBe('string');
      expect(typeof client?.lastName).toBe('string');
      expect(Array.isArray(client?.tags)).toBe(true);
      expect(client?.createdAt).toBeInstanceOf(Date);
      expect(client?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('List All Clients', () => {
    it('should list all clients for a practitioner', async () => {
      const clients = await listClients(practitioner.id);

      expect(Array.isArray(clients)).toBe(true);
      expect(clients.length).toBeGreaterThanOrEqual(3);

      const clientIds = clients.map((c) => c.id);
      testClientIds.forEach((id) => {
        expect(clientIds).toContain(id);
      });
    });

    it('should return empty array when practitioner has no clients', async () => {
      const newPractitionerId = 'user-practitioner-new';

      const clients = await listClients(newPractitionerId);

      expect(Array.isArray(clients)).toBe(true);
      expect(clients.length).toBe(0);
    });

    it('should order clients by lastName then firstName', async () => {
      const clients = await listClients(practitioner.id);

      const ourClients = clients.filter((c) => testClientIds.includes(c.id));
      expect(ourClients[0].lastName).toBe('Bernard');
      expect(ourClients[1].lastName).toBe('Dupont');
      expect(ourClients[2].lastName).toBe('Laurent');
    });

    it('should include nested relations when requested', async () => {
      const clients = await listClients(practitioner.id, {
        include: {
          consultations: true,
          antecedents: true,
        },
      });

      const client = clients.find((c) => c.id === testClientIds[0]);
      expect(client).toHaveProperty('consultations');
      expect(client).toHaveProperty('antecedents');
    });
  });

  describe('Search Clients', () => {
    it('should search clients by first name', async () => {
      const results = await searchClients(practitioner.id, { q: 'Sophie' });

      expect(results.length).toBeGreaterThanOrEqual(1);
      const client = results.find((c) => c.id === testClientIds[0]);
      expect(client?.firstName).toBe('Sophie');
    });

    it('should search clients by last name', async () => {
      const results = await searchClients(practitioner.id, { q: 'Dupont' });

      expect(results.length).toBeGreaterThanOrEqual(1);
      const client = results.find((c) => c.id === testClientIds[1]);
      expect(client?.lastName).toBe('Dupont');
    });

    it('should search clients by email', async () => {
      const results = await searchClients(practitioner.id, { q: 'sophie.laurent' });

      expect(results.length).toBeGreaterThanOrEqual(1);
      const client = results.find((c) => c.id === testClientIds[0]);
      expect(client?.email).toContain('sophie.laurent');
    });

    it('should be case-insensitive', async () => {
      const results1 = await searchClients(practitioner.id, { q: 'SOPHIE' });
      const results2 = await searchClients(practitioner.id, { q: 'sophie' });
      const results3 = await searchClients(practitioner.id, { q: 'Sophie' });

      expect(results1.length).toBe(results2.length);
      expect(results2.length).toBe(results3.length);
    });

    it('should return empty array when no matches', async () => {
      const results = await searchClients(practitioner.id, {
        q: 'NonExistentName12345',
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should return all clients when query is empty', async () => {
      const results = await searchClients(practitioner.id, { q: '' });

      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle partial matches', async () => {
      const results = await searchClients(practitioner.id, { q: 'Soph' });

      expect(results.length).toBeGreaterThanOrEqual(1);
      const client = results.find((c) => c.firstName === 'Sophie');
      expect(client).toBeDefined();
    });

    it('should search across multiple fields', async () => {
      const results = await searchClients(practitioner.id, { q: 'Paris' });

      expect(results.length).toBeGreaterThanOrEqual(2);
      results.forEach((client) => {
        if (testClientIds.includes(client.id)) {
          expect(client.city).toBe('Paris');
        }
      });
    });
  });

  describe('Pagination', () => {
    it('should support pagination with page and limit', async () => {
      const page1 = await searchClients(practitioner.id, {
        q: '',
        page: 1,
        limit: 2,
      });

      const page2 = await searchClients(practitioner.id, {
        q: '',
        page: 2,
        limit: 2,
      });

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);

      const ids1 = page1.map((c) => c.id);
      const ids2 = page2.map((c) => c.id);
      ids1.forEach((id) => {
        expect(ids2).not.toContain(id);
      });
    });

    it('should return correct limit of results', async () => {
      const results = await searchClients(practitioner.id, {
        q: '',
        limit: 2,
      });

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should default to page 1 if not specified', async () => {
      const results1 = await searchClients(practitioner.id, { limit: 2 });
      const results2 = await searchClients(practitioner.id, {
        page: 1,
        limit: 2,
      });

      expect(results1.map((c) => c.id)).toEqual(results2.map((c) => c.id));
    });
  });

  describe('Authorization Tests', () => {
    it('should only return clients belonging to the practitioner', async () => {
      const clients = await listClients(practitioner.id);

      clients.forEach((client) => {
        expect(client.practitionerId).toBe(practitioner.id);
      });
    });

    it('should not return clients from other practitioners', async () => {
      const otherPractitionerId = 'user-practitioner-2';

      const client = await getClient(testClientIds[0], otherPractitionerId);

      expect(client).toBeNull();
    });

    it('should allow admin to access any client', async () => {
      const client = await getClient(testClientIds[0], admin.id, { bypassAuth: true });

      expect(client).toBeDefined();
      expect(client?.id).toBe(testClientIds[0]);
    });
  });

  describe('Client Stats', () => {
    it('should calculate basic client stats', async () => {
      const stats = await getClientStats(testClientIds[0], practitioner.id);

      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalConsultations');
      expect(stats).toHaveProperty('totalInvoices');
      expect(stats).toHaveProperty('totalRevenue');
      expect(typeof stats.totalConsultations).toBe('number');
      expect(typeof stats.totalInvoices).toBe('number');
      expect(typeof stats.totalRevenue).toBe('number');
    });

    it('should return zero stats for new client', async () => {
      const newClient = await createClient(practitioner.id, {
        firstName: 'New',
        lastName: 'Client',
      });
      testClientIds.push(newClient.id);

      const stats = await getClientStats(newClient.id, practitioner.id);

      expect(stats.totalConsultations).toBe(0);
      expect(stats.totalInvoices).toBe(0);
      expect(stats.totalRevenue).toBe(0);
    });

    it('should return null stats for non-existent client', async () => {
      const stats = await getClientStats('non-existent-id', practitioner.id);

      expect(stats).toBeNull();
    });
  });

  describe('Performance Tests', () => {
    it('should retrieve client quickly', async () => {
      const start = Date.now();

      await getClient(testClientIds[0], practitioner.id);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should be under 1 second
    });

    it('should handle bulk reads efficiently', async () => {
      const start = Date.now();

      await listClients(practitioner.id);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should be under 2 seconds
    });
  });
});
